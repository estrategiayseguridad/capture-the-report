import Link from "next/link";
import { notFound } from "next/navigation";

import { Disponibilidad, NivelChip } from "@/components/nivel";
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
  asignarAProyecto,
  cambiarEstadoProyecto,
  quitarAsignacion,
} from "@/lib/acciones";
import { buscar } from "@/lib/buscar";
import { leerInventario } from "@/lib/datos";
import { nivelCorto } from "@/lib/skills";
import type { Candidato, Inventario, Proyecto } from "@/lib/tipos";

/**
 * Detalle del proyecto: el paso 3 del escenario del pitch. Aquí PM adjudica la
 * oportunidad y asigna a la gente; al hacerlo baja la disponibilidad de cada
 * uno en el buscador, en su perfil y en carga laboral.
 */
const ESTADO = {
  oportunidad: { etiqueta: "oportunidad", tono: "info" },
  "en-ejecucion": { etiqueta: "en ejecución", tono: "bien" },
  cerrado: { etiqueta: "cerrado", tono: "neutro" },
} as const;

export default async function DetalleProyecto({
  params,
  searchParams,
}: PageProps<"/proyecto/[id]">) {
  const { id } = await params;
  const { guardado } = await searchParams;

  const inventario = await leerInventario();
  const proyecto = inventario.proyectos.find((p) => p.id === id);
  if (!proyecto) notFound();

  const personaPorId = new Map(inventario.personas.map((p) => [p.id, p]));
  const equipo = proyecto.asignaciones.flatMap((asignacion) => {
    const persona = personaPorId.get(asignacion.personaId);
    return persona ? [{ asignacion, persona }] : [];
  });
  const dedicacionTotal = equipo.reduce(
    (a, x) => a + x.asignacion.dedicacion,
    0,
  );

  const asignados = new Set(proyecto.asignaciones.map((a) => a.personaId));
  const resultado = proyecto.requisitos.trim()
    ? buscar(inventario, proyecto.requisitos)
    : null;
  const sugeridos = (resultado?.candidatos ?? [])
    .filter((c) => !asignados.has(c.persona.id))
    .slice(0, 5);

  const estado = ESTADO[proyecto.estado];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link href="/carga" className="text-sm text-acento hover:text-acento-claro">
        ← Volver a carga laboral
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-acento">
        Menú · Carga laboral · Proyecto
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{proyecto.nombre}</h1>
        <Etiqueta tono={estado.tono}>{estado.etiqueta}</Etiqueta>
      </div>
      <p className="mt-1 text-tinta-3">
        {proyecto.cliente} · {proyecto.area} · {proyecto.inicio} →{" "}
        {proyecto.fin}
      </p>

      {guardado ? (
        <div className="mt-5 max-w-2xl">
          <Aviso tono="bien">
            Guardado en <code>data/colaboradores.json</code>. La disponibilidad
            de todos se recalculó.
          </Aviso>
        </div>
      ) : null}

      <p className="mt-5 max-w-3xl text-tinta-2">{proyecto.descripcion}</p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Tile valor={equipo.length} etiqueta="Personas asignadas" />
        <Tile
          valor={`${dedicacionTotal}%`}
          etiqueta="Dedicación acumulada"
          nota="Suma del tiempo comprometido"
        />
        <Tile
          valor={proyecto.estado === "en-ejecucion" ? "Sí" : "No"}
          etiqueta="Consume carga"
          nota="Solo lo que está en ejecución"
        />
      </section>

      <CambiarEstado proyecto={proyecto} />

      <section className="mt-10">
        <TituloSeccion nota="Queda registrado: es lo que se ve en carga laboral y en el perfil de cada uno.">
          Equipo asignado
        </TituloSeccion>

        {equipo.length === 0 ? (
          <p className="mt-4 text-sm text-tinta-4">
            Todavía nadie. Asigna abajo a los candidatos que califican.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {equipo.map(({ asignacion, persona }) => (
              <li
                key={persona.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-linea bg-panel px-4 py-3"
              >
                <Avatar
                  nombre={persona.nombre}
                  foto={persona.foto}
                  tamano="sm"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <Link
                      href={`/persona/${persona.id}?tab=proyectos`}
                      className="font-semibold underline-offset-4 hover:text-acento-claro hover:underline"
                    >
                      {persona.nombre}
                    </Link>
                    <span className="text-xs text-tinta-3">
                      {asignacion.rolProyecto}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-tinta-3">
                    <span>
                      <strong className="text-tinta">
                        {asignacion.dedicacion}%
                      </strong>{" "}
                      en este proyecto
                    </span>
                    <Disponibilidad pct={persona.disponibilidad} />
                  </div>
                </div>

                <form action={quitarAsignacion}>
                  <input type="hidden" name="proyectoId" value={proyecto.id} />
                  <input type="hidden" name="personaId" value={persona.id} />
                  <button
                    type="submit"
                    className="text-xs text-alerta hover:text-alerta"
                  >
                    quitar del proyecto
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <TituloSeccion
          nota={`Requisitos del proyecto: ${proyecto.requisitos || "sin definir"}`}
          accion={
            <Link
              href={`/buscar?q=${encodeURIComponent(proyecto.requisitos)}`}
              className="text-sm text-acento hover:text-acento-claro"
            >
              Buscar más candidatos →
            </Link>
          }
        >
          Candidatos que califican
        </TituloSeccion>

        {sugeridos.length === 0 ? (
          <div className="mt-4">
            <Aviso tono="aviso">
              No quedan candidatos con estos requisitos registrados.{" "}
              <Link href="/reportes" className="underline">
                Ver el reporte de brechas
              </Link>{" "}
              para planificar capacitación.
            </Aviso>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {sugeridos.map((candidato) => (
              <li key={candidato.persona.id}>
                <TarjetaCandidato
                  candidato={candidato}
                  proyecto={proyecto}
                  inventario={inventario}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AsignarManual proyecto={proyecto} inventario={inventario} />

      <NotaDemo generado={inventario.generado} />
    </main>
  );
}

function CambiarEstado({ proyecto }: { proyecto: Proyecto }) {
  const acciones =
    proyecto.estado === "oportunidad"
      ? [{ estado: "en-ejecucion", etiqueta: "Adjudicar y arrancar", primaria: true }]
      : proyecto.estado === "en-ejecucion"
        ? [
            { estado: "cerrado", etiqueta: "Cerrar proyecto", primaria: false },
            {
              estado: "oportunidad",
              etiqueta: "Volver a oportunidad",
              primaria: false,
            },
          ]
        : [
            {
              estado: "en-ejecucion",
              etiqueta: "Reabrir en ejecución",
              primaria: false,
            },
          ];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {acciones.map((accion) => (
        <form key={accion.estado} action={cambiarEstadoProyecto}>
          <input type="hidden" name="proyectoId" value={proyecto.id} />
          <input type="hidden" name="estado" value={accion.estado} />
          <button
            type="submit"
            className={
              accion.primaria
                ? "rounded-lg bg-acento px-5 py-2.5 font-bold text-fondo transition hover:bg-acento-claro"
                : "rounded-lg border border-linea-fuerte px-4 py-2.5 text-sm font-semibold text-tinta-2 transition hover:border-acento hover:text-acento-claro"
            }
          >
            {accion.etiqueta}
          </button>
        </form>
      ))}
      {proyecto.estado === "oportunidad" ? (
        <p className="text-xs text-tinta-4">
          Adjudicar pasa el proyecto a ejecución: desde ese momento la
          dedicación de su equipo cuenta como carga.
        </p>
      ) : null}
    </div>
  );
}

function TarjetaCandidato({
  candidato,
  proyecto,
  inventario,
}: {
  candidato: Candidato;
  proyecto: Proyecto;
  inventario: Inventario;
}) {
  const { persona } = candidato;

  return (
    <Panel>
      <div className="flex flex-wrap items-start gap-4">
        <Avatar nombre={persona.nombre} foto={persona.foto} tamano="sm" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <Link
              href={`/persona/${persona.id}`}
              className="font-bold underline-offset-4 hover:text-acento-claro hover:underline"
            >
              {persona.nombre}
            </Link>
            <span className="text-sm text-tinta-3">
              {persona.rol} · {persona.equipo}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {candidato.coberturas.map((cobertura) => (
              <NivelChip
                key={cobertura.requisito.etiqueta}
                etiqueta={cobertura.requisito.etiqueta}
                nivel={cobertura.nivel}
                descripcion={nivelCorto(inventario.escala, cobertura.nivel)}
                certificacion={cobertura.certificacion?.nombre}
              />
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-tinta-3">
            <Disponibilidad pct={persona.disponibilidad} />
            {persona.carga === 0 ? (
              <Etiqueta tono="bien">En banca</Etiqueta>
            ) : (
              <span>{persona.carga}% comprometido</span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-2xl font-bold leading-none text-acento-claro">
            {candidato.score}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-tinta-4">
            match
          </div>
        </div>
      </div>

      <FormularioAsignar
        proyecto={proyecto}
        personaId={persona.id}
        rolSugerido={persona.rol}
        disponible={persona.disponibilidad}
      />
    </Panel>
  );
}

/** El formulario que deja la asignación registrada. */
function FormularioAsignar({
  proyecto,
  personaId,
  rolSugerido,
  disponible,
}: {
  proyecto: Proyecto;
  personaId: string;
  rolSugerido: string;
  disponible: number;
}) {
  const sugerida = Math.max(10, Math.min(50, disponible));

  return (
    <form
      action={asignarAProyecto}
      className="mt-4 flex flex-wrap items-end gap-3 border-t border-linea-suave pt-4"
    >
      <input type="hidden" name="proyectoId" value={proyecto.id} />
      <input type="hidden" name="personaId" value={personaId} />

      <label className="flex-1 text-xs">
        <span className="block text-tinta-3">Rol en el proyecto</span>
        <input
          name="rolProyecto"
          defaultValue={rolSugerido}
          className="mt-1 w-full rounded-lg border border-linea-fuerte bg-hueco px-3 py-2 text-sm text-tinta focus:border-acento focus:outline-none"
        />
      </label>

      <label className="text-xs">
        <span className="block text-tinta-3">Dedicación %</span>
        <input
          type="number"
          name="dedicacion"
          min={0}
          max={100}
          step={5}
          defaultValue={sugerida}
          className="mt-1 w-24 rounded-lg border border-linea-fuerte bg-hueco px-3 py-2 text-sm tabular-nums text-tinta focus:border-acento focus:outline-none"
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-acento px-4 py-2 text-sm font-bold text-fondo transition hover:bg-acento-claro"
      >
        Asignar al proyecto
      </button>

      {disponible === 0 ? (
        <p className="text-xs text-aviso">
          Está al 100% de carga: asignarlo lo deja sobrecargado.
        </p>
      ) : null}
    </form>
  );
}

/** Para cuando PM quiere a alguien que el buscador no propuso. */
function AsignarManual({
  proyecto,
  inventario,
}: {
  proyecto: Proyecto;
  inventario: Inventario;
}) {
  const asignados = new Set(proyecto.asignaciones.map((a) => a.personaId));
  const libres = inventario.personas
    .filter((p) => !asignados.has(p.id))
    .sort((a, b) => b.disponibilidad - a.disponibilidad);

  if (libres.length === 0) return null;

  return (
    <section className="mt-10">
      <TituloSeccion nota="Ordenados por disponibilidad, sin filtrar por habilidad.">
        Asignar a alguien más
      </TituloSeccion>

      <form
        action={asignarAProyecto}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-linea bg-hueco p-5"
      >
        <input type="hidden" name="proyectoId" value={proyecto.id} />

        <label className="min-w-64 flex-1 text-xs">
          <span className="block text-tinta-3">Colaborador</span>
          <select
            name="personaId"
            required
            className="mt-1 w-full rounded-lg border border-linea-fuerte bg-panel px-3 py-2 text-sm text-tinta focus:border-acento focus:outline-none"
          >
            {libres.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre} — {persona.equipo} · {persona.disponibilidad}%
                disponible
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs">
          <span className="block text-tinta-3">Rol en el proyecto</span>
          <input
            name="rolProyecto"
            placeholder="Consultor asignado"
            className="mt-1 rounded-lg border border-linea-fuerte bg-panel px-3 py-2 text-sm text-tinta placeholder:text-tinta-4 focus:border-acento focus:outline-none"
          />
        </label>

        <label className="text-xs">
          <span className="block text-tinta-3">Dedicación %</span>
          <input
            type="number"
            name="dedicacion"
            min={0}
            max={100}
            step={5}
            defaultValue={25}
            className="mt-1 w-24 rounded-lg border border-linea-fuerte bg-panel px-3 py-2 text-sm tabular-nums text-tinta focus:border-acento focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg border border-acento/50 px-4 py-2 text-sm font-semibold text-acento-claro transition hover:bg-acento hover:text-fondo"
        >
          Asignar
        </button>
      </form>
    </section>
  );
}
