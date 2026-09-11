import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewReportButton() {
  return (
    <Button asChild>
      <Link href="/reportes/nuevo">
        <Plus aria-hidden="true" />
        Nuevo reporte
      </Link>
    </Button>
  );
}
