"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { PublicUser } from "@/lib/types";

const items = [
  { href: "/home", label: "Inicio" },
  { href: "/scan", label: "Escanear" },
  { href: "/expenses", label: "Gastos" },
];

export function EmployeeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    void api<{ user: PublicUser }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/login"));
  }, [router]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-lg font-semibold tracking-tight">Rinde</p>
          <p className="text-xs text-slate-500">{user?.name ?? "…"}</p>
        </div>
        <div className="flex items-center gap-2">
          {user && user.role !== "Employee" ? (
            <Link href="/admin" className="text-xs font-medium text-teal-800">
              Admin
            </Link>
          ) : null}
          <button type="button" onClick={() => void logout()} className="text-xs text-slate-500">
            Salir
          </button>
        </div>
      </header>
      <div className="flex-1 px-5 pb-28">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="grid grid-cols-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-4 text-center text-sm font-medium ${active ? "text-teal-800" : "text-slate-500"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
