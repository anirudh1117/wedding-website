import { createDriveClient, getGoogleDriveConfigFromEnv } from "@/lib/google-drive";
import {
  ensureSangeetPartyFolder,
  ensureSangeetPerformanceFolder,
  uploadSangeetAudio,
} from "@/lib/google-drive/sangeet";
import {
  createSheetsClient,
  getGoogleSheetsConfigFromEnv,
} from "@/lib/google-sheets";
import {
  initializeSangeetTab,
  upsertSangeetRow,
} from "@/lib/google-sheets/sangeet";
import { getDocumentEncryptionConfig } from "@/lib/security/config";
import { decryptEncryptedEnvelope, type EncryptedEnvelope } from "@/lib/security/encryption";
import {
  generateSangeetPerformanceId,
} from "@/lib/sangeet/helpers";
import {
  createTelegramApiClient,
  getTelegramConfigFromEnv,
  getTelegramRecipients,
  sendTelegramMessageWithRetry,
} from "@/lib/telegram";
import { buildSangeetTelegramMessage } from "@/lib/telegram/sangeet";
import {
  sangeetClientSchema,
  sangeetServerSchema,
} from "@/lib/validation/sangeet";

async function ensureTurnstileToken(payload: unknown): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return;

  const token =
    typeof payload === "object" && payload !== null && "turnstileToken" in payload
      ? String((payload as Record<string, unknown>).turnstileToken ?? "")
      : "";

  if (!token) {
    throw new Error("Turnstile validation is required.");
  }

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const result = (await resp.json()) as { success?: boolean };
  if (!resp.ok || !result.success) {
    throw new Error("Turnstile validation failed.");
  }
}

