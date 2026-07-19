import { createDatabase } from "./client";

export { createDatabase } from "./client";
export type { Database, DatabaseExecutor, DatabaseTransaction } from "./client";

/** Neon's WebSocket pool, rather than the HTTP driver, so writes can run in a transaction. */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const productionDatabase = createDatabase(connectionString);

/** Auth tables (generated) + app tables (hand-authored) merged so relational queries see both. */
export const db = productionDatabase.db;
