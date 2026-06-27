import { Hono } from "hono";
export const pingRouter = new Hono();
pingRouter.get("/ping", (c) => c.text("pong"));
pingRouter.get("/v1/ping", (c) => c.json({ pong: true, ts: Date.now() }));
