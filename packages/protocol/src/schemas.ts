/**
 * AetherSelf — JSON schema export for protocol types.
 */
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  didSchema,
  identityProfileSchema,
  preferenceSchema,
  contextFrameSchema,
  relationshipSchema,
  memorySchema,
  aetherSelfSchema,
} from "./types.js";

export function getJsonSchemas() {
  return {
    did: zodToJsonSchema(didSchema),
    identityProfile: zodToJsonSchema(identityProfileSchema),
    preference: zodToJsonSchema(preferenceSchema),
    contextFrame: zodToJsonSchema(contextFrameSchema),
    relationship: zodToJsonSchema(relationshipSchema),
    memory: zodToJsonSchema(memorySchema),
    aetherSelf: zodToJsonSchema(aetherSelfSchema),
  };
}
