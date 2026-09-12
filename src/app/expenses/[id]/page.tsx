"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { catalogName, money, shortDate, ui } from "@/lib/format";
import type { Client, Department, Expense, Project } from "@/lib/types";

export default function ExpenseDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<{
    expense: Expense & { outstanding: number };
    departments: Department[];
    clients: Client[];
    projects: Project[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<typeof data>(`/api/expenses/${params.id}`)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [params.id]);

  if (error) {
    return (
      <EmployeeShell>
        <p className="text-rose-700">{error}</p>
      </EmployeeShell>
    );
  }
  if (!data) {
    return (
      <EmployeeShell>
        <p>Cargando…</p>
      </EmployeeShell>
    );
  }
  const { expense } = data;
  return (
    <EmployeeShell>
      <Link href="/expenses" className="text-sm text-teal-800">
        ← Mis gastos
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">{expense.confirmedDocumentNumber}</h1>
      <p className="text-slate-600">{expense.confirmedVendor}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={expense.expenseStatus} />
        <StatusBadge status={expense.authorizationStatus} />
        <StatusBadge status={expense.billingMatchStatus} />
        <StatusBadge status={expense.reimbursementStatus} />
      </div>
      {expense.receiptFileId ? (
        <img
          src={`/api/files/receipts/${expense.receiptFileId}`}
          alt="Recibo"
          className="mt-5 max-h-64 w-full rounded-2xl object-contain"
        />
      ) : null}
      <dl className={`${ui.card} mt-5 space-y-2 text-sm`}>
        <Row label="Fecha" value={shortDate(expense.confirmedDate)} />
        <Row label="Monto" value={money(expense.confirmedTotal, expense.confirmedCurrency)} />
        <Row label="Aprobado" value={money(expense.approvedAmount)} />
        <Row label="Reembolsado" value={money(expense.reimbursedAmount)} />
        <Row label="Pendiente" value={money(expense.outstanding)} />
        <Row label="Cliente" value={catalogName(data.clients, expense.clientId)} />
        <Row label="Departamento" value={catalogName(data.departments, expense.departmentId)} />
        <Row label="Proyecto" value={catalogName(data.projects, expense.projectId)} />
      </dl>
    </EmployeeShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
