"use client";

import { useState } from "react";
import type { ExcelImportResult } from "@/types/excel";
import type { ReportChartsConfig } from "@/types/chart";
import { ReportCharts } from "@/components/reports/report-charts";
import { Button } from "@/components/ui/button";
import { HistoryWorkspace } from "@/components/history/history-workspace";
import { NewReportForm } from "@/components/forms/new-report-form";
import { ImportSummary } from "@/components/reports/import-summary";
import { ImportWarnings } from "@/components/reports/import-warnings";
import { TicketsTable } from "@/components/reports/tickets-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function ReportImport() {
  const [result, setResult] = useState<ExcelImportResult | null>(null);
  const [step, setStep] = useState<"import" | "charts" | "history">("import");
  const [historyVisited, setHistoryVisited] = useState(false);
  const [charts, setCharts] = useState<ReportChartsConfig>({
    statusChart: null,
    periodChart: null,
  });
  const resetResult = () => {
    setResult(null);
    setHistoryVisited(false);
    setCharts({ statusChart: null, periodChart: null });
  };
  const goToStep = (nextStep: "import" | "charts" | "history") => {
    if (nextStep === "history") setHistoryVisited(true);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <>
      <nav aria-label="Pasos del reporte" className="flex flex-wrap gap-2">
        <Button
          variant={step === "import" ? "default" : "outline"}
          aria-current={step === "import" ? "step" : undefined}
          onClick={() => goToStep("import")}
        >
          1. Importación
        </Button>
        <Button
          variant={step === "charts" ? "default" : "outline"}
          aria-current={step === "charts" ? "step" : undefined}
          onClick={() => goToStep("charts")}
        >
          2. Gráficas
        </Button>
        <Button
          variant={step === "history" ? "default" : "outline"}
          aria-current={step === "history" ? "step" : undefined}
          onClick={() => goToStep("history")}
        >
          3. Historial
        </Button>
        {["4. SLA", "5. Información", "6. Vista previa"].map((label) => (
          <Button key={label} variant="outline" disabled title="Próximamente">
            {label}
          </Button>
        ))}
      </nav>
      <div hidden={step !== "import"} className="min-w-0 space-y-6">
        <Card className="max-w-3xl shadow-none">
          <CardHeader>
            <CardTitle>Información del reporte</CardTitle>
            <CardDescription>
              Cliente, período y archivo de origen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewReportForm onResetResult={resetResult} onResult={setResult} />
          </CardContent>
        </Card>
        {result && (
          <section className="space-y-6" aria-label="Resultado de importación">
            <div>
              <h2 className="text-xl font-semibold">
                Resultado de importación
              </h2>
              <p role="status" className="mt-2 text-sm text-muted-foreground">
                {result.success
                  ? "Archivo válido. Revisa los datos importados y las advertencias antes de continuar."
                  : "La importación no se completó."}
              </p>
            </div>
            {result.errors.length > 0 && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900"
              >
                <ul className="list-inside list-disc space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
                {result.missingColumns.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold">
                      Columnas faltantes
                      {result.sheetName ? ` en ${result.sheetName}` : ""}:
                    </p>
                    <ul className="mt-2 list-inside list-disc">
                      {result.missingColumns.map((column) => (
                        <li key={column}>{column}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {result.success && <ImportSummary result={result} />}
            <ImportWarnings result={result} />
            {result.success && (
              <TicketsTable
                key={`${result.fileName}-${result.sheetName}`}
                tickets={result.tickets}
              />
            )}
          </section>
        )}
        {result?.success && (
          <Button onClick={() => goToStep("charts")}>
            Continuar a gráficas
          </Button>
        )}
      </div>
      <div hidden={step !== "charts"} className="min-w-0">
        {result?.success ? (
          <ReportCharts
            tickets={result.tickets}
            config={charts}
            onChange={setCharts}
            active={step === "charts"}
            onContinue={() => goToStep("history")}
          />
        ) : step === "charts" ? (
          <section className="space-y-4 rounded-xl border bg-white p-6">
            <p>Primero debe importar y analizar un archivo XLSX.</p>
            <Button variant="outline" onClick={() => goToStep("import")}>
              Regresar a Importación
            </Button>
          </section>
        ) : null}
      </div>
      <div hidden={step !== "history"} className="min-w-0 space-y-6">
        <h2 className="text-xl font-semibold">Historial anual de tickets</h2>
        {result?.success && result.context && historyVisited ? (
          <HistoryWorkspace
            imported={{
              ...result.context,
              totalTickets: result.tickets.length,
            }}
            active={step === "history"}
          />
        ) : step === "history" ? (
          <section className="space-y-4 rounded-xl border bg-white p-6">
            <p>Primero debe importar y analizar un archivo XLSX.</p>
            <Button variant="outline" onClick={() => goToStep("import")}>
              Regresar a Importación
            </Button>
          </section>
        ) : null}
      </div>
    </>
  );
}
