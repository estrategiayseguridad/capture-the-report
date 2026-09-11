/**
 * Fuente unica del cierre que se esta viendo: el .xlsx que se subio, o el dataset
 * de demo del repo si no se subio nada. El dashboard, el informe y la descarga leen
 * de aca, asi que las tres salidas siempre hablan del mismo cierre.
 */

import demo from "../../data/halo-demo-agosto.json";
import historialDemo from "../../data/historial-mensual.json";
import { obtenerCierre, type Cierre } from "./almacen";
import type { Ticket } from "./metricas";

export type CierreActivo = Cierre & { esDemo: boolean; historial: [string, number][] };

export function cierreActivo(): CierreActivo {
  const cargado = obtenerCierre();
  const historial: [string, number][] = historialDemo.meses.map((x) => [x.mes, x.tickets]);

  if (cargado) {
    return { ...cargado, esDemo: false, historial };
  }

  return {
    tickets: demo.tickets as Ticket[],
    cliente: demo.cliente,
    periodo: demo.periodo,
    origen: "halo-demo-agosto.xlsx (dataset de demo)",
    esDemo: true,
    historial,
  };
}
