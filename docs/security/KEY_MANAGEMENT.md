# Key Management

## Environment-based configuration

The application expects these server-side variables to be set through the hosting provider's secret manager:

- `REGISTRATION_ENCRYPTION_PUBLIC_KEY`
- `REGISTRATION_ENCRYPTION_PRIVATE_KEY`
- `REGISTRATION_ENCRYPTION_KEY_ID`
- `DOCUMENT_ENCRYPTION_PUBLIC_KEY`
- `DOCUMENT_ENCRYPTION_PRIVATE_KEY`
- `DOCUMENT_ENCRYPTION_KEY_ID`

The public-key endpoint exposes only the public keys to browser clients. Private keys remain server-side only.

## Rotation guidance

1. Generate a new key pair in the host secret manager.
2. Publish the new public key to the browser-facing public-key endpoint.
3. Keep the previous private key available only for in-flight requests that are still being processed.
4. Switch the application to the new key ID only after validation and rollout.
5. Retire old keys once outstanding encrypted requests are complete.

## Important note

Rotating keys does not automatically invalidate already-issued encrypted requests. Old requests remain valid only while the corresponding private key remains available to the server and the application still needs to process retried or pending operations.
