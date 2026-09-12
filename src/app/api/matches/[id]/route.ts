import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { manualMatch } from "@/services/billing";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const { id } = await params;
    const body = await readJsonBody<{
      action: "match" | "reject" | "unmatched";
      expenseId?: string;
    }>(request);
    const { result } = await updateStore((store) =>
      manualMatch(store, actor, id, body.action, body.expenseId),
    );
    return json({ document: result });
  } catch (error) {
    return errorResponse(error);
  }
}
