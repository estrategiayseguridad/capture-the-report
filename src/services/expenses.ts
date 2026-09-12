import { HttpError } from "@/lib/http";
import { newId, nowIso } from "@/lib/ids";
import { roundMoney } from "@/lib/normalize";
import { canAuthorizeExpense } from "@/lib/rbac";
import type {
  AppStore,
  Expense,
  PublicUser,
} from "@/lib/types";
import { appendAudit } from "./audit";
import { findDuplicateExpenses } from "./duplicates";
import { reimbursementStatusFor } from "./reimbursements";

const CLIENT_FORBIDDEN_STATUSES = new Set([
  "Approved",
  "Rejected",
  "Reimbursed",
  "Settled",
  "PartiallyReimbursed",
]);

export type ExpenseInput = {
  receiptFileId?: string | null;
  ocrDocumentNumber?: string | null;
  confirmedDocumentNumber: string;
  ocrConfidence?: number | null;
  ocrRawText?: string;
  ocrCandidates?: Expense["ocrCandidates"];
  ocrTotal?: number | null;
  confirmedTotal: number;
  ocrDate?: string | null;
  confirmedDate: string;
  ocrVendor?: string | null;
  confirmedVendor: string;
  ocrCurrency?: string | null;
  confirmedCurrency: string;
  departmentId: string;
  clientId: string;
  projectId: string;
  notes?: string;
};

export function validateExpenseInput(store: AppStore, input: ExpenseInput) {
  if (!input.confirmedDocumentNumber.trim()) {
    throw new HttpError(400, "El número de documento es obligatorio");
  }
  if (!Number.isFinite(input.confirmedTotal) || input.confirmedTotal <= 0) {
    throw new HttpError(400, "El monto debe ser mayor a 0");
  }
  if (!input.confirmedDate) {
    throw new HttpError(400, "La fecha es obligatoria");
  }
  if (!input.confirmedVendor.trim()) {
    throw new HttpError(400, "El proveedor es obligatorio");
  }
  if (!store.departments.some((item) => item.id === input.departmentId && item.active)) {
    throw new HttpError(400, "Departamento inválido");
  }
  if (!store.clients.some((item) => item.id === input.clientId && item.active)) {
    throw new HttpError(400, "Cliente inválido");
  }
  const project = store.projects.find((item) => item.id === input.projectId && item.active);
  if (!project) throw new HttpError(400, "Proyecto inválido");
  if (project.clientId !== input.clientId) {
    throw new HttpError(400, "El proyecto no pertenece al cliente seleccionado");
  }
}

export function createExpense(
  store: AppStore,
  actor: PublicUser,
  input: ExpenseInput,
  submit: boolean,
): Expense {
  validateExpenseInput(store, input);
  const timestamp = nowIso();
  const duplicates = findDuplicateExpenses(
    {
      id: "new",
      userId: actor.id,
      confirmedDocumentNumber: input.confirmedDocumentNumber,
      confirmedVendor: input.confirmedVendor,
      confirmedDate: input.confirmedDate,
      confirmedTotal: input.confirmedTotal,
    },
    store.expenses,
  );
  const expense: Expense = {
    id: newId("exp"),
    userId: actor.id,
    documentNumber: input.confirmedDocumentNumber.trim(),
    ocrDocumentNumber: input.ocrDocumentNumber ?? null,
    confirmedDocumentNumber: input.confirmedDocumentNumber.trim(),
    ocrConfidence: input.ocrConfidence ?? null,
    ocrRawText: input.ocrRawText ?? "",
    ocrCandidates: input.ocrCandidates ?? [],
    receiptFileId: input.receiptFileId ?? null,
    ocrTotal: input.ocrTotal ?? null,
    confirmedTotal: roundMoney(input.confirmedTotal),
    ocrDate: input.ocrDate ?? null,
    confirmedDate: input.confirmedDate,
    ocrVendor: input.ocrVendor ?? null,
    confirmedVendor: input.confirmedVendor.trim(),
    ocrCurrency: input.ocrCurrency ?? null,
    confirmedCurrency: input.confirmedCurrency || "GTQ",
    departmentId: input.departmentId,
    clientId: input.clientId,
    projectId: input.projectId,
    notes: input.notes ?? "",
    expenseStatus: "Draft",
    authorizationStatus: "NotRequired",
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
    duplicateOfIds: duplicates.map((item) => item.id),
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: null,
  };
  store.expenses.unshift(expense);
  appendAudit(store, {
    userId: actor.id,
    action: "expense.create",
    entityType: "expense",
    entityId: expense.id,
    before: null,
    after: snapshotExpense(expense),
  });
  if (submit) {
    return submitExpense(store, actor, expense.id);
  }
  return expense;
}

export function snapshotExpense(expense: Expense) {
  return {
    documentNumber: expense.confirmedDocumentNumber,
    total: expense.confirmedTotal,
    date: expense.confirmedDate,
    vendor: expense.confirmedVendor,
    departmentId: expense.departmentId,
    clientId: expense.clientId,
    projectId: expense.projectId,
    expenseStatus: expense.expenseStatus,
    authorizationStatus: expense.authorizationStatus,
    reimbursementStatus: expense.reimbursementStatus,
    approvedAmount: expense.approvedAmount,
    reimbursedAmount: expense.reimbursedAmount,
  };
}

