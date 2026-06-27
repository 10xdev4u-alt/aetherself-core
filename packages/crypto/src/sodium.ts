/**
 * AetherSelf — libsodium wrapper.
 *
 * Imports from a local CJS wrapper to avoid libsodium-wrappers'
 * broken ESM distribution. Works in Node + vitest.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const _sodium = require("../vendor/libsodium-wrapper.cjs") as typeof import("libsodium-wrappers").default;

export default _sodium;
