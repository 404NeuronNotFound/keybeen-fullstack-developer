import type { IncomingMessage, ServerResponse } from 'node:http';

type ApiRequest = IncomingMessage & { body?: unknown };
type Verdict = { status: 'valid' | 'invalid' | 'typo' | 'unknown'; suggestion?: string };

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map<string, number>();
const cache = new Map<string, { verdict: Verdict; expires: number }>();

function flag(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'object' && value !== null && 'value' in value && typeof value.value === 'boolean') return value.value;
  return undefined;
}

function classify(data: Record<string, unknown>, email: string): Verdict {
  const suggestion = typeof data.suggested_correction === 'string' ? data.suggested_correction.trim() : '';
  if (suggestion && suggestion.toLowerCase() !== email.toLowerCase() && suggestion.length <= 254 && emailFormat.test(suggestion)) {
    return { status: 'typo', suggestion };
  }
  const details = typeof data.email_deliverability === 'object' && data.email_deliverability !== null
    ? data.email_deliverability as Record<string, unknown> : {};
  const format = flag(details.is_format_valid);
  const mx = flag(details.is_mx_valid);
  const smtp = flag(details.is_smtp_valid);
  if (format === false || mx === false || details.status === 'undeliverable') return { status: 'invalid' };
  if (details.status === 'deliverable' && format === true && mx === true && smtp === true) return { status: 'valid' };
  return { status: 'unknown' };
}

export async function handleEmailValidation(req: ApiRequest, res: ServerResponse, apiKey: string | undefined) {
  const respond = (code: number, body: unknown) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
  };

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respond(405, { error: 'Use POST.' });
    return;
  }
  // Browser requests must originate from this site.
  if (req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host) {
        respond(403, { error: 'Request not allowed.' });
        return;
      }
    } catch {
      respond(403, { error: 'Request not allowed.' });
      return;
    }
  }
  if (!req.headers['content-type']?.startsWith('application/json')) {
    respond(415, { error: 'Use JSON.' });
    return;
  }

  let body: unknown;
  try {
    body = req.body;
    if (body === undefined) {
      let text = '';
      for await (const chunk of req) {
        text += chunk.toString();
        if (Buffer.byteLength(text) > 2048) {
          respond(413, { error: 'Request too large.' });
          return;
        }
      }
      body = JSON.parse(text);
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    }
  } catch {
    respond(400, { error: 'Invalid request.' });
    return;
  }
  const email = typeof body === 'object' && body !== null && 'email' in body && typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || email.length > 254 || !emailFormat.test(email)) {
    respond(200, { email, status: 'invalid' });
    return;
  }
  if (!apiKey?.trim()) {
    respond(503, { error: 'Email checking is temporarily unavailable.' });
    return;
  }
  const clientIp = req.headers['x-vercel-forwarded-for'] ?? req.socket?.remoteAddress ?? 'local';
  const client = Array.isArray(clientIp) ? clientIp[0] : clientIp;
  const now = Date.now();
  if ((attempts.get(client) ?? 0) > now) {
    res.setHeader('Retry-After', String(Math.ceil((attempts.get(client)! - now) / 1000)));
    respond(429, { error: 'Please wait before checking another email.' });
    return;
  }
  for (const [key, expires] of attempts) if (expires <= now) attempts.delete(key);
  if (attempts.size >= 1024) {
    respond(429, { error: 'Email checking is busy. Please try later.' });
    return;
  }
  attempts.set(client, now + 600_000);
  const cached = cache.get(email.toLowerCase());
  if (cached && cached.expires > Date.now()) {
    respond(200, { email, ...cached.verdict });
    return;
  }

  try {
    const url = new URL('https://emailreputation.abstractapi.com/v1/');
    url.searchParams.set('api_key', apiKey.trim());
    url.searchParams.set('email', email);
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) {
      respond(response.status === 429 ? 429 : 502, { error: 'Email checking is temporarily unavailable.' });
      return;
    }
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('email_address' in data) || typeof data.email_address !== 'string' || data.email_address.toLowerCase() !== email.toLowerCase()) {
      respond(502, { error: 'Email checking could not be completed.' });
      return;
    }
    const verdict = classify(data as Record<string, unknown>, email);
    if (verdict.status !== 'unknown') {
      if (cache.size >= 256) cache.delete(cache.keys().next().value!);
      cache.set(email.toLowerCase(), { verdict, expires: Date.now() + 10 * 60_000 });
    }
    respond(200, { email, ...verdict });
  } catch {
    // Never expose upstream errors: the provider URL contains the private key.
    respond(502, { error: 'Email checking is temporarily unavailable.' });
  }
}

export default function handler(req: ApiRequest, res: ServerResponse) {
  return handleEmailValidation(req, res, process.env.ABSTRACT_EMAIL_VALIDATION_API_KEY);
}
