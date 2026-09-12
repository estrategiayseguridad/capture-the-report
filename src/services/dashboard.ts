import type { DashboardData, DashboardFilters, Expense, AppStore } from "@/lib/types";
import { roundMoney } from "@/lib/normalize";
import { outstandingOf } from "./reimbursements";

function inRange(date: string, from?: string, to?: string): boolean {
  const day = date.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function filterExpenses(store: AppStore, filters: DashboardFilters): Expense[] {
  return store.expenses.filter((expense) => {
    if (expense.expenseStatus === "Cancelled") return false;
    if (filters.employeeId && expense.userId !== filters.employeeId) return false;
    if (filters.departmentId && expense.departmentId !== filters.departmentId) return false;
    if (filters.clientId && expense.clientId !== filters.clientId) return false;
    if (filters.projectId && expense.projectId !== filters.projectId) return false;
    if (filters.expenseStatus && expense.expenseStatus !== filters.expenseStatus) return false;
    if (
      filters.authorizationStatus &&
      expense.authorizationStatus !== filters.authorizationStatus
    ) {
      return false;
    }
    if (
      filters.billingMatchStatus &&
      expense.billingMatchStatus !== filters.billingMatchStatus
    ) {
      return false;
    }
    const date = expense.confirmedDate || expense.createdAt.slice(0, 10);
    if (filters.month) {
      if (!date.startsWith(filters.month)) return false;
    } else if (!inRange(date, filters.from, filters.to)) {
      return false;
    }
    return true;
  });
}

function namedTotals(
  items: { id: string; name: string }[],
  expenses: Expense[],
  pick: (expense: Expense) => string,
): DashboardData["byDepartment"] {
  return items
    .map((item) => ({
      id: item.id,
      name: item.name,
      total: roundMoney(
        expenses
          .filter((expense) => pick(expense) === item.id)
          .reduce((sum, expense) => sum + expense.confirmedTotal, 0),
      ),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function buildDashboard(store: AppStore, filters: DashboardFilters = {}): DashboardData {
  const expenses = filterExpenses(store, filters);
  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const previousMonth = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;

  const totalExpenditure = roundMoney(
    expenses.reduce((sum, expense) => sum + expense.confirmedTotal, 0),
  );
  const currentMonthExpenditure = roundMoney(
    expenses
      .filter((expense) => (expense.confirmedDate || "").startsWith(currentMonth))
      .reduce((sum, expense) => sum + expense.confirmedTotal, 0),
  );
  const previousMonthExpenditure = roundMoney(
    expenses
      .filter((expense) => (expense.confirmedDate || "").startsWith(previousMonth))
      .reduce((sum, expense) => sum + expense.confirmedTotal, 0),
  );

  const months = new Map<string, number>();
  for (const expense of expenses) {
    const month = (expense.confirmedDate || expense.createdAt).slice(0, 7);
    months.set(month, roundMoney((months.get(month) ?? 0) + expense.confirmedTotal));
  }

  const billing = store.billingDocuments;
  const byEmployee = namedTotals(
    store.users.map((user) => ({ id: user.id, name: user.name })),
    expenses,
    (expense) => expense.userId,
  );

  return {
    totalExpenditure,
    currentMonthExpenditure,
    previousMonthExpenditure,
    approved: expenses.filter((expense) => expense.authorizationStatus === "Approved").length,
    pendingAuthorization: expenses.filter(
      (expense) => expense.authorizationStatus === "PendingAuthorization",
    ).length,
    outstandingReimbursement: roundMoney(
      expenses.reduce((sum, expense) => sum + outstandingOf(expense), 0),
    ),
    matchedBillingDocuments: billing.filter((doc) => doc.matchStatus === "Matched").length,
    unmatchedBillingDocuments: billing.filter((doc) => doc.matchStatus === "Unmatched").length,
    needsReview:
      expenses.filter((expense) => expense.expenseStatus === "NeedsReview").length +
      billing.filter((doc) => doc.matchStatus === "NeedsReview").length,
    activeEmployees: store.users.filter((user) => user.active && user.role === "Employee").length,
    activeClients: store.clients.filter((client) => client.active).length,
    activeProjects: store.projects.filter((project) => project.active).length,
    byDepartment: namedTotals(
      store.departments.map((item) => ({ id: item.id, name: item.name })),
      expenses,
      (expense) => expense.departmentId,
    ),
    byClient: namedTotals(
      store.clients.map((item) => ({ id: item.id, name: item.name })),
      expenses,
      (expense) => expense.clientId,
    ),
    byProject: namedTotals(
      store.projects.map((item) => ({ id: item.id, name: item.name })),
      expenses,
      (expense) => expense.projectId,
    ),
    byEmployee,
    monthlyTrend: [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total })),
    outstandingByEmployee: store.users
      .map((user) => ({
        id: user.id,
        name: user.name,
        total: roundMoney(
          expenses
            .filter((expense) => expense.userId === user.id)
            .reduce((sum, expense) => sum + outstandingOf(expense), 0),
        ),
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total),
    billingMatchSplit: {
      matched: billing.filter((doc) => doc.matchStatus === "Matched").length,
      unmatched: billing.filter((doc) => doc.matchStatus === "Unmatched").length,
      needsReview: billing.filter((doc) => doc.matchStatus === "NeedsReview").length,
    },
    topProjects: namedTotals(
      store.projects.map((item) => ({ id: item.id, name: item.name })),
      expenses,
      (expense) => expense.projectId,
    ).slice(0, 5),
    topEmployees: byEmployee.slice(0, 5),
  };
}

export function employeeHome(store: AppStore, userId: string) {
  const mine = store.expenses.filter((expense) => expense.userId === userId);
  return {
    outstanding: roundMoney(mine.reduce((sum, expense) => sum + outstandingOf(expense), 0)),
    submitted: mine.filter((expense) => expense.expenseStatus === "Submitted" || expense.expenseStatus === "PendingAuthorization").length,
    pendingAuthorization: mine.filter(
      (expense) => expense.authorizationStatus === "PendingAuthorization",
    ).length,
    approved: mine.filter((expense) => expense.authorizationStatus === "Approved").length,
    reimbursed: mine.filter(
      (expense) =>
        expense.reimbursementStatus === "Reimbursed" ||
        expense.reimbursementStatus === "Settled",
    ).length,
    unmatched: mine.filter((expense) => expense.billingMatchStatus === "Unmatched").length,
    needsReview: mine.filter((expense) => expense.expenseStatus === "NeedsReview").length,
  };
}
