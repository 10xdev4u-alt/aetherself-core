import { Hono } from "hono";
import { PROTOCOL_VERSION } from "@aetherself/protocol";
export const infoRouter = new Hono();
infoRouter.get("/v1/info", (c) => c.json({
  name: "aetherself",
  version: "0.1.0",
  protocol: PROTOCOL_VERSION,
  features: ["identity", "memory", "context", "relationships", "preferences"],
  encryption: "xchacha20-poly1305",
  auth: "ed25519-challenge-response",
}));
