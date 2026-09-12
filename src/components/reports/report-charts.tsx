"use client";

import { useMemo } from "react";
import type { Ticket } from "@/types/ticket";
import type { ReportChartsConfig } from "@/types/chart";
import {
  getTicketStatusChartData,
  getPeriodTicketsChartData,
} from "@/services/charts/chart-data.service";
import { TicketStatusChartForm } from "@/components/charts/ticket-status-chart-form";
import { PeriodTicketsChartForm } from "@/components/charts/period-tickets-chart-form";
import { Button } from "@/components/ui/button";

interface Props {
  tickets: readonly Ticket[];
  config: ReportChartsConfig;
  onChange: (config: ReportChartsConfig) => void;
  active: boolean;
  onContinue: () => void;
}

export function ReportCharts({
  tickets,
  config,
  onChange,
  active,
  onContinue,
}: Props) {
  const detected = useMemo(
    () => ({
      status: getTicketStatusChartData(tickets),
      period: getPeriodTicketsChartData(tickets),
    }),
    [tickets],
  );
  return (
    <section aria-label="Gráficas del reporte" className="min-w-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Gráficas del reporte</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa los {tickets.length} tickets importados y ajusta los valores
          antes de generar cada gráfica. Los ajustes solo afectan a las
          gráficas.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Los datos se conservan mientras permanezcas en esta página; se pierden
          al recargar o salir.
        </p>
      </div>
      <TicketStatusChartForm
        detected={detected.status}
        applied={config.statusChart}
        totalTickets={tickets.length}
        active={active}
        onApply={(statusChart) => onChange({ ...config, statusChart })}
      />
      <PeriodTicketsChartForm
        detected={detected.period}
        applied={config.periodChart}
        totalTickets={tickets.length}
        active={active}
        onApply={(periodChart) => onChange({ ...config, periodChart })}
      />
      {config.statusChart && config.periodChart && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onContinue}>Continuar</Button>
        </div>
      )}
    </section>
  );
}
