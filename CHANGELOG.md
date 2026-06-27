# Changelog

## 0.1.0 (2026-06-27)

### Features

- **protocol**: Zod schemas for DID, identity, preferences, context, relationships, memory
- **crypto**: Ed25519 key generation, XChaCha20-Poly1305 encryption, PBKDF2 KDF
- **server**: Hono REST server with SQLite storage, challenge-response auth
- **server**: CRUD routes for identity, memory, context, relationships, preferences
- **server**: Health check endpoint, well-known discovery
- **cli**: Commands: init, serve, status, identity, export, import, whoami, memory, context, config, backup, keys
- **ci**: GitHub Actions workflow
