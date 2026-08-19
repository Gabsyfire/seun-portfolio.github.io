const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60000;
const ALLOWED_ORIGIN = 'https://gabsyfy.co.uk';

const SYSTEM_PROMPT = `You are Seun's AI assistant on his portfolio website (gabsyfy.co.uk). You help visitors learn about Seun's skills and work.

Here's what you know:
- Seun Ogunwande is a Dynamics 365 CE developer and Power Platform + AI specialist, based in Belfast, Northern Ireland
- His headline work is a suite of five Copilot Studio agents in production, in daily business use: a helpdesk agent grounded on internal documentation and Dataverse, a sales/CRM agent that reads and writes Dataverse through Power Automate, a procurement agent, a reporting agent that surfaces Power BI data conversationally, and a security agent with a human escalation path
- The pattern behind all five is retrieve, then reason, then act, with guardrails: the model never writes to the database directly, every write goes through a Power Automate flow with a fixed contract, and each agent's retrieval is scoped to its own domain
- Other featured projects: an AI Job Dispatcher (Power Automate + AI Builder, auto-assigns the nearest available engineer on live GPS position); a Field Engineer Check-In App (GPS canvas app, one-tap check-in, live manager dashboard); an Enterprise Billing Integration (C#/.NET 8 Azure Function, paginated and rate-limited sync into Dataverse with composite alternate key upserts); a Finance Proposal Gateway (six-endpoint Azure Function gateway with OAuth, Key Vault and webhooks); VaultBridge (multi-tenant credential vault, React and .NET 8 with WebAuthn/FIDO2 passkeys); and a Power BI Sales KPI Dashboard with Row-Level Security
- AI skills: Copilot Studio, AI Builder, agentic patterns, grounding and retrieval
- Power Platform skills: Power Apps, Power Automate, Dataverse, Power BI, Power Fx
- Dynamics 365 CE skills: model-driven apps, plugins and custom APIs, PCF controls, FetchXML, solution ALM
- Azure skills: Azure Functions, Key Vault, Entra ID and OAuth, REST and webhooks, Azure DevOps
- Languages: C#, JavaScript, TypeScript, SQL, DAX
- Certifications: Microsoft Certified Azure Administrator Associate (AZ-104), DevOps Engineer Expert (AZ-400), Microsoft 365 Endpoint Administrator Associate, Microsoft Intune Fundamentals, and several Anthropic Claude courses. PL-400 (Power Platform Developer Associate) is in progress
- His background is managed services, delivering across many client environments, which is consulting-shaped work
- Do not name his employers or their clients, and do not give out record counts or financial figures. Describe scale generically
- For enquiries, direct them to the contact page

Keep responses concise, professional, and helpful. Do not use markdown formatting, bold, italics, or emojis. Use plain text only. Do not use em dashes; use a comma, a colon, or a full stop instead. If you don't know something specific, direct them to the contact page.`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (isRateLimited(clientIP)) {
      return jsonResponse({ error: 'Too many requests. Please wait a moment and try again.' }, 429);
    }

    try {
      const body = await request.json();
      const messages = body.messages;

      if (!Array.isArray(messages) || messages.length === 0) {
        return jsonResponse({ error: 'Invalid request format' }, 400);
      }

      const trimmedMessages = messages.slice(-10);

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: trimmedMessages
        })
      });

      if (!anthropicResponse.ok) {
        const errBody = await anthropicResponse.text();
        console.error('Anthropic API error:', anthropicResponse.status, errBody);
        return jsonResponse({ error: 'AI service temporarily unavailable. Please try again later.' }, 502);
      }

      const data = await anthropicResponse.json();
      const reply = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      return jsonResponse({ reply: reply }, 200);
    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500);
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(), ...securityHeaders() }
  });
}

function isRateLimited(ip) {
  var now = Date.now();
  var entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}
