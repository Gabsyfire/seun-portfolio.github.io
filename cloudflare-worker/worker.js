const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60000;
const ALLOWED_ORIGIN = 'https://gabsyfy.co.uk';

const SYSTEM_PROMPT = `You are Seun's AI assistant on his portfolio website (gabsyfy.co.uk). You help visitors learn about Seun's skills and services.

Here's what you know:
- Seun Gabriel Ogunwande is an IT Manager specialising in Microsoft Power Platform, Dynamics 365 CRM, and business process automation
- Services: Power Apps development, Power Automate workflows, Dynamics 365 customisation, CRM data integration, system integration, Azure cloud services, SharePoint administration
- Technical skills: Power Apps, Power Automate, Dynamics 365, Azure, Power FX, FetchXML, SharePoint, JavaScript, PowerShell, C# plugins
- Notable projects: CRM Data Integration System, Automated Document Management, Engineer Appointment Validation System, Billing API Data Sync Workflow
- He helps businesses automate processes, integrate systems, and build custom solutions
- For enquiries, direct them to the contact page

Keep responses concise, professional, and helpful. If you don't know something specific, direct them to the contact page.`;

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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: trimmedMessages
        })
      });

      if (!anthropicResponse.ok) {
        console.error('Anthropic API error:', anthropicResponse.status);
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

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
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
