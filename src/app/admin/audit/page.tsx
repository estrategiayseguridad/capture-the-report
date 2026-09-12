"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ui } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [q, setQ] = useState("");

  async function load(query = q) {
    const data = await api<{ logs: AuditLog[] }>(`/api/audit-log?q=${encodeURIComponent(query)}`);
    setLogs(data.logs);
  }

  useEffect(() => {
    void load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold">Bitácora de auditoría</h1>
      <p className="mt-2 text-slate-600">Registros append-only. No hay edición.</p>
      <div className="mt-4 flex gap-2">
        <input className={ui.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar acción" />
        <button className={ui.btnSecondary} type="button" onClick={() => void load()}>Buscar</button>
      </div>
      <ul className="mt-6 space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-medium">{log.action}</p>
            <p className="text-slate-500">
              {log.timestamp} · {log.entityType}:{log.entityId}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
