import { Buffer } from "node:buffer";
import { expect, test } from "@playwright/test";
import { importExcel } from "../../src/services/excel/excel.service";
import {
  hoursToMinutes,
  normalizePriority,
  normalizeStatus,
  parseExcelNumber,
} from "../../src/services/excel/normalization";
import {
  excelFileSchema,
  MAX_FILE_SIZE,
} from "../../src/validators/excel.validator";
import {
  HEADERS,
  referenceFixture,
  ticketRow,
  workbookBuffer,
} from "../fixtures/excel";

test("decimal hours convert to minutes without replacing the original", () => {
  expect(hoursToMinutes(0.5)).toBe(30);
  const result = importExcel(referenceFixture(), "synthetic.xlsx");
  expect(result.tickets[0].timeToRespondOriginal).toBe(0.0165048607777773);
  expect(result.tickets[0].timeToRespondMinutes).toBe(0.0165048607777773 * 60);
  expect(result.tickets[0].timeToResolveHours).toBe(2);
});

test("normalizes known labels and preserves unknown values", () => {
  expect(normalizeStatus(" closed ").value).toBe("Closed");
  expect(normalizeStatus("WITH   USER").value).toBe("With User");
  expect(normalizePriority("MEDIA").value).toBe("Media");
  expect(normalizePriority("CRITICA").value).toBe("Crítica");
  expect(normalizeStatus("Escalado")).toEqual({
    value: "Escalado",
    recognized: false,
  });
  expect(normalizePriority("Urgente")).toEqual({
    value: "Urgente",
    recognized: false,
  });
});

test("parses whole numeric strings safely, distinguishing blanks from zero", () => {
  for (const value of [0.5, "0.5", " 0,5 ", "5e-1"])
    expect(parseExcelNumber(value).value).toBe(0.5);
  expect(parseExcelNumber(0)).toEqual({ value: 0, issue: null });
  for (const value of [null, undefined, " "])
    expect(parseExcelNumber(value)).toEqual({ value: null, issue: "empty" });
  for (const value of [
    "12abc",
    "0x10",
    "1,234.56",
    true,
    Infinity,
    NaN,
    "1e999",
  ])
    expect(parseExcelNumber(value)).toEqual({ value: null, issue: "invalid" });
});

test("detects the ticket sheet after a cover and preserves the header map", () => {
  const result = importExcel(referenceFixture(), "synthetic.xlsx");
  expect(result.success).toBe(true);
  expect(result.sheetName).toBe("Tickets CSC");
  expect(result.headerRow).toBe(2);
  expect(result.validTickets).toBe(24);
  expect(result.totalRows).toBe(24);
  expect(result.invalidRows).toBe(0);
  expect(result.warnings).toEqual([]);
  expect(result.summary.statuses).toEqual([
    { label: "Closed", count: 20 },
    { label: "With User", count: 4 },
    { label: "Open", count: 0 },
  ]);
  expect(result.summary.priorities).toEqual([
    { label: "Crítica", count: 0 },
    { label: "Alta", count: 0 },
    { label: "Media", count: 3 },
    { label: "Baja", count: 21 },
  ]);
  expect(result.summary.ticketTypes).toEqual([
    { label: "Solicitud", count: 18 },
    { label: "Solicitud de Reporte", count: 6 },
  ]);
  expect(result.tickets[0].dateCreated).toContain("2026-06-01");
  expect(result.tickets[0].assignedAgent).toBe("Agente sintético");
});

test("normalizes header spaces and case without changing original labels", () => {
  const headers = HEADERS.map(
    (header) => ` ${header.toLowerCase().replaceAll(" ", "  ")} `,
  );
  const result = importExcel(
    workbookBuffer([{ name: "Tickets", rows: [headers, ticketRow()] }]),
    "test.xlsx",
  );
  expect(result.success).toBe(true);
  expect(result.headers[0]).toEqual({
    columnIndex: 0,
    original: " ticket  id ",
    normalized: "ticket id",
  });
});

