import {
  EncryptionNotConfiguredService,
  generateRegistrationId,
  registerFamilyInDrive,
} from "@/lib/google-drive";
import type { DocumentMimeType } from "@/lib/google-drive/types";
import {
  getSheetsSummaryMetricsService,
  writeFamilyRegistryAndSummary,
} from "@/lib/google-sheets";
import { getDocumentEncryptionConfig, getRegistrationEncryptionConfig } from "@/lib/security/config";
import { decryptEncryptedEnvelope, type EncryptedEnvelope } from "@/lib/security/encryption";
import { InMemoryRegistrationOperationStore } from "@/lib/server/registration-operation-store";
import { sendRegistrationNotifications } from "@/lib/telegram";
import { registrationServerSchema } from "@/lib/validation/registration";

async function ensureTurnstileToken(payload: unknown): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return;
  }

  const token =
    typeof payload === "object" && payload !== null && "turnstileToken" in payload
      ? String((payload as Record<string, unknown>).turnstileToken ?? "")
      : "";

  if (!token) {
    throw new Error("Turnstile validation is required.");
  }

  const challengeResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  const result = (await challengeResponse.json()) as { success?: boolean };
  if (!challengeResponse.ok || !result.success) {
    throw new Error("Turnstile validation failed.");
  }
}

