# Security Testing

This project includes a dedicated encryption regression suite that runs under Vitest and checks the core behavior of the hardened crypto layer:

- Metadata encryption and decryption round trip
- Aadhaar document AES-GCM round trip
- Tampering rejection
- Wrong-key rejection
- Authentication-tag rejection
- Envelope structure checks

The test suite uses generated key material and synthetic document inputs only. It does not use real Aadhaar identities or production secrets.