test("missing required columns prevent all processing", () => {
  const headers = HEADERS.filter(
    (header) => !["Priority", "Ticket Type"].includes(header),
  );
  const result = importExcel(
    workbookBuffer([{ name: "Incomplete", rows: [headers, ["SYN-001"]] }]),
    "test.xlsx",
  );
  expect(result.success).toBe(false);
  expect(result.missingColumns).toEqual(["Ticket Type", "Priority"]);
  expect(result.tickets).toEqual([]);
  expect(result.errors).toContain(
    "El archivo no contiene todas las columnas requeridas.",
  );
});

test("bad durations warn without removing a ticket or manufacturing zero", () => {
  const result = importExcel(
    workbookBuffer([
      {
        name: "Tickets",
        rows: [
          HEADERS,
          ticketRow({
            "Time to Respond (Decimal)": "12abc",
            "Time to Resolve (Decimal)": null,
            Status: "Escalado",
            Priority: "Urgente",
            "Ticket Type": "Nuevo tipo",
          }),
        ],
      },
    ]),
    "test.xlsx",
  );
  expect(result.success).toBe(true);
  expect(result.tickets[0]).toMatchObject({
    timeToRespondOriginal: null,
    timeToRespondMinutes: null,
    timeToResolveHours: null,
    status: "Escalado",
    priority: "Urgente",
    ticketType: "Nuevo tipo",
  });
  expect(result.warnings.map((warning) => warning.code)).toEqual([
    "INVALID_NUMBER",
    "INVALID_NUMBER",
    "UNKNOWN_STATUS",
    "UNKNOWN_PRIORITY",
  ]);
  expect(result.warnings[0].originalValue).toBe("12abc");
});

test("duplicate IDs stay visible; empty rows are skipped and missing IDs are reported", () => {
  const result = importExcel(
    workbookBuffer([
      {
        name: "Tickets",
        rows: [
          HEADERS,
          ticketRow(),
          [],
          ticketRow(),
          ticketRow({ "Ticket ID": null }),
        ],
      },
    ]),
    "test.xlsx",
  );
  expect(result.validTickets).toBe(2);
  expect(result.totalRows).toBe(3);
  expect(result.invalidRows).toBe(1);
  expect(result.invalidRowDetails[0].row).toBe(5);
  expect(result.duplicates).toEqual([{ ticketId: "SYN-001", rows: [2, 4] }]);
});

test("multiple complete sheets select the first and emit a warning", () => {
  const result = importExcel(
    workbookBuffer([
      { name: "First", rows: [HEADERS, ticketRow()] },
      { name: "Second", rows: [HEADERS, ticketRow()] },
    ]),
    "test.xlsx",
  );
  expect(result.sheetName).toBe("First");
  expect(result.candidateSheets).toEqual(["First", "Second"]);
  expect(result.warnings[0].code).toBe("MULTIPLE_SHEETS");
});

test("rejects renamed text, corrupt ZIP, wrong extension and empty files", () => {
  expect(
    importExcel(Buffer.from("Ticket ID,Summary\n1,Fake"), "fake.xlsx").success,
  ).toBe(false);
  expect(
    importExcel(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0]), "corrupt.xlsx")
      .success,
  ).toBe(false);
  expect(importExcel(referenceFixture(), "test.xlsm").success).toBe(false);
  expect(importExcel(Buffer.alloc(0), "empty.xlsx").success).toBe(false);
  expect(
    excelFileSchema.safeParse({ name: "large.xlsx", size: MAX_FILE_SIZE + 1 })
      .success,
  ).toBe(false);
});

test("a complete header without tickets reports a clear error", () => {
  const result = importExcel(
    workbookBuffer([{ name: "Empty", rows: [HEADERS] }]),
    "test.xlsx",
  );
  expect(result.errors).toContain(
    "No se encontraron tickets válidos en el archivo.",
  );
});
