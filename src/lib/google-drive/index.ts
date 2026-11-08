import "server-only";

import { createDriveClient, getGoogleDriveConfigFromEnv } from "./client";
import {
  GoogleDriveIntegrationError,
  toGoogleDriveIntegrationError,
} from "./errors";
import {
  ensureFamilyFolder,
  ensureWeddingFolders,
  formatFamilyFolderName,
} from "./folders";
import type {
  DocumentMimeType,
  EncryptionService,
  FamilyRegistrationRecord,
  RegistrationIntegrationResult,
  RegistrationOperationRecord,
  RegistrationOperationStore,
  WeddingParty,
} from "./types";
import { uploadEncryptedGuestDocument } from "./uploads";

export {
  ensureFamilyFolder,
  ensureWeddingFolders,
  formatFamilyFolderName,
  uploadEncryptedGuestDocument,
  createDriveClient,
  getGoogleDriveConfigFromEnv,
};

export class EncryptionNotConfiguredService implements EncryptionService {
  isConfigured(): boolean {
    return false;
  }

  async encryptGuestDocument(): Promise<never> {
    throw new GoogleDriveIntegrationError(
      "ENCRYPTION_NOT_CONFIGURED",
      "Encryption service has not been configured.",
      false,
    );
  }
}

function partyPrefix(party: WeddingParty): "G" | "B" {
  return party === "groom" ? "G" : "B";
}

function createSafeRegistrationToken(): string {
  const bytes = new Uint8Array(12);

  if (typeof globalThis !== "undefined" && "crypto" in globalThis && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function generateRegistrationId(party: WeddingParty): string {
  return `${partyPrefix(party)}-${createSafeRegistrationToken()}`;
}

export type RegisterFamilyDriveInput = {
  registration: FamilyRegistrationRecord;
  guestFileBytesByIndex: Record<number, Buffer>;
};

export async function registerFamilyInDrive(args: {
  operationStore: RegistrationOperationStore;
  encryptionService: EncryptionService;
  input: RegisterFamilyDriveInput;
}): Promise<RegistrationIntegrationResult> {
  try {
    if (!args.encryptionService.isConfigured()) {
      return {
        ok: false,
        registrationId: args.input.registration.registrationId,
        status: "pending",
        code: "ENCRYPTION_NOT_CONFIGURED",
        message:
          "Secure document encryption is not configured yet, so uploads remain disabled.",
        retryable: false,
      };
    }

    const baseDriveConfig = getGoogleDriveConfigFromEnv();
    const integration = await import("@/lib/google/oauth").then((mod) => mod.getGoogleIntegrationRecord());
    const driveConfig = {
      ...baseDriveConfig,
      rootFolderId: baseDriveConfig.rootFolderId || integration?.driveRootFolderId || "",
      sangeetRootFolderId: baseDriveConfig.sangeetRootFolderId || integration?.sangeetFolderId || "",
    };
    const drive = await createDriveClient(driveConfig);

    const folders = await ensureWeddingFolders({
      drive,
      rootFolderId: driveConfig.rootFolderId,
    });

    const familyFolder = await ensureFamilyFolder({
      drive,
      store: args.operationStore,
      registrationId: args.input.registration.registrationId,
      weddingParty: args.input.registration.weddingParty,
      familyName: args.input.registration.familyName,
      groomFolderId: folders.groomFolderId,
      brideFolderId: folders.brideFolderId,
    });

    const persisted = await args.operationStore.findByRegistrationId(
      args.input.registration.registrationId,
    );

    if (!persisted) {
      return {
        ok: false,
        registrationId: args.input.registration.registrationId,
        status: "pending",
        code: "PERSISTENCE_REQUIRED",
        message:
          "Persistent operation tracking is required before secure Drive uploads can be completed.",
        retryable: false,
      };
    }

    let currentOperation: RegistrationOperationRecord = {
      ...persisted,
      familyFolderId: familyFolder.id,
      weddingParty: args.input.registration.weddingParty,
      familyName: args.input.registration.familyName,
      status: persisted.status,
    };

    await args.operationStore.save(currentOperation);

    const uploads: Array<{ guestIndex: number; uploaded: true }> = [];

    for (const guestDocument of args.input.registration.guestDocuments) {
      const plainBytes = args.input.guestFileBytesByIndex[guestDocument.guestIndex];
      if (!plainBytes) {
        throw new GoogleDriveIntegrationError(
          "VALIDATION",
          "Missing guest document bytes for upload operation.",
          false,
        );
      }

      const result = await uploadEncryptedGuestDocument({
        drive,
        encryptionService: args.encryptionService,
        operationStore: args.operationStore,
        currentOperation,
        input: {
          registrationId: args.input.registration.registrationId,
          familyFolderId: familyFolder.id,
          guest: {
            guestIndex: guestDocument.guestIndex,
            guestFullName: guestDocument.guestFullName,
            originalFileName: guestDocument.originalFileName,
            mimeType: guestDocument.mimeType as DocumentMimeType,
            byteSize: guestDocument.byteSize,
          },
          plainBytes,
        },
      });

      currentOperation = {
        ...currentOperation,
        uploadedDocumentIds: {
          ...currentOperation.uploadedDocumentIds,
          [guestDocument.guestIndex]: result.fileId,
        },
        status: "partially_uploaded",
      };

      await args.operationStore.save(currentOperation);
      uploads.push({ guestIndex: guestDocument.guestIndex, uploaded: true });
    }

    currentOperation = {
      ...currentOperation,
      status: "completed",
      lastErrorCode: undefined,
    };

    await args.operationStore.save(currentOperation);

    return {
      ok: true,
      registrationId: args.input.registration.registrationId,
      status: "completed",
      familyFolderId: familyFolder.id,
      uploads,
    };
  } catch (error) {
    const integrationError = toGoogleDriveIntegrationError(error);
    const isForbidden = integrationError.code === "PERMISSION_DENIED";
    const isMissing = integrationError.code === "NOT_FOUND";

    return {
      ok: false,
      registrationId: args.input.registration.registrationId,
      status: "failed",
      code: isForbidden
        ? "GOOGLE_DRIVE_FORBIDDEN"
        : isMissing
          ? "GOOGLE_DRIVE_NOT_FOUND"
          : integrationError.code === "TRANSIENT"
            ? "TRANSIENT_UPSTREAM_FAILURE"
            : integrationError.code === "VALIDATION"
              ? "INVALID_INPUT"
              : "GOOGLE_DRIVE_UNAVAILABLE",
      message: integrationError.message,
      retryable: integrationError.retryable,
    };
  }
}
