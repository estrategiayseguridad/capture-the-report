"use client";

import { useState } from "react";
import NuevoEvento from "./NuevoEvento";
import { Barra, Card } from "./ui";
import type { EventoGuardado } from "@/lib/almacen";
import type { ResumenFranja } from "@/lib/engine";
import type { EventoConfig, EventoHistorico } from "@/lib/types";

const ETIQUETA_FRANJA: Record<string, string> = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  nocturno: "Nocturno",
  jornada: "Jornada completa",
};

function pct(valor: number): string {
  return `${(valor * 100).toFixed(1)}%`;
}

export default function PanelEventos({
  eventosGuardados,
  historico,
  tasasPorFranja,
  onVerInforme,
  onEliminar,
  onNuevo,
  formulario,
}: {
  eventosGuardados: EventoGuardado[];
  historico: EventoHistorico[];
  tasasPorFranja: ResumenFranja[];
  onVerInforme: (id: string) => void;
  onEliminar: (id: string) => void;
  onNuevo: () => void;
  formulario: React.ComponentProps<typeof NuevoEvento> & { evento: EventoConfig };
}) {
  const hayGuardados = eventosGuardados.length > 0;
  const [formAbierto, setFormAbierto] = useState(!hayGuardados);

  return (
    <div className="space-y-6">
      {/* Eventos ya analizados en esta maquina */}
      {hayGuardados && (
        <Card
          titulo="Eventos analizados"
          subtitulo={`${eventosGuardados.length} evento(s) con informe generado · guardados en este navegador`}
        >
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs text-ink-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Evento
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Asistentes
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Leads
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Calificados
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Pendientes
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventosGuardados.map(({ id, resultado }) => {
                  const pendientes = resultado.leads.filter(
                    (l) => l.estatus === "Pendiente",
                  ).length;

                  return (
                    <tr key={id} className="border-b border-hairline/60 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-ink">{resultado.evento.nombre}</p>
                        <p className="text-xs text-ink-muted">
                          {[
                            resultado.evento.fecha,
                            resultado.evento.lugar,
                            resultado.evento.tipo,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </td>
                      <td className="tabular py-3 pr-3 text-right text-ink">
                        {resultado.asistencia.confirmados}
                        <span className="text-ink-muted">
                          {" "}
                          / {resultado.asistencia.registrados}
                        </span>
                      </td>
                      <td className="tabular py-3 pr-3 text-right text-ink">
                        {resultado.leads.length}
                      </td>
                      <td className="tabular py-3 pr-3 text-right text-ink">
                        {resultado.sponsor.leadsCalificados}
                      </td>
                      <td className="tabular py-3 pr-3 text-right">
                        <span
                          style={{
                            color:
                              pendientes === 0
                                ? "var(--status-good)"
                                : "var(--status-warning)",
                          }}
                        >
                          {pendientes === 0 ? "✓ 0" : `○ ${pendientes}`}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onVerInforme(id)}
                            className="rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-white/25"
                          >
                            Ver informe
                          </button>
                          <button
                            type="button"
                            onClick={() => onEliminar(id)}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
                            aria-label={`Eliminar ${resultado.evento.nombre}`}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Alta de un evento nuevo */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Nuevo evento</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Sube el listado de asistentes y genera el informe del evento.
            </p>
          </div>
          {hayGuardados && (
            <button
              type="button"
              onClick={() => {
                if (!formAbierto) onNuevo();
                setFormAbierto((v) => !v);
              }}
              className="rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-white/25"
            >
              {formAbierto ? "Ocultar formulario" : "+ Nuevo evento"}
            </button>
          )}
        </div>
        {formAbierto && <NuevoEvento {...formulario} />}
      </section>

      {/* Historico que alimenta la proyeccion */}
      <Card
        titulo="Historico de referencia"
        subtitulo="Eventos anteriores con asistencia registrada. De aqui sale la tasa base que proyecta la asistencia de un evento nuevo."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tasasPorFranja.map((t) => (
            <div key={t.franja} className="rounded-lg border border-hairline p-4">
              <p className="text-xs text-ink-muted">{ETIQUETA_FRANJA[t.franja] ?? t.franja}</p>
              <p className="tabular mt-1 text-2xl font-semibold text-ink">{pct(t.tasa)}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {t.asistentes} de {t.invitados} invitados · {t.eventos} evento(s)
              </p>
              <div className="mt-3">
                <Barra
                  valor={t.tasa}
                  maximo={1}
                  color="var(--perfil-decisor)"
                  altura={6}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="-mx-5 mt-6 overflow-x-auto px-5">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-muted">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Evento
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Franja
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Tipo
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Invitados
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Asistentes
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Tasa
                </th>
              </tr>
            </thead>
            <tbody>
              {historico.map((e) => (
                <tr key={e.id} className="border-b border-hairline/60 last:border-0">
                  <td className="py-2.5 pr-3">
                    <p className="text-ink-soft">{e.nombre}</p>
                    <p className="text-xs text-ink-muted">
                      Q{e.trimestre} · {e.horario}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-ink-muted">
                    {ETIQUETA_FRANJA[e.franja] ?? e.franja}
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-ink-muted">{e.tipo}</td>
                  <td className="tabular py-2.5 pr-3 text-right text-ink-soft">{e.invitados}</td>
                  <td className="tabular py-2.5 pr-3 text-right text-ink">{e.asistentes}</td>
                  <td className="tabular py-2.5 text-right text-ink-soft">
                    {pct(e.asistentes / e.invitados)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          Derivado de <span className="font-mono">data/DETALLES POR EVENTOS 2026-ejemplo.xlsx</span>.
          Los eventos nocturnos rinden menos asistencia que los diurnos, y por eso la proyeccion
          usa la tasa de la franja del evento y no un promedio global.
        </p>
      </Card>
    </div>
  );
}
