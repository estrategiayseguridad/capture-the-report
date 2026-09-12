import { MONTH_NAMES, getMonthName } from "@/lib/months";
import type {
  AnnualTicketHistory,
  MonthlyTicketCount,
  ImportedHistoryPeriod,
  HistoryConflict,
} from "@/types/history";
import type { ReportChartData } from "@/types/chart";

export function buildAnnualHistory(
  clientId: string,
  year: number,
  records: readonly MonthlyTicketCount[],
): AnnualTicketHistory {
  const byMonth = new Map(records.map((row) => [row.month, row]));
  return {
    clientId,
    year,
    months: MONTH_NAMES.map((_, index) => ({
      month: index + 1,
      totalTickets: null,
      ...byMonth.get(index + 1),
    })),
  };
}

/** The caller supplies an imported period only after matching the selected client. */
export function mergeImportedPeriod(
  saved: AnnualTicketHistory,
  imported?: ImportedHistoryPeriod,
): { history: AnnualTicketHistory; conflict: HistoryConflict | null } {
  const history = buildAnnualHistory(saved.clientId, saved.year, saved.months);
  let conflict: HistoryConflict | null = null;
  if (imported && imported.year === saved.year) {
    const row = history.months[imported.month - 1];
    if (row) {
      if (
        row.totalTickets !== null &&
        row.totalTickets !== imported.totalTickets
      )
        conflict = {
          month: imported.month,
          savedTotal: row.totalTickets,
          importedTotal: imported.totalTickets,
        };
      row.totalTickets = imported.totalTickets;
      row.source = "IMPORT";
    }
  }
  return { history, conflict };
}

export function historyToChart(history: AnnualTicketHistory): ReportChartData {
  return {
    title: `HISTORIAL DE TICKETS ${history.year}`,
    items: history.months
      .filter((row) => row.totalTickets !== null)
      .map((row) => ({
        label: getMonthName(row.month),
        value: row.totalTickets!,
      })),
  };
}

export function historyFormDefaults(history: AnnualTicketHistory): {
  values: string[];
} {
  return {
    values: history.months.map((row) =>
      row.totalTickets === null ? "" : String(row.totalTickets),
    ),
  };
}

export function historyFromForm(
  baseline: AnnualTicketHistory,
  values: readonly string[],
): AnnualTicketHistory {
  return {
    ...baseline,
    months: baseline.months.map((row, index) => {
      const totalTickets =
        values[index].trim() === "" ? null : Number(values[index]);
      return {
        ...row,
        totalTickets,
        source: totalTickets === row.totalTickets ? row.source : "MANUAL",
      };
    }),
  };
}
