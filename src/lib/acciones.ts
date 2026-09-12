"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actualizarInventario } from "./datos";
import { hoyISO, normalizar } from "./skills";
import { EQUIPOS, NIVEL_MAX } from "./tipos";
import type {
  CategoriaSkill,
  Certificacion,
  Equipo,
  EstadoProyecto,
  Nivel,
  Persona,
} from "./tipos";

/**
 * Las escrituras del prototipo. Todas caen en `data/colaboradores.json` —
 * sin base de datos, como pide la regla del evento. `npm run seed` restaura el
 * archivo al estado con el que se ensaya la demo.
 */

const CATEGORIAS_VALIDAS: CategoriaSkill[] = ["technical", "solutions", "soft"];

function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

function requerido(formData: FormData, campo: string): string {
  const valor = texto(formData, campo);
  if (!valor) throw new Error(`Falta el campo obligatorio "${campo}".`);
  return valor;
}

function nivelDe(valor: FormDataEntryValue | null): Nivel {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 0 || n > NIVEL_MAX) return 0;
  return n as Nivel;
}

/** `id` a partir del nombre: minúsculas, sin acentos, con guiones. */
function slug(nombre: string): string {
  return normalizar(nombre)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Un id que no choque con los que ya existen. */
function idLibre(base: string, tomados: Set<string>): string {
  if (!tomados.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidato = `${base}-${i}`;
    if (!tomados.has(candidato)) return candidato;
  }
}

function equipoDe(valor: string): Equipo {
  const equipo = EQUIPOS.find((e) => e === valor);
  if (!equipo) throw new Error(`Área desconocida: "${valor}".`);
  return equipo;
}

function refrescar() {
  // Todas las pantallas leen el mismo inventario: se revalida el árbol entero.
  revalidatePath("/", "layout");
}

// ── Menú 1 · perfil del colaborador ────────────────────────────────────────

/**
 * Alta o edición del perfil. Con `id` vacío crea; con `id` actualiza y deja
 * intactos los niveles y las certificaciones (esos se editan en su propia
 * pestaña, como pide el pitch).
 */
export async function guardarPerfil(formData: FormData): Promise<void> {
  const id = texto(formData, "id");
  const nombre = requerido(formData, "nombre");
  const equipo = equipoDe(requerido(formData, "equipo"));
  const rol = requerido(formData, "rol");

  const campos = {
    nombre,
    equipo,
    rol,
    descripcion: texto(formData, "descripcion"),
    educacion: texto(formData, "educacion"),
    ingreso: texto(formData, "ingreso") || hoyISO(),
    foto: texto(formData, "foto") || null,
    idiomas: texto(formData, "idiomas")
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean),
  };

  let destino = id;

  await actualizarInventario((inventario) => {
    if (id) {
      const persona = inventario.personas.find((p) => p.id === id);
      if (!persona) throw new Error(`No existe el colaborador "${id}".`);
      Object.assign(persona, campos);
      return;
    }

    const tomados = new Set(inventario.personas.map((p) => p.id));
    const prefijo =
      { Ingeniería: "inge", CSC: "csc", Consulting: "cons" }[equipo] ?? "col";
    destino = idLibre(`${prefijo}-${slug(nombre)}`, tomados);

    // carga y disponibilidad son derivadas: se recalculan al guardar.
    const nueva: Persona = {
      id: destino,
      ...campos,
      origen: "alta-en-plataforma",
      skills: [],
      certificaciones: [],
      carga: 0,
      disponibilidad: 100,
    };
    inventario.personas.push(nueva);
  });

  refrescar();
  redirect(`/persona/${destino}/editar?tab=habilidades&guardado=1`);
}

/** Calificación de la persona en cada skill del catálogo (menú 1b). */
export async function guardarNiveles(formData: FormData): Promise<void> {
  const id = requerido(formData, "id");

  await actualizarInventario((inventario) => {
    const persona = inventario.personas.find((p) => p.id === id);
    if (!persona) throw new Error(`No existe el colaborador "${id}".`);

    persona.skills = inventario.skills
      .map((skill) => ({
        skillId: skill.id,
        nivel: nivelDe(formData.get(`nivel-${skill.id}`)),
      }))
      // El 0 no se guarda: si el skill no aparece, es 0.
      .filter((ps) => ps.nivel > 0)
      .sort((a, b) => a.skillId.localeCompare(b.skillId));
  });

  refrescar();
  redirect(`/persona/${id}?guardado=1`);
}

/** Alta de una certificación con su vigencia y su adjunto (menú 1a). */
export async function agregarCertificacion(formData: FormData): Promise<void> {
  const id = requerido(formData, "id");
  const certificacion: Certificacion = {
    nombre: requerido(formData, "nombre"),
    emitida: texto(formData, "emitida") || hoyISO(),
    vence: requerido(formData, "vence"),
    archivo: texto(formData, "archivo") || null,
  };

  await actualizarInventario((inventario) => {
    const persona = inventario.personas.find((p) => p.id === id);
    if (!persona) throw new Error(`No existe el colaborador "${id}".`);

    persona.certificaciones = [
      ...persona.certificaciones.filter(
        (c) => c.nombre !== certificacion.nombre,
      ),
      certificacion,
    ].sort((a, b) => a.vence.localeCompare(b.vence));
  });

  refrescar();
  redirect(`/persona/${id}/editar?tab=certificaciones&guardado=1`);
}

