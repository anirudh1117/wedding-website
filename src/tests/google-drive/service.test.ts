import { describe, expect, it } from "vitest";
import {
  EncryptionNotConfiguredService,
  registerFamilyInDrive,
} from "@/lib/google-drive";
import type { RegistrationOperationRecord } from "@/lib/google-drive/types";

function createStore(record?: RegistrationOperationRecord) {
  let current = record ?? null;
  return {
    async findByRegistrationId(registrationId: string) {
      if (current?.registrationId === registrationId) {
        return current;
      }
      return null;
    },
    async save(next: RegistrationOperationRecord) {
      current = { ...next };
    },
  };
}

describe("google-drive service boundary", () => {
  it("returns pending when encryption is not configured", async () => {
    const registrationId = "G-reg-pending";
    const result = await registerFamilyInDrive({
      operationStore: createStore({
        registrationId,
        weddingParty: "groom",
        familyName: "Sharma",
        uploadedDocumentIds: {},
        status: "pending",
      }),
      encryptionService: new EncryptionNotConfiguredService(),
      input: {
        registration: {
          registrationId,
          weddingParty: "groom",
          familyName: "Sharma",
          contactNumber: "+919999999999",
          guestDocuments: [],
        },
        guestFileBytesByIndex: {},
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("ENCRYPTION_NOT_CONFIGURED");
      expect(result.retryable).toBe(false);
    }
  });
});
