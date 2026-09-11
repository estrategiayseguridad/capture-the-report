"use client";

import { COLOR_PERFIL } from "./ui";
import type { EstatusLead, Resultado } from "@/lib/types";

function q(monto: number): string {
  return `Q${Math.round(monto).toLocaleString("es-GT")}`;
}

export default function ReporteSponsor({ resultado }: { resultado: Resultado }) {
  const { evento, sponsor, asistencia, proyeccion, leads, porCam } = resultado;

  const conteoEstatus = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.estatus] = (acc[l.estatus] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <article className="print-page mx-auto max-w-4xl rounded-xl border border-hairline bg-surface-1 p-8 sm:p-10">
      <div className="no-print mb-8 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-white/25"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <header className="border-b border-hairline pb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">
          Reporte post-evento para patrocinador
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{evento.nombre}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {[evento.fecha, evento.lugar, `Evento ${evento.tipo.toLowerCase()}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <section className="mt-6">
        <h3 className="text-sm font-semibold text-ink">Resumen ejecutivo</h3>
        <div className="mt-3 space-y-2">
          {sponsor.resumenEjecutivo.map((linea) => (
            <p key={linea} className="text-sm leading-relaxed text-ink-soft">
              {linea}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Indicadores del evento</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Dato etiqueta="Invitados" valor={sponsor.invitados || "—"} />
          <Dato etiqueta="Registrados" valor={sponsor.registrados} />
          <Dato etiqueta="Asistentes" valor={sponsor.asistentes} />
          <Dato
            etiqueta="Tasa de asistencia"
            valor={`${(sponsor.tasaAsistencia * 100).toFixed(1)}%`}
          />
          <Dato etiqueta="Asistencia proyectada" valor={proyeccion.esperados} />
          <Dato
            etiqueta="Desviacion vs proyeccion"
            valor={`${asistencia.desviacionVsProyeccion >= 0 ? "+" : ""}${asistencia.desviacionVsProyeccion}`}
          />
          <Dato etiqueta="Leads generados" valor={sponsor.leadsGenerados} />
          <Dato etiqueta="Leads calificados" valor={sponsor.leadsCalificados} />
        </dl>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Retorno de la inversion</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Dato etiqueta="Inversion total" valor={sponsor.montoQ > 0 ? q(sponsor.montoQ) : "—"} />
          <Dato
            etiqueta="Costo por asistente"
            valor={sponsor.costoPorAsistente > 0 ? q(sponsor.costoPorAsistente) : "—"}
          />
          <Dato
            etiqueta="Costo por lead calificado"
            valor={sponsor.costoPorLeadCalificado > 0 ? q(sponsor.costoPorLeadCalificado) : "—"}
          />
        </dl>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Calidad de la audiencia</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-ink-muted">
              <th scope="col" className="py-2 font-medium">
                Perfil
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Leads
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Participacion
              </th>
            </tr>
          </thead>
          <tbody>
            {sponsor.mixPerfiles.map((m) => (
              <tr key={m.perfil} className="border-b border-hairline/60 last:border-0">
                <td className="py-2">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    <span
                      aria-hidden
                      className="inline-block size-2.5 rounded-full"
                      style={{ background: COLOR_PERFIL[m.perfil] }}
                    />
                    {m.perfil}
                  </span>
                </td>
                <td className="tabular py-2 text-right text-ink">{m.total}</td>
                <td className="tabular py-2 text-right text-ink-soft">
                  {m.porcentaje.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Industrias representadas</h3>
        <ul className="mt-3 space-y-1.5">
          {sponsor.topIndustrias.map((i) => (
            <li key={i.industria} className="flex justify-between text-sm">
              <span className="text-ink-soft">{i.industria}</span>
              <span className="tabular text-ink">{i.total} leads</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-ink">Estado del seguimiento comercial</h3>
        <ul className="mt-3 space-y-1.5">
          {Object.entries(conteoEstatus).map(([estatus, total]) => (
            <li key={estatus} className="flex justify-between text-sm">
              <span className="text-ink-soft">{estatus as EstatusLead}</span>
              <span className="tabular text-ink">{total} leads</span>
            </li>
          ))}
        </ul>

        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-ink-muted">
              <th scope="col" className="py-2 font-medium">
                Ejecutivo responsable
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Leads asignados
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Prioridad alta
              </th>
            </tr>
          </thead>
          <tbody>
            {porCam.map((c) => (
              <tr key={c.camId} className="border-b border-hairline/60 last:border-0">
                <td className="py-2 text-ink-soft">{c.nombre}</td>
                <td className="tabular py-2 text-right text-ink">{c.asignados}</td>
                <td className="tabular py-2 text-right text-ink-soft">{c.alta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 border-t border-hairline pt-4">
        <p className="text-xs text-ink-muted">
          Generado por EventPulse 360 · Prototipo de la hackathon interna Capture The Report.
          Datos de demostracion con empresas ficticias.
        </p>
      </footer>
    </article>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{etiqueta}</dt>
      <dd className="tabular mt-0.5 text-xl font-semibold text-ink">{valor}</dd>
    </div>
  );
}
