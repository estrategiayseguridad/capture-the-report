import { z } from "zod";

// Shared by the form and server boundary. No persistence yet.
export const reportFormSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(1, "Ingresa el nombre del cliente.")
    .max(150, "Usa un nombre de hasta 150 caracteres."),
  month: z.string().regex(/^(?:[1-9]|1[0-2])$/, "Selecciona un mes válido."),
  year: z
    .string()
    .regex(/^[1-9]\d{3}$/, "Ingresa un año válido de cuatro dígitos."),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
