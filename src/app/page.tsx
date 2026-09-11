import Link from "next/link";
import { cierreActivo } from "@/lib/cierre-activo";
import {
  agruparPorHerramienta,
  calcularMetricas,
  formatearHoras,
  ticketsPerdidosEnProcesoManual,
} from "@/lib/metricas";
import { Barras, BarrasApiladas, PALETA, Panel, Pastel } from "./graficas";
import { TicketsPerdidos, VistasPorHerramienta } from "./vistas";
import { ZonaDeCarga } from "./zona-de-carga";

// El cierre vive en memoria del servidor: la pagina no puede quedar cacheada.
export const dynamic = "force-dynamic";

export default function Dashboard() {
  const cierre = cierreActivo();
  const tickets = cierre.tickets;
  const m = calcularMetricas(tickets);
  const grupos = agruparPorHerramienta(tickets);
  const perdidos = ticketsPerdidosEnProcesoManual(tickets);
  const meses = cierre.historial;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">Reportero CSC</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Cierre mensual de tickets — {cierre.periodo}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {cierre.cliente} · {m.total} tickets del {m.desde} al {m.hasta} · fuente: pestana{" "}
            <code className="text-slate-700">DATOS</code> del export de Halo
          </p>
        </div>
        <Link
          href="/informe"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Generar informe →
        </Link>
      </header>

      <div className="mt-5">
        <ZonaDeCarga origen={cierre.origen} />
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Indicador etiqueta="Tickets" valor={m.total} destacado />
        <Indicador etiqueta="Alertas" valor={cuenta(m.porTipo, "Alerta")} />
        <Indicador etiqueta="Solicitudes" valor={cuenta(m.porTipo, "Solicitud")} />
        <Indicador etiqueta="Cerrados" valor={m.cerrados} />
        <Indicador etiqueta="Pendientes" valor={m.pendientes} />
        <Indicador etiqueta="TPA / TMR" valor={`${formatearHoras(m.tpa.valor)}`} pie={`TMR ${m.tmr.valor.toFixed(2)} h (n=${m.tmr.n})`} />
      </section>

      <div className="mt-6">
        <TicketsPerdidos tickets={perdidos} total={m.total} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel titulo="1 · Historial mensual" subtitulo="Tickets atendidos por mes (2026)">
          <Barras datos={meses} />
        </Panel>
        <Panel titulo="2 · Tickets por tipo" subtitulo="Clasificacion del periodo">
          <Barras datos={m.porTipo} color={PALETA[1]} />
        </Panel>
        <Panel titulo="3 · Herramienta x estado" subtitulo="Distribucion por herramienta monitoreada">
          <BarrasApiladas estados={m.estados} filas={m.herramientaPorEstado} />
        </Panel>
        <Panel titulo="4 · Estado de los tickets" subtitulo={`${m.cerrados} cerrados · ${m.pendientes} pendientes`}>
          <Pastel datos={m.porEstado} />
        </Panel>
      </div>

      <div className="mt-6">
        <Panel
          titulo="Vistas por herramienta"
          subtitulo="Generadas desde la columna Category — equivalen a las pestanas CLOUDFLARE / BEYONTRUST / THINKSCANARY"
        >
          <VistasPorHerramienta grupos={grupos} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel titulo="Tickets por linea de soporte">
          <Barras datos={m.porEquipo} color={PALETA[2]} />
        </Panel>
        <Panel titulo="Carga por agente" subtitulo={`${m.porAgente.length} agentes asignados`}>
          <Barras datos={m.porAgente} color={PALETA[4]} />
        </Panel>
      </div>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-400">
        Equipo 08 · Datos sanitizados: cliente ficticio, agentes y usuarios anonimizados. Las
        distribuciones son las del cierre real, asi que estas cifras deben cuadrar con el informe
        publicado.
      </footer>
    </main>
  );
}

function cuenta(pares: [string, number][], clave: string): number {
  return pares.find(([k]) => k === clave)?.[1] ?? 0;
}

function Indicador({
  etiqueta,
  valor,
  pie,
  destacado,
}: {
  etiqueta: string;
  valor: string | number;
  pie?: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        destacado ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{etiqueta}</p>
      <p className={`mt-1 text-2xl font-bold ${destacado ? "text-blue-700" : "text-slate-900"}`}>
        {valor}
      </p>
      {pie && <p className="mt-0.5 text-[11px] text-slate-400">{pie}</p>}
    </div>
  );
}
