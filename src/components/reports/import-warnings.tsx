import type { ExcelImportResult } from "@/types/excel";

export function ImportWarnings({ result }: { result: ExcelImportResult }) {
  if (!result.warnings.length) return null;
  return (
    <details
      open
      className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"
    >
      <summary className="cursor-pointer font-semibold">
        Advertencias ({result.warnings.length})
      </summary>
      <div className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-2">
        <ul className="space-y-3">
          {result.warnings.map((warning, index) => (
            <li key={index} className="break-words">
              {warning.row && (
                <span className="font-semibold">
                  Fila {warning.row}
                  {warning.ticketId ? ` · ${warning.ticketId}` : ""}:{" "}
                </span>
              )}
              {warning.message}
              {warning.originalValue !== undefined && (
                <span className="block text-xs">
                  Valor original: {warning.originalValue || "(vacío)"}
                </span>
              )}
            </li>
          ))}
        </ul>
        {result.duplicates.length > 0 && (
          <div className="border-t border-amber-200 pt-3">
            <p className="font-semibold">IDs duplicados</p>
            <ul className="mt-2 space-y-1">
              {result.duplicates.map((duplicate) => (
                <li key={duplicate.ticketId} className="break-words">
                  {duplicate.ticketId}: filas {duplicate.rows.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
