import {
  detectCurrency,
  normalizeDocumentNumber,
  normalizeText,
  parseFlexibleDate,
  parseMoney,
} from "@/lib/normalize";
import type { DocumentNumberCandidate, OcrParseResult } from "@/lib/types";

const DTE_LABELS = [
  "NUMERO DE DTE",
  "NUMERO DTE",
  "NO DTE",
  "NO. DTE",
  "NRO DTE",
  "NRO. DTE",
  "DTE NO",
  "DTE NUMERO",
  "AUTORIZACION",
  "NUMERO DE AUTORIZACION",
];

const NUMBER_LABELS = [
  "NUMERO DE DTE",
  "NUMERO DTE",
  "NUMERO",
  "NRO",
  "NO.",
  "NO",
  "FACTURA",
  "DOCUMENTO",
  "SERIE",
];

const TOKEN_RE = /[A-Z0-9][A-Z0-9\-/.]{4,40}/g;
const STRICT_DOC_RE = /(?:[A-Z]{2,8}-)?[A-Z0-9]{6,32}/g;

function nearbyTokens(normalized: string, index: number): string[] {
  const window = normalized.slice(index, index + 80);
  return window.match(TOKEN_RE) ?? [];
}

function scoreCandidate(value: string, source: string): number {
  const normalized = normalizeDocumentNumber(value);
  let score = 0.35;
  if (source.includes("DTE")) score += 0.4;
  if (source.includes("AUTORIZACION")) score += 0.25;
  if (/^\d{8,20}$/.test(normalized)) score += 0.15;
  if (/[A-Z]/.test(normalized) && /\d/.test(normalized)) score += 0.2;
  if (normalized.length >= 8 && normalized.length <= 20) score += 0.1;
  if (normalized.length < 6) score -= 0.2;
  return Math.max(0, Math.min(1, score));
}

function looksLikeDocumentNumber(value: string): boolean {
  const normalized = normalizeDocumentNumber(value);
  if (normalized.length < 6 || normalized.length > 32) return false;
  if (/^(TOTAL|GTQ|USD|FECHA|NIT|IVA|SERIE)$/.test(normalized)) return false;
  return /[A-Z0-9]/.test(normalized) && /\d/.test(normalized);
}

export function extractDocumentNumberCandidates(rawText: string): DocumentNumberCandidate[] {
  const originalLines = rawText.split(/\r?\n/);
  const found = new Map<string, DocumentNumberCandidate>();

  const push = (value: string, source: string) => {
    const trimmed = value.trim();
    if (!looksLikeDocumentNumber(trimmed)) return;
    const normalized = normalizeDocumentNumber(trimmed);
    const confidence = scoreCandidate(trimmed, source);
    const current = found.get(normalized);
    if (!current || current.confidence < confidence) {
      found.set(normalized, {
        value: trimmed,
        normalized,
        confidence,
        source,
      });
    }
  };

  originalLines.forEach((line, index) => {
    const normalizedLine = normalizeText(line);
    for (const label of [...DTE_LABELS, ...NUMBER_LABELS]) {
      const pos = normalizedLine.indexOf(label);
      if (pos === -1) continue;
      const sameLine = normalizedLine.slice(pos + label.length);
      const sameLineMatch = sameLine.match(STRICT_DOC_RE);
      if (sameLineMatch) {
        for (const token of sameLineMatch) push(token, label);
      }
      const compacted = sameLine.replace(/[^A-Z0-9]/g, "");
      if (compacted.length >= 6) push(compacted, label);
      const next = originalLines[index + 1];
      if (next) {
        const nextNorm = normalizeText(next);
        const nextTokens = nextNorm.match(STRICT_DOC_RE) ?? [];
        for (const token of nextTokens) push(token, `${label} (siguiente línea)`);
        const nextCompact = nextNorm.replace(/[^A-Z0-9]/g, "");
        if (nextCompact.length >= 6 && nextCompact.length <= 32) {
          push(nextCompact, `${label} (siguiente línea)`);
        }
      }
    }
  });

  const blob = normalizeText(rawText);
  for (const label of DTE_LABELS) {
    let from = 0;
    while (from < blob.length) {
      const pos = blob.indexOf(label, from);
      if (pos === -1) break;
      for (const token of nearbyTokens(blob, pos + label.length)) {
        push(token, label);
      }
      from = pos + label.length;
    }
  }

  return [...found.values()].sort((a, b) => b.confidence - a.confidence);
}

function extractTotal(rawText: string): number | null {
  const lines = rawText.split(/\r?\n/).map((line) => normalizeText(line));
  const preferred = ["GRAN TOTAL", "TOTAL A PAGAR", "TOTAL"];
  for (const label of preferred) {
    for (const line of lines) {
      if (!line.includes(label) || line.includes("SUBTOTAL")) continue;
      const amount = parseMoney(line);
      if (amount && amount > 0) return amount;
    }
  }
  const amounts = rawText
    .split(/\r?\n/)
    .map((line) => parseMoney(line))
    .filter((value): value is number => value !== null && value > 0);
  return amounts.length ? amounts[amounts.length - 1] : null;
}

function extractVendor(rawText: string): string | null {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    const normalized = normalizeText(line);
    if (normalized.includes("EMISOR") || normalized.includes("PROVEEDOR") || normalized.includes("RAZON SOCIAL")) {
      const parts = line.split(":");
      const value = (parts[1] ?? parts[0]).trim();
      if (value.length >= 3) return value.slice(0, 80);
    }
  }
  const skip = /FACTURA|DTE|NIT|FECHA|TOTAL|DOCUMENTO|SERIE/;
  const candidate = lines.find((line) => {
    const normalized = normalizeText(line);
    return line.length >= 3 && !skip.test(normalized) && /[A-Za-zÁÉÍÓÚÑ]/.test(line);
  });
  return candidate ? candidate.slice(0, 80) : null;
}

export function parseReceiptText(rawText: string): OcrParseResult {
  const candidates = extractDocumentNumberCandidates(rawText);
  const high = candidates.filter((item) => item.confidence >= 0.7);
  const uniqueHigh = high.filter(
    (item, index, arr) => arr.findIndex((other) => other.normalized === item.normalized) === index,
  );
  const documentNumberFound = uniqueHigh.length === 1;
  const documentNumber = documentNumberFound ? uniqueHigh[0].value : null;
  const total = extractTotal(rawText);
  const date = parseFlexibleDate(rawText);
  const vendor = extractVendor(rawText);
  const currency = detectCurrency(rawText);
  const confidence = documentNumber
    ? uniqueHigh[0].confidence
    : candidates[0]?.confidence ?? 0;

  return {
    rawText,
    documentNumber,
    candidates,
    total,
    date,
    vendor,
    currency,
    confidence,
    documentNumberFound,
  };
}
