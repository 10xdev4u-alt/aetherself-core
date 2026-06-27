declare module "libsodium-wrappers" {
  const sodium: {
    ready: Promise<void>;
    crypto_sign_keypair(): { publicKey: Uint8Array; privateKey: Uint8Array };
    crypto_sign_detached(message: Uint8Array, privateKey: Uint8Array): Uint8Array;
    crypto_sign_verify_detached(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean;
    crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: number;
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES: number;
    crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintext: string | Uint8Array, additionalData: Uint8Array,
      secretNonce: Uint8Array | null, nonce: Uint8Array, key: Uint8Array,
    ): Uint8Array;
    crypto_aead_xchacha20poly1305_ietf_decrypt(
      secretNonce: Uint8Array | null, ciphertext: Uint8Array,
      additionalData: Uint8Array, nonce: Uint8Array, key: Uint8Array,
    ): Uint8Array;
    randombytes_buf(length: number): Uint8Array;
    to_base64(input: Uint8Array): string;
    from_base64(input: string): Uint8Array;
    to_hex(input: Uint8Array): string;
    from_hex(input: string): Uint8Array;
    to_string(input: Uint8Array): string;
  };
  export default sodium;
}
