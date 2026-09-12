import {
  listHistoryClients,
  resolveHistoryClient,
} from "@/services/history/history.service";
import { clientNameSchema } from "@/validators/history";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  try {
    return json(await listHistoryClients());
  } catch (error) {
    console.error("[history:clients]", error);
    return json({ error: "No fue posible cargar los clientes." }, 500);
  }
}
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud JSON inválida." }, 400);
  }
  const parsed = clientNameSchema.safeParse(body);
  if (!parsed.success)
    return json(
      { error: "Ingresa un nombre de cliente válido (hasta 150 caracteres)." },
      400,
    );
  try {
    return json(await resolveHistoryClient(parsed.data.name));
  } catch (error) {
    console.error("[history:client]", error);
    return json(
      { error: "No fue posible vincular el cliente. Inténtalo nuevamente." },
      500,
    );
  }
}
