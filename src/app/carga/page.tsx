import Link from "next/link";

import {
  Avatar,
  Aviso,
  Etiqueta,
  NotaDemo,
  Panel,
  Tile,
  TituloSeccion,
} from "@/components/ui";
import {
  cargaDelEquipo,
  ETIQUETA_CARGA,
  type CargaPersona,
} from "@/lib/analitica";
import { leerInventario } from "@/lib/datos";
import { EQUIPOS } from "@/lib/tipos";
import type { Equipo, Proyecto } from "@/lib/tipos";

/**
 * Carga laboral (menú 6 del pitch): qué proyectos tiene asignado cada
 * colaborador y cuánto le queda libre. Es la pantalla de PM — la que dice si
 * alguien puede tomar el proyecto que se acaba de adjudicar.
 */
export const metadata = {
  title: "Carga laboral · ProdigiES",
};

const TONO_CARGA = {
  banca: "bien",
  holgada: "info",
  ajustada: "aviso",
  sobrecargada: "alerta",
} as const;

const ESTADO_PROYECTO = {
  oportunidad: { etiqueta: "oportunidad", tono: "info" },
  "en-ejecucion": { etiqueta: "en ejecución", tono: "bien" },
  cerrado: { etiqueta: "cerrado", tono: "neutro" },
} as const;

export default async function Carga({ searchParams }: PageProps<"/carga">) {
  const { area } = await searchParams;
  const areaFiltro = (typeof area === "string" ? area : "") as Equipo | "";

  const inventario = await leerInventario();
  const filas = cargaDelEquipo(inventario, areaFiltro || undefined);

  const proyectos = inventario.proyectos.filter(
    (p) => !areaFiltro || p.area === areaFiltro,
  );
  const enEjecucion = proyectos.filter((p) => p.estado === "en-ejecucion");
  const oportunidades = proyectos.filter((p) => p.estado === "oportunidad");

  const sobrecargados = filas.filter((f) => f.estado === "sobrecargada");
  const enBanca = filas.filter((f) => f.estado === "banca");
  const promedio =
    filas.length > 0
      ? Math.round(filas.reduce((a, f) => a + f.carga, 0) / filas.length)
      : 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
        Menú · Carga laboral
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Proyectos y cargabilidad
      </h1>
      <p className="mt-2 max-w-3xl text-slate-300">
        La disponibilidad de cada persona sale de aquí: es{" "}
        <strong>100% menos lo que tiene comprometido</strong> en proyectos en
        ejecución. Cuando PM asigna a alguien, su disponibilidad baja en el
        buscador y en su perfil.
      </p>

      <form action="/carga" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-xs">
          <span className="block text-slate-400">Área</span>
          <select
            name="area"
            defaultValue={areaFiltro}
            className="mt-1 rounded-lg border border-slate-600 bg-[#111a42] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="">Todas</option>
            {EQUIPOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Filtrar
        </button>
      </form>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile valor={enEjecucion.length} etiqueta="Proyectos en ejecución" />
        <Tile valor={oportunidades.length} etiqueta="Oportunidades abiertas" />
        <Tile valor={`${promedio}%`} etiqueta="Carga promedio" />
        <Tile
          valor={enBanca.length}
          etiqueta="En banca"
          nota="100% disponibles"
        />
      </section>

      {sobrecargados.length > 0 ? (
        <div className="mt-6">
          <Aviso tono="alerta" titulo="Hay gente por encima del 100%">
            {sobrecargados.map((f) => f.persona.nombre).join(", ")} —{" "}
            revisar dedicaciones antes de sumar otro proyecto.
          </Aviso>
        </div>
      ) : null}

      <section className="mt-10">
        <TituloSeccion nota="Clic en un proyecto para ver o cambiar su equipo">
          Cartera de proyectos
        </TituloSeccion>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {proyectos.map((proyecto) => (
            <li key={proyecto.id}>
              <TarjetaProyecto proyecto={proyecto} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <TituloSeccion nota="De la persona más cargada a la que está en banca">
          Carga por colaborador
        </TituloSeccion>

        <ul className="mt-4 space-y-2">
          {filas.map((fila) => (
            <li key={fila.persona.id}>
              <FilaCarga fila={fila} />
            </li>
          ))}
        </ul>
      </section>

      <NotaDemo generado={inventario.generado} />
    </main>
  );
}

function TarjetaProyecto({ proyecto }: { proyecto: Proyecto }) {
  const estado = ESTADO_PROYECTO[proyecto.estado];
  const dedicacionTotal = proyecto.asignaciones.reduce(
    (a, x) => a + x.dedicacion,
    0,
  );

  return (
    <Panel className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/proyecto/${proyecto.id}`}
            className="font-bold underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            {proyecto.nombre}
          </Link>
          <p className="text-sm text-slate-400">{proyecto.cliente}</p>
        </div>
        <Etiqueta tono={estado.tono}>{estado.etiqueta}</Etiqueta>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {proyecto.area} · {proyecto.inicio} → {proyecto.fin}
      </p>

      <p className="mt-3 text-sm text-slate-300">
        {proyecto.asignaciones.length}{" "}
        {proyecto.asignaciones.length === 1 ? "persona" : "personas"} ·{" "}
        {dedicacionTotal}% de dedicación acumulada
      </p>

      {proyecto.asignaciones.length === 0 ? (
        <p className="mt-2 text-xs text-cyan-300">
          Sin equipo asignado — asignar recursos →
        </p>
      ) : null}
    </Panel>
  );
}

function FilaCarga({ fila }: { fila: CargaPersona }) {
  const { persona, carga, asignaciones, estado } = fila;
  const ancho = Math.min(carga, 100);

  return (
    <div className="rounded-xl border border-slate-700 bg-[#111a42] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar nombre={persona.nombre} foto={persona.foto} tamano="sm" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <Link
              href={`/persona/${persona.id}?tab=proyectos`}
              className="font-semibold underline-offset-4 hover:text-cyan-300 hover:underline"
            >
              {persona.nombre}
            </Link>
            <span className="text-xs text-slate-400">
              {persona.rol} · {persona.equipo}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className="h-2.5 flex-1 overflow-hidden rounded bg-slate-800">
              <span
                className={`block h-full rounded-r ${
                  estado === "sobrecargada"
                    ? "bg-rose-400"
                    : estado === "ajustada"
                      ? "bg-amber-400"
                      : "bg-cyan-400"
                }`}
                style={{ width: `${ancho}%` }}
              />
            </span>
            <span className="w-28 shrink-0 text-right text-xs tabular-nums text-slate-400">
              <strong className="text-slate-100">{carga}%</strong> ·{" "}
              {persona.disponibilidad}% libre
            </span>
          </div>
        </div>

        <Etiqueta tono={TONO_CARGA[estado]}>{ETIQUETA_CARGA[estado]}</Etiqueta>
      </div>

      {asignaciones.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-12 text-xs text-slate-500">
          {asignaciones.map((a) => (
            <li key={a.proyecto.id}>
              <Link
                href={`/proyecto/${a.proyecto.id}`}
                className="hover:text-slate-300"
              >
                {a.proyecto.nombre}
              </Link>{" "}
              <span className="text-slate-400">{a.dedicacion}%</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
