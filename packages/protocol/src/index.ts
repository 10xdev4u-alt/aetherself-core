export {
  // ─── Schemas ───
  didSchema,
  identityProfileSchema,
  preferenceSchema,
  contextFrameSchema,
  relationshipSchema,
  memorySchema,
  aetherSelfSchema,
  helloMessageSchema,
  challengeMessageSchema,
  responseMessageSchema,
  sessionSchema,
  identityReadResponseSchema,
  memoryAppendRequestSchema,
  memoryQueryRequestSchema,
  memoryQueryResponseSchema,

  // ─── Types ───
  type Did,
  type IdentityProfile,
  type Preference,
  type ContextFrame,
  type Relationship,
  type Memory,
  type AetherSelf,
  type Session,

  // ─── Constants ───
  PROTOCOL_VERSION,
  WELL_KNOWN_PATH,
  DID_PREFIX,
  DEFAULT_SESSION_TTL_MS,
  MAX_MEMORIES,
  MAX_PREFERENCES,
  MAX_CONTEXT_FRAMES,
  MAX_RELATIONSHIPS,

  // ─── Utils ───
  createDid,
  parseDid,
} from "./types.js";
