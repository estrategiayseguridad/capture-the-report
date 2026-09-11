import type { Ticket } from "@/types/ticket";

export interface HeaderMapping {
  columnIndex: number;
  original: string;
  normalized: string;
}

export interface ImportWarning {
  code:
    | "INVALID_NUMBER"
    | "UNKNOWN_STATUS"
    | "UNKNOWN_PRIORITY"
    | "EMPTY_VALUE"
    | "DUPLICATE_ID"
    | "INVALID_ROW"
    | "MULTIPLE_SHEETS";
  message: string;
  row?: number;
  ticketId?: string;
  field?: string;
  originalValue?: string;
}

export interface CountEntry {
  label: string;
  count: number;
}

export interface ExcelImportResult {
  success: boolean;
  fileName: string;
  sheetName: string | null;
  headerRow: number | null;
  headers: HeaderMapping[];
  candidateSheets: string[];
  totalRows: number;
  validTickets: number;
  invalidRows: number;
  invalidRowDetails: { row: number; reason: string }[];
  duplicates: { ticketId: string; rows: number[] }[];
  tickets: Ticket[];
  summary: {
    statuses: CountEntry[];
    priorities: CountEntry[];
    ticketTypes: CountEntry[];
  };
  warnings: ImportWarning[];
  errors: string[];
  missingColumns: string[];
  context?: { clientName: string; month: number; year: number };
}

export function emptyImportResult(fileName = ""): ExcelImportResult {
  return {
    success: false,
    fileName,
    sheetName: null,
    headerRow: null,
    headers: [],
    candidateSheets: [],
    totalRows: 0,
    validTickets: 0,
    invalidRows: 0,
    invalidRowDetails: [],
    duplicates: [],
    tickets: [],
    summary: { statuses: [], priorities: [], ticketTypes: [] },
    warnings: [],
    errors: [],
    missingColumns: [],
  };
}
