import type { Ticket } from "@/types/ticket";
import type { ImportWarning } from "@/types/excel";
import type { TicketColumn } from "@/validators/excel.validator";
import {
  cellText,
  hoursToMinutes,
  normalizePriority,
  normalizeStatus,
  normalizeTicketType,
  parseExcelNumber,
} from "./normalization";

export function mapTicket(
  get: (column: TicketColumn) => unknown,
  ticketId: string,
  row: number,
): { ticket: Ticket; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const warn = (
    code: ImportWarning["code"],
    field: TicketColumn,
    message: string,
  ) =>
    warnings.push({
      code,
      row,
      ticketId,
      field,
      originalValue: cellText(get(field)),
      message,
    });
  const duration = (column: TicketColumn): number | null => {
    const parsed = parseExcelNumber(get(column));
    if (parsed.issue || (parsed.value !== null && parsed.value < 0)) {
      warn(
        "INVALID_NUMBER",
        column,
        `${column}: valor ${parsed.issue === "empty" ? "vacío" : "inválido"}; se conserva sin duración numérica.`,
      );
      return null;
    }
    return parsed.value;
  };
  const timeToRespondOriginal = duration("Time to Respond (Decimal)");
  let timeToRespondMinutes =
    timeToRespondOriginal === null
      ? null
      : hoursToMinutes(timeToRespondOriginal);
  if (timeToRespondMinutes !== null && !Number.isFinite(timeToRespondMinutes)) {
    warn(
      "INVALID_NUMBER",
      "Time to Respond (Decimal)",
      "La conversión a minutos supera el rango numérico permitido.",
    );
    timeToRespondMinutes = null;
  }
  const timeToResolveHours = duration("Time to Resolve (Decimal)");
  const status = normalizeStatus(get("Status"));
  const priority = normalizePriority(get("Priority"));
  if (!status.recognized)
    warn(
      "UNKNOWN_STATUS",
      "Status",
      "Estado no reconocido; se conserva el valor original.",
    );
  if (!priority.recognized)
    warn(
      "UNKNOWN_PRIORITY",
      "Priority",
      "Severidad no reconocida; se conserva el valor original.",
    );
  for (const column of ["Summary", "Ticket Type"] as const) {
    if (!cellText(get(column)).trim())
      warn("EMPTY_VALUE", column, `${column} está vacío.`);
  }
  const optionalText = (column: TicketColumn) => {
    const text = cellText(get(column));
    return text.trim() ? text : null;
  };
  const slaValue = get("SLA");
  return {
    warnings,
    ticket: {
      sourceRow: row,
      ticketId,
      summary: cellText(get("Summary")),
      status: status.value,
      dateCreated: optionalText("Date Created"),
      hourCreated: optionalText("Hour Created"),
      category: optionalText("Category"),
      team: optionalText("Team"),
      itilType: optionalText("ITIL Type"),
      ticketType: normalizeTicketType(get("Ticket Type")),
      assignedAgent: optionalText("Assigned Agent"),
      userName: optionalText("User Name"),
      client: optionalText("Client"),
      sla:
        typeof slaValue === "number" && Number.isFinite(slaValue)
          ? slaValue
          : optionalText("SLA"),
      timeToRespondOriginal,
      timeToRespondMinutes,
      timeToResolveHours,
      priority: priority.value,
    },
  };
}
