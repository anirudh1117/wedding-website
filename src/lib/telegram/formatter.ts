import "server-only";

import type { RegistrationNotificationPayload } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sideLabel(party: RegistrationNotificationPayload["weddingParty"]): {
  english: string;
  hindi: string;
  emoji: string;
} {
  if (party === "groom") {
    return {
      english: "Groom's Side",
      hindi: "लड़के वाले",
      emoji: "🤵",
    };
  }

  return {
    english: "Bride's Side",
    hindi: "लड़की वाले",
    emoji: "👰",
  };
}

export function buildTelegramRegistrationMessage(
  payload: RegistrationNotificationPayload,
): string {
  const side = sideLabel(payload.weddingParty);
  const guestLines = payload.guestNames.length
    ? payload.guestNames.map((name) => `• ${escapeHtml(name)}`).join("\n")
    : "• No guest names provided";

  return [
    "🔔 <b>New Family Registration</b>",
    "",
    `<b>Registered by:</b> ${escapeHtml(side.english)} — ${escapeHtml(side.hindi)}`,
    `<b>Family:</b> ${escapeHtml(payload.familyName || "Family")}`,
    `<b>Registration ID:</b> ${escapeHtml(payload.registrationId)}`,
    "",
    `<b>Guests (${payload.guestNames.length}):</b>`,
    guestLines,
    "",
    "<b>Registration Summary</b>",
    "",
    "🤵 <b>Groom's Side</b>",
    `Families: ${payload.summary.groomFamilyCount}`,
    `Guests: ${payload.summary.groomGuestCount}`,
    "",
    "👰 <b>Bride's Side</b>",
    `Families: ${payload.summary.brideFamilyCount}`,
    `Guests: ${payload.summary.brideGuestCount}`,
    "",
    "<b>Overall</b>",
    `Families: ${payload.summary.overallFamilyCount}`,
    `Guests: ${payload.summary.overallGuestCount}`,
  ].join("\n");
}
