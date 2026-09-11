import { cargaDe } from "./datos";
import {
  DIAS_POR_VENCER,
  certificacionDelSkill,
  diasHasta,
  estadoCertificacion,
  hoyISO,
  nivelEn,
} from "./skills";
import { EQUIPOS } from "./tipos";
import type {
  CategoriaSkill,
  Certificacion,
  Equipo,
  Inventario,
  Persona,
  Proyecto,
  Skill,
} from "./tipos";

/**
 * Las agregaciones del dashboard y de los reportes por área (menús 7 y 8 del
 * pitch). Todo se calcula del inventario en memoria: no hay tablas de
 * resumen que se puedan desincronizar.
 */

// ── Cobertura de un skill en la organización ────────────────────────────────

export type CoberturaSkill = {
  skill: Skill;
  /** Cuántas personas lo tienen en nivel ≥ 1. */
  personas: number;
  /** Cuántas lo tienen en nivel 3 (pueden liderar y entrenar). */
  avanzados: number;
  /** Cuántas lo respaldan con certificación vigente. */
  certificados: number;
  /** Suma de niveles: el "punteo" del skill en el grupo. */
  punteo: number;
  /** Promedio de nivel entre quienes lo tienen. 0 si nadie. */
  promedio: number;
};

/**
 * Cuánta gente cubre cada skill del catálogo, opcionalmente restringido a un
 * área. Es la base del top 10 del dashboard y del reporte de brechas.
 */
export function coberturaPorSkill(
  inventario: Inventario,
  area?: Equipo,
): CoberturaSkill[] {
  const personas = area
    ? inventario.personas.filter((p) => p.equipo === area)
    : inventario.personas;

  return inventario.skills
    .map((skill) => {
      const niveles = personas
        .map((p) => nivelEn(p, skill.id))
        .filter((n) => n > 0);
      const punteo = niveles.reduce((a, b) => a + b, 0);
      const certificados = personas.filter(
        (p) =>
          nivelEn(p, skill.id) > 0 && certificacionDelSkill(p, skill) !== null,
      ).length;

      return {
        skill,
        personas: niveles.length,
        avanzados: niveles.filter((n) => n === 3).length,
        certificados,
        punteo,
        promedio: niveles.length > 0 ? punteo / niveles.length : 0,
      };
    })
    .sort(
      (a, b) =>
        b.personas - a.personas ||
        b.punteo - a.punteo ||
        a.skill.nombre.localeCompare(b.skill.nombre),
    );
}

// ── Riesgo de conocimiento: brechas y puntos únicos de falla ────────────────

export type Brecha = CoberturaSkill & {
  /** Por qué aparece en el reporte de RRHH. */
  motivo: "nadie" | "una-sola-persona" | "sin-avanzado" | "sin-certificacion";
  /** 1 = lo más urgente. Ordena la lista. */
  prioridad: number;
};

const MOTIVOS: Record<Brecha["motivo"], { etiqueta: string; nota: string }> = {
  nadie: {
    etiqueta: "Nadie lo tiene",
    nota: "No se puede comprometer en una propuesta: hay que capacitar o contratar.",
  },
  "una-sola-persona": {
    etiqueta: "Una sola persona",
    nota: "Punto único de falla: si esa persona se va o se ocupa, el área queda sin cubrirlo.",
  },
  "sin-avanzado": {
    etiqueta: "Sin nivel avanzado",
    nota: "Hay gente que lo usa, pero nadie que pueda liderar, entrenar ni diseñar.",
  },
  "sin-certificacion": {
    etiqueta: "Sin certificación vigente",
    nota: "Se sabe hacer, pero no se puede acreditar en una licitación que la exija.",
  },
};

export function textoMotivo(motivo: Brecha["motivo"]) {
  return MOTIVOS[motivo];
}

/**
 * Dónde está flaca un área. Se evalúa contra el catálogo completo, así que un
 * skill de GRC sale como brecha de Ingeniería — por eso el reporte se lee por
 * área y no como un ranking global.
 */
