import ExcelJS from "exceljs";
import JSZip from "jszip";
import type { AppStore, Expense, User } from "@/lib/types";
import { labelOf } from "@/lib/status";
import { outstandingOf } from "./reimbursements";
import { roundMoney } from "@/lib/normalize";

function catalogName(
  items: { id: string; name: string }[],
  id: string,
): string {
  return items.find((item) => item.id === id)?.name ?? "";
}

function periodOf(expenses: Expense[]): string {
  if (!expenses.length) return "Sin movimientos";
  const dates = expenses.map((expense) => expense.confirmedDate).sort();
  return `${dates[0]} — ${dates[dates.length - 1]}`;
}

export async function buildEmployeeWorkbook(
  store: AppStore,
  user: User,
  expenses: Expense[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rinde";
  const sheet = workbook.addWorksheet("Gastos");
  const department = catalogName(store.departments, user.departmentId);

  sheet.addRows([
    ["Rinde — Reporte de gastos"],
    ["Empleado", user.name],
    ["Número de empleado", user.employeeNumber],
    ["Departamento", department],
    ["Periodo", periodOf(expenses)],
    [],
    [
      "Fecha",
      "Número de factura / DTE",
      "Monto",
      "Moneda",
      "Proveedor",
      "Cliente",
      "Departamento",
      "Proyecto",
      "Autorización",
      "Conciliación",
      "Reembolso",
    ],
  ]);

  for (const expense of expenses) {
    sheet.addRow([
      expense.confirmedDate,
      expense.confirmedDocumentNumber,
      expense.confirmedTotal,
      expense.confirmedCurrency,
      expense.confirmedVendor,
      catalogName(store.clients, expense.clientId),
      catalogName(store.departments, expense.departmentId),
      catalogName(store.projects, expense.projectId),
      labelOf(expense.authorizationStatus),
      labelOf(expense.billingMatchStatus),
      labelOf(expense.reimbursementStatus),
    ]);
  }

  const submitted = roundMoney(
    expenses.reduce((sum, expense) => sum + expense.confirmedTotal, 0),
  );
  const approved = roundMoney(
    expenses
      .filter((expense) => expense.authorizationStatus === "Approved")
      .reduce((sum, expense) => sum + expense.approvedAmount, 0),
  );
  const reimbursed = roundMoney(
    expenses.reduce((sum, expense) => sum + expense.reimbursedAmount, 0),
  );
  const outstanding = roundMoney(
    expenses.reduce((sum, expense) => sum + outstandingOf(expense), 0),
  );

  sheet.addRows([
    [],
    ["Resumen"],
    ["Enviado", submitted],
    ["Aprobado", approved],
    ["Reembolsado", reimbursed],
    ["Pendiente", outstanding],
  ]);

  sheet.getColumn(3).numFmt = '"Q"#,##0.00';
  sheet.getColumn(1).width = 14;
  sheet.getColumn(2).width = 28;
  sheet.getColumn(5).width = 24;
  sheet.getColumn(6).width = 18;

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

export async function buildEmployeeZip(
  store: AppStore,
  users: User[],
): Promise<Buffer> {
  const zip = new JSZip();
  for (const user of users) {
    const expenses = store.expenses
      .filter((expense) => expense.userId === user.id && expense.expenseStatus !== "Cancelled")
      .sort((a, b) => a.confirmedDate.localeCompare(b.confirmedDate));
    const buffer = await buildEmployeeWorkbook(store, user, expenses);
    const safe = user.name.replace(/[^\w\-]+/g, "_");
    zip.file(`${safe}-${user.employeeNumber}.xlsx`, buffer);
  }
  return zip.generateAsync({ type: "nodebuffer" });
}

export function exportTotals(store: AppStore, userId: string) {
  const expenses = store.expenses.filter(
    (expense) => expense.userId === userId && expense.expenseStatus !== "Cancelled",
  );
  return {
    submitted: roundMoney(expenses.reduce((sum, expense) => sum + expense.confirmedTotal, 0)),
    approved: roundMoney(
      expenses
        .filter((expense) => expense.authorizationStatus === "Approved")
        .reduce((sum, expense) => sum + expense.approvedAmount, 0),
    ),
    reimbursed: roundMoney(expenses.reduce((sum, expense) => sum + expense.reimbursedAmount, 0)),
    outstanding: roundMoney(expenses.reduce((sum, expense) => sum + outstandingOf(expense), 0)),
  };
}
