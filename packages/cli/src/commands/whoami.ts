/**
 * `aetherself whoami` — Show current identity info.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

export function whoamiCmd(): void {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(KEY_FILE, "utf-8")) as {
    did: string;
    publicKey: string;
    createdAt: number;
  };

  console.log(`\n  🆔 ${data.did}`);
  console.log(`  🔑 ${data.publicKey.slice(0, 20)}...`);
  console.log(`  📅 Created: ${new Date(data.createdAt).toLocaleDateString()}\n`);
}
