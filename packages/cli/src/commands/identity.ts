/**
 * `aetherself identity` — Show current identity.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

export function identityCmd(options: { didOnly?: boolean }): void {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const raw = readFileSync(KEY_FILE, "utf-8");
  const data = JSON.parse(raw) as {
    did: string;
    publicKey: string;
    createdAt: number;
  };

  if (options.didOnly) {
    console.log(data.did);
    return;
  }

  console.log(`\n  🆔 ${data.did}`);
  console.log(`  🔑 Public Key:  ${data.publicKey.slice(0, 32)}...`);
  console.log(`  📅 Created:     ${new Date(data.createdAt).toISOString()}`);
  console.log(`  📍 ${KEY_FILE}\n`);
}
