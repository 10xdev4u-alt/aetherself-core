/**
 * AetherSelf — key derivation from passwords and seeds.
 *
 * Uses Node.js built-in crypto.pbkdf2 for password-based key derivation
 * (avoids libsodium-wrappers csp_pwhash which is not available in all builds).
 */

import { randomBytes, pbkdf2Sync } from "node:crypto";
import sodium from "./sodium.js";

export const SALT_BYTES = 32;
export const KEY_BYTES = 32;
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_DIGEST = "sha512";

/**
 * Generate a random salt for key derivation.
 */
export function generateSalt(): Uint8Array {
  return randomBytes(SALT_BYTES);
}

/**
 * Derive a 32-byte symmetric key from a password using PBKDF2-SHA512.
 * Uses 600K iterations for reasonable security.
 *
 * @param password - The user's password or passphrase
 * @param salt - 32-byte random salt
 * @returns 32-byte derived key
 */
export function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Uint8Array {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_BYTES, PBKDF2_DIGEST);
}

/**
 * Derive an Ed25519 seed from a master key.
 * This allows deterministic key pair generation from a password.
 */
export async function deriveEd25519Seed(masterKey: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;
  return masterKey.slice(0, 32);
}

/**
 * Create a recovery phrase from a master key.
 * Uses hex encoding for simplicity (production should use BIP39).
 */
export function keyToRecoveryPhrase(key: Uint8Array): string {
  return sodium.to_hex(key);
}

/**
 * Reconstruct a key from a recovery phrase.
 */
export function recoveryPhraseToKey(phrase: string): Uint8Array {
  return sodium.from_hex(phrase);
}
