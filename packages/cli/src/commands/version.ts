/**
 * `aetherself version` — Show version info.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export function versionCmd(): void {
  try {
    const pkg = require("../package.json") as { version: string; name: string };
    console.log(`${pkg.name} v${pkg.version}`);
  } catch {
    console.log("aetherself-cli v0.1.0");
  }
}
