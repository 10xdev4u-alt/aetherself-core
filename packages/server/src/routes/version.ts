import { Hono } from "hono";
import { PROTOCOL_VERSION } from "@aetherself/protocol";
export const versionRouter = new Hono();
versionRouter.get("/v1/version", (c) => c.json({ version: PROTOCOL_VERSION, server: "0.1.0" }));
