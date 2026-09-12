import { z } from "zod";
import { reportFormSchema } from "./report";

// Prisma Int is a signed 32-bit integer on SQLite and PostgreSQL.
export const ticketCountSchema = z.number().int().min(0).max(2147483647);
export const historyYearSchema = z.number().int().min(1000).max(9999);
export const historyQuerySchema = z.object({
  clientId: z.string().min(1).max(100),
  year: historyYearSchema,
});
export const clientNameSchema = z.object({
  name: reportFormSchema.shape.clientName,
});
export const saveHistorySchema = historyQuerySchema
  .extend({
    months: z
      .array(
        z.object({
          month: z.number().int().min(1).max(12),
          totalTickets: ticketCountSchema.nullable(),
          source: z.enum(["MANUAL", "IMPORT"]),
        }),
      )
      .max(12),
  })
  .refine(
    ({ months }) =>
      new Set(months.map((row) => row.month)).size === months.length,
    { message: "No repitas un mes." },
  );

const optionalCountSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (/^\d+$/.test(value) &&
        ticketCountSchema.safeParse(Number(value)).success),
    "Ingresa un entero entre 0 y 2147483647, o deja el campo vacío.",
  );
export const historyFormSchema = z.object({
  values: z.array(optionalCountSchema).length(12),
});
export type HistoryFormValues = z.infer<typeof historyFormSchema>;
export type SaveHistoryInput = z.infer<typeof saveHistorySchema>;
