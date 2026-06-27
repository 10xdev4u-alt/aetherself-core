/**
 * `aetherself export` — Export identity as encrypted JSON.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

export function exportCmd(options: { output: string }): void {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const raw = readFileSync(KEY_FILE, "utf-8");
  writeFileSync(options.output, raw);
  console.log(`✅ Identity exported to ${options.output}`);
}
