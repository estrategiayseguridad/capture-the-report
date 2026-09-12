import { errorResponse, HttpError, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { publicUser, readStore, updateStore } from "@/lib/db";
import { assertExpenseAccess } from "@/lib/rbac";
import { rejectClientStatus, updateDraftExpense, type ExpenseInput } from "@/services/expenses";
import { outstandingOf } from "@/services/reimbursements";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    const { id } = await params;
    const store = await readStore();
    const expense = store.expenses.find((item) => item.id === id);
    if (!expense) throw new HttpError(404, "Gasto no encontrado");
    assertExpenseAccess(actor, expense);
    const receipt = store.receiptFiles.find((item) => item.id === expense.receiptFileId) ?? null;
    const employee = store.users.find((item) => item.id === expense.userId);
    const billing = store.billingDocuments.find(
      (item) => item.id === expense.matchedBillingDocumentId,
    );
    return json({
      expense: { ...expense, outstanding: outstandingOf(expense) },
      receipt,
      employee: employee ? publicUser(employee) : null,
      billing: billing ?? null,
      departments: store.departments,
      clients: store.clients,
      projects: store.projects,
      reimbursements: store.reimbursements.filter((item) => item.expenseId === expense.id),
      authorizations: store.authorizations.filter((item) => item.expenseId === expense.id),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireUser();
    const { id } = await params;
    const body = await readJsonBody<Partial<ExpenseInput> & { expenseStatus?: string }>(request);
    rejectClientStatus(body.expenseStatus);
    const { result } = await updateStore((store) => updateDraftExpense(store, actor, id, body));
    return json({ expense: result });
  } catch (error) {
    return errorResponse(error);
  }
}
