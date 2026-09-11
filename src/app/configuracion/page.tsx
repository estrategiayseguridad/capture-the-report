import { Building2, FileText, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Configuración" };
const SECTIONS = [
  {
    title: "Clientes",
    description:
      "Administración de los clientes del CSC y su información general.",
    icon: Building2,
  },
  {
    title: "Configuración SLA",
    description:
      "Objetivos de primera atención, resolución y cumplimiento por severidad.",
    icon: ShieldCheck,
  },
  {
    title: "Plantillas de reportes",
    description:
      "Plantillas corporativas para la presentación de los reportes mensuales.",
    icon: FileText,
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Configuración"
        description="Administra las preferencias de tus reportes CSC."
      />
      <div className="grid gap-5 xl:grid-cols-3">
        {SECTIONS.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="shadow-none">
            <CardHeader>
              <Icon className="mb-4 size-6 text-primary" aria-hidden="true" />
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="min-h-16 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <span className="mt-5 inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Próximamente
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
