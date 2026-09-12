"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client-api";
import { catalogName, money, shortDate, ui } from "@/lib/format";
import type { Client, Department, Expense, Project } from "@/lib/types";

export default function ReportsPage() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [meta, setMeta] = useState<{ clients: Client[]; departments: Department[]; projects: Project[] } | null>(null);
  const [clientId, setClientId] = useState("all");

  useEffect(() => {
    void api<{ expenses: Expense[]; clients: Client[]; departments: Department[]; projects: Project[] }>("/api/expenses")
      .then((data) => {
        setRows(data.expenses);
        setMeta(data);
      });
  }, []);

  const filtered = useMemo(
    () => rows.filter((row) => clientId === "all" || row.clientId === clientId),
    [rows, clientId],
  );
  const total = filtered.reduce((sum, row) => sum + row.confirmedTotal, 0);

  return (
    <div>
      <div className="print:hidden mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Reporte imprimible</h1>
          <p className="text-slate-600">Valida y usa Imprimir del navegador para PDF.</p>
        </div>
        <button className={ui.btnPrimary} type="button" onClick={() => window.print()}>Imprimir / PDF</button>
      </div>
      <select className={`${ui.input} print:hidden max-w-sm`} value={clientId} onChange={(e) => setClientId(e.target.value)}>
        <option value="all">Todos los clientes</option>
        {meta?.clients.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <article className={`${ui.card} mt-6`}>
        <p className="text-xs uppercase tracking-[0.2em] text-teal-800">Rinde</p>
        <h2 className="mt-2 text-2xl font-semibold">Reporte de gastos</h2>
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Fecha</th>
              <th className="py-2">DTE</th>
              <th className="py-2">Proveedor</th>
              <th className="py-2">Adjudicación</th>
              <th className="py-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-2">{shortDate(row.confirmedDate)}</td>
                <td className="py-2 font-mono text-xs">{row.confirmedDocumentNumber}</td>
                <td className="py-2">{row.confirmedVendor}</td>
                <td className="py-2">
                  {catalogName(meta?.clients ?? [], row.clientId)} · {catalogName(meta?.projects ?? [], row.projectId)}
                </td>
                <td className="py-2 text-right">{money(row.confirmedTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="pt-4 text-right font-semibold">Total</td>
              <td className="pt-4 text-right text-lg font-semibold">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </article>
    </div>
  );
}
