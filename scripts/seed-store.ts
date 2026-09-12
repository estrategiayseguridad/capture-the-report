import { promises as fs } from "fs";
import { dataDir, storePath } from "../src/lib/paths";
import type { AppStore } from "../src/lib/types";

export async function writeStore(store: AppStore) {
  await fs.mkdir(dataDir(), { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(store, null, 2), "utf8");
}
