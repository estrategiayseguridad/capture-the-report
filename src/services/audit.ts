import { newId, nowIso } from "@/lib/ids";
import type { AppStore, AuditLog } from "@/lib/types";

export function appendAudit(
  store: AppStore,
  entry: Omit<AuditLog, "id" | "timestamp"> & { timestamp?: string },
): AuditLog {
  const record: AuditLog = {
    id: newId("aud"),
    timestamp: entry.timestamp ?? nowIso(),
    userId: entry.userId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    before: entry.before ?? null,
    after: entry.after ?? null,
  };
  store.auditLogs.unshift(record);
  return record;
}
