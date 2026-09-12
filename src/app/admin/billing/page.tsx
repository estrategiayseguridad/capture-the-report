"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ui } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import type { BillingDocument } from "@/lib/types";

export default function BillingPage() {
  const [docs, setDocs] = useState<BillingDocument[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ processed: number; success: number; failed: number; remaining: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api<{ documents: BillingDocument[] }>("/api/billing-documents");
    setDocs(data.documents);
  }

  useEffect(() => {
    void load();
  }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setStatus("Subiendo…");
    try {
      const form = new FormData();
      Array.from(files).forEach((file) => form.append("files", file));
      const result = await api<{ batchId: string; created: BillingDocument[] }>("/api/billing-documents", {
        method: "POST",
        body: form,
      });
      setStatus(`${result.created.length} archivo(s) en cola`);
      await processLoop();
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function processLoop() {
    let remaining = 1;
    while (remaining > 0) {
      const result = await api<{ processed: number; success: number; failed: number; remaining: number }>(
        "/api/billing-documents/process",
        { method: "POST", body: JSON.stringify({ limit: 6 }) },
      );
      setProgress(result);
      remaining = result.remaining;
      if (!result.processed) break;
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Documentos SAT / facturación</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Sube XML FEL-like, JSON o CSV. El parser extrae número, fecha, total y emisor, y busca gastos candidatos.
        No es un certificador SAT de producción.
      </p>
      <label className={`${ui.btnPrimary} mt-5 inline-flex`}>
        Subir documentos
        <input type="file" multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
      </label>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
      {progress ? (
        <p className="mt-2 text-sm text-slate-600">
          Procesados {progress.processed} · OK {progress.success} · Error {progress.failed} · Restan {progress.remaining}
        </p>
      ) : null}
      {busy ? <p className="mt-2 text-sm">Procesando lote…</p> : null}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["Archivo", "Número", "Fecha", "Total", "Emisor", "Proceso", "Match"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-4 py-3">{doc.file.originalName}</td>
                <td className="px-4 py-3 font-mono text-xs">{doc.documentNumber ?? "—"}</td>
                <td className="px-4 py-3">{doc.date ?? "—"}</td>
                <td className="px-4 py-3">{doc.total ?? "—"}</td>
                <td className="px-4 py-3">{doc.issuer ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={doc.processingStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={doc.matchStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
