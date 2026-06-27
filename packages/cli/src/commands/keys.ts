/**
 * `aetherself keys` — Show key information.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

export function keysCmd(): void {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(KEY_FILE, "utf-8")) as {
    did: string;
    publicKey: string;
    algorithm: string;
    createdAt: number;
  };

  console.log(`\n  🔑 Key Information:\n`);
  console.log(`  Algorithm:  ${data.algorithm}`);
  console.log(`  Public Key: ${data.publicKey}`);
  console.log(`  DID:        ${data.did}`);
  console.log(`  Created:    ${new Date(data.createdAt).toISOString()}\n`);
}
