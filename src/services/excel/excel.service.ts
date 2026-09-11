// Node-only module. Only the import Route Handler calls it in the application.
import { Buffer } from "node:buffer";
import { read } from "xlsx";
import {
  emptyImportResult,
  type CountEntry,
  type ExcelImportResult,
} from "@/types/excel";
import {
  duplicateKnownColumns,
  excelFileSchema,
  MAX_SHEET_ROWS,
  normalizeHeader,
  REQUIRED_COLUMNS,
  ticketIdSchema,
  type TicketColumn,
} from "@/validators/excel.validator";
import {
  cellText,
  excelDateText,
  KNOWN_PRIORITIES,
  KNOWN_STATUSES,
} from "./normalization";
import { cellValue, detectTicketSheets, sheetRange } from "./sheet-detection";
import { mapTicket } from "./ticket-mapper";

function countValues(
  values: string[],
  defaults: readonly string[] = [],
): CountEntry[] {
  const counts = new Map(defaults.map((label) => [label, 0]));
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count }));
}

export function importExcel(
  buffer: Buffer,
  fileName: string,
): ExcelImportResult {
  const result = emptyImportResult(fileName);
  const fileValidation = excelFileSchema.safeParse({
    name: fileName,
    size: buffer.length,
  });
  if (!fileValidation.success) {
    result.errors = fileValidation.error.issues.map((issue) => issue.message);
    return result;
  }
  // SheetJS also accepts CSV/HTML; ZIP signature + OOXML parts prevent renamed text from being accepted.
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
    result.errors.push(
      "No fue posible leer el archivo seleccionado. Verifique que sea un archivo Excel válido.",
    );
    return result;
  }
  let workbook;
  try {
    workbook = read(buffer, {
      type: "buffer",
      cellDates: false,
      cellHTML: false,
      cellFormula: false,
      bookVBA: false,
      bookDeps: false,
      bookFiles: true,
      sheetRows: MAX_SHEET_ROWS + 51,
      WTF: true,
    });
  } catch (error) {
    console.error("[excel:read]", error);
    result.errors.push(
      "No fue posible leer el archivo seleccionado. Verifique que sea un archivo Excel válido y que no esté protegido con contraseña.",
    );
    return result;
  }
  const rawKeys: unknown = "keys" in workbook ? workbook.keys : undefined;
  const keys = Array.isArray(rawKeys)
    ? rawKeys.filter((key): key is string => typeof key === "string")
    : [];
  if (
    !keys.includes("xl/workbook.xml") ||
    !keys.includes("[Content_Types].xml")
  ) {
    result.errors.push(
      "El contenido del archivo no corresponde a un libro XLSX válido.",
    );
    return result;
  }
  if (
    keys.some((key) =>
      /vbaProject\.bin$|xl\/macrosheets\/|xl\/externalLinks\//i.test(key),
    )
  ) {
    result.errors.push(
      "El archivo contiene macros o vínculos a otros libros. Exporta una copia XLSX con valores locales antes de importarla.",
    );
    return result;
  }
  if (workbook.SheetNames.length > 30) {
    result.errors.push(
      "El archivo supera el límite de 30 hojas. Importa un libro más pequeño.",
    );
    return result;
  }
  let detection;
  try {
    detection = detectTicketSheets(workbook);
  } catch (error) {
    console.error("[excel:sheet-range]", error);
    result.errors.push(
      "Una hoja supera el límite de 10 000 filas de datos o 256 columnas. Reduce el archivo antes de importarlo.",
    );
    return result;
  }
  result.candidateSheets = detection.candidates.map(
    (candidate) => candidate.sheetName,
  );
  const selected = detection.candidates[0];
  if (!selected) {
    result.errors.push(
      "No se encontró una hoja válida de tickets.",
      "El archivo no contiene todas las columnas requeridas.",
    );
    result.missingColumns = detection.closest?.missingColumns ?? [
      ...REQUIRED_COLUMNS,
    ];
    result.sheetName = detection.closest?.sheetName ?? null;
    result.headers = detection.closest?.headers ?? [];
    return result;
  }
  result.sheetName = selected.sheetName;
  result.headerRow = selected.headerIndex + 1;
  result.headers = selected.headers;
  const duplicatedColumns = duplicateKnownColumns(selected.headers);
  if (duplicatedColumns.length) {
    result.errors.push(
      `Hay encabezados duplicados que impiden identificar las columnas: ${duplicatedColumns.join(", ")}.`,
    );
    return result;
  }
  if (detection.candidates.length > 1)
    result.warnings.push({
      code: "MULTIPLE_SHEETS",
      message: `Se encontraron ${detection.candidates.length} hojas válidas. Se utilizó la primera: ${selected.sheetName}.`,
    });
  const sheet = workbook.Sheets[selected.sheetName];
  const range = sheetRange(sheet);
  const columnMap = new Map(
    selected.headers.map((header) => [header.normalized, header.columnIndex]),
  );
  const idRows = new Map<string, number[]>();
  for (let row = selected.headerIndex + 1; row <= range.e.r; row++) {
    const values = Array.from({ length: range.e.c + 1 }, (_, column) =>
      cellValue(sheet, row, column),
    );
    if (values.every((value) => !cellText(value).trim())) continue;
    result.totalRows++;
    if (result.totalRows > MAX_SHEET_ROWS) {
      const failed = emptyImportResult(fileName);
      failed.errors.push(
        "El archivo supera el límite de 10 000 filas de datos.",
      );
      return failed;
    }
    const get = (column: TicketColumn): unknown => {
      const index = columnMap.get(normalizeHeader(column));
      const value = index === undefined ? null : values[index];
      if (column === "Date Created" || column === "Hour Created") {
        return excelDateText(
          value,
          Boolean(workbook.Workbook?.WBProps?.date1904),
          column === "Hour Created",
        );
      }
      return value;
    };
    const idValue = get("Ticket ID");
    const idValidation = ticketIdSchema.safeParse(
      typeof idValue === "string" || typeof idValue === "number"
        ? cellText(idValue)
        : "",
    );
    if (!idValidation.success) {
      const reason = "La fila no tiene un Ticket ID válido y fue omitida.";
      result.invalidRowDetails.push({ row: row + 1, reason });
      result.warnings.push({
        code: "INVALID_ROW",
        row: row + 1,
        message: reason,
      });
      continue;
    }
    const { ticket, warnings } = mapTicket(get, idValidation.data, row + 1);
    result.tickets.push(ticket);
    result.warnings.push(...warnings);
    const rows = idRows.get(ticket.ticketId) ?? [];
    rows.push(row + 1);
    idRows.set(ticket.ticketId, rows);
  }
  for (const [ticketId, rows] of idRows) {
    if (rows.length > 1) result.duplicates.push({ ticketId, rows });
  }
  if (result.duplicates.length)
    result.warnings.push({
      code: "DUPLICATE_ID",
      message: `Se detectaron ${result.duplicates.length} Ticket ID duplicados. Sus filas se conservaron y se incluyen en los totales.`,
    });
  result.validTickets = result.tickets.length;
  result.invalidRows = result.invalidRowDetails.length;
  result.summary = {
    statuses: countValues(
      result.tickets.map((ticket) => ticket.status),
      KNOWN_STATUSES,
    ),
    priorities: countValues(
      result.tickets.map((ticket) => ticket.priority),
      KNOWN_PRIORITIES,
    ),
    ticketTypes: countValues(result.tickets.map((ticket) => ticket.ticketType)),
  };
  result.success = result.validTickets > 0;
  if (!result.success)
    result.errors.push("No se encontraron tickets válidos en el archivo.");
  return result;
}
