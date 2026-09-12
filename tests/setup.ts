import { execFileSync } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { resolve } from "node:path";
import { historyTestDatabaseUrl } from "./fixtures/history-database";

export default function setup() {
  // Prisma's Windows engine requires the SQLite file to exist for migrate deploy.
  // Append mode creates an empty file if missing and leaves existing data intact.
  closeSync(openSync(resolve(".next/e2e-history.db"), "a"));
  execFileSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      env: { ...process.env, DATABASE_URL: historyTestDatabaseUrl },
      stdio: "pipe",
    },
  );
}
