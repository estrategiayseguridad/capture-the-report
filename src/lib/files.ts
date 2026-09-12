import path from "path";
import { HttpError } from "./http";
import { newId } from "./ids";

export const RECEIPT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const BILLING_MIME = new Set([
  "application/xml",
  "text/xml",
  "application/json",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "text/csv",
  "application/pdf",
]);

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
export const MAX_BILLING_BYTES = 15 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/xml": ".xml",
  "text/xml": ".xml",
  "application/json": ".json",
  "text/plain": ".txt",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "text/csv": ".csv",
  "application/pdf": ".pdf",
};

export function safeOriginalName(name: string): string {
  const base = path.basename(name).replace(/[^\w.\- ()áéíóúÁÉÍÓÚñÑ]+/g, "_");
  return base.slice(0, 120) || "archivo";
}

export function storedFileName(originalName: string, mimeType: string): string {
  const extFromName = path.extname(originalName).toLowerCase();
  const ext = EXT_BY_MIME[mimeType] ?? (extFromName.startsWith(".") ? extFromName : ".bin");
  return `${newId("file")}${ext}`;
}

export function assertNoTraversal(root: string, target: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (
    resolvedTarget !== resolvedRoot &&
    !resolvedTarget.startsWith(resolvedRoot + path.sep)
  ) {
    throw new HttpError(400, "Ruta de archivo inválida");
  }
}

export function validateUpload(
  file: { type: string; size: number; name: string },
  kind: "receipt" | "billing",
) {
  const allowed = kind === "receipt" ? RECEIPT_MIME : BILLING_MIME;
  const max = kind === "receipt" ? MAX_RECEIPT_BYTES : MAX_BILLING_BYTES;
  const mime = file.type || guessMime(file.name);
  if (!allowed.has(mime)) {
    throw new HttpError(400, `Tipo de archivo no permitido: ${mime || "desconocido"}`);
  }
  if (file.size > max) {
    throw new HttpError(400, `El archivo supera el límite de ${Math.round(max / 1024 / 1024)} MB`);
  }
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    throw new HttpError(400, "Nombre de archivo inválido");
  }
  return mime;
}

export function guessMime(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".xml": "application/xml",
    ".json": "application/json",
    ".txt": "text/plain",
    ".zip": "application/zip",
    ".csv": "text/csv",
    ".pdf": "application/pdf",
  };
  return map[ext] ?? "";
}
