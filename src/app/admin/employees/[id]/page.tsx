"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/client-api";
import { money, ui } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import type { Expense, PublicUser } from "@/lib/types";

export default function EmployeeAdminPage() {
  const params = useParams<{ id: string }>();
  const [month, setMonth] = useState("");
  const [data, setData] = useState<{
    employee: PublicUser;
    totals: { submitted: number; approved: number; reimbursed: number; outstanding: number };
    expenses: Expense[];
  } | null>(null);

  async function load(nextMonth = month) {
    const qs = nextMonth ? `?month=${nextMonth}` : "";
    setData(await api(`/api/employees/${params.id}${qs}`));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!data) return <p>Cargando…</p>;
  return (
    <div>
      <h1 className="text-3xl font-semibold">{data.employee.name}</h1>
      <p className="text-slate-600">{data.employee.employeeNumber} · {data.employee.email}</p>
      <div className="mt-4 max-w-xs">
        <input className={ui.input} type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <button className={`${ui.btnSecondary} mt-2`} type="button" onClick={() => void load()}>Filtrar</button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {Object.entries(data.totals).map(([key, value]) => (
          <article key={key} className={ui.card}>
            <p className="text-sm capitalize text-slate-500">{key}</p>
            <p className="mt-2 text-xl font-semibold">{money(value)}</p>
          </article>
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {data.expenses.map((expense) => (
          <li key={expense.id} className="flex justify-between rounded-xl bg-white px-4 py-3 text-sm">
            <span>{expense.confirmedDocumentNumber}</span>
            <span>{money(expense.confirmedTotal)}</span>
            <StatusBadge status={expense.reimbursementStatus} />
          </li>
        ))}
      </ul>
    </div>
  );
}
