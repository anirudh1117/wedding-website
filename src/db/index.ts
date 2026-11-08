import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();

export function getDb() {
  if (!databaseUrl) {
    return undefined;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle({ client: pool });
}

export const db = databaseUrl ? getDb() : undefined;
