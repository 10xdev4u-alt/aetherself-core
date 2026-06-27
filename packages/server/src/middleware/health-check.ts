import type { Context, Next } from "hono";
export async function healthCheck(c: Context, next: Next) {
  if (c.req.path === "/health" || c.req.path === "/ready") {
    return c.json({ status: "ok", timestamp: Date.now() });
  }
  await next();
}
