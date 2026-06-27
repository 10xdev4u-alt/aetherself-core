import { DEFAULT_PORT, DEFAULT_HOST } from "@aetherself/protocol";
export interface AppConfig { port: number; host: string; dbPath: string; logLevel: string; }
export const defaultConfig: AppConfig = { port: DEFAULT_PORT, host: DEFAULT_HOST, dbPath: "./aetherself.db", logLevel: "info" };
export function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig { return { ...defaultConfig, ...overrides }; }
