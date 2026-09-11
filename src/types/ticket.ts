import type { Severity } from "@/types/sla";

/** Normalized domain shape; parsing and duration conversion are future work. */
export interface Ticket {
  ticketId: string;
  summary: string;
  status: string;
  dateCreated: Date;
  category: string | null;
  ticketType: string | null;
  client: string;
  timeToRespondOriginal: string | null;
  timeToRespondMinutes: number | null;
  timeToResolveHours: number | null;
  priority: Severity | null;
}
