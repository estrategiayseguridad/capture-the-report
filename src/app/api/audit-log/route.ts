import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const store = await readStore();
    const logs = store.auditLogs.filter((item) => {
      if (!q) return true;
      return `${item.action} ${item.entityType} ${item.entityId}`.toLowerCase().includes(q);
    });
    return json({ logs: logs.slice(0, 400) });
  } catch (error) {
    return errorResponse(error);
  }
}