export async function eliminarCertificacion(formData: FormData): Promise<void> {
  const id = requerido(formData, "id");
  const nombre = requerido(formData, "nombre");

  await actualizarInventario((inventario) => {
    const persona = inventario.personas.find((p) => p.id === id);
    if (!persona) throw new Error(`No existe el colaborador "${id}".`);
    persona.certificaciones = persona.certificaciones.filter(
      (c) => c.nombre !== nombre,
    );
  });

  refrescar();
  redirect(`/persona/${id}/editar?tab=certificaciones`);
}

// ── Menú 2 · catálogo de habilidades ───────────────────────────────────────

export async function crearSkill(formData: FormData): Promise<void> {
  const nombre = requerido(formData, "nombre");
  const categoria = requerido(formData, "categoria") as CategoriaSkill;
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw new Error(`Categoría desconocida: "${categoria}".`);
  }

  await actualizarInventario((inventario) => {
    const tomados = new Set(inventario.skills.map((s) => s.id));
    inventario.skills.push({
      id: idLibre(slug(nombre), tomados),
      nombre,
      categoria,
    });
  });

  refrescar();
  redirect(`/catalogo?categoria=${categoria}&guardado=1`);
}

export async function renombrarSkill(formData: FormData): Promise<void> {
  const skillId = requerido(formData, "skillId");
  const nombre = requerido(formData, "nombre");
  const categoria = requerido(formData, "categoria") as CategoriaSkill;
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    throw new Error(`Categoría desconocida: "${categoria}".`);
  }

  await actualizarInventario((inventario) => {
    const skill = inventario.skills.find((s) => s.id === skillId);
    if (!skill) throw new Error(`No existe la habilidad "${skillId}".`);
    skill.nombre = nombre;
    skill.categoria = categoria;
  });

  refrescar();
  redirect(`/catalogo?categoria=${categoria}&guardado=1`);
}

/** Borra el skill del catálogo y con él las calificaciones que colgaban. */
export async function eliminarSkill(formData: FormData): Promise<void> {
  const skillId = requerido(formData, "skillId");

  await actualizarInventario((inventario) => {
    inventario.skills = inventario.skills.filter((s) => s.id !== skillId);
    for (const persona of inventario.personas) {
      persona.skills = persona.skills.filter((ps) => ps.skillId !== skillId);
    }
  });

  refrescar();
  redirect("/catalogo");
}

// ── Menú 6 · carga laboral y asignaciones ──────────────────────────────────

/**
 * PM asigna a alguien a un proyecto. Baja su disponibilidad en todas las
 * pantallas — es el paso 3 del escenario del pitch.
 */
export async function asignarAProyecto(formData: FormData): Promise<void> {
  const proyectoId = requerido(formData, "proyectoId");
  const personaId = requerido(formData, "personaId");
  const rolProyecto = texto(formData, "rolProyecto") || "Consultor asignado";
  const dedicacion = Math.max(
    0,
    Math.min(100, Number(texto(formData, "dedicacion") || "0")),
  );

  await actualizarInventario((inventario) => {
    const proyecto = inventario.proyectos.find((p) => p.id === proyectoId);
    if (!proyecto) throw new Error(`No existe el proyecto "${proyectoId}".`);
    if (!inventario.personas.some((p) => p.id === personaId)) {
      throw new Error(`No existe el colaborador "${personaId}".`);
    }

    proyecto.asignaciones = [
      ...proyecto.asignaciones.filter((a) => a.personaId !== personaId),
      { personaId, rolProyecto, dedicacion },
    ].sort((a, b) => b.dedicacion - a.dedicacion);
  });

  refrescar();
  redirect(`/proyecto/${proyectoId}?guardado=1`);
}

export async function quitarAsignacion(formData: FormData): Promise<void> {
  const proyectoId = requerido(formData, "proyectoId");
  const personaId = requerido(formData, "personaId");

  await actualizarInventario((inventario) => {
    const proyecto = inventario.proyectos.find((p) => p.id === proyectoId);
    if (!proyecto) throw new Error(`No existe el proyecto "${proyectoId}".`);
    proyecto.asignaciones = proyecto.asignaciones.filter(
      (a) => a.personaId !== personaId,
    );
  });

  refrescar();
  redirect(`/proyecto/${proyectoId}`);
}

const ESTADOS: EstadoProyecto[] = ["oportunidad", "en-ejecucion", "cerrado"];

/**
 * Adjudicar (oportunidad → en ejecución) o cerrar. Solo lo que está en
 * ejecución consume carga, así que este botón es el que mueve la cargabilidad.
 */
export async function cambiarEstadoProyecto(formData: FormData): Promise<void> {
  const proyectoId = requerido(formData, "proyectoId");
  const estado = requerido(formData, "estado") as EstadoProyecto;
  if (!ESTADOS.includes(estado)) {
    throw new Error(`Estado desconocido: "${estado}".`);
  }

  await actualizarInventario((inventario) => {
    const proyecto = inventario.proyectos.find((p) => p.id === proyectoId);
    if (!proyecto) throw new Error(`No existe el proyecto "${proyectoId}".`);
    proyecto.estado = estado;
  });

  refrescar();
  redirect(`/proyecto/${proyectoId}?guardado=1`);
}
