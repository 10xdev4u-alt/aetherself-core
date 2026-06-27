/**
 * AetherSelf — Server entry point.
 *
 * A local-first REST daemon for managing your AI identity.
 * Run with: npx tsx packages/server/src/index.ts
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Storage } from "./storage.js";
import { wellKnownRouter } from "./routes/well-known.js";
import { healthRouter } from "./routes/health.js";
import { createAuthRouter } from "./routes/auth.js";
import { createIdentityRouter } from "./routes/identity.js";
import { createMemoryRouter } from "./routes/memory.js";
import { createContextRouter } from "./routes/context.js";
import { createRelationshipRouter } from "./routes/relationships.js";
import { createPreferenceRouter } from "./routes/preferences.js";
import { createAuthMiddleware } from "./middleware/auth.js";
import { rateLimiter } from "./middleware/rate-limit.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export interface ServerConfig {
  port: number;
  dbPath: string;
  host?: string;
}

const DEFAULT_CONFIG: ServerConfig = {
  port: 4197, // 4-1-9-7 = A-E-S (AetherSelf)
  dbPath: "./aetherself.db",
  host: "127.0.0.1",
};

/**
 * Create and configure the AetherSelf server.
 */
export function createServer(config: Partial<ServerConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const storage = new Storage(cfg.dbPath);
  const app = new Hono();

  // Middleware
  app.use("*", cors());
  app.use("*", requestLogger);
  app.use("*", rateLimiter);
  app.use("*", errorHandler);
  app.use("*", createAuthMiddleware(storage));

  // Routes
  app.route("/", healthRouter);
  app.route("/", wellKnownRouter);
  app.route("/", createAuthRouter(storage));
  app.route("/", createIdentityRouter(storage));
  app.route("/", createMemoryRouter(storage));
  app.route("/", createContextRouter(storage));
  app.route("/", createRelationshipRouter(storage));
  app.route("/", createPreferenceRouter(storage));

  // 404
  app.notFound(notFoundHandler);

  return { app, storage, config: cfg };
}

/**
 * Start the AetherSelf server.
 */
export function startServer(config: Partial<ServerConfig> = {}) {
  const { app, config: cfg } = createServer(config);

  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║       AetherSelf v0.1                ║`);
  console.log(`  ║  Your AI Identity Layer              ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  Server: http://${cfg.host}:${cfg.port}            ║`);
  console.log(`  ║  DB:     ${cfg.dbPath}              ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);

  serve({
    fetch: app.fetch,
    port: cfg.port,
    hostname: cfg.host,
  });

  return { app, config: cfg };
}

// Run directly if this is the entry point
const isMain = process.argv[1]?.endsWith("index.ts") ||
               process.argv[1]?.endsWith("index.js");
if (isMain) {
  startServer();
}
