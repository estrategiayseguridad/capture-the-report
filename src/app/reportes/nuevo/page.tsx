import { PageHeading } from "@/components/layout/page-heading";
import { NewReportForm } from "@/components/forms/new-report-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata = { title: "Nuevo reporte" };

export default function NewReportPage() {
  return (
    <>
      <PageHeading
        title="Nuevo reporte CSC"
        description="En esta sección se realizará la importación y procesamiento del reporte mensual."
      />
      <Card className="max-w-3xl shadow-none">
        <CardHeader>
          <CardTitle>Información del reporte</CardTitle>
          <CardDescription>
            Cliente, período y archivo de origen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewReportForm />
        </CardContent>
      </Card>
    </>
  );
}
