import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="rounded-lg bg-accent p-2.5 text-primary">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
