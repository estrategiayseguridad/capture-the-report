import { describe, expect, it } from "vitest";
import { parseReceiptText, extractDocumentNumberCandidates } from "../src/services/receipt-parser";
import { normalizeDocumentNumber, normalizeText } from "../src/lib/normalize";

describe("receipt OCR parsing", () => {
  it("extracts Número de DTE with accents and line break", () => {
    const text = `FACTURA\nNúmero de DTE:\nABC-99887766\nGran Total Q1,250.50`;
    const parsed = parseReceiptText(text);
    expect(parsed.documentNumberFound).toBe(true);
    expect(normalizeDocumentNumber(parsed.documentNumber ?? "")).toBe("ABC99887766");
    expect(parsed.total).toBe(1250.5);
  });

  it("normalizes missing accents, case, punctuation and whitespace", () => {
    const text = "NUMERO   DE   DTE  :  fel-12 34\nTOTAL  Q 99";
    const parsed = parseReceiptText(text);
    expect(parsed.candidates.length).toBeGreaterThan(0);
    expect(normalizeText("Número de DTE")).toContain("NUMERO DE DTE");
  });

  it("does not silently pick when multiple DTE candidates exist", () => {
    const text = `Numero de DTE: AAA-111111\nNo. DTE: BBB-222222\nTotal Q100`;
    const parsed = parseReceiptText(text);
    expect(parsed.documentNumberFound).toBe(false);
    expect(parsed.candidates.length).toBeGreaterThanOrEqual(2);
  });

  it("allows OCR failure to be corrected manually", () => {
    const parsed = parseReceiptText("Ticket de cafe\nsin numero");
    expect(parsed.documentNumberFound).toBe(false);
    expect(parsed.documentNumber).toBeNull();
  });

  it("reads No. DTE variant", () => {
    const candidates = extractDocumentNumberCandidates("No. DTE: FEL998877661122");
    expect(candidates.some((item) => item.normalized.includes("FEL998877661122"))).toBe(true);
  });
});