async function resolvePayload(requestBody: unknown): Promise<Record<string, unknown>> {
  if (!requestBody || typeof requestBody !== "object") {
    return (requestBody as Record<string, unknown>) ?? {};
  }

  const body = requestBody as Record<string, unknown>;
  const sangeetEnvelope = body.sangeetData as EncryptedEnvelope | undefined;

  if (!sangeetEnvelope || typeof sangeetEnvelope !== "object") {
    return body;
  }

  const audioConfig = getDocumentEncryptionConfig();
  if (!audioConfig) {
    throw new Error("Audio encryption is not configured.");
  }

  const aad = JSON.stringify({
    version: sangeetEnvelope.version ?? 1,
    purpose: sangeetEnvelope.purpose ?? "sangeet-audio",
    keyId: sangeetEnvelope.keyId ?? audioConfig.keyId,
  });

  const decrypted = await decryptEncryptedEnvelope({
    envelope: sangeetEnvelope,
    privateKeyPem: audioConfig.privateKeyPem,
    aad,
  });

  const sangeetPayload = JSON.parse(new TextDecoder().decode(decrypted));
  return { ...body, ...sangeetPayload };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const requestBody = (await request.json()) as Record<string, unknown>;
    await ensureTurnstileToken(requestBody);

    const payload = await resolvePayload(requestBody);

    // Validate client shape
    const clientParsed = await sangeetClientSchema.parseAsync(payload);

    // Build server input
    const serverInput = sangeetServerSchema.parse({
      ...clientParsed,
      submittedAtIso: new Date().toISOString(),
    });

    const performanceId = generateSangeetPerformanceId(
      serverInput.weddingParty,
    );

    // Initialize Drive structure
    const baseDriveConfig = getGoogleDriveConfigFromEnv();
    const integration = await import("@/lib/google/oauth").then((mod) => mod.getGoogleIntegrationRecord());
    const driveConfig = {
      ...baseDriveConfig,
      rootFolderId: baseDriveConfig.rootFolderId || integration?.driveRootFolderId || "",
      sangeetRootFolderId: baseDriveConfig.sangeetRootFolderId || integration?.sangeetFolderId || "",
    };
    const drive = await createDriveClient(driveConfig);

    const sangeetRootFolderId = driveConfig.sangeetRootFolderId || driveConfig.rootFolderId;
    const partyFolder = await ensureSangeetPartyFolder({
      drive,
      sangeetRootFolderId,
      party: serverInput.weddingParty,
    });

    const performanceFolder = await ensureSangeetPerformanceFolder({
      drive,
      partyFolderId: partyFolder.id,
      performanceId,
    });

    // Handle audio upload if applicable
    let driveFileId: string | undefined;
    if (serverInput.songSource === "upload" && requestBody.audioBytes) {
      const audioBytes = Buffer.from(String(requestBody.audioBytes), "base64");
      const uploadResult = await uploadSangeetAudio({
        drive,
        performanceFolderId: performanceFolder.id,
        performanceId,
        originalFileName: serverInput.audioFileName ?? "song.mp3",
        mimeType: serverInput.audioMimeType ?? "audio/mpeg",
        plainBytes: audioBytes,
      });
      driveFileId = uploadResult.fileId;
    }

    // Initialize Sheets and upsert row
    const sheetsConfig = await getGoogleSheetsConfigFromEnv();
    const sheets = await createSheetsClient(sheetsConfig);

    await initializeSangeetTab({
      sheets,
      spreadsheetId: sheetsConfig.spreadsheetId,
    });

    const sheetResult = await upsertSangeetRow({
      sheets,
      spreadsheetId: sheetsConfig.spreadsheetId,
      input: {
        performanceId,
        weddingParty: serverInput.weddingParty,
        performanceTitle: serverInput.performanceTitle,
        performanceCategory: serverInput.performanceCategory,
        performanceType: serverInput.performanceType,
        leadPerformer: serverInput.leadPerformer,
        contactNumber: serverInput.contactNumber,
        participants: serverInput.participants.map((p) => p.name),
        songSource: serverInput.songSource,
        songUrl: serverInput.songUrl,
        playbackStartTime: serverInput.playbackStartTime,
        playbackEndTime: serverInput.playbackEndTime,
        fullSong: serverInput.fullSong,
        driveFileId,
        estimatedStageDurationMinutes: serverInput.estimatedStageDurationMinutes,
        registrationTimestampIso: serverInput.submittedAtIso,
      },
    });

    // Optional Telegram notification
    const telegramNotificationsEnabled =
      process.env.SANGEET_TELEGRAM_NOTIFICATIONS_ENABLED === "true";
    if (telegramNotificationsEnabled) {
      try {
        const telegramConfig = getTelegramConfigFromEnv();
        const apiClient = createTelegramApiClient(telegramConfig);
        const recipients = getTelegramRecipients(telegramConfig);

        const message = buildSangeetTelegramMessage({
          performanceId,
          weddingParty: serverInput.weddingParty,
          performanceType: serverInput.performanceType,
          performanceTitle: serverInput.performanceTitle,
          performanceCategory: serverInput.performanceCategory,
          leadPerformer: serverInput.leadPerformer,
          participants: serverInput.participants.map((p) => p.name),
          songSource: serverInput.songSource,
          songUrl: serverInput.songUrl,
          playbackStartTime: serverInput.playbackStartTime,
          playbackEndTime: serverInput.playbackEndTime,
          fullSong: serverInput.fullSong,
          estimatedStageDurationMinutes: serverInput.estimatedStageDurationMinutes,
          hasAudioFile: !!driveFileId,
        });

        for (const recipient of recipients) {
          try {
            await sendTelegramMessageWithRetry({
              apiClient,
              request: {
                chatId: recipient.chatId,
                text: message,
                parseMode: "HTML",
                disableWebPagePreview: true,
              },
            });
          } catch {
            // Log but don't fail the registration if Telegram delivery fails
          }
        }
      } catch {
        // Telegram notification is optional; never fail registration
      }
    }

    return Response.json(
      {
        ok: true,
        performanceId,
        status: "registered",
        rowNumber: sheetResult.rowNumber,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    const code =
      error instanceof Error && error.message.includes("Turnstile") ? "TURNSTILE_FAILED" : "REGISTRATION_FAILED";

    return Response.json({ ok: false, code, message }, { status: 400 });
  }
}
