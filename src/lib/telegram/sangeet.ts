import "server-only";

import { formatDuration, parseTimestamp, sanitizeSangeetText } from "@/lib/sangeet/helpers";

type SangeetNotificationPayload = {
  performanceId: string;
  weddingParty: "groom" | "bride";
  performanceType: "solo" | "group";
  performanceTitle: string;
  performanceCategory: string;
  leadPerformer: string;
  participants: string[];
  songSource: "link" | "upload";
  songUrl?: string;
  playbackStartTime?: string;
  playbackEndTime?: string;
  fullSong: boolean;
  estimatedStageDurationMinutes: number;
  hasAudioFile: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildSangeetTelegramMessage(payload: SangeetNotificationPayload): string {
  const sideEmoji = payload.weddingParty === "groom" ? "🤵" : "👰";
  const sideLabel = payload.weddingParty === "groom" ? "Groom's Side — लड़के वाले" : "Bride's Side — लड़की वाले";
  const typeLabel = payload.performanceType === "solo" ? "Solo — एकल" : "Group — समूह";

  const participantList = payload.participants.length
    ? payload.participants.map((n) => `• ${escapeHtml(sanitizeSangeetText(n))}`).join("\n")
    : "• (not provided)";

  const songLines: string[] = [];
  if (payload.songSource === "link" && payload.songUrl) {
    songLines.push(`<b>Source:</b> Link (${escapeHtml(payload.songUrl.slice(0, 80))})`);
  } else if (payload.songSource === "upload") {
    songLines.push(`<b>Source:</b> Uploaded file${payload.hasAudioFile ? " ✓ available in Drive" : ""}`);
  }
  if (payload.fullSong) {
    songLines.push(`<b>Playback:</b> Full song`);
  } else {
    if (payload.playbackStartTime) {
      songLines.push(`<b>Playback Start:</b> ${escapeHtml(payload.playbackStartTime)}`);
    }
    if (payload.playbackEndTime) {
      songLines.push(`<b>Playback End:</b> ${escapeHtml(payload.playbackEndTime)}`);
    }
  }
  if (!payload.fullSong) {
    const startSec = parseTimestamp(payload.playbackStartTime ?? "");
    const endSec = parseTimestamp(payload.playbackEndTime ?? "");
    const durationSec = startSec !== null && endSec !== null && endSec > startSec
      ? endSec - startSec : null;
    if (durationSec !== null) {
      songLines.push(`<b>Playback Duration:</b> ${formatDuration(durationSec)}`);
    }
  }

  return [
    "🎶 <b>New Sangeet Performance</b>",
    "",
    `${sideEmoji} <b>${escapeHtml(sideLabel)}</b>`,
    `<b>Performance ID:</b> ${escapeHtml(payload.performanceId)}`,
    `<b>Title:</b> ${escapeHtml(payload.performanceTitle)}`,
    `<b>Category:</b> ${escapeHtml(payload.performanceCategory)}`,
    `<b>Type:</b> ${typeLabel}`,
    "",
    `<b>Lead Performer:</b> ${escapeHtml(payload.leadPerformer)}`,
    `<b>Participants (${payload.participants.length}):</b>`,
    participantList,
    "",
    ...songLines,
    "",
    `<b>Est. Stage Duration:</b> ${payload.estimatedStageDurationMinutes} min`,
  ].join("\n");
}

export type { SangeetNotificationPayload };
