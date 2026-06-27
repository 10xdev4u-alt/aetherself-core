/**
 * `aetherself init` — Create a new identity.
 */

import { generateKeyPair, encodePublicKey, publicKeyToDid } from "@aetherself/crypto";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const AETHERSELF_DIR = join(homedir(), ".aetherself");
const KEY_FILE = join(AETHERSELF_DIR, "identity.json");

export async function initCmd(options: { password?: string }): Promise<void> {
  if (existsSync(KEY_FILE)) {
    console.log("⚠️  Identity already exists at", KEY_FILE);
    console.log("   Use 'aetherself identity' to view it.");
    console.log("   Delete ~/.aetherself/identity.json to re-initialize.");
    process.exit(1);
  }

  console.log("🔑 Generating Ed25519 key pair...");
  const kp = await generateKeyPair();
  const did = publicKeyToDid(kp.publicKey);
  const publicKeyB64 = encodePublicKey(kp.publicKey);

  mkdirSync(AETHERSELF_DIR, { recursive: true });

  const identityData = {
    did,
    publicKey: publicKeyB64,
    privateKey: Buffer.from(kp.privateKey).toString("base64"),
    createdAt: Date.now(),
    algorithm: "ed25519",
  };

  writeFileSync(KEY_FILE, JSON.stringify(identityData, null, 2), {
    mode: 0o600,
  });

  console.log(`\n  ✅ AetherSelf identity created!`);
  console.log(`  📍 ${KEY_FILE}`);
  console.log(`  🆔 ${did}`);
  console.log(`\n  Run 'aetherself serve' to start the daemon.`);
}
