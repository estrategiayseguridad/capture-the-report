import {
  Building2,
  CalendarDays,
  FileCheck2,
  Files,
  Ticket,
} from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { NewReportButton } from "@/components/reports/new-report-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeading
        title="CSC Report Automation"
        description="Sistema de automatización de reportes mensuales CSC"
      >
        <NewReportButton />
      </PageHeading>
      <section
        aria-label="Resumen general"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Reportes generados" value="0" icon={FileCheck2} />
        <StatCard label="Clientes" value="0" icon={Building2} />
        <StatCard label="Tickets procesados" value="0" icon={Ticket} />
        <StatCard
          label="Último reporte"
          value="Sin reportes"
          icon={CalendarDays}
        />
      </section>
      <section aria-labelledby="recent-reports">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-reports" className="text-base font-semibold">
            Actividad de reportes
          </h2>
          <span className="text-xs text-muted-foreground">Resumen mensual</span>
        </div>
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-5 rounded-2xl border bg-background p-4">
              <Files className="size-7 text-primary" aria-hidden="true" />
            </span>
            <h3 className="font-semibold">Tus reportes, en un solo lugar</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Aún no hay reportes generados. Aquí encontrarás el resumen de tu
              actividad mensual.
            </p>
            <div className="mt-6">
              <NewReportButton />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
