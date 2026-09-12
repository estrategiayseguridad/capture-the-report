"use client";

import { useState } from "react";
import { formatearHoras, type IndicadorTrazable, type Ticket } from "@/lib/metricas";
import { EtiquetaEstado } from "./vistas";

/**
 * Los indicadores del dashboard, cada uno abrible para ver de donde sale el numero.
 *
 * Existe por una pregunta concreta que el cliente hace en la reunion: "¿y ese 29.29
 * de donde lo sacaron?". Un indicador que no se puede abrir hay que creerselo; uno
 * que se abre y lista sus tickets se puede verificar contra Halo en el momento.
 */
export function IndicadoresTrazables({ indicadores }: { indicadores: IndicadorTrazable[] }) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const activo = indicadores.find((i) => i.clave === abierta) ?? null;

  return (
    <div>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {indicadores.map((i) => (
          <Indicador
            key={i.clave}
            indicador={i}
            abierto={i.clave === abierta}
            onClick={() => setAbierta(i.clave === abierta ? null : i.clave)}
          />
        ))}
      </section>

      {activo && <Desglose indicador={activo} onCerrar={() => setAbierta(null)} />}
    </div>
  );
}

function Indicador({
  indicador,
  abierto,
  onClick,
}: {
  indicador: IndicadorTrazable;
  abierto: boolean;
  onClick: () => void;
}) {
  const { etiqueta, valor, pie, destacado } = indicador;
  const base = destacado
    ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900";

  return (
    <button
      onClick={onClick}
      aria-expanded={abierto}
      title={`Ver los tickets detras de "${etiqueta}"`}
      className={`relative rounded-xl border p-4 text-left transition-colors hover:border-blue-400 dark:hover:border-blue-600 ${
        abierto ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900" : base
      }`}
    >
      {/* Fuera del flujo, y antes de la etiqueta: asi "Tickets" y "63" quedan
          pegados en el texto y las comprobaciones siguen encontrando la cifra. */}
      <span aria-hidden className="absolute top-3.5 right-3.5 text-slate-400 dark:text-slate-500">
        {abierto ? "▴" : "▾"}
      </span>
      <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
        {etiqueta}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          destacado ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {valor}
      </p>
      {pie && <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{pie}</p>}
    </button>
  );
}

const TITULO_TIEMPO: Record<string, string> = {
  time_to_respond: "TPA",
  time_to_resolve: "TMR",
};

function Desglose({
  indicador,
  onCerrar,
}: {
  indicador: IndicadorTrazable;
  onCerrar: () => void;
}) {
  const { etiqueta, valor, criterio, fuente, tickets, tiempos } = indicador;
  const [copiado, setCopiado] = useState(false);

  async function copiarIds() {
    try {
      await navigator.clipboard.writeText(tickets.map((t) => t.ticket_id).join(", "));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles (o http sin localhost): los IDs igual estan en la tabla.
    }
  }

  return (
    <section className="mt-3 rounded-xl border-2 border-blue-300 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h3 className="text-sm font-bold tracking-wide text-blue-900 dark:text-blue-200 uppercase">
            De donde sale «{etiqueta}» = {valor}
          </h3>
          <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">{criterio}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Calculado en <code className="text-slate-700 dark:text-slate-300">{fuente}</code> ·{" "}
            <strong className="text-slate-700 dark:text-slate-300">
              {tickets.length} tickets
            </strong>{" "}
            en la lista
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={copiarIds}
            className="rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800"
          >
            {copiado ? "IDs copiados" : "Copiar IDs"}
          </button>
          <button
            onClick={onCerrar}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 font-semibold">Ticket</th>
              <th className="px-3 py-2 font-semibold">Resumen</th>
              <th className="px-3 py-2 font-semibold">Tipo</th>
              <th className="px-3 py-2 font-semibold">Estado</th>
              <th className="px-3 py-2 font-semibold">Herramienta</th>
              <th className="px-3 py-2 font-semibold">Creado</th>
              {tiempos?.map((campo) => (
                <th key={campo} className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                  {TITULO_TIEMPO[campo]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets.map((t) => (
              <tr key={t.ticket_id}>
                <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                  {t.ticket_id}
                </td>
                <td
                  className="max-w-sm truncate px-3 py-1.5 text-slate-800 dark:text-slate-200"
                  title={t.summary}
                >
                  {t.summary}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {t.ticket_type}
                </td>
                <td className="px-3 py-1.5">
                  <EtiquetaEstado estado={t.status} />
                </td>
                <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                  {t.category.split(">")[0]}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {t.fecha_creacion}
                </td>
                {tiempos?.map((campo) => (
                  <td
                    key={campo}
                    className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-slate-600 dark:text-slate-400"
                  >
                    {valorDeTiempo(t, campo)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Estos son los IDs exactos que componen el numero: se pueden pegar en Halo para verificarlo.
      </p>
    </section>
  );
}

/** Un guion largo, no un 0: el dato vacio y el cero significan cosas distintas. */
function valorDeTiempo(t: Ticket, campo: "time_to_respond" | "time_to_resolve"): string {
  const valor = t[campo];
  return valor === null ? "—" : formatearHoras(valor);
}