export function brechasDelArea(
  inventario: Inventario,
  area: Equipo,
): Brecha[] {
  return coberturaPorSkill(inventario, area)
    .map((c): Brecha => {
      if (c.personas === 0) return { ...c, motivo: "nadie", prioridad: 1 };
      if (c.personas === 1)
        return { ...c, motivo: "una-sola-persona", prioridad: 2 };
      if (c.avanzados === 0)
        return { ...c, motivo: "sin-avanzado", prioridad: 3 };
      if (c.certificados === 0)
        return { ...c, motivo: "sin-certificacion", prioridad: 4 };
      return { ...c, motivo: "sin-certificacion", prioridad: 99 };
    })
    .filter((b) => b.prioridad < 99)
    .sort(
      (a, b) =>
        a.prioridad - b.prioridad ||
        a.skill.nombre.localeCompare(b.skill.nombre),
    );
}

/** Los skills más fuertes de un área: los que tienen gente y nivel. */
export function fortalezasDelArea(
  inventario: Inventario,
  area: Equipo,
  cuantas = 8,
): CoberturaSkill[] {
  return coberturaPorSkill(inventario, area)
    .filter((c) => c.personas > 0)
    .sort(
      (a, b) =>
        b.punteo - a.punteo ||
        b.avanzados - a.avanzados ||
        a.skill.nombre.localeCompare(b.skill.nombre),
    )
    .slice(0, cuantas);
}

// ── Certificaciones ────────────────────────────────────────────────────────

export type AvisoCertificacion = {
  persona: Persona;
  certificacion: Certificacion;
  dias: number;
  estado: "por-vencer" | "vencida";
};

/**
 * Certificaciones vencidas o que vencen dentro de la ventana de planificación.
 * Es la notificación a RRHH del escenario del pitch.
 */
export function certificacionesEnRiesgo(
  inventario: Inventario,
  hoy = hoyISO(),
): AvisoCertificacion[] {
  return inventario.personas
    .flatMap((persona) =>
      persona.certificaciones.map((certificacion) => ({
        persona,
        certificacion,
        dias: diasHasta(certificacion.vence, hoy),
        estado: estadoCertificacion(certificacion, hoy),
      })),
    )
    .filter(
      (a): a is AvisoCertificacion =>
        a.estado === "por-vencer" || a.estado === "vencida",
    )
    .sort((a, b) => a.dias - b.dias);
}

// ── Carga de trabajo ───────────────────────────────────────────────────────

export type CargaPersona = {
  persona: Persona;
  /** Proyectos en ejecución con su dedicación. */
  asignaciones: { proyecto: Proyecto; dedicacion: number; rolProyecto: string }[];
  carga: number;
  estado: "banca" | "holgada" | "ajustada" | "sobrecargada";
};

/** Cómo se lee un % de carga. La sobrecarga es > 100. */
export function estadoDeCarga(carga: number): CargaPersona["estado"] {
  if (carga === 0) return "banca";
  if (carga > 100) return "sobrecargada";
  return carga >= 90 ? "ajustada" : "holgada";
}

export const ETIQUETA_CARGA: Record<CargaPersona["estado"], string> = {
  banca: "En banca",
  holgada: "Con holgura",
  ajustada: "Ajustado",
  sobrecargada: "Sobrecargado",
};

/** Carga de cada persona, de la más cargada a la que está en banca. */
export function cargaDelEquipo(
  inventario: Inventario,
  area?: Equipo,
): CargaPersona[] {
  const proyectoPorId = new Map(inventario.proyectos.map((p) => [p.id, p]));

  return inventario.personas
    .filter((p) => !area || p.equipo === area)
    .map((persona) => {
      const asignaciones = inventario.proyectos
        .filter((p) => p.estado === "en-ejecucion")
        .flatMap((proyecto) =>
          proyecto.asignaciones
            .filter((a) => a.personaId === persona.id)
            .map((a) => ({
              proyecto: proyectoPorId.get(proyecto.id)!,
              dedicacion: a.dedicacion,
              rolProyecto: a.rolProyecto,
            })),
        )
        .sort((a, b) => b.dedicacion - a.dedicacion);

      const carga = cargaDe(inventario.proyectos, persona.id);
      return { persona, asignaciones, carga, estado: estadoDeCarga(carga) };
    })
    .sort(
      (a, b) => b.carga - a.carga || a.persona.nombre.localeCompare(b.persona.nombre),
    );
}

// ── Resumen por área, para el dashboard ────────────────────────────────────

