# Chatbot Cloudflare Worker

Secure proxy between the portfolio site and the Anthropic Claude API.

## Prerequisites

- A Cloudflare account (free plan works)
- An Anthropic API key from https://console.anthropic.com
- Node.js installed locally

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate

```bash
wrangler login
```

### 3. Create the Worker project

```bash
wrangler init seun-chatbot-worker
```

Select "Hello World" Worker (ES Module) when prompted.
Replace the generated `src/index.js` with the contents of `worker.js` from this directory.

### 4. Set the API Key Secret

```bash
wrangler secret put ANTHROPIC_API_KEY
```

Paste your Anthropic API key when prompted. This is stored securely by Cloudflare and never appears in code.

### 5. Deploy

```bash
wrangler deploy
```

The output will show your worker URL, e.g.:
`https://seun-chatbot-worker.your-subdomain.workers.dev`

### 6. Update chatbot.js

Open `js/chatbot.js` in the main site repo and replace the placeholder:

```javascript
var WORKER_URL = 'https://seun-chatbot-worker.your-subdomain.workers.dev';
```

### 7. Push and verify

Push the updated `chatbot.js` to GitHub, then visit gabsyfy.co.uk and test the chat widget.

## Local Development

```bash
wrangler dev
```

Create a `.dev.vars` file in the worker project directory:

```
ANTHROPIC_API_KEY=sk-ant-...
```

**Do NOT commit `.dev.vars` to version control.**

To test locally, temporarily change `ALLOWED_ORIGIN` in `worker.js` to `'*'` or add your local URL. Remember to change it back before deploying.

## Rate Limiting

The worker enforces 10 requests per minute per IP address using an in-memory store. For production-grade rate limiting, consider Cloudflare Rate Limiting rules.

## CORS

The worker only accepts requests from `https://gabsyfy.co.uk`. Requests from other origins will be blocked.
