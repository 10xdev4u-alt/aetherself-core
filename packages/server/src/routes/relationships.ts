/**
 * AetherSelf — Relationship routes.
 */
import { Hono } from "hono";
import { relationshipSchema } from "@aetherself/protocol";
import type { Storage } from "../storage.js";
import { getSessionDid } from "../middleware/auth.js";
import crypto from "node:crypto";

export function createRelationshipRouter(storage: Storage): Hono {
  const router = new Hono();

  router.post("/v1/relationships", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json<Record<string, unknown>>();
    const parsed = relationshipSchema.safeParse({
      ...body,
      id: (body.id as string) ?? crypto.randomUUID(),
      updatedAt: Date.now(),
    });

    if (!parsed.success) {
      return c.json({ error: "Invalid relationship", details: parsed.error.issues }, 400);
    }

    storage.upsertRelationship(did, parsed.data);
    return c.json({ status: "ok", id: parsed.data.id }, 201);
  });

  router.get("/v1/relationships", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const relationships = storage.getRelationships(did);
    return c.json({ relationships });
  });

  router.delete("/v1/relationships/:id", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    storage.deleteRelationship(did, c.req.param("id"));
    return c.json({ status: "deleted" });
  });

  return router;
}
