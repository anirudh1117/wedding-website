# API Security

## Server-side validation

Every public registration request is validated after decryption. The server verifies:

- Family name and contact details.
- Wedding party selection.
- Guest count and required metadata.
- Valid document MIME type and size.
- Validated AES-GCM envelope structure and AAD context.
- Matching purpose and key identifier.

## Turnstile

If `TURNSTILE_SECRET_KEY` is configured, the API validates the Turnstile token with Cloudflare before accepting the registration request. A missing or invalid token is rejected with a 403 response.

## Rate limiting

The application provides a rate-limiting boundary at the API layer and is designed to integrate with a distributed provider in production. The code currently requires a production provider or provider adapter for multi-instance protection; it does not silently rely on in-memory-only counters as the only control.

## CORS and origin controls

The application uses strict browser-side request handling and server-side enforcement of authenticated requests. Public endpoints assume hostile clients and reject malformed or unauthorized input. The deployment should keep CORS restricted to approved origins only.
