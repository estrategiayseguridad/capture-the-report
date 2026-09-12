import { HttpError } from "@/lib/http";
import { newId, nowIso } from "@/lib/ids";
import { roundMoney } from "@/lib/normalize";
import type { AppStore, Expense, PublicUser } from "@/lib/types";
import { appendAudit } from "./audit";

export function outstandingOf(expense: Expense): number {
  if (
    expense.expenseStatus === "Rejected" ||
    expense.expenseStatus === "Cancelled" ||
    expense.authorizationStatus !== "Approved"
  ) {
    return 0;
  }
  return roundMoney(Math.max(0, expense.approvedAmount - expense.reimbursedAmount));
}

export function reimbursementStatusFor(expense: Expense): Expense["reimbursementStatus"] {
  if (expense.authorizationStatus !== "Approved") return "NotReimbursed";
  if (expense.reimbursedAmount <= 0) return "NotReimbursed";
  if (outstandingOf(expense) <= 0) {
    return expense.billingMatchStatus === "Matched" ? "Settled" : "Reimbursed";
  }
  return "PartiallyReimbursed";
}

export function applyReimbursement(
  expense: Expense,
  amount: number,
): { ok: true; next: number } | { ok: false; error: string } {
  if (expense.authorizationStatus !== "Approved") {
    return { ok: false, error: "Solo se reembolsa un gasto aprobado" };
  }
  const remaining = outstandingOf(expense);
  const rounded = roundMoney(amount);
  if (rounded <= 0) return { ok: false, error: "El monto debe ser mayor a 0" };
  if (rounded - remaining > 0.001) {
    return { ok: false, error: "El reembolso no puede superar el saldo pendiente" };
  }
  return { ok: true, next: roundMoney(expense.reimbursedAmount + rounded) };
}

export function sumOutstanding(expenses: Expense[]): number {
  return roundMoney(expenses.reduce((sum, expense) => sum + outstandingOf(expense), 0));
}

export function recordReimbursement(
  store: AppStore,
  actor: PublicUser,
  expenseId: string,
  amount: number,
  date: string,
  reference: string,
) {
  const expense = store.expenses.find((item) => item.id === expenseId);
  if (!expense) throw new HttpError(404, "Gasto no encontrado");
  const result = applyReimbursement(expense, amount);
  if (!result.ok) throw new HttpError(400, result.error);
  const before = {
    reimbursedAmount: expense.reimbursedAmount,
    reimbursementStatus: expense.reimbursementStatus,
  };
  expense.reimbursedAmount = result.next;
  expense.reimbursementDate = date || nowIso().slice(0, 10);
  expense.reimbursementReference = reference.trim();
  expense.reimbursementStatus = reimbursementStatusFor(expense);
  expense.updatedAt = nowIso();
  store.reimbursements.unshift({
    id: newId("reimb"),
    expenseId: expense.id,
    employeeId: expense.userId,
    amount: roundMoney(amount),
    date: expense.reimbursementDate,
    reference: expense.reimbursementReference,
    recordedBy: actor.id,
    createdAt: nowIso(),
  });
  appendAudit(store, {
    userId: actor.id,
    action: "expense.reimburse",
    entityType: "expense",
    entityId: expense.id,
    before,
    after: {
      reimbursedAmount: expense.reimbursedAmount,
      reimbursementStatus: expense.reimbursementStatus,
    },
  });
  return expense;
}
