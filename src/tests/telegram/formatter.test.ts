import { describe, expect, it } from "vitest";
import { buildTelegramRegistrationMessage } from "@/lib/telegram";

describe("telegram formatter", () => {
  it("escapes dynamic values and includes required summary fields", () => {
    const message = buildTelegramRegistrationMessage({
      registrationId: "G-123",
      weddingParty: "groom",
      familyName: "Sharma <Family>",
      guestNames: ["Rahul", "Priya & Sons"],
      summary: {
        groomFamilyCount: 12,
        groomGuestCount: 38,
        brideFamilyCount: 15,
        brideGuestCount: 47,
        overallFamilyCount: 27,
        overallGuestCount: 85,
      },
    });

    expect(message).toContain("Groom's Side");
    expect(message).toContain("लड़के वाले");
    expect(message).toContain("Sharma &lt;Family&gt;");
    expect(message).toContain("Priya &amp; Sons");
    expect(message).toContain("Overall");
    expect(message).not.toContain("drive.google.com/drive/folders/");
  });
});
