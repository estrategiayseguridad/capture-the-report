/**
 * Modelo de la evaluación (lo que el auditor captura) y el cálculo de
 * cumplimiento que sube de control ─▶ objetivo ─▶ principio ─▶ global.
 */

import { PRINCIPIOS, TOTAL_CONTROLES } from "./lineamientos";

/** Nivel de clasificación: resultado binario de la revisión del control. */
export type Clasificacion = "cumple" | "no-cumple";

/**
 * Niveles de madurez. La posición en el arreglo ES la nota (0–5), por lo que la
 * "Nota nivel de madurez" nunca puede desalinearse del nivel seleccionado.
 */
export const NIVELES_MADUREZ = [
  "No controlable",
  "Inicio",
  "Repetible",
  "Definido",
  "Administrado",
  "Optimizado",
] as const;

export type NivelMadurez = (typeof NIVELES_MADUREZ)[number];

/** Nota 0–5 derivada del nivel de madurez (No controlable = 0 … Optimizado = 5). */
export function notaMadurez(nivel: NivelMadurez): number {
  return NIVELES_MADUREZ.indexOf(nivel);
}

export const NOTA_MADUREZ_MAXIMA = NIVELES_MADUREZ.length - 1;

/** Lo capturado para un control. Un control sin entrada se considera "no evaluado". */
export type EvaluacionControl = {
  clasificacion: Clasificacion;
  nivelMadurez: NivelMadurez;
  observaciones: string;
  comentarios: string;
};

export type DatosEntidad = {
  participante: string;
  auditor: string;
  fecha: string;
  alcance: string;
};

/** Documento completo que se guarda / exporta / importa. */
export type Evaluacion = {
  version: 1;
  entidad: DatosEntidad;
  /** Indexado por id de control ("11.2.5"). */
  controles: Record<string, EvaluacionControl>;
};

export function evaluacionVacia(): Evaluacion {
  return {
    version: 1,
    entidad: { participante: "", auditor: "", fecha: "", alcance: "" },
    controles: {},
  };
}

export function controlVacio(): EvaluacionControl {
  return {
    clasificacion: "no-cumple",
    nivelMadurez: "No controlable",
    observaciones: "",
    comentarios: "",
  };
}

// ---------------------------------------------------------------------------
// Cálculo de cumplimiento
// ---------------------------------------------------------------------------

export type Resumen = {
  /** Controles dentro del nodo (objetivo, principio o total). */
  total: number;
  /** Controles con datos capturados. */
  evaluados: number;
  cumple: number;
  noCumple: number;
  /** % de cumplimiento sobre el total de controles del nodo. */
  cumplimiento: number;
  /** % de controles ya capturados (avance de la recolección). */
  avance: number;
  /** Promedio de la nota de madurez (0–5) sobre los controles evaluados. */
  madurezPromedio: number;
};

function resumirControles(
  ids: string[],
  evaluacion: Evaluacion,
): Resumen {
  const entradas = ids
    .map((id) => evaluacion.controles[id])
    .filter((e): e is EvaluacionControl => Boolean(e));

  const cumple = entradas.filter((e) => e.clasificacion === "cumple").length;
  const sumaNotas = entradas.reduce(
    (acc, e) => acc + notaMadurez(e.nivelMadurez),
    0,
  );
  const total = ids.length;

  return {
    total,
    evaluados: entradas.length,
    cumple,
    noCumple: entradas.length - cumple,
    cumplimiento: total === 0 ? 0 : (cumple / total) * 100,
    avance: total === 0 ? 0 : (entradas.length / total) * 100,
    madurezPromedio:
      entradas.length === 0 ? 0 : sumaNotas / entradas.length,
  };
}

export type ResumenObjetivo = Resumen & { id: string; nombre: string };
export type ResumenPrincipio = Resumen & {
  id: string;
  nombre: string;
  objetivos: ResumenObjetivo[];
};

export type ResumenGlobal = Resumen & { principios: ResumenPrincipio[] };

export function calcularResumen(evaluacion: Evaluacion): ResumenGlobal {
  const principios: ResumenPrincipio[] = PRINCIPIOS.map((principio) => {
    const objetivos: ResumenObjetivo[] = principio.objetivos.map(
      (objetivo) => ({
        id: objetivo.id,
        nombre: objetivo.nombre,
        ...resumirControles(
          objetivo.controles.map((c) => c.id),
          evaluacion,
        ),
      }),
    );

    const idsPrincipio = principio.objetivos.flatMap((o) =>
      o.controles.map((c) => c.id),
    );

    return {
      id: principio.id,
      nombre: principio.nombre,
      objetivos,
      ...resumirControles(idsPrincipio, evaluacion),
    };
  });

  const todosLosIds = PRINCIPIOS.flatMap((p) =>
    p.objetivos.flatMap((o) => o.controles.map((c) => c.id)),
  );

  return {
    principios,
    ...resumirControles(todosLosIds, evaluacion),
  };
}

export { TOTAL_CONTROLES };

/**
 * Valida la forma de un objeto importado desde JSON. Devuelve una evaluación
 * saneada (descartando ids de control desconocidos) o `null` si no es válido.
 */
export function normalizarEvaluacionImportada(
  bruto: unknown,
): Evaluacion | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const obj = bruto as Record<string, unknown>;
  if (typeof obj.controles !== "object" || obj.controles === null) return null;

  const entidadBruta = (obj.entidad ?? {}) as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === "string" ? v : "");

  const resultado = evaluacionVacia();
  resultado.entidad = {
    participante: texto(entidadBruta.participante),
    auditor: texto(entidadBruta.auditor),
    fecha: texto(entidadBruta.fecha),
    alcance: texto(entidadBruta.alcance),
  };

  const idsValidos = new Set(
    PRINCIPIOS.flatMap((p) =>
      p.objetivos.flatMap((o) => o.controles.map((c) => c.id)),
    ),
  );

  for (const [id, valor] of Object.entries(
    obj.controles as Record<string, unknown>,
  )) {
    if (!idsValidos.has(id) || typeof valor !== "object" || valor === null) {
      continue;
    }
    const v = valor as Record<string, unknown>;
    const nivel = NIVELES_MADUREZ.includes(v.nivelMadurez as NivelMadurez)
      ? (v.nivelMadurez as NivelMadurez)
      : "No controlable";
    resultado.controles[id] = {
      clasificacion: v.clasificacion === "cumple" ? "cumple" : "no-cumple",
      nivelMadurez: nivel,
      observaciones: texto(v.observaciones),
      comentarios: texto(v.comentarios),
    };
  }

  return resultado;
}
