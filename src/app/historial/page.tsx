import { CalendarDays } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Historial" };

export default function HistoryPage() {
  return (
    <>
      <PageHeading
        title="Historial anual de tickets"
        description="Aquí se mostrará posteriormente el historial mensual de tickets por cliente."
      />
      <Card className="shadow-none">
        <CardContent className="py-16 text-center">
          <CalendarDays
            className="mx-auto mb-4 size-9 text-slate-400"
            aria-hidden="true"
          />
          <h2 className="font-medium">
            El historial estará disponible próximamente
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Todavía no hay información mensual para mostrar.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
