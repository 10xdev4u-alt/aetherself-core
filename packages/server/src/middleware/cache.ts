import type { Context, Next } from "hono";
export function cacheControl(maxAge: number) {
  return async (c: Context, next: Next) => {
    await next();
    c.header("cache-control", `public, max-age=${maxAge}`);
  };
}
