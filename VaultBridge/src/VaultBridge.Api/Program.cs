using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using VaultBridge.Api.Middleware;
using VaultBridge.Application.Interfaces;
using VaultBridge.Infrastructure;
using VaultBridge.Infrastructure.Data;
using VaultBridge.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ----- Request size limit (1 MB max body) -----
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 1_048_576;
});

// ----- Authentication -----
var authBypass = builder.Configuration.GetValue<bool>("VaultBridge:AuthBypass");
var forceRealAuth = builder.Configuration.GetValue<bool>("VaultBridge:ForceRealAuth");
if (!forceRealAuth && (builder.Environment.IsDevelopment() || authBypass))
{
    // Dev bypass — auto-authenticates as seeded admin user
    builder.Services.AddAuthentication(DevAuthHandler.SchemeName)
        .AddScheme<AuthenticationSchemeOptions, DevAuthHandler>(DevAuthHandler.SchemeName, null);
}
else
{
    var jwtSigningKey = builder.Configuration["Jwt:SigningKey"]
        ?? throw new InvalidOperationException("Jwt:SigningKey is not configured.");

    if (jwtSigningKey.Length < 32)
        throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters.");

    builder.Services.AddAuthentication("LocalJwt")
        .AddJwtBearer("LocalJwt", options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"],
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };
        })
        .AddMicrosoftIdentityWebApi(builder.Configuration, "AzureAd", "Entra");

    builder.Services.AddAuthorization(options =>
    {
        var defaultPolicy = new AuthorizationPolicyBuilder("LocalJwt", "Entra")
            .RequireAuthenticatedUser()
            .Build();
        options.DefaultPolicy = defaultPolicy;
        options.FallbackPolicy = defaultPolicy;
    });
}

// ----- Rate limiting -----
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
            }));
    options.AddPolicy("sensitive", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ----- Controllers -----
builder.Services.AddControllers(options =>
    options.Filters.Add<VaultBridge.Api.Filters.TrimStringsFilter>());

// ----- CORS -----
var allowedOrigins = builder.Configuration.GetSection("VaultBridge:AllowedOrigins").Get<string[]>();
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                .WithHeaders("Authorization", "Content-Type")
                .WithMethods("GET", "POST", "PUT", "DELETE")));
}
else if (allowedOrigins is { Length: > 0 })
{
    builder.Services.AddCors(options =>
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins(allowedOrigins)
                .WithHeaders("Authorization", "Content-Type")
                .WithMethods("GET", "POST", "PUT", "DELETE")));
}

// ----- Forwarded headers (Azure Container Apps terminates TLS) -----
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// ----- Infrastructure (EF Core, AuditLogger) -----
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);

// ----- Tenant context (scoped, populated by middleware) -----
builder.Services.AddScoped<TenantContext>();
builder.Services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());

// ----- Encryption service (stub for dev, swap for Azure Key Vault in prod) -----
builder.Services.AddScoped<IEncryptionService, StubEncryptionService>();

var app = builder.Build();

// ----- Production safety guard: refuse to run with stub encryption -----
if (!app.Environment.IsDevelopment())
{
    using var guardScope = app.Services.CreateScope();
    var encService = guardScope.ServiceProvider.GetRequiredService<IEncryptionService>();
    if (encService is StubEncryptionService)
    {
        var guardLogger = guardScope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        guardLogger.LogCritical(
            "StubEncryptionService is registered in a non-development environment. " +
            "This uses a static dev key and MUST be replaced with Azure Key Vault. " +
            "Set environment to Development or register a production IEncryptionService.");
    }
}

// ----- Database initialization -----
if (app.Environment.IsDevelopment())
{
    await DevDataSeeder.SeedAsync(app.Services);
}
else
{
    // Auto-apply migrations and seed minimal data on startup
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<VaultBridgeDbContext>();
    await db.Database.MigrateAsync();

    // Seed a minimal org + admin user if the database is empty
    if (!await db.Organizations.AnyAsync())
    {
        await DevDataSeeder.SeedAsync(app.Services);
    }
}

// Ensure a local admin exists (for first-time login)
await EnsureLocalAdminAsync(app.Services, app.Configuration, app.Environment);

// ----- Security headers -----
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["X-XSS-Protection"] = "0";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

    if (!context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
    {
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';";
    }

    await next();
});

// ----- Middleware pipeline -----
if (app.Environment.IsDevelopment())
{
    app.UseCors();
    app.UseHttpsRedirection();
}
else
{
    app.UseForwardedHeaders();
    if (allowedOrigins is { Length: > 0 })
    {
        app.UseCors();
    }
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<TenantResolutionMiddleware>();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" })).AllowAnonymous();

// SPA fallback — non-API routes return index.html for client-side routing
if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("index.html").AllowAnonymous();
}

app.Run();

public partial class Program
{
    static async Task EnsureLocalAdminAsync(IServiceProvider services, IConfiguration config, IWebHostEnvironment env)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<VaultBridgeDbContext>();

        // Skip if a local auth user already exists
        if (await db.Users.AnyAsync(u => u.AuthMethod == VaultBridge.Domain.Enums.AuthMethod.Local && u.PasswordHash != null))
            return;

        // Find the first organization
        var org = await db.Organizations.FirstOrDefaultAsync();
        if (org == null) return;

        // Use configured password, or generate a random one
        var adminPassword = config["VaultBridge:InitialAdminPassword"];
        if (string.IsNullOrEmpty(adminPassword))
        {
            adminPassword = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))
                .Replace("+", "!").Replace("/", "@")[..20] + "Aa1!";
        }

        var adminUser = new VaultBridge.Domain.Entities.User
        {
            OrganizationId = org.Id,
            AuthMethod = VaultBridge.Domain.Enums.AuthMethod.Local,
            Email = "admin@vaultbridge.app",
            DisplayName = "VaultBridge Admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            MustChangePassword = true,
        };
        db.Users.Add(adminUser);
        await db.SaveChangesAsync();

        // Add to all existing tenants as Admin
        var tenantIds = await db.Tenants
            .Where(t => t.OrganizationId == org.Id && t.IsActive)
            .Select(t => t.Id)
            .ToListAsync();

        foreach (var tenantId in tenantIds)
        {
            db.TenantUsers.Add(new VaultBridge.Domain.Entities.TenantUser
            {
                TenantId = tenantId,
                UserId = adminUser.Id,
                Role = VaultBridge.Domain.Enums.TenantRole.Admin,
            });
        }
        await db.SaveChangesAsync();

        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        if (env.IsDevelopment())
        {
            logger.LogWarning("Created default local admin: admin@vaultbridge.app / {Password} — change this password immediately.", adminPassword);
        }
        else
        {
            logger.LogWarning(
                "Created default local admin: admin@vaultbridge.app — " +
                "password was set from VaultBridge:InitialAdminPassword config. " +
                "Change this password immediately.");
        }
    }
}
