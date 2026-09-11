import { z } from "zod";

const countSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Ingresa un entero mayor o igual a 0.")
  .refine(
    (value) => Number.isSafeInteger(Number(value)),
    "La cantidad supera el máximo permitido.",
  );
const labelSchema = z.string().trim().min(1, "Este campo es obligatorio.");

function safeTotal(items: { value: string }[]): boolean {
  return Number.isSafeInteger(
    items.reduce((sum, item) => sum + Number(item.value), 0),
  );
}

export const statusChartFormSchema = z
  .object({
    items: z
      .array(z.object({ label: labelSchema, value: countSchema }))
      .length(3),
  })
  .refine(({ items }) => safeTotal(items), {
    message: "Revisa las cantidades: el total debe ser un entero seguro.",
    path: ["root"],
  });

export const periodChartFormSchema = z
  .object({
    items: z
      .array(
        z.object({
          ticketType: labelSchema,
          priority: labelSchema,
          value: countSchema,
        }),
      )
      .min(1, "Agrega al menos una fila."),
  })
  .superRefine(({ items }, ctx) => {
    if (!safeTotal(items))
      ctx.addIssue({
        code: "custom",
        path: ["root"],
        message: "Revisa las cantidades: el total debe ser un entero seguro.",
      });
    const seen = new Set<string>();
    items.forEach((item, index) => {
      const key = JSON.stringify([
        item.ticketType.toLocaleLowerCase("es"),
        item.priority.toLocaleLowerCase("es"),
      ]);
      if (seen.has(key))
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "ticketType"],
          message: "Esta combinación ya existe. Ajusta la fila original.",
        });
      seen.add(key);
    });
  });

export type StatusChartFormValues = z.infer<typeof statusChartFormSchema>;
export type PeriodChartFormValues = z.infer<typeof periodChartFormSchema>;
