import type { Context, Next } from "hono";
export async function compress(c: Context, next: Next) {
  await next();
  const accept = c.req.header("accept-encoding") ?? "";
  if (!accept.includes("gzip")) return;
  const body = await c.res.text();
  if (body.length < 1024) return;
  // ponytail: skip actual compression, just add header hint
  c.header("x-compressible", "true");
}
