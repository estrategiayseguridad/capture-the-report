"use client";

import { useState } from "react";
import type { Ticket } from "@/lib/metricas";

type Grupo = { herramienta: string; tickets: Ticket[]; copiadosAMano: number };

/**
 * Equivalente a las pestanas CLOUDFLARE / BEYONTRUST / THINKSCANARY del Excel,
 * pero generadas solas desde la columna Category — y con los 63 tickets, no solo
 * los cerrados.
 */
export function VistasPorHerramienta({ grupos }: { grupos: Grupo[] }) {
  const [activa, setActiva] = useState(grupos[0]?.herramienta ?? "");
  const grupo = grupos.find((g) => g.herramienta === activa) ?? grupos[0];
  const faltantes = grupo.tickets.length - grupo.copiadosAMano;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {grupos.map((g) => (
          <button
            key={g.herramienta}
            onClick={() => setActiva(g.herramienta)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              g.herramienta === activa
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {g.herramienta}
            <span
              className={`ml-2 rounded px-1.5 py-0.5 text-xs ${
                g.herramienta === activa ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              {g.tickets.length}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Pestana generada desde <code className="text-slate-700 dark:text-slate-300">Category</code>:{" "}
        <strong className="text-slate-800 dark:text-slate-200">{grupo.tickets.length} tickets</strong>. El proceso
        manual copio {grupo.copiadosAMano}
        {faltantes > 0 && (
          <>
            {" "}
            — <strong className="text-red-600">le faltan {faltantes}</strong>
          </>
        )}
        .
      </p>

      <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 font-semibold">Ticket</th>
              <th className="px-3 py-2 font-semibold">Resumen</th>
              <th className="px-3 py-2 font-semibold">Estado</th>
              <th className="px-3 py-2 font-semibold">Categoria</th>
              <th className="px-3 py-2 font-semibold">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {grupo.tickets.map((t) => {
              const perdido = t.status !== "Closed";
              return (
                <tr key={t.ticket_id} className={perdido ? "bg-red-50 dark:bg-red-950/60" : "bg-white dark:bg-slate-900"}>
                  <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">{t.ticket_id}</td>
                  <td className="max-w-md truncate px-3 py-1.5 text-slate-800 dark:text-slate-200" title={t.summary}>
                    {t.summary}
                  </td>
                  <td className="px-3 py-1.5">
                    <EtiquetaEstado estado={t.status} />
                  </td>
                  <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{t.category}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {t.fecha_creacion}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        Las filas en rojo existen en <code>DATOS</code> y cuentan en las graficas, pero no llegan a
        la pestana en el proceso manual.
      </p>
    </div>
  );
}

export function EtiquetaEstado({ estado }: { estado: string }) {
  const colores: Record<string, string> = {
    Closed: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
    Resuelto: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
    "With User": "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200",
    "On Hold": "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
  };
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
        colores[estado] ?? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
      }`}
    >
      {estado}
    </span>
  );
}

/** El momento del pitch: los tickets que el proceso manual pierde. */
export function TicketsPerdidos({ tickets, total }: { tickets: Ticket[]; total: number }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="rounded-xl border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-red-900 dark:text-red-200 uppercase">
            Tickets que el proceso manual pierde
          </h3>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">
            Las pestanas por herramienta del archivo de Agosto tienen{" "}
            <strong>
              {total - tickets.length} de {total}
            </strong>{" "}
            tickets. Estos{" "}
            <strong>{tickets.length}</strong> existen en <code>DATOS</code> y cuentan en las
            graficas, pero nunca llegaron a su pestana.
          </p>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          {abierto ? "Ocultar" : `Ver los ${tickets.length}`}
        </button>
      </div>

      {abierto && (
        <div className="mt-4 overflow-hidden rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-red-100/70 text-red-900 dark:text-red-200">
              <tr>
                <th className="px-3 py-2 font-semibold">Ticket</th>
                <th className="px-3 py-2 font-semibold">Resumen</th>
                <th className="px-3 py-2 font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Herramienta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100 dark:divide-red-900">
              {tickets.map((t) => (
                <tr key={t.ticket_id}>
                  <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">{t.ticket_id}</td>
                  <td className="max-w-md truncate px-3 py-1.5 text-slate-800 dark:text-slate-200" title={t.summary}>
                    {t.summary}
                  </td>
                  <td className="px-3 py-1.5">
                    <EtiquetaEstado estado={t.status} />
                  </td>
                  <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{t.category.split(">")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
