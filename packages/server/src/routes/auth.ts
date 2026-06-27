/**
 * AetherSelf — Authentication routes.
 *
 * Implements challenge-response auth using Ed25519 signatures.
 * 1. Client sends HELLO with their public key
 * 2. Server responds with CHALLENGE (nonce)
 * 3. Client signs the nonce and sends RESPONSE
 * 4. Server verifies and returns a session token
 */

import { Hono } from "hono";
import { DID_PREFIX, type Did, didSchema } from "@aetherself/protocol";
import {
  generateKeyPair,
  encodePublicKey,
  decodePublicKey,
  verify,
  publicKeyToDid,
} from "@aetherself/crypto";
import type { Storage } from "../storage.js";

import crypto from "node:crypto";

interface AuthState {
  publicKey: string;
  nonce: string;
  timestamp: number;
}

// In-memory pending auth challenges (ephemeral)
const pendingChallenges = new Map<string, AuthState>();

const SESSION_TTL_MS = 3_600_000; // 1 hour
const CHALLENGE_TTL_MS = 60_000; // 1 minute

export function createAuthRouter(storage: Storage): Hono {
  const router = new Hono();

  /**
   * Step 1: Client sends their public key
   * POST /v1/auth/hello { publicKey: "base64..." }
   */
  router.post("/v1/auth/hello", async (c) => {
    const body = await c.req.json<{ publicKey?: string }>();
    if (!body.publicKey) {
      return c.json({ error: "publicKey is required" }, 400);
    }

    // Validate the public key by decoding it
    try {
      decodePublicKey(body.publicKey);
    } catch {
      return c.json({ error: "Invalid public key" }, 400);
    }

    const nonce = crypto.randomBytes(32).toString("hex");
    const timestamp = Date.now();

    const challengeId = crypto.randomUUID();
    pendingChallenges.set(challengeId, {
      publicKey: body.publicKey,
      nonce,
      timestamp,
    });

    return c.json({
      challengeId,
      nonce,
      timestamp,
      ttlMs: CHALLENGE_TTL_MS,
    });
  });

  /**
   * Step 2: Client responds with signed nonce
   * POST /v1/auth/response { challengeId, signature }
   */
  router.post("/v1/auth/response", async (c) => {
    const body = await c.req.json<{
      challengeId?: string;
      nonce?: string;
      signature?: string;
    }>();
    if (!body.challengeId || !body.nonce || !body.signature) {
      return c.json(
        { error: "challengeId, nonce, and signature are required" },
        400,
      );
    }

    const challenge = pendingChallenges.get(body.challengeId);
    if (!challenge) {
      return c.json({ error: "Invalid or expired challenge" }, 401);
    }

    // Check expiry
    if (Date.now() - challenge.timestamp > CHALLENGE_TTL_MS) {
      pendingChallenges.delete(body.challengeId);
      return c.json({ error: "Challenge expired" }, 401);
    }

    // Verify the nonce matches
    if (challenge.nonce !== body.nonce) {
      pendingChallenges.delete(body.challengeId);
      return c.json({ error: "Nonce mismatch" }, 401);
    }

    // Verify signature
    const message = new TextEncoder().encode(body.nonce);
    const publicKey = decodePublicKey(challenge.publicKey);
    const isValid = await verify(message, body.signature, publicKey);

    if (!isValid) {
      pendingChallenges.delete(body.challengeId);
      return c.json({ error: "Invalid signature" }, 401);
    }

    // Create session
    const did = publicKeyToDid(publicKey);
    const token = crypto.randomBytes(32).toString("hex");
    const scopes = ["identity:read", "identity:write", "memory:read", "memory:write"];
    storage.createSession(token, did, scopes, SESSION_TTL_MS);

    // Cleanup
    pendingChallenges.delete(body.challengeId);

    return c.json({
      token,
      did,
      scopes,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
  });

  return router;
}
