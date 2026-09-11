"use client";

import TablaLeads from "./TablaLeads";
import {
  Barra,
  BarraApilada,
  COLOR_PERFIL,
  COLOR_PRIORIDAD,
  Card,
  Chip,
  StatTile,
} from "./ui";
import type { EstatusLead, Perfil, Prioridad, Resultado } from "@/lib/types";

const PERFILES: Perfil[] = ["Decisor", "Gerencial", "Tecnico"];
const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

function pct(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

export default function Dashboard({
  resultado,
  onCambiarEstatus,
}: {
  resultado: Resultado;
  onCambiarEstatus: (idLead: string, estatus: EstatusLead) => void;
}) {
  const { evento, proyeccion, asistencia, segmentacion, leads, porCam, sponsor, advertencias } =
    resultado;

  const desvio = asistencia.desviacionVsProyeccion;
  const maxSegmento = Math.max(...segmentacion.map((s) => s.registrados), 1);
  const maxCam = Math.max(...porCam.map((c) => c.asignados), 1);
  const pendientes = leads.filter((l) => l.estatus === "Pendiente").length;

  return (
    <div className="space-y-6">
      {/* Contexto del evento */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold text-ink">{evento.nombre}</h2>
        <span className="text-sm text-ink-muted">
          {[evento.fecha, evento.lugar, evento.tipo].filter(Boolean).join(" · ")}
        </span>
      </div>

      {advertencias.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-hairline bg-surface-1 p-4">
          {advertencias.map((a) => (
            <li key={a} className="flex gap-2 text-xs text-ink-soft">
              <span aria-hidden style={{ color: "var(--status-warning)" }}>
                ⚠
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Fila de KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile
          etiqueta="Registrados"
          valor={asistencia.registrados}
          detalle={evento.invitados > 0 ? `de ${evento.invitados} invitados` : undefined}
        />
        <StatTile
          etiqueta="Asistencia proyectada"
          valor={proyeccion.esperados}
          detalle={`rango ${proyeccion.rangoMin} - ${proyeccion.rangoMax}`}
        />
        <StatTile
          etiqueta="Asistencia real"
          valor={asistencia.confirmados}
          delta={{
            texto: `${desvio >= 0 ? "+" : ""}${desvio} vs proyeccion`,
            tono: desvio > 0 ? "bueno" : desvio < 0 ? "malo" : "neutro",
          }}
          detalle={pct(asistencia.tasaReal * 100)}
        />
        <StatTile
          etiqueta="Leads calificados"
          valor={sponsor.leadsCalificados}
          detalle={`de ${leads.length} leads generados`}
        />
        <StatTile
          etiqueta="Pendientes de contacto"
          valor={pendientes}
          delta={{
            texto: `${pct(sponsor.coberturaSeguimiento)} con ejecutivo`,
            tono: sponsor.coberturaSeguimiento === 100 ? "bueno" : "neutro",
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Proyeccion vs real */}
        <Card
          titulo="Proyeccion vs asistencia real"
          subtitulo={`Base historica: ${proyeccion.eventosBase} evento(s) de franja ${evento.franja} · tasa ${pct(proyeccion.tasaBaseFranja * 100)}`}
        >
          <div className="space-y-5">
            <Fila
              etiqueta="Registrados"
              valor={asistencia.registrados}
              maximo={asistencia.registrados}
              color="var(--gridline)"
              tono="var(--text-secondary)"
            />
            <div>
              <div className="mb-1.5 flex items-baseline justify-between text-xs">
                <span className="text-ink-soft">Proyectados</span>
                <span className="tabular text-ink">
                  {proyeccion.esperados}{" "}
                  <span className="text-ink-muted">
                    ({proyeccion.rangoMin} - {proyeccion.rangoMax})
                  </span>
                </span>
              </div>
              {/* Banda del rango con el punto esperado marcado encima */}
              <div className="relative h-3 w-full rounded-full" style={{ background: "var(--gridline)" }}>
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    left: `${(proyeccion.rangoMin / Math.max(1, asistencia.registrados)) * 100}%`,
                    width: `${((proyeccion.rangoMax - proyeccion.rangoMin) / Math.max(1, asistencia.registrados)) * 100}%`,
                    background: "var(--prioridad-baja)",
                  }}
                />
                <div
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
                  style={{
                    left: `${(proyeccion.esperados / Math.max(1, asistencia.registrados)) * 100}%`,
                    background: "var(--prioridad-alta)",
                    // Anillo del color de la superficie: separa la marca del relleno
                    ...({ "--tw-ring-color": "var(--surface-1)" } as React.CSSProperties),
                  }}
                />
              </div>
            </div>
            <Fila
              etiqueta="Asistieron (check-in)"
              valor={asistencia.confirmados}
              maximo={asistencia.registrados}
              color="var(--perfil-decisor)"
              tono="var(--text-primary)"
            />
            <Fila
              etiqueta="No show"
              valor={asistencia.noShow}
              maximo={asistencia.registrados}
              color="var(--status-serious)"
              tono="var(--text-secondary)"
            />
          </div>

          <ul className="mt-5 space-y-1.5 border-t border-hairline pt-4">
            {proyeccion.notas.map((n) => (
              <li key={n} className="text-xs text-ink-muted">
                · {n}
              </li>
            ))}
          </ul>
        </Card>

        {/* Segmentacion por perfil */}
        <Card
          titulo="Segmentacion por perfil"
          subtitulo="Clasificacion automatica a partir del cargo declarado en el registro"
          accion={
            <div className="flex flex-wrap gap-3">
              {PERFILES.map((p) => (
                <Chip key={p} color={COLOR_PERFIL[p]} texto={p} />
              ))}
            </div>
          }
        >
          <div className="space-y-5">
            {segmentacion.map((s) => (
              <div key={s.perfil}>
                <div className="mb-1.5 flex items-baseline justify-between text-xs">
                  <span className="text-ink-soft">{s.perfil}</span>
                  <span className="tabular text-ink">
                    {s.asistentes} asistieron
                    <span className="text-ink-muted"> / {s.registrados} registrados</span>
                  </span>
                </div>
                {/* La pista clara es el registro; el relleno de color, la asistencia real */}
                <div
                  className="relative h-2.5 w-full rounded-full"
                  style={{ background: "var(--gridline)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-30"
                    style={{
                      width: `${(s.registrados / maxSegmento) * 100}%`,
                      background: COLOR_PERFIL[s.perfil],
                    }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${(s.asistentes / maxSegmento) * 100}%`,
                      background: COLOR_PERFIL[s.perfil],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-hairline pt-4">
            {sponsor.mixPerfiles.map((m) => (
              <div key={m.perfil}>
                <p className="text-xs text-ink-muted">{m.perfil}</p>
                <p className="tabular mt-0.5 text-lg font-semibold text-ink">
                  {pct(m.porcentaje)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Carga por ejecutivo */}
      <Card
        titulo="Asignacion de leads por ejecutivo (CAM)"
        subtitulo="Cada lead va al especialista de su industria; si no hay capacidad, se balancea al ejecutivo con menor carga"
        accion={
          <div className="flex flex-wrap gap-3">
            {PRIORIDADES.map((p) => (
              <Chip key={p} color={COLOR_PRIORIDAD[p]} texto={`Prioridad ${p.toLowerCase()}`} />
            ))}
          </div>
        }
      >
        <div className="space-y-5">
          {porCam.map((cam) => (
            <div key={cam.camId}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium text-ink">{cam.nombre}</span>
                  <span className="text-xs text-ink-muted">{cam.industrias.join(" · ")}</span>
                </div>
                <span className="tabular text-xs text-ink-soft">
                  {cam.asignados} / {cam.capacidad} de capacidad
                  <span className="text-ink-muted">
                    {" "}
                    · {cam.alta} alta, {cam.media} media, {cam.baja} baja
                  </span>
                </span>
              </div>
              <div style={{ width: `${(cam.asignados / maxCam) * 100}%`, minWidth: cam.asignados > 0 ? "2rem" : "0" }}>
                <BarraApilada
                  total={cam.asignados}
                  segmentos={[
                    { valor: cam.alta, color: COLOR_PRIORIDAD.Alta, etiqueta: "Alta" },
                    { valor: cam.media, color: COLOR_PRIORIDAD.Media, etiqueta: "Media" },
                    { valor: cam.baja, color: COLOR_PRIORIDAD.Baja, etiqueta: "Baja" },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Industrias */}
      <Card
        titulo="Industrias representadas"
        subtitulo="Top 5 por numero de leads generados"
      >
        <div className="space-y-4">
          {sponsor.topIndustrias.map((i) => (
            <div key={i.industria}>
              <div className="mb-1.5 flex items-baseline justify-between text-xs">
                <span className="text-ink-soft">{i.industria}</span>
                <span className="tabular text-ink">{i.total} leads</span>
              </div>
              <Barra
                valor={i.total}
                maximo={sponsor.topIndustrias[0]?.total ?? 1}
                color="var(--perfil-decisor)"
                altura={8}
              />
            </div>
          ))}
        </div>
      </Card>

      <TablaLeads leads={leads} onCambiarEstatus={onCambiarEstatus} />
    </div>
  );
}

function Fila({
  etiqueta,
  valor,
  maximo,
  color,
  tono,
}: {
  etiqueta: string;
  valor: number;
  maximo: number;
  color: string;
  tono: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="text-ink-soft">{etiqueta}</span>
        <span className="tabular" style={{ color: tono }}>
          {valor}
        </span>
      </div>
      <Barra valor={valor} maximo={maximo} color={color} altura={10} />
    </div>
  );
}
