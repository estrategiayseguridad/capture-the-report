"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import ReporteSponsor from "./ReporteSponsor";
import type { EstatusLead, EventoConfig, Franja, Resultado } from "@/lib/types";

type Vista = "dashboard" | "reporte";

const EVENTO_INICIAL: EventoConfig = {
  nombre: "",
  fecha: "",
  lugar: "",
  franja: "nocturno",
  tipo: "Propio",
  invitados: 0,
  montoQ: 0,
};

const FRANJAS: { valor: Franja; etiqueta: string }[] = [
  { valor: "matutino", etiqueta: "Matutino (7:00 - 13:00)" },
  { valor: "vespertino", etiqueta: "Vespertino (13:00 - 17:00)" },
  { valor: "nocturno", etiqueta: "Nocturno (18:00 en adelante)" },
  { valor: "jornada", etiqueta: "Jornada completa (8:00 - 18:00)" },
];

function claveEstatus(nombreEvento: string): string {
  return `eventpulse:estatus:${nombreEvento}`;
}

export default function EventPulse() {
  const [csv, setCsv] = useState("");
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [evento, setEvento] = useState<EventoConfig>(EVENTO_INICIAL);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [vista, setVista] = useState<Vista>("dashboard");

  const filasCsv = useMemo(
    () => csv.split("\n").filter((l) => l.trim() !== "").length,
    [csv],
  );

  /** Restaura los estatus guardados en localStorage para este evento. */
  const aplicarEstatusGuardados = useCallback((base: Resultado): Resultado => {
    try {
      const guardado = window.localStorage.getItem(claveEstatus(base.evento.nombre));
      if (!guardado) return base;
      const mapa = JSON.parse(guardado) as Record<string, EstatusLead>;
      return {
        ...base,
        leads: base.leads.map((l) => (mapa[l.id] ? { ...l, estatus: mapa[l.id] } : l)),
      };
    } catch {
      return base;
    }
  }, []);

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

  const procesarDatos = useCallback(
    async (csvTexto: string, config: EventoConfig) => {
      const res = await fetch("/api/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvTexto, evento: config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo procesar el archivo.");
      setResultado(aplicarEstatusGuardados(data as Resultado));
      setVista("dashboard");
    },
    [aplicarEstatusGuardados],
  );

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

  /** Cambia el estatus de un lead y lo persiste en localStorage. */
  function cambiarEstatus(idLead: string, estatus: EstatusLead) {
    setResultado((actual) => {
      if (!actual) return actual;
      const leads = actual.leads.map((l) => (l.id === idLead ? { ...l, estatus } : l));
      try {
        const mapa = Object.fromEntries(leads.map((l) => [l.id, l.estatus]));
        window.localStorage.setItem(claveEstatus(actual.evento.nombre), JSON.stringify(mapa));
      } catch {
        // Sin localStorage el prototipo sigue funcionando en memoria.
      }
      return { ...actual, leads };
    });
  }

  function reiniciar() {
    if (resultado) {
      try {
        window.localStorage.removeItem(claveEstatus(resultado.evento.nombre));
      } catch {
        // ignorado
      }
    }
    setResultado(null);
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

  // Atajo para la demo: /?demo=1 carga el CSV de ejemplo y muestra el dashboard.
  // Con &vista=reporte abre directo el reporte del sponsor.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "1") return;
    const vistaInicial: Vista = params.get("vista") === "reporte" ? "reporte" : "dashboard";
    let cancelado = false;
    void (async () => {
      setCargando(true);
      try {
        const { csv: csvDemo, evento: config } = await traerDemo();
        if (!cancelado) {
          await procesarDatos(csvDemo, config);
          setVista(vistaInicial);
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
      <header className="no-print mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">
            Capture The Report · Equipo 04
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            EventPulse 360
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Del listado de asistentes al lead asignado y al reporte del sponsor, sin hojas de
            calculo intermedias.
          </p>
        </div>

        {resultado && (
          <nav className="flex items-center gap-2" aria-label="Vistas">
            <button
              type="button"
              onClick={() => setVista("dashboard")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                vista === "dashboard"
                  ? "border-hairline bg-surface-2 text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setVista("reporte")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                vista === "reporte"
                  ? "border-hairline bg-surface-2 text-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              Reporte sponsor
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-lg border border-hairline px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Nuevo evento
            </button>
          </nav>
        )}
      </header>

      {!resultado && (
        <div className="no-print grid gap-6 lg:grid-cols-5">
          {/* Paso 1: el archivo */}
          <section className="rounded-xl border border-hairline bg-surface-1 p-6 lg:col-span-3">
            <h2 className="text-sm font-semibold text-ink">1. Listado de asistentes</h2>
            <p className="mt-1 text-xs text-ink-muted">
              CSV con al menos la columna <code className="font-mono">nombre</code>. Se reconocen
              tambien empresa, cargo, industria, canal_registro, check_in e interes.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-lg border border-hairline bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-white/25">
                Seleccionar CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const archivo = e.target.files?.[0];
                    if (archivo) void leerArchivo(archivo);
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => void cargarDemo()}
                disabled={cargando}
                className="rounded-lg px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--perfil-decisor)" }}
              >
                Cargar datos de demo
              </button>
              {nombreArchivo && (
                <span className="text-xs text-ink-soft">
                  <span className="font-mono">{nombreArchivo}</span> · {Math.max(0, filasCsv - 1)}{" "}
                  registros
                </span>
              )}
            </div>

            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              spellCheck={false}
              placeholder={"nombre,email,empresa,cargo,industria,canal_registro,check_in,interes\nAna Herrera,ana@empresa.com,Banco Demo,CISO,Banca,Invitacion directa,Si,SOC gestionado"}
              className="mt-4 h-56 w-full resize-y rounded-lg border border-hairline bg-plane p-3 font-mono text-xs text-ink-soft outline-none focus:border-white/25"
            />
          </section>

          {/* Paso 2: el contexto del evento */}
          <section className="rounded-xl border border-hairline bg-surface-1 p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">2. Datos del evento</h2>
            <p className="mt-1 text-xs text-ink-muted">
              La franja horaria y los invitados alimentan la proyeccion de asistencia; el monto,
              el costo por lead.
            </p>

            <div className="mt-4 space-y-3">
              <Campo etiqueta="Nombre del evento">
                <input
                  value={evento.nombre}
                  onChange={(e) => setEvento({ ...evento, nombre: e.target.value })}
                  placeholder="La Nueva Era de la Defensa Digital"
                  className="entrada w-full"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Fecha">
                  <input
                    type="date"
                    value={evento.fecha}
                    onChange={(e) => setEvento({ ...evento, fecha: e.target.value })}
                    className="entrada w-full"
                  />
                </Campo>
                <Campo etiqueta="Tipo">
                  <select
                    value={evento.tipo}
                    onChange={(e) =>
                      setEvento({ ...evento, tipo: e.target.value as EventoConfig["tipo"] })
                    }
                    className="entrada w-full"
                  >
                    <option value="Propio">Propio</option>
                    <option value="Sponsor">Sponsor</option>
                  </select>
                </Campo>
              </div>

              <Campo etiqueta="Lugar">
                <input
                  value={evento.lugar}
                  onChange={(e) => setEvento({ ...evento, lugar: e.target.value })}
                  placeholder="Lugar 3 - Corporativo / Formal"
                  className="entrada w-full"
                />
              </Campo>

              <Campo etiqueta="Franja horaria">
                <select
                  value={evento.franja}
                  onChange={(e) => setEvento({ ...evento, franja: e.target.value as Franja })}
                  className="entrada w-full"
                >
                  {FRANJAS.map((f) => (
                    <option key={f.valor} value={f.valor}>
                      {f.etiqueta}
                    </option>
                  ))}
                </select>
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Invitados">
                  <input
                    type="number"
                    min={0}
                    value={evento.invitados || ""}
                    onChange={(e) => setEvento({ ...evento, invitados: Number(e.target.value) })}
                    className="entrada tabular w-full"
                  />
                </Campo>
                <Campo etiqueta="Inversion (Q)">
                  <input
                    type="number"
                    min={0}
                    value={evento.montoQ || ""}
                    onChange={(e) => setEvento({ ...evento, montoQ: Number(e.target.value) })}
                    className="entrada tabular w-full"
                  />
                </Campo>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void procesar()}
              disabled={cargando || !csv.trim()}
              className="mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--perfil-decisor)" }}
            >
              {cargando ? "Procesando..." : "Procesar y generar dashboard"}
            </button>
          </section>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="no-print mt-6 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "var(--status-critical)", color: "var(--status-critical)" }}
        >
          ⚠ {error}
        </p>
      )}

      {resultado && vista === "dashboard" && (
        <Dashboard resultado={resultado} onCambiarEstatus={cambiarEstatus} />
      )}

      {resultado && vista === "reporte" && <ReporteSponsor resultado={resultado} />}
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-muted">{etiqueta}</span>
      {children}
    </label>
  );
}
