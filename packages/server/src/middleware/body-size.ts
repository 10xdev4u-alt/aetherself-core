import type { Context, Next } from "hono";
const MAX_BODY = 1024 * 1024; // 1MB
export async function bodySizeLimit(c: Context, next: Next) {
  const len = Number(c.req.header("content-length") ?? 0);
  if (len > MAX_BODY) return c.json({ error: "Body too large" }, 413);
  await next();
}
