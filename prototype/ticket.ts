import { Command } from 'commander';
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Packer,
  WidthType,
  AlignmentType,
} from 'docx';
import * as fs from 'fs';
import Papa from 'papaparse';

// Interfaz que mapea los campos exactos del archivo de Tickets
interface TicketRecord {
  'Zendesk ID'?: string;
  'Fecha del informe'?: string;
  'Fecha de cierre'?: string;
  ID?: string;
  'Tipo de Ticket'?: string;
  'Tiempo restante de SLA con porcentaje'?: string;
  Asunto?: string;
  Category?: string;
  Organización?: string;
  Marca?: string;
  Prioridad?: string;
  'Icono de estado'?: string;
  Agente?: string;
}

// El export envuelve cada linea completa entre comillas dobles, asi que Papa la
// lee como una sola columna. Quitamos el BOM y esas comillas externas antes de
// parsear. Solo desenvolvemos si dentro no quedan comillas, para no romper un
// CSV normal donde cada campo va citado por separado.
function normalizarCSV(contenido: string): string {
  return contenido
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((linea) => {
      if (linea.length < 2 || !linea.startsWith('"') || !linea.endsWith('"')) {
        return linea;
      }
      const interior = linea.slice(1, -1);
      return interior.includes('"') ? linea : interior;
    })
    .join('\n');
}

// Función para leer y parsear el archivo CSV / Export de Excel
function leerCSV(filePath: string): TicketRecord[] {
  const fileContent = normalizarCSV(fs.readFileSync(filePath, 'utf-8'));
  const parsed = Papa.parse<TicketRecord>(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

async function generarReporteTickets(csvFilePath: string, docxOutputPath: string): Promise<void> {
  const tickets = leerCSV(csvFilePath);
  const totalTickets = tickets.length;

  // 1. Agrupaciones y conteos dinámicos
  const porPrioridad: Record<string, number> = {};
  const porTipo: Record<string, number> = {};
  const porAgente: Record<string, number> = {};

  tickets.forEach((t) => {
    const prioridad = t['Prioridad']?.trim() || 'Sin Prioridad';
    const tipo = t['Tipo de Ticket']?.trim() || 'Sin Tipo';
    const agente = t['Agente']?.trim() || 'Sin Asignar';

    porPrioridad[prioridad] = (porPrioridad[prioridad] || 0) + 1;
    porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    porAgente[agente] = (porAgente[agente] || 0) + 1;
  });

  // 2. Construcción del documento Word
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Título principal
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: 'Informe de Tickets Abiertos',
                bold: true,
                size: 28,
              }),
            ],
          }),

          // Resumen Total
          new Paragraph({
            children: [
              new TextRun({ text: `${totalTickets} tickets`, bold: true }),
              new TextRun({ text: ' se encuentran abiertos actualmente.' }),
            ],
          }),

          // Subtítulo: Desglose por Prioridad
          new Paragraph({
            children: [
              new TextRun({
                text: 'Desglose por Prioridad:',
                bold: true,
              }),
            ],
          }),

          ...Object.entries(porPrioridad).map(
            ([prio, cant]) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun({ text: `${cant} `, bold: true }),
                  new TextRun({ text: 'tickets con prioridad ' }),
                  new TextRun({ text: `${prio}.`, bold: true }),
                ],
              })
          ),

          new Paragraph({ text: '' }), // Espacio

          // Subtítulo: Desglose por Tipo de Ticket
          new Paragraph({
            children: [
              new TextRun({
                text: 'Desglose por Tipo de Ticket:',
                bold: true,
              }),
            ],
          }),

          ...Object.entries(porTipo).map(
            ([tipo, cant]) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun({ text: `${cant} `, bold: true }),
                  new TextRun({ text: 'de tipo ' }),
                  new TextRun({ text: `${tipo}.`, bold: true }),
                ],
              })
          ),

          new Paragraph({ text: '' }), // Espacio

          // Subtítulo: Asignación por Agente
          new Paragraph({
            children: [
              new TextRun({
                text: 'Tickets asignados por Agente:',
                bold: true,
              }),
            ],
          }),

          ...Object.entries(porAgente).map(
            ([agente, cant]) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${agente}\t` }),
                  new TextRun({ text: `${cant}`, bold: true }),
                ],
              })
          ),

          new Paragraph({ text: '' }), // Espacio

          // Subtítulo: Detalle de Tickets
          new Paragraph({
            children: [
              new TextRun({
                text: 'Detalle de Tickets Pendientes:',
                bold: true,
                size: 24,
              }),
            ],
          }),

          // Tabla con el detalle de todos los tickets
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Encabezado de la tabla
              new TableRow({
                tableHeader: true,
                children: [
                  crearCeldaHeader('ID'),
                  crearCeldaHeader('Fecha'),
                  crearCeldaHeader('Tipo'),
                  crearCeldaHeader('Asunto'),
                  crearCeldaHeader('Prioridad'),
                  crearCeldaHeader('Estado'),
                  crearCeldaHeader('Agente'),
                ],
              }),

              // Filas con datos
              ...tickets.map(
                (t) =>
                  new TableRow({
                    children: [
                      crearCelda(t['ID'] || '-'),
                      crearCelda(t['Fecha del informe'] || '-'),
                      crearCelda(t['Tipo de Ticket'] || '-'),
                      crearCelda(t['Asunto'] || '-'),
                      crearCelda(t['Prioridad'] || '-'),
                      crearCelda(t['Icono de estado'] || '-'),
                      crearCelda(t['Agente'] || '-'),
                    ],
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  // 3. Guardar el documento
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxOutputPath, buffer);
  console.log(`✅ Reporte de tickets generado en: ${docxOutputPath}`);
}

// Funciones auxiliares para formato de la tabla
function crearCeldaHeader(texto: string): TableCell {
  return new TableCell({
    shading: { fill: '003366' },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: texto, bold: true, color: 'FFFFFF', size: 18 }),
        ],
      }),
    ],
  });
}

function crearCelda(texto: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: texto, size: 18 })],
      }),
    ],
  });
}

// Configuración de Flags CLI con Commander
const program = new Command();

program
  .name('tickets-report-generator')
  .description('Genera un informe en Word a partir de un export de Tickets Abiertos.')
  .requiredOption('-i, --input <path>', 'Ruta del archivo CSV/Excel de entrada')
  .option(
    '-o, --output <path>',
    'Ruta/Nombre del archivo de Word a generar (opcional)',
    'reporte_tickets_abiertos.docx'
  )
  .action(async (options: { input: string; output: string }) => {
    try {
      await generarReporteTickets(options.input, options.output);
    } catch (error) {
      console.error('❌ Error al procesar el reporte de tickets:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);