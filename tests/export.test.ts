import { describe, expect, it } from "vitest";
import { EMPTY_STORE } from "../src/lib/types";
import { buildEmployeeWorkbook, buildEmployeeZip, exportTotals } from "../src/services/export";
import { createExpense, authorizeExpense } from "../src/services/expenses";
import { recordReimbursement } from "../src/services/reimbursements";
import type { PublicUser } from "../src/lib/types";

const now = "2026-09-01T00:00:00.000Z";
const actor: PublicUser = {
  id: "usr_emp",
  name: "Ana Pérez",
  email: "employee@example.local",
  role: "Employee",
  employeeNumber: "E-2101",
  departmentId: "dep",
  managerId: null,
  active: true,
  createdAt: now,
  updatedAt: now,
};
const manager: PublicUser = { ...actor, id: "usr_mgr", role: "Manager", name: "Marta" };

describe("xlsx export", () => {
  it("builds a real workbook and zip with totals", async () => {
    const store = structuredClone(EMPTY_STORE);
    store.departments.push({ id: "dep", name: "Consultoría", code: "CON", managerId: null, active: true, createdAt: now, updatedAt: now });
    store.clients.push({ id: "cli", name: "ACME", code: "ACME", active: true, createdAt: now, updatedAt: now });
    store.projects.push({ id: "prj", name: "VAPT", code: "VAPT", clientId: "cli", active: true, createdAt: now, updatedAt: now });
    store.users.push({ ...actor, passwordHash: "x" }, { ...manager, passwordHash: "x" });
    const expense = createExpense(store, actor, {
      confirmedDocumentNumber: "DTE-X",
      confirmedTotal: 1000,
      confirmedDate: "2026-09-01",
      confirmedVendor: "Vendor",
      confirmedCurrency: "GTQ",
      departmentId: "dep",
      clientId: "cli",
      projectId: "prj",
    }, true);
    authorizeExpense(store, manager, expense.id, "approve", "ok");
    recordReimbursement(store, manager, expense.id, 400, "2026-09-02", "R1");
    const totals = exportTotals(store, actor.id);
    expect(totals.submitted).toBe(1000);
    expect(totals.approved).toBe(1000);
    expect(totals.reimbursed).toBe(400);
    expect(totals.outstanding).toBe(600);
    const xlsx = await buildEmployeeWorkbook(store, store.users[0], store.expenses);
    expect(Buffer.from(xlsx).byteLength).toBeGreaterThan(1000);
    const zip = await buildEmployeeZip(store, [store.users[0]]);
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
  });
});
