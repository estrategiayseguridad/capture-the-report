import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { publicUser, readStore, updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { createUser } from "@/services/catalogs";
import type { Role } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    requireRole(user, ["Manager", "Admin", "SuperAdmin"]);
    const store = await readStore();
    return json({ users: store.users.map(publicUser) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const body = await readJsonBody<{
      name: string;
      email: string;
      password: string;
      role: Role;
      employeeNumber: string;
      departmentId: string;
      managerId?: string | null;
    }>(request);
    const { result } = await updateStore((store) => createUser(store, actor, body));
    return json({ user: result }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
