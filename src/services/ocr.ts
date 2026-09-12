import "server-only";
import { HttpError } from "@/lib/http";
import { parseReceiptText } from "./receipt-parser";
import type { OcrParseResult } from "@/lib/types";

export type OcrEngineStatus = {
  available: boolean;
  engine: string;
  message: string;
};

let cachedStatus: OcrEngineStatus | null = null;

export async function getOcrStatus(): Promise<OcrEngineStatus> {
  if (cachedStatus) return cachedStatus;
  try {
    await import("tesseract.js");
    cachedStatus = {
      available: true,
      engine: "tesseract.js",
      message: "OCR local listo (Tesseract).",
    };
  } catch {
    cachedStatus = {
      available: false,
      engine: "none",
      message:
        "No se pudo cargar tesseract.js. Instala dependencias con npm install y reintenta.",
    };
  }
  return cachedStatus;
}

export async function recognizeImage(buffer: Buffer): Promise<OcrParseResult> {
  const status = await getOcrStatus();
  if (!status.available) {
    throw new HttpError(503, status.message);
  }
  try {
    const { createWorker } = await import("tesseract.js");
    const langs = process.env.OCR_LANGS || "spa+eng";
    const worker = await createWorker(langs);
    try {
      const result = await worker.recognize(buffer);
      const rawText = result.data.text ?? "";
      if (!rawText.trim()) {
        const parsed = parseReceiptText("");
        return {
          ...parsed,
          rawText: "",
          documentNumberFound: false,
          confidence: 0,
        };
      }
      return parseReceiptText(rawText);
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de OCR";
    throw new HttpError(
      503,
      `OCR local no pudo ejecutarse: ${message}. Verifica la instalación de tesseract.js.`,
    );
  }
}
