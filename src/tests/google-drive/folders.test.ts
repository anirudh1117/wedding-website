import { describe, expect, it, vi } from "vitest";
import {
  ensureFamilyFolder,
  ensureWeddingFolders,
  formatFamilyFolderName,
} from "@/lib/google-drive";
import type {
  DriveClientLike,
  RegistrationOperationRecord,
  RegistrationOperationStore,
} from "@/lib/google-drive/types";

function createStore(initial?: RegistrationOperationRecord): RegistrationOperationStore {
  const map = new Map<string, RegistrationOperationRecord>();
  if (initial) {
    map.set(initial.registrationId, initial);
  }

  return {
    async findByRegistrationId(registrationId: string) {
      return map.get(registrationId) ?? null;
    },
    async save(record: RegistrationOperationRecord) {
      map.set(record.registrationId, { ...record });
    },
  };
}

function createDriveMock(): DriveClientLike {
  return {
    files: {
      get: vi.fn(),
      list: vi.fn(),
      create: vi.fn(),
    },
  } as unknown as DriveClientLike;
}

describe("google-drive folders", () => {
  it("creates or retrieves Groom and Bride folders under configured root", async () => {
    const drive = createDriveMock();

    vi.mocked(drive.files.get).mockResolvedValueOnce({
      data: { id: "root-1", name: "Wedding Documents", mimeType: "application/vnd.google-apps.folder" },
    });

    vi.mocked(drive.files.list)
      .mockResolvedValueOnce({ data: { files: [] } })
      .mockResolvedValueOnce({ data: { files: [] } });

    vi.mocked(drive.files.create)
      .mockResolvedValueOnce({ data: { id: "groom-folder", name: "Groom" } })
      .mockResolvedValueOnce({ data: { id: "bride-folder", name: "Bride" } });

    const folders = await ensureWeddingFolders({
      drive,
      rootFolderId: "root-1",
    });

    expect(folders.groomFolderId).toBe("groom-folder");
    expect(folders.brideFolderId).toBe("bride-folder");
  });

  it("builds readable family folder names with opaque registration id", () => {
    const name = formatFamilyFolderName({
      registrationId: "G-opaque-123",
      familyName: "Sharma",
    });

    expect(name).toContain("Sharma");
    expect(name).toContain("G-opaque-123");
  });

  it("reuses persisted family folder id for retries", async () => {
    const drive = createDriveMock();
    const store = createStore({
      registrationId: "G-reg-1",
      weddingParty: "groom",
      familyName: "Sharma",
      familyFolderId: "family-folder-1",
      uploadedDocumentIds: {},
      status: "pending",
    });

    vi.mocked(drive.files.get).mockResolvedValueOnce({
      data: {
        id: "family-folder-1",
        name: "Sharma - G-reg-1",
        mimeType: "application/vnd.google-apps.folder",
        parents: ["groom-folder"],
      },
    });

    const folder = await ensureFamilyFolder({
      drive,
      store,
      registrationId: "G-reg-1",
      weddingParty: "groom",
      familyName: "Sharma",
      groomFolderId: "groom-folder",
      brideFolderId: "bride-folder",
    });

    expect(folder.id).toBe("family-folder-1");
    expect(vi.mocked(drive.files.create)).not.toHaveBeenCalled();
  });

  it("creates family folder in correct party parent", async () => {
    const drive = createDriveMock();
    const store = createStore();

    vi.mocked(drive.files.list).mockResolvedValueOnce({ data: { files: [] } });
    vi.mocked(drive.files.create).mockResolvedValueOnce({
      data: { id: "family-bride-folder", name: "Patel - B-reg-1" },
    });

    const folder = await ensureFamilyFolder({
      drive,
      store,
      registrationId: "B-reg-1",
      weddingParty: "bride",
      familyName: "Patel",
      groomFolderId: "groom-folder",
      brideFolderId: "bride-folder",
    });

    expect(folder.parentId).toBe("bride-folder");
    expect(vi.mocked(drive.files.create).mock.calls[0]?.[0]?.requestBody?.parents?.[0]).toBe(
      "bride-folder",
    );
  });
});
