import { describe, it, expect } from "vitest";
import {
  generateKeyPair,
  encodePublicKey,
  decodePublicKey,
  publicKeyToDid,
  didToPublicKey,
  sign,
  verify,
} from "../src/keys.js";
import {
  encrypt,
  decrypt,
  generateSymmetricKey,
} from "../src/encrypt.js";
import {
  generateSalt,
  deriveKeyFromPassword,
} from "../src/kdf.js";

describe("keys", () => {
  it("generates a valid Ed25519 key pair", async () => {
    const kp = await generateKeyPair();
    expect(kp.publicKey).toHaveLength(32);
    expect(kp.privateKey).toHaveLength(64);
    expect(kp.keyType).toBe("ed25519");
  });

  it("encodes and decodes public keys via base64", async () => {
    const kp = await generateKeyPair();
    const encoded = encodePublicKey(kp.publicKey);
    expect(encoded).toBeTypeOf("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodePublicKey(encoded);
    expect(new Uint8Array(decoded)).toEqual(kp.publicKey);
  });

  it("creates a valid DID from a public key", async () => {
    const kp = await generateKeyPair();
    const did = publicKeyToDid(kp.publicKey);
    expect(did).toMatch(/^did:aetherself:[A-Za-z0-9+\/=_-]+$/);
  });

  it("round-trips DID to public key", async () => {
    const kp = await generateKeyPair();
    const did = publicKeyToDid(kp.publicKey);
    const recovered = didToPublicKey(did);
    expect(new Uint8Array(recovered)).toEqual(kp.publicKey);
  });

  it("throws on invalid DID format", () => {
    expect(() => didToPublicKey("did:eth:abc123")).toThrow("Invalid DID");
  });

  it("signs and verifies messages", async () => {
    const kp = await generateKeyPair();
    const message = new TextEncoder().encode("hello aetherself");
    const signature = await sign(message, kp.privateKey);

    expect(signature).toBeTypeOf("string");
    expect(signature.length).toBeGreaterThan(0);

    const isValid = await verify(message, signature, kp.publicKey);
    expect(isValid).toBe(true);
  });

  it("rejects tampered messages", async () => {
    const kp = await generateKeyPair();
    const message = new TextEncoder().encode("original");
    const signature = await sign(message, kp.privateKey);

    const tampered = new TextEncoder().encode("tampered");
    const isValid = await verify(tampered, signature, kp.publicKey);
    expect(isValid).toBe(false);
  });
});

describe("encryption", () => {
  it("encrypts and decrypts a string", async () => {
    const key = await generateSymmetricKey();
    const original = "This is my private identity data";

    const encrypted = await encrypt(original, key);
    expect(encrypted.ciphertext).toBeTypeOf("string");
    expect(encrypted.nonce).toBeTypeOf("string");
    expect(encrypted.algorithm).toBe("xchacha20-poly1305");

    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertexts for same plaintext (nonce randomization)", async () => {
    const key = await generateSymmetricKey();
    const plaintext = "same data";

    const a = await encrypt(plaintext, key);
    const b = await encrypt(plaintext, key);

    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.nonce).not.toBe(b.nonce);
  });

  it("fails to decrypt with wrong key", async () => {
    const key1 = await generateSymmetricKey();
    const key2 = await generateSymmetricKey();
    const encrypted = await encrypt("secret", key1);

    await expect(decrypt(encrypted, key2)).rejects.toThrow();
  });

  it("handles empty strings", async () => {
    const key = await generateSymmetricKey();
    const encrypted = await encrypt("", key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe("");
  });

  it("handles unicode and emoji", async () => {
    const key = await generateSymmetricKey();
    const original = "🔥 AetherSelf 🚀 — 你好, 世界! 🌍";
    const encrypted = await encrypt(original, key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toBe(original);
  });
});

describe("key derivation", () => {
  it("generates a salt of correct length", () => {
    const salt = generateSalt();
    expect(salt).toHaveLength(32);
  });

  it("derives a 32-byte key from a password", () => {
    const salt = generateSalt();
    const key = deriveKeyFromPassword("correct-horse-battery-staple", salt);
    expect(key).toHaveLength(32);
  });

  it("produces different keys with different salts", () => {
    const password = "same-password";
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    const key1 = deriveKeyFromPassword(password, salt1);
    const key2 = deriveKeyFromPassword(password, salt2);

    expect(key1).not.toEqual(key2);
  });

  it("produces the same key with the same password and salt", () => {
    const password = "deterministic-test";
    const salt = generateSalt();

    const key1 = deriveKeyFromPassword(password, salt);
    const key2 = deriveKeyFromPassword(password, salt);

    expect(key1).toEqual(key2);
  });
});
