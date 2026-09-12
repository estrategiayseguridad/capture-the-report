import Link from "next/link";

import { Campo, ENTRADA } from "@/components/formulario-perfil";
import { Aviso, NotaDemo, Tile, TituloSeccion } from "@/components/ui";
import { crearSkill, eliminarSkill, renombrarSkill } from "@/lib/acciones";
import { coberturaPorSkill } from "@/lib/analitica";
import { leerInventario } from "@/lib/datos";
import { CATEGORIAS } from "@/lib/skills";
import type { Inventario, Skill } from "@/lib/tipos";

/**
 * Catálogo de habilidades (menú 2 del pitch): agregar, editar y eliminar,
 * seccionado en técnicas, soluciones y habilidades blandas. Es la lista contra
 * la que se califica a la gente y contra la que busca el motor, así que
 * cambiarla aquí cambia todo lo demás.
 */
export const metadata = {
  title: "Catálogo de habilidades · ProdigiES",
};

export default async function Catalogo({
  searchParams,
}: PageProps<"/catalogo">) {
  const { categoria, guardado } = await searchParams;
  const inventario = await leerInventario();

  const uso = new Map(
    coberturaPorSkill(inventario).map((c) => [c.skill.id, c]),
  );
  const preseleccion =
    CATEGORIAS.find((c) => c.id === categoria)?.id ?? "technical";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-acento">
        Menú · Catálogo
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Habilidades que medimos
      </h1>
      <p className="mt-2 max-w-3xl text-tinta-2">
        La matriz se califica contra esta lista, con la escala{" "}
        <strong>0 a 3</strong>. Si aparece una solución nueva de fabricante, se
        agrega aquí y desde ese momento se puede calificar y buscar.
      </p>

      {guardado ? (
        <div className="mt-5 max-w-2xl">
          <Aviso tono="bien">
            Catálogo actualizado en <code>data/colaboradores.json</code>.
          </Aviso>
        </div>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile valor={inventario.skills.length} etiqueta="Habilidades" />
        {CATEGORIAS.map((c) => (
          <Tile
            key={c.id}
            valor={inventario.skills.filter((s) => s.categoria === c.id).length}
            etiqueta={c.nombre}
          />
        ))}
      </section>

      <section className="mt-8">
        <TituloSeccion nota="Queda disponible de inmediato para calificar y para el buscador.">
          Agregar habilidad
        </TituloSeccion>

        <form
          action={crearSkill}
          className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-linea bg-hueco p-5"
        >
          <div className="min-w-64 flex-1">
            <Campo etiqueta="Nombre">
              <input
                name="nombre"
                required
                placeholder="Fortinet SD-WAN"
                className={ENTRADA}
              />
            </Campo>
          </div>

          <div className="min-w-48">
            <Campo etiqueta="Categoría">
              <select
                name="categoria"
                defaultValue={preseleccion}
                className={ENTRADA}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-acento px-5 py-2.5 font-bold text-fondo transition hover:bg-acento-claro"
          >
            Agregar
          </button>
        </form>
      </section>

      {CATEGORIAS.map((categoriaSkill) => (
        <SeccionCategoria
          key={categoriaSkill.id}
          categoria={categoriaSkill}
          inventario={inventario}
          uso={uso}
        />
      ))}

      <NotaDemo generado={inventario.generado} />
    </main>
  );
}

type Uso = Map<string, { personas: number; avanzados: number; certificados: number }>;

function SeccionCategoria({
  categoria,
  inventario,
  uso,
}: {
  categoria: (typeof CATEGORIAS)[number];
  inventario: Inventario;
  uso: Uso;
}) {
  const skills = inventario.skills
    .filter((s) => s.categoria === categoria.id)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <section className="mt-10">
      <TituloSeccion nota={categoria.nota}>
        {categoria.nombre} · {skills.length}
      </TituloSeccion>

      <ul className="mt-4 space-y-2">
        {skills.map((skill) => (
          <li key={skill.id}>
            <FilaSkill skill={skill} uso={uso} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilaSkill({ skill, uso }: { skill: Skill; uso: Uso }) {
  const datos = uso.get(skill.id);
  const personas = datos?.personas ?? 0;

  return (
    <div className="rounded-xl border border-linea bg-panel px-4 py-3">
      <form
        action={renombrarSkill}
        className="flex flex-wrap items-center gap-3"
      >
        <input type="hidden" name="skillId" value={skill.id} />

        <input
          name="nombre"
          defaultValue={skill.nombre}
          aria-label={`Nombre de ${skill.nombre}`}
          className="min-w-56 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-tinta hover:border-linea-fuerte focus:border-acento focus:bg-hueco focus:outline-none"
        />

        <select
          name="categoria"
          defaultValue={skill.categoria}
          aria-label={`Categoría de ${skill.nombre}`}
          className="rounded-lg border border-linea-fuerte bg-hueco px-2 py-1.5 text-xs text-tinta-2 focus:border-acento focus:outline-none"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <span className="w-44 shrink-0 text-xs text-tinta-4">
          {personas === 0 ? (
            <span className="text-aviso">nadie la tiene</span>
          ) : (
            <>
              {personas} personas · {datos?.avanzados ?? 0} avanzados
            </>
          )}
        </span>

        <button
          type="submit"
          className="rounded-lg border border-linea-fuerte px-3 py-1.5 text-xs font-semibold text-tinta-2 transition hover:border-acento hover:text-acento-claro"
        >
          Guardar
        </button>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
        <Link
          href={`/buscar?q=${encodeURIComponent(skill.nombre)}`}
          className="text-acento hover:text-acento-claro"
        >
          ver quién la tiene →
        </Link>

        <form action={eliminarSkill}>
          <input type="hidden" name="skillId" value={skill.id} />
          <button
            type="submit"
            className="text-alerta hover:text-alerta"
            title={
              personas > 0
                ? `Se borra también la calificación de ${personas} personas`
                : undefined
            }
          >
            eliminar
            {personas > 0 ? ` (borra ${personas} calificaciones)` : ""}
          </button>
        </form>
      </div>
    </div>
  );
}
