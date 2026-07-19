import { createDatabase } from "../../lib/db/client";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("TEST_DATABASE_URL is required for integration tests.");
const requiredTestUrl: string = testUrl;

export const testDatabase = createDatabase(requiredTestUrl);
export const testDb = testDatabase.db;
export const testPool = testDatabase.pool;

export async function assertSafeTestDatabase(): Promise<void> {
  const productionUrl = process.env.DATABASE_URL;
  if (productionUrl && new URL(productionUrl).toString() === new URL(requiredTestUrl).toString()) {
    throw new Error("TEST_DATABASE_URL must not equal DATABASE_URL.");
  }
  const result = await testPool.query<{ name: string }>("select current_database() as name");
  const name = result.rows[0]?.name;
  if (!name?.endsWith("_test")) {
    throw new Error(`Refusing destructive test setup for database ${name ?? "<unknown>"}; its name must end in _test.`);
  }
}
