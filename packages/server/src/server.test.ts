import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateKeyPair, sign, encodePublicKey, publicKeyToDid } from "@aetherself/crypto";
import { createServer } from "../src/index.js";

import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync, rmSync } from "node:fs";

let server: ReturnType<typeof createServer>;
let tmpDir: string;
let keyPair: Awaited<ReturnType<typeof generateKeyPair>>;
let did: string;

function request(method: string, path: string, options?: { body?: Record<string, unknown>; token?: string }): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = server.app.request(
    path,
    {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    },
  );
  return Promise.resolve(res);
}

beforeAll(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "aetherself-test-"));
  const dbPath = join(tmpDir, "test.db");
  server = createServer({ port: 0, dbPath, host: "127.0.0.1" });
  keyPair = await generateKeyPair();
  did = publicKeyToDid(keyPair.publicKey);
});

afterAll(() => {
  server?.storage?.close();
  if (tmpDir) {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

describe("health", () => {
  it("returns ok status", async () => {
    const res = await request("GET", "/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
    expect(body.uptime).toBeTypeOf("number");
  });
});

describe("well-known", () => {
  it("returns protocol info", async () => {
    const res = await request("GET", "/.well-known/aetherself");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.version).toBe("0.1");
    expect(body.capabilities).toContain("identity:read");
  });
});

describe("authentication", () => {
  it("rejects hello without publicKey", async () => {
    const res = await request("POST", "/v1/auth/hello", { body: {} });
    expect(res.status).toBe(400);
  });

  it("completes full challenge-response flow", async () => {
    const encodedPubKey = encodePublicKey(keyPair.publicKey);
    const helloRes = await request("POST", "/v1/auth/hello", {
      body: { publicKey: encodedPubKey },
    });
    expect(helloRes.status).toBe(200);
    const helloBody = (await helloRes.json()) as Record<string, string>;
    expect(helloBody.challengeId).toBeTypeOf("string");
    expect(helloBody.nonce).toBeTypeOf("string");

    const message = new TextEncoder().encode(helloBody.nonce ?? "");
    const signature = await sign(message, keyPair.privateKey);

    const responseRes = await request("POST", "/v1/auth/response", {
      body: {
        challengeId: helloBody.challengeId,
        nonce: helloBody.nonce,
        signature,
      },
    });
    expect(responseRes.status).toBe(200);
    const sessionBody = (await responseRes.json()) as Record<string, unknown>;
    expect(sessionBody.token).toBeTypeOf("string");
    expect(sessionBody.did).toBe(did);
    expect(sessionBody.scopes).toContain("identity:read");
  });
});

describe("identity CRUD", () => {
  let token: string;

  beforeAll(async () => {
    const encodedPubKey = encodePublicKey(keyPair.publicKey);
    const hello = (await (await request("POST", "/v1/auth/hello", {
      body: { publicKey: encodedPubKey },
    })).json()) as Record<string, string>;

    const message = new TextEncoder().encode(hello.nonce ?? "");
    const signature = await sign(message, keyPair.privateKey);

    const sess = (await (await request("POST", "/v1/auth/response", {
      body: {
        challengeId: hello.challengeId,
        nonce: hello.nonce,
        signature,
      },
    })).json()) as Record<string, string>;
    token = sess.token ?? "";
  });

  it("creates identity", async () => {
    const res = await request("PUT", "/v1/identity", {
      token,
      body: { encryptedPayload: "encrypted-test-data", encryptedAt: Date.now() },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
  });

  it("reads identity", async () => {
    const res = await request("GET", "/v1/identity", { token });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.encryptedPayload).toBe("encrypted-test-data");
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request("GET", "/v1/identity");
    expect(res.status).toBe(401);
  });

  it("appends memory", async () => {
    const res = await request("POST", "/v1/memory", {
      token,
      body: {
        id: crypto.randomUUID(),
        type: "fact",
        content: "User loves building AI tools",
        timestamp: Date.now(),
        tags: ["ai", "tools"],
      },
    });
    expect(res.status).toBe(201);
  });

  it("queries memory", async () => {
    const res = await request("GET", "/v1/memory", { token });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    const results = body.results as Array<Record<string, unknown>>;
    expect(results).toHaveLength(1);
    expect(results[0]?.content).toBe("User loves building AI tools");
  });
});

describe("context", () => {
  let token: string;

  beforeAll(async () => {
    const encodedPubKey = encodePublicKey(keyPair.publicKey);
    const hello = (await (await request("POST", "/v1/auth/hello", {
      body: { publicKey: encodedPubKey },
    })).json()) as Record<string, string>;

    const message = new TextEncoder().encode(hello.nonce ?? "");
    const signature = await sign(message, keyPair.privateKey);

    const sess = (await (await request("POST", "/v1/auth/response", {
      body: { challengeId: hello.challengeId, nonce: hello.nonce, signature },
    })).json()) as Record<string, string>;
    token = sess.token ?? "";
  });

  it("creates context", async () => {
    const res = await request("POST", "/v1/context", {
      token,
      body: { activity: "coding", platform: "vscode" },
    });
    expect(res.status).toBe(201);
  });

  it("lists contexts", async () => {
    const res = await request("GET", "/v1/context", { token });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect((body.contexts as unknown[]).length).toBeGreaterThan(0);
  });
});

describe("relationships", () => {
  let token: string;

  beforeAll(async () => {
    const encodedPubKey = encodePublicKey(keyPair.publicKey);
    const hello = (await (await request("POST", "/v1/auth/hello", {
      body: { publicKey: encodedPubKey },
    })).json()) as Record<string, string>;

    const message = new TextEncoder().encode(hello.nonce ?? "");
    const signature = await sign(message, keyPair.privateKey);

    const sess = (await (await request("POST", "/v1/auth/response", {
      body: { challengeId: hello.challengeId, nonce: hello.nonce, signature },
    })).json()) as Record<string, string>;
    token = sess.token ?? "";
  });

  it("creates relationship", async () => {
    const res = await request("POST", "/v1/relationships", {
      token,
      body: { entityId: "did:aetherself:friend123", entityName: "Best Friend", type: "person", strength: 0.9 },
    });
    expect(res.status).toBe(201);
  });

  it("lists relationships", async () => {
    const res = await request("GET", "/v1/relationships", { token });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect((body.relationships as unknown[]).length).toBeGreaterThan(0);
  });
});

describe("preferences", () => {
  let token: string;

  beforeAll(async () => {
    const encodedPubKey = encodePublicKey(keyPair.publicKey);
    const hello = (await (await request("POST", "/v1/auth/hello", {
      body: { publicKey: encodedPubKey },
    })).json()) as Record<string, string>;
    const message = new TextEncoder().encode(hello.nonce ?? "");
    const signature = await sign(message, keyPair.privateKey);
    const sess = (await (await request("POST", "/v1/auth/response", {
      body: { challengeId: hello.challengeId, nonce: hello.nonce, signature },
    })).json()) as Record<string, string>;
    token = sess.token ?? "";
  });

  it("creates preference", async () => {
    const res = await request("POST", "/v1/preferences", {
      token,
      body: { key: "theme", value: "dark", category: "ui" },
    });
    expect(res.status).toBe(201);
  });

  it("lists preferences", async () => {
    const res = await request("GET", "/v1/preferences", { token });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect((body.preferences as unknown[]).length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    const res = await request("GET", "/v1/preferences?category=ui", { token });
    expect(res.status).toBe(200);
  });
});
