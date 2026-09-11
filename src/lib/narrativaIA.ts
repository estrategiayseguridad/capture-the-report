import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Bullet, GrupoDetalle, Narrativa, NarrativaInput, TicketResumen } from "./report";
import { crearContextoSanitizacion, sanitizarTexto, desanitizarTexto, type ContextoSanitizacion } from "./sanitizar";

const MODEL = "claude-opus-5";
const MAX_TICKETS_EN_PROMPT = 400;

function formatearTickets(tickets: TicketResumen[]): string {
  return tickets
    .slice(0, MAX_TICKETS_EN_PROMPT)
    .map((t) => `- [${t.producto} | ${t.tipo} | ${t.estado}] ${t.asunto || "(sin asunto)"}`)
    .join("\n");
}

function construirPrompt(data: NarrativaInput, ticketsSanitizados: TicketResumen[]): string {
  return `Eres un analista de un SOC (Centro de Operaciones de Seguridad) redactando el reporte mensual de tickets para un cliente.

Datos agregados del periodo:
- Cliente: ${data.cliente}
- Periodo: ${data.periodo.desde} a ${data.periodo.hasta}
- Total de tickets: ${data.totalTickets}
- Tickets por tipo: ${JSON.stringify(data.porTipo)}
- Tickets por producto/herramienta: ${JSON.stringify(data.porProducto)}
- Tickets por estado: ${JSON.stringify(data.porEstado)}
- SLA de incidentes: ${JSON.stringify(data.slaIncidentes)}
- SLA de solicitudes: ${JSON.stringify(data.slaSolicitudes)}

Listado real de tickets del periodo (formato "[producto | tipo | estado] asunto"), úsalo como fuente principal para describir el trabajo realizado — NO inventes actividades que no puedan inferirse de estos asuntos:
${formatearTickets(ticketsSanitizados)}

Nota: por privacidad, las IPs, dominios y nombres de host/sensor en los asuntos ya vienen reemplazados por marcadores como [IP-1], [DOMINIO-2] o [HOST-3]. Trátalos como identificadores reales y úsalos tal cual en tu redacción (ej. "el host [HOST-3]") — NO los reemplaces, no inventes un valor para ellos, ni digas que faltan datos.

Redacta en español, tono profesional y ejecutivo, para un reporte que un consultor de SOC entrega a un cliente corporativo. Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional, sin bloques de código markdown) con esta forma exacta:

{
  "introduccion": "2-3 frases presentando el alcance y el total de tickets del periodo",
  "tiposDetalle": [
    { "grupo": "nombre de la herramienta/producto (ej. Cloudflare, Darktrace, ElasticSearch)",
      "puntos": [ { "titulo": "frase corta (3-6 palabras) que resume la actividad", "detalle": "1-2 frases describiendo la actividad real, basada en los asuntos de los tickets de ese grupo" } ] }
  ],
  "analisis": [
    { "titulo": "frase corta (3-6 palabras)", "detalle": "1-3 frases de análisis con datos reales (números, porcentajes)" }
  ],
  "recomendacion": [
    { "titulo": "frase corta (3-6 palabras) accionable", "detalle": "1-2 frases explicando la recomendación" }
  ]
}

Para "tiposDetalle": agrupa por herramienta/producto (usa la parte antes de ">" en el campo producto, o el nombre completo si no tiene ">"). Genera entre 2 y 5 puntos por grupo, solo para los grupos con tickets relevantes (puedes omitir grupos triviales). Sé específico citando lo que realmente dicen los asuntos de los tickets.
Para "analisis": entre 3 y 5 puntos cubriendo volumen/distribución, estado de cierre, y cumplimiento de SLA de incidentes y solicitudes con sus porcentajes.
Para "recomendacion": entre 2 y 4 puntos accionables basados en los datos (SLA bajo, producto con más tickets, tickets pendientes, patrones que veas en los asuntos, etc.).`;
}

function extraerJson(texto: string): unknown {
  const inicio = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (inicio === -1 || fin === -1 || fin < inicio) {
    throw new Error("La respuesta de la IA no contiene un objeto JSON.");
  }
  return JSON.parse(texto.slice(inicio, fin + 1));
}

function validarBullets(valor: unknown, campo: string): Bullet[] {
  if (!Array.isArray(valor)) throw new Error(`La respuesta de la IA no incluye "${campo}" como lista.`);
  return valor.map((b) => ({ titulo: String(b.titulo ?? ""), detalle: String(b.detalle ?? "") }));
}

function validarGrupos(valor: unknown): GrupoDetalle[] {
  if (!Array.isArray(valor)) throw new Error('La respuesta de la IA no incluye "tiposDetalle" como lista.');
  return valor.map((g) => ({
    grupo: String(g.grupo ?? "General"),
    puntos: validarBullets(g.puntos, "puntos"),
  }));
}

function desanitizarBullets(bullets: Bullet[], ctx: ContextoSanitizacion): Bullet[] {
  return bullets.map((b) => ({
    titulo: desanitizarTexto(b.titulo, ctx),
    detalle: desanitizarTexto(b.detalle, ctx),
  }));
}

function desanitizarNarrativa(n: Narrativa, ctx: ContextoSanitizacion): Narrativa {
  return {
    introduccion: desanitizarTexto(n.introduccion, ctx),
    tiposDetalle: n.tiposDetalle.map((g) => ({
      grupo: desanitizarTexto(g.grupo, ctx),
      puntos: desanitizarBullets(g.puntos, ctx),
    })),
    analisis: desanitizarBullets(n.analisis, ctx),
    recomendacion: desanitizarBullets(n.recomendacion, ctx),
  };
}

export async function generarNarrativaConIA(data: NarrativaInput): Promise<Narrativa> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta ANTHROPIC_API_KEY. Copia .env.example a .env.local y coloca ahí tu API key de Anthropic."
    );
  }

  // Las IPs, dominios y hostnames del asunto de cada ticket se reemplazan por marcadores antes de
  // salir de esta máquina; el mapeo solo vive en memoria durante esta llamada y se usa al final
  // para restaurar los valores reales en el texto que redactó la IA (nunca se le manda el dato real).
  const ctx = crearContextoSanitizacion();
  const ticketsSanitizados = data.tickets.map((t) => ({ ...t, asunto: sanitizarTexto(t.asunto, ctx) }));

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    output_config: { effort: "high" },
    messages: [{ role: "user", content: construirPrompt(data, ticketsSanitizados) }],
  });

  const bloqueTexto = response.content.find((b) => b.type === "text");
  if (!bloqueTexto || bloqueTexto.type !== "text") {
    throw new Error("La IA no devolvió texto en la respuesta.");
  }

  const json = extraerJson(bloqueTexto.text) as Record<string, unknown>;
  if (!json.introduccion) {
    throw new Error("La respuesta de la IA no incluye la introducción.");
  }

  const narrativaSanitizada: Narrativa = {
    introduccion: String(json.introduccion),
    tiposDetalle: validarGrupos(json.tiposDetalle),
    analisis: validarBullets(json.analisis, "analisis"),
    recomendacion: validarBullets(json.recomendacion, "recomendacion"),
  };

  return desanitizarNarrativa(narrativaSanitizada, ctx);
}
