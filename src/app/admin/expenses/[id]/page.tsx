"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { catalogName, money, shortDate, ui } from "@/lib/format";
import type { Expense, PublicUser } from "@/lib/types";

export default function AdminExpenseDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<{
    expense: Expense & { outstanding: number };
    employee: PublicUser | null;
    departments: { id: string; name: string }[];
    clients: { id: string; name: string }[];
    projects: { id: string; name: string }[];
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setData(await api(`/api/expenses/${params.id}`));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function act(path: string, body: unknown) {
    setMessage(null);
    await api(`/api/expenses/${params.id}/${path}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    setMessage("Actualizado");
    await load();
  }

  if (!data) return <p>Cargando…</p>;
  const { expense } = data;
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">{expense.confirmedDocumentNumber}</h1>
      <p className="text-slate-600">{data.employee?.name} · {expense.confirmedVendor}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={expense.expenseStatus} />
        <StatusBadge status={expense.authorizationStatus} />
        <StatusBadge status={expense.billingMatchStatus} />
        <StatusBadge status={expense.reimbursementStatus} />
      </div>
      {expense.receiptFileId ? (
        <img src={`/api/files/receipts/${expense.receiptFileId}`} alt="Recibo" className="mt-5 max-h-72 rounded-2xl" />
      ) : null}
      <dl className={`${ui.card} mt-5 grid gap-2 text-sm sm:grid-cols-2`}>
        <div>Fecha: {shortDate(expense.confirmedDate)}</div>
        <div>Monto: {money(expense.confirmedTotal)}</div>
        <div>Aprobado: {money(expense.approvedAmount)}</div>
        <div>Reembolsado: {money(expense.reimbursedAmount)}</div>
        <div>Pendiente: {money(expense.outstanding)}</div>
        <div>Cliente: {catalogName(data.clients, expense.clientId)}</div>
        <div>Depto: {catalogName(data.departments, expense.departmentId)}</div>
        <div>Proyecto: {catalogName(data.projects, expense.projectId)}</div>
      </dl>
      {message ? <p className="mt-4 text-sm text-teal-800">{message}</p> : null}
      <section className={`${ui.card} mt-6`}>
        <h2 className="font-semibold">Autorización</h2>
        <textarea className={ui.input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={ui.btnPrimary} type="button" onClick={() => void act("authorize", { action: "approve", notes })}>Aprobar</button>
          <button className={ui.btnSecondary} type="button" onClick={() => void act("authorize", { action: "needs_review", notes })}>Revisión</button>
          <button className={ui.btnDanger} type="button" onClick={() => void act("reject", { notes })}>Rechazar</button>
        </div>
      </section>
      <section className={`${ui.card} mt-4`}>
        <h2 className="font-semibold">Reembolso</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input className={ui.input} type="number" placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className={ui.input} placeholder="Referencia" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        <button className={`${ui.btnPrimary} mt-3`} type="button" onClick={() => void act("reimburse", { amount: Number(amount), reference })}>
          Registrar reembolso
        </button>
      </section>
    </div>
  );
}
