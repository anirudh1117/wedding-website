# Threat Model

This application handles guest identity documents and family registration contact data during a short-term wedding registration flow. The security model assumes that public endpoints are reachable by anyone, but that browser and server code remain under the ownership of the host and authorized backend operators.

## Assets

- Registration metadata: wedding party, family name, contact number, guest names.
- Aadhaar/JPEG/PNG/PDF guest documents.
- Google Drive family folder hierarchy and storage permissions.
- Google Sheets registry values for approved readable fields only.
- Telegram notifications to host-owned chat IDs.

## Primary threats

- Network interception of plaintext request data.
- Credential leakage from browser JavaScript bundles.
- Client-side tampering with upload metadata or document handling.
- Unauthenticated or malicious API requests.
- Replay of registration payloads or repeated upload attempts.
- Sensitive document content entering logs, URLs, or public storage.

## Security boundary

- Browsers encrypt registration metadata and each Aadhaar document before the upload reaches the server.
- The Next.js backend decrypts payloads in memory and validates the authenticated data before business processing.
- The server uploads original, authenticated document bytes to restricted Google Drive folders.
- The application keeps private keys server-side only and never exposes them to browser bundles.

## Remaining production prerequisites

- Real private keys in a secure host secret manager.
- Proper Cloudflare Turnstile secret validation in production.
- Correct Google Drive service-account configuration and a single-authorized human owner account.
- Deployment on HTTPS with security headers and configurable origin restrictions.