async function resolvePayload(requestBody: unknown): Promise<unknown> {
  if (!requestBody || typeof requestBody !== "object") {
    return requestBody;
  }

  const body = requestBody as Record<string, unknown>;
  const registrationEnvelope = body.registrationData as EncryptedEnvelope | undefined;

  if (!registrationEnvelope || typeof registrationEnvelope !== "object") {
    return requestBody;
  }

  const registrationConfig = getRegistrationEncryptionConfig();
  const documentConfig = getDocumentEncryptionConfig();

  if (!registrationConfig || !documentConfig) {
    throw new Error("Encryption is not configured for this deployment.");
  }

  const registrationAad = JSON.stringify({
    version: registrationEnvelope.version ?? 1,
    purpose: registrationEnvelope.purpose ?? "registration",
    keyId: registrationEnvelope.keyId ?? registrationConfig.keyId,
  });

  const decryptedRegistration = await decryptEncryptedEnvelope({
    envelope: registrationEnvelope,
    privateKeyPem: registrationConfig.privateKeyPem,
    aad: registrationAad,
  });

  const registrationPayload = JSON.parse(new TextDecoder().decode(decryptedRegistration)) as {
    weddingParty?: string;
    contactNumber?: string;
    familyName?: string;
    guests?: Array<{ fullName?: string; aadhaarDocument?: Record<string, unknown> }>;
    metadata?: { submittedAtIso?: string; source?: string };
    consentConfirmed?: boolean;
  };

  const guestDocuments = Array.isArray(body.guestDocuments) ? body.guestDocuments : [];

  for (const guestDocument of guestDocuments) {
    const guestIndex = Number((guestDocument as Record<string, unknown>).guestIndex ?? 0);
    const encryptedDocument = (guestDocument as Record<string, unknown>).encryptedDocument as
      | EncryptedEnvelope
      | undefined;
    if (!encryptedDocument || !registrationPayload.guests?.[guestIndex]) {
      continue;
    }

    const documentAad = JSON.stringify({
      version: encryptedDocument.version ?? 1,
      purpose: encryptedDocument.purpose ?? "document",
      keyId: encryptedDocument.keyId ?? documentConfig.keyId,
      guestIndex,
      fileName: (guestDocument as Record<string, unknown>).originalFileName ?? "guest-document",
    });

    const decryptedDocument = await decryptEncryptedEnvelope({
      envelope: encryptedDocument,
      privateKeyPem: documentConfig.privateKeyPem,
      aad: documentAad,
    });

    const guest = registrationPayload.guests[guestIndex];
    guest.aadhaarDocument = {
      ...(guest.aadhaarDocument ?? {}),
      fileName: (guestDocument as Record<string, unknown>).originalFileName ?? guest.aadhaarDocument?.fileName ?? "document",
      fileSize: Number((guestDocument as Record<string, unknown>).fileSize ?? decryptedDocument.length),
      mimeType: (guestDocument as Record<string, unknown>).mimeType ?? guest.aadhaarDocument?.mimeType ?? "application/pdf",
      fileBytes: decryptedDocument,
    };
  }

  return registrationPayload;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        message: "अमान्य अनुरोध। / Invalid request body.",
      },
      { status: 400 },
    );
  }

  try {
    await ensureTurnstileToken(payload);
  } catch {
    return Response.json(
      {
        ok: false,
        message: "टर्नस्टाइल सत्यापन विफल रहा। कृपया पृष्ठ रिफ्रेश करें और पुनः प्रयास करें। / Turnstile verification failed. Please refresh and try again.",
      },
      { status: 403 },
    );
  }

  let usablePayload: unknown = payload;
  try {
    usablePayload = await resolvePayload(payload);
  } catch {
    return Response.json(
      {
        ok: false,
        message: "एन्क्रिप्टेड पंजीकरण डेटा सत्यापित नहीं हो सका। / Encrypted registration payload could not be verified.",
      },
      { status: 400 },
    );
  }

  const parsed = registrationServerSchema.safeParse(usablePayload);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        message: "कृपया हाइलाइट किए गए विवरण को सही करें और पुनः प्रयास करें। / Please correct the highlighted form data and try again.",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const registrationId = generateRegistrationId(parsed.data.weddingParty);

  const registration = {
    registrationId,
    weddingParty: parsed.data.weddingParty,
    familyName: parsed.data.familyName,
    contactNumber: parsed.data.contactNumber,
    guestDocuments: parsed.data.guests.map((guest, guestIndex) => ({
      guestIndex,
      guestFullName: guest.fullName,
      originalFileName: guest.aadhaarDocument.fileName,
      mimeType: guest.aadhaarDocument.mimeType as DocumentMimeType,
      byteSize: guest.aadhaarDocument.fileSize,
    })),
  };

  const guestFileBytesByIndex = Object.fromEntries(
    parsed.data.guests.flatMap((guest, guestIndex) => {
      const fileBytes = (guest as Record<string, unknown>).aadhaarDocument as {
        fileBytes?: Uint8Array;
      } | null;
      if (!fileBytes?.fileBytes) {
        return [];
      }
      return [[guestIndex, Buffer.from(fileBytes.fileBytes)]];
    }),
  ) as Record<number, Buffer>;

  const operationStore = new InMemoryRegistrationOperationStore();
  await operationStore.save({
    registrationId,
    weddingParty: registration.weddingParty,
    familyName: registration.familyName,
    uploadedDocumentIds: {},
    status: "pending",
  });

  const driveResult = await registerFamilyInDrive({
    operationStore,
    encryptionService: new EncryptionNotConfiguredService(),
    input: {
      registration,
      guestFileBytesByIndex,
    },
  });

  if (!driveResult.ok) {
    return Response.json(
      {
        ok: false,
        message: driveResult.message,
        integrationStatus: driveResult.status,
        registrationStatus: "pending_secure_upload",
        documentUploadConfirmed: false,
      },
      { status: 503 },
    );
  }

  const guestCount = registration.guestDocuments.length;
  const sheetsResult = await writeFamilyRegistryAndSummary({
    row: {
      registrationId,
      weddingParty: registration.weddingParty,
      familyName: registration.familyName,
      contactNumber: registration.contactNumber,
      totalGuests: guestCount,
      registrationTimestampIso: parsed.data.metadata.submittedAtIso,
      familyFolderId: driveResult.familyFolderId,
    },
  });

  if (!sheetsResult.ok) {
    return Response.json(
      {
        ok: false,
        message:
          "Registration was uploaded, but registry synchronization is currently unavailable.",
        integrationStatus: "partial_registry_failure",
        documentUploadConfirmed: true,
      },
      { status: sheetsResult.retryable ? 503 : 500 },
    );
  }

  const summaryResult = await getSheetsSummaryMetricsService();
  if (!summaryResult.ok) {
    return Response.json(
      {
        ok: false,
        message:
          "Registration completed, but summary aggregation is temporarily unavailable.",
        integrationStatus: "partial_summary_failure",
        documentUploadConfirmed: true,
      },
      { status: summaryResult.retryable ? 503 : 500 },
    );
  }

  const telegramResult = await sendRegistrationNotifications({
    operationStore,
    payload: {
      registrationId,
      weddingParty: registration.weddingParty,
      familyName: registration.familyName,
      guestNames: registration.guestDocuments.map((guest) => guest.guestFullName),
      summary: summaryResult.summary,
    },
  });

  if (!telegramResult.ok) {
    return Response.json(
      {
        ok: false,
        message:
          "Registration completed, but host notifications are pending retry.",
        integrationStatus: "partial_telegram_failure",
        documentUploadConfirmed: true,
      },
      { status: telegramResult.retryable ? 503 : 500 },
    );
  }

  return Response.json(
    {
      ok: true,
      message: "Registration received successfully.",
      integrationStatus: "completed",
      documentUploadConfirmed: true,
    },
    { status: 200 },
  );
}
