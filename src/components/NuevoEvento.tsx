"use client";

import { useMemo } from "react";
import type { EventoConfig, Franja } from "@/lib/types";

const FRANJAS: { valor: Franja; etiqueta: string }[] = [
  { valor: "matutino", etiqueta: "Matutino (7:00 - 13:00)" },
  { valor: "vespertino", etiqueta: "Vespertino (13:00 - 17:00)" },
  { valor: "nocturno", etiqueta: "Nocturno (18:00 en adelante)" },
  { valor: "jornada", etiqueta: "Jornada completa (8:00 - 18:00)" },
];

export default function NuevoEvento({
  csv,
  nombreArchivo,
  evento,
  cargando,
  onCsv,
  onArchivo,
  onEvento,
  onCargarDemo,
  onProcesar,
}: {
  csv: string;
  nombreArchivo: string;
  evento: EventoConfig;
  cargando: boolean;
  onCsv: (texto: string) => void;
  onArchivo: (archivo: File) => void;
  onEvento: (evento: EventoConfig) => void;
  onCargarDemo: () => void;
  onProcesar: () => void;
}) {
  const registros = useMemo(
    () => Math.max(0, csv.split("\n").filter((l) => l.trim() !== "").length - 1),
    [csv],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Paso 1: el archivo */}
      <section className="rounded-xl border border-hairline bg-surface-1 p-6 lg:col-span-3">
        <h3 className="text-sm font-semibold text-ink">1. Listado de asistentes</h3>
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
                if (archivo) onArchivo(archivo);
              }}
            />
          </label>
          <button
            type="button"
            onClick={onCargarDemo}
            disabled={cargando}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--perfil-decisor)" }}
          >
            Cargar datos de demo
          </button>
          {nombreArchivo && (
            <span className="text-xs text-ink-soft">
              <span className="font-mono">{nombreArchivo}</span> · {registros} registros
            </span>
          )}
        </div>

        <textarea
          value={csv}
          onChange={(e) => onCsv(e.target.value)}
          spellCheck={false}
          placeholder={"nombre,email,empresa,cargo,industria,canal_registro,check_in,interes\nAna Herrera,ana@empresa.com,Banco Demo,CISO,Banca,Invitacion directa,Si,SOC gestionado"}
          className="mt-4 h-56 w-full resize-y rounded-lg border border-hairline bg-plane p-3 font-mono text-xs text-ink-soft outline-none focus:border-white/25"
        />
      </section>

      {/* Paso 2: el contexto del evento */}
      <section className="rounded-xl border border-hairline bg-surface-1 p-6 lg:col-span-2">
        <h3 className="text-sm font-semibold text-ink">2. Datos del evento</h3>
        <p className="mt-1 text-xs text-ink-muted">
          La franja horaria y los invitados alimentan la proyeccion de asistencia; el monto, el
          costo por lead.
        </p>

        <div className="mt-4 space-y-3">
          <Campo etiqueta="Nombre del evento">
            <input
              value={evento.nombre}
              onChange={(e) => onEvento({ ...evento, nombre: e.target.value })}
              placeholder="La Nueva Era de la Defensa Digital"
              className="entrada w-full"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Fecha">
              <input
                type="date"
                value={evento.fecha}
                onChange={(e) => onEvento({ ...evento, fecha: e.target.value })}
                className="entrada w-full"
              />
            </Campo>
            <Campo etiqueta="Tipo">
              <select
                value={evento.tipo}
                onChange={(e) =>
                  onEvento({ ...evento, tipo: e.target.value as EventoConfig["tipo"] })
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
              onChange={(e) => onEvento({ ...evento, lugar: e.target.value })}
              placeholder="Lugar 3 - Corporativo / Formal"
              className="entrada w-full"
            />
          </Campo>

          <Campo etiqueta="Franja horaria">
            <select
              value={evento.franja}
              onChange={(e) => onEvento({ ...evento, franja: e.target.value as Franja })}
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
                onChange={(e) => onEvento({ ...evento, invitados: Number(e.target.value) })}
                className="entrada tabular w-full"
              />
            </Campo>
            <Campo etiqueta="Inversion (Q)">
              <input
                type="number"
                min={0}
                value={evento.montoQ || ""}
                onChange={(e) => onEvento({ ...evento, montoQ: Number(e.target.value) })}
                className="entrada tabular w-full"
              />
            </Campo>
          </div>
        </div>

        <button
          type="button"
          onClick={onProcesar}
          disabled={cargando || !csv.trim()}
          className="mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--perfil-decisor)" }}
        >
          {cargando ? "Procesando..." : "Procesar y generar informe"}
        </button>
      </section>
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
