"use client";

import { useEffect, useState } from "react";
import { api, apiBlob } from "@/lib/client-api";
import { ui } from "@/lib/format";
import type { PublicUser } from "@/lib/types";

export default function ExportsPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void api<{ users: PublicUser[] }>("/api/users").then((data) => {
      const employees = data.users.filter((user) => user.role === "Employee" || user.role === "Manager");
      setUsers(employees);
      setSelected(employees.map((user) => user.id));
    });
  }, []);

  async function download(format: "xlsx" | "zip") {
    setMessage(null);
    const blob = await apiBlob("/api/reports/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: selected, format }),
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = format === "zip" || selected.length > 1 ? "rinde-reportes.zip" : "rinde-empleado.xlsx";
    a.click();
    setMessage("Archivo generado");
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Exportar XLSX</h1>
      <p className="mt-2 text-slate-600">Un archivo por empleado, o un ZIP con todos los seleccionados.</p>
      {message ? <p className="mt-3 text-sm text-teal-800">{message}</p> : null}
      <ul className="mt-6 space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        {users.map((user) => (
          <li key={user.id}>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(user.id)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked ? [...selected, user.id] : selected.filter((id) => id !== user.id),
                  )
                }
              />
              {user.name} · {user.employeeNumber}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-3">
        <button className={ui.btnPrimary} type="button" onClick={() => void download("xlsx")}>
          Exportar seleccionado
        </button>
        <button className={ui.btnSecondary} type="button" onClick={() => void download("zip")}>
          ZIP masivo
        </button>
      </div>
    </div>
  );
}
