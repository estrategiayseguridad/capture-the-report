/**
 * Motor de metricas de REPORTERO CSC.
 *
 * Todo lo que el informe mensual dice en numeros sale de aca, de una sola fuente:
 * la lista de tickets de la pestana DATOS. Son funciones puras a proposito, para
 * poder verificarlas contra el informe de Agosto ya publicado.
 *
 * Cifras de control (ver data/README.md): 63 tickets · 43/15/5 por tipo ·
 * 53 cerrados / 10 pendientes · TPA 0.10 · TMR 29.29 (n=53).
 */

export type Ticket = {
  indice: number;
  ticket_id: number;
  summary: string;
  status: string;
  fecha_creacion: string;
  hora_creacion: number;
  category: string;
  team: string;
  itil_type: string;
  ticket_type: string;
  assigned_agent: string;
  user_name: string;
  client: string;
  sla: string;
  time_to_respond: number | null;
  time_to_resolve: number | null;
  priority: string;
};

/** Estados que el informe cuenta como cerrados. `Resuelto` y `Closed` conviven en Halo. */
const ESTADOS_CERRADOS = ["Closed", "Resuelto"];

/** Criterio de "cerrado", como predicado, para que el conteo y el desglose lo compartan. */
export const esCerrado = (t: Ticket): boolean => ESTADOS_CERRADOS.includes(t.status);

/** El proceso manual solo copia los `Closed` a las pestanas por herramienta. */
const ESTADO_QUE_COPIA_EL_PROCESO_MANUAL = "Closed";

/** La herramienta es el prefijo de `Category`: `Cloudflare>WAF` -> `Cloudflare`. */
export function herramientaDe(categoria: string): string {
  return categoria.split(">")[0].trim();
}

function contar<T>(items: T[], clave: (item: T) => string): Record<string, number> {
  const cuenta: Record<string, number> = {};
  for (const item of items) {
    const k = clave(item);
    cuenta[k] = (cuenta[k] ?? 0) + 1;
  }
  return cuenta;
}

function ordenarDesc(cuenta: Record<string, number>): [string, number][] {
  return Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
}

/** Promedio ignorando los nulos: los tickets abiertos no tienen tiempo de resolucion
 *  y contarlos como 0 hundiria el TMR. */
function promedio(valores: (number | null)[]): { valor: number; n: number } {
  const validos = valores.filter((v): v is number => v !== null);
  if (validos.length === 0) return { valor: 0, n: 0 };
  return { valor: validos.reduce((a, b) => a + b, 0) / validos.length, n: validos.length };
}

export function calcularMetricas(tickets: Ticket[]) {
  const porTipo = ordenarDesc(contar(tickets, (t) => t.ticket_type));
  const porEstado = ordenarDesc(contar(tickets, (t) => t.status));
  const porHerramienta = ordenarDesc(contar(tickets, (t) => herramientaDe(t.category)));
  const porEquipo = ordenarDesc(contar(tickets, (t) => t.team));
  const porAgente = ordenarDesc(contar(tickets, (t) => t.assigned_agent));

  const cerrados = tickets.filter(esCerrado).length;
  const pendientes = tickets.length - cerrados;

  const tpa = promedio(tickets.map((t) => t.time_to_respond));
  const tmr = promedio(tickets.map((t) => t.time_to_resolve));

  // Herramienta x Estado, para la grafica de barras apiladas.
  const estados = porEstado.map(([e]) => e);
  const herramientaPorEstado = porHerramienta.map(([herramienta, total]) => {
    const deLaHerramienta = tickets.filter((t) => herramientaDe(t.category) === herramienta);
    return {
      herramienta,
      total,
      porEstado: estados.map((estado) => deLaHerramienta.filter((t) => t.status === estado).length),
    };
  });

  const fechas = tickets.map((t) => t.fecha_creacion).sort();

  return {
    total: tickets.length,
    porTipo,
    porEstado,
    porHerramienta,
    porEquipo,
    porAgente,
    estados,
    herramientaPorEstado,
    cerrados,
    pendientes,
    tpa,
    tmr,
    desde: fechas[0],
    hasta: fechas[fechas.length - 1],
  };
}

