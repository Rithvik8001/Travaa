import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./schema";
import * as appSchema from "./trips";

export function createDatabase(connectionString: string) {
  const pool = new Pool({ connectionString });
  const database = drizzle(pool, { schema: { ...authSchema, ...appSchema } });
  return { db: database, pool };
}

export type Database = ReturnType<typeof createDatabase>["db"];
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DatabaseExecutor = Database | DatabaseTransaction;
