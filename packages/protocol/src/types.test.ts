import { describe, it, expect } from "vitest";
import {
  didSchema,
  identityProfileSchema,
  memorySchema,
  aetherSelfSchema,
  createDid,
  parseDid,
  PROTOCOL_VERSION,
  DID_PREFIX,
} from "../src/types.js";

describe("did validation", () => {
  it("accepts valid DIDs", () => {
    const valid = "did:aetherself:abc123def456ghi789jkl012mno345pqr678stu901";
    expect(didSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid DIDs", () => {
    expect(didSchema.safeParse("did:eth:abc").success).toBe(false);
    expect(didSchema.safeParse("not-a-did").success).toBe(false);
    expect(didSchema.safeParse("").success).toBe(false);
  });

  it("creates a DID and extracts the key", () => {
    const key = "AbCdEfGhIjKlMnOpQrStUvWxYz1234567890";
    const did = createDid(key);
    expect(did).toBe(`did:aetherself:${key}`);
    expect(parseDid(did)).toBe(key);
  });
});

describe("identity profile", () => {
  it("accepts a minimal profile", () => {
    const result = identityProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a full profile", () => {
    const result = identityProfileSchema.safeParse({
      name: "Princyy",
      bio: "Building the future of AI identity",
      language: "en",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Princyy");
    }
  });

  it("rejects overly long names", () => {
    const result = identityProfileSchema.safeParse({
      name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("memory", () => {
  it("accepts a valid memory entry", () => {
    const result = memorySchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "fact",
      content: "User prefers dark mode in all applications",
      timestamp: Date.now(),
      importance: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("defaults tags to empty array", () => {
    const result = memorySchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "insight",
      content: "test",
      timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("rejects invalid memory type", () => {
    const result = memorySchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "invalid-type",
      content: "test",
      timestamp: Date.now(),
    });
    expect(result.success).toBe(false);
  });
});

describe("aetherself graph", () => {
  it("accepts a minimal self", () => {
    const result = aetherSelfSchema.safeParse({
      did: "did:aetherself:abc123def456ghi789jkl012mno345pqr678stu901",
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a complete self with all fields", () => {
    const now = Date.now();
    const result = aetherSelfSchema.safeParse({
      did: "did:aetherself:abc123def456ghi789jkl012mno345pqr678stu901",
      identity: { name: "Test User", language: "en" },
      preferences: [
        { key: "theme", value: "dark", updatedAt: now },
        { key: "language", value: "typescript", category: "dev", updatedAt: now },
      ],
      context: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          activity: "coding",
          startedAt: now,
        },
      ],
      relationships: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          entityId: "did:aetherself:partner123",
          entityName: "Co-founder",
          type: "person",
          strength: 0.9,
          updatedAt: now,
        },
      ],
      memories: [
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          type: "preference",
          content: "Prefers async communication over meetings",
          timestamp: now,
          tags: ["work", "communication"],
        },
      ],
      version: 1,
      updatedAt: now,
      createdAt: now,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferences).toHaveLength(2);
      expect(result.data.memories).toHaveLength(1);
    }
  });

  it("provides defaults for empty fields", () => {
    const result = aetherSelfSchema.safeParse({
      did: "did:aetherself:abc123def456ghi789jkl012mno345pqr678stu901",
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferences).toEqual([]);
      expect(result.data.memories).toEqual([]);
      expect(result.data.context).toEqual([]);
      expect(result.data.relationships).toEqual([]);
      expect(result.data.version).toBe(1);
    }
  });
});

describe("constants", () => {
  it("defines protocol version", () => {
    expect(PROTOCOL_VERSION).toBe("0.1");
  });

  it("defines DID prefix", () => {
    expect(DID_PREFIX).toBe("did:aetherself:");
  });
});
