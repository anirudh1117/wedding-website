import { z } from "zod";
import {
  ACCEPTED_AUDIO_MIME_TYPES,
  MAX_AUDIO_FILE_BYTES,
  MAX_STAGE_DURATION_MINUTES,
  MIN_STAGE_DURATION_MINUTES,
  SANGEET_MAX_PARTICIPANTS,
} from "@/lib/sangeet/constants";
import {
  getAudioExtension,
  isAcceptedAudioExtension,
  parseTimestamp,
} from "@/lib/sangeet/helpers";
import { isLikelyValidIndianMobile, normalizeIndianPhone } from "@/lib/registration/helpers";

/* ──────────────────────────────────────────────────────────────────────────
   Shared atoms
   ──────────────────────────────────────────────────────────────────────── */

export const sangeetWeddingPartySchema = z.enum(["groom", "bride"]);
export const sangeetPerformanceTypeSchema = z.enum(["solo", "group"]);
export const sangeetSongSourceSchema = z.enum(["link", "upload"]);

const SAFE_HTTPS_URL = z
  .string()
  .trim()
  .min(1, "Song URL is required.")
  .max(2048, "URL is too long.")
  .refine((u) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Please provide a valid HTTPS URL.");

const TIMESTAMP_FIELD = z
  .string()
  .trim()
  .min(1, "Playback time is required.")
  .refine((v) => parseTimestamp(v) !== null, {
    message: "Use MM:SS format (e.g. 01:30).",
  });

const participantNameSchema = z
  .string()
  .trim()
  .min(1, "Participant name is required.")
  .max(120, "Name is too long.");

/* ──────────────────────────────────────────────────────────────────────────
   Client schema (submitted as JSON from browser)
   ──────────────────────────────────────────────────────────────────────── */

export const sangeetClientSchema = z
  .object({
    weddingParty: sangeetWeddingPartySchema,
    performanceType: sangeetPerformanceTypeSchema,
    performanceTitle: z.string().trim().min(1, "Performance title is required.").max(200),
    performanceCategory: z
      .string()
      .trim()
      .min(1, "Performance category is required.")
      .max(100),
    leadPerformer: z.string().trim().min(1, "Lead performer name is required.").max(120),
    contactNumber: z
      .string()
      .trim()
      .min(1, "Contact number is required.")
      .transform((v) => normalizeIndianPhone(v))
      .refine(isLikelyValidIndianMobile, {
        message: "Enter a valid 10-digit Indian mobile number.",
      }),
    participants: z
      .array(z.object({ id: z.string(), name: participantNameSchema }))
      .min(1, "At least one participant is required.")
      .max(SANGEET_MAX_PARTICIPANTS, `Maximum ${SANGEET_MAX_PARTICIPANTS} participants allowed.`),
    songSource: sangeetSongSourceSchema,
    fullSong: z.boolean().default(false),
    // Link-only
    songUrl: z.string().optional(),
    playbackStartTime: z.string().optional(),
    playbackEndTime: z.string().optional(),
    // Upload-only
    audioFileName: z.string().optional(),
    audioFileSize: z.number().optional(),
    audioMimeType: z.string().optional(),
    estimatedStageDurationMinutes: z
      .number()
      .int()
      .min(MIN_STAGE_DURATION_MINUTES, `Minimum duration is ${MIN_STAGE_DURATION_MINUTES} minute.`)
      .max(MAX_STAGE_DURATION_MINUTES, `Maximum duration is ${MAX_STAGE_DURATION_MINUTES} minutes.`),
  })
  .superRefine((data, ctx) => {
    if (data.performanceType === "group" && data.participants.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["participants"],
        message: "Group performances require at least 2 participants.",
      });
    }
    if (data.songSource === "link") {
      if (!data.songUrl?.trim()) {
        ctx.addIssue({ code: "custom", path: ["songUrl"], message: "Song URL is required." });
      } else {
        try {
          const parsed = new URL(data.songUrl);
          if (parsed.protocol !== "https:") {
            ctx.addIssue({ code: "custom", path: ["songUrl"], message: "URL must use HTTPS." });
          }
        } catch {
          ctx.addIssue({ code: "custom", path: ["songUrl"], message: "Invalid URL." });
        }
      }
      if (!data.fullSong) {
        if (!data.playbackStartTime?.trim()) {
          ctx.addIssue({ code: "custom", path: ["playbackStartTime"], message: "Start time is required." });
        } else if (parseTimestamp(data.playbackStartTime) === null) {
          ctx.addIssue({ code: "custom", path: ["playbackStartTime"], message: "Use MM:SS format." });
        }
        if (!data.playbackEndTime?.trim()) {
          ctx.addIssue({ code: "custom", path: ["playbackEndTime"], message: "End time is required." });
        } else if (parseTimestamp(data.playbackEndTime) === null) {
          ctx.addIssue({ code: "custom", path: ["playbackEndTime"], message: "Use MM:SS format." });
        }
        const startSec = parseTimestamp(data.playbackStartTime ?? "");
        const endSec = parseTimestamp(data.playbackEndTime ?? "");
        if (startSec !== null && endSec !== null && endSec <= startSec) {
          ctx.addIssue({ code: "custom", path: ["playbackEndTime"], message: "End time must be after start time." });
        }
      }
    }
    if (data.songSource === "upload") {
      if (!data.audioFileName?.trim()) {
        ctx.addIssue({ code: "custom", path: ["audioFileName"], message: "Audio file is required." });
      } else {
        const ext = getAudioExtension(data.audioFileName);
        if (!isAcceptedAudioExtension(ext)) {
          ctx.addIssue({ code: "custom", path: ["audioFileName"], message: "Only MP3, M4A, and WAV files are supported." });
        }
      }
      if (!data.audioFileSize || data.audioFileSize <= 0) {
        ctx.addIssue({ code: "custom", path: ["audioFileSize"], message: "Audio file size is invalid." });
      } else if (data.audioFileSize > MAX_AUDIO_FILE_BYTES) {
        ctx.addIssue({ code: "custom", path: ["audioFileSize"], message: `Audio file must be under ${MAX_AUDIO_FILE_BYTES / 1024 / 1024} MB.` });
      }
    }
  });

