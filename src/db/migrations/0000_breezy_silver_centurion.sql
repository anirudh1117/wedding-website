CREATE TYPE "public"."google_integration_status" AS ENUM('CONNECTED', 'DISCONNECTED', 'RECONNECT_REQUIRED', 'INITIALIZATION_PENDING', 'INITIALIZATION_FAILED');--> statement-breakpoint
CREATE TABLE "google_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(32) DEFAULT 'google' NOT NULL,
	"google_email" varchar(255),
	"google_sub" varchar(255),
	"encrypted_refresh_token" text,
	"encryption_nonce" text,
	"encryption_tag" text,
	"drive_root_folder_id" text,
	"groom_folder_id" text,
	"bride_folder_id" text,
	"sangeet_folder_id" text,
	"spreadsheet_id" text,
	"status" "google_integration_status" DEFAULT 'INITIALIZATION_PENDING' NOT NULL,
	"connected_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "google_integrations_provider_unique" ON "google_integrations" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "google_integrations_google_sub_unique" ON "google_integrations" USING btree ("google_sub");