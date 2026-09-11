export type Categoria = "Incidente" | "Requerimiento";
export type Estado = "Abierto" | "En espera" | "Resuelto" | "Con el usuario";
export type Prioridad = "Alta" | "Media" | "Baja";

export interface TicketRow {
  cliente: string;
  ticketId: string;
  asunto: string;
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
  Summary?: string;
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
        asunto: (r.Summary ?? "").trim(),
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

export interface RangoFechas {
  desde: string;
  hasta: string;
}

/** Fecha más antigua y más reciente ("YYYY-MM-DD") presentes en las filas, o null si no hay fechas. */
export function getRangoFechas(rows: TicketRow[]): RangoFechas | null {
  const fechas = rows.map((r) => r.fechaCreacion).filter(Boolean).sort();
  if (fechas.length === 0) return null;
  return { desde: fechas[0], hasta: fechas[fechas.length - 1] };
}

function filtrarPorRango(rows: TicketRow[], rango?: RangoFechas): TicketRow[] {
  if (!rango) return rows;
  return rows.filter((r) => r.fechaCreacion && r.fechaCreacion >= rango.desde && r.fechaCreacion <= rango.hasta);
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

export interface TicketPendiente {
  ticketId: string;
  estado: Estado;
  asunto: string;
}

export interface ReportData {
  cliente: string;
  periodo: { desde: string; hasta: string };
  totalTickets: number;
  historial: CountItem[];
  porTipo: CountItem[];
  porProducto: CountItem[];
  porEstado: CountItem[];
  pendientes: TicketPendiente[];
  slaIncidentes: SlaResumen;
  slaSolicitudes: SlaResumen;
  thresholds: SlaThresholds;
  narrativa: Narrativa;
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

function ticketsPendientes(rows: TicketRow[]): TicketPendiente[] {
  return rows
    .filter((r) => r.estado !== "Resuelto")
    .map((r) => ({ ticketId: r.ticketId, estado: r.estado, asunto: r.asunto || "Sin asunto" }));
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

/** Un punto de análisis/recomendación con un título corto (se muestra en negrita) y su detalle. */
export interface Bullet {
  titulo: string;
  detalle: string;
}

/** Desglose de "Tipos de tickets" agrupado por herramienta/producto, con puntos redactados a partir del asunto real de los tickets. */
export interface GrupoDetalle {
  grupo: string;
  puntos: Bullet[];
}

export interface Narrativa {
  introduccion: string;
  tiposDetalle: GrupoDetalle[];
  analisis: Bullet[];
  recomendacion: Bullet[];
}

/** Resumen de un ticket (sin datos de fecha/SLA) usado como insumo para que la IA redacte con datos reales. */
export interface TicketResumen {
  producto: string;
  tipo: string;
  estado: Estado;
  asunto: string;
}

export interface NarrativaInput {
  cliente: string;
  periodo: { desde: string; hasta: string };
  totalTickets: number;
  porTipo: CountItem[];
  porProducto: CountItem[];
  porEstado: CountItem[];
  slaIncidentes: SlaResumen;
  slaSolicitudes: SlaResumen;
  /** Asunto real de cada ticket del cliente, para que la IA redacte con datos reales en vez de solo agregados. */
  tickets: TicketResumen[];
}

export function generarNarrativaReglas(data: NarrativaInput): Narrativa {
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

  const tiposDetalle: GrupoDetalle[] = Object.entries(
    data.tickets.reduce<Record<string, TicketResumen[]>>((acc, t) => {
      const grupo = t.producto.split(">")[0] || "General";
      (acc[grupo] ??= []).push(t);
      return acc;
    }, {})
  ).map(([grupo, tickets]) => ({
    grupo,
    puntos: [
      {
        titulo: `${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`,
        detalle: tickets
          .slice(0, 5)
          .map((t) => t.asunto)
          .filter(Boolean)
          .join("; ") || "Sin detalle disponible en el asunto de los tickets.",
      },
    ],
  }));

  const analisis: Bullet[] = [
    {
      titulo: "Volumen y distribución",
      detalle:
        `El tipo de ticket más recurrente fue "${tipoTop?.label ?? "N/D"}" con ${tipoTop?.total ?? 0} casos, ` +
        `y el producto/herramienta con mayor volumen fue "${productoTop?.label ?? "N/D"}" (${productoTop?.total ?? 0} casos).`,
    },
    {
      titulo: "Cierre de tickets",
      detalle: `${pendientes} tickets permanecen pendientes de cierre (abiertos, en espera o con el usuario) de un total de ${totalTickets}.`,
    },
    {
      titulo: "Cumplimiento de SLA",
      detalle:
        `Los incidentes registraron un cumplimiento de ${slaIncidentes.porcentaje}% ` +
        `(${slaIncidentes.cumplidos} cumplidos / ${slaIncidentes.incumplidos} incumplidos), y los requerimientos ` +
        `un cumplimiento de ${slaSolicitudes.porcentaje}% (${slaSolicitudes.cumplidos} cumplidos / ${slaSolicitudes.incumplidos} incumplidos).`,
    },
  ];

  const recomendacion: Bullet[] = [];
  if (slaIncidentes.porcentaje < 90) {
    recomendacion.push({
      titulo: "Reforzar atención de incidentes",
      detalle: "Priorizar los incidentes de severidad alta para mejorar el cumplimiento de SLA.",
    });
  }
  if (slaSolicitudes.porcentaje < 90) {
    recomendacion.push({
      titulo: "Revisar capacidad de atención de requerimientos",
      detalle: "Reducir el porcentaje de solicitudes fuera de SLA.",
    });
  }
  if (productoTop) {
    recomendacion.push({
      titulo: "Acciones preventivas",
      detalle: `Evaluar acciones preventivas sobre "${productoTop.label}", dado que concentra el mayor número de tickets del periodo.`,
    });
  }
  if (pendientes > 0) {
    recomendacion.push({
      titulo: "Seguimiento a pendientes",
      detalle: `Dar seguimiento a los ${pendientes} tickets aún pendientes de cierre para evitar acumulación en el próximo periodo.`,
    });
  }
  if (recomendacion.length === 0) {
    recomendacion.push({
      titulo: "Mantener prácticas actuales",
      detalle: "El desempeño observado en el periodo es adecuado; se recomienda mantener las prácticas actuales de gestión.",
    });
  }

  return { introduccion, tiposDetalle, analisis, recomendacion };
}

export function computeReport(
  rows: TicketRow[],
  cliente: string,
  thresholds: SlaThresholds = SLA_THRESHOLDS_DEFAULT,
  rango?: RangoFechas
): ReportData {
  const filtradas = filtrarPorRango(
    rows.filter((r) => r.cliente === cliente),
    rango
  );
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

  const narrativa = generarNarrativaReglas({
    cliente,
    periodo,
    totalTickets: filtradas.length,
    porTipo,
    porProducto,
    porEstado,
    slaIncidentes,
    slaSolicitudes,
    tickets: filtradas.map((r) => ({ producto: r.producto, tipo: r.tipo, estado: r.estado, asunto: r.asunto })),
  });

  return {
    cliente,
    periodo,
    totalTickets: filtradas.length,
    historial: historialMensual(filtradas),
    porTipo,
    porProducto,
    porEstado,
    pendientes: ticketsPendientes(filtradas),
    slaIncidentes,
    slaSolicitudes,
    thresholds,
    narrativa,
  };
}
