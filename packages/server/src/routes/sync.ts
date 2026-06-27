/**
 * AetherSelf — WebSocket sync relay (placeholder for Yjs CRDT sync).
 */
import { Hono } from "hono";

export function createSyncRouter(): Hono {
  const router = new Hono();

  router.get("/v1/sync/status", (c) => {
    return c.json({
      status: "available",
      protocol: "yjs-websocket",
      endpoint: "/v1/sync",
    });
  });

  return router;
}
// ponytail: placeholder for future Yjs sync
