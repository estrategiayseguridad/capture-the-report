import { expect, test } from "@playwright/test";
import {
  buildAnnualHistory,
  historyToChart,
  mergeImportedPeriod,
  historyFromForm,
  historyFormDefaults,
} from "../../src/services/history/history-data";
import { getMonthName } from "../../src/lib/months";
import {
  historyFormSchema,
  saveHistorySchema,
} from "../../src/validators/history";

test("builds twelve months, preserves null and includes only recorded months in the chart", () => {
  const history = buildAnnualHistory("client-a", 2026, [
    { month: 1, totalTickets: 15 },
    { month: 2, totalTickets: 15 },
    { month: 3, totalTickets: 17 },
  ]);
  expect(history.months).toHaveLength(12);
  expect(history.months[3].totalTickets).toBeNull();
  expect(historyToChart(history)).toEqual({
    title: "HISTORIAL DE TICKETS 2026",
    items: [
      { label: "Enero", value: 15 },
      { label: "Febrero", value: 15 },
      { label: "Marzo", value: 17 },
    ],
  });
  expect(getMonthName(12)).toBe("Diciembre");
  expect(() => getMonthName(0)).toThrow();
});

test("imported month wins visually and reports conflicts without mutating saved history", () => {
  const saved = buildAnnualHistory("client-a", 2026, [
    { month: 6, totalTickets: 23, source: "MANUAL" },
  ]);
  saved.months.forEach(Object.freeze);
  Object.freeze(saved.months);
  Object.freeze(saved);
  const imported = Object.freeze({
    clientName: "Synthetic",
    year: 2026,
    month: 6,
    totalTickets: 24,
  });
  const result = mergeImportedPeriod(saved, imported);
  expect(result.history.months[5]).toEqual({
    month: 6,
    totalTickets: 24,
    source: "IMPORT",
  });
  expect(result.history.months[6].totalTickets).toBeNull();
  expect(result.conflict).toEqual({
    month: 6,
    savedTotal: 23,
    importedTotal: 24,
  });
  expect(saved.months[5].totalTickets).toBe(23);
  const nextYear = mergeImportedPeriod(
    buildAnnualHistory("client-a", 2027, []),
    imported,
  );
  expect(nextYear.history.months[5].totalTickets).toBeNull();
});

test("reference history combines manually entered previous months with imported June", () => {
  const saved = buildAnnualHistory(
    "client-a",
    2026,
    [15, 15, 17, 15, 23].map((totalTickets, index) => ({
      month: index + 1,
      totalTickets,
      source: "MANUAL",
    })),
  );
  const { history } = mergeImportedPeriod(saved, {
    clientName: "Synthetic",
    year: 2026,
    month: 6,
    totalTickets: 24,
  });
  expect(historyToChart(history).items.map((item) => item.value)).toEqual([
    15, 15, 17, 15, 23, 24,
  ]);
  expect(
    history.months.slice(6).every((row) => row.totalTickets === null),
  ).toBe(true);
});

test("zero is valid and distinct from a blank; invalid values never reach persistence", () => {
  const form = (value: string) => ({
    values: [value, ...Array<string>(11).fill("")],
  });
  for (const value of ["-5", "1.5", "abc", "NaN", "1e3", "2147483648"])
    expect(historyFormSchema.safeParse(form(value)).success).toBe(false);
  expect(historyFormSchema.safeParse(form("0")).success).toBe(true);
  expect(historyFormSchema.safeParse(form("")).success).toBe(true);
  const baseline = buildAnnualHistory("client-a", 2026, []);
  const draft = historyFromForm(baseline, form("0").values);
  expect(draft.months[0].totalTickets).toBe(0);
  expect(draft.months[1].totalTickets).toBeNull();
  expect(historyToChart(draft).items).toEqual([{ label: "Enero", value: 0 }]);
  expect(historyFormDefaults(draft).values.slice(0, 2)).toEqual(["0", ""]);
  const payload = {
    clientId: "client-a",
    year: 2026,
    months: [{ month: 1, totalTickets: 0, source: "MANUAL" }],
  };
  expect(saveHistorySchema.safeParse(payload).success).toBe(true);
  expect(
    saveHistorySchema.safeParse({
      ...payload,
      months: [...payload.months, ...payload.months],
    }).success,
  ).toBe(false);
  expect(
    saveHistorySchema.safeParse({
      ...payload,
      months: [{ month: 1, totalTickets: -5, source: "MANUAL" }],
    }).success,
  ).toBe(false);
});

test("manual overrides change provenance without changing source data", () => {
  const original = buildAnnualHistory("client-a", 2026, [
    { month: 6, totalTickets: 24, source: "IMPORT" },
  ]);
  const values = historyFormDefaults(original).values;
  values[5] = "22";
  const draft = historyFromForm(original, values);
  expect(draft.months[5].source).toBe("MANUAL");
  expect(original.months[5]).toEqual({
    month: 6,
    totalTickets: 24,
    source: "IMPORT",
  });
});
