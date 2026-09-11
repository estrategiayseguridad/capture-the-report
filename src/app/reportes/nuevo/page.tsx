import { PageHeading } from "@/components/layout/page-heading";
import { ReportImport } from "@/components/reports/report-import";

export const metadata = { title: "Nuevo reporte" };

export default function NewReportPage() {
  return (
    <>
      <PageHeading
        title="Nuevo reporte CSC"
        description="Importa el archivo de tickets y revisa los datos de tu reporte mensual."
      />
      <ReportImport />
    </>
  );
}
