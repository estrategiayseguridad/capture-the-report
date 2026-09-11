import { z } from "zod";
import type { HeaderMapping } from "@/types/excel";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_SHEET_ROWS = 10_000;
export const MAX_SHEET_COLUMNS = 256;
export const HEADER_SEARCH_ROWS = 50;

export const REQUIRED_COLUMNS = [
  "Ticket ID",
  "Summary",
  "Status",
  "Ticket Type",
  "Time to Respond (Decimal)",
  "Time to Resolve (Decimal)",
  "Priority",
] as const;
export const OPTIONAL_COLUMNS = [
  "Date Created",
  "Hour Created",
  "Category",
  "Team",
  "ITIL Type",
  "Assigned Agent",
  "User Name",
  "Client",
  "SLA",
] as const;
export type TicketColumn =
  (typeof REQUIRED_COLUMNS)[number] | (typeof OPTIONAL_COLUMNS)[number];

export const excelFileSchema = z.object({
  name: z
    .string()
    .regex(/\.xlsx$/i, "Selecciona un archivo con extensión .xlsx."),
  size: z
    .number()
    .int()
    .positive("El archivo está vacío.")
    .max(MAX_FILE_SIZE, "El archivo supera el límite de 10 MB."),
});
export const ticketIdSchema = z
  .string()
  .trim()
  .min(1, "La fila no tiene Ticket ID.");

export function normalizeHeader(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
export function mapHeaders(values: readonly unknown[]): HeaderMapping[] {
  return values.flatMap((value, columnIndex) => {
    if (typeof value !== "string" || !value.trim()) return [];
    return [
      { columnIndex, original: value, normalized: normalizeHeader(value) },
    ];
  });
}
export function missingRequiredColumns(headers: HeaderMapping[]): string[] {
  const found = new Set(headers.map((header) => header.normalized));
  return REQUIRED_COLUMNS.filter(
    (column) => !found.has(normalizeHeader(column)),
  );
}
export function duplicateKnownColumns(headers: HeaderMapping[]): string[] {
  const known = new Set(
    [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].map(normalizeHeader),
  );
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const header of headers) {
    if (known.has(header.normalized) && seen.has(header.normalized))
      duplicates.add(header.original.trim());
    seen.add(header.normalized);
  }
  return [...duplicates];
}
