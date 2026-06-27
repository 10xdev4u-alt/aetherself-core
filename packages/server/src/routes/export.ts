import { Hono } from "hono";
import { getSessionDid } from "../middleware/auth.js";
import type { Storage } from "../storage.js";
export function createExportRouter(storage: Storage): Hono {
  const router = new Hono();
  router.get("/v1/export", (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);
    const identity = storage.getIdentity(did);
    const memories = storage.queryMemories(did, "", 10000);
    return c.json({ did, identity, memories, exportedAt: Date.now() });
  });
  return router;
}
