import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { DATABASE_URL } from "../config";

const { Pool } = pg;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
