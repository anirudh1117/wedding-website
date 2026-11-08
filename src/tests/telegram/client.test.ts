import { describe, expect, it } from "vitest";
import { getTelegramConfigFromEnv, getTelegramRecipients } from "@/lib/telegram";

describe("telegram client config", () => {
  it("loads valid config from env", () => {
    const config = getTelegramConfigFromEnv({
      NODE_ENV: "test",
      TELEGRAM_BOT_TOKEN: "123456:ABC_DEF_token",
      TELEGRAM_GROOM_CHAT_ID: "-100111",
      TELEGRAM_BRIDE_CHAT_ID: "-100222",
    });

    const recipients = getTelegramRecipients(config);
    expect(recipients).toHaveLength(2);
  });

  it("fails safely for missing config", () => {
    expect(() => getTelegramConfigFromEnv({ NODE_ENV: "test" })).toThrowError(/incomplete/i);
  });
});
