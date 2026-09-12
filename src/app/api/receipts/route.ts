import { promises as fs } from "fs";
import path from "path";
import { errorResponse, HttpError, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { receiptsDir } from "@/lib/paths";
import { assertNoTraversal, safeOriginalName, storedFileName, validateUpload } from "@/lib/files";
import { newId, nowIso } from "@/lib/ids";
import { appendAudit } from "@/services/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Adjunta una foto o archivo");
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = validateUpload(
      { name: file.name, type: file.type, size: file.size },
      "receipt",
    );
    await fs.mkdir(receiptsDir(), { recursive: true });
    const storedName = storedFileName(file.name, mime);
    const dest = path.join(receiptsDir(), storedName);
    assertNoTraversal(receiptsDir(), dest);
    await fs.writeFile(dest, buffer);
    const { result } = await updateStore((store) => {
      const receipt = {
        id: newId("rcpt"),
        storedName,
        originalName: safeOriginalName(file.name),
        mimeType: mime,
        size: file.size,
        uploadedBy: actor.id,
        createdAt: nowIso(),
      };
      store.receiptFiles.unshift(receipt);
      appendAudit(store, {
        userId: actor.id,
        action: "receipt.upload",
        entityType: "receipt",
        entityId: receipt.id,
        before: null,
        after: { originalName: receipt.originalName, size: receipt.size },
      });
      return receipt;
    });
    return json({ receipt: result }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
