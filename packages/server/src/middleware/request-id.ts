import type { Context, Next } from "hono";
import crypto from "node:crypto";
export async function requestId(c: Context, next: Next) {
  const id = c.req.header("x-request-id") ?? crypto.randomUUID();
  c.header("x-request-id", id);
  await next();
}
