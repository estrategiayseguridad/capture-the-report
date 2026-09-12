"use client";

/**
 * Persistencia simple en localStorage. No hay backend ni base de datos:
 * la evaluación vive en el navegador y se exporta/importa como JSON.
 *
 * localStorage es un store externo a React, así que se expone con
 * `useSyncExternalStore`: eso resuelve la hidratación (el servidor no puede
 * leerlo) sin hacer `setState` dentro de un efecto.
 */

import { useCallback, useSyncExternalStore } from "react";
import {
  DatosEntidad,
  Evaluacion,
  EvaluacionControl,
  controlVacio,
  evaluacionVacia,
  normalizarEvaluacionImportada,
} from "./evaluacion";

export const CLAVE_STORAGE = "ctr-equipo11-evaluacion-v1";

/** Referencia estable para el render del servidor y el primer render del cliente. */
const EVALUACION_VACIA = evaluacionVacia();

const oyentes = new Set<() => void>();

/** `useSyncExternalStore` exige que el snapshot sea la misma referencia entre renders. */
let cache: Evaluacion | null = null;

export function leerEvaluacionGuardada(): Evaluacion | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CLAVE_STORAGE);
    if (!bruto) return null;
    return normalizarEvaluacionImportada(JSON.parse(bruto));
  } catch {
    return null;
  }
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function snapshotCliente(): Evaluacion {
  cache ??= leerEvaluacionGuardada() ?? EVALUACION_VACIA;
  return cache;
}

function snapshotServidor(): Evaluacion {
  return EVALUACION_VACIA;
}

/** Escribe el nuevo estado, lo persiste y avisa a los componentes suscritos. */
function escribir(nueva: Evaluacion) {
  cache = nueva;
  try {
    window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nueva));
  } catch {
    // Sin localStorage (modo privado, cuota llena) el prototipo sigue
    // funcionando en memoria durante la sesión.
  }
  for (const oyente of oyentes) oyente();
}

/** Solo lectura: para pantallas que muestran la evaluación sin modificarla. */
export function useEvaluacionGuardada(): Evaluacion {
  return useSyncExternalStore(suscribir, snapshotCliente, snapshotServidor);
}

export function useEvaluacion() {
  const evaluacion = useEvaluacionGuardada();

  const actualizarEntidad = useCallback((cambios: Partial<DatosEntidad>) => {
    const actual = snapshotCliente();
    escribir({ ...actual, entidad: { ...actual.entidad, ...cambios } });
  }, []);

  const actualizarControl = useCallback(
    (id: string, cambios: Partial<EvaluacionControl>) => {
      const actual = snapshotCliente();
      const control = actual.controles[id] ?? controlVacio();
      escribir({
        ...actual,
        controles: {
          ...actual.controles,
          [id]: { ...control, ...cambios },
        },
      });
    },
    [],
  );

  const limpiarControl = useCallback((id: string) => {
    const actual = snapshotCliente();
    const controles = { ...actual.controles };
    delete controles[id];
    escribir({ ...actual, controles });
  }, []);

  const reemplazar = useCallback(
    (nueva: Evaluacion) => escribir(nueva),
    [],
  );

  const reiniciar = useCallback(() => escribir(evaluacionVacia()), []);

  return {
    evaluacion,
    actualizarEntidad,
    actualizarControl,
    limpiarControl,
    reemplazar,
    reiniciar,
  };
}
