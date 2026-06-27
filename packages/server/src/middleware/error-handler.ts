import type { Context } from "hono";
export function formatError(status: number, message: string, details?: unknown) {
  return { error: { status, message, details, timestamp: Date.now() } };
}
export function notFound(c: Context) { return c.json(formatError(404, `Route ${c.req.path} not found`), 404); }
