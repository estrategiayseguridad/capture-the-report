export type HistorySource = "MANUAL" | "IMPORT";

export interface HistoryClient {
  id: string;
  name: string;
}

export interface MonthlyTicketCount {
  month: number;
  totalTickets: number | null;
  source?: HistorySource;
}

export interface AnnualTicketHistory {
  clientId: string;
  year: number;
  months: MonthlyTicketCount[];
}

export interface ImportedHistoryPeriod {
  clientName: string;
  year: number;
  month: number;
  totalTickets: number;
}

export interface HistoryConflict {
  month: number;
  savedTotal: number;
  importedTotal: number;
}
