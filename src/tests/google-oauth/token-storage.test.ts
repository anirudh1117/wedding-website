import { describe, expect, it } from "vitest";

import {
  decryptRefreshToken,
  encryptRefreshToken,
  getGoogleTokenEncryptionKey,
} from "@/lib/google/token-encryption";

describe("google token storage", () => {
  it("encrypts and decrypts a refresh token", () => {
    const baseKey = Buffer.from("12345678901234567890123456789012", "utf8");
    const token = "refresh-token-value";

    const encrypted = encryptRefreshToken(token, baseKey);
    expect(encrypted.encryptedText).not.toBe(token);
    expect(encrypted.nonce).toHaveLength(12);
    expect(encrypted.tag).toHaveLength(16);

    const decrypted = decryptRefreshToken(
      encrypted.encryptedText,
      encrypted.nonce,
      encrypted.tag,
      baseKey,
    );

    expect(decrypted).toBe(token);
  });

  it("rejects modified ciphertext", () => {
    const baseKey = Buffer.from("abcdefghijklmnopqrstuvwxzy123456", "utf8");
    const encrypted = encryptRefreshToken("refresh-token-value", baseKey);
    const tamperedTag = `${encrypted.tag.slice(0, -1)}${encrypted.tag.at(-1) === "A" ? "B" : "A"}`;

    expect(() =>
      decryptRefreshToken(encrypted.encryptedText, encrypted.nonce, tamperedTag, baseKey),
    ).toThrow();
  });

  it("validates the encryption key length", () => {
    expect(() => getGoogleTokenEncryptionKey("short-key")).toThrow();
  });
});
