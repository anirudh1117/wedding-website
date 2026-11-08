import "server-only";

export type TelegramErrorCode =
  | "CONFIG_MISSING"
  | "CONFIG_INVALID"
  | "CHAT_FORBIDDEN"
  | "BOT_BLOCKED"
  | "RATE_LIMITED"
  | "TRANSIENT"
  | "UNKNOWN";

export class TelegramIntegrationError extends Error {
  readonly code: TelegramErrorCode;
  readonly retryable: boolean;

  constructor(code: TelegramErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "TelegramIntegrationError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function toTelegramIntegrationError(error: unknown): TelegramIntegrationError {
  if (error instanceof TelegramIntegrationError) {
    return error;
  }

  const maybe = error as {
    statusCode?: number;
    code?: number | string;
  };

  const statusCode =
    typeof maybe.statusCode === "number"
      ? maybe.statusCode
      : typeof maybe.code === "number"
        ? maybe.code
        : undefined;

  if (statusCode === 400) {
    return new TelegramIntegrationError("CONFIG_INVALID", "Telegram request format is invalid.", false);
  }

  if (statusCode === 401) {
    return new TelegramIntegrationError("CONFIG_INVALID", "Telegram bot token is invalid.", false);
  }

  if (statusCode === 403) {
    return new TelegramIntegrationError("CHAT_FORBIDDEN", "Telegram bot is not allowed in target chat.", false);
  }

  if (statusCode === 404) {
    return new TelegramIntegrationError("CONFIG_INVALID", "Telegram chat id is invalid.", false);
  }

  if (statusCode === 429) {
    return new TelegramIntegrationError("RATE_LIMITED", "Telegram rate limit hit.", true);
  }

  if (statusCode !== undefined && statusCode >= 500) {
    return new TelegramIntegrationError("TRANSIENT", "Telegram is temporarily unavailable.", true);
  }

  return new TelegramIntegrationError("UNKNOWN", "Unexpected Telegram integration failure.", false);
}
