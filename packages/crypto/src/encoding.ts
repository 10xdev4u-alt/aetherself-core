import sodium from "./sodium.js";
export function toBase64(bytes: Uint8Array): string { return sodium.to_base64(bytes); }
export function fromBase64(str: string): Uint8Array { return sodium.from_base64(str); }
export function toHex(bytes: Uint8Array): string { return sodium.to_hex(bytes); }
export function fromHex(str: string): Uint8Array { return sodium.from_hex(str); }
export function toUtf8(str: string): Uint8Array { return new TextEncoder().encode(str); }
export function fromUtf8(bytes: Uint8Array): string { return new TextDecoder().decode(bytes); }
