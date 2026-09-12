import { readFile } from "node:fs/promises";
import path from "node:path";

/** Devuelve el CSV de demo del repo para que la UI pueda cargarlo con un clic. */
export async function GET() {
  try {
    const ruta = path.join(process.cwd(), "data", "asistentes-demo.csv");
    const csv = await readFile(ruta, "utf-8");

    return Response.json({
      csv,
      evento: {
        nombre: "La Nueva Era de la Defensa Digital",
        fecha: "2026-07-21",
        lugar: "Lugar 3 - Corporativo / Formal",
        franja: "nocturno",
        tipo: "Sponsor",
        invitados: 60,
        montoQ: 48000,
      },
    });
  } catch {
    return Response.json(
      { error: "No se pudo leer data/asistentes-demo.csv en la raiz del proyecto." },
      { status: 500 },
    );
  }
}
