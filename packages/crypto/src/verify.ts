import sodium from "./sodium.js";
export async function hashPassword(password: string): Promise<string> {
  await sodium.ready;
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const hash = sodium.crypto_pwhash_str(password, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE);
  return hash;
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  await sodium.ready;
  return sodium.crypto_pwhash_str_verify(hash, password);
}
