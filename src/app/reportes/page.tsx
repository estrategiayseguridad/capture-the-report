import { PageHeading } from "@/components/layout/page-heading";
import { NewReportButton } from "@/components/reports/new-report-button";
import { ReportsTable } from "@/components/reports/reports-table";

export const metadata = { title: "Historial de reportes" };

export default function ReportsPage() {
  return (
    <>
      <PageHeading
        title="Historial de reportes"
        description="Consulta los reportes mensuales de tus clientes."
      >
        <NewReportButton />
      </PageHeading>
      <ReportsTable />
    </>
  );
}
