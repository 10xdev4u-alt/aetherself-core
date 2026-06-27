/**
 * AetherSelf — Auth middleware.
 *
 * Validates Bearer tokens from the Authorization header
 * and attaches the authenticated DID to the request context.
 */

import type { Context, Next } from "hono";
import type { Storage } from "../storage.js";

// Extend Hono's context variables
declare module "hono" {
  interface ContextVariableMap {
    aetherselfDid: string | undefined;
  }
}

export function createAuthMiddleware(storage: Storage) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      c.set("aetherselfDid", undefined);
      return next();
    }

    const token = authHeader.slice(7);
    const session = storage.getSession(token);

    if (!session) {
      c.set("aetherselfDid", undefined);
      return next();
    }

    c.set("aetherselfDid", session.did);
    return next();
  };
}

/**
 * Get the authenticated DID from the request context.
 * Returns undefined if not authenticated.
 */
export function getSessionDid(c: Context): string | undefined {
  return c.get("aetherselfDid");
}
