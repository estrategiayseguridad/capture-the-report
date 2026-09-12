import { describe, expect, it } from "vitest";
import { findDuplicateExpenses } from "../src/services/duplicates";
import type { Expense } from "../src/lib/types";

function expense(partial: Partial<Expense>): Expense {
  return {
    id: "exp_1",
    userId: "usr_a",
    documentNumber: "DTE-1",
    ocrDocumentNumber: null,
    confirmedDocumentNumber: "DTE-1",
    ocrConfidence: null,
    ocrRawText: "",
    ocrCandidates: [],
    receiptFileId: null,
    ocrTotal: null,
    confirmedTotal: 100,
    ocrDate: null,
    confirmedDate: "2026-09-01",
    ocrVendor: null,
    confirmedVendor: "ACME",
    ocrCurrency: null,
    confirmedCurrency: "GTQ",
    departmentId: "dep",
    clientId: "cli",
    projectId: "prj",
    notes: "",
    expenseStatus: "Submitted",
    authorizationStatus: "PendingAuthorization",
    authorizedBy: null,
    authorizedAt: null,
    authorizationNotes: "",
    billingMatchStatus: "Unmatched",
    matchedBillingDocumentId: null,
    reimbursementStatus: "NotReimbursed",
    approvedAmount: 0,
    reimbursedAmount: 0,
    reimbursementDate: null,
    reimbursementReference: null,
    duplicateOfIds: [],
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    submittedAt: "2026-09-01T00:00:00.000Z",
    ...partial,
  };
}

describe("duplicate detection", () => {
  it("flags same document number and employee", () => {
    const existing = expense({ id: "exp_old" });
    const found = findDuplicateExpenses(expense({ id: "exp_new" }), [existing]);
    expect(found.map((item) => item.id)).toEqual(["exp_old"]);
  });

  it("does not flag unrelated expenses", () => {
    const existing = expense({ id: "exp_old", confirmedDocumentNumber: "OTHER", confirmedTotal: 50 });
    expect(findDuplicateExpenses(expense({ id: "exp_new" }), [existing])).toEqual([]);
  });

  it("flags same vendor/date/amount for same employee even without identical formatting", () => {
    const existing = expense({ id: "exp_old", confirmedDocumentNumber: "AA-1" });
    const found = findDuplicateExpenses(
      expense({ id: "new", confirmedDocumentNumber: "aa1" }),
      [existing],
    );
    expect(found.length).toBe(1);
  });
});
