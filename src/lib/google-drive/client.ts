import "server-only";

import { google } from "googleapis";
import { createGoogleOAuthClient } from "@/lib/google/oauth";
import { assertServerRuntime } from "@/lib/server/runtime";
import { GoogleDriveIntegrationError } from "./errors";
import type { DriveClientLike } from "./types";

export type GoogleDriveConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  rootFolderId: string;
  sangeetRootFolderId?: string;
};

export function getGoogleDriveConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GoogleDriveConfig {
  const serviceAccountEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";
  const privateKeyRaw = env.GOOGLE_PRIVATE_KEY?.trim() ?? "";
  const rootFolderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim() ?? "";
  const sangeetRootFolderId = env.GOOGLE_DRIVE_SANGEET_ROOT_FOLDER_ID?.trim();

  if (!serviceAccountEmail && !privateKeyRaw && !rootFolderId) {
    return {
      serviceAccountEmail: "",
      privateKey: "",
      rootFolderId: "",
      sangeetRootFolderId: sangeetRootFolderId || rootFolderId,
    };
  }

  if (!serviceAccountEmail || !privateKeyRaw || !rootFolderId) {
    throw new GoogleDriveIntegrationError(
      "CONFIG_MISSING",
      "Google Drive configuration is incomplete. Required environment variables are missing.",
      false,
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  if (!serviceAccountEmail.includes("@") || !privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new GoogleDriveIntegrationError(
      "CONFIG_INVALID",
      "Google Drive service-account configuration appears invalid.",
      false,
    );
  }

  return {
    serviceAccountEmail,
    privateKey,
    rootFolderId,
    sangeetRootFolderId: sangeetRootFolderId || rootFolderId,
  };
}

export async function createDriveClient(config = getGoogleDriveConfigFromEnv()): Promise<DriveClientLike> {
  assertServerRuntime();

  try {
    const auth = await createGoogleOAuthClient();
    const drive = google.drive({
      version: "v3",
      auth: auth as any,
    });
    return drive as unknown as DriveClientLike;
  } catch {
    if (!config.serviceAccountEmail || !config.privateKey) {
      throw new GoogleDriveIntegrationError(
        "CONFIG_MISSING",
        "No Google OAuth connection or service-account credentials are configured.",
        false,
      );
    }

    const auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });

    return drive as unknown as DriveClientLike;
  }
}
