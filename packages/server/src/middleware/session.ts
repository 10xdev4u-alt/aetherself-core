import type { Context, Next } from "hono";
export async function sessionMiddleware(c: Context, next: Next) {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  if (token) c.set("sessionToken", token);
  await next();
}
