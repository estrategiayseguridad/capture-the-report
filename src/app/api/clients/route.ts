import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { upsertClient } from "@/services/catalogs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const store = await readStore();
    return json({ clients: store.clients });
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
      active?: boolean;
    }>(request);
    const { result } = await updateStore((store) => upsertClient(store, actor, body));
    return json({ client: result });
  } catch (error) {
    return errorResponse(error);
  }
}
