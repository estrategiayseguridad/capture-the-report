"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { money, ui } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import type { Expense, PublicUser, ReimbursementRecord } from "@/lib/types";

type Row = Expense & { outstanding: number; employee: PublicUser };

export default function ReimbursementsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [history, setHistory] = useState<ReimbursementRecord[]>([]);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [form, setForm] = useState<Record<string, { amount: string; reference: string }>>({});

  async function load() {
    const data = await api<{ expenses: Row[]; reimbursements: ReimbursementRecord[]; users: PublicUser[] }>(
      "/api/reimbursements",
    );
    setRows(data.expenses.filter((row) => row.outstanding > 0 || row.reimbursedAmount > 0));
    setHistory(data.reimbursements);
    setUsers(data.users);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(id: string) {
    const current = form[id] ?? { amount: "", reference: "" };
    await api(`/api/expenses/${id}/reimburse`, {
      method: "POST",
      body: JSON.stringify({ amount: Number(current.amount), reference: current.reference }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Reembolsos</h1>
      <p className="mt-2 text-slate-600">Aprobación y reembolso son flujos separados. No se puede reembolsar más del saldo.</p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Empleado", "DTE", "Aprobado", "Reembolsado", "Pendiente", "Estado", "Monto", "Ref", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-3">{row.employee?.name}</td>
                <td className="px-3 py-3 font-mono text-xs">{row.confirmedDocumentNumber}</td>
                <td className="px-3 py-3">{money(row.approvedAmount)}</td>
                <td className="px-3 py-3">{money(row.reimbursedAmount)}</td>
                <td className="px-3 py-3">{money(row.outstanding)}</td>
                <td className="px-3 py-3"><StatusBadge status={row.reimbursementStatus} /></td>
                <td className="px-3 py-3">
                  <input
                    className={ui.input}
                    type="number"
                    value={form[row.id]?.amount ?? ""}
                    onChange={(e) => setForm({ ...form, [row.id]: { amount: e.target.value, reference: form[row.id]?.reference ?? "" } })}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    className={ui.input}
                    value={form[row.id]?.reference ?? ""}
                    onChange={(e) => setForm({ ...form, [row.id]: { amount: form[row.id]?.amount ?? "", reference: e.target.value } })}
                  />
                </td>
                <td className="px-3 py-3">
                  <button className={ui.btnPrimary} type="button" onClick={() => void save(row.id)}>Registrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-8 text-xl font-semibold">Histórico</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {history.map((item) => (
          <li key={item.id} className="rounded-xl bg-white px-4 py-3">
            {item.date} · {money(item.amount)} · {item.reference || "sin referencia"} ·{" "}
            {users.find((user) => user.id === item.recordedBy)?.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
