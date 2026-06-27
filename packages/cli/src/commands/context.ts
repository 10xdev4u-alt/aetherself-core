/**
 * `aetherself context` — Manage current context.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const BASE_URL = "http://127.0.0.1:4197";

export async function contextCmd(options: { set?: string; list?: boolean }): Promise<void> {
  if (!existsSync(join(homedir(), ".aetherself", "identity.json"))) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  if (options.set) {
    const res = await fetch(`${BASE_URL}/v1/context`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer cli-token" },
      body: JSON.stringify({ activity: options.set, platform: "cli" }),
    });
    if (res.ok) console.log(`✅ Context set: ${options.set}`);
    else console.log("❌ Failed to set context:", res.status);
    return;
  }

  const res = await fetch(`${BASE_URL}/v1/context`, {
    headers: { Authorization: "Bearer cli-token" },
  });
  if (!res.ok) {
    console.log("❌ Failed to fetch context:", res.status);
    return;
  }

  const body = (await res.json()) as { contexts: Array<{ activity: string; platform?: string }> };
  if (body.contexts.length === 0) {
    console.log("📭 No active context.");
    return;
  }

  console.log(`\n  📍 Active contexts:\n`);
  for (const ctx of body.contexts) {
    console.log(`  • ${ctx.activity} (${ctx.platform ?? "unknown"})`);
  }
}
