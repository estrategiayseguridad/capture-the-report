export type Categoria = "Incidente" | "Requerimiento";
export type Estado = "Abierto" | "En espera" | "Resuelto" | "Con el usuario";
export type Prioridad = "Alta" | "Media" | "Baja";

export interface TicketRow {
  cliente: string;
  ticketId: string;
  fechaCreacion: string;
  fechaCierre: string;
  categoria: Categoria;
  tipo: string;
  producto: string;
  estado: Estado;
  prioridad: Prioridad;
  /** Horas reales de resolución (columna "Time to Resolve (Decimal)" de Halo). null = aún no cierra. */
  horasResolucion: number | null;
}

/** Fila cruda tal como la exporta Halo ITSM (encabezados en inglés, todos los clientes mezclados). */
interface RawHaloRow {
  "Ticket ID"?: string;
  Status?: string;
  "Date Created"?: string;
  Category?: string;
  "ITIL Type"?: string;
  "Ticket Type"?: string;
  Client?: string;
  SLA?: string;
  "Time to Resolve (Decimal)"?: string;
  Priority?: string;
  "Date Closed"?: string;
}

const ESTADO_MAP: Record<string, Estado> = {
  closed: "Resuelto",
  resuelto: "Resuelto",
  "with user": "Con el usuario",
  "on hold": "En espera",
  new: "Abierto",
  "in progress": "Abierto",
  updated: "Abierto",
};

function mapEstado(status: string): Estado {
  return ESTADO_MAP[status.trim().toLowerCase()] ?? "Abierto";
}

function mapCategoria(sla: string, itilType: string): Categoria {
  const s = sla.toLowerCase();
  if (s.includes("incidente")) return "Incidente";
  if (s.includes("requerimiento")) return "Requerimiento";
  return itilType.toLowerCase().includes("incident") ? "Incidente" : "Requerimiento";
}

function mapPrioridad(prioridad: string): Prioridad {
  const v = prioridad.trim();
  return v === "Alta" || v === "Media" || v === "Baja" ? v : "Media";
}

/** Extrae "YYYY-MM-DD" de fechas tipo "8/10/2026 16:24" o "8/14/2026 1:11 PM" (formato M/D/YYYY de Halo). */
function extraerFecha(valor: string): string {
  const m = valor.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return "";
  const [, mes, dia, anio] = m;
  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

export function normalizeRows(raw: RawHaloRow[]): TicketRow[] {
  return raw
    .filter((r) => r["Ticket ID"] && r.Client)
    .map((r) => {
      const horas = parseFloat((r["Time to Resolve (Decimal)"] ?? "").trim());
      return {
        cliente: (r.Client ?? "").trim(),
        ticketId: (r["Ticket ID"] ?? "").trim(),
        fechaCreacion: extraerFecha(r["Date Created"] ?? ""),
        fechaCierre: extraerFecha(r["Date Closed"] ?? ""),
        categoria: mapCategoria(r.SLA ?? "", r["ITIL Type"] ?? ""),
        tipo: (r["Ticket Type"] ?? "").trim() || "Sin tipo",
        producto: (r.Category ?? "").trim() || "Sin categoría",
        estado: mapEstado(r.Status ?? ""),
        prioridad: mapPrioridad(r.Priority ?? ""),
        horasResolucion: Number.isFinite(horas) ? horas : null,
      };
    });
}

export function getClientes(rows: TicketRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.cliente))).sort();
}

export interface CountItem {
  label: string;
  total: number;
}

export interface SlaResumen {
  cumplidos: number;
  incumplidos: number;
  sinCierre: number;
  porcentaje: number;
}

/** Umbral de horas de resolución por categoría y prioridad. Editable por cliente desde la web. */
export interface SlaThresholds {
  incidente: { alta: number; media: number; baja: number };
  requerimiento: { alta: number; media: number; baja: number };
}

export const SLA_THRESHOLDS_DEFAULT: SlaThresholds = {
  incidente: { alta: 4, media: 8, baja: 24 },
  requerimiento: { alta: 24, media: 48, baja: 72 },
};

export interface ReportData {
  cliente: string;
  periodo: { desde: string; hasta: string };
  totalTickets: number;
  historial: CountItem[];
  porTipo: CountItem[];
  porProducto: CountItem[];
  porEstado: CountItem[];
  slaIncidentes: SlaResumen;
  slaSolicitudes: SlaResumen;
  thresholds: SlaThresholds;
  narrativa: {
    introduccion: string;
    analisis: string;
    recomendacion: string;
  };
}

function countBy(rows: TicketRow[], key: (r: TicketRow) => string): CountItem[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r) || "Sin dato";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function mesLabel(fecha: string): string {
  const [y, m] = fecha.split("-");
  const idx = Number(m) - 1;
  return `${MESES[idx] ?? m} ${y}`;
}

function historialMensual(rows: TicketRow[]): CountItem[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r.fechaCreacion) continue;
    const label = mesLabel(r.fechaCreacion);
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => {
      const parse = (l: string) => {
        const [mes, anio] = l.split(" ");
        return Number(anio) * 100 + MESES.indexOf(mes);
      };
      return parse(a.label) - parse(b.label);
    });
}

function umbralHoras(thresholds: SlaThresholds, categoria: Categoria, prioridad: Prioridad): number {
  const grupo = categoria === "Incidente" ? thresholds.incidente : thresholds.requerimiento;
  const key = prioridad.toLowerCase() as "alta" | "media" | "baja";
  return grupo[key] ?? grupo.media;
}

