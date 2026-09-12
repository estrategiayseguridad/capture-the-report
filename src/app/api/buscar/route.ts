import { buscar } from "@/lib/buscar";
import { leerInventario } from "@/lib/datos";

/**
 * GET /api/buscar?q=Infoblox
 *
 * El mismo motor que usa la interfaz, expuesto como contrato. Sirve para
 * probar el ranking sin abrir el navegador:
 *   curl "http://localhost:3000/api/buscar?q=Infoblox" | jq
 */
export async function GET(request: Request) {
  const consulta = new URL(request.url).searchParams.get("q") ?? "";

  if (!consulta.trim()) {
    return Response.json(
      { error: "Falta ?q= con los requisitos de la licitación." },
      { status: 400 },
    );
  }

  const inventario = await leerInventario();
  const resultado = buscar(inventario, consulta);

  return Response.json({
    consulta: resultado.consulta,
    requisitos: resultado.requisitos.map((r) => ({
      textoOriginal: r.textoOriginal,
      tipo: r.tipo,
      etiqueta: r.etiqueta,
    })),
    noReconocidos: resultado.noReconocidos,
    total: resultado.candidatos.length,
    candidatos: resultado.candidatos.map((c) => ({
      id: c.persona.id,
      nombre: c.persona.nombre,
      equipo: c.persona.equipo,
      rol: c.persona.rol,
      disponibilidad: c.persona.disponibilidad,
      idiomas: c.persona.idiomas,
      score: c.score,
      requisitosCubiertos: c.requisitosCubiertos,
      requisitosCertificados: c.requisitosCertificados,
      coberturas: c.coberturas.map((cob) => ({
        requisito: cob.requisito.etiqueta,
        nivel: cob.nivel,
        certificacion: cob.certificacion?.nombre ?? null,
      })),
    })),
  });
}
