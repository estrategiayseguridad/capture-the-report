import { promises as fs } from "fs";
import path from "path";
import { errorResponse, HttpError, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { receiptsDir } from "@/lib/paths";
import { assertNoTraversal } from "@/lib/files";
import { recognizeImage } from "@/services/ocr";
import { parseReceiptText } from "@/services/receipt-parser";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new HttpError(400, "Adjunta una imagen");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await recognizeImage(buffer);
      return json({ ocr: parsed });
    }
    const body = (await request.json()) as { receiptFileId?: string; text?: string };
    if (body.text) {
      return json({ ocr: parseReceiptText(body.text) });
    }
    if (!body.receiptFileId) throw new HttpError(400, "Falta receiptFileId");
    const store = await readStore();
    const receipt = store.receiptFiles.find((item) => item.id === body.receiptFileId);
    if (!receipt) throw new HttpError(404, "Recibo no encontrado");
    if (receipt.uploadedBy !== actor.id && actor.role === "Employee") {
      throw new HttpError(403, "No puedes procesar el recibo de otra persona");
    }
    const filePath = path.join(receiptsDir(), receipt.storedName);
    assertNoTraversal(receiptsDir(), filePath);
    const buffer = await fs.readFile(filePath);
    const parsed = await recognizeImage(buffer);
    return json({ ocr: parsed });
  } catch (error) {
    return errorResponse(error);
  }
}
