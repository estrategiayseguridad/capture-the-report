import { promises as fs } from "fs";
import path from "path";
import { errorResponse, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { receiptsDir } from "@/lib/paths";
import { assertNoTraversal } from "@/lib/files";
import { canViewExpense, isAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    const { id } = await params;
    const store = await readStore();
    const receipt = store.receiptFiles.find((item) => item.id === id);
    if (!receipt) throw new HttpError(404, "Recibo no encontrado");
    const related = store.expenses.filter((expense) => expense.receiptFileId === id);
    const allowed =
      receipt.uploadedBy === actor.id ||
      isAdmin(actor.role) ||
      related.some((expense) => canViewExpense(actor, expense));
    if (!allowed) throw new HttpError(403, "No puedes ver este recibo");
    const filePath = path.join(receiptsDir(), receipt.storedName);
    assertNoTraversal(receiptsDir(), filePath);
    const buffer = await fs.readFile(filePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": receipt.mimeType,
        "Content-Disposition": `inline; filename="${receipt.originalName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
