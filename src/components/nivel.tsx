import { NIVEL_MAX } from "@/lib/tipos";

/**
 * La palabra ya dice el nivel; el color solo la jerarquiza. Antes cada nivel
 * tenía su tono — ámbar el 1, verde el 3 —, lo que le ponía semáforo a la
 * habilidad de una persona (como si «básico» fuera una advertencia) y gastaba
 * en una magnitud dos colores reservados para estado.
 */
const TEXTO_NIVEL: Record<number, string> = {
  0: "text-tinta-4",
  1: "text-tinta-3",
  2: "text-tinta-2",
  3: "text-acento-claro",
};

/**
 * Tres bloquecitos: cuántos están encendidos es el nivel. Se lee de un
 * vistazo al comparar candidatos, que es todo el punto del buscador.
 *
 * Un solo color para los encendidos — el dato lo lleva la cantidad, no el
 * tono —, en el paso de la rampa que contrasta contra cada superficie: el cyan
 * de marca sobre el tema oscuro, su paso oscuro sobre la hoja impresa.
 */
export function NivelBarra({
  nivel,
  claro = false,
}: {
  nivel: number;
  claro?: boolean;
}) {
  const encendido = claro ? "bg-acento-fuerte" : "bg-acento";
  const vacio = claro ? "bg-linea-papel" : "bg-panel-alto";

  return (
    <span className="inline-flex gap-[3px] align-middle">
      {Array.from({ length: NIVEL_MAX }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-2 rounded-sm ${i < nivel ? encendido : vacio}`}
        />
      ))}
    </span>
  );
}

/** Nombre del requisito o skill + su nivel, para las listas del buscador. */
export function NivelChip({
  etiqueta,
  nivel,
  descripcion,
  certificacion,
}: {
  etiqueta: string;
  nivel: number;
  descripcion: string;
  certificacion?: string | null;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs ${
        nivel > 0
          ? "border-linea-fuerte bg-hueco"
          : "border-linea-suave bg-fondo opacity-60"
      }`}
      title={`${etiqueta} — ${descripcion}`}
    >
      <NivelBarra nivel={nivel} />
      <span className="font-semibold text-tinta">{etiqueta}</span>
      <span className={TEXTO_NIVEL[nivel]}>{descripcion}</span>
      {certificacion ? (
        <span
          className="rounded bg-bien/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bien"
          title={`Certificación vigente: ${certificacion}`}
        >
          ✓ Certificado
        </span>
      ) : null}
    </span>
  );
}

/** % de tiempo libre para tomar proyecto nuevo. */
export function Disponibilidad({
  pct,
  claro = false,
}: {
  pct: number;
  claro?: boolean;
}) {
  // Estado por umbral, y el % va escrito al lado: el color nunca va solo. Sobre
  // papel se usan los pasos oscuros — los claros no se ven contra el blanco.
  const color = claro
    ? pct >= 70
      ? "bg-bien-fuerte"
      : pct >= 40
        ? "bg-aviso-fuerte"
        : "bg-alerta-fuerte"
    : pct >= 70
      ? "bg-bien"
      : pct >= 40
        ? "bg-aviso"
        : "bg-alerta";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-1.5 w-20 overflow-hidden rounded-full ${
          claro ? "bg-linea-papel" : "bg-panel-alto"
        }`}
      >
        <span
          className={`block h-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={claro ? "text-tinta-papel-2" : "text-tinta-2"}>
        {pct}% disponible
      </span>
    </span>
  );
}
