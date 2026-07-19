import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createDatabase } from "../lib/db/client";

const BASELINE = resolve("drizzle/0000_baseline.sql");
const BASELINE_CREATED_AT = 1_784_422_841_149;
const LOCK_ID = 8_107_202_026;

type Pool = ReturnType<typeof createDatabase>["pool"];

function required(name: "DATABASE_URL" | "TEST_DATABASE_URL") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function databaseName(pool: Pool) {
  const result = await pool.query<{ name: string }>("select current_database() as name");
  return result.rows[0]?.name ?? "";
}

async function assertTestDatabase(pool: Pool, testUrl: string, databaseUrl: string) {
  if (new URL(testUrl).toString() === new URL(databaseUrl).toString()) {
    throw new Error("TEST_DATABASE_URL must not equal DATABASE_URL.");
  }
  const name = await databaseName(pool);
  if (!name.endsWith("_test")) {
    throw new Error(`Refusing destructive setup for ${name || "<unknown>"}; test database names must end in _test.`);
  }
}

const CATALOG_QUERIES = {
  enums: `select n.nspname as schema, t.typname as name, e.enumsortorder as position, e.enumlabel as value
    from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' order by 1, 2, 3`,
  columns: `select table_schema as schema, table_name, ordinal_position, column_name, data_type,
      coalesce(udt_name, '') as udt_name, is_nullable, coalesce(column_default, '') as column_default
    from information_schema.columns where table_schema = 'public'
    order by 1, 2, 3`,
  constraints: `select ns.nspname as schema, cls.relname as table_name, con.contype as type,
      pg_get_constraintdef(con.oid, true) as definition
    from pg_constraint con join pg_class cls on cls.oid = con.conrelid join pg_namespace ns on ns.oid = cls.relnamespace
    where ns.nspname = 'public' order by 1, 2, 3, 4`,
  indexes: `select schemaname as schema, tablename as table_name,
      regexp_replace(indexdef, 'INDEX [^ ]+ ON', 'INDEX ON') as definition
    from pg_indexes where schemaname = 'public' order by 1, 2, 3`,
} as const;

async function catalog(pool: Pool) {
  const entries = await Promise.all(
    Object.entries(CATALOG_QUERIES).map(async ([name, query]) => [name, (await pool.query(query)).rows]),
  );
  return Object.fromEntries(entries);
}

function diffCatalog(expected: Record<string, unknown>, actual: Record<string, unknown>) {
  const differences: string[] = [];
  for (const key of Object.keys(expected)) {
    const left = JSON.stringify(expected[key], null, 2);
    const right = JSON.stringify(actual[key], null, 2);
    if (left !== right) differences.push(`${key}\nEXPECTED (baseline):\n${left}\nACTUAL (development):\n${right}`);
  }
  return differences;
}

async function prepareBaselineDatabase(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock($1)", [LOCK_ID]);
    await client.query("drop schema if exists public cascade");
    await client.query("create schema public");
    const baselineSql = (await readFile(BASELINE, "utf8")).replaceAll("--> statement-breakpoint", "");
    await client.query(baselineSql);
  } finally {
    await client.query("select pg_advisory_unlock($1)", [LOCK_ID]);
    client.release();
  }
}

async function main() {
  const command = process.argv[2];
  if (command !== "verify" && command !== "adopt") {
    throw new Error("Usage: bun scripts/baseline.ts <verify|adopt>");
  }
  const databaseUrl = required("DATABASE_URL");
  const testUrl = required("TEST_DATABASE_URL");
  const development = createDatabase(databaseUrl);
  const test = createDatabase(testUrl);
  try {
    await assertTestDatabase(test.pool, testUrl, databaseUrl);
    await prepareBaselineDatabase(test.pool);
    const [expected, actual] = await Promise.all([catalog(test.pool), catalog(development.pool)]);
    const differences = diffCatalog(expected, actual);
    if (differences.length) throw new Error(`Schema parity check failed:\n\n${differences.join("\n\n")}`);
    console.log("Schema parity verified against the committed baseline.");
    if (command === "verify") return;
    if (process.env.CONFIRM_BASELINE_ADOPTION !== "I_HAVE_VERIFIED_SCHEMA_PARITY") {
      throw new Error("Set CONFIRM_BASELINE_ADOPTION=I_HAVE_VERIFIED_SCHEMA_PARITY to record the baseline.");
    }
    const sql = await readFile(BASELINE, "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    const client = await development.pool.connect();
    try {
      await client.query("begin");
      await client.query("create schema if not exists drizzle");
      await client.query(`create table if not exists drizzle.__drizzle_migrations (
        id serial primary key, hash text not null, created_at bigint
      )`);
      const existing = await client.query("select id from drizzle.__drizzle_migrations limit 1");
      if (existing.rowCount) throw new Error("Migration history is not empty; baseline adoption is only valid once.");
      await client.query(
        "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
        [hash, BASELINE_CREATED_AT],
      );
      await client.query("commit");
      console.log("Committed baseline recorded without replaying schema DDL.");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await Promise.all([development.pool.end(), test.pool.end()]);
  }
}

await main();
