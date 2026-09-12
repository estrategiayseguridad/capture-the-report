"use client";

/**
 * Formulario de un control: nivel de clasificación, nivel de madurez,
 * nota de madurez (derivada), observaciones y comentarios.
 */

import {
  Clasificacion,
  EvaluacionControl,
  NIVELES_MADUREZ,
  NivelMadurez,
  notaMadurez,
  NOTA_MADUREZ_MAXIMA,
} from "@/lib/evaluacion";
import type { Control } from "@/lib/lineamientos";

type Props = {
  control: Control;
  valor: EvaluacionControl | undefined;
  onCambio: (cambios: Partial<EvaluacionControl>) => void;
  onLimpiar: () => void;
};

export function FichaControl({ control, valor, onCambio, onLimpiar }: Props) {
  const evaluado = Boolean(valor);
  const clasificacion = valor?.clasificacion ?? "no-cumple";
  const nivel = valor?.nivelMadurez ?? "No controlable";
  const nota = notaMadurez(nivel);

  return (
    <article
      className={`rounded-lg border bg-white p-4 ${
        evaluado ? "border-slate-200" : "border-dashed border-slate-300"
      }`}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
              {control.id}
            </span>
            {control.nombre}
          </p>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
            {control.descripcion}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {evaluado ? (
            <>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  clasificacion === "cumple"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {clasificacion === "cumple" ? "Cumple" : "No cumple"}
              </span>
              <button
                type="button"
                onClick={onLimpiar}
                className="text-xs text-slate-400 underline hover:text-slate-700"
              >
                limpiar
              </button>
            </>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              Sin evaluar
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-700">
            Nivel de clasificación
          </span>
          <select
            value={evaluado ? clasificacion : ""}
            onChange={(e) =>
              onCambio({ clasificacion: e.target.value as Clasificacion })
            }
            className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            <option value="cumple">Cumple</option>
            <option value="no-cumple">No cumple</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-700">
            Nivel de madurez
          </span>
          <select
            value={evaluado ? nivel : ""}
            onChange={(e) =>
              onCambio({ nivelMadurez: e.target.value as NivelMadurez })
            }
            className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {NIVELES_MADUREZ.map((n) => (
              <option key={n} value={n}>
                {notaMadurez(n)} — {n}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-1 block text-xs font-medium text-slate-700">
            Nota nivel de madurez
          </span>
          <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
            <span className="text-sm font-bold tabular-nums text-slate-900">
              {evaluado ? nota : "–"}
            </span>
            <span className="text-xs text-slate-500">
              / {NOTA_MADUREZ_MAXIMA} (derivada del nivel)
            </span>
          </div>
        </div>

        <label className="block md:col-span-3">
          <span className="mb-1 block text-xs font-medium text-slate-700">
            Observaciones
          </span>
          <textarea
            rows={2}
            value={valor?.observaciones ?? ""}
            onChange={(e) => onCambio({ observaciones: e.target.value })}
            placeholder="Hallazgo observado durante la revisión, evidencia solicitada, brecha detectada…"
            className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </label>

        <label className="block md:col-span-3">
          <span className="mb-1 block text-xs font-medium text-slate-700">
            Comentarios
          </span>
          <textarea
            rows={2}
            value={valor?.comentarios ?? ""}
            onChange={(e) => onCambio({ comentarios: e.target.value })}
            placeholder="Comentario del participante, plan de acción, responsable, fecha compromiso…"
            className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </label>
      </div>
    </article>
  );
}
