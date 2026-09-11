/**
 * Parser del export de Halo (.xlsx) -> Ticket[].
 *
 * Regla de oro: las columnas se buscan POR NOMBRE DE ENCABEZADO, nunca por letra.
 * En la pestana DATOS la columna A es un indice sin encabezado, asi que `Category`
 * cae en G; en las pestanas por herramienta del mismo archivo cae en F. Por nombre
 * funciona en los dos casos, y si Halo cambia el orden de columnas seguimos bien.
 * Si falta una columna, se avisa cual — nunca se devuelve un numero mal.
 */

import * as XLSX from "xlsx";
import type { Ticket } from "./metricas";

/** Encabezados que necesitamos, con los alias que hemos visto en los exports. */
const CAMPOS = {
  ticket_id: ["ticket id", "id del ticket", "ticket"],
  summary: ["summary", "resumen", "asunto"],
  status: ["status", "estado"],
  fecha: ["date created", "fecha de creacion", "fecha creacion"],
  hora: ["hour created", "hora de creacion", "hora creacion"],
  category: ["category", "categoria"],
  team: ["team", "equipo", "linea de soporte"],
  itil_type: ["itil type", "tipo itil"],
  ticket_type: ["ticket type", "tipo de ticket"],
  assigned_agent: ["assigned agent", "agente asignado", "agente"],
  user_name: ["user name", "usuario", "nombre de usuario"],
  client: ["client", "cliente"],
  sla: ["sla"],
  time_to_respond: ["time to respond (decimal)", "time to respond", "tpa"],
  time_to_resolve: ["time to resolve (decimal)", "time to resolve", "tmr"],
  priority: ["priority", "prioridad"],
} as const;

/** Obligatorias: sin estas no hay informe. Las demas pueden venir vacias. */
const OBLIGATORIAS: (keyof typeof CAMPOS)[] = ["ticket_id", "status", "category", "ticket_type"];

export class ErrorDeArchivo extends Error {}

function normalizar(s: unknown): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // fuera acentos: "Categoria" == "Categoría"
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Serial de Excel -> ISO. Dia 0 = 1899-12-30. */
function serialAFecha(serial: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.floor(serial) * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function aFechaISO(valor: unknown): string {
  if (typeof valor === "number") return serialAFecha(valor);
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  const texto = String(valor ?? "").trim();
  const d = new Date(texto);
  return isNaN(d.getTime()) ? texto : d.toISOString().slice(0, 10);
}

function aNumeroONulo(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return isNaN(n) ? null : n;
}

/** Elige la hoja DATOS; si no existe, la primera. */
function elegirHoja(libro: XLSX.WorkBook): string {
  const datos = libro.SheetNames.find((n) => normalizar(n) === "datos");
  if (datos) return datos;
  if (libro.SheetNames.length === 0) throw new ErrorDeArchivo("El archivo no tiene hojas.");
  return libro.SheetNames[0];
}

export function parsearHalo(buffer: ArrayBuffer): {
  tickets: Ticket[];
  hoja: string;
  cliente: string;
  periodo: string;
  avisos: string[];
} {
  let libro: XLSX.WorkBook;
  try {
    libro = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new ErrorDeArchivo("No se pudo leer el archivo. Debe ser un .xlsx exportado de Halo.");
  }

  const hoja = elegirHoja(libro);
  const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(libro.Sheets[hoja], {
    defval: null,
    raw: true,
  });
  if (filas.length === 0) throw new ErrorDeArchivo(`La hoja "${hoja}" no tiene filas de datos.`);

  // Mapa encabezado-real -> campo nuestro, resuelto una sola vez.
  const encabezados = Object.keys(filas[0]);
  const columnaDe: Partial<Record<keyof typeof CAMPOS, string>> = {};
  for (const [campo, alias] of Object.entries(CAMPOS) as [keyof typeof CAMPOS, readonly string[]][]) {
    const encontrado = encabezados.find((e) => alias.includes(normalizar(e)));
    if (encontrado) columnaDe[campo] = encontrado;
  }

  const faltantes = OBLIGATORIAS.filter((c) => !columnaDe[c]);
  if (faltantes.length > 0) {
    throw new ErrorDeArchivo(
      `En la hoja "${hoja}" no se encontraron las columnas: ${faltantes.join(", ")}. ` +
        `Encabezados leidos: ${encabezados.filter((e) => !e.startsWith("__")).join(" · ")}`,
    );
  }

  const avisos = (Object.keys(CAMPOS) as (keyof typeof CAMPOS)[])
    .filter((c) => !columnaDe[c])
    .map((c) => `No se encontro la columna "${c}"; se muestra vacia.`);

  const dato = (fila: Record<string, unknown>, campo: keyof typeof CAMPOS) => {
    const col = columnaDe[campo];
    return col ? fila[col] : null;
  };

  const tickets: Ticket[] = filas
    .filter((f) => dato(f, "ticket_id") !== null && String(dato(f, "ticket_id")).trim() !== "")
    .map((f, i) => ({
      indice: i + 1,
      ticket_id: Number(dato(f, "ticket_id")),
      summary: String(dato(f, "summary") ?? "").trim(),
      status: String(dato(f, "status") ?? "").trim(),
      fecha_creacion: aFechaISO(dato(f, "fecha")),
      hora_creacion: Number(dato(f, "hora") ?? 0),
      category: String(dato(f, "category") ?? "").trim(),
      team: String(dato(f, "team") ?? "").trim(),
      itil_type: String(dato(f, "itil_type") ?? "").trim(),
      ticket_type: String(dato(f, "ticket_type") ?? "").trim(),
      assigned_agent: String(dato(f, "assigned_agent") ?? "").trim(),
      user_name: String(dato(f, "user_name") ?? "").trim(),
      client: String(dato(f, "client") ?? "").trim(),
      sla: String(dato(f, "sla") ?? "").trim(),
      time_to_respond: aNumeroONulo(dato(f, "time_to_respond")),
      time_to_resolve: aNumeroONulo(dato(f, "time_to_resolve")),
      priority: String(dato(f, "priority") ?? "").trim(),
    }));

  if (tickets.length === 0) throw new ErrorDeArchivo(`La hoja "${hoja}" no tiene tickets validos.`);

  // El cliente y el periodo salen de los datos, no se piden aparte.
  const cliente = tickets.find((t) => t.client)?.client || "Cliente sin nombre";
  const fechas = tickets.map((t) => t.fecha_creacion).filter(Boolean).sort();
  const periodo = fechas.length > 0 ? nombrePeriodo(fechas[0]) : "Periodo sin fecha";

  return { tickets, hoja, cliente, periodo, avisos };
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function nombrePeriodo(iso: string): string {
  const [anio, mes] = iso.split("-");
  const nombre = MESES[Number(mes) - 1];
  return nombre ? `${nombre} ${anio}` : iso;
}
