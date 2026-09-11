import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  PageBreak,
  ImageRun,
  TableOfContents,
} from "docx";
import type { Bullet, CountItem, GrupoDetalle, ReportData, SlaResumen, TicketPendiente } from "@/lib/report";
import { barrasHorizontales, pastelConEtiquetas, COLORES } from "@/lib/chartImages";

const ANCHO_IMAGEN = 560;

function seccion(titulo: string, nivel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ text: titulo, heading: nivel, spacing: { before: 300, after: 150 } });
}

function parrafo(texto: string) {
  return new Paragraph({ children: [new TextRun(texto)], spacing: { after: 120 } });
}

function vinieta(b: Bullet) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100 },
    children: [new TextRun({ text: `${b.titulo}: `, bold: true }), new TextRun(b.detalle)],
  });
}

async function imagenDesdeBuffer(buffer: Buffer, altoOriginal: number, anchoOriginal: number) {
  const alto = Math.round(ANCHO_IMAGEN * (altoOriginal / anchoOriginal));
  return new Paragraph({
    children: [
      new ImageRun({
        type: "png",
        data: buffer,
        transformation: { width: ANCHO_IMAGEN, height: alto },
      }),
    ],
    spacing: { after: 200 },
  });
}

function tablaConteo(items: CountItem[], encabezado: string, encabezadoValor: string = "Cantidad") {
  const filas = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: encabezado, bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: encabezadoValor, bold: true })] })] }),
      ],
    }),
    ...items.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.label)] }),
            new TableCell({ children: [new Paragraph(String(item.total))] }),
          ],
        })
    ),
  ];
  return new Table({ rows: filas, width: { size: 100, type: WidthType.PERCENTAGE } });
}

function tablaSla(sla: SlaResumen) {
  const filas = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Métrica", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Valor", bold: true })] })] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Cumplidos")] }),
        new TableCell({ children: [new Paragraph(String(sla.cumplidos))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Incumplidos")] }),
        new TableCell({ children: [new Paragraph(String(sla.incumplidos))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Sin cierre en el periodo")] }),
        new TableCell({ children: [new Paragraph(String(sla.sinCierre))] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("% Cumplimiento")] }),
        new TableCell({ children: [new Paragraph(`${sla.porcentaje}%`)] }),
      ],
    }),
  ];
  return new Table({ rows: filas, width: { size: 100, type: WidthType.PERCENTAGE } });
}

function tablaPendientes(pendientes: TicketPendiente[]) {
  const filas = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ID del ticket", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Asunto", bold: true })] })] }),
      ],
    }),
    ...pendientes.map(
      (p) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(p.ticketId)] }),
            new TableCell({ children: [new Paragraph(p.estado)] }),
            new TableCell({ children: [new Paragraph(p.asunto)] }),
          ],
        })
    ),
  ];
  return new Table({ rows: filas, width: { size: 100, type: WidthType.PERCENTAGE } });
}

