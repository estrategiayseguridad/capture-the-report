"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ui } from "@/lib/format";
import type { Department, PublicUser } from "@/lib/types";
import type { Role } from "@/lib/status";

export default function UsersPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Demo123!",
    role: "Employee" as Role,
    employeeNumber: "",
    departmentId: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [userData, deptData] = await Promise.all([
      api<{ users: PublicUser[] }>("/api/users"),
      api<{ departments: Department[] }>("/api/departments"),
    ]);
    setUsers(userData.users);
    setDepartments(deptData.departments);
    if (!form.departmentId && deptData.departments[0]) {
      setForm((current) => ({ ...current, departmentId: deptData.departments[0].id }));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    await api("/api/users", { method: "POST", body: JSON.stringify(form) });
    setMessage("Usuario creado");
    await load();
  }

  async function toggle(user: PublicUser) {
    await api(`/api/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !user.active }),
    });
    await load();
  }

  const filtered = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="text-3xl font-semibold">Usuarios</h1>
      {message ? <p className="mt-2 text-sm text-teal-800">{message}</p> : null}
      <input className={`${ui.input} mt-4 max-w-sm`} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
      <form onSubmit={(e) => void create(e)} className={`${ui.card} mt-4 grid gap-3 md:grid-cols-3`}>
        <input className={ui.input} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={ui.input} placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={ui.input} placeholder="No. empleado" value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} />
        <select className={ui.input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
          <option>Employee</option>
          <option>Manager</option>
          <option>Admin</option>
          <option>SuperAdmin</option>
        </select>
        <select className={ui.input} value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
          {departments.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <button className={ui.btnPrimary} type="submit">Crear</button>
      </form>
      <ul className="mt-6 divide-y rounded-2xl bg-white shadow-sm">
        {filtered.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email} · {user.role} · {user.employeeNumber}</p>
            </div>
            <button className={ui.btnSecondary} type="button" onClick={() => void toggle(user)}>
              {user.active ? "Desactivar" : "Activar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
