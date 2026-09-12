export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export function getMonthName(month: number): string {
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new RangeError("Mes inválido.");
  return MONTH_NAMES[month - 1];
}
