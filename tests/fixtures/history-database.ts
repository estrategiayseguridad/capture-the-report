import { resolve } from "node:path";

// Dedicated test artifact; never point integration tests at prisma/dev.db.
export const historyTestDatabaseUrl = `file:${resolve(".next/e2e-history.db").replace(/\\/g, "/")}`;
