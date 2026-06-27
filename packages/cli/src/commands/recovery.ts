/**
 * `aetherself recovery` — Show recovery phrase.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { keyToRecoveryPhrase } from "@aetherself/crypto";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

export async function recoveryCmd(): Promise<void> {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(KEY_FILE, "utf-8")) as { privateKey: string };
  const keyBytes = Buffer.from(data.privateKey, "base64");
  const phrase = keyToRecoveryPhrase(keyBytes);

  console.log("\n  🔑 Recovery Phrase:\n");
  console.log(`  ${phrase}\n`);
  console.log("  ⚠️  Keep this safe! Anyone with this phrase can recover your identity.\n");
}
