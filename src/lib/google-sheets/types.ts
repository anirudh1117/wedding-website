import "server-only";

import type { WeddingParty } from "@/lib/google-drive/types";

export type SheetsTabName = "Groom" | "Bride" | "Summary";

export type FamilyRegistryRowInput = {
  registrationId: string;
  weddingParty: WeddingParty;
  familyName: string;
  contactNumber: string;
  totalGuests: number;
  registrationTimestampIso: string;
  familyFolderId: string;
};

export type SummaryMetrics = {
  groomFamilyCount: number;
  groomGuestCount: number;
  brideFamilyCount: number;
  brideGuestCount: number;
  overallFamilyCount: number;
  overallGuestCount: number;
};

export type RegistryWriteResult = {
  tabName: Exclude<SheetsTabName, "Summary">;
  registrationId: string;
  action: "inserted" | "updated";
  rowNumber: number;
};

export type RegistryInitializationResult = {
  spreadsheetId: string;
  createdTabs: SheetsTabName[];
  verifiedTabs: SheetsTabName[];
};

export type SpreadsheetSheetMeta = {
  sheetId: number;
  title: string;
};

export type SheetsClientLike = {
  spreadsheets: {
    get: (args: {
      spreadsheetId: string;
      fields?: string;
      includeGridData?: boolean;
    }) => Promise<{
      data: {
        sheets?: Array<{
          properties?: {
            sheetId?: number;
            title?: string;
          };
        }>;
      };
    }>;
    batchUpdate: (args: {
      spreadsheetId: string;
      requestBody: {
        requests: Array<Record<string, unknown>>;
      };
    }) => Promise<{ data: unknown }>;
    values: {
      get: (args: {
        spreadsheetId: string;
        range: string;
        valueRenderOption?: string;
      }) => Promise<{ data: { values?: string[][] } }>;
      update: (args: {
        spreadsheetId: string;
        range: string;
        valueInputOption: "RAW" | "USER_ENTERED";
        requestBody: {
          values: Array<Array<string | number>>;
        };
      }) => Promise<{ data: unknown }>;
      append: (args: {
        spreadsheetId: string;
        range: string;
        valueInputOption: "RAW" | "USER_ENTERED";
        insertDataOption?: "OVERWRITE" | "INSERT_ROWS";
        requestBody: {
          values: Array<Array<string | number>>;
        };
      }) => Promise<{ data: unknown }>;
    };
  };
};
