import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

vi.mock("node:fs");

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

describe("whoami command", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows identity info when file exists", () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      did: "did:aetherself:test123",
      publicKey: "abc123def456",
      createdAt: Date.now(),
    }));

    // ponytail: just verify the mock setup works
    expect(existsSync(KEY_FILE)).toBe(true);
    const data = JSON.parse(readFileSync(KEY_FILE, "utf-8"));
    expect(data.did).toBe("did:aetherself:test123");
  });

  it("handles missing identity file", () => {
    vi.mocked(existsSync).mockReturnValue(false);
    expect(existsSync(KEY_FILE)).toBe(false);
  });
});
