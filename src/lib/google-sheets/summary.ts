import "server-only";

import type { SheetsClientLike, SummaryMetrics } from "./types";

function toPositiveInt(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function computeTabMetrics(rows: string[][]): {
  familyCount: number;
  guestCount: number;
} {
  const seen = new Set<string>();
  let guestCount = 0;

  for (const row of rows) {
    const registrationId = row[0]?.trim();
    if (!registrationId || seen.has(registrationId)) {
      continue;
    }

    seen.add(registrationId);
    guestCount += toPositiveInt(row[3]);
  }

  return {
    familyCount: seen.size,
    guestCount,
  };
}

export async function computeSummaryMetrics(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
}): Promise<SummaryMetrics> {
  const [groomRowsResult, brideRowsResult] = await Promise.all([
    args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range: "Groom!A2:D",
      valueRenderOption: "UNFORMATTED_VALUE",
    }),
    args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range: "Bride!A2:D",
      valueRenderOption: "UNFORMATTED_VALUE",
    }),
  ]);

  const groomMetrics = computeTabMetrics(groomRowsResult.data.values ?? []);
  const brideMetrics = computeTabMetrics(brideRowsResult.data.values ?? []);

  return {
    groomFamilyCount: groomMetrics.familyCount,
    groomGuestCount: groomMetrics.guestCount,
    brideFamilyCount: brideMetrics.familyCount,
    brideGuestCount: brideMetrics.guestCount,
    overallFamilyCount: groomMetrics.familyCount + brideMetrics.familyCount,
    overallGuestCount: groomMetrics.guestCount + brideMetrics.guestCount,
  };
}

export async function writeSummaryMetrics(args: {
  sheets: SheetsClientLike;
  spreadsheetId: string;
  metrics: SummaryMetrics;
}): Promise<void> {
  await args.sheets.spreadsheets.values.update({
    spreadsheetId: args.spreadsheetId,
    range: "Summary!A1:B7",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["Metric", "Value"],
        ["Groom family count", args.metrics.groomFamilyCount],
        ["Groom total guest count", args.metrics.groomGuestCount],
        ["Bride family count", args.metrics.brideFamilyCount],
        ["Bride total guest count", args.metrics.brideGuestCount],
        ["Overall family count", args.metrics.overallFamilyCount],
        ["Overall guest count", args.metrics.overallGuestCount],
      ],
    },
  });
}
