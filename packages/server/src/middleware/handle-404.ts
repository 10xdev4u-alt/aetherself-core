import type { Context } from "hono";
export function handle404(c: Context) {
  return c.json({ error: { status: 404, message: `Route ${c.req.method} ${c.req.path} not found` } }, 404);
}
