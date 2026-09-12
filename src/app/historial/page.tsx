import { PageHeading } from "@/components/layout/page-heading";
import { HistoryWorkspace } from "@/components/history/history-workspace";

export const metadata = { title: "Historial" };

export default function HistoryPage() {
  return (
    <>
      <PageHeading
        title="Historial anual de tickets"
        description="Consulta, completa y guarda los tickets mensuales de cada cliente."
      />
      <HistoryWorkspace />
    </>
  );
}
