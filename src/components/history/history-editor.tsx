"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMonthName } from "@/lib/months";
import type {
  AnnualTicketHistory,
  ImportedHistoryPeriod,
} from "@/types/history";
import type { ReportChartData } from "@/types/chart";
import {
  historyFormSchema,
  type HistoryFormValues,
} from "@/validators/history";
import {
  historyFromForm,
  historyFormDefaults,
  historyToChart,
  mergeImportedPeriod,
} from "@/services/history/history-data";
import { historyApi } from "@/services/history/history.api";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HistoryEditor({
  initial,
  imported,
  active,
}: {
  initial: AnnualTicketHistory;
  imported?: ImportedHistoryPeriod;
  active: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const { history: baseline, conflict } = useMemo(
    () => mergeImportedPeriod(saved, imported),
    [saved, imported],
  );
  const [chart, setChart] = useState<ReportChartData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HistoryFormValues>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: historyFormDefaults(baseline),
    mode: "onChange",
  });
  const values = useWatch({ control, name: "values" });

  async function save(values: HistoryFormValues) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const draft = historyFromForm(baseline, values.values);
      const result = await historyApi.save({
        ...draft,
        months: draft.months.map((row) => ({
          ...row,
          source: row.source ?? "MANUAL",
        })),
      });
      setSaved(result);
      reset(historyFormDefaults(result));
      setMessage(
        "Historial guardado. La vista previa cambia al pulsar Generar / Actualizar gráfica.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el historial.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function restore() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await historyApi.get(saved.clientId, saved.year);
      const restored = mergeImportedPeriod(result, imported).history;
      setSaved(result);
      reset(historyFormDefaults(restored));
      setChart(historyToChart(restored));
      setMessage(
        "Valores restablecidos desde el historial guardado y el período importado. No se modificó la base de datos.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible recuperar el historial.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section aria-label="Edición del historial" className="min-w-0 space-y-5">
      {conflict && (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {getMonthName(conflict.month)}: el historial guardado indica{" "}
          {conflict.savedTotal} tickets, pero el archivo importado contiene{" "}
          {conflict.importedTotal}. Se propone el valor importado. Solo Guardar
          historial actualizará el registro.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {message}
        </p>
      )}
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(save)(event);
          }}
          className="min-w-0 rounded-xl border bg-white p-5"
        >
          <fieldset disabled={busy} className="space-y-4">
            <legend className="mb-3 font-semibold">
              Tickets por mes · {saved.year}
            </legend>
            {baseline.months.map((row, index) => {
              const current =
                imported?.year === saved.year && imported.month === row.month;
              const edited =
                values[index] !== "" &&
                Number(values[index]) !== row.totalTickets;
              return (
                <div
                  key={row.month}
                  className={`rounded-lg p-2 ${current ? "border border-teal-200 bg-teal-50" : ""}`}
                >
                  <div className="grid grid-cols-[minmax(90px,1fr)_minmax(0,1fr)] items-center gap-3">
                    <Label htmlFor={`history-month-${row.month}`}>
                      {getMonthName(row.month)}
                    </Label>
                    <Input
                      id={`history-month-${row.month}`}
                      type="number"
                      min="0"
                      max="2147483647"
                      step="1"
                      placeholder="Sin registrar"
                      aria-invalid={!!errors.values?.[index]}
                      aria-describedby={
                        errors.values?.[index]
                          ? `history-error-${row.month}`
                          : undefined
                      }
                      {...register(`values.${index}`)}
                    />
                  </div>
                  {current && (
                    <p className="mt-2 text-xs text-teal-900">
                      ✓ Datos del período actual · Importado del XLSX:{" "}
                      {imported.totalTickets}
                      {edited ? " · Ajuste manual" : ""}
                    </p>
                  )}
                  {!current && row.source && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {edited
                        ? "Ajuste manual"
                        : row.source === "IMPORT"
                          ? "Origen guardado: XLSX"
                          : "Origen guardado: manual"}
                    </p>
                  )}
                  {errors.values?.[index] && (
                    <p
                      id={`history-error-${row.month}`}
                      className="mt-1 text-xs text-red-700"
                    >
                      {errors.values[index]?.message}
                    </p>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Vacío significa sin registrar; 0 significa un mes registrado sin
              tickets. Los campos vacíos no borran valores ya guardados.
            </p>
            <p className="text-xs text-muted-foreground">
              {isDirty
                ? "Hay cambios sin guardar."
                : "Revisa los valores antes de guardar."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                {busy ? "Procesando..." : "Guardar historial"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleSubmit((values) =>
                    setChart(
                      historyToChart(historyFromForm(baseline, values.values)),
                    ),
                  )();
                }}
              >
                Generar / Actualizar gráfica
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void restore();
                }}
              >
                Restablecer
              </Button>
            </div>
          </fieldset>
        </form>
        <div className="min-w-0 space-y-3">
          {chart && chart.items.length > 0 && active ? (
            <SimpleBarChart data={chart} minCategoryWidth={72} />
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-8 text-sm text-muted-foreground">
              {chart?.items.length === 0
                ? "No hay meses con datos para graficar."
                : "Revisa los meses y pulsa Generar / Actualizar gráfica para ver el historial."}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            La gráfica muestra solo meses con datos. Generar la vista previa no
            guarda el historial.
          </p>
        </div>
      </div>
    </section>
  );
}
