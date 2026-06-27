# AetherSelf — Protocol Specification v0.1

## Vision
Your identity layer for the AI era. A portable, encrypted, user-owned context that travels with you across every AI application. You are not a stranger to AI anymore.

## Core Concepts

### The Self
A user's complete AI identity — a structured graph of who they are, what they know, how they think, and who they relate to.

```
Self
├── Identity        → who you are (name, bio, voice, avatar)
├── Preferences     → taste, style, values, pet peeves
├── Context         → what you're doing right now (cross-device)
├── Relationships   → people/entities and how you relate
└── Memory          → learned facts, decisions, history
```

### DID (Decentralized Identifier)
Each Self is identified by a `did:aetherself:<public-key-hash>`. No blockchain needed — the DID resolves to the user's server endpoint via a simple lookup.

### Zero-Knowledge Encryption
All data is encrypted client-side with XChaCha20-Poly1305 (via libsodium.js). The sync relay sees only encrypted blobs. The user holds the only key.

## Protocol Flow

### 1. Discovery
```
GET /.well-known/aetherself
→ { version: "0.1", server: "did:aetherself:abc123...", capabilities: [...] }
```

### 2. Authentication (Challenge-Response)
```
Client → Server: HELLO { publicKey }
Server → Client: CHALLENGE { nonce, timestamp }
Client → Server: RESPONSE { signature(nonce) }
Server → Client: SESSION { token, expiresAt }
```

### 3. Identity Operations (within session)
```
POST /v1/identity/read   → returns identity graph (encrypted)
POST /v1/identity/write  → writes identity graph (encrypted)
POST /v1/memory/append   → appends to memory
POST /v1/memory/query    → semantic memory search
POST /v1/context/update  → updates current context
POST /v1/context/read    → reads current context
```

### 4. Sync (via WebSocket + Yjs CRDT)
Real-time sync across devices uses Yjs CRDT over WebSocket. The sync relay is zero-knowledge — all payloads are encrypted before syncing.

## Encryption Scheme

### Key Hierarchy
```
Master Key (user's password / biometric)
    ↓ PBKDF2 (Argon2id)
Identity Key (Ed25519 key pair for auth/signing)
    ↓ HKDF
Symmetric Key (XChaCha20-Poly1305 for data encryption)
```

### Data at Rest
Each field is individually encrypted with AEAD. The structure itself is public (field names), but values are opaque ciphertexts.

### Data in Transit
TLS 1.3 + encrypted payloads. Double-wrapped security.

## Technical Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Encryption | libsodium.js (XChaCha20-Poly1305 + Argon2id) | Battle-tested, works browser+Node |
| Identity | Custom DID (`did:aetherself:`) | Lightweight, no blockchain |
| Sync | Yjs CRDT | 22K ★, best-in-class, offline-first |
| Transport | HTTP REST + WebSocket | Universal, simple |
| Local storage | SQLite (better-sqlite3 / OPFS) | Reliable, embedded |
| SDK format | TypeScript + ESM | Portable, typed |

## Competitive Landscape (June 2026)

| Project | Stars | Focus | Gap |
|---------|-------|-------|-----|
| squash-browser-memory | 30 | Browser memory layer | Dev-only, no identity |
| relayBrain | 6 | Portable memory for agents | Agent-only, no identity |
| identity-profile-extractor | 2 | Context profile | One-time, no sync |
| ID | 1 | Profile + contract | Minimal, no encryption |
| **AetherSelf** | — | Identity + Memory + Encryption + Sync | **Full stack** |

The space is wide open. No project combines portable identity, zero-knowledge encryption, and cross-AI portability.

## Key Design Decisions

1. **Identity-first, not memory-first** — Memory is a feature of identity, not the product
2. **Encrypted by default** — Privacy is not optional, it's architectural
3. **Local-first with optional sync** — Works offline, syncs when possible
4. **No blockchain** — DID doesn't need a chain; a simple key-based identifier suffices
5. **Protocol over platform** — The protocol is the product; anyone can implement a server
6. **Consumer-grade simplicity** — One command to start. "Sign in with Your Self" as the UX pattern

## MVP Scope (v0.1)

- [x] Protocol spec
- [ ] Core types & validation (Zod)
- [ ] Local key generation & storage
- [ ] Symmetric encryption (XChaCha20-Poly1305)
- [ ] Challenge-response auth
- [ ] REST server (Hono)
- [ ] SQLite persistence
- [ ] Identity CRUD
- [ ] Memory append + query
- [ ] CLI: `aetherself init`, `aetherself serve`
- [ ] Client SDK: basic operations
- [ ] Yjs sync relay
- [ ] Demo chat app
- [ ] Landing page

## Future (post-MVP)

- Web Crypto API fallback (no libsodium dependency needed)
- Biometric auth (WebAuthn)
- DID resolution via DNS/well-known
- Browser extension
- Mobile SDK (React Native)
- Federation protocol
- Plugin system for AI providers
