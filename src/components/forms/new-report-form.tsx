"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Upload } from "lucide-react";
import { reportFormSchema, type ReportFormValues } from "@/validators/report";
import { excelFileSchema } from "@/validators/excel.validator";
import { emptyImportResult, type ExcelImportResult } from "@/types/excel";
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
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50";

interface NewReportFormProps {
  onResetResult: () => void;
  onResult: (result: ExcelImportResult) => void;
}

export function NewReportForm({ onResetResult, onResult }: NewReportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const submitting = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { clientName: "", month: "", year: "" },
  });

  async function submit(values: ReportFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    onResetResult();
    try {
      const fileValidation = file
        ? excelFileSchema.safeParse({ name: file.name, size: file.size })
        : null;
      if (!file || !fileValidation?.success) {
        setFileError(
          fileValidation && !fileValidation.success
            ? fileValidation.error.issues[0].message
            : "Selecciona un archivo XLSX.",
        );
        return;
      }
      setFileError("");
      const formData = new FormData();
      formData.set("clientName", values.clientName);
      formData.set("month", values.month);
      formData.set("year", values.year);
      formData.set("file", file);
      const response = await fetch("/api/reportes/importar", {
        method: "POST",
        body: formData,
      });
      const result: ExcelImportResult = await response.json();
      if (typeof result.success !== "boolean" || !Array.isArray(result.errors))
        throw new Error("Unexpected import response");
      onResult(result);
    } catch {
      const result = emptyImportResult(file?.name);
      result.errors.push(
        "No fue posible procesar el archivo. Comprueba la conexión e inténtalo nuevamente.",
      );
      onResult(result);
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
      onChange={onResetResult}
      aria-describedby="import-note"
    >
      <fieldset disabled={isSubmitting} className="space-y-7">
        <legend className="sr-only">Datos de la importación</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              placeholder="Banco INV"
              autoComplete="organization"
              aria-invalid={Boolean(errors.clientName)}
              aria-describedby={errors.clientName ? "client-error" : undefined}
              {...register("clientName")}
            />
            {errors.clientName && (
              <p
                id="client-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.clientName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Mes</Label>
            <select
              id="month"
              className={selectClassName}
              aria-invalid={Boolean(errors.month)}
              aria-describedby={errors.month ? "month-error" : undefined}
              {...register("month")}
            >
              <option value="">Selecciona un mes</option>
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            {errors.month && (
              <p
                id="month-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.month.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Año</Label>
            <Input
              id="year"
              type="number"
              placeholder="2026"
              aria-invalid={Boolean(errors.year)}
              aria-describedby={errors.year ? "year-error" : undefined}
              {...register("year")}
            />
            {errors.year && (
              <p
                id="year-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {errors.year.message}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="file">Archivo XLSX</Label>
          <div className="rounded-xl border border-dashed border-slate-300 bg-background p-6">
            <Upload className="mb-3 size-6 text-primary" aria-hidden="true" />
            <Input
              id="file"
              name="file"
              type="file"
              accept=".xlsx"
              aria-invalid={Boolean(fileError)}
              aria-describedby={
                fileError ? "file-error import-note" : "import-note"
              }
              className="max-w-md bg-white"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setFileError("");
              }}
            />
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Archivo de tickets del período seleccionado. Solo XLSX, máximo 10
              MB.
            </p>
          </div>
          {fileError && (
            <p
              id="file-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {fileError}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p
            id="import-note"
            className="max-w-sm text-xs leading-5 text-muted-foreground"
          >
            El archivo se procesa temporalmente. Los tickets y el archivo
            original no se guardan.
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload aria-hidden="true" />
            )}
            {isSubmitting ? "Analizando archivo..." : "Importar y analizar"}
          </Button>
        </div>
      </fieldset>
      <p role="status" className="sr-only">
        {isSubmitting ? "Analizando archivo..." : ""}
      </p>
    </form>
  );
}
