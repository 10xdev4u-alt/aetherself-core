import sodium from "./sodium.js";
export async function randomBytes(n: number): Promise<Uint8Array> { await sodium.ready; return sodium.randombytes_buf(n); }
export async function randomId(): Promise<string> { await sodium.ready; return sodium.to_base64(sodium.randombytes_buf(16)); }
