"use client";

/**
 * Panel de recolección: captura de los 23 controles de los Lineamientos de
 * Seguridad para los Participantes en las Cámaras de Compensación (ICG v2023)
 * y cálculo de cumplimiento por control ─▶ objetivo ─▶ principio ─▶ global.
 */

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { FichaControl } from "./components/FichaControl";
import {
  AnilloCumplimiento,
  BarraCumplimiento,
  EscalaMadurez,
  Tarjeta,
  colorCumplimiento,
} from "./components/Medidores";
import {
  calcularResumen,
  normalizarEvaluacionImportada,
  TOTAL_CONTROLES,
} from "@/lib/evaluacion";
import { evaluacionEjemplo } from "@/lib/ejemplo";
import { PRINCIPIOS } from "@/lib/lineamientos";
import { useEvaluacion } from "@/lib/useEvaluacion";

type Filtro = "todos" | "pendientes" | "no-cumple";

export default function Panel() {
  const {
    evaluacion,
    actualizarEntidad,
    actualizarControl,
    limpiarControl,
    reemplazar,
    reiniciar,
  } = useEvaluacion();

  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    "11.1": true,
  });
  const [aviso, setAviso] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  const resumen = useMemo(() => calcularResumen(evaluacion), [evaluacion]);

  function exportarJson() {
    const blob = new Blob([JSON.stringify(evaluacion, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug =
      evaluacion.entidad.participante.trim().toLowerCase().replace(/\s+/g, "-") ||
      "participante";
    a.href = url;
    a.download = `evaluacion-camaras-${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importarJson(archivo: File) {
    try {
      const datos = normalizarEvaluacionImportada(JSON.parse(await archivo.text()));
      if (!datos) {
        setAviso("El archivo no tiene el formato de una evaluación válida.");
        return;
      }
      reemplazar(datos);
      setAviso(`Evaluación importada desde ${archivo.name}.`);
    } catch {
      setAviso("No se pudo leer el archivo: JSON inválido.");
    }
  }

  const mostrarControl = (id: string) => {
    if (filtro === "todos") return true;
    const entrada = evaluacion.controles[id];
    if (filtro === "pendientes") return !entrada;
    return entrada?.clasificacion === "no-cumple";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
            Equipo 11 · Capture The Report
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            Panel de cumplimiento — Cámaras de Compensación
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Lineamientos de seguridad para los participantes en la CCB y la CCA ·
            Marco de referencia para la seguridad de la información v2023
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Datos del participante */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Datos de la evaluación
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Participante
              </span>
              <input
                value={evaluacion.entidad.participante}
                onChange={(e) =>
                  actualizarEntidad({ participante: e.target.value })
                }
                placeholder="Banco Demo, S.A."
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Auditor responsable
              </span>
              <input
                value={evaluacion.entidad.auditor}
                onChange={(e) => actualizarEntidad({ auditor: e.target.value })}
                placeholder="Nombre del auditor"
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Fecha de evaluación
              </span>
              <input
                type="date"
                value={evaluacion.entidad.fecha}
                onChange={(e) => actualizarEntidad({ fecha: e.target.value })}
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block md:col-span-3">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Alcance evaluado
              </span>
              <textarea
                rows={2}
                value={evaluacion.entidad.alcance}
                onChange={(e) => actualizarEntidad({ alcance: e.target.value })}
                placeholder="Capa de intercambio de datos, ambientes de desarrollo, pruebas y producción…"
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </section>

        {/* Resumen */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <AnilloCumplimiento
              valor={resumen.cumplimiento}
              titulo="Cumplimiento global"
              subtitulo={`${resumen.cumple} de ${TOTAL_CONTROLES} controles cumplen`}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tarjeta
                valor={`${resumen.evaluados}/${resumen.total}`}
                etiqueta="Controles evaluados"
              />
              <Tarjeta
                valor={resumen.cumple}
                etiqueta="Cumple"
                color="#15803d"
              />
              <Tarjeta
                valor={resumen.noCumple}
                etiqueta="No cumple"
                color="#b91c1c"
              />
              <Tarjeta
                valor={resumen.madurezPromedio.toFixed(2)}
                etiqueta="Madurez promedio (0–5)"
                color="#1d4ed8"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            {resumen.principios.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {p.nombre}
                  </p>
                  <EscalaMadurez nota={p.madurezPromedio} />
                </div>
                <div className="mt-1">
                  <BarraCumplimiento
                    valor={p.cumplimiento}
                    etiqueta={`${p.evaluados}/${p.total} evaluados`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Acciones */}
        <section className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            href="/reporte"
            className="rounded bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Generar reporte
          </Link>
          <button
            type="button"
            onClick={exportarJson}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => inputArchivo.current?.click()}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            Importar JSON
          </button>
          <input
            ref={inputArchivo}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) void importarJson(archivo);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => {
              reemplazar(evaluacionEjemplo());
              setAviso("Se cargó la evaluación de ejemplo (Banco Demo, S.A.).");
            }}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            Cargar ejemplo
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("¿Borrar toda la evaluación capturada?")) {
                reiniciar();
                setAviso("Evaluación reiniciada.");
              }
            }}
            className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Reiniciar
          </button>

          <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(
              [
                ["todos", "Todos"],
                ["pendientes", "Pendientes"],
                ["no-cumple", "No cumple"],
              ] as const
            ).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setFiltro(valor)}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  filtro === valor
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </section>

        {aviso ? (
          <p className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            {aviso}
          </p>
        ) : null}

        {/* Captura por principio / objetivo / control */}
        <div className="mt-6 space-y-6">
          {PRINCIPIOS.map((principio) => {
            const resumenPrincipio = resumen.principios.find(
              (p) => p.id === principio.id,
            )!;
            return (
              <section key={principio.id}>
                <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-slate-900 px-4 py-2.5 text-white">
                  <h2 className="text-sm font-bold tracking-wide uppercase">
                    {principio.nombre}
                  </h2>
                  <span className="ml-auto text-xs text-slate-300">
                    {resumenPrincipio.cumple}/{resumenPrincipio.total} cumplen ·
                    madurez {resumenPrincipio.madurezPromedio.toFixed(2)}
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs font-bold"
                    style={{
                      background: colorCumplimiento(resumenPrincipio.cumplimiento),
                    }}
                  >
                    {resumenPrincipio.cumplimiento.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-3">
                  {principio.objetivos.map((objetivo) => {
                    const resumenObjetivo = resumenPrincipio.objetivos.find(
                      (o) => o.id === objetivo.id,
                    )!;
                    const abierto = abiertos[objetivo.id] ?? false;
                    const visibles = objetivo.controles.filter((c) =>
                      mostrarControl(c.id),
                    );

                    return (
                      <div
                        key={objetivo.id}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setAbiertos((prev) => ({
                              ...prev,
                              [objetivo.id]: !abierto,
                            }))
                          }
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                        >
                          <span className="text-xs text-slate-400">
                            {abierto ? "▾" : "▸"}
                          </span>
                          <span className="font-mono text-xs text-slate-500">
                            {objetivo.id}
                          </span>
                          <span className="flex-1 text-sm font-semibold text-slate-800">
                            {objetivo.nombre}
                          </span>
                          <span className="hidden w-52 sm:block">
                            <BarraCumplimiento valor={resumenObjetivo.cumplimiento} />
                          </span>
                          <span className="text-xs whitespace-nowrap text-slate-500">
                            {resumenObjetivo.evaluados}/{resumenObjetivo.total}
                          </span>
                        </button>

                        {abierto ? (
                          <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-4">
                            {visibles.length === 0 ? (
                              <p className="text-xs text-slate-500">
                                Ningún control de este objetivo coincide con el
                                filtro activo.
                              </p>
                            ) : (
                              visibles.map((control) => (
                                <FichaControl
                                  key={control.id}
                                  control={control}
                                  valor={evaluacion.controles[control.id]}
                                  onCambio={(cambios) =>
                                    actualizarControl(control.id, cambios)
                                  }
                                  onLimpiar={() => limpiarControl(control.id)}
                                />
                              ))
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
          La evaluación se guarda automáticamente en este navegador
          (localStorage). Usa <strong>Exportar JSON</strong> para conservarla o
          compartirla.
        </footer>
      </main>
    </div>
  );
}
