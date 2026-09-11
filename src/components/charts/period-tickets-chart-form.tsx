"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus } from "lucide-react";
import type { PeriodChartData } from "@/types/chart";
import { periodToBarData } from "@/services/charts/chart-data.service";
import {
  periodChartFormSchema,
  type PeriodChartFormValues,
} from "@/validators/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartValidationMessage } from "./chart-validation-message";
import { SimpleBarChart } from "./simple-bar-chart";

interface Props {
  detected: PeriodChartData;
  applied: PeriodChartData | null;
  totalTickets: number;
  active: boolean;
  onApply: (data: PeriodChartData) => void;
}

export function PeriodTicketsChartForm({
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
  } = useForm<PeriodChartFormValues>({
    resolver: zodResolver(periodChartFormSchema),
    defaultValues: defaults,
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const values = useWatch({ control });
  const parsed = periodChartFormSchema.safeParse(values);
  const total = parsed.success
    ? parsed.data.items.reduce((sum, item) => sum + Number(item.value), 0)
    : null;
  const submit = (values: PeriodChartFormValues) =>
    onApply({
      title: detected.title,
      items: values.items.map((item) => ({
        ...item,
        value: Number(item.value),
      })),
    });

  return (
    <section
      aria-label="Tickets del período"
      className="min-w-0 space-y-5 rounded-xl border bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold">TICKETS DEL PERÍODO</h2>
      <div className="grid min-w-0 gap-6 2xl:grid-cols-2">
        <form
          noValidate
          onSubmit={handleSubmit(submit)}
          className="min-w-0 space-y-4"
        >
          <Table aria-label="Configuración del período">
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  {(["ticketType", "priority", "value"] as const).map(
                    (name) => {
                      const label =
                        name === "ticketType"
                          ? "Tipo"
                          : name === "priority"
                            ? "Severidad"
                            : "Cantidad";
                      const error = errors.items?.[index]?.[name];
                      const errorId = `period-${field.id}-${name}-error`;
                      return (
                        <TableCell key={name} className="align-top">
                          <Input
                            className={
                              name === "value" ? "min-w-24" : "min-w-36"
                            }
                            aria-label={`${label} fila ${index + 1}`}
                            type={name === "value" ? "number" : "text"}
                            min={name === "value" ? 0 : undefined}
                            step={name === "value" ? 1 : undefined}
                            aria-invalid={!!error}
                            aria-describedby={error ? errorId : undefined}
                            {...register(`items.${index}.${name}`)}
                          />
                          {error && (
                            <p
                              id={errorId}
                              className="mt-1 max-w-52 whitespace-normal text-sm text-red-700"
                            >
                              {error.message}
                            </p>
                          )}
                        </TableCell>
                      );
                    },
                  )}
                  <TableCell className="align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar fila ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Agrega al menos una fila.
            </p>
          )}
          {errors.root && (
            <p role="alert" className="text-sm text-red-700">
              {errors.root.message}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ ticketType: "", priority: "", value: "0" })}
          >
            <Plus className="size-4" />
            Agregar fila
          </Button>
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
            <SimpleBarChart data={periodToBarData(applied)} />
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
