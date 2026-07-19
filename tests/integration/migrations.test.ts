import { expect, test } from "bun:test";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { testDatabase, testPool } from "./database";

test("committed migrations are recorded and idempotent", async () => {
  await migrate(testDatabase.db, { migrationsFolder: "./drizzle" });
  const result = await testPool.query<{ total: number }>("select count(*)::int as total from drizzle.__drizzle_migrations");
  expect(result.rows[0]?.total).toBe(1);
});
