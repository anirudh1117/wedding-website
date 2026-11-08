export type EncryptionPurpose = "registration" | "document" | "sangeet-audio";

export type EncryptedEnvelope = {
  version: number;
  purpose: EncryptionPurpose;
  keyId: string;
  nonce: string;
  wrappedKey: string;
  ciphertext: string;
  aad: string;
};

export type AesGcmEncryptInput = {
  key: Uint8Array;
  nonce: Uint8Array;
  plaintext: Uint8Array;
  aad?: Uint8Array | string;
};

export type AesGcmDecryptInput = {
  key: Uint8Array;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
  tag: Uint8Array;
  aad?: Uint8Array | string;
};

function getCrypto(): Crypto {
  if (typeof globalThis === "undefined" || !globalThis.crypto?.subtle) {
    throw new Error("The Web Crypto API is not available in this environment.");
  }

  return globalThis.crypto;
}

function asUint8Array(value: Uint8Array | string | ArrayBuffer | null | undefined): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  }

  return new Uint8Array();
}

function toBufferSource(value: Uint8Array): ArrayBuffer {
  const copied = new Uint8Array(value.length);
  copied.set(value);
  return copied.buffer;
}

export function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

export function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  getCrypto().getRandomValues(bytes);
  return bytes;
}

export function generateAesKey(): Uint8Array {
  return generateRandomBytes(32);
}

export function generateNonce(): Uint8Array {
  return generateRandomBytes(12);
}

export function isMatchingBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

export async function encryptAesGcm({
  key,
  nonce,
  plaintext,
  aad,
}: AesGcmEncryptInput): Promise<{ ciphertext: Uint8Array; tag: Uint8Array; nonce: Uint8Array }> {
  const subtle = getCrypto().subtle;
  const cryptoKey = await subtle.importKey("raw", toBufferSource(key), "AES-GCM", false, ["encrypt"]);
  const additionalData = asUint8Array(aad);

  const encrypted = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toBufferSource(nonce),
      additionalData: additionalData.length > 0 ? toBufferSource(additionalData) : undefined,
      tagLength: 128,
    },
    cryptoKey,
    toBufferSource(plaintext),
  );

  const encryptedBytes = new Uint8Array(encrypted);
  const tag = encryptedBytes.slice(-16);
  const ciphertext = encryptedBytes.slice(0, -16);

  return { ciphertext, tag, nonce };
}

export async function decryptAesGcm({
  key,
  nonce,
  ciphertext,
  tag,
  aad,
}: AesGcmDecryptInput): Promise<Uint8Array> {
  const subtle = getCrypto().subtle;
  const cryptoKey = await subtle.importKey("raw", toBufferSource(key), "AES-GCM", false, ["decrypt"]);
  const additionalData = asUint8Array(aad);

  const combined = concatUint8Arrays([ciphertext, tag]);

  try {
    const decrypted = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: toBufferSource(nonce),
        additionalData: additionalData.length > 0 ? toBufferSource(additionalData) : undefined,
        tagLength: 128,
      },
      cryptoKey,
      toBufferSource(combined),
    );

    return new Uint8Array(decrypted);
  } catch {
    throw new Error("AES-GCM authentication failed.");
  }
}

function pemToBinary(pem: string): Uint8Array {
  const normalized = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(normalized, "base64"));
  }

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function wrapAesKey(publicKeyPem: string, aesKey: Uint8Array): Promise<Uint8Array> {
  if (typeof window !== "undefined") {
    const crypto = getCrypto();
    const publicKey = await crypto.subtle.importKey(
      "spki",
      toBufferSource(pemToBinary(publicKeyPem)),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );

    const wrapped = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, toBufferSource(aesKey));
    return new Uint8Array(wrapped);
  }

  const { publicEncrypt, constants } = await import("node:crypto");
  const encrypted = publicEncrypt(
    {
      key: publicKeyPem,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(aesKey),
  );

  return new Uint8Array(encrypted);
}

