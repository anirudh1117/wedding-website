import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { googleIntegrations } from "@/db/schema";
import { initializeGoogleDriveStructure, initializeGoogleSheetsWorkbook, ensureHotelStaffViewerAccess } from "@/lib/google/drive-setup";
import { createGoogleOAuthClient, getGoogleOAuthConfigFromEnv, getGoogleIntegrationRecord, timingSafeEquals } from "@/lib/google/oauth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const providedSecret = typeof body.setupSecret === "string" ? body.setupSecret : "";
  const config = getGoogleOAuthConfigFromEnv();

  if (!timingSafeEquals(providedSecret, config.connectSetupSecret)) {
    return NextResponse.json({ ok: false, message: "Invalid setup secret." }, { status: 401 });
  }

  const integration = await getGoogleIntegrationRecord();
  if (!integration) {
    return NextResponse.json({ ok: false, message: "Google is not connected yet." }, { status: 400 });
  }

  const auth = await createGoogleOAuthClient();
  const drive = (await import("googleapis")).google.drive({ version: "v3", auth: auth as any });
  const sheets = (await import("googleapis")).google.sheets({ version: "v4", auth: auth as any });

  const folderState = await initializeGoogleDriveStructure({
    drive,
    existingRootFolderId: integration.driveRootFolderId,
  });

  const workbook = await initializeGoogleSheetsWorkbook({
    drive,
    sheets,
    rootFolderId: folderState.rootFolderId,
    spreadsheetId: integration.spreadsheetId,
  });

  if (!db) {
    throw new Error("Missing DATABASE_URL environment variable for Neon PostgreSQL.");
  }

  await db
    .update(googleIntegrations)
    .set({
      driveRootFolderId: folderState.rootFolderId,
      groomFolderId: folderState.groomFolderId,
      brideFolderId: folderState.brideFolderId,
      sangeetFolderId: folderState.sangeetFolderId,
      spreadsheetId: workbook.spreadsheetId,
      status: "CONNECTED",
      updatedAt: new Date(),
    } as any)
    .where(eq(googleIntegrations.provider, "google"));

  if (config.hotelStaffEmail) {
    await ensureHotelStaffViewerAccess({
      drive,
      fileId: folderState.groomFolderId,
      emailAddress: config.hotelStaffEmail,
    });
    await ensureHotelStaffViewerAccess({
      drive,
      fileId: folderState.brideFolderId,
      emailAddress: config.hotelStaffEmail,
    });
    await ensureHotelStaffViewerAccess({
      drive,
      fileId: workbook.spreadsheetId,
      emailAddress: config.hotelStaffEmail,
    });
  }

  return NextResponse.json({
    ok: true,
    status: "CONNECTED",
    rootFolderId: folderState.rootFolderId,
    groomFolderId: folderState.groomFolderId,
    brideFolderId: folderState.brideFolderId,
    sangeetFolderId: folderState.sangeetFolderId,
    spreadsheetId: workbook.spreadsheetId,
    createdTabs: workbook.createdTabs,
    verifiedTabs: workbook.verifiedTabs,
  });
}
