# Encryption Architecture

## Browser-side encryption

The browser encrypts:

- Registration metadata payloads before transmission.
- Each Aadhaar document as a separate AES-GCM payload before upload.

The browser uses a fresh AES-256-GCM key and nonce for each payload, then wraps the AES key with the server's RSA-OAEP public key for that purpose.

## Server-side decryption

The Next.js server decrypts only in memory after authenticated envelope verification. The server does not trust encrypted data merely because it was received from the browser. It validates the authenticated metadata, the key identifier, and the payload purpose before proceeding with the registration flow.

## Drive upload model

After decryption and validation, the server uploads the original content type (JPEG, PNG, or PDF) to the correct restricted family folder in Google Drive. The server does not upload encrypted `.enc` payloads to Drive and does not persist plaintext documents on the application server.

## Key separation

- Registration metadata uses the `registration-v1` key pair.
- Aadhaar document uploads use the `document-v1` key pair.

This keeps the metadata and document responsibilities separate, even though both use RSA-OAEP key wrapping with AES-GCM payload encryption.
