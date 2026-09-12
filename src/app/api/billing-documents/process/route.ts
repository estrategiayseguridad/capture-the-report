import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { processBillingDocuments } from "@/services/billing";

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    let ids: string[] | undefined;
    let limit = 8;
    try {
      const body = (await request.json()) as { ids?: string[]; limit?: number };
      ids = body.ids;
      limit = body.limit ?? 8;
    } catch {
      /* empty body is valid */
    }
    const { result } = await updateStore((store) =>
      processBillingDocuments(store, actor, ids, limit),
    );
    return json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
