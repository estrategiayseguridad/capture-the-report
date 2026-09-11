"use client";

import { useState } from "react";
import type { Ticket } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 25;
const formatDuration = (value: number | null) =>
  value === null
    ? "Sin dato válido"
    : value.toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const visible = tickets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  return (
    <section className="min-w-0 space-y-4" aria-labelledby="tickets-title">
      <h3 id="tickets-title" className="text-lg font-semibold">
        Tickets importados ({tickets.length})
      </h3>
      <p className="text-xs text-muted-foreground">
        Primera respuesta: horas originales × 60 = minutos. Resolución permanece
        en horas. Los valores se redondean solo para mostrarlos.
      </p>
      <div className="overflow-hidden rounded-xl border bg-white">
        <Table className="min-w-[1050px]" aria-label="Tickets importados">
          <TableHeader>
            <TableRow>
              {[
                "Ticket ID",
                "Summary",
                "Status",
                "Ticket Type",
                "Priority",
                "Time to Respond Original",
                "Time to Respond (min)",
                "Time to Resolve (h)",
              ].map((column) => (
                <TableHead scope="col" key={column} className="px-4 py-3">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((ticket) => (
              <TableRow key={ticket.sourceRow}>
                <TableCell className="px-4 font-medium">
                  {ticket.ticketId}
                </TableCell>
                <TableCell className="max-w-80 whitespace-normal break-words px-4">
                  {ticket.summary || "Sin resumen"}
                </TableCell>
                <TableCell className="px-4">
                  {ticket.status || "Sin estado"}
                </TableCell>
                <TableCell className="px-4">
                  {ticket.ticketType || "Sin tipo"}
                </TableCell>
                <TableCell className="px-4">
                  {ticket.priority || "Sin severidad"}
                </TableCell>
                <TableCell className="px-4 tabular-nums">
                  {ticket.timeToRespondOriginal === null
                    ? "Sin dato válido"
                    : String(ticket.timeToRespondOriginal)}
                </TableCell>
                <TableCell className="px-4 tabular-nums">
                  {formatDuration(ticket.timeToRespondMinutes)}
                </TableCell>
                <TableCell className="px-4 tabular-nums">
                  {formatDuration(ticket.timeToResolveHours)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" role="status">
          Mostrando {page * PAGE_SIZE + 1}–
          {Math.min((page + 1) * PAGE_SIZE, tickets.length)} de {tickets.length}{" "}
          · Página {page + 1} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  );
}
