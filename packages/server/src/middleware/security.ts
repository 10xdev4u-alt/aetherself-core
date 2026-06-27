import type { Context, Next } from "hono";
export async function securityHeaders(c: Context, next: Next) {
  await next();
  c.header("x-frame-options", "DENY");
  c.header("x-content-type-options", "nosniff");
  c.header("referrer-policy", "strict-origin-when-cross-origin");
}
