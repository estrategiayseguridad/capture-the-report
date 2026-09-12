"use client";

import { useEffect, useState } from "react";
import { ChartBars } from "@/components/ChartBars";
import { api } from "@/lib/client-api";
import { money, ui } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState({ month: "", employeeId: "", departmentId: "", clientId: "" });
  const [catalogs, setCatalogs] = useState<{
    users: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    clients: { id: string; name: string }[];
  } | null>(null);

  async function load(next = filters) {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const dash = await api<DashboardData>(`/api/dashboard?${params.toString()}`);
    setData(dash);
  }

  useEffect(() => {
    void Promise.all([
      load(),
      api<{ users: { id: string; name: string }[] }>("/api/users"),
      api<{ departments: { id: string; name: string }[] }>("/api/departments"),
      api<{ clients: { id: string; name: string }[] }>("/api/clients"),
    ]).then(([, users, departments, clients]) => {
      setCatalogs({
        users: users.users,
        departments: departments.departments,
        clients: clients.clients,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <p>Cargando dashboard…</p>;

  const kpis = [
    ["Gasto total", money(data.totalExpenditure)],
    ["Mes actual", money(data.currentMonthExpenditure)],
    ["Mes anterior", money(data.previousMonthExpenditure)],
    ["Aprobados", String(data.approved)],
    ["Pendiente auth.", String(data.pendingAuthorization)],
    ["Reembolso pendiente", money(data.outstandingReimbursement)],
    ["SAT conciliados", String(data.matchedBillingDocuments)],
    ["SAT sin match", String(data.unmatchedBillingDocuments)],
    ["Revisión", String(data.needsReview)],
    ["Empleados activos", String(data.activeEmployees)],
    ["Clientes activos", String(data.activeClients)],
    ["Proyectos activos", String(data.activeProjects)],
  ];

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-teal-800">Ejecutivo</p>
      <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <select className={ui.input} value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
          <option value="">Todos los meses</option>
          {data.monthlyTrend.map((item) => (
            <option key={item.month} value={item.month}>
              {item.month}
            </option>
          ))}
        </select>
        <select className={ui.input} value={filters.employeeId} onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}>
          <option value="">Todos los empleados</option>
          {catalogs?.users.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select className={ui.input} value={filters.departmentId} onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}>
          <option value="">Todos los departamentos</option>
          {catalogs?.departments.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <button type="button" className={ui.btnSecondary} onClick={() => void load()}>
          Aplicar filtros
        </button>
      </div>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value]) => (
          <article key={label} className={ui.card}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Por departamento</h2>
          <ChartBars items={data.byDepartment} />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Por cliente</h2>
          <ChartBars items={data.byClient} />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Por proyecto</h2>
          <ChartBars items={data.byProject} />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Por empleado</h2>
          <ChartBars items={data.byEmployee} />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Tendencia mensual</h2>
          <ChartBars items={data.monthlyTrend.map((item) => ({ name: item.month, total: item.total }))} />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">SAT conciliado vs no</h2>
          <ChartBars
            items={[
              { name: "Conciliado", total: data.billingMatchSplit.matched },
              { name: "Sin coincidencia", total: data.billingMatchSplit.unmatched },
              { name: "Revisión", total: data.billingMatchSplit.needsReview },
            ]}
          />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Pendiente de reembolso</h2>
          <ChartBars items={data.outstandingByEmployee} />
        </article>
        <article className={ui.card}>
          <h2 className="mb-4 font-semibold">Top proyectos</h2>
          <ChartBars items={data.topProjects} />
        </article>
      </section>
    </div>
  );
}