export async function unwrapAesKey(privateKeyPem: string, wrappedKey: Uint8Array): Promise<Uint8Array> {
  if (typeof window !== "undefined") {
    throw new Error("Private key unwrapping is not available in browser code.");
  }

  const { privateDecrypt, constants } = await import("node:crypto");
  const decrypted = privateDecrypt(
    {
      key: privateKeyPem,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(wrappedKey),
  );

  return new Uint8Array(decrypted);
}

export async function buildEncryptedEnvelope(args: {
  purpose: EncryptionPurpose;
  keyId: string;
  payload: Uint8Array | string;
  publicKeyPem: string;
  aad?: Uint8Array | string;
  version?: number;
}): Promise<EncryptedEnvelope> {
  const version = args.version ?? 1;
  const aesKey = generateAesKey();
  const nonce = generateNonce();
  const aadBytes = asUint8Array(
    args.aad ?? JSON.stringify({ version, purpose: args.purpose, keyId: args.keyId }),
  );
  const payload = asUint8Array(args.payload);
  const encrypted = await encryptAesGcm({
    key: aesKey,
    nonce,
    plaintext: payload,
    aad: aadBytes,
  });
  const wrappedKey = await wrapAesKey(args.publicKeyPem, aesKey);
  const combinedCiphertext = concatUint8Arrays([encrypted.ciphertext, encrypted.tag]);

  return {
    version,
    purpose: args.purpose,
    keyId: args.keyId,
    nonce: toBase64(nonce),
    wrappedKey: toBase64(wrappedKey),
    ciphertext: toBase64(combinedCiphertext),
    aad: toBase64(aadBytes),
  };
}

export async function decryptEncryptedEnvelope(args: {
  envelope: EncryptedEnvelope;
  privateKeyPem: string;
  aad?: Uint8Array | string;
}): Promise<Uint8Array> {
  if (args.envelope.version !== 1) {
    throw new Error("Unknown encryption version.");
  }

  if (
    args.envelope.purpose !== "registration" &&
    args.envelope.purpose !== "document" &&
    args.envelope.purpose !== "sangeet-audio"
  ) {
    throw new Error("Unknown encryption purpose.");
  }

  const expectedAad = asUint8Array(args.aad ?? args.envelope.aad);
  const storedAad = fromBase64(args.envelope.aad);

  if (!isMatchingBytes(expectedAad, storedAad)) {
    throw new Error("Envelope AAD mismatch.");
  }

  const aesKey = await unwrapAesKey(args.privateKeyPem, fromBase64(args.envelope.wrappedKey));
  const nonce = fromBase64(args.envelope.nonce);
  const combinedCiphertext = fromBase64(args.envelope.ciphertext);
  const ciphertext = combinedCiphertext.slice(0, combinedCiphertext.length - 16);
  const tag = combinedCiphertext.slice(-16);

  return decryptAesGcm({
    key: aesKey,
    nonce,
    ciphertext,
    tag,
    aad: expectedAad,
  });
}

export async function createEncryptionKeyPair(keyId: string): Promise<{
  keyId: string;
  publicKeyPem: string;
  privateKeyPem: string;
}> {
  if (typeof window !== "undefined") {
    throw new Error("Key generation is only available in the server runtime.");
  }

  const { generateKeyPairSync } = await import("node:crypto");
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 3072,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  return {
    keyId,
    publicKeyPem: String(publicKey),
    privateKeyPem: String(privateKey),
  };
}

export function getExpectedEnvelopeAad(args: {
  version: number;
  purpose: EncryptionPurpose;
  keyId: string;
  correlationId?: string;
}): Uint8Array {
  const metadata = {
    version: args.version,
    purpose: args.purpose,
    keyId: args.keyId,
    correlationId: args.correlationId ?? null,
  };

  return new TextEncoder().encode(JSON.stringify(metadata));
}
