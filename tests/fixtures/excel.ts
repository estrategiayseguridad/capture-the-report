import { Buffer } from "node:buffer";
import { utils, write } from "xlsx";

export const HEADERS = [
  "Ticket ID",
  "Summary",
  "Status",
  "Date Created",
  "Hour Created",
  "Category",
  "Team",
  "ITIL Type",
  "Ticket Type",
  "Assigned Agent",
  "User Name",
  "Client",
  "SLA",
  "Time to Respond (Decimal)",
  "Time to Resolve (Decimal)",
  "Priority",
];

export function ticketRow(overrides: Record<string, unknown> = {}): unknown[] {
  const data: Record<string, unknown> = {
    "Ticket ID": "SYN-001",
    Summary: "Ticket sintético",
    Status: "Closed",
    "Date Created": new Date(2026, 5, 1),
    "Hour Created": "08:30",
    Category: "Prueba",
    Team: "CSC sintético",
    "ITIL Type": "Solicitud",
    "Ticket Type": "Solicitud",
    "Assigned Agent": "Agente sintético",
    "User Name": "Usuario sintético",
    Client: "Cliente sintético",
    SLA: "Sin evaluar",
    "Time to Respond (Decimal)": 0.5,
    "Time to Resolve (Decimal)": 2,
    Priority: "Baja",
    ...overrides,
  };
  return HEADERS.map((header) => data[header] ?? null);
}

export function workbookBuffer(
  sheets: { name: string; rows: unknown[][] }[],
): Buffer {
  const workbook = utils.book_new();
  for (const sheet of sheets)
    utils.book_append_sheet(
      workbook,
      utils.aoa_to_sheet(sheet.rows),
      sheet.name,
    );
  return Buffer.from(write(workbook, { type: "buffer", bookType: "xlsx" }));
}

/** Synthetic acceptance fixture, not a copy or inspection of the user's reference workbook. */
export function referenceFixture(): Buffer {
  const rows = Array.from({ length: 24 }, (_, index) =>
    ticketRow({
      "Ticket ID": `SYN-${String(index + 1).padStart(3, "0")}`,
      Status: index < 20 ? "Closed" : "With User",
      Priority: index < 21 ? "Baja" : "Media",
      "Ticket Type": index < 18 ? "Solicitud" : "Solicitud de Reporte",
      "Time to Respond (Decimal)": index === 0 ? 0.0165048607777773 : 0.5,
    }),
  );
  return workbookBuffer([
    { name: "Portada", rows: [["Datos sintéticos de prueba"]] },
    {
      name: "Tickets CSC",
      rows: [["Prueba de importación"], HEADERS, ...rows],
    },
  ]);
}
