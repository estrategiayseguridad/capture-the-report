import Link from "next/link";

import {
  Avatar,
  Aviso,
  BarraDato,
  Etiqueta,
  NotaDemo,
  Panel,
  Tile,
  TituloSeccion,
} from "@/components/ui";
import {
  certificacionesEnRiesgo,
  coberturaPorSkill,
  DIAS_POR_VENCER,
  resumenPorArea,
} from "@/lib/analitica";
import { leerInventario } from "@/lib/datos";
import { CATEGORIAS } from "@/lib/skills";

/**
 * Dashboard principal (menú 7 del pitch): el motor de búsqueda arriba, cuánta
 * gente y cuántos proyectos hay por área, el comparativo de las 10 habilidades
 * con más gente, y los dos avisos que disparan acción — oportunidades abiertas
 * y certificaciones por vencer.
 */
export default async function Dashboard() {
  const inventario = await leerInventario();
  const resumen = resumenPorArea(inventario);
  const top10 = coberturaPorSkill(inventario).slice(0, 10);
  const avisos = certificacionesEnRiesgo(inventario);
  const oportunidades = inventario.proyectos.filter(
    (p) => p.estado === "oportunidad",
  );

  const enEjecucion = inventario.proyectos.filter(
    (p) => p.estado === "en-ejecucion",
  ).length;
  const enBanca = inventario.personas.filter((p) => p.carga === 0).length;
  const maxTop = top10[0]?.personas ?? 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
        ES Consulting · Equipo 05
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Gestión de habilidades y cargabilidad
      </h1>
      <p className="mt-2 max-w-3xl text-slate-300">
        Una sola base de talento para las tres áreas: Comercial encuentra a quién
        proponer, PM ve la carga antes de asignar y RRHH ve dónde están las
        brechas.
      </p>

      <form action="/buscar" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="q"
          placeholder="Busca una solución, un conocimiento o una certificación: Infoblox, VAPT Web + inglés…"
          aria-label="Buscar habilidades"
          className="flex-1 rounded-lg border border-slate-600 bg-[#111a42] px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-cyan-400 px-6 py-3 font-bold text-[#0a1030] transition hover:bg-cyan-300"
        >
          Buscar talento
        </button>
      </form>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          valor={inventario.personas.length}
          etiqueta="Colaboradores"
          nota={`${inventario.skills.length} habilidades en ${CATEGORIAS.length} categorías`}
          href="/perfiles"
        />
        <Tile
          valor={enEjecucion}
          etiqueta="Proyectos en ejecución"
          nota={`${oportunidades.length} oportunidades abiertas`}
          href="/carga"
        />
        <Tile
          valor={enBanca}
          etiqueta="En banca"
          nota="100% disponibles para tomar proyecto"
          href="/carga"
        />
        <Tile
          valor={avisos.length}
          etiqueta="Certificaciones en riesgo"
          nota={`Vencidas o vencen en ≤ ${DIAS_POR_VENCER} días`}
          href="/reportes"
        />
      </section>

      {oportunidades.length > 0 ? (
        <section className="mt-8">
          <TituloSeccion nota="Lo que Comercial tiene en la mesa ahora mismo">
            Oportunidades abiertas
          </TituloSeccion>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {oportunidades.map((proyecto) => (
              <li key={proyecto.id}>
                <Link
                  href={`/proyecto/${proyecto.id}`}
                  className="block rounded-xl border border-cyan-400/30 bg-[#111a42] p-4 transition hover:border-cyan-400"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-bold">{proyecto.nombre}</p>
                    <Etiqueta tono="info">{proyecto.area}</Etiqueta>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {proyecto.cliente} · arranca {proyecto.inicio}
                  </p>
                  <p className="mt-2 text-sm text-cyan-300">
                    Buscar quién califica →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {resumen.map((area) => (
          <Panel key={area.area}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-bold">{area.area}</h2>
              <Link
                href={`/perfiles?area=${encodeURIComponent(area.area)}`}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                ver perfiles →
              </Link>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-400">Colaboradores</dt>
              <dd className="text-right font-bold tabular-nums">
                {area.personas}
              </dd>
              <dt className="text-slate-400">Proyectos en ejecución</dt>
              <dd className="text-right font-bold tabular-nums">
                {area.proyectosEnEjecucion}
              </dd>
              <dt className="text-slate-400">Oportunidades</dt>
              <dd className="text-right font-bold tabular-nums">
                {area.oportunidades}
              </dd>
              <dt className="text-slate-400">Carga promedio</dt>
              <dd className="text-right font-bold tabular-nums">
                {area.cargaPromedio}%
              </dd>
              <dt className="text-slate-400">En banca</dt>
              <dd className="text-right font-bold tabular-nums">
                {area.enBanca}
              </dd>
            </dl>

            <p className="mt-3 border-t border-slate-700 pt-3 text-xs text-slate-500">
              Punteo —{" "}
              {CATEGORIAS.map(
                (c) => `${c.nombre.toLowerCase()} ${area.punteos[c.id]}`,
              ).join(" · ")}
            </p>
          </Panel>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel>
          <TituloSeccion nota="Cuántas personas tienen cada habilidad (nivel ≥ 1)">
            Top 10 de habilidades
          </TituloSeccion>
          <ul className="mt-4 space-y-1">
            {top10.map((c) => (
              <BarraDato
                key={c.skill.id}
                etiqueta={c.skill.nombre}
                valor={c.personas}
                maximo={maxTop}
                href={`/buscar?q=${encodeURIComponent(c.skill.nombre)}`}
                detalle={
                  <>
                    {c.avanzados} avanzados · {c.certificados} certificados
                  </>
                }
              />
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Clic en una habilidad para ver quién la tiene y con qué nivel.
          </p>
        </Panel>

        <Panel>
          <TituloSeccion
            nota={`Vencidas o por vencer en los próximos ${DIAS_POR_VENCER} días`}
            accion={
              <Link
                href="/reportes"
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                reporte completo →
              </Link>
            }
          >
            Certificaciones · aviso a RRHH
          </TituloSeccion>

          {avisos.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Ninguna certificación vence en la ventana de planificación.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-800">
              {avisos.slice(0, 8).map((aviso) => (
                <li
                  key={`${aviso.persona.id}-${aviso.certificacion.nombre}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <Avatar
                    nombre={aviso.persona.nombre}
                    foto={aviso.persona.foto}
                    tamano="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/persona/${aviso.persona.id}`}
                      className="text-sm font-semibold hover:text-cyan-300 hover:underline"
                    >
                      {aviso.persona.nombre}
                    </Link>
                    <p className="truncate text-xs text-slate-400">
                      {aviso.certificacion.nombre}
                    </p>
                  </div>
                  <Etiqueta
                    tono={aviso.estado === "vencida" ? "alerta" : "aviso"}
                    titulo={`Vence ${aviso.certificacion.vence}`}
                  >
                    {aviso.estado === "vencida"
                      ? `vencida hace ${Math.abs(aviso.dias)} días`
                      : `vence en ${aviso.dias} días`}
                  </Etiqueta>
                </li>
              ))}
            </ul>
          )}

          {avisos.length > 0 ? (
            <div className="mt-4">
              <Aviso tono="aviso">
                RRHH tiene que contemplar estas renovaciones en la planificación
                del trimestre: una certificación vencida es un requisito de
                licitación que ya no se puede acreditar.
              </Aviso>
            </div>
          ) : null}
        </Panel>
      </section>

      <NotaDemo generado={inventario.generado} />
    </main>
  );
}
