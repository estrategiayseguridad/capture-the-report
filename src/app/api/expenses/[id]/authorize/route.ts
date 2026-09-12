import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { authorizeExpense } from "@/services/expenses";
import { requireRole } from "@/lib/rbac";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Manager", "Admin", "SuperAdmin"]);
    const { id } = await params;
    const body = await readJsonBody<{ notes?: string; action?: "approve" | "needs_review" }>(
      request,
    );
    const { result } = await updateStore((store) =>
      authorizeExpense(store, actor, id, body.action ?? "approve", body.notes ?? ""),
    );
    return json({ expense: result });
  } catch (error) {
    return errorResponse(error);
  }
}
