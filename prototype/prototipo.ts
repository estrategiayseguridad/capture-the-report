import { writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { parse } from 'csv-parse/sync'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  TabStopType,
  convertInchesToTwip,
} from 'docx'

type Alerta = Record<string, string>

const COL_SEVERIDAD = 'kibana.alert.severity'
const COL_REGLA = 'kibana.alert.rule.name'

/** Cuenta ocurrencias de un valor, ordenadas de mayor a menor (equivalente a value_counts). */
function valueCounts(valores: string[]): Map<string, number> {
  const conteo = new Map<string, number>()
  for (const valor of valores) {
    conteo.set(valor, (conteo.get(valor) ?? 0) + 1)
  }
  return new Map([...conteo].sort((a, b) => b[1] - a[1]))
}

/** Párrafo tipo "<N> alertas fueron <etiqueta>." con los números y la etiqueta en negrita. */
function parrafoSeveridad(cantidad: number, etiqueta: string): Paragraph {
  const verbo = cantidad === 1 ? 'alerta fue' : 'alertas fueron'
  return new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text: `${cantidad} `, bold: true }),
      new TextRun({ text: `${verbo} ` }),
      new TextRun({ text: `${etiqueta}.`, bold: true }),
    ],
  })
}

export async function generarReporteWord(
  csvFilepath: string,
  docxOutputPath: string,
): Promise<void> {
  // 1. Cargar el archivo CSV
  const filas: Alerta[] = parse(readFileSync(csvFilepath), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  })

  if (filas.length > 0 && !(COL_SEVERIDAD in filas[0])) {
    throw new Error(
      `El CSV no tiene la columna "${COL_SEVERIDAD}". Columnas encontradas: ${Object.keys(filas[0]).join(', ')}`,
    )
  }

  // 2. Calcular los totales y desgloses
  const totalAlertas = filas.length

  const severidades = valueCounts(
    filas.map((fila) => (fila[COL_SEVERIDAD] ?? '').toLowerCase()),
  )
  const altas = severidades.get('high') ?? 0
  const medias = severidades.get('medium') ?? 0
  const bajas = severidades.get('low') ?? 0

  const reglasTop = valueCounts(filas.map((fila) => fila[COL_REGLA] ?? '(sin regla)'))

  // 3. Crear el documento Word
  const doc = new Document({
    // Formato general
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22 }, // size va en medios puntos: 22 = 11pt
        },
      },
    },
    sections: [
      {
        children: [
          // Parrafo total
          new Paragraph({
            children: [
              new TextRun({ text: `${totalAlertas} alertas`, bold: true }),
              new TextRun({ text: ' se monitorearon en total.' }),
            ],
          }),

          // Listado por severidad
          parrafoSeveridad(altas, 'altas'),
          parrafoSeveridad(medias, 'medias'),
          parrafoSeveridad(bajas, 'bajas'),

          new Paragraph({}),

          // Titulo reglas
          new Paragraph({
            children: [
              new TextRun({
                text: 'Las reglas que más alertas generaron fueron:',
                bold: true,
              }),
            ],
          }),

          ...[...reglasTop].map(
            ([regla, cantidad]) =>
              new Paragraph({
                tabStops: [
                  { type: TabStopType.LEFT, position: convertInchesToTwip(4.5) },
                ],
                children: [
                  new TextRun({ text: `${regla}\t` }),
                  new TextRun({ text: String(cantidad), bold: true }),
                ],
              }),
          ),
        ],
      },
    ],
  })

  // 4. Guardar archivo
  await writeFile(docxOutputPath, await Packer.toBuffer(doc))
  console.log(`✅ Reporte generado exitosamente en: ${docxOutputPath}`)
}

/** Punto de entrada CLI: solo corre si el archivo se ejecuta directamente. */
async function main(): Promise<void> {
  // Configuración de flags de la terminal
  const { values } = parseArgs({
    options: {
      // Flag de entrada (-i o --input)
      input: { type: 'string', short: 'i' },
      // Flag opcional de salida (-o o --output)
      output: { type: 'string', short: 'o', default: 'reporte_alertas.docx' },
    },
  })

  if (!values.input) {
    console.error(
      'Genera un reporte de Word a partir de un archivo CSV de alertas.\n\n' +
        'Uso: npm run reporte -- -i <entrada.csv> [-o <salida.docx>]\n\n' +
        '  -i, --input   Ruta del archivo CSV de entrada (requerido)\n' +
        '  -o, --output  Ruta/Nombre del archivo de Word a generar (opcional)',
    )
    process.exit(1)
  }

  // Ejecutar función con las flags recibidas
  await generarReporteWord(values.input, values.output!)
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main().catch((error: unknown) => {
    console.error(`❌ ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
