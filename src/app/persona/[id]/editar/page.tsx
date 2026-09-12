import Link from "next/link";
import { notFound } from "next/navigation";

import { Campo, ENTRADA, FormularioPerfil } from "@/components/formulario-perfil";
import { NivelBarra } from "@/components/nivel";
import { Aviso, Etiqueta, TituloSeccion } from "@/components/ui";
import {
  agregarCertificacion,
  eliminarCertificacion,
  guardarNiveles,
} from "@/lib/acciones";
import { leerInventario } from "@/lib/datos";
import {
  CATEGORIAS,
  estadoCertificacion,
  nivelEn,
  nivelEtiqueta,
} from "@/lib/skills";
import type { Inventario, Persona } from "@/lib/tipos";

/**
 * Edición del perfil (menú 1 del pitch), en las tres pestañas que pide:
 * los datos, la calificación por skill y las certificaciones con su vigencia.
 */
const TABS = [
  { id: "perfil", etiqueta: "Datos del perfil" },
  { id: "habilidades", etiqueta: "Calificar habilidades" },
  { id: "certificaciones", etiqueta: "Certificaciones" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default async function EditarPersona({
  params,
  searchParams,
}: PageProps<"/persona/[id]/editar">) {
  const { id } = await params;
  const { tab, guardado } = await searchParams;
  const activa: Tab = TABS.find((t) => t.id === tab)?.id ?? "perfil";

  const inventario = await leerInventario();
  const persona = inventario.personas.find((p) => p.id === id);
  if (!persona) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href={`/persona/${persona.id}`}
        className="text-sm text-acento hover:text-acento-claro"
      >
        ← Volver al perfil de {persona.nombre}
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-acento">
        Menú · Perfiles · Edición
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {persona.nombre}
      </h1>
      <p className="mt-1 text-tinta-3">
        {persona.rol} · {persona.equipo}
      </p>

      {guardado ? (
        <div className="mt-5 max-w-2xl">
          <Aviso tono="bien">
            Guardado en <code>data/colaboradores.json</code>.
          </Aviso>
        </div>
      ) : null}

      <nav className="mt-6 flex gap-1 border-b border-linea-suave">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/persona/${persona.id}/editar?tab=${t.id}`}
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

      {activa === "perfil" ? (
        <FormularioPerfil persona={persona} etiquetaBoton="Guardar perfil" />
      ) : null}
      {activa === "habilidades" ? (
        <Calificar persona={persona} inventario={inventario} />
      ) : null}
      {activa === "certificaciones" ? (
        <Certificaciones persona={persona} />
      ) : null}
    </main>
  );
}

function Calificar({
  persona,
  inventario,
}: {
  persona: Persona;
  inventario: Inventario;
}) {
  return (
    <form action={guardarNiveles} className="mt-6">
      <input type="hidden" name="id" value={persona.id} />

      <TituloSeccion nota="Escala 0–3 de la matriz de habilidades. El 0 no se guarda.">
        Calificación por habilidad
      </TituloSeccion>

      <div className="mt-4 space-y-6">
        {CATEGORIAS.map((categoria) => {
          const skills = inventario.skills.filter(
            (s) => s.categoria === categoria.id,
          );

          return (
            <section key={categoria.id}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-tinta-2">
                {categoria.nombre}
              </h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {skills.map((skill) => {
                  const nivel = nivelEn(persona, skill.id);
                  return (
                    <li
                      key={skill.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-linea bg-panel px-3 py-2"
                    >
                      <label
                        htmlFor={`nivel-${skill.id}`}
                        className="min-w-0 flex-1 truncate text-sm text-tinta-2"
                      >
                        {skill.nombre}
                      </label>
                      <NivelBarra nivel={nivel} />
                      <select
                        id={`nivel-${skill.id}`}
                        name={`nivel-${skill.id}`}
                        defaultValue={nivel}
                        aria-label={`Nivel de ${skill.nombre}`}
                        className="shrink-0 rounded-md border border-linea-fuerte bg-hueco px-2 py-1 text-xs text-tinta focus:border-acento focus:outline-none"
                      >
                        {inventario.escala.map((e) => (
                          <option key={e.nivel} value={e.nivel}>
                            {e.nivel} · {e.corto}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-acento/30 bg-hueco/95 p-4 backdrop-blur">
        <p className="text-sm text-tinta-3">
          {inventario.escala
            .map((e) => `${e.nivel} ${nivelEtiqueta(inventario.escala, e.nivel)}`)
            .join(" · ")}
        </p>
        <button
          type="submit"
          className="rounded-lg bg-acento px-5 py-2.5 font-bold text-fondo transition hover:bg-acento-claro"
        >
          Guardar calificación
        </button>
      </div>
    </form>
  );
}

function Certificaciones({ persona }: { persona: Persona }) {
  const ordenadas = [...persona.certificaciones].sort((a, b) =>
    a.vence.localeCompare(b.vence),
  );

  return (
    <section className="mt-6">
      <TituloSeccion nota="La vigencia se calcula de la fecha de vencimiento; el adjunto se registra por nombre.">
        Certificaciones de {persona.nombre}
      </TituloSeccion>

      {ordenadas.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {ordenadas.map((cert) => {
            const estado = estadoCertificacion(cert);
            return (
              <li
                key={cert.nombre}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-linea bg-panel px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{cert.nombre}</p>
                  <p className="text-xs text-tinta-3">
                    emitida {cert.emitida} · vence {cert.vence} ·{" "}
                    {cert.archivo ?? "sin adjunto"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Etiqueta
                    tono={
                      estado === "vigente"
                        ? "bien"
                        : estado === "por-vencer"
                          ? "aviso"
                          : "alerta"
                    }
                  >
                    {estado === "por-vencer" ? "por vencer" : estado}
                  </Etiqueta>
                  <form action={eliminarCertificacion}>
                    <input type="hidden" name="id" value={persona.id} />
                    <input type="hidden" name="nombre" value={cert.nombre} />
                    <button
                      type="submit"
                      className="text-xs text-alerta hover:text-alerta"
                    >
                      eliminar
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-tinta-4">
          Sin certificaciones registradas.
        </p>
      )}

      <form
        action={agregarCertificacion}
        className="mt-8 max-w-2xl space-y-4 rounded-xl border border-linea bg-hueco p-5"
      >
        <input type="hidden" name="id" value={persona.id} />
        <h3 className="font-bold">Agregar certificación</h3>

        <Campo etiqueta="Nombre de la certificación">
          <input
            name="nombre"
            required
            placeholder="Infoblox Core DDI Associate"
            className={ENTRADA}
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Emitida">
            <input type="date" name="emitida" className={ENTRADA} />
          </Campo>
          <Campo etiqueta="Vence">
            <input type="date" name="vence" required className={ENTRADA} />
          </Campo>
        </div>

        <Campo
          etiqueta="Archivo adjunto"
          nota="Nombre del diploma. El prototipo no sube el archivo."
        >
          <input
            name="archivo"
            placeholder="marvin-infoblox-associate.pdf"
            className={ENTRADA}
          />
        </Campo>

        <button
          type="submit"
          className="rounded-lg bg-acento px-5 py-2.5 font-bold text-fondo transition hover:bg-acento-claro"
        >
          Agregar certificación
        </button>
      </form>
    </section>
  );
}
