import type { SlaConfiguration } from "@/types/sla";

// Configuration only. No SLA calculations are performed in this phase.
export const SLA_CONFIG = {
  CRITICA: {
    firstResponseMinutes: 10,
    resolutionHours: 4,
    minimumCompliancePercent: 95,
  },
  ALTA: {
    firstResponseMinutes: 10,
    resolutionHours: 8,
    minimumCompliancePercent: 95,
  },
  MEDIA: {
    firstResponseMinutes: 15,
    resolutionHours: 24,
    minimumCompliancePercent: 90,
  },
  BAJA: {
    firstResponseMinutes: 15,
    resolutionHours: 48,
    minimumCompliancePercent: 90,
  },
} as const satisfies SlaConfiguration;