export type SangeetClientInput = z.infer<typeof sangeetClientSchema>;

/* ──────────────────────────────────────────────────────────────────────────
   Server schema (after decryption and re-validation)
   ──────────────────────────────────────────────────────────────────────── */

export const sangeetServerSchema = z
  .object({
    weddingParty: sangeetWeddingPartySchema,
    performanceType: sangeetPerformanceTypeSchema,
    performanceTitle: z.string().trim().min(1).max(200),
    performanceCategory: z.string().trim().min(1).max(100),
    leadPerformer: z.string().trim().min(1).max(120),
    contactNumber: z
      .string()
      .trim()
      .transform((v) => normalizeIndianPhone(v))
      .refine(isLikelyValidIndianMobile),
    participants: z
      .array(z.object({ id: z.string(), name: participantNameSchema }))
      .min(1)
      .max(SANGEET_MAX_PARTICIPANTS),
    songSource: sangeetSongSourceSchema,
    fullSong: z.boolean(),
    songUrl: SAFE_HTTPS_URL.optional(),
    playbackStartTime: TIMESTAMP_FIELD.optional(),
    playbackEndTime: TIMESTAMP_FIELD.optional(),
    audioFileName: z.string().trim().optional(),
    audioFileSize: z.number().optional(),
    audioMimeType: z
      .string()
      .trim()
      .toLowerCase()
      .refine((v) => ACCEPTED_AUDIO_MIME_TYPES.includes(v as (typeof ACCEPTED_AUDIO_MIME_TYPES)[number]))
      .optional(),
    estimatedStageDurationMinutes: z
      .number()
      .int()
      .min(MIN_STAGE_DURATION_MINUTES)
      .max(MAX_STAGE_DURATION_MINUTES),
    submittedAtIso: z.string().datetime({ offset: true }),
  })
  .superRefine((data, ctx) => {
    if (data.songSource === "link") {
      if (!data.songUrl) {
        ctx.addIssue({ code: "custom", path: ["songUrl"], message: "Song URL is required for link source." });
      }
      if (!data.fullSong) {
        if (!data.playbackStartTime || !data.playbackEndTime) {
          ctx.addIssue({ code: "custom", path: ["playbackStartTime"], message: "Playback times are required." });
        }
        const startSec = parseTimestamp(data.playbackStartTime ?? "");
        const endSec = parseTimestamp(data.playbackEndTime ?? "");
        if (startSec !== null && endSec !== null && endSec <= startSec) {
          ctx.addIssue({ code: "custom", path: ["playbackEndTime"], message: "End time must be after start time." });
        }
      }
    }
    if (data.songSource === "upload") {
      if (!data.audioFileName || !data.audioMimeType) {
        ctx.addIssue({ code: "custom", path: ["audioFileName"], message: "Audio file metadata is required." });
      }
      if (!data.audioFileSize || data.audioFileSize > MAX_AUDIO_FILE_BYTES) {
        ctx.addIssue({ code: "custom", path: ["audioFileSize"], message: "Audio file size is invalid." });
      }
    }
  });

export type SangeetServerInput = z.infer<typeof sangeetServerSchema>;
