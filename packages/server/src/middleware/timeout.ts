import type { Context, Next } from "hono";
export function timeout(ms: number) {
  return async (c: Context, next: Next) => {
    const timer = setTimeout(() => { if (!c.finalized) return c.json({ error: "Request timeout" }, 408); }, ms);
    await next();
    clearTimeout(timer);
  };
}
