import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { googleIntegrations } from "@/db/schema";
import { decryptRefreshToken, getGoogleTokenEncryptionKey } from "@/lib/google/token-encryption";
import { getGoogleIntegrationRecord, getGoogleOAuthConfigFromEnv, timingSafeEquals } from "@/lib/google/oauth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const providedSecret = typeof body.setupSecret === "string" ? body.setupSecret : "";
  const confirmed = body.confirm === true || body.confirm === "true";

  const config = getGoogleOAuthConfigFromEnv();
  if (!timingSafeEquals(providedSecret, config.connectSetupSecret) || !confirmed) {
    return NextResponse.json({ ok: false, message: "Disconnect requires the setup secret and explicit confirmation." }, { status: 401 });
  }

  const integration = await getGoogleIntegrationRecord();
  let revokeSucceeded = false;

  if (integration?.encryptedRefreshToken && integration?.encryptionNonce && integration?.encryptionTag) {
    try {
      const refreshToken = decryptRefreshToken(
        integration.encryptedRefreshToken,
        integration.encryptionNonce,
        integration.encryptionTag,
        getGoogleTokenEncryptionKey(),
      );

      const revokeResponse = await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ token: refreshToken }),
      });
      revokeSucceeded = revokeResponse.ok;
    } catch {
      revokeSucceeded = false;
    }
  }

  if (!db) {
    throw new Error("Missing DATABASE_URL environment variable for Neon PostgreSQL.");
  }

  await db
    .update(googleIntegrations)
    .set({
      googleEmail: null,
      googleSub: null,
      encryptedRefreshToken: null,
      encryptionNonce: null,
      encryptionTag: null,
      driveRootFolderId: null,
      groomFolderId: null,
      brideFolderId: null,
      sangeetFolderId: null,
      spreadsheetId: null,
      status: "DISCONNECTED",
      connectedAt: null,
      updatedAt: new Date(),
    } as any)
    .where(eq(googleIntegrations.provider, "google"));

  return NextResponse.json({
    ok: true,
    disconnected: true,
    revocationConfirmed: revokeSucceeded,
    message: revokeSucceeded
      ? "Google access was revoked and the local connection was removed."
      : "The local Google connection was removed, but Google token revocation could not be confirmed.",
  });
}
