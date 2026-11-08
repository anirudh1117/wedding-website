import "server-only";

import { createHash } from "node:crypto";

import { OAuth2Client } from "google-auth-library";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { googleIntegrations } from "@/db/schema";
import {
  decryptRefreshToken,
  getGoogleTokenEncryptionKey,
} from "@/lib/google/token-encryption";

export type GoogleIntegrationStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECT_REQUIRED"
  | "INITIALIZATION_PENDING"
  | "INITIALIZATION_FAILED";

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  allowedAccountEmail: string;
  hotelStaffEmail: string;
  connectSetupSecret: string;
  tokenEncryptionKey: Buffer;
};

export function normalizeGoogleEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

export function getGoogleOAuthConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): GoogleOAuthConfig {
  const missing = [
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "GOOGLE_OAUTH_REDIRECT_URI",
    "GOOGLE_ALLOWED_ACCOUNT_EMAIL",
    "GOOGLE_CONNECT_SETUP_SECRET",
    "GOOGLE_TOKEN_ENCRYPTION_KEY",
    "GOOGLE_HOTEL_STAFF_EMAIL",
  ].filter((key) => !env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required Google OAuth configuration: ${missing.join(", ")}.`,
    );
  }

  return {
    clientId: env.GOOGLE_OAUTH_CLIENT_ID!.trim(),
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET!.trim(),
    redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI!.trim(),
    allowedAccountEmail: normalizeGoogleEmail(env.GOOGLE_ALLOWED_ACCOUNT_EMAIL!),
    hotelStaffEmail: normalizeGoogleEmail(env.GOOGLE_HOTEL_STAFF_EMAIL!),
    connectSetupSecret: env.GOOGLE_CONNECT_SETUP_SECRET!.trim(),
    tokenEncryptionKey: getGoogleTokenEncryptionKey(env.GOOGLE_TOKEN_ENCRYPTION_KEY),
  };
}

export function assertAllowedGoogleAccount(args: {
  email: string;
  allowedEmail: string;
  emailVerified: boolean;
  expectedGoogleSub?: string | null;
  actualGoogleSub?: string | null;
}): boolean {
  if (!args.emailVerified) {
    return false;
  }

  const normalizedEmail = normalizeGoogleEmail(args.email);
  const normalizedAllowed = normalizeGoogleEmail(args.allowedEmail);
  if (!normalizedEmail || !normalizedAllowed || normalizedEmail !== normalizedAllowed) {
    return false;
  }

  if (args.expectedGoogleSub && args.actualGoogleSub && args.expectedGoogleSub !== args.actualGoogleSub) {
    return false;
  }

  return true;
}

export function validateGoogleIdTokenClaims(args: {
  aud: string;
  iss: string;
  exp: number;
  email?: string;
  email_verified?: boolean;
  nonce?: string | null;
  expectedAudience: string;
  expectedNonce?: string | null;
}): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (args.aud !== args.expectedAudience) {
    return false;
  }

  if (!args.iss || !["https://accounts.google.com", "https://oauth2.googleapis.com"].includes(args.iss)) {
    return false;
  }

  if (Number.isNaN(args.exp) || args.exp <= now) {
    return false;
  }

  if (args.email && !args.email_verified) {
    return false;
  }

  if (args.expectedNonce && args.nonce !== args.expectedNonce) {
    return false;
  }

  return true;
}

export function buildGoogleAuthorizationUrl(args: {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeVerifier: string;
  allowedAccountEmail: string;
  useHostEnv?: boolean;
}): string {
  const challenge = createHash("sha256").update(args.codeVerifier).digest("base64url");

  const params = new URLSearchParams({
    client_id: args.clientId,
    redirect_uri: args.redirectUri,
    response_type: "code",
    scope: ["openid", "email", "https://www.googleapis.com/auth/drive.file"].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: args.state,
    nonce: args.nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  if (args.allowedAccountEmail) {
    params.set("login_hint", args.allowedAccountEmail);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const candidate = (error as { code?: unknown }).code;
  if (typeof candidate === "string") {
    return candidate;
  }

  const errno = (error as { errno?: unknown }).errno;
  if (typeof errno === "string") {
    return errno;
  }

  if (typeof errno === "number") {
    return String(errno);
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = (error as { message?: unknown }).message;
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  return "Unknown database error.";
}

function getNestedCause(error: unknown): unknown {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const directCause = (error as { cause?: unknown }).cause;
  if (directCause) {
    return directCause;
  }

  const nestedError = (error as { error?: unknown }).error;
  return nestedError;
}

function logGoogleIntegrationQueryError(error: unknown) {
  const cause = getNestedCause(error);
  const nestedCause = getNestedCause(cause);
  const databaseHost = (() => {
    try {
      return process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : null;
    } catch {
      return null;
    }
  })();

  const code = getErrorCode(error);
  const causeCode = getErrorCode(cause);
  const nestedCauseCode = getErrorCode(nestedCause);
  const message = getErrorMessage(error);
  const causeMessage = getErrorMessage(cause);
  const nestedCauseMessage = getErrorMessage(nestedCause);

  console.error("google_integrations query failed", {
    operation: "getGoogleIntegrationRecord",
    databaseHost,
    code,
    message,
    causeCode,
    causeMessage,
    nestedCauseCode,
    nestedCauseMessage,
  });
}

export async function getGoogleIntegrationRecord(): Promise<{
  id: string;
  provider: string;
  googleEmail: string | null;
  googleSub: string | null;
  encryptedRefreshToken: string | null;
  encryptionNonce: string | null;
  encryptionTag: string | null;
  driveRootFolderId: string | null;
  groomFolderId: string | null;
  brideFolderId: string | null;
  sangeetFolderId: string | null;
  spreadsheetId: string | null;
  status: string;
  connectedAt: Date | null;
  updatedAt: Date | null;
} | null> {
  const database = getDb();
  if (!database) {
    return null;
  }

  const rows = await database
    .select()
    .from(googleIntegrations)
    .where(eq(googleIntegrations.provider, "google"))
    .limit(1)
    .catch((error: unknown) => {
      logGoogleIntegrationQueryError(error);
      throw error;
    });

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    provider: row.provider,
    googleEmail: row.googleEmail,
    googleSub: row.googleSub,
    encryptedRefreshToken: row.encryptedRefreshToken,
    encryptionNonce: row.encryptionNonce,
    encryptionTag: row.encryptionTag,
    driveRootFolderId: row.driveRootFolderId,
    groomFolderId: row.groomFolderId,
    brideFolderId: row.brideFolderId,
    sangeetFolderId: row.sangeetFolderId,
    spreadsheetId: row.spreadsheetId,
    status: row.status,
    connectedAt: row.connectedAt,
    updatedAt: row.updatedAt,
  };
}

export async function upsertGoogleIntegration(args: {
  googleEmail?: string | null;
  googleSub?: string | null;
  encryptedRefreshToken?: string | null;
  encryptionNonce?: string | null;
  encryptionTag?: string | null;
  driveRootFolderId?: string | null;
  groomFolderId?: string | null;
  brideFolderId?: string | null;
  sangeetFolderId?: string | null;
  spreadsheetId?: string | null;
  status?: GoogleIntegrationStatus;
  connectedAt?: Date | null;
  updatedAt?: Date | null;
}): Promise<void> {
  const values = {
    provider: "google",
    googleEmail: args.googleEmail ?? null,
    googleSub: args.googleSub ?? null,
    encryptedRefreshToken: args.encryptedRefreshToken ?? null,
    encryptionNonce: args.encryptionNonce ?? null,
    encryptionTag: args.encryptionTag ?? null,
    driveRootFolderId: args.driveRootFolderId ?? null,
    groomFolderId: args.groomFolderId ?? null,
    brideFolderId: args.brideFolderId ?? null,
    sangeetFolderId: args.sangeetFolderId ?? null,
    spreadsheetId: args.spreadsheetId ?? null,
    status: (args.status ?? "INITIALIZATION_PENDING") as GoogleIntegrationStatus,
    connectedAt: args.connectedAt ?? new Date(),
    updatedAt: args.updatedAt ?? new Date(),
  };

  const database = getDb();
  if (!database) {
    throw new Error("Missing DATABASE_URL environment variable for Neon PostgreSQL.");
  }

  const existing = await getGoogleIntegrationRecord();
  if (!existing) {
    await database.insert(googleIntegrations).values(values as any);
    return;
  }

  await database
    .update(googleIntegrations)
    .set(values as any)
    .where(eq(googleIntegrations.provider, "google"));
}

export async function createGoogleOAuthClient(): Promise<OAuth2Client> {
  const config = getGoogleOAuthConfigFromEnv();
  const integration = await getGoogleIntegrationRecord();

  if (!integration || !integration.encryptedRefreshToken || !integration.encryptionNonce || !integration.encryptionTag) {
    throw new Error("Google OAuth is not connected yet.");
  }

  const refreshToken = decryptRefreshToken(
    integration.encryptedRefreshToken,
    integration.encryptionNonce,
    integration.encryptionTag,
    config.tokenEncryptionKey,
  );

  const client = new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  });

  client.setCredentials({ refresh_token: refreshToken });

  try {
    await client.getAccessToken();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown token refresh failure.";
    if (/invalid_grant|revoked|unauthorized/i.test(message)) {
      await upsertGoogleIntegration({
        status: "RECONNECT_REQUIRED",
        updatedAt: new Date(),
      });
    }
    throw new Error(`Failed to refresh Google OAuth access token: ${message}`);
  }

  return client;
}

export function createGoogleOAuthAuthorizationUrl(args: {
  state: string;
  nonce: string;
  codeVerifier: string;
}): string {
  const config = getGoogleOAuthConfigFromEnv();
  return buildGoogleAuthorizationUrl({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    state: args.state,
    nonce: args.nonce,
    codeVerifier: args.codeVerifier,
    allowedAccountEmail: config.allowedAccountEmail,
    useHostEnv: false,
  });
}
