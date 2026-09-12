import { normalizeDocumentNumber, normalizeText, roundMoney } from "@/lib/normalize";
import type { Expense } from "@/lib/types";

export function findDuplicateExpenses(
  candidate: Pick<
    Expense,
    | "id"
    | "userId"
    | "confirmedDocumentNumber"
    | "confirmedVendor"
    | "confirmedDate"
    | "confirmedTotal"
  >,
  expenses: Expense[],
): Expense[] {
  const number = normalizeDocumentNumber(candidate.confirmedDocumentNumber);
  return expenses.filter((expense) => {
    if (expense.id === candidate.id) return false;
    if (expense.expenseStatus === "Cancelled") return false;
    const sameNumber =
      number &&
      normalizeDocumentNumber(expense.confirmedDocumentNumber) === number;
    const sameVendor =
      normalizeText(expense.confirmedVendor) ===
      normalizeText(candidate.confirmedVendor);
    const sameDate = expense.confirmedDate === candidate.confirmedDate;
    const sameAmount =
      roundMoney(expense.confirmedTotal) === roundMoney(candidate.confirmedTotal);
    const sameUser = expense.userId === candidate.userId;

    if (sameNumber && (sameUser || sameAmount || sameDate)) return true;
    if (sameUser && sameVendor && sameDate && sameAmount) return true;
    return false;
  });
}
