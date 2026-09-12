import { money } from "@/lib/format";

export function ChartBars({
  items,
}: {
  items: { name: string; total: number }[];
}) {
  const max = Math.max(...items.map((item) => item.total), 1);
  if (!items.length) return <p className="text-sm text-slate-500">Sin datos</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium">{money(item.total)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-600" style={{ width: `${(item.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
