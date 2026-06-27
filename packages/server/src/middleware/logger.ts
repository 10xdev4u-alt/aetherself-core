/**
 * AetherSelf — Request logging middleware.
 */
import type { Context, Next } from "hono";

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const method = c.req.method;
  const path = c.req.path;
  const status = c.res.status;
  console.log(`${method} ${path} ${status} ${ms}ms`);
}
