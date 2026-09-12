import Link from "next/link";

import { BotonImprimir } from "@/components/boton-imprimir";
import { Disponibilidad, NivelBarra } from "@/components/nivel";
import { buscar } from "@/lib/buscar";
import { leerInventario } from "@/lib/datos";
import {
  CATEGORIAS,
  certificacionesVigentes,
  nivelCorto,
  punteoMaximo,
  punteosPorCategoria,
  skillsPorCategoria,
} from "@/lib/skills";
import type { Candidato, EscalaNivel, Persona, Skill } from "@/lib/tipos";

/** ?ids=a&ids=b, o ?ids=a. Se acepta también "a,b" por si se pega a mano. */
function listaDeIds(valor: string | string[] | undefined): string[] {
  const crudos = Array.isArray(valor) ? valor : valor ? [valor] : [];
  return [...new Set(crudos.flatMap((v) => v.split(",")).map((v) => v.trim()))]
    .filter(Boolean);
}

function fechaLarga(): string {
  return new Date().toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function Reporte({ searchParams }: PageProps<"/reporte">) {
  const { q, ids } = await searchParams;
  const consulta = typeof q === "string" ? q : "";
  const seleccionados = listaDeIds(ids);

  const inventario = await leerInventario();
  const resultado = consulta.trim() ? buscar(inventario, consulta) : null;

  const candidatoPorId = new Map<string, Candidato>(
    (resultado?.candidatos ?? []).map((c) => [c.persona.id, c]),
  );
  const personas = seleccionados
    .map((id) => inventario.personas.find((p) => p.id === id))
    .filter((p): p is Persona => p !== undefined);

  const volverA = consulta
    ? `/buscar?q=${encodeURIComponent(consulta)}`
    : "/buscar";

  return (
    <main className="min-h-screen bg-papel text-tinta-papel">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-8 pt-6 print:hidden">
        <Link href={volverA} className="text-sm text-acento-fuerte hover:underline">
          ← Volver al buscador
        </Link>
        {personas.length > 0 ? <BotonImprimir claro /> : null}
      </div>

      {personas.length === 0 ? (
        <div className="mx-auto max-w-3xl px-8 py-16">
          <h1 className="text-2xl font-bold">Ficha de capacidades</h1>
          <p className="mt-3 text-tinta-papel-2">
            No hay candidatos seleccionados. Volvé al buscador, marcá a las
            personas que quieras incluir y generá la ficha desde ahí.
          </p>
        </div>
      ) : (
        <article className="mx-auto max-w-3xl px-8 py-8 print:px-0 print:py-0">
          <header className="border-b-2 border-linea-papel pb-4">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-tinta-papel-3">
                ES Consulting · ProdigiES
              </p>
              <p className="text-xs text-tinta-papel-3">{fechaLarga()}</p>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Ficha de capacidades
            </h1>
            <p className="mt-1 text-sm text-tinta-papel-2">
              Anexo de propuesta — perfil del personal propuesto y su nivel en
              los requisitos de la oportunidad.
            </p>
          </header>

          {resultado && resultado.requisitos.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-tinta-papel-3">
                Requisitos de la oportunidad
              </h2>
              <p className="mt-1 text-lg font-semibold">
                {resultado.requisitos.map((r) => r.etiqueta).join(" + ")}
              </p>
              <p className="mt-1 text-xs text-tinta-papel-3">
                Consulta original: “{consulta}”
              </p>
            </section>
          ) : null}

          <div className="mt-8 space-y-8">
            {personas.map((persona) => (
              <FichaPersona
                key={persona.id}
                persona={persona}
                candidato={candidatoPorId.get(persona.id)}
                escala={inventario.escala}
                catalogo={inventario.skills}
              />
            ))}
          </div>

          <footer className="mt-10 border-t border-linea-papel pt-4 text-xs text-tinta-papel-3">
            <p>
              <strong className="text-tinta-papel-2">Validación requerida:</strong>{" "}
              el líder del equipo confirma la disponibilidad real y Comercial
              valida el perfil antes de que esta ficha salga en una propuesta.
              ProdigiES propone; la gente decide.
            </p>
            <p className="mt-2">
              Escala 0–3 de la matriz de habilidades:{" "}
              {inventario.escala.map((e) => `${e.nivel} ${e.etiqueta}`).join(" · ")}
              .
            </p>
            <p className="mt-2">
              Documento generado por ProdigiES (prototipo de hackathon) con
              datos de demostración — ninguna persona real de ES Consulting
              aparece con sus datos.
            </p>
          </footer>
        </article>
      )}
    </main>
  );
}

