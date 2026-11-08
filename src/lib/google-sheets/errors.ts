import "server-only";

export type GoogleSheetsErrorCode =
  | "CONFIG_MISSING"
  | "CONFIG_INVALID"
  | "SPREADSHEET_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "SCHEMA_MISMATCH"
  | "TRANSIENT"
  | "VALIDATION"
  | "UNKNOWN";

export class GoogleSheetsIntegrationError extends Error {
  readonly code: GoogleSheetsErrorCode;
  readonly retryable: boolean;

  constructor(code: GoogleSheetsErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "GoogleSheetsIntegrationError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function toGoogleSheetsIntegrationError(
  error: unknown,
): GoogleSheetsIntegrationError {
  if (error instanceof GoogleSheetsIntegrationError) {
    return error;
  }

  const maybe = error as {
    code?: number | string;
    status?: number;
  };

  const status =
    typeof maybe.status === "number"
      ? maybe.status
      : typeof maybe.code === "number"
        ? maybe.code
        : undefined;

  if (status === 401 || status === 403) {
    return new GoogleSheetsIntegrationError(
      "PERMISSION_DENIED",
      "Google Sheets permissions are insufficient for this operation.",
      false,
    );
  }

  if (status === 404) {
    return new GoogleSheetsIntegrationError(
      "SPREADSHEET_NOT_FOUND",
      "Configured spreadsheet could not be found or accessed.",
      false,
    );
  }

  if (status === 408 || status === 429 || (status !== undefined && status >= 500)) {
    return new GoogleSheetsIntegrationError(
      "TRANSIENT",
      "Google Sheets is temporarily unavailable.",
      true,
    );
  }

  return new GoogleSheetsIntegrationError(
    "UNKNOWN",
    "Unexpected Google Sheets integration failure.",
    false,
  );
}
