import {
  getAnnualHistory,
  saveAnnualHistory,
  HistoryClientNotFound,
} from "@/services/history/history.service";
import { historyQuerySchema, saveHistorySchema } from "@/validators/history";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
function failure(error: unknown) {
  if (error instanceof HistoryClientNotFound)
    return json({ error: "El cliente no existe." }, 404);
  console.error("[history]", error);
  return json(
    { error: "No fue posible acceder al historial. Inténtalo nuevamente." },
    500,
  );
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const parsed = historyQuerySchema.safeParse({
    clientId: query.get("clientId"),
    year: Number(query.get("year")),
  });
  if (!parsed.success)
    return json({ error: "Selecciona un cliente y un año válido." }, 400);
  try {
    return json(await getAnnualHistory(parsed.data.clientId, parsed.data.year));
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud JSON inválida." }, 400);
  }
  const parsed = saveHistorySchema.safeParse(body);
  if (!parsed.success)
    return json(
      {
        error:
          "Revisa los meses: deben ser únicos y contener enteros no negativos o valores vacíos.",
      },
      400,
    );
  try {
    return json(await saveAnnualHistory(parsed.data));
  } catch (error) {
    return failure(error);
  }
}
