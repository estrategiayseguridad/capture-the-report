"use client";

import { useEffect, useState } from "react";
import type {
  AnnualTicketHistory,
  ImportedHistoryPeriod,
} from "@/types/history";
import { historyApi } from "@/services/history/history.api";
import { HistoryEditor } from "./history-editor";
import { Button } from "@/components/ui/button";

export function HistoryPanel({
  clientId,
  year,
  imported,
  active,
}: {
  clientId: string;
  year: number;
  imported?: ImportedHistoryPeriod;
  active: boolean;
}) {
  const [history, setHistory] = useState<AnnualTicketHistory | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let canceled = false;
    historyApi
      .get(clientId, year)
      .then((result) => {
        if (!canceled) setHistory(result);
      })
      .catch(() => {
        if (!canceled)
          setError(
            "No fue posible cargar el historial. Comprueba la conexión e inténtalo nuevamente.",
          );
      });
    return () => {
      canceled = true;
    };
  }, [clientId, year, attempt]);
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
  if (!history) return <p role="status">Cargando historial...</p>;
  return (
    <HistoryEditor initial={history} imported={imported} active={active} />
  );
}
