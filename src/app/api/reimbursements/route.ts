import { errorResponse, json } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { publicUser, readStore } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { outstandingOf } from "@/services/reimbursements";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await requireUser();
    requireRole(actor, ["Admin", "SuperAdmin"]);
    const store = await readStore();
    const rows = store.expenses
      .filter((expense) => expense.authorizationStatus === "Approved")
      .map((expense) => ({
        ...expense,
        outstanding: outstandingOf(expense),
        employee: (() => {
          const found = store.users.find((user) => user.id === expense.userId);
          return found ? publicUser(found) : null;
        })(),
      }));
    return json({
      expenses: rows,
      reimbursements: store.reimbursements,
      users: store.users.map(publicUser),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
