export { generateKeyPair, encodePublicKey, decodePublicKey, publicKeyToDid, didToPublicKey, sign, verify } from "./keys.js";
export type { KeyPair } from "./keys.js";
export { encrypt, decrypt, generateSymmetricKey } from "./encrypt.js";
export type { EncryptedPayload } from "./encrypt.js";
export { generateSalt, deriveKeyFromPassword, deriveEd25519Seed, keyToRecoveryPhrase, recoveryPhraseToKey, SALT_BYTES, KEY_BYTES } from "./kdf.js";
