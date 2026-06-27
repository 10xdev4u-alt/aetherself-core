import type { Context, Next } from "hono";
export async function requireJson(c: Context, next: Next) {
  const accept = c.req.header("accept") ?? "";
  if (accept && !accept.includes("*/*") && !accept.includes("application/json")) {
    return c.json({ error: "Only JSON responses supported" }, 406);
  }
  await next();
}
