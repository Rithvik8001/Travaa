import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./schema";
import * as appSchema from "./trips";

/** Neon's WebSocket pool, rather than the HTTP driver, so writes can run in a transaction. */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** Auth tables (generated) + app tables (hand-authored) merged so relational queries see both. */
export const db = drizzle(pool, { schema: { ...authSchema, ...appSchema } });
