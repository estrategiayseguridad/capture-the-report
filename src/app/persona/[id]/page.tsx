import Link from "next/link";
import { notFound } from "next/navigation";

import { Disponibilidad, NivelBarra } from "@/components/nivel";
import {
  Avatar,
  Aviso,
  Etiqueta,
  NotaDemo,
  Panel,
  TituloSeccion,
} from "@/components/ui";
import { estadoDeCarga, ETIQUETA_CARGA } from "@/lib/analitica";
import { leerInventario } from "@/lib/datos";
import {
  CATEGORIAS,
  certificacionesVigentes,
  diasHasta,
  estadoCertificacion,
  nivelCorto,
  punteoMaximo,
  punteosPorCategoria,
  skillsPorCategoria,
} from "@/lib/skills";
import type { Inventario, OrigenDatos, Persona } from "@/lib/tipos";

/** De dónde salieron los datos. Se dice en pantalla, no en letra chica. */
const ORIGEN: Record<OrigenDatos, string> = {
  sintetico: "Perfil sintético de demo",
  "sintetico-pendiente-excel":
    "Sintético provisional — pendiente de los niveles reales de la matriz de Ingeniería",
  "escenario-pitch": "Personaje del escenario de demo",
  "alta-en-plataforma": "Dado de alta en la plataforma durante esta sesión",
};

