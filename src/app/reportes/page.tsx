import Link from "next/link";

import { BotonImprimir } from "@/components/boton-imprimir";
import {
  Avatar,
  BarraDato,
  Etiqueta,
  NotaDemo,
  Panel,
  Tile,
  TituloSeccion,
} from "@/components/ui";
import {
  brechasDelArea,
  cargaDelEquipo,
  certificacionesEnRiesgo,
  DIAS_POR_VENCER,
  ETIQUETA_CARGA,
  fortalezasDelArea,
  historialDelArea,
  inversionRecomendada,
  textoMotivo,
  type Brecha,
  type CargaPersona,
  type FilaHistorial,
  type Inversion,
} from "@/lib/analitica";
import { leerInventario } from "@/lib/datos";
import { CATEGORIAS } from "@/lib/skills";
import { EQUIPOS } from "@/lib/tipos";
import type { Equipo } from "@/lib/tipos";

/**
 * Reportes por área (menú 8 del pitch): fortalezas, deficiencias, comparativo
 * mes a mes, dónde conviene invertir en capacitación o certificación, y la
 * carga de cada ingeniero. Es el paso 4 del escenario — el insumo de RRHH y
 * gerencia para planificar, no para buscar gente.
 */
export const metadata = {
  title: "Reportes · ProdigiES",
};

const TONO_MOTIVO = {
  nadie: "alerta",
  "una-sola-persona": "alerta",
  "sin-avanzado": "aviso",
  "sin-certificacion": "aviso",
} as const;

const TONO_CARGA = {
  banca: "bien",
  holgada: "info",
  ajustada: "aviso",
  sobrecargada: "alerta",
} as const;

