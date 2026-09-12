import { describe, expect, it } from "vitest";
import { parseReceiptText } from "../src/services/receipt-parser";

describe("employee scan review flow", () => {
  it("surfaces OCR vs confirmed fields and keeps submission unblocked on OCR miss", () => {
    const ocr = parseReceiptText("Ticket\nTotal Q80");
    const confirmed = {
      documentNumber: ocr.documentNumber ?? "MANUAL-80",
      total: ocr.total ?? 80,
    };
    expect(ocr.documentNumberFound).toBe(false);
    expect(confirmed.documentNumber).toBe("MANUAL-80");
    expect(confirmed.total).toBe(80);
  });

  it("asks the employee to pick when several DTE candidates appear", () => {
    const ocr = parseReceiptText("Numero de DTE: AAA111111\nNumero de DTE: BBB222222\nTotal Q10");
    const unique = [...new Map(ocr.candidates.map((item) => [item.normalized, item])).values()];
    expect(ocr.documentNumberFound).toBe(false);
    expect(unique.length).toBeGreaterThan(1);
  });
});
