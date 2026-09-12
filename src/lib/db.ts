import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { EMPTY_STORE, type AppStore } from "./types";
import { dataDir, storePath } from "./paths";

let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readStore(): Promise<AppStore> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<AppStore>;
    return {
      ...EMPTY_STORE,
      ...parsed,
      users: parsed.users ?? [],
      departments: parsed.departments ?? [],
      clients: parsed.clients ?? [],
      projects: parsed.projects ?? [],
      expenses: parsed.expenses ?? [],
      receiptFiles: parsed.receiptFiles ?? [],
      billingDocuments: parsed.billingDocuments ?? [],
      authorizations: parsed.authorizations ?? [],
      reimbursements: parsed.reimbursements ?? [],
      auditLogs: parsed.auditLogs ?? [],
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { ...EMPTY_STORE };
    throw error;
  }
}

export async function writeStore(store: AppStore): Promise<AppStore> {
  await ensureDir(dataDir());
  const tmp = `${storePath()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, storePath());
  return store;
}

export async function updateStore<T>(
  mutator: (store: AppStore) => T | Promise<T>,
): Promise<{ store: AppStore; result: T }> {
  const run = async () => {
    const store = await readStore();
    const result = await mutator(store);
    await writeStore(store);
    return { store, result };
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function publicUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...rest } = user;
  void _passwordHash;
  return rest;
}

export async function ensureRuntimeDirs() {
  await ensureDir(dataDir());
  await ensureDir(path.join(process.cwd(), "uploads", "receipts"));
  await ensureDir(path.join(process.cwd(), "uploads", "billing-documents"));
}
