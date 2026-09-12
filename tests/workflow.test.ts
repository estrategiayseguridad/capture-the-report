import { describe, expect, it } from "vitest";
import { EMPTY_STORE, type AppStore, type PublicUser } from "../src/lib/types";
import { authorizeExpense, createExpense } from "../src/services/expenses";
import { applyReimbursement, outstandingOf, recordReimbursement } from "../src/services/reimbursements";
import { canAuthorizeExpense, canViewExpense } from "../src/lib/rbac";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { signSession, verifySession } from "../src/lib/session";
import { HttpError } from "../src/lib/http";

const now = "2026-09-01T00:00:00.000Z";

function storeWithCatalogs(): AppStore {
  const store = structuredClone(EMPTY_STORE);
  store.departments.push({ id: "dep", name: "Ops", code: "OPS", managerId: null, active: true, createdAt: now, updatedAt: now });
  store.clients.push({ id: "cli", name: "ACME", code: "ACME", active: true, createdAt: now, updatedAt: now });
  store.projects.push({ id: "prj", name: "P1", code: "P1", clientId: "cli", active: true, createdAt: now, updatedAt: now });
  return store;
}

const employee: PublicUser = {
  id: "usr_emp",
  name: "Ana",
  email: "employee@example.local",
  role: "Employee",
  employeeNumber: "E1",
  departmentId: "dep",
  managerId: "usr_mgr",
  active: true,
  createdAt: now,
  updatedAt: now,
};
const manager: PublicUser = { ...employee, id: "usr_mgr", role: "Manager", name: "Marta" };
const other: PublicUser = { ...employee, id: "usr_other", name: "Luis" };

describe("auth and expenses", () => {
  it("hashes passwords and rejects invalid login secrets", async () => {
    const hashed = await hashPassword("Demo123!");
    expect(hashed).not.toContain("Demo123!");
    expect(await verifyPassword("Demo123!", hashed)).toBe(true);
    expect(await verifyPassword("wrong", hashed)).toBe(false);
  });

  it("signs and verifies sessions", async () => {
    const token = await signSession({ userId: "usr_emp", role: "Employee" });
    const payload = await verifySession(token);
    expect(payload?.userId).toBe("usr_emp");
    expect(await verifySession("bad")).toBeNull();
  });

  it("creates, submits and blocks client-set approved status", () => {
    const store = storeWithCatalogs();
    const expense = createExpense(store, employee, {
      confirmedDocumentNumber: "DTE-1",
      confirmedTotal: 100,
      confirmedDate: "2026-09-01",
      confirmedVendor: "ACME",
      confirmedCurrency: "GTQ",
      departmentId: "dep",
      clientId: "cli",
      projectId: "prj",
    }, true);
    expect(expense.expenseStatus).toBe("Submitted");
    expect(expense.authorizationStatus).toBe("PendingAuthorization");
  });

  it("prevents self-approval and cross-user access", () => {
    const store = storeWithCatalogs();
    const expense = createExpense(store, manager, {
      confirmedDocumentNumber: "DTE-2",
      confirmedTotal: 50,
      confirmedDate: "2026-09-01",
      confirmedVendor: "X",
      confirmedCurrency: "GTQ",
      departmentId: "dep",
      clientId: "cli",
      projectId: "prj",
    }, true);
    expect(canAuthorizeExpense(manager, expense)).toBe(false);
    expect(canViewExpense(other, expense)).toBe(false);
    expect(() => authorizeExpense(store, manager, expense.id, "approve", "")).toThrow(HttpError);
  });

  it("approves then supports partial reimbursement and rejects overpay", () => {
    const store = storeWithCatalogs();
    const expense = createExpense(store, employee, {
      confirmedDocumentNumber: "DTE-3",
      confirmedTotal: 1000,
      confirmedDate: "2026-09-01",
      confirmedVendor: "X",
      confirmedCurrency: "GTQ",
      departmentId: "dep",
      clientId: "cli",
      projectId: "prj",
    }, true);
    authorizeExpense(store, manager, expense.id, "approve", "ok");
    expect(expense.approvedAmount).toBe(1000);
    recordReimbursement(store, manager, expense.id, 600, "2026-09-10", "TRX");
    expect(outstandingOf(expense)).toBe(400);
    expect(expense.reimbursementStatus).toBe("PartiallyReimbursed");
    const over = applyReimbursement(expense, 500);
    expect(over.ok).toBe(false);
    recordReimbursement(store, manager, expense.id, 400, "2026-09-11", "TRX2");
    expect(outstandingOf(expense)).toBe(0);
    expect(expense.reimbursementStatus).toBe("Reimbursed");
  });

  it("rejects unauthorized approval from employees", () => {
    const store = storeWithCatalogs();
    const expense = createExpense(store, employee, {
      confirmedDocumentNumber: "DTE-4",
      confirmedTotal: 10,
      confirmedDate: "2026-09-01",
      confirmedVendor: "X",
      confirmedCurrency: "GTQ",
      departmentId: "dep",
      clientId: "cli",
      projectId: "prj",
    }, true);
    expect(() => authorizeExpense(store, employee, expense.id, "approve", "")).toThrow(HttpError);
    expect(expense.authorizationStatus).toBe("PendingAuthorization");
  });
});
