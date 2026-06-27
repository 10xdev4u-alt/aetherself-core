import type { Context, Next } from "hono";
import crypto from "node:crypto";
export async function etag(c: Context, next: Next) {
  await next();
  const body = await c.res.clone().text();
  const hash = crypto.createHash("md5").update(body).digest("hex").slice(0, 16);
  c.header("etag", `"${hash}"`);
}
