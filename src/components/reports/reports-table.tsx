import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLUMNS = [
  "Cliente",
  "Mes",
  "Año",
  "Tickets",
  "Estado",
  "Fecha de generación",
  "Acciones",
];

export function ReportsTable() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table className="min-w-[740px]" aria-label="Historial de reportes">
        <TableHeader>
          <TableRow className="bg-muted/50">
            {COLUMNS.map((column) => (
              <TableHead key={column} scope="col" className="h-12 px-5">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMNS.length} className="h-64 text-center">
              <FileText
                className="mx-auto mb-4 size-8 text-slate-400"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                No existen reportes generados.
              </p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
