/**
 * AetherSelf — Core types for the identity protocol.
 *
 * Every human has a "Self" — their portable identity graph that
 * travels with them across every AI, encrypted and owned by them.
 */

import { z } from "zod";

// ─── Identifiers ───────────────────────────────────────────────

/** `did:aetherself:<base58(publicKey)>` */
export const didSchema = z
  .string()
  .regex(/^did:aetherself:[1-9A-HJ-NP-Za-km-z]{32,44}$/);

export type Did = z.infer<typeof didSchema>;

// ─── Identity ──────────────────────────────────────────────────

export const identityProfileSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  avatar: z.string().url().optional(),
  voice: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
});

export type IdentityProfile = z.infer<typeof identityProfileSchema>;

// ─── Preferences ───────────────────────────────────────────────

export const preferenceSchema = z.object({
  key: z.string().max(100),
  value: z.union([z.string(), z.number(), z.boolean()]),
  category: z.string().max(50).optional(),
  updatedAt: z.number(),
});

export type Preference = z.infer<typeof preferenceSchema>;

// ─── Context Frames ────────────────────────────────────────────

export const contextFrameSchema = z.object({
  id: z.string().uuid(),
  activity: z.string().max(200),
  platform: z.string().max(50).optional(),
  appId: z.string().max(100).optional(),
  startedAt: z.number(),
  expiresAt: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ContextFrame = z.infer<typeof contextFrameSchema>;

// ─── Relationships ─────────────────────────────────────────────

export const relationshipSchema = z.object({
  id: z.string().uuid(),
  entityId: z.string().max(200),
  entityName: z.string().max(200),
  type: z.enum(["person", "organization", "assistant", "other"]),
  strength: z.number().min(0).max(1).default(0.5),
  context: z.string().max(500).optional(),
  updatedAt: z.number(),
});

export type Relationship = z.infer<typeof relationshipSchema>;

// ─── Memory ────────────────────────────────────────────────────

export const memorySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["fact", "decision", "preference", "event", "insight"]),
  content: z.string().max(10000),
  tags: z.array(z.string().max(50)).default([]),
  timestamp: z.number(),
  source: z.string().max(100).optional(),
  importance: z.number().min(0).max(1).default(0.5),
});

export type Memory = z.infer<typeof memorySchema>;

// ─── AetherSelf — The Full Identity Graph ────────────────────

export const aetherSelfSchema = z.object({
  did: didSchema,
  identity: identityProfileSchema.default({}),
  preferences: z.array(preferenceSchema).default([]),
  context: z.array(contextFrameSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  memories: z.array(memorySchema).default([]),
  version: z.number().default(1),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export type AetherSelf = z.infer<typeof aetherSelfSchema>;

// ─── Protocol Messages ─────────────────────────────────────────

export const helloMessageSchema = z.object({
  type: z.literal("hello"),
  publicKey: z.string(),
  clientVersion: z.string().optional(),
});

export const challengeMessageSchema = z.object({
  type: z.literal("challenge"),
  nonce: z.string(),
  timestamp: z.number(),
});

export const responseMessageSchema = z.object({
  type: z.literal("response"),
  nonce: z.string(),
  signature: z.string(),
});

export const sessionSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
  scopes: z.array(z.string()).default(["identity:read", "identity:write"]),
});

export type Session = z.infer<typeof sessionSchema>;

// ─── API Payloads ──────────────────────────────────────────────

export const identityReadResponseSchema = z.object({
  did: didSchema,
  encryptedPayload: z.string(),
  encryptedAt: z.number(),
});

export const memoryAppendRequestSchema = z.object({
  encryptedMemory: z.string(),
});

export const memoryQueryRequestSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(100).default(20),
});

export const memoryQueryResponseSchema = z.object({
  results: z.array(memorySchema),
  total: z.number(),
});

// ─── Constants ─────────────────────────────────────────────────

export const PROTOCOL_VERSION = "0.1";
export const WELL_KNOWN_PATH = "/.well-known/aetherself";
export const DID_PREFIX = "did:aetherself:";
export const DEFAULT_SESSION_TTL_MS = 3_600_000; // 1 hour
export const MAX_MEMORIES = 10_000;
export const MAX_PREFERENCES = 500;
export const MAX_CONTEXT_FRAMES = 10;
export const MAX_RELATIONSHIPS = 200;

/**
 * Generate a DID string from a base58-encoded public key.
 */
export function createDid(publicKeyBase58: string): Did {
  const did = `${DID_PREFIX}${publicKeyBase58}` as Did;
  return didSchema.parse(did);
}

/**
 * Extract the public key from a DID string.
 */
export function parseDid(did: Did): string {
  return did.slice(DID_PREFIX.length);
}
