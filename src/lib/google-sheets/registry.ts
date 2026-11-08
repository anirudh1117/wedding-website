import "server-only";

import { toGoogleSheetsIntegrationError } from "./errors";
import { GoogleSheetsIntegrationError } from "./errors";
import {
  computeSummaryMetrics,
  writeSummaryMetrics,
} from "./summary";
import type {
  FamilyRegistryRowInput,
  RegistryInitializationResult,
  RegistryWriteResult,
  SheetsClientLike,
  SheetsTabName,
  SpreadsheetSheetMeta,
} from "./types";

const GROOM_HEADERS = [
  "Registration ID",
  "Family Name",
  "Contact Number",
  "Total Guests",
  "Registration Timestamp",
  "Aadhaar Folder",
] as const;

const BRIDE_HEADERS = GROOM_HEADERS;

function tabForParty(party: FamilyRegistryRowInput["weddingParty"]): "Groom" | "Bride" {
  return party === "groom" ? "Groom" : "Bride";
}

function sanitizeSpreadsheetText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^[=+\-@]/.test(trimmed)) {
    return `'${trimmed}`;
  }

  return trimmed;
}

function buildFolderFormula(folderId: string): string {
  const escaped = folderId.replace(/"/g, "\"\"");
  return `=HYPERLINK("https://drive.google.com/drive/folders/${escaped}","Open Family Folder")`;
}

function normalizeTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
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
    .map((sheet) => ({
      sheetId: sheet.properties?.sheetId,
      title: sheet.properties?.title,
    }))
    .filter((sheet): sheet is SpreadsheetSheetMeta =>
      typeof sheet.sheetId === "number" && typeof sheet.title === "string",
    );
}

async function ensureHeaders(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
  tab: "Groom" | "Bride";
  expectedHeaders: readonly string[];
}): Promise<void> {
  const current = await args.sheets.spreadsheets.values.get({
    spreadsheetId: args.spreadsheetId,
    range: `${args.tab}!1:1`,
  });

  const existing = current.data.values?.[0] ?? [];

  if (existing.length === 0) {
    await args.sheets.spreadsheets.values.update({
      spreadsheetId: args.spreadsheetId,
      range: `${args.tab}!1:1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [Array.from(args.expectedHeaders)],
      },
    });
    return;
  }

  const matches =
    existing.length >= args.expectedHeaders.length
    && args.expectedHeaders.every((header, index) => existing[index] === header);

  if (!matches) {
    throw new GoogleSheetsIntegrationError(
      "SCHEMA_MISMATCH",
      `Spreadsheet tab ${args.tab} has incompatible header schema. Expected: ${args.expectedHeaders.join(", ")}`,
      false,
    );
  }
}

async function applyTabFormatting(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
  metas: SpreadsheetSheetMeta[];
}): Promise<void> {
  const requests: Array<Record<string, unknown>> = [];

  for (const tabName of ["Groom", "Bride", "Summary"] as const) {
    const meta = args.metas.find((sheet) => sheet.title === tabName);
    if (!meta) {
      continue;
    }

    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: meta.sheetId,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: tabName === "Summary" ? 2 : 6,
        },
        properties: {
          pixelSize: tabName === "Summary" ? 220 : 180,
        },
        fields: "pixelSize",
      },
    });

    requests.push({
      repeatCell: {
        range: {
          sheetId: meta.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.1, green: 0.1, blue: 0.1 },
            textFormat: {
              bold: true,
              foregroundColor: { red: 1, green: 1, blue: 1 },
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat)",
      },
    });
  }

  if (requests.length === 0) {
    return;
  }

  await args.sheets.spreadsheets.batchUpdate({
    spreadsheetId: args.spreadsheetId,
    requestBody: { requests },
  });
}

export async function initializeSheetsRegistry(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
}): Promise<RegistryInitializationResult> {
  try {
    const existingSheets = await getSpreadsheetSheets(args);
    const existingTitles = new Set(existingSheets.map((sheet) => sheet.title));

    const required: SheetsTabName[] = ["Groom", "Bride", "Summary"];
    const missing = required.filter((name) => !existingTitles.has(name));

    if (missing.length > 0) {
      await args.sheets.spreadsheets.batchUpdate({
        spreadsheetId: args.spreadsheetId,
        requestBody: {
          requests: missing.map((title) => ({
            addSheet: {
              properties: { title },
            },
          })),
        },
      });
    }

    const refreshedSheets = await getSpreadsheetSheets(args);

    await ensureHeaders({
      sheets: args.sheets,
      spreadsheetId: args.spreadsheetId,
      tab: "Groom",
      expectedHeaders: GROOM_HEADERS,
    });

    await ensureHeaders({
      sheets: args.sheets,
      spreadsheetId: args.spreadsheetId,
      tab: "Bride",
      expectedHeaders: BRIDE_HEADERS,
    });

    await writeSummaryMetrics({
      sheets: args.sheets,
      spreadsheetId: args.spreadsheetId,
      metrics: await computeSummaryMetrics({
        sheets: args.sheets,
        spreadsheetId: args.spreadsheetId,
      }),
    });

    await applyTabFormatting({
      sheets: args.sheets,
      spreadsheetId: args.spreadsheetId,
      metas: refreshedSheets,
    });

    return {
      spreadsheetId: args.spreadsheetId,
      createdTabs: missing,
      verifiedTabs: required,
    };
  } catch (error) {
    throw toGoogleSheetsIntegrationError(error);
  }
}

export async function upsertFamilyRegistryRow(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
  input: FamilyRegistryRowInput;
}): Promise<RegistryWriteResult> {
  try {
    const tabName = tabForParty(args.input.weddingParty);
    const range = `${tabName}!A2:F`;

    const valuesResult = await args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = valuesResult.data.values ?? [];
    const existingIndex = rows.findIndex((row) => row[0]?.trim() === args.input.registrationId);

    const rowValues: Array<string | number> = [
      sanitizeSpreadsheetText(args.input.registrationId),
      sanitizeSpreadsheetText(args.input.familyName),
      sanitizeSpreadsheetText(args.input.contactNumber),
      args.input.totalGuests,
      normalizeTimestamp(args.input.registrationTimestampIso),
      buildFolderFormula(args.input.familyFolderId),
    ];

    if (existingIndex >= 0) {
      const rowNumber = existingIndex + 2;
      await args.sheets.spreadsheets.values.update({
        spreadsheetId: args.spreadsheetId,
        range: `${tabName}!A${rowNumber}:F${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues],
        },
      });

      return {
        tabName,
        registrationId: args.input.registrationId,
        action: "updated",
        rowNumber,
      };
    }

    await args.sheets.spreadsheets.values.append({
      spreadsheetId: args.spreadsheetId,
      range: `${tabName}!A:F`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues],
      },
    });

    return {
      tabName,
      registrationId: args.input.registrationId,
      action: "inserted",
      rowNumber: rows.length + 2,
    };
  } catch (error) {
    throw toGoogleSheetsIntegrationError(error);
  }
}

export async function reconcileSummary(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
}): Promise<void> {
  const metrics = await computeSummaryMetrics({
    sheets: args.sheets,
    spreadsheetId: args.spreadsheetId,
  });

  await writeSummaryMetrics({
    sheets: args.sheets,
    spreadsheetId: args.spreadsheetId,
    metrics,
  });
}
