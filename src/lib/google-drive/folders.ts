import "server-only";

import { setTimeout as delay } from "node:timers/promises";
import {
  GoogleDriveIntegrationError,
  toGoogleDriveIntegrationError,
} from "./errors";
import type {
  DriveClientLike,
  DriveFolderReference,
  EnsureWeddingFoldersResult,
  RegistrationOperationStore,
  WeddingParty,
} from "./types";

const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const DEFAULT_MAX_RETRIES = 3;

function escapeDriveQueryValue(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function withRetries<T>(
  operation: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const integrationError = toGoogleDriveIntegrationError(error);
      const canRetry = integrationError.retryable && attempt < maxRetries;
      if (!canRetry) {
        throw integrationError;
      }

      attempt += 1;
      const backoffMs = 200 * 2 ** (attempt - 1);
      await delay(backoffMs);
    }
  }
}

export async function verifyRootFolderAccess(args: {
  drive: DriveClientLike;
  rootFolderId: string;
}): Promise<DriveFolderReference> {
  const response = await withRetries(() =>
    args.drive.files.get({
      fileId: args.rootFolderId,
      fields: "id,name,mimeType,parents",
      supportsAllDrives: true,
    }),
  );

  if (response.data.mimeType !== DRIVE_FOLDER_MIME) {
    throw new GoogleDriveIntegrationError(
      "VALIDATION",
      "Configured root folder is not a valid Google Drive folder.",
      false,
    );
  }

  return {
    id: response.data.id ?? args.rootFolderId,
    name: response.data.name ?? "root",
    parentId: response.data.parents?.[0] ?? "",
  };
}

async function listChildFoldersByName(args: {
  drive: DriveClientLike;
  parentFolderId: string;
  folderName: string;
}): Promise<Array<DriveFolderReference>> {
  const escapedParentId = escapeDriveQueryValue(args.parentFolderId);
  const escapedName = escapeDriveQueryValue(args.folderName);

  let pageToken: string | undefined;
  const matches: Array<DriveFolderReference> = [];

  do {
    const response = await withRetries(() =>
      args.drive.files.list({
        q: [
          `'${escapedParentId}' in parents`,
          `name = '${escapedName}'`,
          `mimeType = '${DRIVE_FOLDER_MIME}'`,
          "trashed = false",
        ].join(" and "),
        fields: "nextPageToken, files(id,name,mimeType,parents)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        pageSize: 100,
        pageToken,
      }),
    );

    for (const file of response.data.files ?? []) {
      if (!file.id || !file.name) {
        continue;
      }

      const parentId = file.parents?.[0] ?? "";
      if (parentId !== args.parentFolderId) {
        continue;
      }

      matches.push({
        id: file.id,
        name: file.name,
        parentId,
      });
    }

    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return matches;
}

async function createFolder(args: {
  drive: DriveClientLike;
  parentFolderId: string;
  folderName: string;
}): Promise<DriveFolderReference> {
  const response = await withRetries(() =>
    args.drive.files.create({
      requestBody: {
        name: args.folderName,
        mimeType: DRIVE_FOLDER_MIME,
        parents: [args.parentFolderId],
      },
      fields: "id,name",
      supportsAllDrives: true,
    }),
  );

  if (!response.data.id || !response.data.name) {
    throw new GoogleDriveIntegrationError(
      "UNKNOWN",
      "Google Drive did not return folder metadata after folder creation.",
      true,
    );
  }

  return {
    id: response.data.id,
    name: response.data.name,
    parentId: args.parentFolderId,
  };
}

export async function getOrCreateChildFolder(args: {
  drive: DriveClientLike;
  parentFolderId: string;
  folderName: string;
}): Promise<DriveFolderReference> {
  const existing = await listChildFoldersByName(args);
  if (existing.length > 0) {
    return existing[0];
  }

  try {
    return await createFolder(args);
  } catch (error) {
    const integrationError = toGoogleDriveIntegrationError(error);
    if (integrationError.code !== "CONFLICT" && integrationError.code !== "TRANSIENT") {
      throw integrationError;
    }
  }

  const fallback = await listChildFoldersByName(args);
  if (fallback.length > 0) {
    return fallback[0];
  }

  throw new GoogleDriveIntegrationError(
    "UNKNOWN",
    "Could not create or retrieve Google Drive folder.",
    true,
  );
}

export async function ensureWeddingFolders(args: {
  drive: DriveClientLike;
  rootFolderId: string;
}): Promise<EnsureWeddingFoldersResult> {
  await verifyRootFolderAccess({
    drive: args.drive,
    rootFolderId: args.rootFolderId,
  });

  const groomFolder = await getOrCreateChildFolder({
    drive: args.drive,
    parentFolderId: args.rootFolderId,
    folderName: "Groom",
  });

  const brideFolder = await getOrCreateChildFolder({
    drive: args.drive,
    parentFolderId: args.rootFolderId,
    folderName: "Bride",
  });

  return {
    rootFolderId: args.rootFolderId,
    groomFolderId: groomFolder.id,
    brideFolderId: brideFolder.id,
  };
}

export function formatFamilyFolderName(args: {
  registrationId: string;
  familyName: string;
}): string {
  const safeFamilyName = args.familyName.trim() || "Family";
  const normalized = safeFamilyName.replace(/\s+/g, " ").slice(0, 60);
  return `${normalized} - ${args.registrationId}`;
}

export async function ensureFamilyFolder(args: {
  drive: DriveClientLike;
  store: RegistrationOperationStore;
  registrationId: string;
  weddingParty: WeddingParty;
  familyName: string;
  groomFolderId: string;
  brideFolderId: string;
}): Promise<DriveFolderReference> {
  const persisted = await args.store.findByRegistrationId(args.registrationId);
  if (persisted?.familyFolderId) {
    const folderMeta = await withRetries(() =>
      args.drive.files.get({
        fileId: persisted.familyFolderId!,
        fields: "id,name,mimeType,parents",
        supportsAllDrives: true,
      }),
    );

    if (folderMeta.data.mimeType !== DRIVE_FOLDER_MIME) {
      throw new GoogleDriveIntegrationError(
        "VALIDATION",
        "Persisted family folder reference is invalid.",
        false,
      );
    }

    const expectedParentId = args.weddingParty === "groom" ? args.groomFolderId : args.brideFolderId;
    if (folderMeta.data.parents?.[0] !== expectedParentId) {
      throw new GoogleDriveIntegrationError(
        "VALIDATION",
        "Persisted family folder does not belong to expected wedding side folder.",
        false,
      );
    }

    return {
      id: persisted.familyFolderId,
      name: folderMeta.data.name ?? formatFamilyFolderName({
        registrationId: args.registrationId,
        familyName: args.familyName,
      }),
      parentId: expectedParentId,
    };
  }

  const expectedParentId = args.weddingParty === "groom" ? args.groomFolderId : args.brideFolderId;
  const expectedName = formatFamilyFolderName({
    registrationId: args.registrationId,
    familyName: args.familyName,
  });

  const folder = await getOrCreateChildFolder({
    drive: args.drive,
    parentFolderId: expectedParentId,
    folderName: expectedName,
  });

  const operationRecord =
    persisted ??
    ({
      registrationId: args.registrationId,
      weddingParty: args.weddingParty,
      familyName: args.familyName,
      uploadedDocumentIds: {},
      status: "pending",
    } as const);

  await args.store.save({
    ...operationRecord,
    familyFolderId: folder.id,
  });

  return folder;
}
