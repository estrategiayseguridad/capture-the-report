/**
 * Las 4 graficas del informe, sin librerias: barras con CSS y pastel con conic-gradient.
 * Decision deliberada — con 3 horas de desarrollo, una dependencia de graficas cuesta
 * mas tiempo del que ahorra, y esto no puede romperse en la demo.
 */

export const PALETA = ["#2563eb", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#16a34a"];

/** Barras horizontales. Para historial mensual y tickets por tipo. */
export function Barras({
  datos,
  color = PALETA[0],
}: {
  datos: [string, number][];
  color?: string;
}) {
  const max = Math.max(...datos.map(([, n]) => n), 1);
  return (
    <div className="flex flex-col gap-2">
      {datos.map(([etiqueta, n]) => (
        <div key={etiqueta} className="flex items-center gap-3 text-sm">
          <span className="w-40 shrink-0 truncate text-right text-slate-600 dark:text-slate-400" title={etiqueta}>
            {etiqueta}
          </span>
          <div className="h-6 flex-1 rounded bg-slate-100 dark:bg-slate-800">
            <div
              className="flex h-6 items-center justify-end rounded px-2 text-xs font-semibold text-white transition-all"
              style={{ width: `${Math.max((n / max) * 100, 6)}%`, background: color }}
            >
              {n}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Barras apiladas. Para herramienta x estado. */
export function BarrasApiladas({
  estados,
  filas,
}: {
  estados: string[];
  filas: { herramienta: string; porEstado: number[]; total: number }[];
}) {
  const max = Math.max(...filas.map((f) => f.total), 1);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
        {estados.map((estado, i) => (
          <span key={estado} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: PALETA[i % PALETA.length] }}
            />
            {estado}
          </span>
        ))}
      </div>
      {filas.map((fila) => (
        <div key={fila.herramienta} className="flex items-center gap-3 text-sm">
          <span className="w-40 shrink-0 truncate text-right text-slate-600 dark:text-slate-400">
            {fila.herramienta}
          </span>
          <div className="flex-1">
            <div
              className="flex h-6 overflow-hidden rounded"
              style={{ width: `${Math.max((fila.total / max) * 100, 8)}%` }}
            >
              {fila.porEstado.map((n, i) =>
                n === 0 ? null : (
                  <div
                    key={estados[i]}
                    className="flex items-center justify-center text-xs font-semibold text-white"
                    style={{
                      flexGrow: n,
                      background: PALETA[i % PALETA.length],
                    }}
                    title={`${estados[i]}: ${n}`}
                  >
                    {n}
                  </div>
                ),
              )}
            </div>
          </div>
          <span className="w-8 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{fila.total}</span>
        </div>
      ))}
    </div>
  );
}

/** Pastel. Para estado de los tickets. */
export function Pastel({ datos }: { datos: [string, number][] }) {
  const total = datos.reduce((a, [, n]) => a + n, 0) || 1;
  const tramos = datos.map(([etiqueta, n], i) => {
    // El arranque de cada tramo es la suma de los anteriores. Son 4 datos: recorrerlos
    // de nuevo sale gratis y evita mutar un acumulador durante el render.
    const previo = datos.slice(0, i).reduce((a, [, v]) => a + v, 0);
    const desde = (previo / total) * 360;
    const hasta = ((previo + n) / total) * 360;
    return {
      etiqueta,
      n,
      color: PALETA[i % PALETA.length],
      css: `${PALETA[i % PALETA.length]} ${desde}deg ${hasta}deg`,
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="h-40 w-40 shrink-0 rounded-full shadow-inner"
        style={{ background: `conic-gradient(${tramos.map((t) => t.css).join(", ")})` }}
        role="img"
        aria-label={datos.map(([e, n]) => `${e}: ${n}`).join(", ")}
      />
      <ul className="flex flex-col gap-1.5 text-sm">
        {tramos.map((t) => (
          <li key={t.etiqueta} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: t.color }} />
            <span className="text-slate-700 dark:text-slate-300">{t.etiqueta}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{t.n}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({((t.n / total) * 100).toFixed(0)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Panel({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase">{titulo}</h3>
      {subtitulo && <p className="mt-0.5 mb-4 text-xs text-slate-500 dark:text-slate-400">{subtitulo}</p>}
      {!subtitulo && <div className="mb-4" />}
      {children}
    </section>
  );
}
