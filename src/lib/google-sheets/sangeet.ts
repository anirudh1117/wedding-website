import "server-only";

import { buildSangeetFileUrl } from "@/lib/google-drive/sangeet";
import { sanitizeSangeetText, formatDuration, parseTimestamp } from "@/lib/sangeet/helpers";
import { toGoogleSheetsIntegrationError } from "./errors";
import type { SheetsClientLike, SpreadsheetSheetMeta } from "./types";

const SANGEET_TAB = "Sangeet" as const;

const SANGEET_HEADERS = [
  "Performance ID",
  "Wedding Side",
  "Performance Title",
  "Performance Category",
  "Performance Type",
  "Lead Performer",
  "Contact Number",
  "Participant Count",
  "Performer Names",
  "Song Source",
  "Song Link",
  "Playback Start",
  "Playback End",
  "Full Song",
  "Playback Duration",
  "Est. Stage Duration",
  "Drive Song File",
  "Registration Timestamp",
  "Status",
] as const;

const COL_COUNT = SANGEET_HEADERS.length;

export type SangeetRegistryRowInput = {
  performanceId: string;
  weddingParty: "groom" | "bride";
  performanceTitle: string;
  performanceCategory: string;
  performanceType: "solo" | "group";
  leadPerformer: string;
  contactNumber: string;
  participants: string[];
  songSource: "link" | "upload";
  songUrl?: string;
  playbackStartTime?: string;   // "MM:SS"
  playbackEndTime?: string;     // "MM:SS"
  fullSong: boolean;
  driveFileId?: string;
  estimatedStageDurationMinutes: number;
  registrationTimestampIso: string;
};

export type SangeetWriteResult = {
  performanceId: string;
  action: "inserted" | "updated";
  rowNumber: number;
};

