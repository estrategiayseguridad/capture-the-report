export function ChartValidationMessage({
  total,
  importedTotal,
}: {
  total: number | null;
  importedTotal: number;
}) {
  const matches = total === importedTotal;
  return (
    <div
      role="status"
      className={`rounded-lg border p-3 text-sm ${total === null ? "bg-muted" : matches ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}
    >
      <p>
        Total gráfica: {total ?? "—"} · Total XLSX: {importedTotal}
      </p>
      <p className="mt-1">
        {total === null
          ? "Revisa los campos antes de generar la gráfica."
          : matches
            ? "✓ Los valores coinciden."
            : `Advertencia: los valores de la gráfica suman ${total} tickets, pero el archivo contiene ${importedTotal}. Puedes aplicar este ajuste.`}
      </p>
    </div>
  );
}
