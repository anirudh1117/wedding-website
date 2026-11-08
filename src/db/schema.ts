import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const googleIntegrationStatus = pgEnum("google_integration_status", [
  "CONNECTED",
  "DISCONNECTED",
  "RECONNECT_REQUIRED",
  "INITIALIZATION_PENDING",
  "INITIALIZATION_FAILED",
]);

export const googleIntegrations = pgTable(
  "google_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: varchar("provider", { length: 32 }).notNull().default("google"),
    googleEmail: varchar("google_email", { length: 255 }),
    googleSub: varchar("google_sub", { length: 255 }),
    encryptedRefreshToken: text("encrypted_refresh_token"),
    encryptionNonce: text("encryption_nonce"),
    encryptionTag: text("encryption_tag"),
    driveRootFolderId: text("drive_root_folder_id"),
    groomFolderId: text("groom_folder_id"),
    brideFolderId: text("bride_folder_id"),
    sangeetFolderId: text("sangeet_folder_id"),
    spreadsheetId: text("spreadsheet_id"),
    status: googleIntegrationStatus("status").notNull().default("INITIALIZATION_PENDING"),
    connectedAt: timestamp("connected_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerUnique: uniqueIndex("google_integrations_provider_unique").on(table.provider),
    googleSubUnique: uniqueIndex("google_integrations_google_sub_unique").on(table.googleSub),
  }),
);
