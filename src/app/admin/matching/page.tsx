"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { money, ui } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import type { BillingDocument, Expense } from "@/lib/types";

export default function MatchingPage() {
  const [docs, setDocs] = useState<BillingDocument[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});

  async function load() {
    const data = await api<{
      documents: BillingDocument[];
      expenses: Expense[];
      users: { id: string; name: string }[];
    }>("/api/billing-documents");
    setDocs(data.documents.filter((doc) => doc.matchStatus !== "Matched"));
    setExpenses(data.expenses);
    setUsers(data.users);
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(id: string, action: "match" | "reject" | "unmatched") {
    await api(`/api/matches/${id}`, {
      method: "POST",
      body: JSON.stringify({ action, expenseId: selected[id] }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Conciliación</h1>
      <p className="mt-2 text-slate-600">Revisa coincidencias ambiguas o no encontradas. Las decisiones quedan en auditoría.</p>
      <div className="mt-6 space-y-4">
        {docs.map((doc) => {
          const candidates = expenses.filter(
            (expense) => doc.candidateExpenseIds.includes(expense.id) || selected[doc.id] === expense.id,
          );
          return (
            <article key={doc.id} className={ui.card}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-medium">{doc.file.originalName}</p>
                  <p className="font-mono text-sm">{doc.documentNumber ?? "sin número"}</p>
                  <p className="text-sm text-slate-500">
                    {doc.issuer} · {doc.date} · {doc.total != null ? money(doc.total) : "—"}
                  </p>
                </div>
                <StatusBadge status={doc.matchStatus} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium">Gastos candidatos</p>
                <select
                  className={ui.input}
                  value={selected[doc.id] ?? ""}
                  onChange={(e) => setSelected({ ...selected, [doc.id]: e.target.value })}
                >
                  <option value="">Selecciona un gasto</option>
                  {(candidates.length ? candidates : expenses).map((expense) => (
                    <option key={expense.id} value={expense.id}>
                      {expense.confirmedDocumentNumber} · {users.find((u) => u.id === expense.userId)?.name} · {money(expense.confirmedTotal)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={ui.btnPrimary} type="button" onClick={() => void act(doc.id, "match")}>Conciliar</button>
                <button className={ui.btnSecondary} type="button" onClick={() => void act(doc.id, "reject")}>Rechazar sugerencia</button>
                <button className={ui.btnSecondary} type="button" onClick={() => void act(doc.id, "unmatched")}>Dejar sin match</button>
              </div>
            </article>
          );
        })}
        {!docs.length ? <p className="text-slate-500">No hay documentos pendientes de conciliar.</p> : null}
      </div>
    </div>
  );
}
