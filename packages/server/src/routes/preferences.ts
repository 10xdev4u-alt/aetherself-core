/**
 * AetherSelf — Preference routes.
 */
import { Hono } from "hono";
import { preferenceSchema } from "@aetherself/protocol";
import type { Storage } from "../storage.js";
import { getSessionDid } from "../middleware/auth.js";

export function createPreferenceRouter(storage: Storage): Hono {
  const router = new Hono();

  router.post("/v1/preferences", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json<Record<string, unknown>>();
    const parsed = preferenceSchema.safeParse({ ...body, updatedAt: Date.now() });

    if (!parsed.success) {
      return c.json({ error: "Invalid preference", details: parsed.error.issues }, 400);
    }

    storage.upsertPreference(did, parsed.data);
    return c.json({ status: "ok" }, 201);
  });

  router.get("/v1/preferences", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    const category = c.req.query("category");
    const prefs = storage.getPreferences(did, category);
    return c.json({ preferences: prefs });
  });

  router.delete("/v1/preferences/:key", async (c) => {
    const did = getSessionDid(c);
    if (!did) return c.json({ error: "Unauthorized" }, 401);

    storage.deletePreference(did, c.req.param("key"));
    return c.json({ status: "deleted" });
  });

  return router;
}
