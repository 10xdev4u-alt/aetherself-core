import type { Context, Next } from "hono";
export async function extractAuthHeader(c: Context, next: Next) {
  const auth = c.req.header("authorization");
  if (auth?.startsWith("Bearer ")) c.set("token", auth.slice(7));
  await next();
}
