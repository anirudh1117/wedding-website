import { describe, expect, it, vi } from "vitest";
import {
  initializeSheetsRegistry,
  upsertFamilyRegistryRow,
} from "@/lib/google-sheets/registry";
import type { SheetsClientLike } from "@/lib/google-sheets/types";

function createSheetsMock(args?: {
  sheetsMeta?: Array<{ sheetId: number; title: string }>;
  groomHeader?: string[];
  brideHeader?: string[];
  groomRows?: string[][];
  brideRows?: string[][];
}) {
  const get = vi.fn(async ({ range }) => {
    if (range === "Groom!1:1") {
      return { data: { values: args?.groomHeader ? [args.groomHeader] : [] } };
    }

    if (range === "Bride!1:1") {
      return { data: { values: args?.brideHeader ? [args.brideHeader] : [] } };
    }

    if (range === "Groom!A2:F") {
      return { data: { values: args?.groomRows ?? [] } };
    }

    if (range === "Bride!A2:F") {
      return { data: { values: args?.brideRows ?? [] } };
    }

    if (range === "Groom!A2:D") {
      return { data: { values: args?.groomRows ?? [] } };
    }

    if (range === "Bride!A2:D") {
      return { data: { values: args?.brideRows ?? [] } };
    }

    return { data: { values: [] } };
  });

  const mock: SheetsClientLike = {
    spreadsheets: {
      get: vi.fn(async () => ({
        data: {
          sheets: (args?.sheetsMeta ?? []).map((sheet) => ({
            properties: {
              sheetId: sheet.sheetId,
              title: sheet.title,
            },
          })),
        },
      })),
      batchUpdate: vi.fn(async () => ({ data: {} })),
      values: {
        get,
        update: vi.fn(async () => ({ data: {} })),
        append: vi.fn(async () => ({ data: {} })),
      },
    },
  };

  return mock;
}

describe("google-sheets registry", () => {
  it("creates missing tabs and initializes headers", async () => {
    const sheets = createSheetsMock({
      sheetsMeta: [{ sheetId: 1, title: "Sheet1" }],
      groomRows: [],
      brideRows: [],
    });

    const result = await initializeSheetsRegistry({
      sheets,
      spreadsheetId: "sheet-1",
    });

    expect(result.createdTabs).toEqual(["Groom", "Bride", "Summary"]);
    expect(vi.mocked(sheets.spreadsheets.batchUpdate)).toHaveBeenCalled();
  });

  it("upserts existing registration row by id", async () => {
    const sheets = createSheetsMock({
      sheetsMeta: [
        { sheetId: 10, title: "Groom" },
        { sheetId: 11, title: "Bride" },
        { sheetId: 12, title: "Summary" },
      ],
      groomHeader: [
        "Registration ID",
        "Family Name",
        "Contact Number",
        "Total Guests",
        "Registration Timestamp",
        "Aadhaar Folder",
      ],
      brideHeader: [
        "Registration ID",
        "Family Name",
        "Contact Number",
        "Total Guests",
        "Registration Timestamp",
        "Aadhaar Folder",
      ],
      groomRows: [["G-1", "Sharma", "+911234567890", "3", "time", "link"]],
      brideRows: [],
    });

    const write = await upsertFamilyRegistryRow({
      sheets,
      spreadsheetId: "sheet-1",
      input: {
        registrationId: "G-1",
        weddingParty: "groom",
        familyName: "Sharma",
        contactNumber: "+911234567890",
        totalGuests: 4,
        registrationTimestampIso: new Date().toISOString(),
        familyFolderId: "folder-1",
      },
    });

    expect(write.action).toBe("updated");
    expect(vi.mocked(sheets.spreadsheets.values.update)).toHaveBeenCalled();
  });

  it("sanitizes formula-like text and appends new row", async () => {
    const sheets = createSheetsMock({
      sheetsMeta: [
        { sheetId: 10, title: "Groom" },
        { sheetId: 11, title: "Bride" },
        { sheetId: 12, title: "Summary" },
      ],
      groomRows: [],
      brideRows: [],
    });

    const write = await upsertFamilyRegistryRow({
      sheets,
      spreadsheetId: "sheet-1",
      input: {
        registrationId: "B-1",
        weddingParty: "bride",
        familyName: "=cmd|' /C calc'!A0",
        contactNumber: "+911234567890",
        totalGuests: 2,
        registrationTimestampIso: new Date().toISOString(),
        familyFolderId: "folder-2",
      },
    });

    expect(write.action).toBe("inserted");
    const appendCall = vi.mocked(sheets.spreadsheets.values.append).mock.calls[0]?.[0];
    const familyCell = appendCall?.requestBody.values[0]?.[1];
    expect(String(familyCell).startsWith("'=")).toBe(true);
  });
});
