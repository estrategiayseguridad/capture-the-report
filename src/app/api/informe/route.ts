import datos from "../../../../data/halo-demo-agosto.json";
import historial from "../../../../data/historial-mensual.json";
import { construirInforme, documentoWord } from "@/lib/informe";
import type { Ticket } from "@/lib/metricas";

/**
 * Descarga el informe como documento que Word abre respetando el formato.
 * Es HTML con estilos en linea y cabeceras de Office — no es .docx nativo, y esta
 * documentado como tal en el planteamiento. Sirve para entregar hoy.
 */
export function GET() {
  const { titulo, cuerpo } = construirInforme(datos.tickets as Ticket[], {
    cliente: datos.cliente,
    periodo: datos.periodo,
    historial: historial.meses.map((x) => [x.mes, x.tickets] as [string, number]),
  });

  const nombre = `${titulo.replace(/[^\p{L}\p{N} .-]/gu, "").replace(/\s+/g, " ").trim()}.doc`;

  return new Response(documentoWord(titulo, cuerpo), {
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
    },
  });
}
