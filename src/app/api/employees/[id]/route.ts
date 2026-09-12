import { errorResponse, HttpError, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { publicUser, readStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { outstandingOf } from "@/services/reimbursements";
import { roundMoney } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Manager", "Admin", "SuperAdmin"]);
    const { id } = await params;
    const store = await readStore();
    const employee = store.users.find((user) => user.id === id);
    if (!employee) throw new HttpError(404, "Colaborador no encontrado");
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const clientId = url.searchParams.get("clientId");
    const departmentId = url.searchParams.get("departmentId");
    const projectId = url.searchParams.get("projectId");
    const expenses = store.expenses.filter((expense) => {
      if (expense.userId !== id) return false;
      if (month && !expense.confirmedDate.startsWith(month)) return false;
      if (clientId && expense.clientId !== clientId) return false;
      if (departmentId && expense.departmentId !== departmentId) return false;
      if (projectId && expense.projectId !== projectId) return false;
      return true;
    });
    return json({
      employee: publicUser(employee),
      totals: {
        submitted: roundMoney(expenses.reduce((sum, expense) => sum + expense.confirmedTotal, 0)),
        approved: roundMoney(
          expenses
            .filter((expense) => expense.authorizationStatus === "Approved")
            .reduce((sum, expense) => sum + expense.approvedAmount, 0),
        ),
        reimbursed: roundMoney(expenses.reduce((sum, expense) => sum + expense.reimbursedAmount, 0)),
        outstanding: roundMoney(expenses.reduce((sum, expense) => sum + outstandingOf(expense), 0)),
      },
      expenses,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
