"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmployeeShell } from "@/components/employee/EmployeeShell";
import { api } from "@/lib/client-api";
import { money } from "@/lib/format";
import type { EmployeeHomeData } from "@/lib/types";

export default function HomePage() {
  const [home, setHome] = useState<EmployeeHomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api<{ home: EmployeeHomeData }>("/api/home")
      .then((data) => setHome(data.home))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <EmployeeShell>
      <p className="text-sm uppercase tracking-[0.2em] text-teal-800">Hoy</p>
      <h1 className="mt-1 text-3xl font-semibold">Te debemos</h1>
      {error ? <p className="mt-4 text-rose-700">{error}</p> : null}
      <p className="mt-6 text-5xl font-semibold tracking-tight">
        {home ? money(home.outstanding) : "…"}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Saldo de reembolso calculado en servidor: aprobado menos reembolsado.
      </p>
      <Link
        href="/scan"
        className="mt-8 flex min-h-16 items-center justify-center rounded-2xl bg-teal-700 text-lg font-semibold text-white shadow-lg"
      >
        Escanear factura
      </Link>
      <Link
        href="/expenses"
        className="mt-3 flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white font-medium"
      >
        Mis gastos
      </Link>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {[
          ["Enviados", home?.submitted],
          ["Pendiente auth.", home?.pendingAuthorization],
          ["Aprobados", home?.approved],
          ["Reembolsados", home?.reimbursed],
          ["Sin conciliar", home?.unmatched],
          ["Revisión", home?.needsReview],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value ?? "—"}</p>
          </article>
        ))}
      </div>
    </EmployeeShell>
  );
}
