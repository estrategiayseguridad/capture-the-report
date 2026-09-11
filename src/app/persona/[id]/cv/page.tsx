import Link from "next/link";
import { notFound } from "next/navigation";

import { BotonImprimir } from "@/components/boton-imprimir";
import { NivelBarra } from "@/components/nivel";
import { leerInventario } from "@/lib/datos";
import {
  CATEGORIAS,
  certificacionesVigentes,
  nivelCorto,
  skillsPorCategoria,
} from "@/lib/skills";

/**
 * El CV que se baja desde el perfil (menú 4 del pitch). Se arma del mismo dato
 * que la matriz: no hay un documento aparte que se pueda quedar viejo. HTML con
 * `@media print` — se imprime o se guarda como PDF desde el navegador.
 */
export default async function CV({ params }: PageProps<"/persona/[id]/cv">) {
  const { id } = await params;

  const inventario = await leerInventario();
  const persona = inventario.personas.find((p) => p.id === id);
  if (!persona) notFound();

  const porCategoria = skillsPorCategoria(persona, inventario.skills);
  const vigentes = certificacionesVigentes(persona);
  const proyectos = inventario.proyectos
    .map((proyecto) => ({
      proyecto,
      asignacion: proyecto.asignaciones.find((a) => a.personaId === persona.id),
    }))
    .filter((f) => f.asignacion !== undefined)
    .sort((a, b) => b.proyecto.inicio.localeCompare(a.proyecto.inicio));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-8 pt-6 print:hidden">
        <Link
          href={`/persona/${persona.id}`}
          className="text-sm text-cyan-700 hover:underline"
        >
          ← Volver al perfil
        </Link>
        <BotonImprimir />
      </div>

      <article className="mx-auto max-w-3xl px-8 py-8 print:px-0 print:py-0">
        <header className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              ES Consulting · ProdigiES
            </p>
            <p className="text-xs text-slate-500">
              Perfil profesional · {inventario.generado}
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {persona.nombre}
          </h1>
          <p className="mt-1 text-lg text-slate-700">
            {persona.rol} · {persona.equipo}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {persona.educacion} · En ES Consulting desde {persona.ingreso} ·
            Idiomas: {persona.idiomas.join(", ")}
          </p>
        </header>

        {persona.descripcion ? (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Perfil
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
              {persona.descripcion}
            </p>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Habilidades y nivel
          </h2>
          <div className="mt-2 grid gap-5 sm:grid-cols-3">
            {CATEGORIAS.map((categoria) => {
              const skills = porCategoria[categoria.id];
              return (
                <div key={categoria.id} className="break-inside-avoid">
                  <h3 className="text-sm font-bold">{categoria.nombre}</h3>
                  {skills.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Sin registro en esta categoría.
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-1">
                      {skills.map(({ skill, nivel }) => (
                        <li
                          key={skill.id}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="text-slate-800">{skill.nombre}</span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            <span className="text-slate-500">
                              {nivelCorto(inventario.escala, nivel)}
                            </span>
                            <NivelBarra nivel={nivel} claro />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Certificaciones vigentes
          </h2>
          {vigentes.length === 0 ? (
            <p className="mt-1.5 text-sm text-slate-600">
              Sin certificaciones vigentes registradas.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-sm">
              {vigentes.map((cert) => (
                <li key={cert.nombre} className="text-slate-800">
                  <strong>{cert.nombre}</strong>{" "}
                  <span className="text-slate-500">
                    — emitida {cert.emitida}, vigente hasta {cert.vence}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Experiencia en proyectos
          </h2>
          {proyectos.length === 0 ? (
            <p className="mt-1.5 text-sm text-slate-600">
              Sin proyectos registrados en la plataforma.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-2 text-sm">
              {proyectos.map(({ proyecto, asignacion }) => (
                <li key={proyecto.id}>
                  <p className="font-semibold text-slate-900">
                    {proyecto.nombre} — {proyecto.cliente}
                  </p>
                  <p className="text-xs text-slate-600">
                    {asignacion!.rolProyecto} · {asignacion!.dedicacion}% de
                    dedicación · {proyecto.inicio} → {proyecto.fin} ·{" "}
                    {proyecto.estado === "en-ejecucion"
                      ? "en ejecución"
                      : proyecto.estado}
                  </p>
                  <p className="text-xs text-slate-600">
                    {proyecto.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-300 pt-4 text-xs text-slate-500">
          <p>
            Generado por ProdigiES a partir de la matriz de habilidades de ES
            Consulting. Los niveles siguen la escala 0–3:{" "}
            {inventario.escala.map((e) => `${e.nivel} ${e.etiqueta}`).join(" · ")}
            .
          </p>
          <p className="mt-2">
            Documento de demostración — ninguna persona real de ES Consulting
            aparece con sus datos.
          </p>
        </footer>
      </article>
    </div>
  );
}
