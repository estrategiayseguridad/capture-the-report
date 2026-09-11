export type Severity = "CRITICA" | "ALTA" | "MEDIA" | "BAJA";

export interface SlaTarget {
  readonly firstResponseMinutes: number;
  readonly resolutionHours: number;
  readonly minimumCompliancePercent: number;
}

export type SlaConfiguration = Readonly<Record<Severity, SlaTarget>>;
