/**
 * `aetherself status` — Check daemon status.
 */

export async function statusCmd(): Promise<void> {
  const baseUrl = "http://127.0.0.1:4197";

  try {
    const res = await fetch(`${baseUrl}/.well-known/aetherself`, {
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const body = (await res.json()) as { version: string };
      console.log(`✅ AetherSelf daemon is running (v${body.version})`);
      console.log(`   ${baseUrl}`);
    } else {
      console.log("⚠️  Daemon responded with error:", res.status);
    }
  } catch {
    console.log("❌ AetherSelf daemon is NOT running");
    console.log("   Start it with: aetherself serve");
  }
}
