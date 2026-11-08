import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { googleIntegrations } from "@/db/schema";
import { encryptRefreshToken } from "@/lib/google/token-encryption";
import { getGoogleOAuthConfigFromEnv, timingSafeEquals } from "@/lib/google/oauth";
import { getGoogleIntegrationRecord, upsertGoogleIntegration } from "@/lib/google/oauth";

const oauthStateCookies = {
  state: "google_oauth_state",
  nonce: "google_oauth_nonce",
  codeVerifier: "google_oauth_pkce",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";

  if (error) {
    return NextResponse.redirect(new URL(`/google/connect?error=${encodeURIComponent(error)}`, request.url), 303);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(oauthStateCookies.state)?.value ?? "";
  const expectedNonce = cookieStore.get(oauthStateCookies.nonce)?.value ?? "";
  const expectedVerifier = cookieStore.get(oauthStateCookies.codeVerifier)?.value ?? "";

  if (!code || !expectedState || !expectedNonce || !expectedVerifier || !timingSafeEquals(state, expectedState)) {
    return NextResponse.redirect(new URL("/google/connect?error=invalid_state", request.url), 303);
  }

  const config = getGoogleOAuthConfigFromEnv();
  const oauthClient = new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  });

  try {
    const { tokens } = await oauthClient.getToken({
      code,
      codeVerifier: expectedVerifier,
      redirect_uri: config.redirectUri,
    } as any);

    const idToken = tokens.id_token;
    if (!idToken) {
      throw new Error("Google OAuth did not return an ID token.");
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: config.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub || !payload.aud || !payload.iss || !payload.exp) {
      throw new Error("Google ID token payload was incomplete.");
    }

    const email = payload.email.trim().toLowerCase();
    const allowedEmail = config.allowedAccountEmail.trim().toLowerCase();

    if (payload.email_verified !== true || email !== allowedEmail) {
      throw new Error("Google account is not the allowed wedding admin account.");
    }

    if (payload.aud !== config.clientId) {
      throw new Error("Google ID token audience mismatch.");
    }

    if (!["https://accounts.google.com", "https://oauth2.googleapis.com"].includes(payload.iss)) {
      throw new Error("Google ID token issuer mismatch.");
    }

    const now = Math.floor(Date.now() / 1000);
    if (Number(payload.exp) <= now) {
      throw new Error("Google ID token has expired.");
    }

    if (payload.nonce && expectedNonce && payload.nonce !== expectedNonce) {
      throw new Error("Google ID token nonce mismatch.");
    }

    if (!payload.sub) {
      throw new Error("Google account subject is missing.");
    }

    const existingIntegration = await getGoogleIntegrationRecord();
    if (existingIntegration?.googleSub && existingIntegration.googleSub !== payload.sub) {
      throw new Error("A different Google account is already connected. Reconnect requires explicit confirmation.");
    }

    const refreshToken = tokens.refresh_token ?? null;
    const nowDate = new Date();

    if (!refreshToken && !existingIntegration?.encryptedRefreshToken) {
      throw new Error("Google OAuth did not return a refresh token. Revoke the app access and reconnect.");
    }

    const nextEncryptedToken = refreshToken
      ? encryptRefreshToken(refreshToken, config.tokenEncryptionKey)
      : undefined;

    await upsertGoogleIntegration({
      googleEmail: email,
      googleSub: payload.sub,
      encryptedRefreshToken: nextEncryptedToken?.encryptedText ?? existingIntegration?.encryptedRefreshToken ?? null,
      encryptionNonce: nextEncryptedToken?.nonce ?? existingIntegration?.encryptionNonce ?? null,
      encryptionTag: nextEncryptedToken?.tag ?? existingIntegration?.encryptionTag ?? null,
      status: "CONNECTED",
      connectedAt: existingIntegration?.connectedAt ?? nowDate,
    });

    cookieStore.set(oauthStateCookies.state, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    cookieStore.set(oauthStateCookies.nonce, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    cookieStore.set(oauthStateCookies.codeVerifier, "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return NextResponse.redirect(new URL("/google/settings?connected=1", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google connection failed.";
    return NextResponse.redirect(new URL(`/google/connect?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
