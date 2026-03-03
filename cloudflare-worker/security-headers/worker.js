export default {
  async fetch(request) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);

    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    newResponse.headers.set('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' https://images.unsplash.com https://plus.unsplash.com data:; " +
      "connect-src 'self' https://formspree.io https://seun-portfolio-chatbot.gabsyfy.workers.dev https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com; " +
      "font-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self' https://formspree.io;"
    );

    return newResponse;
  }
};
