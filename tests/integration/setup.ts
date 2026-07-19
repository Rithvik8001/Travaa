import { afterAll } from "bun:test";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { assertSafeTestDatabase, testDatabase, testPool } from "./database";

const LOCK_ID = 8_107_202_026;

await assertSafeTestDatabase();
const client = await testPool.connect();
try {
  await client.query("select pg_advisory_lock($1)", [LOCK_ID]);
  await client.query("drop schema if exists public cascade");
  await client.query("drop schema if exists drizzle cascade");
  await client.query("create schema public");
  await migrate(testDatabase.db, { migrationsFolder: "./drizzle" });
} finally {
  await client.query("select pg_advisory_unlock($1)", [LOCK_ID]);
  client.release();
}

afterAll(async () => {
  await testPool.end();
});
