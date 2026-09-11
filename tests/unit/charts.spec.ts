import { expect, test } from "@playwright/test";
import type { Ticket } from "../../src/types/ticket";
import {
  getTicketStatusChartData,
  getPeriodTicketsChartData,
  periodToBarData,
} from "../../src/services/charts/chart-data.service";
import {
  periodChartFormSchema,
  statusChartFormSchema,
} from "../../src/validators/chart";
import { importExcel } from "../../src/services/excel/excel.service";
import { chartReferenceFixture } from "../fixtures/charts";

function ticket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    sourceRow: 2,
    ticketId: "SYN-1",
    summary: "Sintético",
    status: "Closed",
    ticketType: "Solicitud",
    priority: "Baja",
    dateCreated: null,
    hourCreated: null,
    category: null,
    team: null,
    itilType: null,
    assignedAgent: null,
    userName: null,
    client: null,
    sla: null,
    timeToRespondOriginal: null,
    timeToRespondMinutes: null,
    timeToResolveHours: null,
    ...overrides,
  };
}

test("status counts include zero categories and tolerate unknown statuses", () => {
  expect(
    getTicketStatusChartData([
      ticket(),
      ticket(),
      ticket({ status: "With User" }),
    ]).items,
  ).toEqual([
    { label: "Closed", value: 2 },
    { label: "With User", value: 1 },
    { label: "Open", value: 0 },
  ]);
  const unknown = getTicketStatusChartData([ticket({ status: "Escalado" })]);
  expect(unknown.items.map((item) => item.value)).toEqual([0, 0, 0]);
  expect(unknown.unrecognized).toEqual([{ label: "Escalado", value: 1 }]);
  expect(getTicketStatusChartData([]).items).toHaveLength(3);
});

test("period counts group type and severity together with priority ordering", () => {
  expect(
    getPeriodTicketsChartData([
      ticket(),
      ticket(),
      ticket({ priority: "Media" }),
      ticket({ ticketType: "Solicitud de Reporte" }),
    ]).items,
  ).toEqual([
    { ticketType: "Solicitud", priority: "Media", value: 1 },
    { ticketType: "Solicitud", priority: "Baja", value: 2 },
    { ticketType: "Solicitud de Reporte", priority: "Baja", value: 1 },
  ]);
});

test("new types and severities survive, known categories sort first and normalize", () => {
  const data = getPeriodTicketsChartData([
    ticket({ ticketType: "Nuevo tipo", priority: "Urgente" }),
    ticket({ ticketType: "alerta", priority: "ALTA" }),
    ticket({ ticketType: "Incidente", priority: "critica" }),
    ticket({ ticketType: "Incidente", priority: "Crítica" }),
  ]);
  expect(data.items).toEqual([
    { ticketType: "Incidente", priority: "Crítica", value: 2 },
    { ticketType: "Alerta", priority: "Alta", value: 1 },
    { ticketType: "Nuevo tipo", priority: "Urgente", value: 1 },
  ]);
  expect(getPeriodTicketsChartData([]).items).toEqual([]);
});

test("aggregation and later overrides never mutate or alias source tickets", () => {
  const tickets = Object.freeze([
    Object.freeze(ticket()),
    Object.freeze(ticket({ status: "Open", priority: "Alta" })),
  ]);
  const original = JSON.stringify(tickets);
  const statuses = getTicketStatusChartData(tickets);
  const period = getPeriodTicketsChartData(tickets);
  statuses.items[0].value = 999;
  period.items[0].ticketType = "Manual";
  period.items[0].value = 0;
  expect(JSON.stringify(tickets)).toBe(original);
  expect(getTicketStatusChartData(tickets).items[0].value).toBe(1);
  expect(getPeriodTicketsChartData(tickets).items[0].ticketType).toBe(
    "Solicitud",
  );
});

test("synthetic June workbook produces the requested joint distribution", () => {
  const imported = importExcel(
    chartReferenceFixture(),
    "synthetic-june-charts.xlsx",
  );
  expect(imported.success).toBe(true);
  expect(imported.tickets).toHaveLength(24);
  expect(
    getTicketStatusChartData(imported.tickets).items.map((item) => item.value),
  ).toEqual([20, 4, 0]);
  expect(
    periodToBarData(getPeriodTicketsChartData(imported.tickets)).items,
  ).toEqual([
    { label: "Solicitud - Media", value: 3 },
    { label: "Solicitud - Baja", value: 15 },
    { label: "Solicitud de Reporte - Baja", value: 6 },
  ]);
});

test("form validation rejects invalid counts, blank labels, duplicates and unsafe totals", () => {
  const statuses = (value: string) => ({
    items: [
      { label: "Closed", value },
      { label: "With User", value: "0" },
      { label: "Open", value: "0" },
    ],
  });
  const period = (value: string) => ({
    items: [{ ticketType: "Solicitud", priority: "Baja", value }],
  });
  for (const value of [
    "",
    " ",
    "-1",
    "1.5",
    "hola",
    "NaN",
    "Infinity",
    "1e3",
    "9007199254740992",
  ]) {
    expect(statusChartFormSchema.safeParse(statuses(value)).success).toBe(
      false,
    );
    expect(periodChartFormSchema.safeParse(period(value)).success).toBe(false);
  }
  for (const value of ["0", "19", "37"]) {
    expect(statusChartFormSchema.safeParse(statuses(value)).success).toBe(true);
    expect(periodChartFormSchema.safeParse(period(value)).success).toBe(true);
  }
  expect(periodChartFormSchema.safeParse({ items: [] }).success).toBe(false);
  expect(
    periodChartFormSchema.safeParse({
      items: [{ ticketType: " ", priority: "Baja", value: "1" }],
    }).success,
  ).toBe(false);
  const row = period("1").items[0];
  expect(
    periodChartFormSchema.safeParse({
      items: [row, { ...row, ticketType: " solicitud " }],
    }).success,
  ).toBe(false);
  expect(
    periodChartFormSchema.safeParse({
      items: [
        { ...row, value: String(Number.MAX_SAFE_INTEGER) },
        { ...row, ticketType: "Alerta" },
      ],
    }).success,
  ).toBe(false);
});
