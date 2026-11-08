import {
  ACCEPTED_AADHAAR_EXTENSIONS,
  ACCEPTED_AADHAAR_MIME_TYPES,
  MAX_AADHAAR_FILE_BYTES,
} from "@/lib/registration/constants";

export function sanitizeFileName(fileName: string | null | undefined): string {
  const safeName = typeof fileName === "string" ? fileName : "";
  return safeName.replace(/[^a-zA-Z0-9._ -]/g, "_").trim();
}

export function bytesToReadableSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getFileExtension(fileName: string): string {
  const fileParts = fileName.split(".");
  if (fileParts.length < 2) {
    return "";
  }

  return fileParts[fileParts.length - 1].toLowerCase();
}

export function validateAadhaarFileForUx(file: File): string | null {
  if (file.size > MAX_AADHAAR_FILE_BYTES) {
    return "Document exceeds 5 MB limit.";
  }

  const extension = getFileExtension(file.name);
  if (!ACCEPTED_AADHAAR_EXTENSIONS.includes(extension as (typeof ACCEPTED_AADHAAR_EXTENSIONS)[number])) {
    return "Unsupported file type. Use JPG, PNG, or PDF.";
  }

  const mimeType = file.type.toLowerCase();
  if (!ACCEPTED_AADHAAR_MIME_TYPES.includes(mimeType as (typeof ACCEPTED_AADHAAR_MIME_TYPES)[number])) {
    return "Unsupported file format metadata. Use JPG, PNG, or PDF.";
  }

  return null;
}

export function normalizeIndianPhone(rawInput: string): string {
  const cleaned = rawInput.replace(/[^\d+]/g, "").trim();

  if (cleaned.startsWith("+")) {
    const withoutPlus = cleaned.slice(1).replace(/\D/g, "");
    if (withoutPlus.startsWith("91")) {
      const maybeMobile = withoutPlus.slice(2);
      if (maybeMobile.length === 10) {
        return `+91${maybeMobile}`;
      }
    }
    return `+${withoutPlus}`;
  }

  const digits = cleaned.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return rawInput.trim();
}

export function isLikelyValidIndianMobile(normalizedPhone: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(normalizedPhone);
}
