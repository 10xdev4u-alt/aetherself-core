import crypto from "node:crypto";
export function generateToken(): string { return crypto.randomBytes(32).toString("hex"); }
export function generateId(): string { return crypto.randomUUID(); }
export function hashKey(key: string): string { return crypto.createHash("sha256").update(key).digest("hex").slice(0, 16); }
