import type { Resultado } from "./types";

/**
 * Persistencia del prototipo: los eventos ya analizados viven en localStorage,
 * asi el historico sobrevive a un refresh sin necesidad de base de datos.
 */
const CLAVE = "eventpulse:eventos";

export interface EventoGuardado {
  id: string;
  guardadoEn: string;
  resultado: Resultado;
}

function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function leer(): EventoGuardado[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as EventoGuardado[]) : [];
  } catch {
    return [];
  }
}

function escribir(eventos: EventoGuardado[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(eventos));
  } catch {
    // Si el navegador bloquea localStorage el prototipo sigue en memoria.
  }
  cache = null;
  for (const escucha of escuchas) escucha();
}

/** Eventos analizados, del mas reciente al mas antiguo. */
export function listarEventos(): EventoGuardado[] {
  return leer().sort((a, b) => b.guardadoEn.localeCompare(a.guardadoEn));
}

/* ------------------------------------------------------------------ */
/* Puente para useSyncExternalStore                                    */
/* ------------------------------------------------------------------ */

const escuchas = new Set<() => void>();
const VACIO: EventoGuardado[] = [];
let cache: EventoGuardado[] | null = null;

export function suscribir(escucha: () => void): () => void {
  escuchas.add(escucha);
  return () => {
    escuchas.delete(escucha);
  };
}

/**
 * Snapshot estable: se memoriza hasta la siguiente escritura para que React no
 * vea un array nuevo en cada render.
 */
export function snapshotEventos(): EventoGuardado[] {
  cache ??= listarEventos();
  return cache;
}

/** En el servidor no hay localStorage: la lista arranca vacia. */
export function snapshotServidor(): EventoGuardado[] {
  return VACIO;
}

/**
 * Guarda un analisis. Si ya existe un evento con el mismo nombre lo reemplaza,
 * para que reprocesar el mismo CSV no duplique la fila del historico.
 */
export function guardarEvento(resultado: Resultado): EventoGuardado {
  const id = slug(resultado.evento.nombre) || `evento-${Date.now()}`;
  const registro: EventoGuardado = {
    id,
    guardadoEn: new Date().toISOString(),
    resultado,
  };
  escribir([registro, ...leer().filter((e) => e.id !== id)]);
  return registro;
}

/** Actualiza el analisis guardado (por ejemplo al mover el estatus de un lead). */
export function actualizarEvento(id: string, resultado: Resultado): void {
  escribir(leer().map((e) => (e.id === id ? { ...e, resultado } : e)));
}

export function eliminarEvento(id: string): void {
  escribir(leer().filter((e) => e.id !== id));
}
