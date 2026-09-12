"use client";

import { useMemo, useState } from "react";
import { COLOR_PERFIL, COLOR_PRIORIDAD, Card } from "./ui";
import { ESTATUS_LEAD } from "@/lib/types";
import type { EstatusLead, Lead } from "@/lib/types";

/** Los estatus son etapas ordenadas del embudo, no severidades. */
const COLOR_ESTATUS: Record<EstatusLead, string> = {
  Pendiente: "var(--status-warning)",
  Contactado: "var(--prioridad-alta)",
  "Reunion agendada": "var(--prioridad-media)",
  Oportunidad: "var(--status-good)",
  Descartado: "var(--text-muted)",
};

const ICONO_ESTATUS: Record<EstatusLead, string> = {
  Pendiente: "○",
  Contactado: "◔",
  "Reunion agendada": "◑",
  Oportunidad: "●",
  Descartado: "×",
};

export default function TablaLeads({
  leads,
  onCambiarEstatus,
}: {
  leads: Lead[];
  onCambiarEstatus: (idLead: string, estatus: EstatusLead) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCam, setFiltroCam] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
  const [filtroEstatus, setFiltroEstatus] = useState("todos");

  const cams = useMemo(
    () => [...new Set(leads.map((l) => l.camNombre).filter((n): n is string => n !== null))],
    [leads],
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return leads
      .filter((l) => {
        if (filtroCam !== "todos" && l.camNombre !== filtroCam) return false;
        if (filtroPrioridad !== "todas" && l.prioridad !== filtroPrioridad) return false;
        if (filtroEstatus !== "todos" && l.estatus !== filtroEstatus) return false;
        if (q && !`${l.nombre} ${l.empresa} ${l.cargo} ${l.industria}`.toLowerCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [leads, busqueda, filtroCam, filtroPrioridad, filtroEstatus]);

  return (
    <Card
      titulo="Leads generados"
      subtitulo={`${visibles.length} de ${leads.length} leads · el estatus se guarda en este navegador`}
    >
      {/* Filtros en una sola fila, arriba de la tabla */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, empresa o cargo"
          className="entrada w-full max-w-xs flex-1"
        />
        <select
          value={filtroCam}
          onChange={(e) => setFiltroCam(e.target.value)}
          className="entrada w-auto"
          aria-label="Filtrar por ejecutivo"
        >
          <option value="todos">Todos los ejecutivos</option>
          {cams.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="entrada w-auto"
          aria-label="Filtrar por prioridad"
        >
          <option value="todas">Toda prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
        <select
          value={filtroEstatus}
          onChange={(e) => setFiltroEstatus(e.target.value)}
          className="entrada w-auto"
          aria-label="Filtrar por estatus"
        >
          <option value="todos">Todo estatus</option>
          {ESTATUS_LEAD.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-ink-muted">
              <th scope="col" className="py-2 pr-3 font-medium">
                Asistente
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Empresa / Industria
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Perfil
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">
                Score
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Ejecutivo asignado
              </th>
              <th scope="col" className="py-2 font-medium">
                Estatus
              </th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <tr key={l.id} className="border-b border-hairline/60 last:border-0">
                <td className="py-2.5 pr-3">
                  <p className="font-medium text-ink">{l.nombre}</p>
                  <p className="text-xs text-ink-muted">{l.cargo}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <p className="text-ink-soft">{l.empresa}</p>
                  <p className="text-xs text-ink-muted">{l.industria}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                    <span
                      aria-hidden
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{ background: COLOR_PERFIL[l.perfil] }}
                    />
                    {l.perfil}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-right">
                  <span className="tabular font-medium text-ink">{l.score}</span>
                  <span
                    className="ml-2 inline-flex items-center gap-1 text-xs text-ink-muted"
                    title={`Prioridad ${l.prioridad}`}
                  >
                    <span
                      aria-hidden
                      className="inline-block size-2 rounded-full"
                      style={{ background: COLOR_PRIORIDAD[l.prioridad] }}
                    />
                    {l.prioridad}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <p className="text-ink-soft">{l.camNombre ?? "Sin asignar"}</p>
                  <p className="text-xs text-ink-muted">{l.motivoAsignacion}</p>
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span aria-hidden style={{ color: COLOR_ESTATUS[l.estatus] }}>
                      {ICONO_ESTATUS[l.estatus]}
                    </span>
                    <select
                      value={l.estatus}
                      onChange={(e) => onCambiarEstatus(l.id, e.target.value as EstatusLead)}
                      className="entrada w-auto py-1 text-xs"
                      aria-label={`Estatus de ${l.nombre}`}
                    >
                      {ESTATUS_LEAD.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibles.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-muted">
            Ningun lead coincide con los filtros aplicados.
          </p>
        )}
      </div>
    </Card>
  );
}
