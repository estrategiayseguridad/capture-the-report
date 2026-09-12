export function money(value: number, currency = "GTQ"): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function shortDate(iso: string): string {
  if (!iso) return "—";
  const day = iso.slice(0, 10);
  const [y, m, d] = day.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function catalogName(items: { id: string; name?: string; nombre?: string }[], id: string) {
  return items.find((item) => item.id === id)?.name ?? items.find((item) => item.id === id)?.nombre ?? "—";
}

export const ui = {
  btnPrimary:
    "inline-flex items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50",
  input:
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-teal-700/30 focus:ring-2",
  card: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  label: "text-sm font-medium text-slate-700",
};
