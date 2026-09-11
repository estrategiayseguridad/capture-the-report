import type { ReactNode } from "react";
import type { Perfil, Prioridad } from "@/lib/types";

export const COLOR_PERFIL: Record<Perfil, string> = {
  Decisor: "var(--perfil-decisor)",
  Gerencial: "var(--perfil-gerencial)",
  Tecnico: "var(--perfil-tecnico)",
};

export const COLOR_PRIORIDAD: Record<Prioridad, string> = {
  Alta: "var(--prioridad-alta)",
  Media: "var(--prioridad-media)",
  Baja: "var(--prioridad-baja)",
};

export function Card({
  children,
  className = "",
  titulo,
  subtitulo,
  accion,
}: {
  children: ReactNode;
  className?: string;
  titulo?: string;
  subtitulo?: string;
  accion?: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-hairline bg-surface-1 p-5 ${className}`}
    >
      {titulo && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-ink">{titulo}</h2>
            {subtitulo && <p className="mt-1 text-xs text-ink-muted">{subtitulo}</p>}
          </div>
          {accion}
        </header>
      )}
      {children}
    </section>
  );
}

/** Stat tile: un numero que se lee solo, sin grafica. */
export function StatTile({
  etiqueta,
  valor,
  detalle,
  delta,
}: {
  etiqueta: string;
  valor: string | number;
  detalle?: string;
  delta?: { texto: string; tono: "bueno" | "malo" | "neutro" };
}) {
  const colorDelta =
    delta?.tono === "bueno"
      ? "var(--status-good)"
      : delta?.tono === "malo"
        ? "var(--status-critical)"
        : "var(--text-muted)";

  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-4">
      <p className="text-xs font-medium text-ink-muted">{etiqueta}</p>
      <p className="mt-2 text-3xl leading-none font-semibold text-ink">{valor}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {delta && (
          <span className="text-xs font-medium" style={{ color: colorDelta }}>
            {delta.tono === "bueno" ? "▲" : delta.tono === "malo" ? "▼" : "■"} {delta.texto}
          </span>
        )}
        {detalle && <span className="text-xs text-ink-muted">{detalle}</span>}
      </div>
    </div>
  );
}

/** Punto de color + etiqueta en tinta: la identidad nunca depende solo del color. */
export function Chip({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
      <span
        aria-hidden
        className="inline-block size-2.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      {texto}
    </span>
  );
}

/** Barra horizontal fina, con extremo redondeado y anclada a la linea base. */
export function Barra({
  valor,
  maximo,
  color,
  altura = 10,
  fondo = "var(--gridline)",
}: {
  valor: number;
  maximo: number;
  color: string;
  altura?: number;
  fondo?: string;
}) {
  const pct = maximo > 0 ? Math.min(100, (valor / maximo) * 100) : 0;
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ height: altura, background: fondo }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/** Barra apilada con separador de 2px entre segmentos. */
export function BarraApilada({
  segmentos,
  total,
  altura = 12,
}: {
  segmentos: { valor: number; color: string; etiqueta: string }[];
  total: number;
  altura?: number;
}) {
  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      style={{ height: altura, background: "var(--gridline)", gap: 2 }}
    >
      {segmentos
        .filter((s) => s.valor > 0)
        .map((s) => (
          <div
            key={s.etiqueta}
            title={`${s.etiqueta}: ${s.valor}`}
            className="h-full first:rounded-l-full last:rounded-r-full transition-[width] duration-500"
            style={{
              width: total > 0 ? `${(s.valor / total) * 100}%` : "0%",
              background: s.color,
            }}
          />
        ))}
    </div>
  );
}

export function Badge({
  texto,
  color,
  icono,
}: {
  texto: string;
  color: string;
  icono?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-ink-soft"
      style={{ borderColor: color }}
    >
      {icono && <span aria-hidden>{icono}</span>}
      {texto}
    </span>
  );
}