function buildSongLinkFormula(url: string): string {
  const escaped = url.replace(/"/g, '""');
  return `=HYPERLINK("${escaped}","Open Song Link")`;
}

function buildDriveFileFormula(fileId: string): string {
  const url = buildSangeetFileUrl(fileId);
  return `=HYPERLINK("${url}","Open Song File")`;
}

function buildRow(input: SangeetRegistryRowInput): Array<string | number> {
  const party = input.weddingParty === "groom" ? "Groom's Side" : "Bride's Side";
  const participantNames = input.participants.map((n) => sanitizeSangeetText(n)).join(", ");
  const startSec = parseTimestamp(input.playbackStartTime ?? "");
  const endSec = parseTimestamp(input.playbackEndTime ?? "");
  const durationSec = startSec !== null && endSec !== null && endSec > startSec
    ? endSec - startSec
    : null;

  return [
    sanitizeSangeetText(input.performanceId),
    party,
    sanitizeSangeetText(input.performanceTitle),
    sanitizeSangeetText(input.performanceCategory),
    input.performanceType === "solo" ? "Solo" : "Group",
    sanitizeSangeetText(input.leadPerformer),
    sanitizeSangeetText(input.contactNumber),
    input.participants.length,
    participantNames,
    input.songSource === "link" ? "Link" : "Upload",
    input.songUrl ? buildSongLinkFormula(input.songUrl) : "",
    input.playbackStartTime ?? "",
    input.playbackEndTime ?? "",
    input.fullSong ? "Yes" : "No",
    durationSec !== null && !input.fullSong ? formatDuration(durationSec) : "",
    `${input.estimatedStageDurationMinutes} min`,
    input.driveFileId ? buildDriveFileFormula(input.driveFileId) : "",
    new Date(input.registrationTimestampIso).toISOString(),
    "Registered",
  ];
}

async function getSpreadsheetSheets(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
}): Promise<SpreadsheetSheetMeta[]> {
  const response = await args.sheets.spreadsheets.get({
    spreadsheetId: args.spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  return (response.data.sheets ?? [])
    .map((s) => ({ sheetId: s.properties?.sheetId, title: s.properties?.title }))
    .filter((s): s is SpreadsheetSheetMeta =>
      typeof s.sheetId === "number" && typeof s.title === "string",
    );
}

/** Ensure the Sangeet tab exists with the correct headers and formatting */
export async function initializeSangeetTab(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
}): Promise<{ sheetId: number }> {
  try {
    let metas = await getSpreadsheetSheets(args);
    let meta = metas.find((s) => s.title === SANGEET_TAB);

    if (!meta) {
      await args.sheets.spreadsheets.batchUpdate({
        spreadsheetId: args.spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: SANGEET_TAB } } }] },
      });
      metas = await getSpreadsheetSheets(args);
      meta = metas.find((s) => s.title === SANGEET_TAB);
    }

    if (!meta) {
      throw new Error("Failed to create Sangeet tab.");
    }

    // Ensure headers
    const existing = await args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range: `${SANGEET_TAB}!1:1`,
    });
    const currentHeaders = existing.data.values?.[0] ?? [];
    if (currentHeaders.length === 0) {
      await args.sheets.spreadsheets.values.update({
        spreadsheetId: args.spreadsheetId,
        range: `${SANGEET_TAB}!1:1`,
        valueInputOption: "RAW",
        requestBody: { values: [Array.from(SANGEET_HEADERS)] },
      });
    } else if (
      currentHeaders.length < SANGEET_HEADERS.length ||
      !SANGEET_HEADERS.every((h, i) => currentHeaders[i] === h)
    ) {
      throw new Error(
        `Sangeet tab has incompatible headers. Expected: ${SANGEET_HEADERS.join(", ")}`,
      );
    }

    // Apply header formatting + freeze + filter
    await args.sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          // Freeze header row
          {
            updateSheetProperties: {
              properties: { sheetId: meta.sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: "gridProperties.frozenRowCount",
            },
          },
          // Header background + bold
          {
            repeatCell: {
              range: { sheetId: meta.sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.1, green: 0.1, blue: 0.1 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          // Column widths
          {
            updateDimensionProperties: {
              range: { sheetId: meta.sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: COL_COUNT },
              properties: { pixelSize: 160 },
              fields: "pixelSize",
            },
          },
          // Basic filter
          {
            setBasicFilter: {
              filter: {
                range: { sheetId: meta.sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: COL_COUNT },
              },
            },
          },
        ],
      },
    });

    return { sheetId: meta.sheetId };
  } catch (error) {
    throw toGoogleSheetsIntegrationError(error);
  }
}

/** Upsert one Sangeet performance row (idempotent by performanceId) */
export async function upsertSangeetRow(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
  input: SangeetRegistryRowInput;
}): Promise<SangeetWriteResult> {
  try {
    const range = `${SANGEET_TAB}!A2:A`;
    const idCol = await args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const ids = (idCol.data.values ?? []).map((r) => r[0]?.trim() ?? "");
    const existingIndex = ids.findIndex((id) => id === args.input.performanceId);
    const rowValues = buildRow(args.input);
    const colLetter = String.fromCharCode(64 + COL_COUNT); // e.g. "T" for 20 columns

    if (existingIndex >= 0) {
      const rowNumber = existingIndex + 2;
      await args.sheets.spreadsheets.values.update({
        spreadsheetId: args.spreadsheetId,
        range: `${SANGEET_TAB}!A${rowNumber}:${colLetter}${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowValues] },
      });
      return { performanceId: args.input.performanceId, action: "updated", rowNumber };
    }

    await args.sheets.spreadsheets.values.append({
      spreadsheetId: args.spreadsheetId,
      range: `${SANGEET_TAB}!A:${colLetter}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [rowValues] },
    });

    // Find the new row number
    const refreshed = await args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const newIds = (refreshed.data.values ?? []).map((r) => r[0]?.trim() ?? "");
    const newIndex = newIds.lastIndexOf(args.input.performanceId);
    const rowNumber = newIndex >= 0 ? newIndex + 2 : -1;

    return { performanceId: args.input.performanceId, action: "inserted", rowNumber };
  } catch (error) {
    throw toGoogleSheetsIntegrationError(error);
  }
}
