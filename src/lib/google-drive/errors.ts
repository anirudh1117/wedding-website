import "server-only";

export type GoogleDriveErrorCode =
  | "CONFIG_MISSING"
  | "CONFIG_INVALID"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TRANSIENT"
  | "VALIDATION"
  | "ENCRYPTION_NOT_CONFIGURED"
  | "PERSISTENCE_REQUIRED"
  | "UNKNOWN";

export class GoogleDriveIntegrationError extends Error {
  readonly code: GoogleDriveErrorCode;
  readonly retryable: boolean;

  constructor(code: GoogleDriveErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "GoogleDriveIntegrationError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function toGoogleDriveIntegrationError(error: unknown): GoogleDriveIntegrationError {
  if (error instanceof GoogleDriveIntegrationError) {
    return error;
  }

  const maybe = error as {
    code?: number | string;
    status?: number;
    message?: string;
  };

  const numericStatus =
    typeof maybe?.status === "number"
      ? maybe.status
      : typeof maybe?.code === "number"
        ? maybe.code
        : undefined;

  if (numericStatus === 401 || numericStatus === 403) {
    return new GoogleDriveIntegrationError(
      "PERMISSION_DENIED",
      "Google Drive permissions are not sufficient for this operation.",
      false,
    );
  }

  if (numericStatus === 404) {
    return new GoogleDriveIntegrationError(
      "NOT_FOUND",
      "Configured Google Drive folder could not be found.",
      false,
    );
  }

  if (numericStatus === 409) {
    return new GoogleDriveIntegrationError(
      "CONFLICT",
      "Google Drive reported a resource conflict.",
      true,
    );
  }

  if (numericStatus === 408 || numericStatus === 429 || (numericStatus !== undefined && numericStatus >= 500)) {
    return new GoogleDriveIntegrationError(
      "TRANSIENT",
      "Google Drive is temporarily unavailable.",
      true,
    );
  }

  return new GoogleDriveIntegrationError(
    "UNKNOWN",
    "Unexpected Google Drive integration failure.",
    false,
  );
}
