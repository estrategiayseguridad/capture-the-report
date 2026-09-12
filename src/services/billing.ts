import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";
import { HttpError } from "@/lib/http";
import { newId, nowIso } from "@/lib/ids";
import { billingDir } from "@/lib/paths";
import { assertNoTraversal, guessMime, storedFileName, validateUpload } from "@/lib/files";
import type { AppStore, BillingDocument, PublicUser } from "@/lib/types";
import { appendAudit } from "./audit";
import { decideMatch, findMatchCandidates } from "./matching";
import { parseSatBillingDocument } from "./sat-parser";
import { reimbursementStatusFor } from "./reimbursements";

async function persistBillingFile(
  originalName: string,
  mimeType: string,
  buffer: Buffer,
) {
  const storedName = storedFileName(originalName, mimeType);
  const dest = path.join(billingDir(), storedName);
  await fs.mkdir(billingDir(), { recursive: true });
  assertNoTraversal(billingDir(), dest);
  await fs.writeFile(dest, buffer);
  return {
    storedName,
    originalName,
    mimeType,
    size: buffer.length,
  };
}

function createPendingDoc(
  store: AppStore,
  actor: PublicUser,
  batchId: string,
  file: BillingDocument["file"],
): BillingDocument {
  const timestamp = nowIso();
  const doc: BillingDocument = {
    id: newId("bill"),
    batchId,
    file,
    documentType: null,
    documentNumber: null,
    normalizedDocumentNumber: null,
    date: null,
    total: null,
    currency: null,
    issuer: null,
    recipient: null,
    processingStatus: "Pending",
    matchStatus: "Unmatched",
    matchedExpenseId: null,
    matchConfidence: null,
    candidateExpenseIds: [],
    processingError: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.billingDocuments.unshift(doc);
  appendAudit(store, {
    userId: actor.id,
    action: "billing.upload",
    entityType: "billing_document",
    entityId: doc.id,
    before: null,
    after: { file: file.originalName, batchId },
  });
  return doc;
}

export async function ingestBillingFiles(
  store: AppStore,
  actor: PublicUser,
  files: { name: string; type: string; size: number; buffer: Buffer }[],
) {
  const batchId = newId("batch");
  const created: BillingDocument[] = [];
  for (const file of files) {
    const mime = validateUpload(file, "billing");
    if (mime === "application/zip" || mime === "application/x-zip-compressed") {
      const zip = await JSZip.loadAsync(file.buffer);
      const entries = Object.values(zip.files).filter((entry) => !entry.dir);
      for (const entry of entries) {
        const nestedName = path.basename(entry.name);
        const nestedMime = guessMime(nestedName);
        if (!nestedMime || nestedMime.includes("zip")) continue;
        const nestedBuffer = Buffer.from(await entry.async("nodebuffer"));
        try {
          validateUpload(
            { name: nestedName, type: nestedMime, size: nestedBuffer.length },
            "billing",
          );
        } catch {
          continue;
        }
        const stored = await persistBillingFile(nestedName, nestedMime, nestedBuffer);
        created.push(createPendingDoc(store, actor, batchId, stored));
      }
    } else {
      const stored = await persistBillingFile(file.name, mime, file.buffer);
      created.push(createPendingDoc(store, actor, batchId, stored));
    }
  }
  if (!created.length) {
    throw new HttpError(400, "No se importó ningún documento válido");
  }
  return { batchId, created };
}

export async function processBillingDocuments(
  store: AppStore,
  actor: PublicUser,
  ids?: string[],
  limit = 8,
) {
  const pending = store.billingDocuments.filter((doc) => {
    if (ids?.length) return ids.includes(doc.id) && doc.processingStatus !== "Processed";
    return doc.processingStatus === "Pending" || doc.processingStatus === "Failed";
  }).slice(0, limit);

  let success = 0;
  let failed = 0;
  for (const doc of pending) {
    doc.processingStatus = "Processing";
    doc.updatedAt = nowIso();
    try {
      const filePath = path.join(billingDir(), doc.file.storedName);
      assertNoTraversal(billingDir(), filePath);
      const buffer = await fs.readFile(filePath);
      const parsed = parseSatBillingDocument(buffer, doc.file.originalName, doc.file.mimeType);
      doc.documentType = parsed.documentType;
      doc.documentNumber = parsed.documentNumber;
      doc.normalizedDocumentNumber = parsed.normalizedDocumentNumber;
      doc.date = parsed.date;
      doc.total = parsed.total;
      doc.currency = parsed.currency;
      doc.issuer = parsed.issuer;
      doc.recipient = parsed.recipient;
      doc.processingError = parsed.supported ? null : parsed.notes;
      const decision = decideMatch(
        findMatchCandidates(doc, store.expenses),
      );
      applyMatchDecision(store, doc, decision);
      doc.processingStatus = parsed.supported ? "Processed" : "Failed";
      if (parsed.supported) success += 1;
      else failed += 1;
      appendAudit(store, {
        userId: actor.id,
        action: "billing.process",
        entityType: "billing_document",
        entityId: doc.id,
        before: null,
        after: {
          documentNumber: doc.documentNumber,
          matchStatus: doc.matchStatus,
          matchedExpenseId: doc.matchedExpenseId,
        },
      });
    } catch (error) {
      failed += 1;
      doc.processingStatus = "Failed";
      doc.processingError = error instanceof Error ? error.message : "Error de procesamiento";
    }
    doc.updatedAt = nowIso();
  }
  return {
    processed: pending.length,
    success,
    failed,
    remaining: store.billingDocuments.filter(
      (doc) => doc.processingStatus === "Pending" || doc.processingStatus === "Failed",
    ).length,
  };
}

function applyMatchDecision(
  store: AppStore,
  doc: BillingDocument,
  decision: ReturnType<typeof decideMatch>,
) {
  if (doc.matchedExpenseId) {
    const previous = store.expenses.find((item) => item.id === doc.matchedExpenseId);
    if (previous && previous.matchedBillingDocumentId === doc.id) {
      previous.matchedBillingDocumentId = null;
      previous.billingMatchStatus = "Unmatched";
      previous.reimbursementStatus = reimbursementStatusFor(previous);
    }
  }
  doc.matchStatus = decision.status;
  doc.matchedExpenseId = decision.matchedExpenseId;
  doc.matchConfidence = decision.confidence;
  doc.candidateExpenseIds = decision.candidateExpenseIds;
  if (decision.matchedExpenseId) {
    const expense = store.expenses.find((item) => item.id === decision.matchedExpenseId);
    if (expense) {
      expense.matchedBillingDocumentId = doc.id;
      expense.billingMatchStatus = "Matched";
      expense.reimbursementStatus = reimbursementStatusFor(expense);
      expense.updatedAt = nowIso();
    }
  }
}

export function manualMatch(
  store: AppStore,
  actor: PublicUser,
  billingId: string,
  action: "match" | "reject" | "unmatched",
  expenseId?: string,
) {
  const doc = store.billingDocuments.find((item) => item.id === billingId);
  if (!doc) throw new HttpError(404, "Documento de facturación no encontrado");
  const before = { matchStatus: doc.matchStatus, matchedExpenseId: doc.matchedExpenseId };
  if (action === "match") {
    if (!expenseId) throw new HttpError(400, "Selecciona un gasto");
    const expense = store.expenses.find((item) => item.id === expenseId);
    if (!expense) throw new HttpError(404, "Gasto no encontrado");
    applyMatchDecision(store, doc, {
      status: "Matched",
      matchedExpenseId: expense.id,
      confidence: 1,
      candidateExpenseIds: doc.candidateExpenseIds,
    });
  } else if (action === "reject") {
    applyMatchDecision(store, doc, {
      status: "NeedsReview",
      matchedExpenseId: null,
      confidence: doc.matchConfidence,
      candidateExpenseIds: doc.candidateExpenseIds.filter((id) => id !== expenseId),
    });
  } else {
    applyMatchDecision(store, doc, {
      status: "Unmatched",
      matchedExpenseId: null,
      confidence: doc.matchConfidence,
      candidateExpenseIds: doc.candidateExpenseIds,
    });
  }
  doc.updatedAt = nowIso();
  appendAudit(store, {
    userId: actor.id,
    action: `billing.manual_${action}`,
    entityType: "billing_document",
    entityId: doc.id,
    before,
    after: { matchStatus: doc.matchStatus, matchedExpenseId: doc.matchedExpenseId },
  });
  return doc;
}
