import { SLA_THRESHOLDS_DEFAULT, type SlaThresholds } from "./report";

const STORAGE_KEY = "soc-sla-thresholds-por-cliente";

type Almacen = Record<string, SlaThresholds>;

function leerAlmacen(): Almacen {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Almacen) : {};
  } catch {
    return {};
  }
}

export function obtenerThresholds(cliente: string): SlaThresholds {
  return leerAlmacen()[cliente] ?? SLA_THRESHOLDS_DEFAULT;
}

export function guardarThresholds(cliente: string, thresholds: SlaThresholds): void {
  if (typeof window === "undefined") return;
  try {
    const almacen = leerAlmacen();
    almacen[cliente] = thresholds;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(almacen));
  } catch {
    // localStorage no disponible (modo privado, etc.) — el reporte sigue funcionando con los valores en memoria
  }
}
