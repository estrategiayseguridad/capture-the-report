import { z } from "zod";

// Visual form contract only. No upload or file-content validation yet.
export const reportFormSchema = z.object({
  clientId: z.string(),
  month: z.string(),
  year: z.string(),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
