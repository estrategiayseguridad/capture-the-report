import { parseAsistentes } from "@/lib/csv";
import { procesarEvento } from "@/lib/engine";
import type { EventoConfig, Franja } from "@/lib/types";

const FRANJAS: Franja[] = ["matutino", "vespertino", "nocturno", "jornada"];

interface CuerpoPeticion {
  csv?: string;
  evento?: Partial<EventoConfig>;
}

/** Completa la configuracion del evento con valores por defecto seguros. */
function normalizarEvento(entrada: Partial<EventoConfig> | undefined): EventoConfig {
  const franja = entrada?.franja;
  return {
    nombre: entrada?.nombre?.trim() || "Evento sin nombre",
    fecha: entrada?.fecha?.trim() || "",
    lugar: entrada?.lugar?.trim() || "Sin lugar definido",
    franja: franja && FRANJAS.includes(franja) ? franja : "nocturno",
    tipo: entrada?.tipo === "Sponsor" ? "Sponsor" : "Propio",
    invitados: Number.isFinite(Number(entrada?.invitados)) ? Math.max(0, Number(entrada?.invitados)) : 0,
    montoQ: Number.isFinite(Number(entrada?.montoQ)) ? Math.max(0, Number(entrada?.montoQ)) : 0,
  };
}

export async function POST(request: Request) {
  let cuerpo: CuerpoPeticion;

  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ error: "El cuerpo de la peticion no es JSON valido." }, { status: 400 });
  }

  if (!cuerpo.csv || cuerpo.csv.trim() === "") {
    return Response.json({ error: "Falta el contenido del CSV de asistentes." }, { status: 400 });
  }

  try {
    const { asistentes, advertencias } = parseAsistentes(cuerpo.csv);
    const resultado = procesarEvento(asistentes, normalizarEvento(cuerpo.evento), advertencias);
    return Response.json(resultado);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido al procesar el CSV.";
    return Response.json({ error: mensaje }, { status: 422 });
  }
}
