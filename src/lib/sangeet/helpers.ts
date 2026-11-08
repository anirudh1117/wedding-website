import { ACCEPTED_AUDIO_EXTENSIONS } from "./constants";
import type { AcceptedAudioExtension } from "./constants";

export { normalizeIndianPhone } from "@/lib/registration/helpers";

/**
 * Parse a "MM:SS" or "H:MM:SS" timestamp string to total seconds.
 * Returns null for any invalid/non-numeric input.
 */
export function parseTimestamp(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) return null;

  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;

  if (parts.length === 2) {
    const [mm, ss] = nums as [number, number];
    if (ss >= 60) return null;
    return mm * 60 + ss;
  }

  const [hh, mm, ss] = nums as [number, number, number];
  if (mm >= 60 || ss >= 60) return null;
  return hh * 3600 + mm * 60 + ss;
}

/** Format total seconds to "M:SS" or "H:MM:SS" for display */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/** Extract extension (lowercase, no dot) from filename */
export function getAudioExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return "";
  return fileName.slice(idx + 1).toLowerCase();
}

export function isAcceptedAudioExtension(ext: string): ext is AcceptedAudioExtension {
  return ACCEPTED_AUDIO_EXTENSIONS.includes(ext as AcceptedAudioExtension);
}

/** Generate a sangeet performance ID: SP-G-XXXXX or SP-B-XXXXX */
export function generateSangeetPerformanceId(party: "groom" | "bride"): string {
  const prefix = party === "groom" ? "G" : "B";
  const bytes = new Uint8Array(5);
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .slice(0, 6);
  return `SP-${prefix}-${token}`;
}

/** Sanitize user-provided strings before spreadsheet insertion */
export function sanitizeSangeetText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[=+\-@]/.test(trimmed)) return `'${trimmed}`;
  return trimmed;
}

/** Safe audio filename for Drive storage */
export function buildAudioFileName(performanceId: string, originalName: string): string {
  const ext = getAudioExtension(originalName);
  const safeExt = isAcceptedAudioExtension(ext) ? ext : "mp3";
  return `${performanceId}-Song.${safeExt}`;
}
