import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type GoogleRefreshTokenCiphertext = {
  encryptedText: string;
  nonce: string;
  tag: string;
};

export function getGoogleTokenEncryptionKey(
  rawKey: string = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ?? "",
): Buffer {
  const value = rawKey.trim();
  if (!value) {
    throw new Error("Missing GOOGLE_TOKEN_ENCRYPTION_KEY configuration.");
  }

  const key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }

  return key;
}

function encodeFixedLengthBuffer(value: Buffer): string {
  return value.toString("latin1");
}

export function encryptRefreshToken(
  token: string,
  key: Buffer = getGoogleTokenEncryptionKey(),
): GoogleRefreshTokenCiphertext {
  if (!token) {
    throw new Error("A refresh token is required before it can be encrypted.");
  }

  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encryptedText: encrypted.toString("base64"),
    nonce: encodeFixedLengthBuffer(nonce),
    tag: encodeFixedLengthBuffer(tag),
  };
}

export function decryptRefreshToken(
  encryptedText: string,
  nonceValue: string,
  tagValue: string,
  key: Buffer = getGoogleTokenEncryptionKey(),
): string {
  if (!encryptedText || !nonceValue || !tagValue) {
    throw new Error("Encrypted Google refresh token metadata is incomplete.");
  }

  try {
    const encrypted = Buffer.from(encryptedText, "base64");
    const nonce = Buffer.from(nonceValue, "latin1");
    const tag = Buffer.from(tagValue, "latin1");
    const decipher = createDecipheriv("aes-256-gcm", key, nonce);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Google refresh token decryption failed. The stored credential is invalid.");
  }
}
