/**
 * Example: Basic AetherSelf usage
 *
 * Run: npx tsx examples/basic-usage.ts
 */
import { AetherSelfClient } from "../packages/client/src/index.js";

async function main() {
  const client = new AetherSelfClient();

  // Check health
  const health = await client.health();
  console.log("Health:", health);

  // Get well-known info
  const info = await client.wellKnown();
  console.log("Protocol version:", info.version);
  console.log("Capabilities:", info.capabilities);

  // Set a preference (requires auth in real usage)
  try {
    await client.setPreference("theme", "dark", "ui");
    console.log("Preference set!");
  } catch (e) {
    console.log("Not authenticated — run 'aetherself init' and 'aetherself serve' first");
  }
}

main().catch(console.error);
