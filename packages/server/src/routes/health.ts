/**
 * AetherSelf — Health check route.
 */
import { Hono } from "hono";

export const healthRouter = new Hono();

healthRouter.get("/health", (c) => {
  return c.json({ status: "ok", uptime: process.uptime() | 0 });
});
