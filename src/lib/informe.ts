/**
 * Construye el informe mensual como HTML.
 *
 * Una sola funcion para las dos salidas —la vista en pantalla y el archivo que se
 * descarga y abre en Word— para que no puedan desincronizarse. Los estilos van
 * EN LINEA porque Word ignora casi todo el CSS de hoja externa, y las graficas se
 * dibujan con tablas de celdas coloreadas, que es lo que Word si respeta.
 *
 * La estructura y el orden de las secciones siguen el .docx de Agosto.
 */

import {
  agruparPorHerramienta,
  calcularMetricas,
  formatearHoras,
  ticketsPerdidosEnProcesoManual,
  type Ticket,
} from "./metricas";

const AZUL = "#1e4d8c";
const PALETA = ["#2563eb", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#16a34a"];

const FUENTE = "font-family:Calibri,Arial,sans-serif;";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function h2(texto: string): string {
  return `<h2 style="${FUENTE}color:${AZUL};font-size:15pt;border-bottom:1px solid ${AZUL};padding-bottom:4px;margin:22px 0 10px;">${esc(texto)}</h2>`;
}

function p(texto: string): string {
  return `<p style="${FUENTE}font-size:11pt;line-height:1.5;text-align:justify;margin:0 0 10px;">${texto}</p>`;
}

/** Grafica de barras dibujada con una tabla: Word colorea celdas sin problema. */
function barrasHTML(datos: [string, number][], color = PALETA[0]): string {
  const max = Math.max(...datos.map(([, n]) => n), 1);
  const filas = datos
    .map(([etiqueta, n]) => {
      const ancho = Math.max(Math.round((n / max) * 100), 3);
      return `<tr>
  <td style="${FUENTE}font-size:10pt;text-align:right;padding:3px 8px;width:150px;">${esc(etiqueta)}</td>
  <td style="padding:3px 0;">
    <table cellspacing="0" cellpadding="0" style="width:${ancho}%;"><tr>
      <td bgcolor="${color}" style="${FUENTE}background:${color};color:#fff;font-size:9pt;font-weight:bold;text-align:right;padding:3px 6px;">${n}</td>
    </tr></table>
  </td>
</tr>`;
    })
    .join("");
  return `<table cellspacing="0" cellpadding="0" style="width:100%;margin:8px 0 16px;">${filas}</table>`;
}

function tablaHTML(encabezados: string[], filas: (string | number)[][]): string {
  const th = encabezados
    .map(
      (e) =>
        `<th style="${FUENTE}background:${AZUL};color:#fff;font-size:10pt;text-align:left;border:1px solid #b8c4d4;padding:5px 8px;">${esc(e)}</th>`,
    )
    .join("");
  const tr = filas
    .map(
      (f, i) =>
        `<tr>${f
          .map(
            (c) =>
              `<td style="${FUENTE}font-size:10pt;border:1px solid #b8c4d4;padding:4px 8px;background:${
                i % 2 ? "#f2f5f9" : "#ffffff"
              };">${esc(String(c))}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  return `<table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin:8px 0 16px;"><tr>${th}</tr>${tr}</table>`;
}

/** Marca los bloques que el analista debe escribir: no los inventa la herramienta. */
function bloqueDelAnalista(titulo: string, borrador: string): string {
  return `<div style="border-left:4px solid #f0a500;background:#fffaf0;padding:10px 14px;margin:8px 0 16px;">
  <p style="${FUENTE}font-size:9pt;color:#8a6100;margin:0 0 6px;font-weight:bold;text-transform:uppercase;">${esc(titulo)} — a completar por el analista</p>
  <p style="${FUENTE}font-size:11pt;line-height:1.5;text-align:justify;margin:0;color:#4a4a4a;">${borrador}</p>
</div>`;
}

export function construirInforme(
  tickets: Ticket[],
  meta: { cliente: string; periodo: string; historial: [string, number][] },
) {
  const m = calcularMetricas(tickets);
  const grupos = agruparPorHerramienta(tickets);
  const perdidos = ticketsPerdidosEnProcesoManual(tickets);
  const tipo = (k: string) => m.porTipo.find(([x]) => x === k)?.[1] ?? 0;
  const b = (s: string) => `<strong>${s}</strong>`;

  const titulo = `Reporte de Alertas ${meta.cliente} — ${meta.periodo}`;

  const cuerpo = [
    `<h1 style="${FUENTE}color:${AZUL};font-size:20pt;margin:0 0 4px;">Reporte de Atencion de Alertas y Solicitudes</h1>`,
    `<p style="${FUENTE}font-size:12pt;color:#555;margin:0 0 24px;">${esc(meta.cliente)} · ${esc(meta.periodo)}</p>`,

    h2("1. Introduccion"),
    p(
      `El presente documento detalla la atencion brindada por el Centro de Servicios de Ciberseguridad (CSC) durante el periodo comprendido entre el ${b(m.desde)} y el ${b(m.hasta)}. ` +
        `En el periodo se registraron ${b(String(m.total))} tickets, de los cuales ${b(String(tipo("Alerta")))} corresponden a alertas de seguridad, ` +
        `${b(String(tipo("Solicitud")))} a solicitudes de servicio y ${b(String(tipo("Solicitud de Reporte")))} a solicitudes de reporte.`,
    ),
    p(
      `Del total de tickets, ${b(String(m.cerrados))} fueron cerrados dentro del periodo y ${b(String(m.pendientes))} permanecen en seguimiento ` +
        `(en espera del usuario o en pausa). El tiempo promedio de atencion fue de ${b(formatearHoras(m.tpa.valor))} y el tiempo promedio ` +
        `de resolucion de ${b(`${m.tmr.valor.toFixed(2)} horas`)}, calculado sobre los ${b(String(m.tmr.n))} tickets efectivamente resueltos.`,
    ),

    h2("2. Alcance del servicio"),
    p(
      `El monitoreo y la atencion cubren las siguientes plataformas: ${grupos
        .map((g) => `${b(g.herramienta)} (${g.tickets.length} tickets)`)
        .join(", ")}.`,
    ),
    tablaHTML(
      ["Herramienta", "Tickets", "Cerrados", "En seguimiento", "% del total"],
      grupos.map((g) => {
        const cerrados = g.tickets.filter((t) => ["Closed", "Resuelto"].includes(t.status)).length;
        return [
          g.herramienta,
          g.tickets.length,
          cerrados,
          g.tickets.length - cerrados,
          `${((g.tickets.length / m.total) * 100).toFixed(1)}%`,
        ];
      }),
    ),

    h2("3. Estado de los tickets del periodo"),
    barrasHTML(m.porEstado, PALETA[3]),
    tablaHTML(
      ["Estado", "Tickets", "% del total"],
      m.porEstado.map(([e, n]) => [e, n, `${((n / m.total) * 100).toFixed(1)}%`]),
    ),

    h2("4. Historial mensual"),
    p(
      `Comportamiento del volumen de tickets a lo largo del ano, para dimensionar el periodo frente a los meses anteriores.`,
    ),
    barrasHTML(meta.historial, PALETA[0]),

    h2("5. Tipos de tickets en el periodo"),
    barrasHTML(m.porTipo, PALETA[1]),
    bloqueDelAnalista(
      "Analisis de los tipos de ticket",
      `En el periodo predominaron las ${esc(m.porTipo[0][0].toLowerCase())}s (${m.porTipo[0][1]} de ${m.total} tickets). ` +
        `[Describir aqui el comportamiento observado y su relacion con los cambios o eventos del periodo.]`,
    ),

    h2("6. Tickets por herramienta y estado"),
    tablaHTML(
      ["Herramienta", ...m.estados, "Total"],
      m.herramientaPorEstado.map((f) => [f.herramienta, ...f.porEstado, f.total]),
    ),

    h2("7. Cumplimiento de niveles de servicio"),
    p(`Tiempos promedio del periodo frente a los umbrales acordados.`),
    tablaHTML(
      ["Indicador", "Umbral acordado", "Promedio del periodo", "Cumple"],
      [
        [
          "Tiempo promedio de atencion (TPA)",
          "10 minutos",
          formatearHoras(m.tpa.valor),
          m.tpa.valor * 60 <= 10 ? "Si" : "No",
        ],
        [
          "Tiempo promedio de resolucion (TMR)",
          "48 horas",
          `${m.tmr.valor.toFixed(2)} h`,
          m.tmr.valor <= 48 ? "Si" : "No",
        ],
      ],
    ),
    p(
      `<span style="font-size:9pt;color:#777;">El TMR se calcula sobre los ${m.tmr.n} tickets resueltos; los ${m.total - m.tmr.n} tickets aun abiertos no tienen tiempo de resolucion y no se promedian como cero.</span>`,
    ),

    h2("8. Analisis de resultados y recomendaciones"),
    bloqueDelAnalista(
      "Analisis de resultados",
      `[Interpretacion del periodo: tendencias, incidentes relevantes, causas raiz identificadas.]`,
    ),
    bloqueDelAnalista(
      "Recomendaciones",
      `[Acciones concretas recomendadas al cliente, priorizadas.]`,
    ),

    h2("Anexo. Detalle de tickets del periodo"),
    p(
      `Los ${b(String(m.total))} tickets del periodo, agrupados por herramienta. ` +
        (perdidos.length > 0
          ? `Se incluyen los ${b(String(perdidos.length))} tickets en seguimiento, que en el proceso manual no llegaban a las hojas por herramienta.`
          : ""),
    ),
    ...grupos.map((g) =>
      [
        `<h3 style="${FUENTE}color:${AZUL};font-size:12pt;margin:16px 0 6px;">${esc(g.herramienta)} — ${g.tickets.length} tickets</h3>`,
        tablaHTML(
          ["Ticket", "Resumen", "Estado", "Creado", "Agente"],
          g.tickets.map((t) => [
            t.ticket_id,
            t.summary,
            t.status,
            t.fecha_creacion,
            t.assigned_agent,
          ]),
        ),
      ].join(""),
    ),
  ].join("\n");

  return { titulo, cuerpo, metricas: m };
}

/** Envuelve el cuerpo como documento completo para descargar y abrir en Word. */
export function documentoWord(titulo: string, cuerpo: string): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${esc(titulo)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>@page { size: A4; margin: 2.2cm; } body { ${FUENTE} }</style>
</head>
<body>${cuerpo}</body>
</html>`;
}
