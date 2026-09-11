// Domain types remain independent of Prisma and its database provider.
export type ReportStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Client {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  clientId: string;
  month: number;
  year: number;
  totalTickets: number;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}
