import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";
export function validateBody(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);
    if (!result.success) return c.json({ error: "Validation failed", details: result.error.issues }, 400);
    c.set("validatedBody", result.data);
    await next();
  };
}
