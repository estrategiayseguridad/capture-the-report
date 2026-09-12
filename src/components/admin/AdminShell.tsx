"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { PublicUser } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/expenses", label: "Gastos" },
  { href: "/admin/receipts", label: "Recibos" },
  { href: "/admin/authorizations", label: "Autorizaciones" },
  { href: "/admin/billing", label: "Facturación SAT" },
  { href: "/admin/matching", label: "Conciliación" },
  { href: "/admin/reimbursements", label: "Reembolsos" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/departments", label: "Departamentos" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/projects", label: "Proyectos" },
  { href: "/admin/reports", label: "Reportes" },
  { href: "/admin/exports", label: "Exportar" },
  { href: "/admin/audit", label: "Auditoría" },
  { href: "/admin/settings", label: "Ajustes" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void api<{ user: PublicUser }>("/api/auth/me")
      .then((data) => {
        if (data.user.role === "Employee") {
          router.replace("/home");
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
      <aside
        className={`print:hidden z-30 bg-[#07111f] text-slate-200 lg:sticky lg:top-0 lg:h-screen lg:block ${open ? "fixed inset-0" : "hidden"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/admin" className="text-xl font-semibold text-white">
              Rinde
            </Link>
            <button type="button" className="lg:hidden" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
            {NAV.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm ${active ? "bg-teal-500/15 text-teal-300" : "hover:bg-white/5"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 px-5 py-4 text-xs">
            <p className="text-white">{user?.name}</p>
            <p className="text-slate-400">{user?.role}</p>
            <div className="mt-3 flex gap-3">
              <Link href="/home" className="text-teal-300">
                Vista empleado
              </Link>
              <button type="button" onClick={() => void logout()}>
                Salir
              </button>
            </div>
          </div>
        </div>
      </aside>
      <div>
        <header className="print:hidden flex items-center justify-between border-b border-slate-200 bg-white/70 px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium">
            Menú
          </button>
          <span className="font-semibold">Rinde</span>
          <span className="text-xs text-slate-500">{user?.name}</span>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
