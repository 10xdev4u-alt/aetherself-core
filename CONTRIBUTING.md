# Contributing to AetherSelf

Thanks for your interest in contributing!

## Setup

```bash
git clone https://github.com/10xdev4u-alt/aetherself-core.git
cd aetherself-core
pnpm install
pnpm test
```

## Development

- **Test**: `pnpm test`
- **Typecheck**: `pnpm run typecheck`
- **Build**: `pnpm run build`

## Commit Style

We use Conventional Commits:

```
feat(scope): add new feature
fix(scope): fix bug
docs: update documentation
test: add tests
chore: maintenance
```

## Package Structure

- `packages/protocol` — Zod schemas and types
- `packages/crypto` — Encryption primitives
- `packages/server` — REST server
- `packages/client` — Client SDK
- `packages/cli` — CLI tool

## License

MIT
