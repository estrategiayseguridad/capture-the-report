import Link from "next/link";

import { iniciales } from "@/lib/skills";

/**
 * Piezas compartidas por las pantallas de la plataforma. Ninguna trae colores
 * propios: todas usan los tokens de la paleta de marca que define
 * `src/app/globals.css` (`fondo` · `panel` · `acento` · `tinta-*`), para que
 * dashboard, perfiles, carga y reportes se lean como un solo producto.
 */

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-linea bg-panel p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function TituloSeccion({
  children,
  nota,
  accion,
}: {
  children: React.ReactNode;
  nota?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">{children}</h2>
        {nota ? <p className="text-xs text-tinta-4">{nota}</p> : null}
      </div>
      {accion}
    </div>
  );
}

/** Número grande con su etiqueta. Cuando el dato no necesita gráfica. */
export function Tile({
  valor,
  etiqueta,
  nota,
  href,
}: {
  valor: React.ReactNode;
  etiqueta: string;
  nota?: string;
  href?: string;
}) {
  const contenido = (
    <>
      <p className="text-3xl font-bold leading-none text-acento-claro">{valor}</p>
      <p className="mt-2 text-xs uppercase tracking-wider text-tinta-3">
        {etiqueta}
      </p>
      {nota ? <p className="mt-1 text-xs text-tinta-4">{nota}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-linea bg-panel p-4 transition hover:border-acento/60"
      >
        {contenido}
      </Link>
    );
  }
  return <Panel>{contenido}</Panel>;
}

/**
 * Barra horizontal de una sola serie: el largo es el dato y el valor va escrito
 * al lado, así que el color no carga información. Se usa igual en el top de
 * habilidades, en las fortalezas por área y en el comparativo mensual.
 *
 * No lleva variantes `print:`: los tokens ya se redefinen contra el papel. El
 * `claro` es para las pantallas que son hoja blanca en el monitor — la ficha y
 * el CV —, donde el relleno baja al paso oscuro de la rampa.
 */
export function BarraDato({
  etiqueta,
  valor,
  maximo,
  sufijo = "",
  detalle,
  href,
  claro = false,
}: {
  etiqueta: string;
  valor: number;
  maximo: number;
  sufijo?: string;
  detalle?: React.ReactNode;
  href?: string;
  claro?: boolean;
}) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;

  return (
    <li className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 py-1 text-sm">
      <span
        className={`truncate ${claro ? "text-tinta-papel" : "text-tinta-2"}`}
      >
        {href ? (
          <Link href={href} className="hover:text-acento-claro hover:underline">
            {etiqueta}
          </Link>
        ) : (
          etiqueta
        )}
      </span>
      <span
        className={`h-2.5 overflow-hidden rounded ${
          claro ? "bg-linea-papel" : "bg-panel-alto"
        }`}
      >
        <span
          className={`block h-full rounded-r ${claro ? "bg-acento-medio" : "bg-acento"}`}
          style={{ width: `${Math.max(pct, valor > 0 ? 3 : 0)}%` }}
        />
      </span>
      <span
        className={`whitespace-nowrap text-xs tabular-nums ${
          claro ? "text-tinta-papel-2" : "text-tinta-3"
        }`}
      >
        <span
          className={`font-bold ${claro ? "text-tinta-papel" : "text-tinta"}`}
        >
          {valor}
          {sufijo}
        </span>
        {detalle ? <> · {detalle}</> : null}
      </span>
    </li>
  );
}

/** Avatar del colaborador: la foto si la hay, o sus iniciales. */
export function Avatar({
  nombre,
  foto,
  tamano = "md",
}: {
  nombre: string;
  foto: string | null;
  tamano?: "sm" | "md" | "lg";
}) {
  const medidas = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl",
  }[tamano];

  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt={nombre}
        className={`${medidas} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${medidas} grid shrink-0 place-items-center rounded-full border border-acento/30 bg-acento/10 font-bold text-acento-claro`}
    >
      {iniciales(nombre)}
    </span>
  );
}

const TONOS = {
  neutro: "border-linea-fuerte bg-linea-fuerte/10 text-tinta-2",
  info: "border-acento/40 bg-acento/10 text-acento-claro",
  bien: "border-bien/40 bg-bien/10 text-bien",
  aviso: "border-aviso/40 bg-aviso/10 text-aviso",
  alerta: "border-alerta/40 bg-alerta/10 text-alerta",
} as const;

export type Tono = keyof typeof TONOS;

/** Estado en texto + color. Nunca solo color: siempre lleva su etiqueta. */
export function Etiqueta({
  children,
  tono = "neutro",
  titulo,
}: {
  children: React.ReactNode;
  tono?: Tono;
  titulo?: string;
}) {
  return (
    <span
      title={titulo}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

/** Aviso destacado: brechas, certificaciones por vencer, sobrecargas. */
export function Aviso({
  tono = "aviso",
  titulo,
  children,
}: {
  tono?: Tono;
  titulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${TONOS[tono]}`}>
      {titulo ? <p className="font-bold">{titulo}</p> : null}
      <div className={titulo ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

/** Nota al pie del prototipo. Va en todas las pantallas, no en letra chica. */
export function NotaDemo({ generado }: { generado: string }) {
  return (
    <footer className="mt-14 border-t border-linea-suave pt-5 text-xs text-tinta-4">
      <p>
        ProdigiES propone; la gente decide. El líder del equipo confirma la
        disponibilidad real y Comercial valida el perfil antes de que una ficha
        salga en una propuesta.
      </p>
      <p className="mt-2">
        🔒 Datos de demostración — ninguna persona real de ES Consulting aparece
        con sus datos. Seed generado el {generado}; se restaura con{" "}
        <code className="text-tinta-3">npm run seed</code>.
      </p>
    </footer>
  );
}
