export interface ChartDataItem {
  label: string;
  value: number;
}

export interface ReportChartData {
  title: string;
  items: ChartDataItem[];
}

export interface TicketStatusChartData extends ReportChartData {
  unrecognized: ChartDataItem[];
}

export interface PeriodChartItem {
  ticketType: string;
  priority: string;
  value: number;
}

export interface PeriodChartData {
  title: string;
  items: PeriodChartItem[];
}

/** Applied overrides only. Imported tickets and unfinished form drafts live separately. */
export interface ReportChartsConfig {
  statusChart: ReportChartData | null;
  periodChart: PeriodChartData | null;
}
