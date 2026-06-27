import { Hono } from "hono";
export const readinessRouter = new Hono();
readinessRouter.get("/ready", (c) => c.json({ ready: true, timestamp: Date.now() }));
readinessRouter.get("/alive", (c) => c.json({ alive: true }));
