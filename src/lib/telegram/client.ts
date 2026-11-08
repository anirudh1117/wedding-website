import "server-only";

import { setTimeout as delay } from "node:timers/promises";
import { TelegramIntegrationError, toTelegramIntegrationError } from "./errors";
import type {
  TelegramApiClient,
  TelegramNotificationConfig,
  TelegramRecipient,
  TelegramSendMessageRequest,
} from "./types";

const TELEGRAM_BASE = "https://api.telegram.org";

export function getTelegramConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TelegramNotificationConfig {
  const botToken = env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const groomChatId = env.TELEGRAM_GROOM_CHAT_ID?.trim() ?? "";
  const brideChatId = env.TELEGRAM_BRIDE_CHAT_ID?.trim() ?? "";

  if (!botToken || !groomChatId || !brideChatId) {
    throw new TelegramIntegrationError(
      "CONFIG_MISSING",
      "Telegram notification configuration is incomplete.",
      false,
    );
  }

  if (!/^[0-9]+:[A-Za-z0-9_-]+$/.test(botToken)) {
    throw new TelegramIntegrationError(
      "CONFIG_INVALID",
      "Telegram bot token format is invalid.",
      false,
    );
  }

  return {
    botToken,
    groomChatId,
    brideChatId,
  };
}

export function getTelegramRecipients(
  config: TelegramNotificationConfig,
): TelegramRecipient[] {
  return [
    {
      chatId: config.groomChatId,
      side: "groom_host",
    },
    {
      chatId: config.brideChatId,
      side: "bride_host",
    },
  ];
}

export function createTelegramApiClient(
  config = getTelegramConfigFromEnv(),
): TelegramApiClient {
  return {
    async sendMessage(request: TelegramSendMessageRequest) {
      const url = `${TELEGRAM_BASE}/bot${config.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: request.chatId,
          text: request.text,
          parse_mode: request.parseMode,
          disable_web_page_preview: request.disableWebPagePreview ?? true,
        }),
      });

      return {
        ok: response.ok,
        statusCode: response.status,
      };
    },
  };
}

export async function sendTelegramMessageWithRetry(args: {
  apiClient: TelegramApiClient;
  request: TelegramSendMessageRequest;
  maxRetries?: number;
}): Promise<void> {
  const maxRetries = args.maxRetries ?? 2;
  let attempt = 0;

  while (true) {
    try {
      const result = await args.apiClient.sendMessage(args.request);
      if (result.ok) {
        return;
      }

      throw new TelegramIntegrationError(
        "UNKNOWN",
        "Telegram message request failed.",
        result.statusCode === 429 || result.statusCode >= 500,
      );
    } catch (error) {
      const normalized = toTelegramIntegrationError(error);
      if (!normalized.retryable || attempt >= maxRetries) {
        throw normalized;
      }

      attempt += 1;
      const backoffMs = 200 * 2 ** (attempt - 1);
      await delay(backoffMs);
    }
  }
}
