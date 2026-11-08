import "server-only";

import type { google } from "googleapis";
import { initializeSheetsRegistry } from "@/lib/google-sheets";

export type DriveApiClient = ReturnType<typeof google.drive>;
export type SheetsApiClient = ReturnType<typeof google.sheets>;

async function folderExists(args: {
  drive: DriveApiClient;
  parentFolderId: string;
  folderName: string;
}): Promise<string | null> {
  const response = await args.drive.files.list({
    q: [
      `'${args.parentFolderId}' in parents`,
      `name = '${args.folderName.replace(/'/g, "\\'")}'`,
      "mimeType = 'application/vnd.google-apps.folder'",
      "trashed = false",
    ].join(" and "),
    fields: "files(id,name)",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    pageSize: 10,
  });

  const match = response.data.files?.find((file) => file.id && file.name === args.folderName);
  return match?.id ?? null;
}

async function createFolder(args: {
  drive: DriveApiClient;
  parentFolderId: string;
  folderName: string;
}): Promise<string> {
  const existing = await folderExists({
    drive: args.drive,
    parentFolderId: args.parentFolderId,
    folderName: args.folderName,
  });

  if (existing) {
    return existing;
  }

  const response = await args.drive.files.create({
    requestBody: {
      name: args.folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [args.parentFolderId],
    },
    fields: "id,name",
    supportsAllDrives: true,
  });

  if (!response.data.id) {
    throw new Error(`Failed to create folder: ${args.folderName}`);
  }

  return response.data.id;
}

async function ensureRootFolder(args: {
  drive: DriveApiClient;
  existingRootFolderId?: string | null;
}): Promise<string> {
  if (args.existingRootFolderId) {
    try {
      const existing = await args.drive.files.get({
        fileId: args.existingRootFolderId,
        fields: "id,mimeType",
        supportsAllDrives: true,
      });

      if (existing.data.mimeType === "application/vnd.google-apps.folder") {
        return args.existingRootFolderId;
      }
    } catch {
      // fall back to creating a fresh root folder when the stored one is invalid or inaccessible.
    }
  }

  const created = await createFolder({
    drive: args.drive,
    parentFolderId: "root",
    folderName: "Wedding Documents",
  });

  return created;
}

export async function initializeGoogleDriveStructure(args: {
  drive: DriveApiClient;
  existingRootFolderId?: string | null;
}): Promise<{
  rootFolderId: string;
  groomFolderId: string;
  brideFolderId: string;
  sangeetFolderId: string;
  sangeetGroomFolderId: string;
  sangeetBrideFolderId: string;
}> {
  const rootFolderId = await ensureRootFolder({
    drive: args.drive,
    existingRootFolderId: args.existingRootFolderId,
  });

  const groomFolderId = await createFolder({
    drive: args.drive,
    parentFolderId: rootFolderId,
    folderName: "Groom",
  });

  const brideFolderId = await createFolder({
    drive: args.drive,
    parentFolderId: rootFolderId,
    folderName: "Bride",
  });

  const sangeetFolderId = await createFolder({
    drive: args.drive,
    parentFolderId: rootFolderId,
    folderName: "Sangeet Performances",
  });

  const sangeetGroomFolderId = await createFolder({
    drive: args.drive,
    parentFolderId: sangeetFolderId,
    folderName: "Groom",
  });

  const sangeetBrideFolderId = await createFolder({
    drive: args.drive,
    parentFolderId: sangeetFolderId,
    folderName: "Bride",
  });

  return {
    rootFolderId,
    groomFolderId,
    brideFolderId,
    sangeetFolderId,
    sangeetGroomFolderId,
    sangeetBrideFolderId,
  };
}

export async function initializeGoogleSheetsWorkbook(args: {
  drive: DriveApiClient;
  sheets: SheetsApiClient;
  rootFolderId?: string | null;
  spreadsheetId?: string | null;
}): Promise<{ spreadsheetId: string; createdTabs: string[]; verifiedTabs: string[] }> {
  let spreadsheetId = args.spreadsheetId ?? null;

  if (!spreadsheetId) {
    const response = await args.drive.files.create({
      requestBody: {
        name: "Wedding Registry",
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: args.rootFolderId ? [args.rootFolderId] : undefined,
      },
      fields: "id",
      supportsAllDrives: true,
    });

    spreadsheetId = response.data.id ?? null;
  }

  if (!spreadsheetId) {
    throw new Error("Google Sheets workbook could not be created.");
  }

  const initialized = await initializeSheetsRegistry({
    sheets: args.sheets as any,
    spreadsheetId,
  });

  return {
    spreadsheetId,
    createdTabs: initialized.createdTabs,
    verifiedTabs: initialized.verifiedTabs,
  };
}

export async function ensureHotelStaffViewerAccess(args: {
  drive: DriveApiClient;
  emailAddress: string;
  fileId: string;
}): Promise<{ alreadyPresent: boolean }> {
  const normalized = args.emailAddress.trim().toLowerCase();
  const existing = await args.drive.permissions.list({
    fileId: args.fileId,
    fields: "permissions(id,emailAddress,role)",
    supportsAllDrives: true,
  });

  const alreadyPresent = (existing.data.permissions ?? []).some(
    (permission) => permission.emailAddress?.trim().toLowerCase() === normalized,
  );

  if (alreadyPresent) {
    return { alreadyPresent: true };
  }

  await args.drive.permissions.create({
    fileId: args.fileId,
    requestBody: {
      type: "user",
      role: "reader",
      emailAddress: normalized,
    },
    sendNotificationEmail: false,
    supportsAllDrives: true,
  });

  return { alreadyPresent: false };
}
