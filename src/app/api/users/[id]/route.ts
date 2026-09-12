import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { updateUser } from "@/services/catalogs";
import type { Role } from "@/lib/status";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const { id } = await params;
    const body = await readJsonBody<Partial<{
      name: string;
      email: string;
      password: string;
      role: Role;
      employeeNumber: string;
      departmentId: string;
      managerId: string | null;
      active: boolean;
    }>>(request);
    const { result } = await updateStore((store) => updateUser(store, actor, id, body));
    return json({ user: result });
  } catch (error) {
    return errorResponse(error);
  }
}
