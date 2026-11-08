import { describe, expect, it } from "vitest";
import { computeSummaryMetrics } from "@/lib/google-sheets/summary";
import type { SheetsClientLike } from "@/lib/google-sheets/types";

function createSheetsMock(data: {
  groomRows: string[][];
  brideRows: string[][];
}): SheetsClientLike {
  return {
    spreadsheets: {
      get: async () => ({ data: { sheets: [] } }),
      batchUpdate: async () => ({ data: {} }),
      values: {
        get: async ({ range }: { range: string }) => {
          if (range.startsWith("Groom!")) {
            return { data: { values: data.groomRows } };
          }

          if (range.startsWith("Bride!")) {
            return { data: { values: data.brideRows } };
          }

          return { data: { values: [] } };
        },
        update: async () => ({ data: {} }),
        append: async () => ({ data: {} }),
      },
    },
  } as unknown as SheetsClientLike;
}

describe("google-sheets summary", () => {
  it("computes totals excluding duplicate registration ids and blanks", async () => {
    const sheets = createSheetsMock({
      groomRows: [
        ["G-1", "A", "+91", "3"],
        ["G-2", "B", "+91", "2"],
        ["G-2", "B", "+91", "2"],
        ["", "", "", ""],
      ],
      brideRows: [
        ["B-1", "X", "+91", "4"],
        ["B-2", "Y", "+91", "1"],
      ],
    });

    const metrics = await computeSummaryMetrics({
      sheets,
      spreadsheetId: "sheet-1",
    });

    expect(metrics.groomFamilyCount).toBe(2);
    expect(metrics.groomGuestCount).toBe(5);
    expect(metrics.brideFamilyCount).toBe(2);
    expect(metrics.brideGuestCount).toBe(5);
    expect(metrics.overallFamilyCount).toBe(4);
    expect(metrics.overallGuestCount).toBe(10);
  });
});
