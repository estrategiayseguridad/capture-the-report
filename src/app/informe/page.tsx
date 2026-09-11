import Link from "next/link";
import datos from "../../../data/halo-demo-agosto.json";
import historial from "../../../data/historial-mensual.json";
import { construirInforme } from "@/lib/informe";
import type { Ticket } from "@/lib/metricas";
import { BotonImprimir } from "./boton-imprimir";

export default function InformePage() {
  const { titulo, cuerpo } = construirInforme(datos.tickets as Ticket[], {
    cliente: datos.cliente,
    periodo: datos.periodo,
    historial: historial.meses.map((x) => [x.mes, x.tickets] as [string, number]),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="no-imprimir mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver al dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs text-slate-500">
            Cifras insertadas automaticamente. Nada se transcribio a mano.
          </span>
          <a
            href="/api/informe"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Descargar para Word
          </a>
          <BotonImprimir />
        </div>
      </div>

      <article
        className="hoja mx-auto max-w-3xl rounded-lg bg-white p-10 shadow-lg"
        dangerouslySetInnerHTML={{ __html: cuerpo }}
      />

      <p className="no-imprimir mt-4 text-center text-xs text-slate-400">
        {titulo} · generado por Reportero CSC · imprimir a PDF con Ctrl+P
      </p>
    </main>
  );
}
