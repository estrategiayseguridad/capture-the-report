import { Buffer } from "node:buffer";
import { importExcel } from "@/services/excel/excel.service";
import { emptyImportResult, type ExcelImportResult } from "@/types/excel";
import { excelFileSchema, MAX_FILE_SIZE } from "@/validators/excel.validator";
import { reportFormSchema } from "@/validators/report";

export const runtime = "nodejs";
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 64 * 1024;

class UploadError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

// Bound the actual stream, including requests without Content-Length, before parsing multipart data.
async function readFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;"))
    throw new UploadError(
      "Envía el archivo mediante el formulario de importación.",
    );
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_SIZE)
    throw new UploadError("El archivo supera el límite de 10 MB.", 413);
  if (!request.body) throw new UploadError("Selecciona un archivo XLSX.");
  const reader = request.body.getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_SIZE) {
        await reader.cancel();
        throw new UploadError("El archivo supera el límite de 10 MB.", 413);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    throw new UploadError(
      "No fue posible leer el formulario. Selecciona el archivo nuevamente.",
    );
  }
}

function json(result: ExcelImportResult, status = 200) {
  return Response.json(result, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const formData = await readFormData(request);
    const metadata = reportFormSchema.safeParse({
      clientName: formData.get("clientName"),
      month: formData.get("month"),
      year: formData.get("year"),
    });
    const result = emptyImportResult();
    if (!metadata.success) {
      result.errors = metadata.error.issues.map((issue) => issue.message);
      return json(result, 400);
    }
    const file = formData.get("file");
    if (!(file instanceof File)) {
      result.errors.push("Selecciona un archivo XLSX.");
      return json(result, 400);
    }
    const validation = excelFileSchema.safeParse({
      name: file.name,
      size: file.size,
    });
    if (!validation.success) {
      result.errors = validation.error.issues.map((issue) => issue.message);
      return json(result, file.size > MAX_FILE_SIZE ? 413 : 400);
    }
    const imported = importExcel(
      Buffer.from(await file.arrayBuffer()),
      file.name,
    );
    imported.context = {
      clientName: metadata.data.clientName,
      month: Number(metadata.data.month),
      year: Number(metadata.data.year),
    };
    return json(imported, imported.success ? 200 : 422);
  } catch (error) {
    const result = emptyImportResult();
    if (error instanceof UploadError) {
      result.errors.push(error.message);
      return json(result, error.status);
    }
    console.error("[excel:import]", error);
    result.errors.push(
      "No fue posible procesar el archivo. Inténtalo nuevamente con un archivo Excel válido.",
    );
    return json(result, 500);
  }
}
