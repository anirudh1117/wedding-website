# Module 02: Secure Google Drive Integration

This module adds a **server-only Google Drive integration boundary** for wedding registration documents.

## What is implemented

- Server-only Drive client creation and env validation.
- Root folder validation and side-folder provisioning:
  - Groom
  - Bride
- Family folder create-or-reuse strategy using a stable registration ID in folder name.
- Typed upload path that only accepts encrypted bytes.
- Encryption boundary enforcement:
  - If encryption service is not configured, uploads are blocked.
- Typed, sanitized error handling for Drive and integration failures.
- Unit tests with mocked Drive client behavior.

## What is intentionally pending

- Production-grade persistent operation store (database/transactional KV).
- Real encryption provider and key-management integration.
- End-to-end raw file transport from browser upload to secure server bytes pipeline.
- Google Sheets integration (Module 03).

## Required environment variables

Define these server-side variables (see [.env.example](.env.example)):

- GOOGLE_SERVICE_ACCOUNT_EMAIL
- GOOGLE_PRIVATE_KEY
- GOOGLE_DRIVE_ROOT_FOLDER_ID

Do not expose these values to client-side code and do not use NEXT_PUBLIC_ prefixes.

## Google Cloud setup

1. Create a dedicated Google Cloud project for the wedding app.
2. Enable Google Drive API in that project.
3. Create a service account for backend document storage operations.
4. Generate and store service-account credentials securely as environment variables.
5. Create or select an existing Drive root folder for wedding documents.
6. Share only the intended root folder with the service account email.
7. Verify service account can:
   - Read the root folder
   - Create subfolders
   - Upload files under those subfolders

Notes:
- Service accounts do not automatically have access to personal My Drive files unless explicitly shared.
- Do not create public links or permissions such as `anyone`.

## Drive permissions and privacy

- Folder/file creation uses private defaults.
- No `anyone` sharing permissions are applied.
- Internal Drive IDs are not returned to guests.

## Encryption prerequisites

Aadhaar uploads are disabled unless an encryption service is configured.

Expected contract:
- Input: plaintext bytes + MIME + registration/guest context
- Output: encrypted bytes + encryption version metadata
- Cipher: authenticated encryption via vetted cryptography
- Keys: server-side key management, never in Drive metadata/client bundle

## Testing

Run tests:

```bash
npm run test
```

Run lint/type/build:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Controlled synthetic test guidance

- Use synthetic non-sensitive files only (dummy JPEG/PNG/PDF bytes).
- Never use real Aadhaar documents in local or CI tests.
- Use mocked Drive clients for unit tests; avoid real credentials in automated runs.

## Known consistency limitations and production prerequisites

- Drive name-based search + create is not fully race-proof for concurrent writes.
- Reliable idempotency requires persistent operation metadata and a lock/compare-and-set strategy.
- In-memory operation store is development-only and not suitable for serverless multi-instance production.
- Before production, implement:
  - durable operation store
  - concurrency lock strategy
  - full encrypted file ingress path
  - reconciliation tooling for partial failures
