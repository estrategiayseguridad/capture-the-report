import { guardarPerfil } from "@/lib/acciones";
import { EQUIPOS } from "@/lib/tipos";
import type { Persona } from "@/lib/tipos";

/**
 * Los campos del perfil que pide el pitch: Nombre, Posición, Área,
 * Descripción, Nivel de educación y foto. Sirve para el alta y para la edición
 * — con `persona` viene precargado, sin ella es un alta nueva.
 */
export function FormularioPerfil({
  persona,
  etiquetaBoton,
}: {
  persona?: Persona;
  etiquetaBoton: string;
}) {
  return (
    <form action={guardarPerfil} className="mt-6 max-w-2xl space-y-4">
      {persona ? <input type="hidden" name="id" value={persona.id} /> : null}

      <Campo etiqueta="Nombre" nota="Como aparece en la propuesta.">
        <input
          name="nombre"
          required
          defaultValue={persona?.nombre}
          placeholder="Nombre y apellido"
          className={ENTRADA}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Posición">
          <input
            name="rol"
            required
            defaultValue={persona?.rol}
            placeholder="Ingeniero de Soluciones"
            className={ENTRADA}
          />
        </Campo>

        <Campo etiqueta="Área">
          <select
            name="equipo"
            required
            defaultValue={persona?.equipo ?? "Ingeniería"}
            className={ENTRADA}
          >
            {EQUIPOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo
        etiqueta="Descripción"
        nota="Qué hace y para qué se le busca. Sale en el CV y en la ficha."
      >
        <textarea
          name="descripcion"
          rows={4}
          defaultValue={persona?.descripcion}
          placeholder="Traduce el requerimiento del cliente a una solución de fabricante…"
          className={ENTRADA}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nivel de educación">
          <input
            name="educacion"
            defaultValue={persona?.educacion}
            placeholder="Ingeniería en Sistemas"
            className={ENTRADA}
          />
        </Campo>

        <Campo etiqueta="Fecha de ingreso">
          <input
            type="date"
            name="ingreso"
            defaultValue={persona?.ingreso}
            className={ENTRADA}
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Idiomas" nota="Separados por coma.">
          <input
            name="idiomas"
            defaultValue={persona?.idiomas.join(", ")}
            placeholder="Español, Inglés técnico"
            className={ENTRADA}
          />
        </Campo>

        <Campo
          etiqueta="Foto (URL)"
          nota="Opcional. Sin foto se dibujan las iniciales."
        >
          <input
            name="foto"
            defaultValue={persona?.foto ?? ""}
            placeholder="https://…"
            className={ENTRADA}
          />
        </Campo>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-cyan-400 px-5 py-2.5 font-bold text-[#0a1030] transition hover:bg-cyan-300"
      >
        {etiquetaBoton}
      </button>
    </form>
  );
}

const ENTRADA =
  "mt-1 w-full rounded-lg border border-slate-600 bg-[#111a42] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none";

export function Campo({
  etiqueta,
  nota,
  children,
}: {
  etiqueta: string;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-200">{etiqueta}</span>
      {nota ? <span className="ml-2 text-xs text-slate-500">{nota}</span> : null}
      {children}
    </label>
  );
}

export { ENTRADA };
