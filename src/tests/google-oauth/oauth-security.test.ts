import { describe, expect, it } from "vitest";

import {
  assertAllowedGoogleAccount,
  buildGoogleAuthorizationUrl,
  validateGoogleIdTokenClaims,
} from "@/lib/google/oauth";

describe("google oauth security", () => {
  it("accepts the configured Gmail account", () => {
    expect(
      assertAllowedGoogleAccount({
        email: "wedding.owner@gmail.com",
        allowedEmail: "wedding.owner@gmail.com",
        emailVerified: true,
        expectedGoogleSub: "abc123",
        actualGoogleSub: "abc123",
      }),
    ).toBe(true);
  });

  it("rejects a different Gmail account", () => {
    expect(
      assertAllowedGoogleAccount({
        email: "someone.else@gmail.com",
        allowedEmail: "wedding.owner@gmail.com",
        emailVerified: true,
        expectedGoogleSub: "abc123",
        actualGoogleSub: "abc123",
      }),
    ).toBe(false);
  });

  it("rejects unverified email claims", () => {
    expect(
      assertAllowedGoogleAccount({
        email: "wedding.owner@gmail.com",
        allowedEmail: "wedding.owner@gmail.com",
        emailVerified: false,
        expectedGoogleSub: "abc123",
        actualGoogleSub: "abc123",
      }),
    ).toBe(false);
  });

  it("validates id token claims before accepting a callback", () => {
    const result = validateGoogleIdTokenClaims({
      aud: "client-id",
      iss: "https://accounts.google.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
      email: "wedding.owner@gmail.com",
      email_verified: true,
      nonce: "nonce-123",
      expectedAudience: "client-id",
      expectedNonce: "nonce-123",
    });

    expect(result).toBe(true);
  });

  it("builds a consent URL with the required OAuth scopes", () => {
    const url = buildGoogleAuthorizationUrl({
      clientId: "client-id",
      clientSecret: "client-secret",
      redirectUri: "http://localhost:3000/api/google/callback",
      state: "state-123",
      nonce: "nonce-123",
      codeVerifier: "code-verifier",
      allowedAccountEmail: "wedding.owner@gmail.com",
      useHostEnv: false,
    });

    expect(url).toContain("scope=openid+email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file");
    expect(url).toContain("access_type=offline");
    expect(url).toContain("state=state-123");
  });
});
