/**
 * `aetherself config` — View and manage configuration.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const AETHERSELF_DIR = join(homedir(), ".aetherself");
const CONFIG_FILE = join(AETHERSELF_DIR, "config.json");

interface Config {
  server: { port: number; host: string; dbPath: string };
  ui: { theme: "light" | "dark" };
}

const DEFAULT_CONFIG: Config = {
  server: { port: 4197, host: "127.0.0.1", dbPath: join(AETHERSELF_DIR, "aetherself.db") },
  ui: { theme: "dark" },
};

function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) };
}

export function configCmd(options: { get?: string; set?: string; value?: string }): void {
  mkdirSync(AETHERSELF_DIR, { recursive: true });
  const config = loadConfig();

  if (options.get) {
    const keys = options.get.split(".");
    let val: unknown = config;
    for (const k of keys) val = (val as Record<string, unknown>)?.[k];
    console.log(val ?? "(not set)");
    return;
  }

  if (options.set && options.value) {
    const keys = options.set.split(".");
    let obj: Record<string, unknown> = config as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]!;
      obj[k] = obj[k] ?? {};
      obj = obj[k] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]!] = options.value;
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`✅ Set ${options.set} = ${options.value}`);
    return;
  }

  console.log(JSON.stringify(config, null, 2));
}
