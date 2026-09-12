"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";

export default function ReceiptsPage() {
  const [ids, setIds] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    void api<{ expenses: { receiptFileId: string | null; confirmedDocumentNumber: string }[] }>(
      "/api/expenses",
    ).then((data) => {
      const unique = new Map<string, string>();
      for (const expense of data.expenses) {
        if (expense.receiptFileId) unique.set(expense.receiptFileId, expense.confirmedDocumentNumber);
      }
      setIds([...unique.entries()].map(([id, label]) => ({ id, label })));
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Recibos</h1>
      <p className="mt-2 text-slate-600">Acceso protegido: las imágenes no están en /public.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((receipt) => (
          <a
            key={receipt.id}
            href={`/api/files/receipts/${receipt.id}`}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
            target="_blank"
            rel="noreferrer"
          >
            <img src={`/api/files/receipts/${receipt.id}`} alt={receipt.label} className="h-40 w-full object-cover" />
            <p className="px-3 py-2 text-sm">{receipt.label}</p>
          </a>
        ))}
        {!ids.length ? <p className="text-slate-500">Aún no hay recibos con archivo.</p> : null}
      </div>
    </div>
  );
}
