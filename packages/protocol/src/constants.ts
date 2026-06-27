/**
 * AetherSelf — Constants and configuration.
 */

/** Default server port (4-1-9-7 = A-E-S) */
export const DEFAULT_PORT = 4197;

/** Default host */
export const DEFAULT_HOST = "127.0.0.1";

/** Default database path */
export const DEFAULT_DB_PATH = "./aetherself.db";

/** Session TTL (1 hour) */
export const SESSION_TTL_MS = 3_600_000;

/** Challenge TTL (1 minute) */
export const CHALLENGE_TTL_MS = 60_000;

/** Rate limit window (1 minute) */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Max requests per window */
export const RATE_LIMIT_MAX = 100;

/** PBKDF2 iterations for key derivation */
export const PBKDF2_ITERATIONS = 600_000;

/** Key length in bytes */
export const KEY_BYTES = 32;

/** Salt length in bytes */
export const SALT_BYTES = 32;
