"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HistoryClient, ImportedHistoryPeriod } from "@/types/history";
import { historyApi } from "@/services/history/history.api";
import { historyYearSchema } from "@/validators/history";
import { HistoryPanel } from "./history-panel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HistoryWorkspace({
  imported,
  active = true,
}: {
  imported?: ImportedHistoryPeriod;
  active?: boolean;
}) {
  const [loaded, setLoaded] = useState<{
    clients: HistoryClient[];
    importedClientId?: string;
  } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [year, setYear] = useState(
    String(imported?.year ?? new Date().getFullYear()),
  );
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const clientName = imported?.clientName;
  useEffect(() => {
    let canceled = false;
    async function load() {
      const currentClient = clientName
        ? await historyApi.resolveClient(clientName)
        : undefined;
      const clients = await historyApi.clients();
      if (!canceled)
        setLoaded({ clients, importedClientId: currentClient?.id });
    }
    void load().catch(() => {
      if (!canceled)
        setError(
          "No fue posible cargar los clientes. Comprueba la conexión e inténtalo nuevamente.",
        );
    });
    return () => {
      canceled = true;
    };
  }, [clientName, attempt]);
  if (error)
    return (
      <div role="alert" className="space-y-3 rounded-xl border p-5">
        <p>{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  if (!loaded) return <p role="status">Cargando clientes...</p>;
  if (!loaded.clients.length)
    return (
      <div className="space-y-4 rounded-xl border bg-white p-6">
        <p>
          No hay clientes registrados. Importa un XLSX y entra al paso Historial
          para vincular el cliente del reporte.
        </p>
        <Button asChild>
          <Link href="/reportes/nuevo">Nuevo reporte</Link>
        </Button>
      </div>
    );
  const clientId = selected ?? loaded.importedClientId ?? loaded.clients[0].id;
  const validYear = historyYearSchema.safeParse(Number(year));
  const matchingImport =
    clientId === loaded.importedClientId && imported?.year === Number(year)
      ? imported
      : undefined;
  return (
    <section aria-label="Historial anual" className="min-w-0 space-y-6">
      <div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="history-client">Cliente</Label>
          <select
            id="history-client"
            value={clientId}
            onChange={(event) => setSelected(event.target.value)}
            className="h-10 w-full min-w-0 rounded-md border bg-white px-3 text-sm"
          >
            {loaded.clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="history-year">Año</Label>
          <Input
            id="history-year"
            type="number"
            min="1000"
            max="9999"
            step="1"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            aria-invalid={!validYear.success}
          />
          {!validYear.success && (
            <p className="text-sm text-red-700">
              Ingresa un año de cuatro dígitos.
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Cada cliente y año tiene su propio historial. Guarda tus cambios antes
          de cambiar los filtros o salir de esta página.
        </p>
      </div>
      {validYear.success && (
        <HistoryPanel
          key={`${clientId}-${validYear.data}`}
          clientId={clientId}
          year={validYear.data}
          imported={matchingImport}
          active={active}
        />
      )}
    </section>
  );
}