const TABS = [
  { id: "habilidades", etiqueta: "Habilidades" },
  { id: "certificaciones", etiqueta: "Certificaciones" },
  { id: "proyectos", etiqueta: "Proyectos" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default async function PerfilPersona({
  params,
  searchParams,
}: PageProps<"/persona/[id]">) {
  const { id } = await params;
  const { q, tab, guardado } = await searchParams;
  const consulta = typeof q === "string" ? q : "";
  const activa: Tab =
    TABS.find((t) => t.id === tab)?.id ?? "habilidades";

  const inventario = await leerInventario();
  const persona = inventario.personas.find((p) => p.id === id);
  if (!persona) notFound();

  const punteos = punteosPorCategoria(persona, inventario.skills);
  const sufijo = consulta ? `&q=${encodeURIComponent(consulta)}` : "";
  const volverA = consulta
    ? `/buscar?q=${encodeURIComponent(consulta)}`
    : "/perfiles";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link href={volverA} className="text-sm text-acento hover:text-acento-claro">
        ← {consulta ? "Volver al buscador" : "Volver a perfiles"}
      </Link>

      {guardado ? (
        <div className="mt-4">
          <Aviso tono="bien">Perfil guardado.</Aviso>
        </div>
      ) : null}

      <header className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar nombre={persona.nombre} foto={persona.foto} tamano="lg" />
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">
              {persona.nombre}
            </h1>
            <p className="mt-1 text-tinta-2">
              {persona.rol} · {persona.equipo}
            </p>
            <p className="mt-1 text-sm text-tinta-4">
              {persona.educacion} · en ES Consulting desde {persona.ingreso}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-tinta-3">
              <Disponibilidad pct={persona.disponibilidad} />
              <Etiqueta
                tono={
                  persona.carga === 0
                    ? "bien"
                    : persona.carga > 100
                      ? "alerta"
                      : "neutro"
                }
              >
                {ETIQUETA_CARGA[estadoDeCarga(persona.carga)]} · {persona.carga}%
              </Etiqueta>
              <span>{persona.idiomas.join(" · ")}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/persona/${persona.id}/cv`}
            className="rounded-lg border border-linea-fuerte px-4 py-2.5 text-sm font-semibold text-tinta-2 transition hover:border-acento hover:text-acento-claro"
          >
            Descargar CV
          </Link>
          <Link
            href={`/persona/${persona.id}/editar`}
            className="rounded-lg border border-linea-fuerte px-4 py-2.5 text-sm font-semibold text-tinta-2 transition hover:border-acento hover:text-acento-claro"
          >
            Editar perfil
          </Link>
          <Link
            href={`/reporte?ids=${encodeURIComponent(persona.id)}${sufijo}`}
            className="rounded-lg bg-acento px-4 py-2.5 text-sm font-bold text-fondo transition hover:bg-acento-claro"
          >
            Ficha de capacidades →
          </Link>
        </div>
      </header>

      {persona.descripcion ? (
        <p className="mt-6 max-w-3xl text-tinta-2">{persona.descripcion}</p>
      ) : null}

      <p className="mt-4 rounded-lg border border-linea-suave bg-hueco px-4 py-2 text-xs text-tinta-3">
        Origen de los datos: {ORIGEN[persona.origen]}.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {CATEGORIAS.map((categoria) => (
          <Panel key={categoria.id}>
            <p className="text-xs uppercase tracking-wider text-tinta-4">
              {categoria.nombre}
            </p>
            <p className="mt-1 text-2xl font-bold text-acento-claro">
              {punteos[categoria.id]}
              <span className="text-base font-normal text-tinta-4">
                {" "}
                / {punteoMaximo(categoria.id, inventario.skills)}
              </span>
            </p>
            <p className="mt-1 text-xs text-tinta-4">punteo de la categoría</p>
          </Panel>
        ))}
      </section>

      <nav className="mt-8 flex gap-1 border-b border-linea-suave">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/persona/${persona.id}?tab=${t.id}${sufijo}`}
            aria-current={t.id === activa ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${
              t.id === activa
                ? "border-acento font-bold text-acento-claro"
                : "border-transparent text-tinta-3 hover:text-tinta"
            }`}
          >
            {t.etiqueta}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {activa === "habilidades" ? (
          <Habilidades persona={persona} inventario={inventario} />
        ) : null}
        {activa === "certificaciones" ? (
          <Certificaciones persona={persona} />
        ) : null}
        {activa === "proyectos" ? (
          <Proyectos persona={persona} inventario={inventario} />
        ) : null}
      </div>

      <footer className="mt-12 border-t border-linea-suave pt-5 text-xs text-tinta-4">
        <p>
          El registro y la actualización del perfil los hace RRHH. La
          disponibilidad se calcula de los proyectos asignados, y el líder del
          equipo la confirma antes de comprometer a la persona.
        </p>
      </footer>
      <NotaDemo generado={inventario.generado} />
    </main>
  );
}

function Habilidades({
  persona,
  inventario,
}: {
  persona: Persona;
  inventario: Inventario;
}) {
  const porCategoria = skillsPorCategoria(persona, inventario.skills);

  return (
    <section className="space-y-6">
      {CATEGORIAS.map((categoria) => {
        const skills = porCategoria[categoria.id];
        return (
          <div key={categoria.id}>
            <TituloSeccion nota={categoria.nota}>
              {categoria.nombre}
            </TituloSeccion>

            {skills.length === 0 ? (
              <p className="mt-3 text-sm text-tinta-4">
                Sin habilidades registradas en esta categoría.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-linea-suave overflow-hidden rounded-xl border border-linea bg-panel">
                {skills.map(({ skill, nivel }) => (
                  <li
                    key={skill.id}
                    className="flex items-center justify-between gap-4 px-4 py-2.5"
                  >
                    <span className="text-sm text-tinta">
                      {skill.nombre}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-tinta-3">
                        {nivelCorto(inventario.escala, nivel)}
                      </span>
                      <NivelBarra nivel={nivel} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <p className="text-xs text-tinta-4">
        Lo que no aparece está en 0 (no tiene conocimiento).{" "}
        <Link
          href={`/persona/${persona.id}/editar?tab=habilidades`}
          className="text-acento hover:text-acento-claro"
        >
          Calificar habilidades →
        </Link>
      </p>
    </section>
  );
}

function Certificaciones({ persona }: { persona: Persona }) {
  const vigentes = certificacionesVigentes(persona);
  const ordenadas = [...persona.certificaciones].sort((a, b) =>
    a.vence.localeCompare(b.vence),
  );

  return (
    <section>
      <TituloSeccion
        nota="Vigencia contada a partir de la fecha de vencimiento registrada"
        accion={
          <Link
            href={`/persona/${persona.id}/editar?tab=certificaciones`}
            className="text-sm text-acento hover:text-acento-claro"
          >
            + Agregar certificación
          </Link>
        }
      >
        Certificaciones
      </TituloSeccion>

      {ordenadas.length === 0 ? (
        <p className="mt-3 text-sm text-tinta-4">
          Sin certificaciones registradas.
        </p>
      ) : (
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-linea text-left text-xs uppercase tracking-wider text-tinta-4">
              <th className="py-2 font-semibold">Certificación</th>
              <th className="py-2 font-semibold">Emitida</th>
              <th className="py-2 font-semibold">Vence</th>
              <th className="py-2 font-semibold">Estado</th>
              <th className="py-2 font-semibold">Adjunto</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((cert) => {
              const estado = estadoCertificacion(cert);
              const dias = diasHasta(cert.vence);
              return (
                <tr key={cert.nombre} className="border-b border-linea-suave">
                  <td className="py-2.5 font-semibold text-tinta">
                    {cert.nombre}
                  </td>
                  <td className="py-2.5 text-tinta-3">{cert.emitida}</td>
                  <td className="py-2.5 text-tinta-3">{cert.vence}</td>
                  <td className="py-2.5">
                    <Etiqueta
                      tono={
                        estado === "vigente"
                          ? "bien"
                          : estado === "por-vencer"
                            ? "aviso"
                            : "alerta"
                      }
                    >
                      {estado === "vigente"
                        ? `vigente · ${dias} d`
                        : estado === "por-vencer"
                          ? `vence en ${dias} d`
                          : `vencida hace ${Math.abs(dias)} d`}
                    </Etiqueta>
                  </td>
                  <td className="py-2.5 text-xs text-tinta-4">
                    {cert.archivo ?? "sin adjunto"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="mt-3 text-xs text-tinta-4">
        {vigentes.length} de {persona.certificaciones.length} vigentes. El
        adjunto se registra por nombre: el prototipo no sube archivos.
      </p>
    </section>
  );
}

function Proyectos({
  persona,
  inventario,
}: {
  persona: Persona;
  inventario: Inventario;
}) {
  const asignados = inventario.proyectos
    .map((proyecto) => ({
      proyecto,
      asignacion: proyecto.asignaciones.find((a) => a.personaId === persona.id),
    }))
    .filter((f) => f.asignacion !== undefined);

  const activos = asignados.filter((f) => f.proyecto.estado === "en-ejecucion");
  const otros = asignados.filter((f) => f.proyecto.estado !== "en-ejecucion");

  return (
    <section>
      <TituloSeccion
        nota="Solo los proyectos en ejecución consumen disponibilidad"
        accion={
          <Link href="/carga" className="text-sm text-acento hover:text-acento-claro">
            ver carga del equipo →
          </Link>
        }
      >
        Proyectos asignados
      </TituloSeccion>

      {asignados.length === 0 ? (
        <p className="mt-3 text-sm text-tinta-4">
          Sin proyectos asignados: está en banca, 100% disponible.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {[...activos, ...otros].map(({ proyecto, asignacion }) => (
            <li
              key={proyecto.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-linea bg-panel px-4 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/proyecto/${proyecto.id}`}
                  className="font-semibold hover:text-acento-claro hover:underline"
                >
                  {proyecto.nombre}
                </Link>
                <p className="text-xs text-tinta-3">
                  {proyecto.cliente} · {asignacion!.rolProyecto} ·{" "}
                  {proyecto.inicio} → {proyecto.fin}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Etiqueta
                  tono={proyecto.estado === "en-ejecucion" ? "info" : "neutro"}
                >
                  {proyecto.estado === "en-ejecucion"
                    ? "en ejecución"
                    : proyecto.estado}
                </Etiqueta>
                <span className="text-sm font-bold tabular-nums text-tinta">
                  {asignacion!.dedicacion}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm text-tinta-3">
        Carga total: <strong className="text-tinta">{persona.carga}%</strong>{" "}
        · disponible{" "}
        <strong className="text-tinta">{persona.disponibilidad}%</strong>
      </p>
    </section>
  );
}
