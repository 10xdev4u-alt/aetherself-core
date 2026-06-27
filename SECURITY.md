# Security Policy

## Reporting

If you find a security vulnerability, please report it to security@aetherself.dev.

## Encryption

- All user data is encrypted client-side with XChaCha20-Poly1305
- Keys are derived using PBKDF2-SHA512 with 600K iterations
- The server never sees plaintext data
- Sessions use cryptographically random tokens

## Best Practices

- Keep your private key secure
- Use a strong password for key derivation
- Don't share your recovery phrase
