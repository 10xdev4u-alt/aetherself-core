/**
 * `aetherself backup` — Export encrypted backup.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const KEY_FILE = join(homedir(), ".aetherself", "identity.json");

export function backupCmd(options: { output?: string }): void {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const data = readFileSync(KEY_FILE, "utf-8");
  const outPath = options.output ?? `aetherself-backup-${Date.now()}.json`;
  writeFileSync(outPath, data, { mode: 0o600 });
  console.log(`✅ Backup exported to ${outPath}`);
}
