export const ROLES = [
  "Employee",
  "Manager",
  "Admin",
  "SuperAdmin",
] as const;
export type Role = (typeof ROLES)[number];

export const EXPENSE_STATUSES = [
  "Draft",
  "Submitted",
  "PendingAuthorization",
  "Approved",
  "Rejected",
  "NeedsReview",
  "Cancelled",
] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export const AUTHORIZATION_STATUSES = [
  "NotRequired",
  "PendingAuthorization",
  "Approved",
  "Rejected",
  "NeedsReview",
] as const;
export type AuthorizationStatus = (typeof AUTHORIZATION_STATUSES)[number];

export const BILLING_MATCH_STATUSES = [
  "Unmatched",
  "Matched",
  "NeedsReview",
] as const;
export type BillingMatchStatus = (typeof BILLING_MATCH_STATUSES)[number];

export const REIMBURSEMENT_STATUSES = [
  "NotReimbursed",
  "PartiallyReimbursed",
  "Reimbursed",
  "Settled",
] as const;
export type ReimbursementStatus = (typeof REIMBURSEMENT_STATUSES)[number];

export const BILLING_PROCESSING_STATUSES = [
  "Pending",
  "Processing",
  "Processed",
  "Failed",
] as const;
export type BillingProcessingStatus = (typeof BILLING_PROCESSING_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  Employee: "Empleado",
  Manager: "Gerente",
  Admin: "Admin",
  SuperAdmin: "Super Admin",
  Draft: "Borrador",
  Submitted: "Enviado",
  PendingAuthorization: "Pendiente de autorización",
  Approved: "Aprobado",
  Rejected: "Rechazado",
  NeedsReview: "Requiere revisión",
  Cancelled: "Cancelado",
  NotRequired: "No aplica",
  Unmatched: "Sin coincidencia",
  Matched: "Conciliado",
  NotReimbursed: "No reembolsado",
  PartiallyReimbursed: "Reembolso parcial",
  Reimbursed: "Reembolsado",
  Settled: "Liquidado",
  Pending: "Pendiente",
  Processing: "Procesando",
  Processed: "Procesado",
  Failed: "Fallido",
};

export const STATUS_TONES: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Submitted: "bg-sky-100 text-sky-800",
  PendingAuthorization: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
  NeedsReview: "bg-orange-100 text-orange-800",
  Cancelled: "bg-slate-200 text-slate-600",
  NotRequired: "bg-slate-100 text-slate-600",
  Unmatched: "bg-rose-50 text-rose-700",
  Matched: "bg-emerald-50 text-emerald-800",
  NotReimbursed: "bg-slate-100 text-slate-700",
  PartiallyReimbursed: "bg-amber-100 text-amber-800",
  Reimbursed: "bg-teal-100 text-teal-800",
  Settled: "bg-teal-200 text-teal-900",
  Pending: "bg-slate-100 text-slate-700",
  Processing: "bg-sky-100 text-sky-800",
  Processed: "bg-emerald-100 text-emerald-800",
  Failed: "bg-rose-100 text-rose-800",
};

export function labelOf(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
