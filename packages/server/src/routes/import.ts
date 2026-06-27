import { Hono } from "hono";
import { getSessionDid } from "../middleware/auth.js";
import type { Storage } from "../storage.js";
export function createImportRouter(storage: Storage): Hono {
  const router = new Hono();
  router.post("/v1/import", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);
    const body = await c.req.json<{ identity?: string; memories?: Array<{ content: string }> }>();
    if (body.identity) storage.upsertIdentity(did, body.identity, Date.now());
    return c.json({ status: "imported" });
  });
  return router;
}
