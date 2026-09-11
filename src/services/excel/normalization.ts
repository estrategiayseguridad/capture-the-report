import { SSF } from "xlsx";

// SheetJS does not type this formatter API; contain the boundary here.
const dateParser = SSF as {
  parse_date_code(
    value: number,
    options: { date1904: boolean },
  ): {
    y: number;
    m: number;
    d: number;
    H: number;
    M: number;
    S: number;
  } | null;
};

export type NumericResult =
  { value: number; issue: null } | { value: null; issue: "empty" | "invalid" };

/** Decimal text only: optional sign, dot or comma decimal separator, exponent. No thousands separators. */
export function parseExcelNumber(input: unknown): NumericResult {
  if (
    input === null ||
    input === undefined ||
    (typeof input === "string" && input.trim() === "")
  )
    return { value: null, issue: "empty" };
  if (typeof input === "number")
    return Number.isFinite(input)
      ? { value: input, issue: null }
      : { value: null, issue: "invalid" };
  if (
    typeof input !== "string" ||
    !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(input.trim())
  )
    return { value: null, issue: "invalid" };
  const value = Number(input.trim().replace(",", "."));
  return Number.isFinite(value)
    ? { value, issue: null }
    : { value: null, issue: "invalid" };
}
export function hoursToMinutes(hours: number): number {
  return hours * 60;
}

/** Excel serials describe wall-clock dates, not UTC instants. Preserve that calendar date. */
export function excelDateText(
  value: unknown,
  date1904: boolean,
  timeOnly = false,
): unknown {
  if (typeof value !== "number" || !Number.isFinite(value)) return value;
  const date = dateParser.parse_date_code(value, { date1904 });
  if (!date) return value;
  const pad = (part: number) => String(part).padStart(2, "0");
  const time = `${pad(date.H)}:${pad(date.M)}:${pad(Math.floor(date.S))}`;
  if (timeOnly) return time;
  const day = `${String(date.y).padStart(4, "0")}-${pad(date.m)}-${pad(date.d)}`;
  return date.H || date.M || date.S ? `${day}T${time}` : day;
}

export function cellText(input: unknown): string {
  if (input instanceof Date)
    return Number.isNaN(input.getTime()) ? "" : input.toISOString();
  if (typeof input === "string") return input;
  if (typeof input === "number" && Number.isFinite(input)) return String(input);
  if (typeof input === "boolean") return String(input);
  return "";
}

function normalizeKnown(
  input: unknown,
  known: readonly string[],
  stripAccents = false,
): { value: string; recognized: boolean } {
  const original = cellText(input);
  const key = (text: string) => {
    const normalized = text.trim().replace(/\s+/g, " ").toLowerCase();
    return stripAccents
      ? normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : normalized;
  };
  const match = known.find((value) => key(value) === key(original));
  return { value: match ?? original, recognized: match !== undefined };
}
export const KNOWN_STATUSES = ["Closed", "With User", "Open"] as const;
export const KNOWN_PRIORITIES = ["Crítica", "Alta", "Media", "Baja"] as const;
const KNOWN_TICKET_TYPES = [
  "Incidente",
  "Alerta",
  "Solicitud",
  "Solicitud de Reporte",
] as const;
export function normalizeStatus(input: unknown) {
  return normalizeKnown(input, KNOWN_STATUSES);
}
export function normalizePriority(input: unknown) {
  return normalizeKnown(input, KNOWN_PRIORITIES, true);
}
export function normalizeTicketType(input: unknown) {
  return normalizeKnown(input, KNOWN_TICKET_TYPES).value;
}
