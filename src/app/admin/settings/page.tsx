"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ui } from "@/lib/format";

export default function SettingsPage() {
  const [ocr, setOcr] = useState<{ available: boolean; engine: string; message: string } | null>(null);
  useEffect(() => {
    void api<{ available: boolean; engine: string; message: string }>("/api/ocr/status").then(setOcr);
  }, []);
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">Ajustes</h1>
      <section className={`${ui.card} mt-6`}>
        <h2 className="font-semibold">OCR local</h2>
        <p className="mt-2 text-sm text-slate-600">{ocr?.message ?? "Consultando…"}</p>
        <p className="mt-2 text-sm">Motor: {ocr?.engine ?? "—"}</p>
      </section>
      <section className={`${ui.card} mt-4 text-sm leading-6 text-slate-700`}>
        <h2 className="font-semibold">Red local / teléfono</h2>
        <p className="mt-2">
          En la laptop: <code>http://localhost:3000</code>. En el teléfono, misma Wi-Fi:
          <code> http://&lt;IP-LAN&gt;:3000</code>. El servidor escucha en 0.0.0.0.
        </p>
        <p className="mt-2">Datos: <code>data/app-store.json</code>. Recibos: <code>uploads/receipts/</code>.</p>
        <p className="mt-2">Reinicia la demo con <code>npm run seed</code>.</p>
      </section>
    </div>
  );
}
