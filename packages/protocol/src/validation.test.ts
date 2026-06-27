import { describe, it, expect } from "vitest";
import { contextFrameSchema, relationshipSchema, preferenceSchema } from "../src/types.js";

describe("context frame", () => {
  it("accepts valid context", () => {
    const result = contextFrameSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      activity: "coding",
      platform: "vscode",
      startedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal context", () => {
    const result = contextFrameSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      activity: "reading",
      startedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing activity", () => {
    const result = contextFrameSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      startedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });
});

describe("relationship", () => {
  it("accepts valid relationship", () => {
    const result = relationshipSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440001",
      entityId: "did:aetherself:friend123",
      entityName: "Best Friend",
      type: "person",
      strength: 0.9,
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("defaults strength to 0.5", () => {
    const result = relationshipSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440001",
      entityId: "test",
      entityName: "Test",
      type: "person",
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.strength).toBe(0.5);
  });

  it("rejects invalid type", () => {
    const result = relationshipSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440001",
      entityId: "test",
      entityName: "Test",
      type: "invalid",
      updatedAt: Date.now(),
    });
    expect(result.success).toBe(false);
  });
});

describe("preference", () => {
  it("accepts string value", () => {
    const result = preferenceSchema.safeParse({ key: "theme", value: "dark", updatedAt: Date.now() });
    expect(result.success).toBe(true);
  });

  it("accepts number value", () => {
    const result = preferenceSchema.safeParse({ key: "font-size", value: 14, updatedAt: Date.now() });
    expect(result.success).toBe(true);
  });

  it("accepts boolean value", () => {
    const result = preferenceSchema.safeParse({ key: "notifications", value: true, updatedAt: Date.now() });
    expect(result.success).toBe(true);
  });
});
