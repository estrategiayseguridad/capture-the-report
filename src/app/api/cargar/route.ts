import { guardarCierre, olvidarCierre } from "@/lib/almacen";
import { ErrorDeArchivo, parsearHalo } from "@/lib/parsear-xlsx";

/** Recibe el .xlsx exportado de Halo, lo parsea y lo deja como cierre activo. */
export async function POST(peticion: Request) {
  try {
    const formulario = await peticion.formData();
    const archivo = formulario.get("archivo");

    if (!(archivo instanceof File)) {
      return Response.json({ error: "No llego ningun archivo." }, { status: 400 });
    }
    if (!/\.xlsx?$/i.test(archivo.name)) {
      return Response.json(
        { error: `"${archivo.name}" no es un Excel. Se espera el .xlsx que exporta Halo.` },
        { status: 400 },
      );
    }

    const { tickets, hoja, cliente, periodo, avisos } = parsearHalo(await archivo.arrayBuffer());

    guardarCierre({
      tickets,
      cliente,
      periodo,
      hoja,
      avisos,
      origen: archivo.name,
    });

    return Response.json({ total: tickets.length, cliente, periodo, hoja, avisos });
  } catch (error) {
    if (error instanceof ErrorDeArchivo) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    console.error("Error al cargar el archivo:", error);
    return Response.json({ error: "No se pudo procesar el archivo." }, { status: 500 });
  }
}

/** Vuelve al dataset de demo. Util en la demo si hay que empezar de nuevo. */
export function DELETE() {
  olvidarCierre();
  return Response.json({ ok: true });
}