export type ResumenArea = {
  area: Equipo;
  personas: number;
  proyectosEnEjecucion: number;
  oportunidades: number;
  /** Promedio de carga del área. */
  cargaPromedio: number;
  enBanca: number;
  punteos: Record<CategoriaSkill, number>;
};

export function resumenPorArea(inventario: Inventario): ResumenArea[] {
  const categoriaDeSkill = new Map(
    inventario.skills.map((s) => [s.id, s.categoria]),
  );

  return EQUIPOS.map((area) => {
    const personas = inventario.personas.filter((p) => p.equipo === area);
    const proyectos = inventario.proyectos.filter((p) => p.area === area);
    const punteos: Record<CategoriaSkill, number> = {
      technical: 0,
      solutions: 0,
      soft: 0,
    };

    for (const persona of personas) {
      for (const ps of persona.skills) {
        const categoria = categoriaDeSkill.get(ps.skillId);
        if (categoria) punteos[categoria] += ps.nivel;
      }
    }

    const cargaTotal = personas.reduce((acc, p) => acc + p.carga, 0);

    return {
      area,
      personas: personas.length,
      proyectosEnEjecucion: proyectos.filter((p) => p.estado === "en-ejecucion")
        .length,
      oportunidades: proyectos.filter((p) => p.estado === "oportunidad").length,
      cargaPromedio:
        personas.length > 0 ? Math.round(cargaTotal / personas.length) : 0,
      enBanca: personas.filter((p) => p.carga === 0).length,
      punteos,
    };
  });
}

// ── Dónde invertir en capacitación y certificación ─────────────────────────

export type Inversion = {
  skill: Skill;
  /** Qué hacer: capacitar gente nueva o certificar a quien ya sabe. */
  accion: "capacitar" | "certificar";
  /** A quién conviene, ya ordenado. */
  candidatos: Persona[];
  motivo: string;
};

/**
 * Recomendación del reporte de RRHH: en qué skills del área conviene gastar el
 * presupuesto de formación, y en quién.
 */
export function inversionRecomendada(
  inventario: Inventario,
  area: Equipo,
  cuantas = 6,
): Inversion[] {
  const personas = inventario.personas.filter((p) => p.equipo === area);

  return brechasDelArea(inventario, area)
    .filter((b) => b.motivo !== "nadie")
    .map((brecha): Inversion => {
      const conElSkill = personas
        .filter((p) => nivelEn(p, brecha.skill.id) > 0)
        .sort((a, b) => nivelEn(b, brecha.skill.id) - nivelEn(a, brecha.skill.id));

      if (brecha.motivo === "sin-certificacion") {
        return {
          skill: brecha.skill,
          accion: "certificar",
          candidatos: conElSkill.slice(0, 2),
          motivo: `${brecha.personas} personas lo manejan y ninguna lo tiene certificado.`,
        };
      }

      // Punto único de falla o sin avanzado → hay que sumar o subir gente.
      const aprendices = personas
        .filter((p) => nivelEn(p, brecha.skill.id) === 0)
        .sort((a, b) => b.disponibilidad - a.disponibilidad)
        .slice(0, 2);

      return {
        skill: brecha.skill,
        accion: "capacitar",
        candidatos: [...conElSkill.slice(0, 1), ...aprendices],
        motivo:
          brecha.motivo === "una-sola-persona"
            ? "Lo cubre una sola persona: hay que formar respaldo."
            : "Nadie llega a nivel avanzado: falta quien pueda liderar y entrenar.",
      };
    })
    .slice(0, cuantas);
}

// ── Histórico ──────────────────────────────────────────────────────────────

export type FilaHistorial = {
  mes: string;
  punteos: Record<CategoriaSkill, number>;
  total: number;
  /** Diferencia de total contra el mes anterior. */
  delta: number;
};

/** El histórico de un área, con la variación mes a mes ya calculada. */
export function historialDelArea(
  inventario: Inventario,
  area: Equipo,
): FilaHistorial[] {
  let previo: number | null = null;

  return inventario.historial.map((mes) => {
    const punteos = mes.punteos[area];
    const total = punteos.technical + punteos.solutions + punteos.soft;
    const delta = previo === null ? 0 : total - previo;
    previo = total;
    return { mes: mes.mes, punteos, total, delta };
  });
}

export { DIAS_POR_VENCER };
