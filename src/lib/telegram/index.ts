import "server-only";

import {
  createTelegramApiClient,
  getTelegramConfigFromEnv,
  getTelegramRecipients,
  sendTelegramMessageWithRetry,
} from "./client";
import { toTelegramIntegrationError } from "./errors";
import { buildTelegramRegistrationMessage } from "./formatter";
import type {
  TelegramNotificationJobInput,
  TelegramNotificationJobResult,
} from "./types";

export {
  createTelegramApiClient,
  getTelegramConfigFromEnv,
  getTelegramRecipients,
  sendTelegramMessageWithRetry,
  buildTelegramRegistrationMessage,
};

export async function sendRegistrationNotifications(
  input: TelegramNotificationJobInput,
): Promise<TelegramNotificationJobResult> {
  try {
    const config = getTelegramConfigFromEnv();
    const recipients = getTelegramRecipients(config);
    const apiClient = createTelegramApiClient(config);

    const operation = await input.operationStore.findByRegistrationId(
      input.payload.registrationId,
    );

    const alreadySent = new Set(operation?.telegramNotifiedChatIds ?? []);
    const sentTo: string[] = [];
    const skippedAsAlreadySent: string[] = [];
    const failedChatIds: string[] = [];

    const message = buildTelegramRegistrationMessage(input.payload);

    for (const recipient of recipients) {
      if (alreadySent.has(recipient.chatId)) {
        skippedAsAlreadySent.push(recipient.chatId);
        continue;
      }

      try {
        await sendTelegramMessageWithRetry({
          apiClient,
          request: {
            chatId: recipient.chatId,
            text: message,
            parseMode: "HTML",
            disableWebPagePreview: true,
          },
        });

        sentTo.push(recipient.chatId);
        alreadySent.add(recipient.chatId);

        if (operation) {
          await input.operationStore.save({
            ...operation,
            telegramNotifiedChatIds: Array.from(alreadySent),
            telegramNotificationStatus:
              alreadySent.size === recipients.length ? "sent" : "partially_sent",
            telegramLastAttemptAtIso: new Date().toISOString(),
          });
        }
      } catch {
        failedChatIds.push(recipient.chatId);
      }
    }

    if (failedChatIds.length > 0) {
      if (operation) {
        await input.operationStore.save({
          ...operation,
          telegramNotifiedChatIds: Array.from(alreadySent),
          telegramNotificationStatus:
            sentTo.length > 0 ? "partially_sent" : "failed",
          telegramLastAttemptAtIso: new Date().toISOString(),
          lastErrorCode: "TELEGRAM_DELIVERY_FAILED",
        });
      }

      return {
        ok: false,
        sentTo,
        failedChatIds,
        retryable: true,
        message: "Telegram notification delivery failed for one or more recipients.",
      };
    }

    return {
      ok: true,
      sentTo,
      skippedAsAlreadySent,
    };
  } catch (error) {
    const normalized = toTelegramIntegrationError(error);
    return {
      ok: false,
      sentTo: [],
      failedChatIds: [],
      retryable: normalized.retryable,
      message: normalized.message,
    };
  }
}
