/**
 * AetherSelf — Error handling middleware.
 */
import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (err) {
    console.error("[aetherself] Unhandled error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    c.status(500);
    await c.json({ error: message });
  }
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(c: Context) {
  return c.json({ error: `Not found: ${c.req.method} ${c.req.path}` }, 404);
}
