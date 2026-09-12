/**
 * Piezas visuales reutilizables para mostrar cumplimiento y madurez.
 * Sin dependencias externas: barras y anillos hechos con CSS.
 */

import { NOTA_MADUREZ_MAXIMA } from "@/lib/evaluacion";

/** Verde ≥ 80, ámbar ≥ 50, rojo abajo. Se usa el mismo criterio en todo el panel. */
export function colorCumplimiento(pct: number): string {
  if (pct >= 80) return "#15803d";
  if (pct >= 50) return "#b45309";
  return "#b91c1c";
}

export function BarraCumplimiento({
  valor,
  etiqueta,
}: {
  valor: number;
  etiqueta?: string;
}) {
  const pct = Math.max(0, Math.min(100, valor));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: colorCumplimiento(pct) }}
        />
      </div>
      <span
        className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums"
        style={{ color: colorCumplimiento(pct) }}
      >
        {pct.toFixed(0)}%
      </span>
      {etiqueta ? (
        <span className="text-xs text-slate-500">{etiqueta}</span>
      ) : null}
    </div>
  );
}

export function AnilloCumplimiento({
  valor,
  titulo,
  subtitulo,
}: {
  valor: number;
  titulo: string;
  subtitulo?: string;
}) {
  const pct = Math.max(0, Math.min(100, valor));
  const color = colorCumplimiento(pct);
  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${pct * 3.6}deg, #e2e8f0 0deg)`,
        }}
      >
        <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{titulo}</p>
        {subtitulo ? (
          <p className="text-xs text-slate-500">{subtitulo}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Madurez promedio 0–5 mostrada como escala de bloques. */
export function EscalaMadurez({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: NOTA_MADUREZ_MAXIMA }, (_, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{
              background: nota >= i + 1 ? "#1d4ed8" : nota > i ? "#93b4fd" : "#e2e8f0",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-600">
        {nota.toFixed(2)} / {NOTA_MADUREZ_MAXIMA}
      </span>
    </div>
  );
}

export function Tarjeta({
  valor,
  etiqueta,
  color,
}: {
  valor: string | number;
  etiqueta: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: color ?? "#0f172a" }}
      >
        {valor}
      </p>
      <p className="text-xs text-slate-500">{etiqueta}</p>
    </div>
  );
}