export default async function Reportes({
  searchParams,
}: PageProps<"/reportes">) {
  const { area } = await searchParams;
  const elegida: Equipo =
    EQUIPOS.find((e) => e === area) ?? "Ingeniería";

  const inventario = await leerInventario();

  const personas = inventario.personas.filter((p) => p.equipo === elegida);
  const fortalezas = fortalezasDelArea(inventario, elegida);
  const brechas = brechasDelArea(inventario, elegida);
  const inversiones = inversionRecomendada(inventario, elegida);
  const historial = historialDelArea(inventario, elegida);
  const carga = cargaDelEquipo(inventario, elegida);
  const enRiesgo = certificacionesEnRiesgo(inventario).filter(
    (a) => a.persona.equipo === elegida,
  );

  const criticas = brechas.filter((b) => b.prioridad <= 2).length;
  const ultimo = historial.at(-1);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
      <p className="text-xs uppercase tracking-[0.3em] text-acento print:text-tinta-4">
        Menú · Reportes
      </p>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reporte de {elegida}
          </h1>
          <p className="mt-2 max-w-2xl text-tinta-2">
            Fortalezas, deficiencias y en qué conviene invertir. Se lee por área
            porque el catálogo es común: un skill de GRC no es una brecha de
            Ingeniería del mismo modo que lo es de Consulting.
          </p>
        </div>
        <div className="print:hidden">
          <BotonImprimir />
        </div>
      </div>

      <form action="/reportes" className="mt-6 flex flex-wrap gap-2 print:hidden">
        {EQUIPOS.map((e) => (
          <Link
            key={e}
            href={`/reportes?area=${encodeURIComponent(e)}`}
            aria-current={e === elegida ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              e === elegida
                ? "border-acento bg-acento/10 font-bold text-acento-claro"
                : "border-linea text-tinta-2 hover:border-acento hover:text-acento-claro"
            }`}
          >
            {e}
          </Link>
        ))}
      </form>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile valor={personas.length} etiqueta="Colaboradores" />
        <Tile
          valor={ultimo ? ultimo.total : 0}
          etiqueta="Punteo del área"
          nota={ultimo ? `mes ${ultimo.mes} · ${signo(ultimo.delta)} vs. mes anterior` : undefined}
        />
        <Tile
          valor={criticas}
          etiqueta="Brechas críticas"
          nota="Nadie lo tiene o lo cubre una sola persona"
        />
        <Tile
          valor={enRiesgo.length}
          etiqueta="Certificaciones en riesgo"
          nota={`Vencidas o a ≤ ${DIAS_POR_VENCER} días`}
        />
      </section>

      <section className="mt-10">
        <TituloSeccion nota="Punteo = suma de niveles del área en ese skill. Entre paréntesis, cuánta gente y cuántos avanzados.">
          Fortalezas de {elegida}
        </TituloSeccion>
        {fortalezas.length === 0 ? (
          <p className="mt-3 text-sm text-tinta-4">
            El área todavía no tiene habilidades calificadas.
          </p>
        ) : (
          <ul className="mt-4">
            {fortalezas.map((f) => (
              <BarraDato
                key={f.skill.id}
                etiqueta={f.skill.nombre}
                valor={f.punteo}
                maximo={fortalezas[0].punteo}
                href={`/buscar?q=${encodeURIComponent(f.skill.nombre)}`}
                detalle={`${f.personas} pers · ${f.avanzados} avanzados · ${f.certificados} cert.`}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <TituloSeccion nota="Ordenadas por urgencia. Esto es lo que no se puede comprometer hoy en una propuesta.">
          Deficiencias de {elegida}
        </TituloSeccion>
        {brechas.length === 0 ? (
          <p className="mt-3 text-sm text-tinta-4">
            Sin brechas: todo el catálogo tiene al menos dos personas, un
            avanzado y una certificación vigente.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {brechas.slice(0, 12).map((brecha) => (
              <li key={brecha.skill.id}>
                <FilaBrecha brecha={brecha} />
              </li>
            ))}
          </ul>
        )}
        {brechas.length > 12 ? (
          <p className="mt-3 text-xs text-tinta-4">
            …y {brechas.length - 12} más de menor prioridad.
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <TituloSeccion nota="Punteo total del área por mes: sube cuando alguien se califica más alto, se certifica o entra gente nueva.">
          Comparativo mes a mes
        </TituloSeccion>
        <Historico filas={historial} />
      </section>

      <section className="mt-10">
        <TituloSeccion nota="Lo que RRHH necesita para el presupuesto: qué formar o certificar, y en quién.">
          Dónde invertir
        </TituloSeccion>
        {inversiones.length === 0 ? (
          <p className="mt-3 text-sm text-tinta-4">
            No hay recomendaciones pendientes para esta área.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {inversiones.map((inversion) => (
              <li key={inversion.skill.id}>
                <TarjetaInversion inversion={inversion} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {enRiesgo.length > 0 ? (
        <section className="mt-10">
          <TituloSeccion nota="El aviso a RRHH del escenario: hay que reprogramar el examen antes de que la certificación caiga.">
            Certificaciones por vencer
          </TituloSeccion>
          <ul className="mt-4 space-y-2">
            {enRiesgo.map((aviso) => (
              <li
                key={`${aviso.persona.id}-${aviso.certificacion.nombre}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linea bg-panel px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/persona/${aviso.persona.id}?tab=certificaciones`}
                    className="font-semibold underline-offset-4 hover:text-acento-claro hover:underline"
                  >
                    {aviso.persona.nombre}
                  </Link>
                  <p className="text-xs text-tinta-3">
                    {aviso.certificacion.nombre} · vence{" "}
                    {aviso.certificacion.vence}
                  </p>
                </div>
                <Etiqueta tono={aviso.estado === "vencida" ? "alerta" : "aviso"}>
                  {aviso.estado === "vencida"
                    ? `vencida hace ${Math.abs(aviso.dias)} días`
                    : `vence en ${aviso.dias} días`}
                </Etiqueta>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <TituloSeccion
          nota="Carga de cada persona del área, de la más ocupada a la que está en banca."
          accion={
            <Link
              href={`/carga?area=${encodeURIComponent(elegida)}`}
              className="text-sm text-acento hover:text-acento-claro print:hidden"
            >
              Ver carga laboral →
            </Link>
          }
        >
          Carga por ingeniero
        </TituloSeccion>
        <ul className="mt-4">
          {carga.map((fila) => (
            <BarraDato
              key={fila.persona.id}
              etiqueta={fila.persona.nombre}
              valor={fila.carga}
              maximo={100}
              sufijo="%"
              href={`/persona/${fila.persona.id}?tab=proyectos`}
              detalle={<>{ETIQUETA_CARGA[fila.estado]}</>}
            />
          ))}
        </ul>
        <ul className="mt-4 space-y-1 text-xs text-tinta-4 print:hidden">
          {carga
            .filter((f) => f.estado === "sobrecargada")
            .map((f) => (
              <li key={f.persona.id}>
                <Etiqueta tono={TONO_CARGA[f.estado]}>
                  {ETIQUETA_CARGA[f.estado]}
                </Etiqueta>{" "}
                {f.persona.nombre} — {detalleProyectos(f)}
              </li>
            ))}
        </ul>
      </section>

      <NotaDemo generado={inventario.generado} />
    </main>
  );
}

function detalleProyectos(fila: CargaPersona): string {
  return fila.asignaciones
    .map((a) => `${a.proyecto.nombre} ${a.dedicacion}%`)
    .join(" · ");
}

function signo(delta: number): string {
  if (delta === 0) return "sin cambio";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function FilaBrecha({ brecha }: { brecha: Brecha }) {
  const motivo = textoMotivo(brecha.motivo);

  return (
    <div className="rounded-xl border border-linea bg-panel px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/buscar?q=${encodeURIComponent(brecha.skill.nombre)}`}
            className="font-semibold underline-offset-4 hover:text-acento-claro hover:underline"
          >
            {brecha.skill.nombre}
          </Link>
          <span className="ml-2 text-xs text-tinta-4">
            {CATEGORIAS.find((c) => c.id === brecha.skill.categoria)?.nombre}
          </span>
        </div>
        <Etiqueta tono={TONO_MOTIVO[brecha.motivo]}>{motivo.etiqueta}</Etiqueta>
      </div>
      <p className="mt-1 text-sm text-tinta-3">
        {motivo.nota}
      </p>
      <p className="mt-1 text-xs text-tinta-4">
        {brecha.personas} personas lo tienen · {brecha.avanzados} avanzados ·{" "}
        {brecha.certificados} con certificación vigente
      </p>
    </div>
  );
}

function Historico({ filas }: { filas: FilaHistorial[] }) {
  if (filas.length === 0) {
    return (
      <p className="mt-3 text-sm text-tinta-4">Sin histórico registrado.</p>
    );
  }

  const maximo = Math.max(...filas.map((f) => f.total));

  return (
    <>
      <ul className="mt-4">
        {filas.map((fila) => (
          <BarraDato
            key={fila.mes}
            etiqueta={fila.mes}
            valor={fila.total}
            maximo={maximo}
            detalle={
              fila.delta === 0 ? (
                "sin cambio"
              ) : (
                <span
                  className={
                    fila.delta > 0
                      ? "text-bien"
                      : "text-alerta"
                  }
                >
                  {signo(fila.delta)} vs. mes anterior
                </span>
              )
            }
          />
        ))}
      </ul>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Punteo por categoría y mes del área
          </caption>
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-tinta-4">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Mes
              </th>
              {CATEGORIAS.map((c) => (
                <th key={c.id} scope="col" className="py-2 pr-4 font-semibold">
                  {c.nombre}
                </th>
              ))}
              <th scope="col" className="py-2 font-semibold">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {filas.map((fila) => (
              <tr key={fila.mes} className="border-t border-linea-suave">
                <th
                  scope="row"
                  className="py-2 pr-4 text-left font-normal text-tinta-2"
                >
                  {fila.mes}
                </th>
                {CATEGORIAS.map((c) => (
                  <td
                    key={c.id}
                    className="py-2 pr-4 text-tinta-3"
                  >
                    {fila.punteos[c.id]}
                  </td>
                ))}
                <td className="py-2 font-bold text-tinta">
                  {fila.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TarjetaInversion({ inversion }: { inversion: Inversion }) {
  return (
    <Panel className="h-full">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-bold">{inversion.skill.nombre}</h3>
        <Etiqueta tono={inversion.accion === "certificar" ? "info" : "aviso"}>
          {inversion.accion}
        </Etiqueta>
      </div>
      <p className="mt-1 text-sm text-tinta-3">
        {inversion.motivo}
      </p>

      {inversion.candidatos.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {inversion.candidatos.map((persona) => (
            <li key={persona.id} className="flex items-center gap-2 text-sm">
              <Avatar nombre={persona.nombre} foto={persona.foto} tamano="sm" />
              <div className="min-w-0">
                <Link
                  href={`/persona/${persona.id}`}
                  className="font-semibold underline-offset-4 hover:text-acento-claro hover:underline"
                >
                  {persona.nombre}
                </Link>
                <p className="text-xs text-tinta-4">
                  {persona.rol} · {persona.disponibilidad}% disponible
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-tinta-4">
          Nadie del área lo tiene: hay que capacitar desde cero o contratar.
        </p>
      )}
    </Panel>
  );
}
