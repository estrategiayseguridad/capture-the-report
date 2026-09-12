import { normalizeDocumentNumber, normalizeText, roundMoney } from "@/lib/normalize";
import type { BillingDocument, Expense } from "@/lib/types";

export type MatchCandidate = {
  expenseId: string;
  confidence: number;
  reasons: string[];
};

const AUTO_MATCH_THRESHOLD = 0.85;

function amountClose(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return false;
  return Math.abs(roundMoney(a) - roundMoney(b)) <= 0.05;
}

function dateClose(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return a.slice(0, 10) === b.slice(0, 10);
}

function vendorClose(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const left = normalizeText(a);
  const right = normalizeText(b);
  return left.includes(right) || right.includes(left);
}

export function scoreExpenseMatch(
  doc: Pick<
    BillingDocument,
    "normalizedDocumentNumber" | "documentNumber" | "total" | "date" | "currency" | "issuer"
  >,
  expense: Expense,
): MatchCandidate {
  const reasons: string[] = [];
  let confidence = 0;
  const docNumber =
    doc.normalizedDocumentNumber ||
    (doc.documentNumber ? normalizeDocumentNumber(doc.documentNumber) : "");
  const expNumber = normalizeDocumentNumber(expense.confirmedDocumentNumber);

  if (docNumber && expNumber && docNumber === expNumber) {
    confidence += 0.7;
    reasons.push("document-number");
  }
  if (amountClose(doc.total, expense.confirmedTotal)) {
    confidence += 0.15;
    reasons.push("amount");
  }
  if (dateClose(doc.date, expense.confirmedDate)) {
    confidence += 0.1;
    reasons.push("date");
  }
  if (vendorClose(doc.issuer, expense.confirmedVendor)) {
    confidence += 0.08;
    reasons.push("vendor");
  }
  if (doc.currency && expense.confirmedCurrency && doc.currency === expense.confirmedCurrency) {
    confidence += 0.02;
    reasons.push("currency");
  }

  if (!docNumber || !expNumber || docNumber !== expNumber) {
    confidence = Math.min(confidence, 0.72);
  }

  return {
    expenseId: expense.id,
    confidence: Math.min(1, roundMoney(confidence)),
    reasons,
  };
}

export function findMatchCandidates(
  doc: BillingDocument,
  expenses: Expense[],
): MatchCandidate[] {
  return expenses
    .filter((expense) => expense.expenseStatus !== "Cancelled")
    .map((expense) => scoreExpenseMatch(doc, expense))
    .filter((item) => item.confidence >= 0.4)
    .sort((a, b) => b.confidence - a.confidence);
}

export function decideMatch(candidates: MatchCandidate[]): {
  status: "Matched" | "NeedsReview" | "Unmatched";
  matchedExpenseId: string | null;
  confidence: number | null;
  candidateExpenseIds: string[];
} {
  if (!candidates.length) {
    return {
      status: "Unmatched",
      matchedExpenseId: null,
      confidence: null,
      candidateExpenseIds: [],
    };
  }
  const top = candidates[0];
  const close = candidates.filter(
    (item) => item.confidence >= AUTO_MATCH_THRESHOLD && item.confidence >= top.confidence - 0.05,
  );
  if (top.confidence >= AUTO_MATCH_THRESHOLD && close.length === 1) {
    return {
      status: "Matched",
      matchedExpenseId: top.expenseId,
      confidence: top.confidence,
      candidateExpenseIds: candidates.slice(0, 5).map((item) => item.expenseId),
    };
  }
  if (candidates.length > 1 && candidates[1].confidence >= 0.6) {
    return {
      status: "NeedsReview",
      matchedExpenseId: null,
      confidence: top.confidence,
      candidateExpenseIds: candidates.slice(0, 5).map((item) => item.expenseId),
    };
  }
  if (top.confidence >= 0.6 && top.confidence < AUTO_MATCH_THRESHOLD) {
    return {
      status: "NeedsReview",
      matchedExpenseId: null,
      confidence: top.confidence,
      candidateExpenseIds: candidates.slice(0, 5).map((item) => item.expenseId),
    };
  }
  return {
    status: "Unmatched",
    matchedExpenseId: null,
    confidence: top.confidence,
    candidateExpenseIds: candidates.slice(0, 5).map((item) => item.expenseId),
  };
}
