/**
 * AetherSelf — key derivation from passwords and seeds.
 *
 * Uses Argon2id (via libsodium) for password-based key derivation,
 * and HKDF-like patterns for deriving sub-keys from the master.
 */

import sodium from "libsodium-wrappers";

export const SALT_BYTES = 32;
export const KEY_BYTES = 32;

/**
 * Generate a random salt for key derivation.
 */
export async function generateSalt(): Promise<Uint8Array> {
  await sodium.ready;
  return sodium.randombytes_buf(SALT_BYTES);
}

/**
 * Derive a 32-byte symmetric key from a password using Argon2id.
 *
 * @param password - The user's password or passphrase
 * @param salt - 32-byte random salt
 * @returns 32-byte derived key
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  await sodium.ready;

  const opsLimit = sodium.crypto_pwhash_OPSLIMIT_MODERATE;
  const memLimit = sodium.crypto_pwhash_MEMLIMIT_MODERATE;
  const algo = sodium.crypto_pwhash_ALG_ARGON2ID13;

  return sodium.crypto_pwhash(
    KEY_BYTES,
    password,
    salt,
    opsLimit,
    memLimit,
    algo,
  );
}

/**
 * Derive an Ed25519 seed from a master key.
 * This allows deterministic key pair generation from a password.
 */
export async function deriveEd25519Seed(masterKey: Uint8Array): Promise<Uint8Array> {
  await sodium.ready;

  // Use the first 32 bytes of the master key as a seed for key generation
  // In production this should use a proper KDF (HKDF)
  return masterKey.slice(0, 32);
}

/**
 * Create a recovery phrase (BIP39-like) from a master key.
 * Returns a space-separated list of words from a fixed wordlist.
 *
 * NOTE: This is a simplified version. A production implementation
 * should use a proper BIP39 wordlist and encoding.
 */
export async function keyToRecoveryPhrase(
  key: Uint8Array,
): Promise<string> {
  await sodium.ready;
  return sodium.to_hex(key);
}

/**
 * Reconstruct a key from a recovery phrase.
 */
export async function recoveryPhraseToKey(
  phrase: string,
): Promise<Uint8Array> {
  await sodium.ready;
  return sodium.from_hex(phrase);
}
