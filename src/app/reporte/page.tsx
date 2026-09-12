"use client";

/**
 * Reporte imprimible de la evaluación. Se alimenta de lo capturado en el panel
 * (localStorage) y está pensado para "Imprimir → Guardar como PDF".
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, Suspense, useMemo } from "react";
import {
  BarraCumplimiento,
  colorCumplimiento,
} from "../components/Medidores";
import {
  NOTA_MADUREZ_MAXIMA,
  calcularResumen,
  notaMadurez,
} from "@/lib/evaluacion";
import { evaluacionEjemplo } from "@/lib/ejemplo";
import { PRINCIPIOS } from "@/lib/lineamientos";
import { useEvaluacionGuardada } from "@/lib/useEvaluacion";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-6 py-10 text-sm text-slate-500">
          Cargando reporte…
        </main>
      }
    >
      <Reporte />
    </Suspense>
  );
}

function Reporte() {
  const guardada = useEvaluacionGuardada();
  /** `?demo=1` renderiza el ejemplo sin tocar lo capturado (atajo para la demo). */
  const esDemo = useSearchParams().get("demo") === "1";
  const evaluacion = useMemo(
    () => (esDemo ? evaluacionEjemplo() : guardada),
    [esDemo, guardada],
  );

  const resumen = useMemo(() => calcularResumen(evaluacion), [evaluacion]);

  const { entidad } = evaluacion;
  const brechas = PRINCIPIOS.flatMap((p) =>
    p.objetivos.flatMap((o) =>
      o.controles
        .filter((c) => evaluacion.controles[c.id]?.clasificacion === "no-cumple")
        .map((c) => ({ control: c, objetivo: o, principio: p })),
    ),
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-4 print:max-w-none print:px-0">
        <div className="mb-4 flex items-center gap-2 print:hidden">
          <Link
            href="/"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            ← Volver al panel
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Imprimir / Guardar PDF
          </button>
        </div>

        <article className="bg-white p-10 text-slate-900 shadow-sm print:p-0 print:shadow-none">
          {/* Portada */}
          <header className="border-b-4 border-blue-800 pb-4">
            <p className="text-xs font-semibold tracking-widest text-blue-800 uppercase">
              Informe de evaluación de cumplimiento
            </p>
            <h1 className="mt-2 text-2xl leading-snug font-bold">
              Lineamientos de seguridad para los participantes en las Cámaras de
              Compensación Bancaria y Automatizada
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Marco de referencia para la seguridad de la información v2023
            </p>
          </header>

          <section className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p>
              <span className="font-semibold">Participante:</span>{" "}
              {entidad.participante || "—"}
            </p>
            <p>
              <span className="font-semibold">Fecha de evaluación:</span>{" "}
              {entidad.fecha || "—"}
            </p>
            <p>
              <span className="font-semibold">Auditor responsable:</span>{" "}
              {entidad.auditor || "—"}
            </p>
            <p>
              <span className="font-semibold">Controles evaluados:</span>{" "}
              {resumen.evaluados} de {resumen.total}
            </p>
            <p className="col-span-2">
              <span className="font-semibold">Alcance:</span>{" "}
              {entidad.alcance || "—"}
            </p>
          </section>

          {/* Resumen ejecutivo */}
          <section className="mt-8">
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-base font-bold">
              1. Resumen ejecutivo
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Se evaluaron{" "}
              <strong>
                {resumen.evaluados} de {resumen.total}
              </strong>{" "}
              controles obligatorios. El nivel de cumplimiento global es de{" "}
              <strong style={{ color: colorCumplimiento(resumen.cumplimiento) }}>
                {resumen.cumplimiento.toFixed(1)}%
              </strong>{" "}
              ({resumen.cumple} controles cumplen y {resumen.noCumple} no
              cumplen), con una nota de madurez promedio de{" "}
              <strong>
                {resumen.madurezPromedio.toFixed(2)} / {NOTA_MADUREZ_MAXIMA}
              </strong>
              .
            </p>

            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-800 text-left text-white">
                  <th className="border border-blue-900 px-2 py-1.5">
                    Principio
                  </th>
                  <th className="border border-blue-900 px-2 py-1.5 text-center">
                    Controles
                  </th>
                  <th className="border border-blue-900 px-2 py-1.5 text-center">
                    Cumple
                  </th>
                  <th className="border border-blue-900 px-2 py-1.5 text-center">
                    No cumple
                  </th>
                  <th className="border border-blue-900 px-2 py-1.5 text-center">
                    Cumplimiento
                  </th>
                  <th className="border border-blue-900 px-2 py-1.5 text-center">
                    Madurez
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumen.principios.map((p) => (
                  <tr key={p.id} className="odd:bg-slate-50">
                    <td className="border border-slate-300 px-2 py-1.5 font-medium">
                      {p.nombre}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center tabular-nums">
                      {p.total}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center tabular-nums">
                      {p.cumple}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center tabular-nums">
                      {p.noCumple}
                    </td>
                    <td
                      className="border border-slate-300 px-2 py-1.5 text-center font-semibold tabular-nums"
                      style={{ color: colorCumplimiento(p.cumplimiento) }}
                    >
                      {p.cumplimiento.toFixed(0)}%
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center tabular-nums">
                      {p.madurezPromedio.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-200 font-bold">
                  <td className="border border-slate-400 px-2 py-1.5">Total</td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums">
                    {resumen.total}
                  </td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums">
                    {resumen.cumple}
                  </td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums">
                    {resumen.noCumple}
                  </td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums">
                    {resumen.cumplimiento.toFixed(0)}%
                  </td>
                  <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums">
                    {resumen.madurezPromedio.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Cumplimiento por objetivo */}
          <section className="mt-8">
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-base font-bold">
              2. Cumplimiento por objetivo
            </h2>
            <div className="space-y-3">
              {resumen.principios.flatMap((p) =>
                p.objetivos.map((o) => (
                  <div key={o.id}>
                    <p className="text-sm font-medium">
                      <span className="font-mono text-xs text-slate-500">
                        {o.id}
                      </span>{" "}
                      {o.nombre}
                    </p>
                    <BarraCumplimiento
                      valor={o.cumplimiento}
                      etiqueta={`madurez ${o.madurezPromedio.toFixed(2)}`}
                    />
                  </div>
                )),
              )}
            </div>
          </section>

          {/* Brechas */}
          <section className="mt-8 break-before-page">
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-base font-bold">
              3. Controles que no cumplen ({brechas.length})
            </h2>
            {brechas.length === 0 ? (
              <p className="text-sm text-slate-600">
                No se registraron controles en estado &ldquo;No cumple&rdquo;.
              </p>
            ) : (
              <div className="space-y-4">
                {brechas.map(({ control, objetivo }) => {
                  const dato = evaluacion.controles[control.id]!;
                  return (
                    <div
                      key={control.id}
                      className="break-inside-avoid border-l-4 border-red-600 bg-red-50 px-3 py-2"
                    >
                      <p className="text-sm font-semibold">
                        <span className="font-mono text-xs">{control.id}</span>{" "}
                        {control.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        Objetivo {objetivo.id} · Madurez:{" "}
                        {notaMadurez(dato.nivelMadurez)} — {dato.nivelMadurez}
                      </p>
                      {dato.observaciones ? (
                        <p className="mt-1.5 text-sm">
                          <span className="font-semibold">Observaciones: </span>
                          {dato.observaciones}
                        </p>
                      ) : null}
                      {dato.comentarios ? (
                        <p className="mt-1 text-sm">
                          <span className="font-semibold">Comentarios: </span>
                          {dato.comentarios}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Detalle completo */}
          <section className="mt-8 break-before-page">
            <h2 className="mb-3 border-b border-slate-300 pb-1 text-base font-bold">
              4. Detalle de la evaluación
            </h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-left text-white">
                  <th className="border border-slate-700 px-2 py-1.5">
                    Control
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5">
                    Clasificación
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5">
                    Nivel de madurez
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5 text-center">
                    Nota
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5">
                    Observaciones
                  </th>
                  <th className="border border-slate-700 px-2 py-1.5">
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRINCIPIOS.map((p) =>
                  p.objetivos.map((o) => (
                    <Fragment key={o.id}>
                      <tr className="bg-slate-200 font-semibold">
                        <td
                          colSpan={6}
                          className="border border-slate-300 px-2 py-1"
                        >
                          {o.id} {o.nombre}
                        </td>
                      </tr>
                      {o.controles.map((c) => {
                        const dato = evaluacion.controles[c.id];
                        return (
                          <tr key={c.id} className="break-inside-avoid align-top">
                            <td className="border border-slate-300 px-2 py-1.5">
                              <span className="font-mono">{c.id}</span>{" "}
                              {c.nombre}
                            </td>
                            <td
                              className="border border-slate-300 px-2 py-1.5 font-semibold"
                              style={{
                                color: !dato
                                  ? "#64748b"
                                  : dato.clasificacion === "cumple"
                                    ? "#15803d"
                                    : "#b91c1c",
                              }}
                            >
                              {!dato
                                ? "Sin evaluar"
                                : dato.clasificacion === "cumple"
                                  ? "Cumple"
                                  : "No cumple"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5">
                              {dato?.nivelMadurez ?? "—"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center tabular-nums">
                              {dato ? notaMadurez(dato.nivelMadurez) : "—"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5">
                              {dato?.observaciones || "—"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5">
                              {dato?.comentarios || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  )),
                )}
              </tbody>
            </table>
          </section>

          <footer className="mt-8 border-t border-slate-300 pt-3 text-xs text-slate-500">
            Documento generado por el prototipo del Equipo 11 — Capture The
            Report. Datos capturados manualmente por el auditor; requiere
            revisión y aprobación antes de su entrega al participante o a ICG.
          </footer>
        </article>
      </div>
    </div>
  );
}
