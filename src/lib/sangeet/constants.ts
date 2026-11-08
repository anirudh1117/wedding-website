/** Maximum participants per Sangeet performance group */
export const SANGEET_MAX_PARTICIPANTS = 20;

/** 5 MB — kept conservative to stay within serverless request body limits */
export const MAX_AUDIO_FILE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_AUDIO_EXTENSIONS = ["mp3", "m4a", "wav"] as const;
export type AcceptedAudioExtension = (typeof ACCEPTED_AUDIO_EXTENSIONS)[number];

export const ACCEPTED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
] as const;
export type AcceptedAudioMimeType = (typeof ACCEPTED_AUDIO_MIME_TYPES)[number];

export const PERFORMANCE_CATEGORIES = [
  "dance",
  "singing",
  "instrumental",
  "couple",
  "family",
  "comedy",
  "other",
] as const;
export type PerformanceCategory = (typeof PERFORMANCE_CATEGORIES)[number];

/** Inclusive sensible bounds for estimated stage duration (minutes) */
export const MIN_STAGE_DURATION_MINUTES = 1;
export const MAX_STAGE_DURATION_MINUTES = 10;
