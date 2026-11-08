import { NextResponse } from "next/server";
import {
  getDocumentEncryptionConfig,
  getRegistrationEncryptionConfig,
} from "@/lib/security/config";

export async function GET() {
  const registration = getRegistrationEncryptionConfig();
  const document = getDocumentEncryptionConfig();

  return NextResponse.json({
    ok: Boolean(registration && document),
    registrationKeyId: registration?.keyId ?? "",
    registrationPublicKey: registration?.publicKeyPem ?? "",
    documentKeyId: document?.keyId ?? "",
    documentPublicKey: document?.publicKeyPem ?? "",
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY?.trim() || "",
  });
}
