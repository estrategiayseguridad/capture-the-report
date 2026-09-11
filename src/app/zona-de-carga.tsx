"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Arrastrar el .xlsx de Halo aca. El dataset de demo sigue siendo el dato por
 *  defecto, asi que si la carga falla el dashboard no se queda en blanco. */
export function ZonaDeCarga({ origen }: { origen: string }) {
  const router = useRouter();
  const [encima, setEncima] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [refrescando, iniciarRefresco] = useTransition();
  const ocupado = enviando || refrescando;

  async function subir(archivo: File | undefined) {
    if (!archivo) return;
    setError(null);
    setEnviando(true);
    try {
      const cuerpo = new FormData();
      cuerpo.append("archivo", archivo);
      const respuesta = await fetch("/api/cargar", { method: "POST", body: cuerpo });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo procesar el archivo.");
        return;
      }
      iniciarRefresco(() => router.refresh());
    } catch {
      setError("No se pudo enviar el archivo al servidor.");
    } finally {
      setEnviando(false);
    }
  }

  async function volverAlDemo() {
    await fetch("/api/cargar", { method: "DELETE" });
    setError(null);
    iniciarRefresco(() => router.refresh());
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          void subir(e.dataTransfer.files[0]);
        }}
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed px-5 py-4 transition-colors ${
          encima ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {ocupado ? "Procesando el archivo…" : "Arrastra aqui el Excel exportado de Halo"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Se lee la pestana <code className="text-slate-700 dark:text-slate-300">DATOS</code> buscando las columnas
            por nombre de encabezado. Ahora mismo se muestra: <strong>{origen}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Elegir archivo
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => void subir(e.target.files?.[0])}
            />
          </label>
          <button
            onClick={() => void volverAlDemo()}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Usar datos de demo
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-800 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
