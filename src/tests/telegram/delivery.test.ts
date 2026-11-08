import { describe, expect, it, vi } from "vitest";
import { sendRegistrationNotifications } from "@/lib/telegram";
import type { RegistrationOperationRecord } from "@/lib/google-drive/types";

function createStore(record: RegistrationOperationRecord) {
  let current = { ...record };
  return {
    async findByRegistrationId(registrationId: string) {
      return current.registrationId === registrationId ? { ...current } : null;
    },
    async save(next: RegistrationOperationRecord) {
      current = { ...next };
    },
  };
}

describe("telegram delivery", () => {
  it("skips already-notified chats (idempotent)", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123456:ABC_DEF_token");
    vi.stubEnv("TELEGRAM_GROOM_CHAT_ID", "chat-groom");
    vi.stubEnv("TELEGRAM_BRIDE_CHAT_ID", "chat-bride");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const store = createStore({
      registrationId: "G-1",
      weddingParty: "groom",
      familyName: "Sharma",
      uploadedDocumentIds: {},
      status: "completed",
      telegramNotifiedChatIds: ["chat-groom", "chat-bride"],
      telegramNotificationStatus: "sent",
    });

    const result = await sendRegistrationNotifications({
      operationStore: store,
      payload: {
        registrationId: "G-1",
        weddingParty: "groom",
        familyName: "Sharma",
        guestNames: ["A", "B"],
        summary: {
          groomFamilyCount: 1,
          groomGuestCount: 2,
          brideFamilyCount: 0,
          brideGuestCount: 0,
          overallFamilyCount: 1,
          overallGuestCount: 2,
        },
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.skippedAsAlreadySent).toHaveLength(2);
    }
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
