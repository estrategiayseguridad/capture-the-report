import type { AnnualTicketHistory, HistoryClient } from "@/types/history";
import type { SaveHistoryInput } from "@/validators/history";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data: unknown = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
        ? data.error
        : "No fue posible completar la solicitud.",
    );
  return data as T;
}

export const historyApi = {
  clients: () => request<HistoryClient[]>("/api/clientes"),
  resolveClient: (name: string) =>
    request<HistoryClient>("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),
  get: (clientId: string, year: number) =>
    request<AnnualTicketHistory>(
      `/api/historial?${new URLSearchParams({ clientId, year: String(year) })}`,
    ),
  save: (input: SaveHistoryInput) =>
    request<AnnualTicketHistory>("/api/historial", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
};
