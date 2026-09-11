import Link from "next/link";

import { Disponibilidad } from "@/components/nivel";
import { Avatar, Etiqueta, NotaDemo, Panel } from "@/components/ui";
import { certificacionesEnRiesgo } from "@/lib/analitica";
import { leerInventario } from "@/lib/datos";
import {
  certificacionesVigentes,
  nivelCorto,
  normalizar,
  punteosPorCategoria,
} from "@/lib/skills";
import { EQUIPOS } from "@/lib/tipos";
import type { Equipo, Inventario, Persona } from "@/lib/tipos";

/**
 * Menú de perfiles (menú 4 del pitch): la gente seccionada por área, con
 * filtro por área y por habilidad. De cada perfil se puede bajar el CV.
 */
export const metadata = {
  title: "Perfiles · ProdigiES",
};

function textoDe(valor: string | string[] | undefined): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Filtra por nombre, posición o nombre de habilidad registrada. */
function coincide(
  persona: Persona,
  termino: string,
  inventario: Inventario,
): boolean {
  if (!termino) return true;
  const t = normalizar(termino);

  if (normalizar(persona.nombre).includes(t)) return true;
  if (normalizar(persona.rol).includes(t)) return true;
  if (persona.certificaciones.some((c) => normalizar(c.nombre).includes(t)))
    return true;

  const nombrePorId = new Map(inventario.skills.map((s) => [s.id, s.nombre]));
  return persona.skills.some((ps) =>
    normalizar(nombrePorId.get(ps.skillId) ?? "").includes(t),
  );
}

export default async function Perfiles({
  searchParams,
}: PageProps<"/perfiles">) {
  const { area, q } = await searchParams;
  const areaFiltro = textoDe(area) as Equipo | "";
  const termino = textoDe(q);

  const inventario = await leerInventario();
  const enRiesgo = new Set(
    certificacionesEnRiesgo(inventario).map((a) => a.persona.id),
  );

  const areas = EQUIPOS.filter((e) => !areaFiltro || e === areaFiltro);
  const filtradas = inventario.personas.filter((p) =>
    coincide(p, termino, inventario),
  );

  const total = filtradas.filter((p) => areas.includes(p.equipo)).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Menú · Perfiles
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Perfiles por área
          </h1>
          <p className="mt-2 text-slate-300">
            {total} de {inventario.personas.length} colaboradores. Clic en una
            persona para ver su matriz de habilidades, sus certificaciones y sus
            proyectos.
          </p>
        </div>
        <Link
          href="/perfiles/nuevo"
          className="rounded-lg bg-cyan-400 px-5 py-2.5 font-bold text-[#0a1030] transition hover:bg-cyan-300"
        >
          + Nuevo colaborador
        </Link>
      </div>

      <form action="/perfiles" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex-1 text-xs">
          <span className="block text-slate-400">Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={termino}
            placeholder="Nombre, posición, habilidad o certificación"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-[#111a42] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </label>
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
        {termino || areaFiltro ? (
          <Link
            href="/perfiles"
            className="py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            limpiar
          </Link>
        ) : null}
      </form>

      <div className="mt-8 space-y-10">
        {areas.map((areaActual) => {
          const personas = filtradas
            .filter((p) => p.equipo === areaActual)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

          return (
            <section key={areaActual}>
              <div className="flex items-baseline justify-between gap-3 border-b border-slate-800 pb-2">
                <h2 className="text-xl font-bold">{areaActual}</h2>
                <p className="text-sm text-slate-500">
                  {personas.length}{" "}
                  {personas.length === 1 ? "colaborador" : "colaboradores"}
                </p>
              </div>

              {personas.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Nadie de esta área calza con el filtro.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {personas.map((persona) => (
                    <li key={persona.id}>
                      <Tarjeta
                        persona={persona}
                        inventario={inventario}
                        avisoCert={enRiesgo.has(persona.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <NotaDemo generado={inventario.generado} />
    </main>
  );
}

function Tarjeta({
  persona,
  inventario,
  avisoCert,
}: {
  persona: Persona;
  inventario: Inventario;
  avisoCert: boolean;
}) {
  const punteos = punteosPorCategoria(persona, inventario.skills);
  const total = punteos.technical + punteos.solutions + punteos.soft;
  const vigentes = certificacionesVigentes(persona);

  const nombrePorId = new Map(inventario.skills.map((s) => [s.id, s.nombre]));
  const fuertes = [...persona.skills]
    .sort((a, b) => b.nivel - a.nivel)
    .slice(0, 3);

  return (
    <Panel className="h-full">
      <div className="flex items-start gap-3">
        <Avatar nombre={persona.nombre} foto={persona.foto} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/persona/${persona.id}`}
            className="font-bold underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            {persona.nombre}
          </Link>
          <p className="truncate text-sm text-slate-400">{persona.rol}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {persona.carga === 0 ? (
              <Etiqueta tono="bien">En banca</Etiqueta>
            ) : null}
            {avisoCert ? (
              <Etiqueta tono="aviso" titulo="Tiene certificaciones por vencer">
                cert. por vencer
              </Etiqueta>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        <Disponibilidad pct={persona.disponibilidad} />
      </div>

      <ul className="mt-3 space-y-1 text-xs">
        {fuertes.map((ps) => (
          <li key={ps.skillId} className="flex justify-between gap-2">
            <span className="truncate text-slate-300">
              {nombrePorId.get(ps.skillId) ?? ps.skillId}
            </span>
            <span className="shrink-0 text-slate-500">
              {nivelCorto(inventario.escala, ps.nivel)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-slate-800 pt-2 text-xs text-slate-500">
        Punteo {total} · {vigentes.length}{" "}
        {vigentes.length === 1 ? "certificación" : "certificaciones"} vigentes
      </p>

      <div className="mt-3 flex gap-3 text-xs">
        <Link
          href={`/persona/${persona.id}`}
          className="text-cyan-400 hover:text-cyan-300"
        >
          ver perfil →
        </Link>
        <Link
          href={`/persona/${persona.id}/cv`}
          className="text-slate-400 hover:text-slate-200"
        >
          descargar CV
        </Link>
      </div>
    </Panel>
  );
}
