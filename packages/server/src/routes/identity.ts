/**
 * AetherSelf — Identity routes.
 *
 * CRUD operations for the user's identity graph.
 * All payloads are encrypted client-side before reaching the server.
 */

import { Hono } from "hono";
import { didSchema } from "@aetherself/protocol";
import type { Storage } from "../storage.js";
import { getSessionDid } from "../middleware/auth.js";

export function createIdentityRouter(storage: Storage): Hono {
  const router = new Hono();

  /**
   * GET /v1/identity
   * Returns the encrypted identity graph for the authenticated user.
   */
  router.get("/v1/identity", async (c) => {
    const did = getSessionDid(c);
    if (!did) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const identity = storage.getIdentity(did);
    if (!identity) {
      return c.json({ error: "Identity not found" }, 404);
    }

    return c.json({
      did: identity.did,
      encryptedPayload: identity.encrypted_payload,
      encryptedAt: identity.encrypted_at,
      updatedAt: identity.updated_at,
    });
  });

  /**
   * PUT /v1/identity
   * Stores an encrypted identity graph.
   */
  router.put("/v1/identity", async (c) => {
    const did = getSessionDid(c);
    if (!did) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json<{
      encryptedPayload?: string;
      encryptedAt?: number;
    }>();
    if (!body.encryptedPayload) {
      return c.json({ error: "encryptedPayload is required" }, 400);
    }

    storage.upsertIdentity(did, body.encryptedPayload, body.encryptedAt ?? Date.now());

    return c.json({ status: "ok", did });
  });

  /**
   * DELETE /v1/identity
   * Deletes the user's identity and all associated data.
   */
  router.delete("/v1/identity", async (c) => {
    const did = getSessionDid(c);
    if (!did) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    storage.deleteIdentity(did);
    return c.json({ status: "deleted" });
  });

  return router;
}
