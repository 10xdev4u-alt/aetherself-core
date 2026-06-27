import type { Context } from "hono";
export function handleError(err: Error, c: Context) {
  console.error("Server error:", err);
  return c.json({ error: { status: 500, message: "Internal server error" } }, 500);
}
