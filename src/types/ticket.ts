/** JSON-safe imported ticket. Null durations mean missing or invalid, never zero. */
export interface Ticket {
  sourceRow: number;
  ticketId: string;
  summary: string;
  status: string;
  dateCreated: string | null;
  hourCreated: string | null;
  category: string | null;
  team: string | null;
  itilType: string | null;
  ticketType: string;
  assignedAgent: string | null;
  userName: string | null;
  client: string | null;
  sla: string | number | null;
  timeToRespondOriginal: number | null;
  timeToRespondMinutes: number | null;
  timeToResolveHours: number | null;
  priority: string;
}
