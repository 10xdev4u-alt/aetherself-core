/**
 * `aetherself import` — Import identity from JSON.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const AETHERSELF_DIR = join(homedir(), ".aetherself");
const KEY_FILE = join(AETHERSELF_DIR, "identity.json");

export function importCmd(file: string): void {
  if (!existsSync(file)) {
    console.log(`⚠️  File not found: ${file}`);
    process.exit(1);
  }

  if (existsSync(KEY_FILE)) {
    console.log("⚠️  Identity already exists. Delete ~/.aetherself/identity.json first.");
    process.exit(1);
  }

  const raw = readFileSync(file, "utf-8");
  mkdirSync(AETHERSELF_DIR, { recursive: true });
  writeFileSync(KEY_FILE, raw, { mode: 0o600 });

  const data = JSON.parse(raw) as { did: string };
  console.log(`✅ Identity imported: ${data.did}`);
}
