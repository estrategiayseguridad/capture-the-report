import path from "path";

export function dataDir(): string {
  return process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), "data");
}

export function storePath(): string {
  return path.join(dataDir(), "app-store.json");
}

export function uploadRoot(): string {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "uploads");
}

export function receiptsDir(): string {
  return path.join(uploadRoot(), "receipts");
}

export function billingDir(): string {
  return path.join(uploadRoot(), "billing-documents");
}

export function appPort(): number {
  return Number(process.env.PORT || 3000);
}