function calcularSla(rows: TicketRow[], thresholds: SlaThresholds): SlaResumen {
  let cumplidos = 0;
  let incumplidos = 0;
  let sinCierre = 0;

  for (const r of rows) {
    if (r.horasResolucion === null) {
      sinCierre++;
      continue;
    }
    const umbral = umbralHoras(thresholds, r.categoria, r.prioridad);
    if (r.horasResolucion <= umbral) cumplidos++;
    else incumplidos++;
  }

  const base = cumplidos + incumplidos;
  const porcentaje = base > 0 ? Math.round((cumplidos / base) * 1000) / 10 : 0;
  return { cumplidos, incumplidos, sinCierre, porcentaje };
}

function generarNarrativa(data: {
  cliente: string;
  periodo: { desde: string; hasta: string };
  totalTickets: number;
  porTipo: CountItem[];
  porProducto: CountItem[];
  porEstado: CountItem[];
  slaIncidentes: SlaResumen;
  slaSolicitudes: SlaResumen;
}): { introduccion: string; analisis: string; recomendacion: string } {
  const { cliente, periodo, totalTickets, porTipo, porProducto, porEstado, slaIncidentes, slaSolicitudes } = data;

  const introduccion =
    `El presente informe resume la gestión de tickets del servicio SOC para ${cliente} ` +
    `durante el periodo comprendido entre ${periodo.desde} y ${periodo.hasta}. ` +
    `En este lapso se registraron un total de ${totalTickets} tickets, considerando incidentes y requerimientos ` +
    `gestionados a través de la mesa de servicio.`;

  const tipoTop = porTipo[0];
  const productoTop = porProducto[0];
  const abiertos = porEstado.find((e) => e.label === "Abierto")?.total ?? 0;
  const enEspera = porEstado.find((e) => e.label === "En espera")?.total ?? 0;
  const conUsuario = porEstado.find((e) => e.label === "Con el usuario")?.total ?? 0;
  const pendientes = abiertos + enEspera + conUsuario;

  const analisis =
    `Durante el periodo analizado, el tipo de ticket más recurrente fue "${tipoTop?.label ?? "N/D"}" ` +
    `con ${tipoTop?.total ?? 0} casos, y el producto/herramienta con mayor volumen de tickets fue ` +
    `"${productoTop?.label ?? "N/D"}" (${productoTop?.total ?? 0} casos). ` +
    `Del total de tickets, ${pendientes} permanecen pendientes de cierre (abiertos, en espera o con el usuario), ` +
    `mientras que el resto fue resuelto dentro del periodo. ` +
    `En cuanto al cumplimiento de SLA, los incidentes registraron un cumplimiento de ${slaIncidentes.porcentaje}% ` +
    `(${slaIncidentes.cumplidos} cumplidos / ${slaIncidentes.incumplidos} incumplidos), ` +
    `y los requerimientos un cumplimiento de ${slaSolicitudes.porcentaje}% ` +
    `(${slaSolicitudes.cumplidos} cumplidos / ${slaSolicitudes.incumplidos} incumplidos).`;

  const puntosRecomendacion: string[] = [];
  if (slaIncidentes.porcentaje < 90) {
    puntosRecomendacion.push(
      "Reforzar los tiempos de atención de incidentes, priorizando los de severidad alta para mejorar el cumplimiento de SLA."
    );
  }
  if (slaSolicitudes.porcentaje < 90) {
    puntosRecomendacion.push(
      "Revisar la capacidad de atención de requerimientos para reducir el porcentaje de solicitudes fuera de SLA."
    );
  }
  if (productoTop) {
    puntosRecomendacion.push(
      `Evaluar acciones preventivas sobre "${productoTop.label}", dado que concentra el mayor número de tickets del periodo.`
    );
  }
  if (pendientes > 0) {
    puntosRecomendacion.push(
      `Dar seguimiento a los ${pendientes} tickets aún pendientes de cierre para evitar acumulación en el próximo periodo.`
    );
  }
  if (puntosRecomendacion.length === 0) {
    puntosRecomendacion.push("Mantener las prácticas actuales de gestión, dado el buen desempeño observado en el periodo.");
  }

  const recomendacion = puntosRecomendacion.map((p, i) => `${i + 1}. ${p}`).join("\n");

  return { introduccion, analisis, recomendacion };
}

export function computeReport(
  rows: TicketRow[],
  cliente: string,
  thresholds: SlaThresholds = SLA_THRESHOLDS_DEFAULT
): ReportData {
  const filtradas = rows.filter((r) => r.cliente === cliente);
  const fechas = filtradas.map((r) => r.fechaCreacion).filter(Boolean).sort();
  const periodo = {
    desde: fechas[0] ?? "N/D",
    hasta: fechas[fechas.length - 1] ?? "N/D",
  };

  const incidentes = filtradas.filter((r) => r.categoria === "Incidente");
  const requerimientos = filtradas.filter((r) => r.categoria === "Requerimiento");

  const porTipo = countBy(filtradas, (r) => r.tipo);
  const porProducto = countBy(filtradas, (r) => r.producto);
  const porEstado = countBy(filtradas, (r) => r.estado);
  const slaIncidentes = calcularSla(incidentes, thresholds);
  const slaSolicitudes = calcularSla(requerimientos, thresholds);

  const narrativa = generarNarrativa({
    cliente,
    periodo,
    totalTickets: filtradas.length,
    porTipo,
    porProducto,
    porEstado,
    slaIncidentes,
    slaSolicitudes,
  });

  return {
    cliente,
    periodo,
    totalTickets: filtradas.length,
    historial: historialMensual(filtradas),
    porTipo,
    porProducto,
    porEstado,
    slaIncidentes,
    slaSolicitudes,
    thresholds,
    narrativa,
  };
}
