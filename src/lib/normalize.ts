const ACCENT_MAP: Record<string, string> = {
  Á: "A",
  É: "E",
  Í: "I",
  Ó: "O",
  Ú: "U",
  Ü: "U",
  Ñ: "N",
  À: "A",
  È: "E",
  Ì: "I",
  Ò: "O",
  Ù: "U",
};

export function stripAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[ÁÉÍÓÚÜÑÀÈÌÒÙáéíóúüñàèìòù]/g, (ch) => {
      const upper = ch.toUpperCase();
      return ACCENT_MAP[upper] ?? upper;
    });
}

export function collapseWhitespace(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeText(value: string): string {
  return collapseWhitespace(stripAccents(value)).toUpperCase();
}

export function normalizeDocumentNumber(value: string): string {
  return stripAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseMoney(value: string | number | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return roundMoney(value);
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const compact = raw.replace(/\s/g, "");
  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  let normalized = compact.replace(/[^0-9,.-]/g, "");
  if (lastComma > lastDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? roundMoney(parsed) : null;
}

export function parseFlexibleDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = collapseWhitespace(value);
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = text.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    if (Number(month) > 12 && Number(day) <= 12) {
      return `${year}-${day}-${month}`;
    }
    return `${year}-${month}-${day}`;
  }
  return null;
}

export function detectCurrency(value: string): string {
  const text = normalizeText(value);
  if (text.includes("USD") || text.includes("US$") || /\bDOLAR/.test(text)) return "USD";
  if (text.includes("EUR") || text.includes("EURO")) return "EUR";
  if (text.includes("GTQ") || /\bQ\b/.test(text) || text.includes("QUETZAL")) return "GTQ";
  return "GTQ";
}
