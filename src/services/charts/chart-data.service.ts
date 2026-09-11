import type { Ticket } from "@/types/ticket";
import type {
  PeriodChartData,
  ReportChartData,
  TicketStatusChartData,
} from "@/types/chart";

const STATUSES = ["Closed", "With User", "Open"] as const;
const TYPES = ["Incidente", "Alerta", "Solicitud", "Solicitud de Reporte"];
const PRIORITIES = ["Crítica", "Alta", "Media", "Baja"];

function key(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function canonical(
  value: string,
  known: readonly string[],
  fallback: string,
): string {
  return (
    known.find((label) => key(label) === key(value)) ??
    (value.trim() || fallback)
  );
}

function compare(a: string, b: string, order: readonly string[]): number {
  const rank = (value: string) => {
    const index = order.indexOf(value);
    return index < 0 ? order.length : index;
  };
  return rank(a) - rank(b) || a.localeCompare(b, "es");
}

export function getTicketStatusChartData(
  tickets: readonly Ticket[],
): TicketStatusChartData {
  const counts = new Map<string, number>(STATUSES.map((label) => [label, 0]));
  const unknown = new Map<string, number>();
  for (const ticket of tickets) {
    const label = canonical(ticket.status, STATUSES, "Sin estado");
    const target = counts.has(label) ? counts : unknown;
    target.set(label, (target.get(label) ?? 0) + 1);
  }
  const items = (counts: Map<string, number>) =>
    Array.from(counts, ([label, value]) => ({ label, value }));
  return {
    title: "ESTADOS DE LOS TICKETS",
    items: items(counts),
    unrecognized: items(unknown),
  };
}

export function getPeriodTicketsChartData(
  tickets: readonly Ticket[],
): PeriodChartData {
  const groups = new Map<string, PeriodChartData["items"][number]>();
  for (const ticket of tickets) {
    const ticketType = canonical(ticket.ticketType, TYPES, "Sin tipo");
    const priority = canonical(ticket.priority, PRIORITIES, "Sin severidad");
    const groupKey = JSON.stringify([ticketType, priority]);
    const group = groups.get(groupKey);
    if (group) group.value++;
    else groups.set(groupKey, { ticketType, priority, value: 1 });
  }
  return {
    title: "TICKETS DEL PERÍODO",
    items: Array.from(groups.values()).sort(
      (a, b) =>
        compare(a.ticketType, b.ticketType, TYPES) ||
        compare(a.priority, b.priority, PRIORITIES),
    ),
  };
}

export function periodToBarData(data: PeriodChartData): ReportChartData {
  return {
    title: data.title,
    items: data.items.map(({ ticketType, priority, value }) => ({
      label: `${ticketType} - ${priority}`,
      value,
    })),
  };
}
