import type { Context, Next } from "hono";
export async function timing(c: Context, next: Next) {
  const start = performance.now();
  await next();
  c.header("server-timing", `total;dur=${(performance.now() - start).toFixed(1)}`);
}
