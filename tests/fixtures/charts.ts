import { HEADERS, ticketRow, workbookBuffer } from "./excel";

/** Synthetic joint distribution for phase 3; the real June workbook was not provided. */
export function chartReferenceFixture() {
  return workbookBuffer([
    {
      name: "Tickets CSC",
      rows: [
        HEADERS,
        ...Array.from({ length: 24 }, (_, index) =>
          ticketRow({
            "Ticket ID": `CHART-${index + 1}`,
            Status: index < 20 ? "Closed" : "With User",
            "Ticket Type": index < 18 ? "Solicitud" : "Solicitud de Reporte",
            Priority: index >= 15 && index < 18 ? "Media" : "Baja",
          }),
        ),
      ],
    },
  ]);
}
