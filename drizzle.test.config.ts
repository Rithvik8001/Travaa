import { defineConfig } from "drizzle-kit";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is required.");

export default defineConfig({
  schema: ["./lib/db/schema.ts", "./lib/db/trips.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
