import { z } from "zod";
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
export const nonEmpty = z.string().min(1);
export const positiveInt = z.number().int().positive();
export function isValidDid(did: string): boolean { return /^did:aetherself:[A-Za-z0-9+/=_-]{20,100}$/.test(did); }
