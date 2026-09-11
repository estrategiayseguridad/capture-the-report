import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  Inventario,
  InventarioGuardado,
  Persona,
  PersonaGuardada,
  Proyecto,
} from "./tipos";

const RUTA = path.join(process.cwd(), "data", "colaboradores.json");

let cache: Inventario | null = null;
/** mtime del archivo cuando se llenó el cache. */
let cacheMtime = 0;

/** % comprometido de una persona: solo cuentan los proyectos en ejecución. */
export function cargaDe(proyectos: Proyecto[], personaId: string): number {
  return proyectos
    .filter((p) => p.estado === "en-ejecucion")
    .flatMap((p) => p.asignaciones)
    .filter((a) => a.personaId === personaId)
    .reduce((acc, a) => acc + a.dedicacion, 0);
}

/**
 * Deriva carga y disponibilidad de cada persona a partir de las asignaciones.
 * Es el enganche del escenario del pitch: cuando PM asigna a alguien a un
 * proyecto, su disponibilidad baja en todas las pantallas sin tocar el perfil.
 */
function derivar(guardado: InventarioGuardado): Inventario {
  return {
    ...guardado,
    personas: guardado.personas.map((persona) => {
      const carga = cargaDe(guardado.proyectos, persona.id);
      return { ...persona, carga, disponibilidad: 100 - carga };
    }),
  };
}

/**
 * Lee el inventario de `data/colaboradores.json`.
 * Sin base de datos: un JSON en el repo, cacheado en memoria. El cache se
 * invalida si el archivo cambió por fuera, así que `npm run seed` entre ensayos
 * se ve de inmediato sin reiniciar el servidor.
 */
export async function leerInventario(): Promise<Inventario> {
  const mtime = (await stat(RUTA)).mtimeMs;
  if (cache && mtime === cacheMtime) return cache;

  const guardado = JSON.parse(
    await readFile(RUTA, "utf-8"),
  ) as InventarioGuardado;
  cache = derivar(guardado);
  cacheMtime = mtime;
  return cache;
}

export async function leerPersona(id: string): Promise<Persona | null> {
  const inventario = await leerInventario();
  return inventario.personas.find((p) => p.id === id) ?? null;
}

export async function leerProyecto(id: string): Promise<Proyecto | null> {
  const inventario = await leerInventario();
  return inventario.proyectos.find((p) => p.id === id) ?? null;
}

/**
 * Guarda el inventario de vuelta en el JSON. La carga y la disponibilidad no
 * se persisten: son derivadas, y volverlas a escribir las desincronizaría.
 *
 * `npm run seed` deja el archivo como estaba antes de la demo.
 */
export async function guardarInventario(inventario: Inventario): Promise<void> {
  const guardado: InventarioGuardado = {
    nota: inventario.nota,
    generado: inventario.generado,
    escala: inventario.escala,
    skills: inventario.skills,
    personas: inventario.personas.map((persona) => {
      const { carga: _carga, disponibilidad: _disp, ...resto } = persona;
      return resto satisfies PersonaGuardada;
    }),
    proyectos: inventario.proyectos,
    historial: inventario.historial,
  };

  await writeFile(RUTA, `${JSON.stringify(guardado, null, 2)}\n`, "utf-8");
  cache = derivar(guardado);
  cacheMtime = (await stat(RUTA)).mtimeMs;
}

/**
 * Lee, deja mutar y guarda en un solo paso. Sin transacciones ni bloqueos: es
 * un prototipo de un solo usuario contra un archivo.
 */
export async function actualizarInventario(
  mutar: (inventario: Inventario) => void,
): Promise<Inventario> {
  const inventario = structuredClone(await leerInventario());
  mutar(inventario);
  await guardarInventario(inventario);
  return cache!;
}
