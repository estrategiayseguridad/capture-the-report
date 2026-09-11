import { cierreActivo } from "@/lib/cierre-activo";
import { construirInforme, documentoWord } from "@/lib/informe";

/**
 * Descarga el informe como documento que Word abre respetando el formato.
 * Es HTML con estilos en linea y cabeceras de Office — no es .docx nativo, y esta
 * documentado como tal en el planteamiento. Sirve para entregar hoy.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const cierre = cierreActivo();
  const { titulo, cuerpo } = construirInforme(cierre.tickets, {
    cliente: cierre.cliente,
    periodo: cierre.periodo,
    historial: cierre.historial,
  });

  const nombre = `${titulo.replace(/[^\p{L}\p{N} .-]/gu, "").replace(/\s+/g, " ").trim()}.doc`;

  return new Response(documentoWord(titulo, cuerpo), {
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
    },
  });
}
