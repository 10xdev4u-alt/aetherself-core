/**
 * AetherSelf — Well-known endpoint for protocol discovery.
 */
import { Hono } from "hono";
import { PROTOCOL_VERSION } from "@aetherself/protocol";

export const wellKnownRouter = new Hono();

wellKnownRouter.get("/.well-known/aetherself", (c) => {
  return c.json({
    version: PROTOCOL_VERSION,
    capabilities: ["identity:read", "identity:write", "memory:read", "memory:write"],
    endpoints: {
      auth: "/v1/auth/hello",
      identity: "/v1/identity",
      memory: "/v1/memory",
      context: "/v1/context",
    },
  });
});
