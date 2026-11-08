import { describe, expect, it, vi } from "vitest";
import {
  EncryptionNotConfiguredService,
  uploadEncryptedGuestDocument,
} from "@/lib/google-drive";
import type {
  DriveClientLike,
  EncryptionService,
  RegistrationOperationRecord,
  RegistrationOperationStore,
} from "@/lib/google-drive/types";

function createDriveMock(): DriveClientLike {
  return {
    files: {
      get: vi.fn(),
      list: vi.fn(),
      create: vi.fn(),
    },
  } as unknown as DriveClientLike;
}

function createStore(record: RegistrationOperationRecord): RegistrationOperationStore {
  let current = record;
  return {
    async findByRegistrationId(registrationId: string) {
      return current.registrationId === registrationId ? current : null;
    },
    async save(recordToSave: RegistrationOperationRecord) {
      current = { ...recordToSave };
    },
  };
}

class FakeEncryptionService implements EncryptionService {
  isConfigured(): boolean {
    return true;
  }

  async encryptGuestDocument(): Promise<{
    encryptedBytes: Buffer;
    contentType: "application/octet-stream";
    encryptionVersion: string;
  }> {
    return {
      encryptedBytes: Buffer.from("encrypted-bytes"),
      contentType: "application/octet-stream",
      encryptionVersion: "v1-test",
    };
  }
}

describe("google-drive uploads", () => {
  it("rejects when encryption is not configured", async () => {
    const drive = createDriveMock();
    const store = createStore({
      registrationId: "G-reg-1",
      weddingParty: "groom",
      familyName: "Sharma",
      uploadedDocumentIds: {},
      status: "pending",
      familyFolderId: "family-1",
    });

    await expect(
      uploadEncryptedGuestDocument({
        drive,
        encryptionService: new EncryptionNotConfiguredService(),
        operationStore: store,
        currentOperation: {
          registrationId: "G-reg-1",
          weddingParty: "groom",
          familyName: "Sharma",
          uploadedDocumentIds: {},
          status: "pending",
          familyFolderId: "family-1",
        },
        input: {
          registrationId: "G-reg-1",
          familyFolderId: "family-1",
          guest: {
            guestIndex: 0,
            guestFullName: "Guest One",
            originalFileName: "aadhaar.pdf",
            mimeType: "application/pdf",
            byteSize: 1024,
          },
          plainBytes: Buffer.from("%PDF-test"),
        },
      }),
    ).rejects.toThrowError(/Encryption service is not configured/i);
  });

  it("uploads original document bytes and persists file id", async () => {
    const drive = createDriveMock();
    const store = createStore({
      registrationId: "G-reg-2",
      weddingParty: "groom",
      familyName: "Sharma",
      uploadedDocumentIds: {},
      status: "pending",
      familyFolderId: "family-2",
    });

    vi.mocked(drive.files.create).mockResolvedValueOnce({
      data: { id: "file-1", name: "01-Guest-One.pdf", size: "512" },
    });

    const result = await uploadEncryptedGuestDocument({
      drive,
      encryptionService: new FakeEncryptionService(),
      operationStore: store,
      currentOperation: {
        registrationId: "G-reg-2",
        weddingParty: "groom",
        familyName: "Sharma",
        uploadedDocumentIds: {},
        status: "pending",
        familyFolderId: "family-2",
      },
      input: {
        registrationId: "G-reg-2",
        familyFolderId: "family-2",
        guest: {
          guestIndex: 0,
          guestFullName: "Guest One",
          originalFileName: "aadhaar.pdf",
          mimeType: "application/pdf",
          byteSize: 1024,
        },
        plainBytes: Buffer.from("%PDF-test"),
      },
    });

    expect(result.fileId).toBe("file-1");
    expect(vi.mocked(drive.files.create)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(drive.files.create).mock.calls[0]?.[0]?.requestBody?.mimeType).toBe(
      "application/pdf",
    );
    expect(vi.mocked(drive.files.create).mock.calls[0]?.[0]?.requestBody?.name).toBe(
      "01-Guest-One.pdf",
    );
  });

  it("rejects unsupported mime type", async () => {
    const drive = createDriveMock();
    const store = createStore({
      registrationId: "G-reg-3",
      weddingParty: "groom",
      familyName: "Sharma",
      uploadedDocumentIds: {},
      status: "pending",
      familyFolderId: "family-3",
    });

    await expect(
      uploadEncryptedGuestDocument({
        drive,
        encryptionService: new FakeEncryptionService(),
        operationStore: store,
        currentOperation: {
          registrationId: "G-reg-3",
          weddingParty: "groom",
          familyName: "Sharma",
          uploadedDocumentIds: {},
          status: "pending",
          familyFolderId: "family-3",
        },
        input: {
          registrationId: "G-reg-3",
          familyFolderId: "family-3",
          guest: {
            guestIndex: 0,
            guestFullName: "Guest One",
            originalFileName: "aadhaar.gif",
            mimeType: "image/gif" as never,
            byteSize: 1024,
          },
          plainBytes: Buffer.from("GIF89a"),
        },
      }),
    ).rejects.toThrowError(/Unsupported guest document MIME type/i);
  });
});
