# AetherSelf

Your AI Identity Layer — portable, encrypted, user-owned.

## Quick Start

```bash
# Install
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## Packages

- `@aetherself/protocol` — Zod schemas and types
- `@aetherself/crypto` — Encryption primitives (Ed25519, XChaCha20)
- `@aetherself/server` — REST server (Hono + SQLite)
- `@aetherself/client` — Client SDK
- `@aetherself/cli` — CLI tool

## CLI Usage

```bash
# Create identity
aetherself init

# Start daemon
aetherself serve

# Check status
aetherself status

# Show identity
aetherself whoami
```

## Architecture

```
AI Apps ↔ Client SDK ↔ Local Daemon (SQLite) ↔ Encrypted Identity Graph
```

## License

MIT
