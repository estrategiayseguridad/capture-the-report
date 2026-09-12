import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { buildDashboard } from "@/services/dashboard";
import { requireRole } from "@/lib/rbac";
import type { DashboardFilters } from "@/lib/types";
import type {
  AuthorizationStatus,
  BillingMatchStatus,
  ExpenseStatus,
} from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    requireRole(user, ["Manager", "Admin", "SuperAdmin"]);
    const url = new URL(request.url);
    const filters: DashboardFilters = {
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      month: url.searchParams.get("month") ?? undefined,
      employeeId: url.searchParams.get("employeeId") ?? undefined,
      departmentId: url.searchParams.get("departmentId") ?? undefined,
      clientId: url.searchParams.get("clientId") ?? undefined,
      projectId: url.searchParams.get("projectId") ?? undefined,
      expenseStatus: (url.searchParams.get("expenseStatus") as ExpenseStatus) || undefined,
      authorizationStatus:
        (url.searchParams.get("authorizationStatus") as AuthorizationStatus) || undefined,
      billingMatchStatus:
        (url.searchParams.get("billingMatchStatus") as BillingMatchStatus) || undefined,
    };
    const store = await readStore();
    return json(buildDashboard(store, filters));
  } catch (error) {
    return errorResponse(error);
  }
}
