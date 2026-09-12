"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { money, shortDate, ui } from "@/lib/format";
import type { Client, Department, Expense, Project } from "@/lib/types";

type Row = Expense & {
  outstanding: number;
};

export default function MyExpensesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [catalogs, setCatalogs] = useState<{
    departments: Department[];
    clients: Client[];
    projects: Project[];
  } | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    void api<{ expenses: Row[]; departments: Department[]; clients: Client[]; projects: Project[] }>(
      "/api/expenses?mine=1",
    ).then((data) => {
      setRows(data.expenses);
      setCatalogs(data);
    });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (status && row.expenseStatus !== status && row.authorizationStatus !== status) return false;
      if (q) {
        const hay = `${row.confirmedDocumentNumber} ${row.confirmedVendor}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, q, status]);

  return (
    <EmployeeShell>
      <h1 className="text-3xl font-semibold">Mis gastos</h1>
      <input
        className={ui.input}
        placeholder="Buscar DTE o proveedor"
        value={q}
        onChange={(event) => setQ(event.target.value)}
      />
      <select className={ui.input} value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">Todos los estados</option>
        <option value="Submitted">Enviado</option>
        <option value="PendingAuthorization">Pendiente</option>
        <option value="Approved">Aprobado</option>
        <option value="Rejected">Rechazado</option>
        <option value="NeedsReview">Revisión</option>
        <option value="Reimbursed">Reembolsado</option>
      </select>
      <ul className="mt-5 space-y-3">
        {filtered.map((row) => (
          <li key={row.id}>
            <Link href={`/expenses/${row.id}`} className="block rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">{row.confirmedDocumentNumber}</p>
                  <p className="text-sm text-slate-600">{row.confirmedVendor}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {shortDate(row.confirmedDate)} ·{" "}
                    {catalogs?.clients.find((item) => item.id === row.clientId)?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money(row.confirmedTotal, row.confirmedCurrency)}</p>
                  <StatusBadge status={row.expenseStatus} />
                </div>
              </div>
            </Link>
          </li>
        ))}
        {!filtered.length ? <p className="text-sm text-slate-500">No hay gastos con ese filtro.</p> : null}
      </ul>
    </EmployeeShell>
  );
}
