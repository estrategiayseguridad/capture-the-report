"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { catalogName, money, shortDate, ui } from "@/lib/format";
import type { Client, Department, Expense, Project, PublicUser } from "@/lib/types";

type Row = Expense & { outstanding: number; employee: PublicUser | null };

export default function AdminExpensesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<{
    departments: Department[];
    clients: Client[];
    projects: Project[];
  } | null>(null);
  const [filters, setFilters] = useState({
    q: "",
    employeeId: "",
    departmentId: "",
    clientId: "",
    projectId: "",
    expenseStatus: "",
    authorizationStatus: "",
    billingMatchStatus: "",
    reimbursementStatus: "",
    from: "",
    to: "",
  });

  async function load(next = filters) {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const data = await api<{
      expenses: Row[];
      departments: Department[];
      clients: Client[];
      projects: Project[];
    }>(`/api/expenses?${params.toString()}`);
    setRows(data.expenses);
    setMeta(data);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Gastos</h1>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        <input className={ui.input} placeholder="Buscar" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <input className={ui.input} type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        <input className={ui.input} type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        <select className={ui.input} value={filters.expenseStatus} onChange={(e) => setFilters({ ...filters, expenseStatus: e.target.value })}>
          <option value="">Estado gasto</option>
          {["Draft", "Submitted", "Approved", "Rejected", "NeedsReview", "Cancelled"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.authorizationStatus} onChange={(e) => setFilters({ ...filters, authorizationStatus: e.target.value })}>
          <option value="">Autorización</option>
          {["PendingAuthorization", "Approved", "Rejected", "NeedsReview"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.billingMatchStatus} onChange={(e) => setFilters({ ...filters, billingMatchStatus: e.target.value })}>
          <option value="">Conciliación</option>
          {["Unmatched", "Matched", "NeedsReview"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.reimbursementStatus} onChange={(e) => setFilters({ ...filters, reimbursementStatus: e.target.value })}>
          <option value="">Reembolso</option>
          {["NotReimbursed", "PartiallyReimbursed", "Reimbursed", "Settled"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.departmentId} onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}>
          <option value="">Departamento</option>
          {meta?.departments.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}>
          <option value="">Cliente</option>
          {meta?.clients.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}>
          <option value="">Proyecto</option>
          {meta?.projects.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <button type="button" className={ui.btnSecondary} onClick={() => void load()}>Filtrar</button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Fecha", "DTE", "Empleado", "Proveedor", "Cliente", "Monto", "Auth", "SAT", "Reembolso", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{shortDate(row.confirmedDate)}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.confirmedDocumentNumber}</td>
                <td className="px-4 py-3">
                  {row.employee ? (
                    <Link className="text-teal-800" href={`/admin/employees/${row.userId}`}>{row.employee.name}</Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">{row.confirmedVendor}</td>
                <td className="px-4 py-3">{catalogName(meta?.clients ?? [], row.clientId)}</td>
                <td className="px-4 py-3">{money(row.confirmedTotal)}</td>
                <td className="px-4 py-3"><StatusBadge status={row.authorizationStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={row.billingMatchStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={row.reimbursementStatus} /></td>
                <td className="px-4 py-3"><Link className="text-teal-800" href={`/admin/expenses/${row.id}`}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
