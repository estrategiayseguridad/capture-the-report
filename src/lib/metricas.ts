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

  const cerrados = tickets.filter((t) => ESTADOS_CERRADOS.includes(t.status)).length;
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
