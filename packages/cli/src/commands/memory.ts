/**
 * `aetherself memory` — Query and manage memories.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");
const BASE_URL = "http://127.0.0.1:4197";

export async function memoryCmd(options: { query?: string; limit?: string }): Promise<void> {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const token = await getToken();
  if (!token) return;

  const q = options.query ?? "";
  const limit = options.limit ?? "20";

  const res = await fetch(`${BASE_URL}/v1/memory?q=${encodeURIComponent(q)}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.log("❌ Failed to query memories:", res.status);
    return;
  }

  const body = (await res.json()) as { results: Array<{ type: string; content: string; tags: string[]; importance: number }> };
  if (body.results.length === 0) {
    console.log("📭 No memories found.");
    return;
  }

  console.log(`\n  📝 ${body.results.length} memories:\n`);
  for (const m of body.results) {
    const tags = m.tags.length > 0 ? ` [${m.tags.join(", ")}]` : "";
    console.log(`  • ${m.type}: ${m.content}${tags} (${m.importance})`);
  }
}

async function getToken(): Promise<string | null> {
  const identity = JSON.parse(readFileSync(KEY_FILE, "utf-8")) as { did: string; publicKey: string };
  const helloRes = await fetch(`${BASE_URL}/v1/auth/hello`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey: identity.publicKey }),
  });

  if (!helloRes.ok) {
    console.log("❌ Daemon auth failed. Is 'aetherself serve' running?");
    return null;
  }

  // ponytail: CLI token flow simplified — real impl would sign the nonce
  return "cli-token";
}
