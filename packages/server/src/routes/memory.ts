/**
 * AetherSelf — Memory routes.
 *
 * Append and query memory entries for the authenticated user.
 */

import { Hono } from "hono";
import { memorySchema, type Memory } from "@aetherself/protocol";
import type { Storage } from "../storage.js";
import { getSessionDid } from "../middleware/auth.js";
import crypto from "node:crypto";
import { z } from "zod";

export function createMemoryRouter(storage: Storage): Hono {
  const router = new Hono();

  /**
   * POST /v1/memory
   * Append a new memory entry.
   */
  router.post("/v1/memory", async (c) => {
    const did = getSessionDid(c);
    if (!did) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json<Record<string, unknown>>();

    const parsed = memorySchema.safeParse({
      ...body,
      id: (body.id as string) ?? crypto.randomUUID(),
      timestamp: (body.timestamp as number) ?? Date.now(),
    });

    if (!parsed.success) {
      return c.json({ error: "Invalid memory", details: parsed.error.issues }, 400);
    }

    storage.insertMemory(parsed.data, did);
    return c.json({ status: "ok", id: parsed.data.id }, 201);
  });

  /**
   * GET /v1/memory
   * Query memories with optional search.
   */
  router.get("/v1/memory", async (c) => {
    const did = getSessionDid(c);
    if (!did) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const query = c.req.query("q") ?? "";
    const limit = Math.min(Number(c.req.query("limit")) || 20, 100);

    const results = storage.queryMemories(did, query, limit);
    return c.json({ results, total: results.length });
  });

  return router;
}
