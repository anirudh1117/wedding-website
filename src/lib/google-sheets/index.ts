import "server-only";

import { createSheetsClient, getGoogleSheetsConfigFromEnv } from "./client";
import {
  GoogleSheetsIntegrationError,
  toGoogleSheetsIntegrationError,
} from "./errors";
import {
  initializeSheetsRegistry,
  reconcileSummary,
  upsertFamilyRegistryRow,
} from "./registry";
import { computeSummaryMetrics } from "./summary";
import type {
  FamilyRegistryRowInput,
  RegistryInitializationResult,
  RegistryWriteResult,
} from "./types";

export type {
  FamilyRegistryRowInput,
  RegistryInitializationResult,
  RegistryWriteResult,
} from "./types";

export {
  createSheetsClient,
  getGoogleSheetsConfigFromEnv,
  initializeSheetsRegistry,
  upsertFamilyRegistryRow,
  reconcileSummary,
  computeSummaryMetrics,
};

export async function getSheetsSummaryMetricsService(): Promise<
  | { ok: true; summary: Awaited<ReturnType<typeof computeSummaryMetrics>> }
  | { ok: false; code: string; message: string; retryable: boolean }
> {
  try {
    const config = await getGoogleSheetsConfigFromEnv();
    const sheets = await createSheetsClient(config);

    const summary = await computeSummaryMetrics({
      sheets,
      spreadsheetId: config.spreadsheetId,
    });

    return {
      ok: true,
      summary,
    };
  } catch (error) {
    const normalized = toGoogleSheetsIntegrationError(error);
    return {
      ok: false,
      code: normalized.code,
      message: normalized.message,
      retryable: normalized.retryable,
    };
  }
}

export type SheetsRegistryWriteResult =
  | {
      ok: true;
      row: RegistryWriteResult;
    }
  | {
      ok: false;
      code:
        | "CONFIG_MISSING"
        | "CONFIG_INVALID"
        | "SPREADSHEET_NOT_FOUND"
        | "PERMISSION_DENIED"
        | "SCHEMA_MISMATCH"
        | "TRANSIENT"
        | "VALIDATION"
        | "UNKNOWN";
      message: string;
      retryable: boolean;
    };

export async function initializeSheetsRegistryService(): Promise<
  | { ok: true; data: RegistryInitializationResult }
  | { ok: false; code: string; message: string; retryable: boolean }
> {
  try {
    const config = await getGoogleSheetsConfigFromEnv();
    const sheets = await createSheetsClient(config);
    const data = await initializeSheetsRegistry({
      sheets,
      spreadsheetId: config.spreadsheetId,
    });

    return {
      ok: true,
      data,
    };
  } catch (error) {
    const normalized = toGoogleSheetsIntegrationError(error);
    return {
      ok: false,
      code: normalized.code,
      message: normalized.message,
      retryable: normalized.retryable,
    };
  }
}

export async function writeFamilyRegistryAndSummary(args: {
  row: FamilyRegistryRowInput;
}): Promise<SheetsRegistryWriteResult> {
  try {
    const config = await getGoogleSheetsConfigFromEnv();
    const sheets = await createSheetsClient(config);

    await initializeSheetsRegistry({
      sheets,
      spreadsheetId: config.spreadsheetId,
    });

    const row = await upsertFamilyRegistryRow({
      sheets,
      spreadsheetId: config.spreadsheetId,
      input: args.row,
    });

    await reconcileSummary({
      sheets,
      spreadsheetId: config.spreadsheetId,
    });

    return {
      ok: true,
      row,
    };
  } catch (error) {
    const normalized =
      error instanceof GoogleSheetsIntegrationError
        ? error
        : toGoogleSheetsIntegrationError(error);

    return {
      ok: false,
      code: normalized.code,
      message: normalized.message,
      retryable: normalized.retryable,
    };
  }
}
