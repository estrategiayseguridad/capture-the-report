import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { upsertProject } from "@/services/catalogs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireUser();
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");
    const store = await readStore();
    const projects = clientId
      ? store.projects.filter((item) => item.clientId === clientId)
      : store.projects;
    return json({ projects });
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
      clientId: string;
      active?: boolean;
    }>(request);
    const { result } = await updateStore((store) => upsertProject(store, actor, body));
    return json({ project: result });
  } catch (error) {
    return errorResponse(error);
  }
}
