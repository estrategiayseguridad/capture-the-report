import { labelOf, STATUS_TONES } from "@/lib/status";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONES[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {labelOf(status)}
    </span>
  );
}
