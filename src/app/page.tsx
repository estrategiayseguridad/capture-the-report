"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  computeReport,
  getClientes,
  normalizeRows,
  SLA_THRESHOLDS_DEFAULT,
  type Bullet,
  type Narrativa,
  type ReportData,
  type SlaThresholds,
  type TicketResumen,
  type TicketRow,
} from "@/lib/report";
import { guardarThresholds, obtenerThresholds } from "@/lib/slaStorage";

const COLORES = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

type NivelPrioridad = "alta" | "media" | "baja";

function CampoUmbral({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-slate-600">
      <span>{label}</span>
      <input
        type="number"
        min={1}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
        className="w-16 rounded border border-slate-300 px-2 py-1 text-right text-sm text-slate-900"
      />
    </label>
  );
}

function ConfiguracionSla({
  cliente,
  thresholds,
  onChange,
  onGuardado,
}: {
  cliente: string;
  thresholds: SlaThresholds;
  onChange: (t: SlaThresholds) => void;
  onGuardado: (t: SlaThresholds) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function actualizar(categoria: "incidente" | "requerimiento", nivel: NivelPrioridad, valor: number) {
    onChange({ ...thresholds, [categoria]: { ...thresholds[categoria], [nivel]: valor } });
    setGuardado(false);
  }

  function handleGuardar() {
    guardarThresholds(cliente, thresholds);
    setGuardado(true);
    onGuardado(thresholds);
  }

  function handleRestaurar() {
    onChange(SLA_THRESHOLDS_DEFAULT);
    setGuardado(false);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-700"
      >
        <span>Umbrales de SLA (horas) para {cliente}</span>
        <span className="text-slate-400">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Incidentes</p>
            <CampoUmbral label="Alta" valor={thresholds.incidente.alta} onChange={(v) => actualizar("incidente", "alta", v)} />
            <CampoUmbral label="Media" valor={thresholds.incidente.media} onChange={(v) => actualizar("incidente", "media", v)} />
            <CampoUmbral label="Baja" valor={thresholds.incidente.baja} onChange={(v) => actualizar("incidente", "baja", v)} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Requerimientos</p>
            <CampoUmbral
              label="Alta"
              valor={thresholds.requerimiento.alta}
              onChange={(v) => actualizar("requerimiento", "alta", v)}
            />
            <CampoUmbral
              label="Media"
              valor={thresholds.requerimiento.media}
              onChange={(v) => actualizar("requerimiento", "media", v)}
            />
            <CampoUmbral
              label="Baja"
              valor={thresholds.requerimiento.baja}
              onChange={(v) => actualizar("requerimiento", "baja", v)}
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              onClick={handleGuardar}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
            >
              Guardar para este cliente
            </button>
            <button onClick={handleRestaurar} className="text-xs text-slate-500 underline hover:text-slate-700">
              Restaurar valores por defecto
            </button>
            {guardado && <span className="text-xs text-green-600">Guardado ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function BulletList({ items }: { items: Bullet[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((b, i) => (
        <li key={i} className="text-sm leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">{b.titulo}:</span> {b.detalle}
        </li>
      ))}
    </ul>
  );
}

function SlaPie({ cumplidos, incumplidos }: { cumplidos: number; incumplidos: number }) {
  const data = [
    { name: "Cumplidos", value: cumplidos },
    { name: "Incumplidos", value: incumplidos },
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          <Cell fill="#16a34a" />
          <Cell fill="#dc2626" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function Home() {
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("");
  const [fuenteArchivo, setFuenteArchivo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [descargando, setDescargando] = useState(false);
  const [thresholds, setThresholds] = useState<SlaThresholds>(SLA_THRESHOLDS_DEFAULT);
  const [narrativaIA, setNarrativaIA] = useState<Narrativa | null>(null);
  const [estadoIA, setEstadoIA] = useState<"idle" | "cargando" | "listo" | "error">("idle");
  const [errorIA, setErrorIA] = useState<string>("");
  const [cacheIA, setCacheIA] = useState<Record<string, Narrativa>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function claveCacheIA(cliente: string, t: SlaThresholds): string {
    return `${cliente}::${JSON.stringify(t)}`;
  }

  function handleClienteChange(cliente: string) {
    setClienteSeleccionado(cliente);
    setThresholds(obtenerThresholds(cliente));
  }

  const report: ReportData | null = useMemo(() => {
    if (!clienteSeleccionado || rows.length === 0) return null;
    return computeReport(rows, clienteSeleccionado, thresholds);
  }, [rows, clienteSeleccionado, thresholds]);

  const reportFinal: ReportData | null = useMemo(() => {
    if (!report) return null;
    return narrativaIA ? { ...report, narrativa: narrativaIA } : report;
  }, [report, narrativaIA]);

  function ticketsDelCliente(cliente: string): TicketResumen[] {
    return rows
      .filter((r) => r.cliente === cliente)
      .map((r) => ({ producto: r.producto, tipo: r.tipo, estado: r.estado, asunto: r.asunto }));
  }

  async function analizarConIA(base: ReportData, tickets: TicketResumen[], clave: string) {
    setNarrativaIA(null);
    setEstadoIA("cargando");
    setErrorIA("");
    try {
      const res = await fetch("/api/reporte/analisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: base.cliente,
          periodo: base.periodo,
          totalTickets: base.totalTickets,
          porTipo: base.porTipo,
          porProducto: base.porProducto,
          porEstado: base.porEstado,
          slaIncidentes: base.slaIncidentes,
          slaSolicitudes: base.slaSolicitudes,
          tickets,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo generar el análisis con IA.");
      }
      const narrativa: Narrativa = await res.json();
      setNarrativaIA(narrativa);
      setEstadoIA("listo");
      setCacheIA((prev) => ({ ...prev, [clave]: narrativa }));
    } catch (e) {
      setErrorIA(e instanceof Error ? e.message : "No se pudo generar el análisis con IA.");
      setEstadoIA("error");
    }
  }

  // Al cargar datos o cambiar de cliente: si ya se redacto antes para este cliente y estos
  // umbrales en esta sesion, se reutiliza de la cache; si no, se redacta con IA automaticamente.
  useEffect(() => {
    if (!clienteSeleccionado || rows.length === 0) return;
    const thresholdsCliente = obtenerThresholds(clienteSeleccionado);
    const clave = claveCacheIA(clienteSeleccionado, thresholdsCliente);
    const enCache = cacheIA[clave];
    if (enCache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reutiliza el analisis ya generado, sin llamar de nuevo a la IA
      setNarrativaIA(enCache);
      setEstadoIA("listo");
      setErrorIA("");
      return;
    }
    const base = computeReport(rows, clienteSeleccionado, thresholdsCliente);
    analizarConIA(base, ticketsDelCliente(clienteSeleccionado), clave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteSeleccionado, rows, cacheIA]);

  function cargarCsv(texto: string, nombreArchivo: string) {
    const parsed = Papa.parse<Record<string, string>>(texto, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length > 0) {
      setError("No se pudo leer el CSV. Verifica que tenga las columnas esperadas.");
      return;
    }
    const normalizadas = normalizeRows(parsed.data);
    if (normalizadas.length === 0) {
      setError("El CSV no contiene filas válidas.");
      return;
    }
    const listaClientes = getClientes(normalizadas);
    setRows(normalizadas);
    setClientes(listaClientes);
    setCacheIA({});
    handleClienteChange(listaClientes[0] ?? "");
    setFuenteArchivo(nombreArchivo);
    setError("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const texto = await file.text();
    cargarCsv(texto, file.name);
  }

  async function handleUsarEjemplo() {
    setError("");
    const res = await fetch("/api/datos-ejemplo");
    const texto = await res.text();
    cargarCsv(texto, "halo-itsm-ejemplo.csv (dato de ejemplo)");
  }

  async function handleDescargarWord() {
    if (!reportFinal) return;
    setDescargando(true);
    try {
      const res = await fetch("/api/reporte/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportFinal),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-soc-${reportFinal.cliente.replace(/\s+/g, "-").toLowerCase()}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Reporte Mensual SOC</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sube el CSV exportado de Halo ITSM, elige un cliente y genera el reporte con gráficos, análisis y el Word
            final listo para revisión.
          </p>
        </header>

        <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Subir CSV de Halo ITSM
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <button
              onClick={handleUsarEjemplo}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Usar dato de ejemplo
            </button>

            {clientes.length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm text-slate-600">Cliente:</label>
                <select
                  value={clienteSeleccionado}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {clientes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {fuenteArchivo && <p className="mt-3 text-xs text-slate-500">Archivo cargado: {fuenteArchivo}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        {!report && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Sube un CSV o usa el dato de ejemplo para generar el reporte.
          </div>
        )}

        {reportFinal && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{reportFinal.cliente}</h2>
                <p className="text-sm text-slate-500">
                  Periodo: {reportFinal.periodo.desde} a {reportFinal.periodo.hasta} · {reportFinal.totalTickets} tickets
                </p>
              </div>
              <button
                onClick={handleDescargarWord}
                disabled={descargando}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {descargando ? "Generando Word..." : "Descargar reporte Word"}
              </button>
            </div>

            {estadoIA === "cargando" && (
              <p className="flex items-center gap-2 text-sm text-blue-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                Analizando con IA...
              </p>
            )}
            {estadoIA === "listo" && <p className="text-sm text-green-600">Análisis finalizado ✓</p>}
            {estadoIA === "error" && (
              <p className="text-sm text-red-600">{errorIA} (se muestra el texto por reglas mientras tanto)</p>
            )}

            <ConfiguracionSla
              cliente={reportFinal.cliente}
              thresholds={thresholds}
              onChange={setThresholds}
              onGuardado={(t) =>
                analizarConIA(
                  computeReport(rows, clienteSeleccionado, t),
                  ticketsDelCliente(clienteSeleccionado),
                  claveCacheIA(clienteSeleccionado, t)
                )
              }
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total tickets" value={reportFinal.totalTickets} />
              <StatCard label="SLA Incidentes" value={`${reportFinal.slaIncidentes.porcentaje}%`} />
              <StatCard label="SLA Solicitudes" value={`${reportFinal.slaSolicitudes.porcentaje}%`} />
              <StatCard
                label="Pendientes"
                value={
                  (reportFinal.porEstado.find((e) => e.label === "Abierto")?.total ?? 0) +
                  (reportFinal.porEstado.find((e) => e.label === "En espera")?.total ?? 0) +
                  (reportFinal.porEstado.find((e) => e.label === "Con el usuario")?.total ?? 0)
                }
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Introducción</h3>
              <p className="text-sm leading-relaxed text-slate-700">{reportFinal.narrativa.introduccion}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Historial de tickets">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportFinal.historial}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Tipos de tickets">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportFinal.porTipo} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="label" width={140} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Tickets por herramienta o producto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportFinal.porProducto} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="label" width={140} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Estado de los tickets">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportFinal.porEstado} dataKey="total" nameKey="label" outerRadius={80} label>
                      {reportFinal.porEstado.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="SLA — Incidentes">
                <SlaPie cumplidos={reportFinal.slaIncidentes.cumplidos} incumplidos={reportFinal.slaIncidentes.incumplidos} />
              </ChartCard>

              <ChartCard title="SLA — Solicitudes">
                <SlaPie
                  cumplidos={reportFinal.slaSolicitudes.cumplidos}
                  incumplidos={reportFinal.slaSolicitudes.incumplidos}
                />
              </ChartCard>
            </div>

            {reportFinal.narrativa.tiposDetalle.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">Tipos de tickets — detalle por herramienta</h3>
                <div className="space-y-4">
                  {reportFinal.narrativa.tiposDetalle.map((g) => (
                    <div key={g.grupo}>
                      <p className="text-sm font-semibold text-slate-800">{g.grupo}</p>
                      <BulletList items={g.puntos} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportFinal.pendientes.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Tickets pendientes de cierre ({reportFinal.pendientes.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="pb-2 pr-4 font-medium">ID</th>
                        <th className="pb-2 pr-4 font-medium">Estado</th>
                        <th className="pb-2 font-medium">Asunto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportFinal.pendientes.map((p) => (
                        <tr key={p.ticketId} className="border-t border-slate-100">
                          <td className="py-1.5 pr-4 text-slate-700">{p.ticketId}</td>
                          <td className="py-1.5 pr-4 text-slate-700">{p.estado}</td>
                          <td className="py-1.5 text-slate-700">{p.asunto}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Análisis de resultados</h3>
              <BulletList items={reportFinal.narrativa.analisis} />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Recomendaciones</h3>
              <BulletList items={reportFinal.narrativa.recomendacion} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
