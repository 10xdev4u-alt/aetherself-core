/**
 * AetherSelf — key generation and management.
 *
 * Users are identified by an Ed25519 key pair.
 * The public key becomes their DID: did:aetherself:<base64url(publicKey)>
 */

import sodium from "./sodium.js";

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  keyType: "ed25519";
}

/**
 * Generate a new Ed25519 key pair for a user's identity.
 */
export async function generateKeyPair(): Promise<KeyPair> {
  await sodium.ready;
  const keyPair = sodium.crypto_sign_keypair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    keyType: "ed25519",
  };
}

/**
 * Encode a public key as a base64url string for DID creation.
 */
export function encodePublicKey(publicKey: Uint8Array): string {
  return sodium.to_base64(publicKey);
}

/**
 * Decode a base64url-encoded public key back to bytes.
 */
export function decodePublicKey(encoded: string): Uint8Array {
  return sodium.from_base64(encoded);
}

/**
 * Derive a DID string from a public key.
 */
export function publicKeyToDid(publicKey: Uint8Array): string {
  const b64 = encodePublicKey(publicKey);
  return `did:aetherself:${b64}`;
}

/**
 * Extract public key bytes from a DID string.
 */
export function didToPublicKey(did: string): Uint8Array {
  const prefix = "did:aetherself:";
  if (!did.startsWith(prefix)) {
    throw new Error(`Invalid DID: ${did}`);
  }
  const b64 = did.slice(prefix.length);
  return decodePublicKey(b64);
}

/**
 * Sign a message with a private key (Ed25519).
 * Returns the signature as a base64 string.
 */
export async function sign(
  message: Uint8Array,
  privateKey: Uint8Array,
): Promise<string> {
  await sodium.ready;
  const signature = sodium.crypto_sign_detached(message, privateKey);
  return sodium.to_base64(signature);
}

/**
 * Verify a signed message.
 */
export async function verify(
  message: Uint8Array,
  signature: string,
  publicKey: Uint8Array,
): Promise<boolean> {
  await sodium.ready;
  const sigBytes = sodium.from_base64(signature);
  return sodium.crypto_sign_verify_detached(sigBytes, message, publicKey);
}