function seccionTiposDetalle(grupos: GrupoDetalle[]): Paragraph[] {
  const salida: Paragraph[] = [];
  for (const g of grupos) {
    salida.push(new Paragraph({ text: g.grupo, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
    for (const p of g.puntos) salida.push(vinieta(p));
  }
  return salida;
}

const DEFINICIONES_ESTADO: { estado: string; definicion: string }[] = [
  { estado: "Resuelto", definicion: "El ticket ha sido completamente atendido o finalizado." },
  {
    estado: "Abierto",
    definicion: "El ticket fue registrado y está pendiente de asignación o en proceso de atención inicial.",
  },
  {
    estado: "En espera",
    definicion:
      "El progreso del ticket está temporalmente detenido, habitualmente porque la resolución depende de un factor externo fuera del control inmediato del agente.",
  },
  {
    estado: "Con el usuario",
    definicion:
      "El equipo de soporte ha atendido el ticket, pero necesita que el usuario que lo reportó realice una acción para poder continuar.",
  },
];

export async function POST(req: NextRequest) {
  const report = (await req.json()) as ReportData;

  const cerrados = report.porEstado.find((e) => e.label === "Resuelto")?.total ?? 0;
  const pendientesCount = report.totalTickets - cerrados;

  const [imgHistorial, imgTipos, imgProducto, imgEstado] = await Promise.all([
    barrasHorizontales(report.porTipo, COLORES[0]),
    barrasHorizontales(report.porTipo, COLORES[1]),
    barrasHorizontales(report.porProducto, COLORES[2]),
    pastelConEtiquetas(report.porEstado),
  ]);

  const altoBarras = (items: CountItem[]) => 40 + Math.min(items.length, 12) * 42;

  const doc = new Document({
    features: { updateFields: true },
    sections: [
      {
        children: [
          // Portada
          new Paragraph({ text: "", spacing: { before: 2000 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Reporte Mensual SOC", bold: true, size: 56 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300 },
            children: [new TextRun({ text: report.cliente, bold: true, size: 36 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [new TextRun({ text: `Periodo: ${report.periodo.desde} a ${report.periodo.hasta}`, size: 24 })],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // Índice
          new Paragraph({ text: "Índice", heading: HeadingLevel.HEADING_1, spacing: { after: 150 } }),
          new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
          new Paragraph({ children: [new PageBreak()] }),

          // Introduccion
          seccion("Introducción"),
          parrafo(report.narrativa.introduccion),

          // Historial de tickets (tabla tipo/cantidad + grafica)
          seccion("Historial de tickets"),
          new Paragraph({ text: `Total de tickets en el periodo: ${report.totalTickets}`, spacing: { after: 150 } }),
          tablaConteo(report.porTipo, "Tipo", "Cantidad"),
          await imagenDesdeBuffer(imgHistorial, altoBarras(report.porTipo), 900),

          // Tipos de Tickets
          seccion("Tipos de Tickets en el Periodo"),
          await imagenDesdeBuffer(imgTipos, altoBarras(report.porTipo), 900),
          ...seccionTiposDetalle(report.narrativa.tiposDetalle),

          // Tickets por herramienta o producto
          seccion("Tickets por Herramienta"),
          await imagenDesdeBuffer(imgProducto, altoBarras(report.porProducto), 900),

          // Estado de los tickets
          seccion("Estado de los Tickets"),
          new Paragraph({
            text: `Al cierre del periodo, se presentan ${cerrados} tickets cerrados y ${pendientesCount} pendientes.`,
            spacing: { after: 150 },
          }),
          await imagenDesdeBuffer(imgEstado, 480, 900),
          new Paragraph({ text: "Definiciones de ESTADO del ticket", spacing: { before: 100, after: 100 } }),
          ...DEFINICIONES_ESTADO.map(
            (d) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 80 },
                children: [new TextRun({ text: `${d.estado}: `, bold: true }), new TextRun(d.definicion)],
              })
          ),
          new Paragraph({ text: "Tickets pendientes de cierre", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          report.pendientes.length > 0
            ? tablaPendientes(report.pendientes)
            : new Paragraph({ text: "No hay tickets pendientes de cierre en el periodo." }),

          // SLA
          seccion("SLA"),
          new Paragraph({
            text: "El Tiempo Medio de Primera Atención (TPA) es el tiempo promedio que transcurre desde que llega una solicitud de servicio al SOC hasta su asignación.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "El Tiempo Medio de Resolución (TMR) es el tiempo promedio del ticket desde que se asigna hasta que se resuelve. A continuación se presenta el cumplimiento de SLA para incidentes y requerimientos del periodo, según los umbrales de horas configurados para este cliente.",
            spacing: { after: 150 },
          }),

          seccion("SLA - Incidentes", HeadingLevel.HEADING_2),
          tablaSla(report.slaIncidentes),

          seccion("SLA - Solicitudes", HeadingLevel.HEADING_2),
          tablaSla(report.slaSolicitudes),

          // Analisis de resultados
          seccion("Análisis de Resultados"),
          ...report.narrativa.analisis.map(vinieta),

          // Recomendacion
          seccion("Recomendaciones"),
          ...report.narrativa.recomendacion.map(vinieta),

          // Anexo
          seccion("Anexo"),
          new Paragraph({ text: "Se comparte la fuente del registro de las alertas." }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="reporte-soc-${report.cliente.replace(/\s+/g, "-").toLowerCase()}.docx"`,
    },
  });
}
