"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { money, ui } from "@/lib/format";
import type { Expense, PublicUser } from "@/lib/types";

type Row = Expense & { employee: PublicUser | null };

export default function AuthorizationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function load() {
    const data = await api<{ expenses: Row[] }>("/api/expenses?authorizationStatus=PendingAuthorization");
    setRows(data.expenses);
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(id: string, path: string, body: unknown) {
    await api(`/api/expenses/${id}/${path}`, { method: "POST", body: JSON.stringify(body) });
    await load();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Autorizaciones</h1>
      <p className="mt-2 text-slate-600">Un gerente no puede aprobar sus propios gastos.</p>
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row.id} className={ui.card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm">{row.confirmedDocumentNumber}</p>
                <p>{row.employee?.name} · {row.confirmedVendor}</p>
                <p className="text-sm text-slate-500">{money(row.confirmedTotal)}</p>
              </div>
              <StatusBadge status={row.authorizationStatus} />
            </div>
            <textarea
              className={ui.input}
              placeholder="Notas"
              value={notes[row.id] ?? ""}
              onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={ui.btnPrimary} type="button" onClick={() => void act(row.id, "authorize", { action: "approve", notes: notes[row.id] })}>Aprobar</button>
              <button className={ui.btnSecondary} type="button" onClick={() => void act(row.id, "authorize", { action: "needs_review", notes: notes[row.id] })}>Revisión</button>
              <button className={ui.btnDanger} type="button" onClick={() => void act(row.id, "reject", { notes: notes[row.id] })}>Rechazar</button>
              <Link className="self-center text-sm text-teal-800" href={`/admin/expenses/${row.id}`}>Detalle</Link>
            </div>
          </article>
        ))}
        {!rows.length ? <p className="text-slate-500">No hay gastos pendientes.</p> : null}
      </div>
    </div>
  );
}
