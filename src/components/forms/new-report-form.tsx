"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { reportFormSchema, type ReportFormValues } from "@/validators/report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const selectClassName =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50";

export function NewReportForm() {
  const { register } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { clientId: "", month: "", year: "" },
  });
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      aria-describedby="import-note"
      className="space-y-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="client">Cliente</Label>
          <select
            id="client"
            {...register("clientId")}
            disabled
            className={selectClassName}
          >
            <option value="">Sin clientes registrados</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">Mes</Label>
          <select id="month" {...register("month")} className={selectClassName}>
            <option value="">Selecciona un mes</option>
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Año</Label>
          <Input
            id="year"
            type="number"
            placeholder="AAAA"
            {...register("year")}
          />
        </div>
      </div>
      <div className="space-y-3">
        <Label htmlFor="file">Archivo XLSX</Label>
        <div className="rounded-xl border border-dashed border-slate-300 bg-background p-6">
          <Upload className="mb-3 size-6 text-primary" aria-hidden="true" />
          <Input
            id="file"
            type="file"
            accept=".xlsx"
            aria-describedby="import-note"
            className="max-w-md bg-white"
          />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Archivo de tickets del período seleccionado.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          id="import-note"
          className="max-w-sm text-xs leading-5 text-muted-foreground"
        >
          La importación estará disponible próximamente. Los datos y archivos
          seleccionados no se envían ni se guardan.
        </p>
        <Button type="button" disabled>
          <Upload aria-hidden="true" />
          Importar y analizar
        </Button>
      </div>
    </form>
  );
}
