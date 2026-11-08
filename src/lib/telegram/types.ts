import "server-only";

import type { SummaryMetrics } from "@/lib/google-sheets/types";
import type { WeddingParty, RegistrationOperationStore } from "@/lib/google-drive/types";

export type TelegramNotificationConfig = {
  botToken: string;
  groomChatId: string;
  brideChatId: string;
};

export type TelegramRecipient = {
  chatId: string;
  side: "groom_host" | "bride_host";
};

export type TelegramSendMessageRequest = {
  chatId: string;
  text: string;
  parseMode: "HTML" | "MarkdownV2";
  disableWebPagePreview?: boolean;
};

export type TelegramSendMessageResult = {
  ok: boolean;
  statusCode: number;
};

export type TelegramApiClient = {
  sendMessage(request: TelegramSendMessageRequest): Promise<TelegramSendMessageResult>;
};

export type RegistrationNotificationPayload = {
  registrationId: string;
  weddingParty: WeddingParty;
  familyName: string;
  guestNames: string[];
  summary: SummaryMetrics;
};

export type TelegramNotificationJobInput = {
  operationStore: RegistrationOperationStore;
  payload: RegistrationNotificationPayload;
};

export type TelegramNotificationJobResult =
  | {
      ok: true;
      sentTo: string[];
      skippedAsAlreadySent: string[];
    }
  | {
      ok: false;
      sentTo: string[];
      failedChatIds: string[];
      retryable: boolean;
      message: string;
    };
