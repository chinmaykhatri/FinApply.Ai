/* ═══════════════════════════════════════════════
   Security Utilities — FinApply.ai
   Centralized security helpers for all API routes
   ═══════════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/* ── IP Extraction ── */
export function getClientIP(request: NextRequest): string {
  // x-forwarded-for is set by Vercel/CloudFlare; use first IP (client)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/* ── Rate Limit Presets ── */
export type RateLimitPreset = 'login' | 'register' | 'api' | 'ai' | 'webhook' | 'scrape';

const RATE_LIMITS: Record<RateLimitPreset, { limit: number; windowMs: number }> = {
  login:    { limit: 5,  windowMs: 15 * 60_000 },   // 5 attempts per 15 min
  register: { limit: 3,  windowMs: 60_000 },         // 3 per minute
  api:      { limit: 30, windowMs: 60_000 },          // 30 per minute
  ai:       { limit: 5,  windowMs: 5 * 60_000 },     // 5 AI calls per 5 min
  webhook:  { limit: 20, windowMs: 60_000 },          // 20 per minute
  scrape:   { limit: 10, windowMs: 60_000 },          // 10 per minute
};

/**
 * Apply rate limiting to a request.
 * Returns null if allowed, or a 429 NextResponse if blocked.
 */
export function applyRateLimit(
  request: NextRequest,
  preset: RateLimitPreset,
  keySuffix?: string
): NextResponse | null {
  const ip = getClientIP(request);
  const { limit, windowMs } = RATE_LIMITS[preset];
  const key = keySuffix ? `${preset}:${ip}:${keySuffix}` : `${preset}:${ip}`;

  const { ok } = rateLimit(key, limit, windowMs);
  if (!ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(windowMs / 1000)),
          'X-RateLimit-Limit': String(limit),
        },
      }
    );
  }
  return null;
}

/* ── Input Sanitization ── */
/**
 * Strip HTML tags and limit string length to prevent XSS and overflow.
 */
export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')      // Strip HTML tags
    .replace(/[<>'"]/g, '')       // Remove dangerous chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate email format.
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format (for LinkedIn etc.)
 */
export function isValidURL(url: unknown): url is string {
  if (typeof url !== 'string' || !url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/* ── HMAC Verification for Webhooks ── */
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify HMAC signature for webhook payloads.
 */
export function verifyHMAC(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  try {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/* ── Internal API Auth ── */
/**
 * Verify internal server-to-server calls using a shared secret.
 * The secret is ADMIN_API_SECRET env var or falls back to SUPABASE_SERVICE_ROLE_KEY.
 */
export function verifyInternalAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-internal-secret');
  const secret = process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || !secret) return false;

  try {
    const headerBuf = Buffer.from(authHeader);
    const secretBuf = Buffer.from(secret);
    if (headerBuf.length !== secretBuf.length) return false;
    return timingSafeEqual(headerBuf, secretBuf);
  } catch {
    return false;
  }
}

/* ── Request Body Size Guard ── */
/**
 * Check if request body exceeds the max size. Call before parsing.
 */
export function checkBodySize(
  contentLength: string | null,
  maxBytes: number = 50_000 // 50KB default
): NextResponse | null {
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }
  return null;
}

/* ── Audit Logger ── */
export type AuditEvent =
  | 'auth.login_attempt'
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.rate_limited'
  | 'api.rate_limited'
  | 'api.error'
  | 'api.suspicious'
  | 'admin.action'
  | 'webhook.received'
  | 'webhook.invalid'
  | 'employer.application_received'
  | 'employer.application_insert_error';

export function auditLog(
  event: AuditEvent,
  details: Record<string, unknown>,
  request?: NextRequest
) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ip: request ? getClientIP(request) : 'server',
    userAgent: request?.headers.get('user-agent')?.slice(0, 200) || 'unknown',
    path: request?.nextUrl.pathname || 'internal',
    ...details,
  };

  // Structured JSON logging — picked up by Vercel Logs, Datadog, etc.
  console.log(JSON.stringify(entry));
}
