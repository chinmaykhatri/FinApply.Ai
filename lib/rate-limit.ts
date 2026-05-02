/* ═══════════════════════════════════════════════
   In-memory rate limiter — FinApply.ai
   IP-based sliding window for API protection
   ═══════════════════════════════════════════════ */

const rateMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a request from `key` (typically IP) is within the rate limit.
 * @param key   - Unique identifier (IP address, user ID, etc.)
 * @param limit - Max requests allowed in the window (default: 5)
 * @param windowMs - Window duration in milliseconds (default: 60s)
 */
export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60_000
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  // Clean up old entries periodically (every 100 checks)
  if (rateMap.size > 10_000) {
    for (const [k, v] of rateMap) {
      if (now > v.resetAt) rateMap.delete(k);
    }
  }

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}
