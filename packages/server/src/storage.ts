/**
 * AetherSelf — SQLite storage layer.
 *
 * Uses Node.js built-in node:sqlite (available in Node 22+).
 * No native compilation needed.
 */

import { DatabaseSync } from "node:sqlite";
import type { Did, Memory } from "@aetherself/protocol";

interface IdentityRow {
  did: string;
  encrypted_payload: string;
  encrypted_at: number;
  created_at: number;
  updated_at: number;
}

export class Storage {
  private db: DatabaseSync;

  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode = WAL");
    this.db.exec("PRAGMA foreign_keys = ON");
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS identities (
        did TEXT PRIMARY KEY,
        encrypted_payload TEXT NOT NULL,
        encrypted_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        did TEXT NOT NULL,
        scopes TEXT NOT NULL DEFAULT 'identity:read,identity:write',
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        did TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        timestamp INTEGER NOT NULL,
        source TEXT,
        importance REAL NOT NULL DEFAULT 0.5
      );

      CREATE INDEX IF NOT EXISTS idx_memories_did ON memories(did);
      CREATE INDEX IF NOT EXISTS idx_sessions_did ON sessions(did);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    `);
  }

  // ─── Identity ────────────────────────────────────────────

  upsertIdentity(did: Did, encryptedPayload: string, encryptedAt: number): void {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO identities (did, encrypted_payload, encrypted_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(did) DO UPDATE SET
        encrypted_payload = excluded.encrypted_payload,
        encrypted_at = excluded.encrypted_at,
        updated_at = excluded.updated_at
    `);
    stmt.run(did, encryptedPayload, encryptedAt, now, now);
  }

  getIdentity(did: Did): IdentityRow | undefined {
    const stmt = this.db.prepare("SELECT * FROM identities WHERE did = ?");
    return stmt.get(did) as IdentityRow | undefined;
  }

  deleteIdentity(did: Did): void {
    this.db.exec("BEGIN");
    try {
      this.db.prepare("DELETE FROM memories WHERE did = ?").run(did);
      this.db.prepare("DELETE FROM sessions WHERE did = ?").run(did);
      this.db.prepare("DELETE FROM identities WHERE did = ?").run(did);
      this.db.exec("COMMIT");
    } catch {
      this.db.exec("ROLLBACK");
      throw new Error("Failed to delete identity");
    }
  }

  // ─── Sessions ────────────────────────────────────────────

  createSession(token: string, did: Did, scopes: string[], ttlMs: number): void {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO sessions (token, did, scopes, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(token, did, scopes.join(","), now + ttlMs, now);
  }

  getSession(token: string): { token: string; did: string; scopes: string; expires_at: number } | undefined {
    const stmt = this.db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > ?");
    return stmt.get(token, Date.now()) as any;
  }

  deleteSession(token: string): void {
    this.db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }

  cleanupExpiredSessions(): void {
    this.db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  }

  // ─── Memories ────────────────────────────────────────────

  insertMemory(memory: Memory, did: Did): void {
    const stmt = this.db.prepare(`
      INSERT INTO memories (id, did, type, content, tags, timestamp, source, importance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      memory.id,
      did,
      memory.type,
      memory.content,
      JSON.stringify(memory.tags),
      memory.timestamp,
      memory.source ?? null,
      memory.importance,
    );
  }

  queryMemories(did: Did, query: string, limit: number): Memory[] {
    const stmt = this.db.prepare(`
      SELECT id, type, content, tags, timestamp, source, importance
      FROM memories
      WHERE did = ?
        AND (content LIKE ? OR tags LIKE ?)
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const pattern = `%${query}%`;
    const rows = stmt.all(did, pattern, pattern, limit) as Array<{
      id: string;
      type: string;
      content: string;
      tags: string;
      timestamp: number;
      source: string | null;
      importance: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      type: row.type as Memory["type"],
      content: row.content,
      tags: JSON.parse(row.tags) as string[],
      timestamp: row.timestamp,
      source: row.source ?? undefined,
      importance: row.importance,
    }));
  }

  // ─── Maintenance ─────────────────────────────────────────

  close(): void {
    this.db.close();
  }
}
