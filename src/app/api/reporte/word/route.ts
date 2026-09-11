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
} from "docx";
import type { CountItem, ReportData, SlaResumen } from "@/lib/report";

function seccion(titulo: string, nivel: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ text: titulo, heading: nivel, spacing: { before: 300, after: 150 } });
}

function parrafo(texto: string) {
  return texto.split("\n").map(
    (linea) =>
      new Paragraph({
        children: [new TextRun(linea)],
        spacing: { after: 120 },
      })
  );
}

function tablaConteo(items: CountItem[], encabezado: string) {
  const filas = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: encabezado, bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tickets", bold: true })] })] }),
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

export async function POST(req: NextRequest) {
  const report = (await req.json()) as ReportData;

  const doc = new Document({
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

          // Introduccion
          seccion("Introducción"),
          ...parrafo(report.narrativa.introduccion),

          // Historial de tickets
          seccion("Historial de tickets"),
          new Paragraph({ text: `Total de tickets en el periodo: ${report.totalTickets}`, spacing: { after: 150 } }),
          tablaConteo(report.historial, "Mes"),

          // Tipos de Tickets
          seccion("Tipos de Tickets"),
          tablaConteo(report.porTipo, "Tipo de ticket"),

          // Tickets por herramienta o producto
          seccion("Tickets por herramienta o producto"),
          tablaConteo(report.porProducto, "Producto / Herramienta"),

          // Estado de los tickets
          seccion("Estado de los tickets"),
          tablaConteo(report.porEstado, "Estado"),

          // SLA
          seccion("SLA"),
          new Paragraph({
            text: "A continuación se presenta el cumplimiento de SLA para incidentes y requerimientos del periodo.",
            spacing: { after: 150 },
          }),

          seccion("SLA - Incidentes", HeadingLevel.HEADING_2),
          tablaSla(report.slaIncidentes),

          seccion("SLA - Solicitudes", HeadingLevel.HEADING_2),
          tablaSla(report.slaSolicitudes),

          // Analisis de resultados
          seccion("Análisis de Resultados"),
          ...parrafo(report.narrativa.analisis),

          // Recomendacion
          seccion("Recomendación"),
          ...parrafo(report.narrativa.recomendacion),

          // Anexo
          seccion("Anexo"),
          new Paragraph({
            text: "Reporte generado automáticamente a partir del export de Halo ITSM del periodo indicado. Documento sujeto a revisión antes de su envío al cliente.",
          }),
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
