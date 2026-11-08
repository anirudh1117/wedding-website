import { NextResponse } from "next/server";

import { getGoogleIntegrationRecord } from "@/lib/google/oauth";

export async function GET() {
  const integration = await getGoogleIntegrationRecord();

  if (!integration) {
    return NextResponse.json({
      ok: true,
      connected: false,
      status: "DISCONNECTED",
      email: null,
      connectedAt: null,
      driveInitialized: false,
      spreadsheetInitialized: false,
    });
  }

  return NextResponse.json({
    ok: true,
    connected: integration.status === "CONNECTED",
    status: integration.status,
    email: integration.googleEmail,
    connectedAt: integration.connectedAt,
    driveInitialized: !!integration.driveRootFolderId,
    spreadsheetInitialized: !!integration.spreadsheetId,
  });
}
