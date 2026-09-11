"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReportChartData, TicketStatusChartData } from "@/types/chart";
import {
  statusChartFormSchema,
  type StatusChartFormValues,
} from "@/validators/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartValidationMessage } from "./chart-validation-message";
import { SimpleBarChart } from "./simple-bar-chart";

interface Props {
  detected: TicketStatusChartData;
  applied: ReportChartData | null;
  totalTickets: number;
  active: boolean;
  onApply: (data: ReportChartData) => void;
}

export function TicketStatusChartForm({
  detected,
  applied,
  totalTickets,
  active,
  onApply,
}: Props) {
  const defaults = {
    items: detected.items.map((item) => ({
      ...item,
      value: String(item.value),
    })),
  };
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusChartFormValues>({
    resolver: zodResolver(statusChartFormSchema),
    defaultValues: defaults,
    mode: "onChange",
  });
  const values = useWatch({ control });
  const parsed = statusChartFormSchema.safeParse(values);
  const total = parsed.success
    ? parsed.data.items.reduce((sum, item) => sum + Number(item.value), 0)
    : null;
  const submit = (values: StatusChartFormValues) =>
    onApply({
      title: detected.title,
      items: values.items.map((item) => ({
        ...item,
        value: Number(item.value),
      })),
    });

  return (
    <section
      aria-label="Estados de los tickets"
      className="space-y-5 rounded-xl border bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold">ESTADOS DE LOS TICKETS</h2>
      {detected.unrecognized.length > 0 && (
        <p
          role="status"
          className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
        >
          Estados fuera de las tres categorías:{" "}
          {detected.unrecognized
            .map((item) => `${item.label} (${item.value})`)
            .join(", ")}
          . Se conservan en los tickets y en el total XLSX, pero no tienen barra
          en esta gráfica.
        </p>
      )}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
        <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
          {detected.items.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <Label htmlFor={`status-${index}`}>{item.label}</Label>
              <Input
                id={`status-${index}`}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                aria-invalid={!!errors.items?.[index]?.value}
                aria-describedby={
                  errors.items?.[index]?.value
                    ? `status-error-${index}`
                    : undefined
                }
                {...register(`items.${index}.value`)}
              />
              {errors.items?.[index]?.value && (
                <p
                  id={`status-error-${index}`}
                  className="text-sm text-red-700"
                >
                  {errors.items[index]?.value?.message}
                </p>
              )}
            </div>
          ))}
          {errors.root && (
            <p role="alert" className="text-sm text-red-700">
              {errors.root.message}
            </p>
          )}
          <ChartValidationMessage total={total} importedTotal={totalTickets} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset(defaults);
                onApply({
                  title: detected.title,
                  items: detected.items.map((item) => ({ ...item })),
                });
              }}
            >
              Restablecer valores
            </Button>
            <Button type="submit">Generar / Actualizar gráfica</Button>
          </div>
        </form>
        <div className="min-w-0">
          {applied && active ? (
            <SimpleBarChart data={applied} />
          ) : (
            <p className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
              Revisa los valores y pulsa Generar / Actualizar gráfica para ver
              la vista previa.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
