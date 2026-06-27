/**
 * AetherSelf — Rate limiting middleware.
 */
import type { Context, Next } from "hono";

const requests = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 100;

export function rateLimiter(c: Context, next: Next) {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  return next();
}
