import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { upsertDepartment } from "@/services/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const store = await readStore();
    return json({ departments: store.departments });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const body = await readJsonBody<{
      id?: string;
      name: string;
      code: string;
      managerId?: string | null;
      active?: boolean;
    }>(request);
    const { result } = await updateStore((store) => upsertDepartment(store, actor, body));
    return json({ department: result });
  } catch (error) {
    return errorResponse(error);
  }
}
