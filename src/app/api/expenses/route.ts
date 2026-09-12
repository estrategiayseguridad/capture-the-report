import { errorResponse, json, readJsonBody } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { publicUser, readStore, updateStore } from "@/lib/db";
import { canViewExpense } from "@/lib/rbac";
import { createExpense, rejectClientStatus, type ExpenseInput } from "@/services/expenses";
import { outstandingOf } from "@/services/reimbursements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "1";
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const store = await readStore();
    let expenses = store.expenses.filter((expense) => canViewExpense(user, expense));
    if (mine) expenses = expenses.filter((expense) => expense.userId === user.id);
    const employeeId = url.searchParams.get("employeeId");
    const departmentId = url.searchParams.get("departmentId");
    const clientId = url.searchParams.get("clientId");
    const projectId = url.searchParams.get("projectId");
    const expenseStatus = url.searchParams.get("expenseStatus");
    const authorizationStatus = url.searchParams.get("authorizationStatus");
    const billingMatchStatus = url.searchParams.get("billingMatchStatus");
    const reimbursementStatus = url.searchParams.get("reimbursementStatus");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    expenses = expenses.filter((expense) => {
      if (employeeId && expense.userId !== employeeId) return false;
      if (departmentId && expense.departmentId !== departmentId) return false;
      if (clientId && expense.clientId !== clientId) return false;
      if (projectId && expense.projectId !== projectId) return false;
      if (expenseStatus && expense.expenseStatus !== expenseStatus) return false;
      if (authorizationStatus && expense.authorizationStatus !== authorizationStatus) return false;
      if (billingMatchStatus && expense.billingMatchStatus !== billingMatchStatus) return false;
      if (reimbursementStatus && expense.reimbursementStatus !== reimbursementStatus) return false;
      if (from && expense.confirmedDate < from) return false;
      if (to && expense.confirmedDate > to) return false;
      if (q) {
        const hay = `${expense.confirmedDocumentNumber} ${expense.confirmedVendor}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const users = Object.fromEntries(store.users.map((item) => [item.id, publicUser(item)]));
    return json({
      expenses: expenses.map((expense) => ({
        ...expense,
        outstanding: outstandingOf(expense),
        employee: users[expense.userId] ?? null,
      })),
      departments: store.departments,
      clients: store.clients,
      projects: store.projects,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    const body = await readJsonBody<ExpenseInput & { submit?: boolean; expenseStatus?: string }>(
      request,
    );
    rejectClientStatus(body.expenseStatus);
    const { result } = await updateStore((store) =>
      createExpense(store, actor, body, Boolean(body.submit)),
    );
    return json({ expense: result }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