function FichaPersona({
  persona,
  candidato,
  escala,
  catalogo,
}: {
  persona: Persona;
  candidato: Candidato | undefined;
  escala: EscalaNivel[];
  catalogo: Skill[];
}) {
  const punteos = punteosPorCategoria(persona, catalogo);
  const porCategoria = skillsPorCategoria(persona, catalogo);
  const vigentes = certificacionesVigentes(persona);
  const destacadas = CATEGORIAS.flatMap((c) => porCategoria[c.id])
    .filter((s) => s.nivel === 3)
    .slice(0, 8);

  return (
    <section className="break-inside-avoid rounded-lg border border-linea-papel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{persona.nombre}</h2>
          <p className="text-sm text-tinta-papel-2">
            {persona.rol} · {persona.equipo}
          </p>
        </div>
        {candidato ? (
          <p className="text-sm text-tinta-papel-2">
            Match{" "}
            <strong className="text-lg text-tinta-papel">
              {candidato.score}
            </strong>{" "}
            / 100
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-tinta-papel-2">
        <Disponibilidad pct={persona.disponibilidad} claro />
        <span>Idiomas: {persona.idiomas.join(", ")}</span>
        <span>
          Punteo —{" "}
          {CATEGORIAS.map(
            (c) =>
              `${c.nombre.toLowerCase()} ${punteos[c.id]}/${punteoMaximo(c.id, catalogo)}`,
          ).join(" · ")}
        </span>
      </div>

      {candidato ? (
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-linea-papel text-left text-xs uppercase tracking-wider text-tinta-papel-3">
              <th className="py-1.5 font-semibold">Requisito</th>
              <th className="py-1.5 font-semibold">Nivel</th>
              <th className="py-1.5 font-semibold">Certificación vigente</th>
            </tr>
          </thead>
          <tbody>
            {candidato.coberturas.map((cob) => (
              <tr
                key={cob.requisito.etiqueta}
                className="border-b border-linea-papel"
              >
                <td className="py-1.5">{cob.requisito.etiqueta}</td>
                <td className="py-1.5">
                  <span className="inline-flex items-center gap-2">
                    <NivelBarra nivel={cob.nivel} claro />
                    <span>
                      {cob.nivel} · {nivelCorto(escala, cob.nivel)}
                    </span>
                  </span>
                </td>
                <td className="py-1.5 text-tinta-papel-2">
                  {cob.certificacion
                    ? `${cob.certificacion.nombre} (vence ${cob.certificacion.vence})`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {destacadas.length > 0 ? (
        <p className="mt-4 text-sm">
          <span className="font-semibold">Fortalezas (nivel 3):</span>{" "}
          <span className="text-tinta-papel-2">
            {destacadas.map((s) => s.skill.nombre).join(", ")}
          </span>
        </p>
      ) : null}

      <p className="mt-2 text-sm">
        <span className="font-semibold">Certificaciones vigentes:</span>{" "}
        <span className="text-tinta-papel-2">
          {vigentes.length > 0
            ? vigentes.map((c) => `${c.nombre} (${c.vence})`).join(", ")
            : "ninguna registrada"}
        </span>
      </p>
    </section>
  );
}
