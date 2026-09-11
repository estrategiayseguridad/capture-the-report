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
  slaCumplido: boolean | null;
}

interface RawCsvRow {
  Cliente?: string;
  TicketID?: string;
  FechaCreacion?: string;
  FechaCierre?: string;
  Categoria?: string;
  Tipo?: string;
  Producto?: string;
  Estado?: string;
  Prioridad?: string;
  SLA_Cumplido?: string;
}

export function normalizeRows(raw: RawCsvRow[]): TicketRow[] {
  return raw
    .filter((r) => r.Cliente && r.TicketID)
    .map((r) => ({
      cliente: (r.Cliente ?? "").trim(),
      ticketId: (r.TicketID ?? "").trim(),
      fechaCreacion: (r.FechaCreacion ?? "").trim(),
      fechaCierre: (r.FechaCierre ?? "").trim(),
      categoria: (r.Categoria?.trim() as Categoria) || "Incidente",
      tipo: (r.Tipo ?? "").trim(),
      producto: (r.Producto ?? "").trim(),
      estado: (r.Estado?.trim() as Estado) || "Abierto",
      prioridad: (r.Prioridad?.trim() as Prioridad) || "Media",
      slaCumplido:
        r.SLA_Cumplido?.trim().toLowerCase() === "si"
          ? true
          : r.SLA_Cumplido?.trim().toLowerCase() === "no"
          ? false
          : null,
    }));
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

function mesLabel(fecha: string): string {
  const [y, m] = fecha.split("-");
  const nombres = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const idx = Number(m) - 1;
  return `${nombres[idx] ?? m} ${y}`;
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
        const idx = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].indexOf(mes);
        return Number(anio) * 100 + idx;
      };
      return parse(a.label) - parse(b.label);
    });
}

function calcularSla(rows: TicketRow[]): SlaResumen {
  const cumplidos = rows.filter((r) => r.slaCumplido === true).length;
  const incumplidos = rows.filter((r) => r.slaCumplido === false).length;
  const sinCierre = rows.filter((r) => r.slaCumplido === null).length;
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

export function computeReport(rows: TicketRow[], cliente: string): ReportData {
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
  const slaIncidentes = calcularSla(incidentes);
  const slaSolicitudes = calcularSla(requerimientos);

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
    narrativa,
  };
}
