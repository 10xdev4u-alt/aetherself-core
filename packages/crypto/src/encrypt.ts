/**
 * AetherSelf — symmetric encryption using XChaCha20-Poly1305.
 *
 * This is the core encryption primitive for user data.
 * Every field in the identity graph is encrypted with this.
 */

import sodium from "libsodium-wrappers";

export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded nonce (24 bytes for XChaCha20) */
  nonce: string;
  /** Encryption algorithm identifier */
  algorithm: "xchacha20-poly1305";
}

/**
 * Encrypt data using XChaCha20-Poly1305.
 *
 * @param plaintext - UTF-8 string to encrypt
 * @param key - 32-byte symmetric key
 * @returns Encrypted payload with ciphertext and nonce
 */
export async function encrypt(
  plaintext: string,
  key: Uint8Array,
): Promise<EncryptedPayload> {
  await sodium.ready;

  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
  );
  const additionalData = new Uint8Array(0); // no AAD for basic use

  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    additionalData,
    null, // secret nonce (not used)
    nonce,
    key,
  );

  return {
    ciphertext: sodium.to_base64(ciphertext),
    nonce: sodium.to_base64(nonce),
    algorithm: "xchacha20-poly1305",
  };
}

/**
 * Decrypt data that was encrypted with XChaCha20-Poly1305.
 *
 * @param payload - The encrypted payload
 * @param key - 32-byte symmetric key
 * @returns Decrypted UTF-8 string
 */
export async function decrypt(
  payload: EncryptedPayload,
  key: Uint8Array,
): Promise<string> {
  await sodium.ready;

  const ciphertext = sodium.from_base64(payload.ciphertext);
  const nonce = sodium.from_base64(payload.nonce);
  const additionalData = new Uint8Array(0);

  const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, // secret nonce (not used)
    ciphertext,
    additionalData,
    nonce,
    key,
  );

  return sodium.to_string(plaintext);
}

/**
 * Generate a random 32-byte symmetric key.
 */
export async function generateSymmetricKey(): Promise<Uint8Array> {
  await sodium.ready;
  return sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
  );
}
