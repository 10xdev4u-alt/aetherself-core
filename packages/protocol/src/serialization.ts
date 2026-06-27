import type { AetherSelf } from "./types.js";
export function serialize(self: AetherSelf): string { return JSON.stringify(self, null, 2); }
export function deserialize(json: string): AetherSelf { return JSON.parse(json) as AetherSelf; }
export function encode(self: AetherSelf): Uint8Array { return new TextEncoder().encode(serialize(self)); }
export function decode(bytes: Uint8Array): AetherSelf { return deserialize(new TextDecoder().decode(bytes)); }
