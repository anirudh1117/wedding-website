export const REGISTRATION_MAX_GUESTS = 10;
export const MAX_AADHAAR_FILE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_AADHAAR_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"] as const;
export const ACCEPTED_AADHAAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type AcceptedAadhaarExtension = (typeof ACCEPTED_AADHAAR_EXTENSIONS)[number];
export type AcceptedAadhaarMimeType = (typeof ACCEPTED_AADHAAR_MIME_TYPES)[number];
