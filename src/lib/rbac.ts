import type { Role } from "./status";
import type { Expense, PublicUser, User } from "./types";
import { HttpError } from "./http";

export const ADMIN_ROLES: Role[] = ["Admin", "SuperAdmin"];
export const MANAGER_PLUS: Role[] = ["Manager", "Admin", "SuperAdmin"];
export const ALL_ROLES: Role[] = ["Employee", "Manager", "Admin", "SuperAdmin"];

export function isAdmin(role: Role): boolean {
  return role === "Admin" || role === "SuperAdmin";
}

export function canManageCatalogs(role: Role): boolean {
  return isAdmin(role);
}

export function canAuthorize(role: Role): boolean {
  return role === "Manager" || isAdmin(role);
}

export function canReimburse(role: Role): boolean {
  return isAdmin(role);
}

export function canMatchBilling(role: Role): boolean {
  return isAdmin(role);
}

export function canExport(role: Role): boolean {
  return isAdmin(role);
}

export function canViewAudit(role: Role): boolean {
  return isAdmin(role);
}

export function requireRole(user: PublicUser | User, roles: Role[]): void {
  if (!roles.includes(user.role)) {
    throw new HttpError(403, "No tienes permiso para esta acción");
  }
}

export function canViewExpense(actor: PublicUser | User, expense: Expense): boolean {
  if (isAdmin(actor.role)) return true;
  if (expense.userId === actor.id) return true;
  if (actor.role === "Manager") {
    return expense.departmentId === actor.departmentId;
  }
  return false;
}

export function canAuthorizeExpense(
  actor: PublicUser | User,
  expense: Expense,
): boolean {
  if (expense.userId === actor.id) return false;
  if (isAdmin(actor.role)) return true;
  if (actor.role === "Manager") {
    return expense.departmentId === actor.departmentId;
  }
  return false;
}

export function assertExpenseAccess(
  actor: PublicUser | User,
  expense: Expense,
): void {
  if (!canViewExpense(actor, expense)) {
    throw new HttpError(403, "No puedes ver el gasto de otro colaborador");
  }
}
