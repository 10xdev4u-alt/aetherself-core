/**
 * AetherSelf — Context routes.
 *
 * Manage the user's current context (what they're doing right now).
 */
import { Hono } from "hono";
import { contextFrameSchema } from "@aetherself/protocol";
import type { Storage } from "../storage.js";
import { getSessionDid } from "../middleware/auth.js";
import crypto from "node:crypto";

export function createContextRouter(storage: Storage): Hono {
  const router = new Hono();

  router.post("/v1/context", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json<Record<string, unknown>>();
    const parsed = contextFrameSchema.safeParse({
      ...body,
      id: (body.id as string) ?? crypto.randomUUID(),
      startedAt: (body.startedAt as number) ?? Date.now(),
    });

    if (!parsed.success) {
      return c.json({ error: "Invalid context", details: parsed.error.issues }, 400);
    }

    storage.upsertContext(did, parsed.data);
    return c.json({ status: "ok", id: parsed.data.id }, 201);
  });

  router.get("/v1/context", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const contexts = storage.getContexts(did);
    return c.json({ contexts });
  });

  router.delete("/v1/context/:id", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.param("id");
    storage.deleteContext(did, id);
    return c.json({ status: "deleted" });
  });

  return router;
}
