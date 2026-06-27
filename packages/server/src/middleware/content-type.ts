import type { Context, Next } from "hono";
export async function jsonContentType(c: Context, next: Next) {
  await next();
  if (c.res.headers.get("content-type")?.includes("application/json")) return;
  c.header("content-type", "application/json; charset=utf-8");
}
