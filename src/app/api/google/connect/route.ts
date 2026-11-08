import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createGoogleOAuthAuthorizationUrl,
  getGoogleOAuthConfigFromEnv,
  timingSafeEquals,
} from "@/lib/google/oauth";

const oauthStateCookies = {
  state: "google_oauth_state",
  nonce: "google_oauth_nonce",
  codeVerifier: "google_oauth_pkce",
};

function randomToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("").slice(0, length);
}

function createPkceVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Use POST to start the Google OAuth flow." });
}

export async function POST(request: Request) {
  const body = await request.formData();
  const submittedSecret = String(body.get("setupSecret") ?? "");
  const config = getGoogleOAuthConfigFromEnv();

  if (!timingSafeEquals(submittedSecret, config.connectSetupSecret)) {
    return NextResponse.json({ ok: false, message: "Invalid setup secret." }, { status: 401 });
  }

  const state = randomToken(24);
  const nonce = randomToken(24);
  const codeVerifier = createPkceVerifier();

  const cookieStore = await cookies();
  cookieStore.set(oauthStateCookies.state, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  cookieStore.set(oauthStateCookies.nonce, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  cookieStore.set(oauthStateCookies.codeVerifier, codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const redirectUrl = createGoogleOAuthAuthorizationUrl({
    state,
    nonce,
    codeVerifier,
  });

  return NextResponse.redirect(redirectUrl, 307);
}
