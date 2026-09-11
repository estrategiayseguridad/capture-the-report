import { utils, type WorkBook, type WorkSheet } from "xlsx";
import type { HeaderMapping } from "@/types/excel";
import {
  HEADER_SEARCH_ROWS,
  MAX_SHEET_COLUMNS,
  MAX_SHEET_ROWS,
  mapHeaders,
  missingRequiredColumns,
  REQUIRED_COLUMNS,
} from "@/validators/excel.validator";

export interface SheetCandidate {
  sheetName: string;
  headerIndex: number;
  headers: HeaderMapping[];
  missingColumns: string[];
}

export function cellValue(
  sheet: WorkSheet,
  row: number,
  column: number,
): unknown {
  const cell = sheet[utils.encode_cell({ r: row, c: column })];
  return cell?.t === "e" ? (cell.w ?? "Error de Excel") : cell?.v;
}

export function sheetRange(sheet: WorkSheet) {
  const range = utils.decode_range(sheet["!fullref"] ?? sheet["!ref"] ?? "A1");
  if (
    range.e.r >= MAX_SHEET_ROWS + HEADER_SEARCH_ROWS ||
    range.e.c >= MAX_SHEET_COLUMNS
  ) {
    throw new Error(
      "La hoja supera el límite de 10 000 filas de datos o 256 columnas. Reduce el archivo antes de importarlo.",
    );
  }
  return range;
}

/** Returns all candidates in workbook order, ready for a future manual sheet selector. */
export function detectTicketSheets(workbook: WorkBook): {
  candidates: SheetCandidate[];
  closest: SheetCandidate | null;
} {
  const candidates: SheetCandidate[] = [];
  let closest: SheetCandidate | null = null;
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet["!ref"]) continue;
    const range = sheetRange(sheet);
    for (
      let row = range.s.r;
      row <= Math.min(range.e.r, HEADER_SEARCH_ROWS - 1);
      row++
    ) {
      const values = Array.from({ length: range.e.c + 1 }, (_, column) =>
        cellValue(sheet, row, column),
      );
      const headers = mapHeaders(values);
      const missingColumns = missingRequiredColumns(headers);
      const candidate = {
        sheetName,
        headerIndex: row,
        headers,
        missingColumns,
      };
      if (
        missingColumns.length < REQUIRED_COLUMNS.length &&
        (!closest || missingColumns.length < closest.missingColumns.length)
      )
        closest = candidate;
      if (missingColumns.length === 0) {
        candidates.push(candidate);
        break;
      }
    }
  }
  return { candidates, closest };
}
