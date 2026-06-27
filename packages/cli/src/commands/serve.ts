/**
 * `aetherself serve` — Start the local daemon.
 */

import { startServer } from "@aetherself/server";
import { join } from "node:path";
import { homedir } from "node:os";
import { watch, existsSync, readFileSync } from "node:fs";

const AETHERSELF_DIR = join(homedir(), ".aetherself");
const KEY_FILE = join(AETHERSELF_DIR, "identity.json");

export function serveCmd(options: { port: string; db: string; host: string }): void {
  if (!existsSync(KEY_FILE)) {
    console.log("⚠️  No identity found. Run 'aetherself init' first.");
    process.exit(1);
  }

  const port = Number.parseInt(options.port, 10);
  const host = options.host;

  console.log(`🚀 Starting AetherSelf daemon...`);
  console.log(`   DID: ${getDid()}`);

  startServer({ port, dbPath: options.db, host });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n👋 Shutting down...");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

function getDid(): string {
  const raw = readFileSync(KEY_FILE, "utf-8");
  const data = JSON.parse(raw) as { did: string };
  return data.did;
}
