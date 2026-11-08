import { describe, expect, it } from "vitest";
import {
  buildEncryptedEnvelope,
  createEncryptionKeyPair,
  decryptAesGcm,
  decryptEncryptedEnvelope,
  encryptAesGcm,
  fromBase64,
  toBase64,
} from "@/lib/security/encryption";

describe("security encryption primitives", () => {
  it(
    "round-trips metadata with AES-GCM and RSA wrapping",
    async () => {
      const keyPair = await createEncryptionKeyPair("registration-v1");
    const plaintext = JSON.stringify({
      weddingParty: "groom",
      familyName: "Sharma",
      contactNumber: "+919876543210",
      guests: [{ fullName: "Rahul Sharma" }],
      metadata: { submittedAtIso: "2026-10-31T10:00:00.000Z", source: "family-registration-form" },
    });

    const envelope = await buildEncryptedEnvelope({
      purpose: "registration",
      keyId: keyPair.keyId,
      payload: new TextEncoder().encode(plaintext),
      publicKeyPem: keyPair.publicKeyPem,
      aad: JSON.stringify({ version: 1, purpose: "registration", keyId: keyPair.keyId }),
    });

    const decrypted = await decryptEncryptedEnvelope({
      envelope,
      privateKeyPem: keyPair.privateKeyPem,
      aad: JSON.stringify({ version: 1, purpose: "registration", keyId: keyPair.keyId }),
    });

      expect(new TextDecoder().decode(decrypted)).toBe(plaintext);
    },
    15000,
  );

  it(
    "rejects tampered ciphertext and wrong key usage",
    async () => {
      const keyPairA = await createEncryptionKeyPair("registration-v1");
    const keyPairB = await createEncryptionKeyPair("registration-v2");
    const payload = new TextEncoder().encode("secret metadata");

    const envelope = await buildEncryptedEnvelope({
      purpose: "registration",
      keyId: keyPairA.keyId,
      payload,
      publicKeyPem: keyPairA.publicKeyPem,
      aad: JSON.stringify({ version: 1, purpose: "registration", keyId: keyPairA.keyId }),
    });

    const tampered = { ...envelope, ciphertext: toBase64(fromBase64(envelope.ciphertext).map((byte, index) => (index === 0 ? byte ^ 0xff : byte))) };

    await expect(
      decryptEncryptedEnvelope({
        envelope: tampered,
        privateKeyPem: keyPairA.privateKeyPem,
        aad: JSON.stringify({ version: 1, purpose: "registration", keyId: keyPairA.keyId }),
      }),
    ).rejects.toThrow();

      await expect(
        decryptEncryptedEnvelope({
          envelope,
          privateKeyPem: keyPairB.privateKeyPem,
          aad: JSON.stringify({ version: 1, purpose: "registration", keyId: keyPairA.keyId }),
        }),
      ).rejects.toThrow();
    },
    15000,
  );

  it("supports AES-GCM document encryption round trips and rejects invalid tag data", async () => {
    const key = new TextEncoder().encode("0123456789abcdef0123456789abcdef");
    const nonce = new TextEncoder().encode("0123456789abcdef01234567");
    const plaintext = new TextEncoder().encode("%PDF-1.4\n...");
    const aad = "document-v1:guest-1";

    const encrypted = await encryptAesGcm({ key, nonce, plaintext, aad });
    const decrypted = await decryptAesGcm({ key, nonce, ciphertext: encrypted.ciphertext, tag: encrypted.tag, aad });

    expect(new Uint8Array(decrypted)).toEqual(plaintext);

    await expect(
      decryptAesGcm({ key, nonce, ciphertext: encrypted.ciphertext, tag: new Uint8Array(16), aad }),
    ).rejects.toThrow();
  });
});
