import "server-only";

export type WeddingParty = "groom" | "bride";

export type DocumentMimeType = "image/jpeg" | "image/png" | "application/pdf";

export type GuestDocumentMetadata = {
  guestIndex: number;
  guestFullName: string;
  originalFileName: string;
  mimeType: DocumentMimeType;
  byteSize: number;
};

export type FamilyRegistrationRecord = {
  registrationId: string;
  weddingParty: WeddingParty;
  familyName: string;
  contactNumber: string;
  guestDocuments: GuestDocumentMetadata[];
};

export type RegistrationOperationStatus =
  | "pending"
  | "partially_uploaded"
  | "completed"
  | "failed";

export type RegistrationOperationRecord = {
  registrationId: string;
  weddingParty: WeddingParty;
  familyName: string;
  familyFolderId?: string;
  uploadedDocumentIds: Record<number, string>;
  status: RegistrationOperationStatus;
  telegramNotifiedChatIds?: string[];
  telegramNotificationStatus?: "pending" | "partially_sent" | "sent" | "failed";
  telegramLastAttemptAtIso?: string;
  lastErrorCode?: string;
};

export type RegistrationOperationStore = {
  findByRegistrationId(registrationId: string): Promise<RegistrationOperationRecord | null>;
  save(record: RegistrationOperationRecord): Promise<void>;
};

export type EncryptionResult = {
  encryptedBytes: Buffer;
  contentType: "application/octet-stream";
  encryptionVersion: string;
};

export type EncryptionService = {
  isConfigured(): boolean;
  encryptGuestDocument(input: {
    registrationId: string;
    guestIndex: number;
    plainBytes: Buffer;
    plainMimeType: DocumentMimeType;
  }): Promise<EncryptionResult>;
};

export type DriveFolderReference = {
  id: string;
  name: string;
  parentId: string;
};

export type DriveUploadResult = {
  fileId: string;
  fileName: string;
  byteSize: number;
};

export type EnsureWeddingFoldersResult = {
  rootFolderId: string;
  groomFolderId: string;
  brideFolderId: string;
};

export type RegistrationIntegrationResult =
  | {
      ok: true;
      registrationId: string;
      status: "completed";
      familyFolderId: string;
      uploads: Array<{ guestIndex: number; uploaded: true }>;
    }
  | {
      ok: false;
      registrationId: string;
      status: "pending" | "partially_uploaded" | "failed";
      code:
        | "ENCRYPTION_NOT_CONFIGURED"
        | "PERSISTENCE_REQUIRED"
        | "GOOGLE_DRIVE_UNAVAILABLE"
        | "GOOGLE_DRIVE_FORBIDDEN"
        | "GOOGLE_DRIVE_NOT_FOUND"
        | "INVALID_INPUT"
        | "TRANSIENT_UPSTREAM_FAILURE";
      message: string;
      retryable: boolean;
    };

export type DriveClientLike = {
  files: {
    get: (args: {
      fileId: string;
      fields?: string;
      supportsAllDrives?: boolean;
    }) => Promise<{ data: { id?: string; name?: string; mimeType?: string; parents?: string[] } }>;
    list: (args: {
      q: string;
      fields?: string;
      includeItemsFromAllDrives?: boolean;
      supportsAllDrives?: boolean;
      pageToken?: string;
      pageSize?: number;
    }) => Promise<{
      data: {
        files?: Array<{ id?: string; name?: string; mimeType?: string; parents?: string[] }>;
        nextPageToken?: string;
      };
    }>;
    create: (args: {
      requestBody: {
        name: string;
        mimeType: string;
        parents?: string[];
      };
      media?: {
        mimeType?: string;
        body: NodeJS.ReadableStream;
      };
      fields?: string;
      supportsAllDrives?: boolean;
    }) => Promise<{ data: { id?: string; name?: string; size?: string } }>;
  };
};
