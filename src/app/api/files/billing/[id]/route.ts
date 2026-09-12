import { promises as fs } from "fs";
import path from "path";
import { errorResponse, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { billingDir } from "@/lib/paths";
import { assertNoTraversal } from "@/lib/files";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const { id } = await params;
    const store = await readStore();
    const doc = store.billingDocuments.find((item) => item.id === id);
    if (!doc) throw new HttpError(404, "Documento no encontrado");
    const filePath = path.join(billingDir(), doc.file.storedName);
    assertNoTraversal(billingDir(), filePath);
    const buffer = await fs.readFile(filePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": doc.file.mimeType,
        "Content-Disposition": `inline; filename="${doc.file.originalName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
