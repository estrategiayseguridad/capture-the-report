"use client";

import { useState } from "react";
import type { ExcelImportResult } from "@/types/excel";
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
  return (
    <>
      <Card className="max-w-3xl shadow-none">
        <CardHeader>
          <CardTitle>Información del reporte</CardTitle>
          <CardDescription>
            Cliente, período y archivo de origen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewReportForm
            onResetResult={() => setResult(null)}
            onResult={setResult}
          />
        </CardContent>
      </Card>
      {result && (
        <section className="space-y-6" aria-label="Resultado de importación">
          <div>
            <h2 className="text-xl font-semibold">Resultado de importación</h2>
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
    </>
  );
}
