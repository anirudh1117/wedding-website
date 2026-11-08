import "server-only";

export type EncryptionConfig = {
  keyId: string;
  publicKeyPem: string;
  privateKeyPem: string;
};

function readRequiredKeyPair(prefix: string, env: NodeJS.ProcessEnv = process.env): EncryptionConfig | null {
  const keyId = env[`${prefix}_KEY_ID`]?.trim() || "";
  const publicKeyPem = env[`${prefix}_PUBLIC_KEY`]?.trim() || "";
  const privateKeyPem = env[`${prefix}_PRIVATE_KEY`]?.trim() || "";

  if (!keyId || !publicKeyPem || !privateKeyPem) {
    return null;
  }

  if (!publicKeyPem.includes("BEGIN PUBLIC KEY") || !privateKeyPem.includes("BEGIN PRIVATE KEY")) {
    return null;
  }

  return { keyId, publicKeyPem, privateKeyPem };
}

export function getRegistrationEncryptionConfig(
  env: NodeJS.ProcessEnv = process.env,
): EncryptionConfig | null {
  return readRequiredKeyPair("REGISTRATION_ENCRYPTION", env);
}

export function getDocumentEncryptionConfig(
  env: NodeJS.ProcessEnv = process.env,
): EncryptionConfig | null {
  return readRequiredKeyPair("DOCUMENT_ENCRYPTION", env);
}

export function requireRegistrationEncryptionConfig(
  env: NodeJS.ProcessEnv = process.env,
): EncryptionConfig {
  const config = getRegistrationEncryptionConfig(env);
  if (!config) {
    throw new Error("Missing REGISTRATION_ENCRYPTION encryption configuration.");
  }
  return config;
}

export function requireDocumentEncryptionConfig(
  env: NodeJS.ProcessEnv = process.env,
): EncryptionConfig {
  const config = getDocumentEncryptionConfig(env);
  if (!config) {
    throw new Error("Missing DOCUMENT_ENCRYPTION encryption configuration.");
  }
  return config;
}