export function updateDraftExpense(
  store: AppStore,
  actor: PublicUser,
  expenseId: string,
  input: Partial<ExpenseInput>,
): Expense {
  const expense = store.expenses.find((item) => item.id === expenseId);
  if (!expense) throw new HttpError(404, "Gasto no encontrado");
  if (expense.userId !== actor.id) {
    throw new HttpError(403, "Solo puedes editar tus propios borradores");
  }
  if (expense.expenseStatus !== "Draft") {
    throw new HttpError(400, "Solo se puede editar un borrador");
  }
  const before = snapshotExpense(expense);
  const merged: ExpenseInput = {
    receiptFileId: input.receiptFileId ?? expense.receiptFileId,
    ocrDocumentNumber: input.ocrDocumentNumber ?? expense.ocrDocumentNumber,
    confirmedDocumentNumber:
      input.confirmedDocumentNumber ?? expense.confirmedDocumentNumber,
    ocrConfidence: input.ocrConfidence ?? expense.ocrConfidence,
    ocrRawText: input.ocrRawText ?? expense.ocrRawText,
    ocrCandidates: input.ocrCandidates ?? expense.ocrCandidates,
    ocrTotal: input.ocrTotal ?? expense.ocrTotal,
    confirmedTotal: input.confirmedTotal ?? expense.confirmedTotal,
    ocrDate: input.ocrDate ?? expense.ocrDate,
    confirmedDate: input.confirmedDate ?? expense.confirmedDate,
    ocrVendor: input.ocrVendor ?? expense.ocrVendor,
    confirmedVendor: input.confirmedVendor ?? expense.confirmedVendor,
    ocrCurrency: input.ocrCurrency ?? expense.ocrCurrency,
    confirmedCurrency: input.confirmedCurrency ?? expense.confirmedCurrency,
    departmentId: input.departmentId ?? expense.departmentId,
    clientId: input.clientId ?? expense.clientId,
    projectId: input.projectId ?? expense.projectId,
    notes: input.notes ?? expense.notes,
  };
  validateExpenseInput(store, merged);
  Object.assign(expense, {
    ...merged,
    documentNumber: merged.confirmedDocumentNumber.trim(),
    confirmedDocumentNumber: merged.confirmedDocumentNumber.trim(),
    confirmedVendor: merged.confirmedVendor.trim(),
    confirmedTotal: roundMoney(merged.confirmedTotal),
    updatedAt: nowIso(),
  });
  appendAudit(store, {
    userId: actor.id,
    action: "expense.update",
    entityType: "expense",
    entityId: expense.id,
    before,
    after: snapshotExpense(expense),
  });
  return expense;
}

export function submitExpense(
  store: AppStore,
  actor: PublicUser,
  expenseId: string,
): Expense {
  const expense = store.expenses.find((item) => item.id === expenseId);
  if (!expense) throw new HttpError(404, "Gasto no encontrado");
  if (expense.userId !== actor.id && actor.role !== "Admin" && actor.role !== "SuperAdmin") {
    throw new HttpError(403, "No puedes enviar el gasto de otra persona");
  }
  if (expense.expenseStatus !== "Draft" && expense.expenseStatus !== "NeedsReview") {
    throw new HttpError(400, "Este gasto ya fue enviado");
  }
  const duplicates = findDuplicateExpenses(expense, store.expenses);
  expense.duplicateOfIds = duplicates.map((item) => item.id);
  expense.submittedAt = nowIso();
  expense.updatedAt = nowIso();
  expense.authorizationStatus = "PendingAuthorization";
  if (duplicates.length) {
    expense.expenseStatus = "NeedsReview";
  } else {
    expense.expenseStatus = "Submitted";
  }
  appendAudit(store, {
    userId: actor.id,
    action: "expense.submit",
    entityType: "expense",
    entityId: expense.id,
    before: null,
    after: snapshotExpense(expense),
  });
  return expense;
}

export function authorizeExpense(
  store: AppStore,
  actor: PublicUser,
  expenseId: string,
  action: "approve" | "reject" | "needs_review",
  notes: string,
): Expense {
  const expense = store.expenses.find((item) => item.id === expenseId);
  if (!expense) throw new HttpError(404, "Gasto no encontrado");
  if (!canAuthorizeExpense(actor, expense)) {
    throw new HttpError(403, "No puedes autorizar este gasto");
  }
  if (
    expense.authorizationStatus !== "PendingAuthorization" &&
    expense.authorizationStatus !== "NeedsReview"
  ) {
    throw new HttpError(400, "El gasto no está pendiente de autorización");
  }
  const before = snapshotExpense(expense);
  const timestamp = nowIso();
  expense.authorizedBy = actor.id;
  expense.authorizedAt = timestamp;
  expense.authorizationNotes = notes;
  expense.updatedAt = timestamp;
  if (action === "approve") {
    expense.authorizationStatus = "Approved";
    expense.expenseStatus = "Approved";
    expense.approvedAmount = expense.confirmedTotal;
  } else if (action === "reject") {
    expense.authorizationStatus = "Rejected";
    expense.expenseStatus = "Rejected";
    expense.approvedAmount = 0;
  } else {
    expense.authorizationStatus = "NeedsReview";
    expense.expenseStatus = "NeedsReview";
  }
  expense.reimbursementStatus = reimbursementStatusFor(expense);
  store.authorizations.unshift({
    id: newId("authz"),
    expenseId: expense.id,
    actorId: actor.id,
    action,
    notes,
    createdAt: timestamp,
  });
  appendAudit(store, {
    userId: actor.id,
    action: `expense.${action}`,
    entityType: "expense",
    entityId: expense.id,
    before,
    after: snapshotExpense(expense),
  });
  return expense;
}

export function rejectClientStatus(value: unknown) {
  if (typeof value === "string" && CLIENT_FORBIDDEN_STATUSES.has(value)) {
    throw new HttpError(400, "No puedes establecer ese estado desde el cliente");
  }
}
