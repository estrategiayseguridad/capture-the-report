import { CheckCheck, Clock3, FolderOpen, Ticket } from "lucide-react";
import type { ExcelImportResult } from "@/types/excel";
import { StatCard } from "@/components/dashboard/stat-card";
import { CountSummary } from "@/components/reports/count-summary";

export function ImportSummary({ result }: { result: ExcelImportResult }) {
  const countStatus = (label: string) =>
    String(
      result.summary.statuses.find((entry) => entry.label === label)?.count ??
        0,
    );
  const otherStatuses = result.summary.statuses.filter(
    (entry) => !["Closed", "With User", "Open"].includes(entry.label),
  );
  return (
    <>
      <div className="rounded-xl border bg-white p-5 text-sm">
        <p className="break-words font-medium">
          {result.context?.clientName} · {result.context?.month}/
          {result.context?.year}
        </p>
        <dl className="mt-4 grid gap-4 text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <dt>Archivo</dt>
            <dd className="mt-1 break-all font-medium text-foreground">
              {result.fileName}
            </dd>
          </div>
          <div>
            <dt>Hoja procesada</dt>
            <dd className="mt-1 break-words font-medium text-foreground">
              {result.sheetName}
            </dd>
          </div>
          <div>
            <dt>Fila de encabezados</dt>
            <dd className="mt-1 font-medium text-foreground">
              {result.headerRow}
            </dd>
          </div>
          <div>
            <dt>Filas con datos</dt>
            <dd className="mt-1 font-medium text-foreground">
              {result.totalRows}
            </dd>
          </div>
          <div>
            <dt>Filas inválidas</dt>
            <dd className="mt-1 font-medium text-foreground">
              {result.invalidRows}
            </dd>
          </div>
          <div>
            <dt>Advertencias</dt>
            <dd className="mt-1 font-medium text-foreground">
              {result.warnings.length}
            </dd>
          </div>
        </dl>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tickets"
          value={String(result.validTickets)}
          icon={Ticket}
        />
        <StatCard
          label="Closed"
          value={countStatus("Closed")}
          icon={CheckCheck}
        />
        <StatCard
          label="With User"
          value={countStatus("With User")}
          icon={Clock3}
        />
        <StatCard label="Open" value={countStatus("Open")} icon={FolderOpen} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <CountSummary
          title="Resumen por prioridad"
          label="Severidad"
          entries={result.summary.priorities}
        />
        <CountSummary
          title="Resumen por tipo de ticket"
          label="Tipo de ticket"
          entries={result.summary.ticketTypes}
        />
      </div>
      {otherStatuses.length > 0 && (
        <CountSummary
          title="Otros estados encontrados"
          label="Estado"
          entries={otherStatuses}
        />
      )}
    </>
  );
}
