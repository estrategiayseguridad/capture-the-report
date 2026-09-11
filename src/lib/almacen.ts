/**
 * Cierre cargado en memoria del servidor.
 *
 * Persistencia deliberadamente simple: si no se sube nada, se usa el dataset de
 * demo del repo; si se sube un .xlsx, queda aca hasta que se reinicie el server.
 * No hay base de datos porque no hace falta — un cierre a la vez, un analista.
 */

import type { Ticket } from "./metricas";

export type Cierre = {
  tickets: Ticket[];
  cliente: string;
  periodo: string;
  origen: string;
  hoja?: string;
  avisos?: string[];
};

/**
 * Va en `globalThis` y no en una variable de modulo: Next compila las paginas y los
 * route handlers en bundles distintos, asi que una variable de modulo NO se comparte
 * entre la ruta que sube el archivo y la pagina que lo muestra. Ademas sobrevive al
 * hot reload en desarrollo.
 */
const almacen = globalThis as typeof globalThis & { __cierreCSC?: Cierre | null };

export function guardarCierre(cierre: Cierre): void {
  almacen.__cierreCSC = cierre;
}

export function obtenerCierre(): Cierre | null {
  return almacen.__cierreCSC ?? null;
}

export function olvidarCierre(): void {
  almacen.__cierreCSC = null;
}