/** Tickets por herramienta, como DEBERIAN verse las pestanas (los 63, no solo los cerrados). */
export function agruparPorHerramienta(tickets: Ticket[]) {
  const grupos = new Map<string, Ticket[]>();
  for (const t of tickets) {
    const h = herramientaDe(t.category);
    if (!grupos.has(h)) grupos.set(h, []);
    grupos.get(h)!.push(t);
  }
  return [...grupos.entries()]
    .map(([herramienta, tickets]) => ({
      herramienta,
      tickets: tickets.sort((a, b) => a.ticket_id - b.ticket_id),
      // Lo que el proceso manual SI copio a la pestana.
      copiadosAMano: tickets.filter((t) => t.status === ESTADO_QUE_COPIA_EL_PROCESO_MANUAL).length,
    }))
    .sort((a, b) => b.tickets.length - a.tickets.length);
}

/**
 * Los tickets que el proceso manual pierde: existen en DATOS y cuentan en las
 * graficas, pero nunca llegan a la pestana de su herramienta porque no estan `Closed`.
 * Este es el hallazgo del pitch.
 */
export function ticketsPerdidosEnProcesoManual(tickets: Ticket[]) {
  return tickets
    .filter((t) => t.status !== ESTADO_QUE_COPIA_EL_PROCESO_MANUAL)
    .sort((a, b) => a.ticket_id - b.ticket_id);
}

export function formatearHoras(horas: number): string {
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  return `${horas.toFixed(2)} h`;
}

/** Busca una cuenta en una lista `[clave, total]`. */
export function cuentaDe(pares: [string, number][], clave: string): number {
  return pares.find(([k]) => k === clave)?.[1] ?? 0;
}

/**
 * Un indicador del dashboard junto con los tickets que lo componen y el criterio
 * con que se calculo, en palabras.
 *
 * Nada de funciones aca: esto cruza del servidor al cliente, asi que todo tiene
 * que ser serializable. Las columnas de tiempo se piden por nombre de campo.
 */
export type IndicadorTrazable = {
  clave: string;
  etiqueta: string;
  valor: string;
  pie?: string;
  destacado?: boolean;
  /** Como se calcula el numero, explicado para quien pregunta en la reunion. */
  criterio: string;
  /** Donde vive el calculo, para poder auditarlo en el codigo. */
  fuente: string;
  /** Los tickets detras del numero. */
  tickets: Ticket[];
  /** Campos de tiempo a mostrar como columnas en el desglose. */
  tiempos?: ("time_to_respond" | "time_to_resolve")[];
};

/**
 * Los indicadores del dashboard, cada uno con su desglose.
 *
 * El valor de los indicadores de conteo se DERIVA de la lista (`lista.length`),
 * no se calcula aparte: asi el numero y el desglose no pueden discrepar. Lo que
 * si podria discrepar es este camino contra `calcularMetricas()`, que es el que
 * alimenta el informe — por eso al final se comprueban uno contra otro.
 */
