import { describe, expect, it } from "vitest";
import { decideMatch, findMatchCandidates, scoreExpenseMatch } from "../src/services/matching";
import { parseSatBillingDocument } from "../src/services/sat-parser";
import type { BillingDocument, Expense } from "../src/lib/types";

function expense(partial: Partial<Expense>): Expense {
  return {
    id: "exp_1",
    userId: "usr_a",
    documentNumber: "DTE-SOC-44120",
    ocrDocumentNumber: null,
    confirmedDocumentNumber: "DTE-SOC-44120",
    ocrConfidence: null,
    ocrRawText: "",
    ocrCandidates: [],
    receiptFileId: null,
    ocrTotal: null,
    confirmedTotal: 4850,
    ocrDate: null,
    confirmedDate: "2026-08-28",
    ocrVendor: null,
    confirmedVendor: "CloudHost Demo",
    ocrCurrency: null,
    confirmedCurrency: "GTQ",
    departmentId: "dep",
    clientId: "cli",
    projectId: "prj",
    notes: "",
    expenseStatus: "Approved",
    authorizationStatus: "Approved",
    authorizedBy: null,
    authorizedAt: null,
    authorizationNotes: "",
    billingMatchStatus: "Unmatched",
    matchedBillingDocumentId: null,
    reimbursementStatus: "NotReimbursed",
    approvedAmount: 4850,
    reimbursedAmount: 0,
    reimbursementDate: null,
    reimbursementReference: null,
    duplicateOfIds: [],
    createdAt: "2026-08-28T00:00:00.000Z",
    updatedAt: "2026-08-28T00:00:00.000Z",
    submittedAt: "2026-08-28T00:00:00.000Z",
    ...partial,
  };
}

function doc(partial: Partial<BillingDocument>): BillingDocument {
  return {
    id: "bill_1",
    batchId: "batch",
    file: { storedName: "a.json", originalName: "a.json", mimeType: "application/json", size: 10 },
    documentType: "FACT",
    documentNumber: "DTE-SOC-44120",
    normalizedDocumentNumber: "DTESOC44120",
    date: "2026-08-28",
    total: 4850,
    currency: "GTQ",
    issuer: "CloudHost Demo",
    recipient: "ES",
    processingStatus: "Processed",
    matchStatus: "Unmatched",
    matchedExpenseId: null,
    matchConfidence: null,
    candidateExpenseIds: [],
    processingError: null,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("SAT parser and matching", () => {
  it("parses nested namespaced NumeroAutorizacion", () => {
    const xml = `<?xml version="1.0"?>
<dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0">
  <dte:SAT><dte:DTE>
    <dte:DatosGenerales FechaHoraEmision="2026-08-28T10:00:00" CodigoMoneda="GTQ" Tipo="FACT"/>
    <dte:Emisor NombreEmisor="CloudHost Demo"/>
    <dte:Totales><dte:GranTotal>4850</dte:GranTotal></dte:Totales>
    <dte:Certificacion><dte:NumeroAutorizacion>DTE-SOC-44120</dte:NumeroAutorizacion></dte:Certificacion>
  </dte:DTE></dte:SAT>
</dte:GTDocumento>`;
    const parsed = parseSatBillingDocument(xml, "fel.xml", "application/xml");
    expect(parsed.documentNumber).toBe("DTE-SOC-44120");
    expect(parsed.total).toBe(4850);
  });

  it("parses FEL-like XML", () => {
    const xml = `<GTDocumento><NumeroAutorizacion>DTE-SOC-44120</NumeroAutorizacion><DatosGenerales FechaHoraEmision="2026-08-28T10:00:00" CodigoMoneda="GTQ" Tipo="FACT"/><Emisor NombreEmisor="CloudHost Demo"/><GranTotal>4850</GranTotal></GTDocumento>`;
    const parsed = parseSatBillingDocument(xml, "fel.xml", "application/xml");
    expect(parsed.documentNumber).toContain("DTE-SOC-44120");
    expect(parsed.total).toBe(4850);
    expect(parsed.supported).toBe(true);
  });

  it("auto-matches unique high-confidence document numbers", () => {
    const candidates = findMatchCandidates(doc({}), [expense({})]);
    const decision = decideMatch(candidates);
    expect(decision.status).toBe("Matched");
    expect(decision.matchedExpenseId).toBe("exp_1");
  });

  it("sends ambiguous matches to review", () => {
    const expenses = [
      expense({ id: "a" }),
      expense({ id: "b", userId: "usr_b" }),
    ];
    const decision = decideMatch(findMatchCandidates(doc({}), expenses));
    expect(decision.status).toBe("NeedsReview");
    expect(decision.matchedExpenseId).toBeNull();
  });

  it("leaves unmatched when no credible candidate exists", () => {
    const decision = decideMatch(
      findMatchCandidates(doc({ documentNumber: "ZZZ", normalizedDocumentNumber: "ZZZ", total: 1 }), [
        expense({}),
      ]),
    );
    expect(decision.status).toBe("Unmatched");
  });

  it("does not auto-match on amount alone", () => {
    const scored = scoreExpenseMatch(
      doc({ documentNumber: "NOPE", normalizedDocumentNumber: "NOPE" }),
      expense({}),
    );
    expect(scored.confidence).toBeLessThan(0.85);
  });
});
