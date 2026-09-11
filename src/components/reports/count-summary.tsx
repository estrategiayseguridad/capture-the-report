import type { CountEntry } from "@/types/excel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CountSummary({
  title,
  label,
  entries,
}: {
  title: string;
  label: string;
  entries: CountEntry[];
}) {
  return (
    <Card className="min-w-0 shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table aria-label={title}>
          <TableHeader>
            <TableRow>
              <TableHead>{label}</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.label}>
                <TableCell className="whitespace-normal break-words">
                  {entry.label || "Sin valor"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {entry.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
