import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { recordReimbursement } from "@/services/reimbursements";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const { id } = await params;
    const body = await readJsonBody<{ amount: number; date?: string; reference?: string }>(request);
    const { result } = await updateStore((store) =>
      recordReimbursement(
        store,
        actor,
        id,
        Number(body.amount),
        body.date ?? "",
        body.reference ?? "",
      ),
    );
    return json({ expense: result });
  } catch (error) {
    return errorResponse(error);
  }
}
