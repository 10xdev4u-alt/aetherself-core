#!/usr/bin/env node

/**
 * AetherSelf CLI — Manage your AI identity from the terminal.
 *
 * Usage:
 *   aetherself init         Create a new identity
 *   aetherself serve        Start the local daemon
 *   aetherself identity     Show current identity
 *   aetherself export       Export identity as JSON
 *   aetherself import       Import identity from JSON
 *   aetherself status       Check daemon status
 */

import { Command } from "commander";
import {
  initCmd,
  serveCmd,
  identityCmd,
  exportCmd,
  importCmd,
  statusCmd,
} from "./commands/index.js";
import { memoryCmd } from "./commands/memory.js";
import { whoamiCmd } from "./commands/whoami.js";
import { contextCmd } from "./commands/context.js";
import { configCmd } from "./commands/config.js";
import { backupCmd } from "./commands/backup.js";
import { keysCmd } from "./commands/keys.js";
import { recoveryCmd } from "./commands/recovery.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const program = new Command();

program
  .name("aetherself")
  .description("Your AI Identity Layer — portable, encrypted, user-owned")
  .version(pkg.version);

program
  .command("init")
  .description("Create a new AetherSelf identity (generates key pair)")
  .option("-p, --password <password>", "Protect identity with password")
  .action(initCmd);

program
  .command("serve")
  .description("Start the local AetherSelf daemon")
  .option("-p, --port <port>", "Port to listen on", "4197")
  .option("--db <path>", "Path to SQLite database", "./aetherself.db")
  .option("--host <host>", "Host to bind to", "127.0.0.1")
  .action(serveCmd);

program
  .command("identity")
  .description("Show current identity information")
  .option("--did-only", "Print only the DID")
  .action(identityCmd);

program
  .command("export")
  .description("Export identity as encrypted JSON")
  .option("-o, --output <file>", "Output file path", "aetherself-export.json")
  .action(exportCmd);

program
  .command("import")
  .description("Import identity from encrypted JSON")
  .argument("<file>", "Path to the export file")
  .action(importCmd);

program
  .command("status")
  .description("Check if the local daemon is running")
  .action(statusCmd);

program
  .command("whoami")
  .description("Show current identity info")
  .action(whoamiCmd);

program
  .command("memory")
  .description("Query and manage memories")
  .option("-q, --query <query>", "Search query")
  .option("-l, --limit <limit>", "Max results", "20")
  .action(memoryCmd);

program
  .command("context")
  .description("Manage current context")
  .option("-s, --set <activity>", "Set current activity")
  .option("-l, --list", "List active contexts")
  .action(contextCmd);

program
  .command("config")
  .description("View and manage configuration")
  .option("-g, --get <key>", "Get config value (dot notation)")
  .option("-s, --set <key>", "Set config value")
  .option("-v, --value <value>", "Value to set")
  .action(configCmd);

program
  .command("backup")
  .description("Export encrypted backup")
  .option("-o, --output <file>", "Output file path")
  .action(backupCmd);

program
  .command("keys")
  .description("Show key information")
  .action(keysCmd);

program
  .command("recovery")
  .description("Show recovery phrase")
  .action(recoveryCmd);

program.parse(process.argv);
