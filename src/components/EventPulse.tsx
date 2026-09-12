"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Dashboard from "./Dashboard";
import PanelEventos from "./PanelEventos";
import ReporteSponsor from "./ReporteSponsor";
import {
  actualizarEvento,
  eliminarEvento,
  guardarEvento,
  snapshotEventos,
  snapshotServidor,
  suscribir,
} from "@/lib/almacen";
import type { ResumenFranja } from "@/lib/engine";
import type { EstatusLead, EventoConfig, EventoHistorico, Resultado } from "@/lib/types";

type Tab = "eventos" | "informes";
type VistaInforme = "dashboard" | "reporte";

const EVENTO_INICIAL: EventoConfig = {
  nombre: "",
  fecha: "",
  lugar: "",
  franja: "nocturno",
  tipo: "Propio",
  invitados: 0,
  montoQ: 0,
};

export default function EventPulse({
  historico,
  tasasPorFranja,
}: {
  historico: EventoHistorico[];
  tasasPorFranja: ResumenFranja[];
}) {
  const [csv, setCsv] = useState("");
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [evento, setEvento] = useState<EventoConfig>(EVENTO_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("eventos");
  const [vista, setVista] = useState<VistaInforme>("dashboard");
  const [eventoActivoId, setEventoActivoId] = useState<string | null>(null);

  // Fuente unica de verdad: los eventos analizados viven en localStorage.
  const eventosGuardados = useSyncExternalStore(suscribir, snapshotEventos, snapshotServidor);

  const activo = useMemo(
    () => eventosGuardados.find((e) => e.id === eventoActivoId) ?? null,
    [eventosGuardados, eventoActivoId],
  );
  const resultado: Resultado | null = activo?.resultado ?? null;

  /** Trae el CSV de demo del repo y precarga la configuracion del evento. */
  const traerDemo = useCallback(async () => {
    const res = await fetch("/api/demo");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo cargar la demo.");
    const config: EventoConfig = { ...EVENTO_INICIAL, ...data.evento };
    setCsv(data.csv);
    setNombreArchivo("asistentes-demo.csv");
    setEvento(config);
    return { csv: data.csv as string, evento: config };
  }, []);

  const procesarDatos = useCallback(async (csvTexto: string, config: EventoConfig) => {
    const res = await fetch("/api/procesar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvTexto, evento: config }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo procesar el archivo.");
    const guardado = guardarEvento(data as Resultado);
    setEventoActivoId(guardado.id);
    setVista("dashboard");
    setTab("informes");
  }, []);

  async function cargarDemo() {
    setError("");
    setCargando(true);
    try {
      await traerDemo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar la demo.");
    } finally {
      setCargando(false);
    }
  }

  async function leerArchivo(archivo: File) {
    setError("");
    const texto = await archivo.text();
    setCsv(texto);
    setNombreArchivo(archivo.name);
  }

  async function procesar() {
    if (!csv.trim()) {
      setError("Primero carga un CSV de asistentes.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      await procesarDatos(csv, evento);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar.");
    } finally {
      setCargando(false);
    }
  }

  /** Cambia el estatus de un lead y lo persiste con el resto del evento. */
  function cambiarEstatus(idLead: string, estatus: EstatusLead) {
    if (!activo) return;
    const leads = activo.resultado.leads.map((l) =>
      l.id === idLead ? { ...l, estatus } : l,
    );
    actualizarEvento(activo.id, { ...activo.resultado, leads });
  }

  function verInforme(id: string) {
    setEventoActivoId(id);
    setVista("dashboard");
    setTab("informes");
    setError("");
  }

  function borrar(id: string) {
    eliminarEvento(id);
    if (eventoActivoId === id) setEventoActivoId(null);
  }

  /** Deja el formulario en blanco para dar de alta otro evento. */
  function limpiarFormulario() {
    setCsv("");
    setNombreArchivo("");
    setEvento(EVENTO_INICIAL);
    setError("");
  }

  useEffect(() => {
    document.title = resultado
      ? `${resultado.evento.nombre} — EventPulse 360`
      : "EventPulse 360";
  }, [resultado]);

  // Atajo para la demo: /?demo=1 procesa el CSV de ejemplo y abre el informe.
  // Con &vista=reporte abre el reporte del sponsor; con &vista=eventos, la
  // pestana Eventos ya con el evento en el listado.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "1") return;
    const destino = params.get("vista");
    let cancelado = false;
    void (async () => {
      setCargando(true);
      try {
        const { csv: csvDemo, evento: config } = await traerDemo();
        if (!cancelado) {
          await procesarDatos(csvDemo, config);
          if (destino === "reporte") setVista("reporte");
          if (destino === "eventos") setTab("eventos");
        }
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : "Error al cargar la demo.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [traerDemo, procesarDatos]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="no-print mb-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">
          Capture The Report · Equipo 04
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">EventPulse 360</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Del listado de asistentes al lead asignado y al reporte del sponsor, sin hojas de
          calculo intermedias.
        </p>
      </header>

      {/* Tabs principales */}
      <nav
        className="no-print mb-6 flex items-center gap-1 border-b border-hairline"
        aria-label="Secciones"
      >
        <TabBoton activo={tab === "eventos"} onClick={() => setTab("eventos")}>
          Eventos
          {eventosGuardados.length > 0 && (
            <span className="tabular ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
              {eventosGuardados.length}
            </span>
          )}
        </TabBoton>
        <TabBoton activo={tab === "informes"} onClick={() => setTab("informes")}>
          Informes
        </TabBoton>
      </nav>

      {error && (
        <p
          role="alert"
          className="no-print mb-6 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "var(--status-critical)", color: "var(--status-critical)" }}
        >
          ⚠ {error}
        </p>
      )}

      {tab === "eventos" && (
        <div className="no-print">
          <PanelEventos
            eventosGuardados={eventosGuardados}
            historico={historico}
            tasasPorFranja={tasasPorFranja}
            onVerInforme={verInforme}
            onEliminar={borrar}
            onNuevo={limpiarFormulario}
            formulario={{
              csv,
              nombreArchivo,
              evento,
              cargando,
              onCsv: setCsv,
              onArchivo: (archivo) => void leerArchivo(archivo),
              onEvento: setEvento,
              onCargarDemo: () => void cargarDemo(),
              onProcesar: () => void procesar(),
            }}
          />
        </div>
      )}

      {tab === "informes" && !resultado && (
        <div className="rounded-xl border border-hairline bg-surface-1 p-10 text-center">
          <p className="text-sm font-medium text-ink">Todavia no hay un informe abierto</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Ve a la pestana <strong className="text-ink">Eventos</strong>, procesa un listado de
            asistentes y el informe aparecera aqui.
          </p>
          <button
            type="button"
            onClick={() => setTab("eventos")}
            className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            style={{ background: "var(--perfil-decisor)" }}
          >
            Ir a Eventos
          </button>
        </div>
      )}

      {tab === "informes" && resultado && (
        <>
          <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SubBoton activo={vista === "dashboard"} onClick={() => setVista("dashboard")}>
                Dashboard operativo
              </SubBoton>
              <SubBoton activo={vista === "reporte"} onClick={() => setVista("reporte")}>
                Reporte sponsor
              </SubBoton>
            </div>

            {eventosGuardados.length > 1 ? (
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                Evento
                <select
                  value={eventoActivoId ?? ""}
                  onChange={(e) => setEventoActivoId(e.target.value)}
                  className="entrada w-auto"
                >
                  {eventosGuardados.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.resultado.evento.nombre}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-xs text-ink-muted">{resultado.evento.nombre}</p>
            )}
          </div>

          {vista === "dashboard" ? (
            <Dashboard resultado={resultado} onCambiarEstatus={cambiarEstatus} />
          ) : (
            <ReporteSponsor resultado={resultado} />
          )}
        </>
      )}
    </div>
  );
}

function TabBoton({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activo ? "page" : undefined}
      className={`-mb-px flex items-center border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        activo
          ? "border-current text-ink"
          : "border-transparent text-ink-muted hover:text-ink-soft"
      }`}
      style={activo ? { borderColor: "var(--perfil-decisor)" } : undefined}
    >
      {children}
    </button>
  );
}

function SubBoton({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        activo
          ? "border-hairline bg-surface-2 text-ink"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
