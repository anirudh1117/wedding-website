import "server-only";

import { Readable } from "node:stream";
import {
  ACCEPTED_AADHAAR_MIME_TYPES,
  MAX_AADHAAR_FILE_BYTES,
} from "@/lib/registration/constants";
import { sanitizeFileName } from "@/lib/registration/helpers";
import { GoogleDriveIntegrationError } from "./errors";
import type {
  DocumentMimeType,
  DriveClientLike,
  DriveUploadResult,
  EncryptionService,
  GuestDocumentMetadata,
  RegistrationOperationRecord,
  RegistrationOperationStore,
} from "./types";

export type GuestUploadInput = {
  registrationId: string;
  familyFolderId: string;
  guest: GuestDocumentMetadata;
  plainBytes: Buffer;
};

function assertDocumentMetadata(guest: GuestDocumentMetadata): void {
  if (guest.byteSize <= 0 || guest.byteSize > MAX_AADHAAR_FILE_BYTES) {
    throw new GoogleDriveIntegrationError(
      "VALIDATION",
      "Guest document size is invalid.",
      false,
    );
  }

  if (!ACCEPTED_AADHAAR_MIME_TYPES.includes(guest.mimeType)) {
    throw new GoogleDriveIntegrationError(
      "VALIDATION",
      "Unsupported guest document MIME type.",
      false,
    );
  }
}

function detectSimpleSignature(bytes: Buffer): DocumentMimeType | null {
  if (bytes.length >= 4) {
    const header = bytes.subarray(0, 4);
    if (
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46
    ) {
      return "application/pdf";
    }
  }

  if (bytes.length >= 3) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
  }

  if (bytes.length >= 8) {
    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    const matches = pngSig.every((value, index) => bytes[index] === value);
    if (matches) {
      return "image/png";
    }
  }

  return null;
}

function assertFileContentMatches(guest: GuestDocumentMetadata, bytes: Buffer): void {
  const signature = detectSimpleSignature(bytes);
  if (!signature || signature !== guest.mimeType) {
    throw new GoogleDriveIntegrationError(
      "VALIDATION",
      "Document content does not match the declared file type.",
      false,
    );
  }
}

function getOriginalStorageName(args: {
  guestIndex: number;
  guestFullName: string;
  originalFileName: string;
  mimeType: DocumentMimeType;
}): string {
  const safeGuestName = sanitizeFileName(args.guestFullName)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `Guest-${args.guestIndex + 1}`;
  const extension = args.mimeType === "image/jpeg" ? "jpg" : args.mimeType === "image/png" ? "png" : "pdf";
  return `${String(args.guestIndex + 1).padStart(2, "0")}-${safeGuestName}.${extension}`;
}

export async function uploadEncryptedGuestDocument(args: {
  drive: DriveClientLike;
  encryptionService: EncryptionService;
  operationStore: RegistrationOperationStore;
  currentOperation: RegistrationOperationRecord;
  input: GuestUploadInput;
}): Promise<DriveUploadResult> {
  assertDocumentMetadata(args.input.guest);
  assertFileContentMatches(args.input.guest, args.input.plainBytes);

  if (!args.encryptionService.isConfigured()) {
    throw new GoogleDriveIntegrationError(
      "ENCRYPTION_NOT_CONFIGURED",
      "Encryption service is not configured. Plaintext uploads are disabled.",
      false,
    );
  }

  const existingFileId = args.currentOperation.uploadedDocumentIds[args.input.guest.guestIndex];
  if (existingFileId) {
    return {
      fileId: existingFileId,
      fileName: getOriginalStorageName({
        guestIndex: args.input.guest.guestIndex,
        guestFullName: args.input.guest.guestFullName,
        originalFileName: args.input.guest.originalFileName,
        mimeType: args.input.guest.mimeType,
      }),
      byteSize: args.input.guest.byteSize,
    };
  }

  const fileName = getOriginalStorageName({
    guestIndex: args.input.guest.guestIndex,
    guestFullName: args.input.guest.guestFullName,
    originalFileName: args.input.guest.originalFileName,
    mimeType: args.input.guest.mimeType,
  });

  const created = await args.drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: args.input.guest.mimeType,
      parents: [args.input.familyFolderId],
    },
    media: {
      mimeType: args.input.guest.mimeType,
      body: Readable.from(args.input.plainBytes),
    },
    fields: "id,name,size",
    supportsAllDrives: true,
  });

  if (!created.data.id) {
    throw new GoogleDriveIntegrationError(
      "UNKNOWN",
      "Google Drive did not return an uploaded file identifier.",
      true,
    );
  }

  const updatedOperation: RegistrationOperationRecord = {
    ...args.currentOperation,
    uploadedDocumentIds: {
      ...args.currentOperation.uploadedDocumentIds,
      [args.input.guest.guestIndex]: created.data.id,
    },
  };

  await args.operationStore.save(updatedOperation);

  return {
    fileId: created.data.id,
    fileName: created.data.name ?? fileName,
    byteSize: Number(created.data.size ?? args.input.plainBytes.byteLength),
  };
}