export function indicadoresTrazables(tickets: Ticket[]): IndicadorTrazable[] {
  const m = calcularMetricas(tickets);
  const porId = (a: Ticket, b: Ticket) => a.ticket_id - b.ticket_id;

  const alertas = tickets.filter((t) => t.ticket_type === "Alerta").sort(porId);
  const solicitudes = tickets.filter((t) => t.ticket_type === "Solicitud").sort(porId);
  const cerrados = tickets.filter(esCerrado).sort(porId);
  const pendientes = tickets.filter((t) => !esCerrado(t)).sort(porId);

  // Para tiempos: los que traen el dato. Se ordenan del mas lento al mas rapido,
  // porque la pregunta real al ver un TMR alto es "¿que ticket me lo subio?".
  const conTiempos = tickets
    .filter((t) => t.time_to_respond !== null || t.time_to_resolve !== null)
    .sort((a, b) => (b.time_to_resolve ?? 0) - (a.time_to_resolve ?? 0));

  const lista: IndicadorTrazable[] = [
    {
      clave: "total",
      etiqueta: "Tickets",
      valor: String(tickets.length),
      destacado: true,
      criterio:
        "Filas de la hoja DATOS con un Ticket ID no vacio. Las filas sin ID se descartan al " +
        "parsear el archivo, para que una fila de totales o una fila en blanco al final no cuente.",
      fuente: "metricas.ts · calcularMetricas().total",
      tickets: [...tickets].sort(porId),
    },
    {
      clave: "alertas",
      etiqueta: "Alertas",
      valor: String(alertas.length),
      criterio:
        "Ticket Type es exactamente «Alerta». Ojo: «Solicitud de Reporte» NO entra aqui ni en " +
        "Solicitudes, se cuenta como su propio tipo. Por eso Alertas + Solicitudes no da el total.",
      fuente: "metricas.ts · calcularMetricas().porTipo['Alerta']",
      tickets: alertas,
    },
    {
      clave: "solicitudes",
      etiqueta: "Solicitudes",
      valor: String(solicitudes.length),
      criterio:
        "Ticket Type es exactamente «Solicitud». No incluye «Solicitud de Reporte», que se " +
        "cuenta aparte porque es trabajo de reporteria, no de atencion.",
      fuente: "metricas.ts · calcularMetricas().porTipo['Solicitud']",
      tickets: solicitudes,
    },
    {
      clave: "cerrados",
      etiqueta: "Cerrados",
      valor: String(cerrados.length),
      criterio:
        "Status es «Closed» o «Resuelto». Halo usa los dos para lo mismo segun quien cierre el " +
        "ticket, y el informe los suma. Si solo contaramos «Closed» el numero saldria mas bajo.",
      fuente: "metricas.ts · esCerrado()",
      tickets: cerrados,
    },
    {
      clave: "pendientes",
      etiqueta: "Pendientes",
      valor: String(pendientes.length),
      criterio:
        "Todo lo que no esta «Closed» ni «Resuelto»: tipicamente «On Hold» y «With User». " +
        "Es el complemento de Cerrados, asi que Cerrados + Pendientes siempre da el total.",
      fuente: "metricas.ts · !esCerrado()",
      tickets: pendientes,
    },
    {
      clave: "tiempos",
      etiqueta: "TPA / TMR",
      valor: formatearHoras(m.tpa.valor),
      pie: `TMR ${m.tmr.valor.toFixed(2)} h (n=${m.tmr.n})`,
      criterio:
        `Promedio de Time to Respond (n=${m.tpa.n}) y Time to Resolve (n=${m.tmr.n}) sobre los ` +
        "tickets que TIENEN el dato. Los que siguen abiertos vienen vacios y se omiten: contarlos " +
        "como 0 hundiria el promedio y el informe diria que respondemos mas rapido de lo real. " +
        "Por eso se publica el n junto al numero. Abajo van del mas lento al mas rapido.",
      fuente: "metricas.ts · promedio(), que descarta los nulos",
      tickets: conTiempos,
      tiempos: ["time_to_respond", "time_to_resolve"],
    },
  ];

  // Este camino y el de `calcularMetricas()` (el que alimenta el informe) son
  // independientes. Si alguna vez dejan de coincidir, es mejor romper la pagina
  // que mostrar un desglose que no cuadra con el numero de arriba.
  const invariantes: [string, number, number][] = [
    ["total", tickets.length, m.total],
    ["alertas", alertas.length, cuentaDe(m.porTipo, "Alerta")],
    ["solicitudes", solicitudes.length, cuentaDe(m.porTipo, "Solicitud")],
    ["cerrados", cerrados.length, m.cerrados],
    ["pendientes", pendientes.length, m.pendientes],
  ];
  for (const [nombre, delDesglose, delInforme] of invariantes) {
    if (delDesglose !== delInforme) {
      throw new Error(
        `Trazabilidad rota en "${nombre}": el desglose lista ${delDesglose} tickets pero el ` +
          `informe reporta ${delInforme}. Los dos criterios dejaron de coincidir.`,
      );
    }
  }

  return lista;
}
