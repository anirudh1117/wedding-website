import "server-only";

import { google } from "googleapis";
import { getGoogleIntegrationRecord, createGoogleOAuthClient } from "@/lib/google/oauth";
import { assertServerRuntime } from "@/lib/server/runtime";
import { getGoogleDriveConfigFromEnv } from "@/lib/google-drive";
import { GoogleSheetsIntegrationError } from "./errors";
import type { SheetsClientLike } from "./types";

export type GoogleSheetsConfig = {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
};

export async function getGoogleSheetsConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): Promise<GoogleSheetsConfig> {
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() ?? "";
  const integration = await getGoogleIntegrationRecord();
  const effectiveSpreadsheetId = spreadsheetId || integration?.spreadsheetId || "";

  const driveConfig = getGoogleDriveConfigFromEnv(env);

  return {
    spreadsheetId: effectiveSpreadsheetId,
    serviceAccountEmail: driveConfig.serviceAccountEmail,
    privateKey: driveConfig.privateKey,
  };
}

export async function createSheetsClient(
  config?: GoogleSheetsConfig,
): Promise<SheetsClientLike> {
  assertServerRuntime();

  const resolvedConfig = config ?? (await getGoogleSheetsConfigFromEnv());

  try {
    const auth = await createGoogleOAuthClient();
    const sheets = google.sheets({
      version: "v4",
      auth: auth as any,
    });

    return sheets as unknown as SheetsClientLike;
  } catch {
    if (!resolvedConfig.serviceAccountEmail || !resolvedConfig.privateKey) {
      throw new GoogleSheetsIntegrationError(
        "CONFIG_MISSING",
        "Google Sheets is not configured. A Google OAuth connection or service-account credentials are required.",
        false,
      );
    }

    const auth = new google.auth.JWT({
      email: resolvedConfig.serviceAccountEmail,
      key: resolvedConfig.privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    const sheets = google.sheets({
      version: "v4",
      auth: auth as any,
    });

    return sheets as unknown as SheetsClientLike;
  }
}
