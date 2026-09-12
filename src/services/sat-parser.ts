import { XMLParser } from "fast-xml-parser";
import { normalizeDocumentNumber, parseFlexibleDate, parseMoney } from "@/lib/normalize";

export type SatParseResult = {
  documentType: string | null;
  documentNumber: string | null;
  normalizedDocumentNumber: string | null;
  date: string | null;
  total: number | null;
  currency: string | null;
  issuer: string | null;
  recipient: string | null;
  format: "xml" | "json" | "csv" | "text" | "unknown";
  supported: boolean;
  notes: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function deepFind(obj: unknown, keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const record = obj as UnknownRecord;
  for (const [key, value] of Object.entries(record)) {
    const stripped = key.replace(/^.*:/, "");
    if (keys.includes(key) || keys.includes(stripped)) return value;
    if (typeof value === "object") {
      const nested = deepFind(value, keys);
      if (nested !== undefined) return nested;
    }
  }
  return undefined;
}

function textOf(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const rec = asRecord(value);
  if (!rec) return null;
  if (typeof rec["#text"] === "string") return rec["#text"];
  return null;
}

function fromJsonLike(data: UnknownRecord): SatParseResult {
  const documentNumber =
    textOf(data.documentNumber) ||
    textOf(data.numero) ||
    textOf(data.numeroAutorizacion) ||
    textOf(data.dte) ||
    null;
  const total = parseMoney(
    (data.total as string | number) ??
      (data.granTotal as string | number) ??
      (data.monto as string | number) ??
      null,
  );
  const date = parseFlexibleDate(
    textOf(data.date) || textOf(data.fecha) || textOf(data.fechaHoraEmision),
  );
  return {
    documentType: textOf(data.documentType) || textOf(data.tipo) || "FACT",
    documentNumber,
    normalizedDocumentNumber: documentNumber
      ? normalizeDocumentNumber(documentNumber)
      : null,
    date,
    total,
    currency: textOf(data.currency) || textOf(data.moneda) || "GTQ",
    issuer: textOf(data.issuer) || textOf(data.emisor) || textOf(data.proveedor),
    recipient: textOf(data.recipient) || textOf(data.receptor) || textOf(data.cliente),
    format: "json",
    supported: Boolean(documentNumber || total),
    notes: "Parsed from JSON billing document.",
  };
}

function fromXml(xml: string): SatParseResult {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    removeNSPrefix: true,
  });
  const parsed = parser.parse(xml);
  const documentNumber =
    textOf(deepFind(parsed, ["NumeroAutorizacion", "numeroAutorizacion"])) ||
    textOf(asRecord(deepFind(parsed, ["NumeroAutorizacion"]))?.["#text"]) ||
    textOf(deepFind(parsed, ["NumeroDocumento", "numeroDocumento"]));
  const date = parseFlexibleDate(
    textOf(deepFind(parsed, ["FechaHoraEmision", "Fecha"])) ||
      textOf(asRecord(deepFind(parsed, ["DatosGenerales"]))?.FechaHoraEmision),
  );
  const totals = asRecord(deepFind(parsed, ["Totales", "GranTotal"]));
  const total =
    parseMoney(textOf(deepFind(parsed, ["GranTotal"])) ) ||
    parseMoney(textOf(totals?.GranTotal));
  const emisor = asRecord(deepFind(parsed, ["Emisor"]));
  const receptor = asRecord(deepFind(parsed, ["Receptor"]));
  const general = asRecord(deepFind(parsed, ["DatosGenerales"]));
  return {
    documentType: textOf(general?.Tipo) || "FACT",
    documentNumber,
    normalizedDocumentNumber: documentNumber
      ? normalizeDocumentNumber(documentNumber)
      : null,
    date,
    total,
    currency: textOf(general?.CodigoMoneda) || "GTQ",
    issuer: textOf(emisor?.NombreEmisor) || textOf(emisor?.NombreComercial),
    recipient: textOf(receptor?.NombreReceptor),
    format: "xml",
    supported: Boolean(documentNumber || total),
    notes:
      "Parser FEL/SAT de demostración: soporta XML estilo DTE (GTDocumento) y campos equivalentes. No es un validador certificador SAT.",
  };
}

export function parseSatBillingDocument(
  content: Buffer | string,
  fileName: string,
  mimeType: string,
): SatParseResult {
  const name = fileName.toLowerCase();
  const text = typeof content === "string" ? content : content.toString("utf8");

  if (mimeType.includes("json") || name.endsWith(".json")) {
    try {
      const data = JSON.parse(text) as UnknownRecord;
      return fromJsonLike(data);
    } catch {
      return {
        documentType: null,
        documentNumber: null,
        normalizedDocumentNumber: null,
        date: null,
        total: null,
        currency: null,
        issuer: null,
        recipient: null,
        format: "json",
        supported: false,
        notes: "JSON inválido.",
      };
    }
  }

  if (mimeType.includes("xml") || name.endsWith(".xml") || text.trim().startsWith("<")) {
    return fromXml(text);
  }

  if (name.endsWith(".csv") || mimeType.includes("csv")) {
    const [headerLine, dataLine] = text.split(/\r?\n/).filter(Boolean);
    const headers = (headerLine ?? "").split(",").map((h) => h.trim().toLowerCase());
    const cols = (dataLine ?? "").split(",").map((c) => c.trim());
    const pick = (key: string) => cols[headers.indexOf(key)] ?? null;
    const documentNumber = pick("documentnumber") || pick("numero") || pick("dte");
    return {
      documentType: pick("type") || pick("tipo") || "FACT",
      documentNumber,
      normalizedDocumentNumber: documentNumber
        ? normalizeDocumentNumber(documentNumber)
        : null,
      date: parseFlexibleDate(pick("date") || pick("fecha")),
      total: parseMoney(pick("total") || pick("monto")),
      currency: pick("currency") || pick("moneda") || "GTQ",
      issuer: pick("issuer") || pick("emisor") || pick("proveedor"),
      recipient: pick("recipient") || pick("receptor"),
      format: "csv",
      supported: Boolean(documentNumber),
      notes: "CSV de demostración (una fila de datos).",
    };
  }

  const jsonTry = text.trim().startsWith("{") ? (() => {
    try {
      return fromJsonLike(JSON.parse(text) as UnknownRecord);
    } catch {
      return null;
    }
  })() : null;
  if (jsonTry) return jsonTry;

  return {
    documentType: null,
    documentNumber: null,
    normalizedDocumentNumber: null,
    date: null,
    total: null,
    currency: null,
    issuer: null,
    recipient: null,
    format: mimeType.includes("pdf") ? "unknown" : "text",
    supported: false,
    notes: mimeType.includes("pdf")
      ? "PDF binario no se interpreta como FEL certificado. Usa XML/JSON SAT o CSV de demo."
      : "Formato no reconocido como DTE SAT. El parser soporta XML FEL-like, JSON y CSV.",
  };
}
