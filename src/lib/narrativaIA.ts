import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Narrativa, NarrativaInput } from "./report";

const MODEL = "claude-opus-5";

function construirPrompt(data: NarrativaInput): string {
  return `Eres un analista de un SOC (Centro de Operaciones de Seguridad) redactando el reporte mensual de tickets para un cliente.

Datos del periodo (ya agregados, sin detalle de tickets individuales):
- Cliente: ${data.cliente}
- Periodo: ${data.periodo.desde} a ${data.periodo.hasta}
- Total de tickets: ${data.totalTickets}
- Tickets por tipo: ${JSON.stringify(data.porTipo)}
- Tickets por producto/herramienta: ${JSON.stringify(data.porProducto)}
- Tickets por estado: ${JSON.stringify(data.porEstado)}
- SLA de incidentes: ${JSON.stringify(data.slaIncidentes)}
- SLA de solicitudes: ${JSON.stringify(data.slaSolicitudes)}

Redacta tres secciones en español, en tono profesional y ejecutivo, para un reporte que un consultor de SOC entrega a un cliente corporativo. No inventes datos ni herramientas que no aparezcan en los datos anteriores.

1. "introduccion": 2-3 frases presentando el alcance y el total de tickets del periodo.
2. "analisis": un párrafo (4-6 frases) analizando los tipos de ticket y productos con mayor volumen, el estado de cierre de los tickets, y el cumplimiento de SLA de incidentes y solicitudes con sus porcentajes.
3. "recomendacion": entre 2 y 4 recomendaciones accionables numeradas ("1. ...", "2. ...", cada una en su propia línea dentro del string, separadas por \\n), basadas en los datos (SLA bajo, producto con más tickets, tickets pendientes, etc.).

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código, con exactamente esta forma:
{"introduccion": "...", "analisis": "...", "recomendacion": "..."}`;
}

function extraerJson(texto: string): unknown {
  const inicio = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (inicio === -1 || fin === -1 || fin < inicio) {
    throw new Error("La respuesta de la IA no contiene un objeto JSON.");
  }
  return JSON.parse(texto.slice(inicio, fin + 1));
}

export async function generarNarrativaConIA(data: NarrativaInput): Promise<Narrativa> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta ANTHROPIC_API_KEY. Copia .env.example a .env.local y coloca ahí tu API key de Anthropic."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: construirPrompt(data) }],
  });

  const bloqueTexto = response.content.find((b) => b.type === "text");
  if (!bloqueTexto || bloqueTexto.type !== "text") {
    throw new Error("La IA no devolvió texto en la respuesta.");
  }

  const json = extraerJson(bloqueTexto.text) as Partial<Narrativa>;
  if (!json.introduccion || !json.analisis || !json.recomendacion) {
    throw new Error("La respuesta de la IA no incluye las tres secciones esperadas.");
  }

  return {
    introduccion: json.introduccion,
    analisis: json.analisis,
    recomendacion: json.recomendacion,
  };
}
