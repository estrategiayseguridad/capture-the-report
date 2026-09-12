"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/client-api";
import { ui } from "@/lib/format";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("employee@example.local");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ user: { role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const next = params.get("next");
      if (next) router.replace(next);
      else router.replace(data.user.role === "Employee" ? "/home" : "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
      <p className="text-sm uppercase tracking-[0.25em] text-teal-800">ES Consulting</p>
      <h1 className="mt-2 text-4xl font-semibold">Rinde</h1>
      <p className="mt-3 text-slate-600">
        Captura la factura, confirma el DTE y deja que administración autorice, concilie y
        reembolse.
      </p>
      <form onSubmit={(event) => void onSubmit(event)} className={`${ui.card} mt-8`}>
        <label className={ui.label}>
          Correo
            <input
                className={ui.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                suppressHydrationWarning
              />
        </label>
        <label className={`${ui.label} mt-4 block`}>
          Contraseña
            <input
                className={ui.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                suppressHydrationWarning
              />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <button className={`${ui.btnPrimary} mt-5 w-full`} disabled={loading} type="submit">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <section className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Cuentas demo (contraseña Demo123!)</p>
        <ul className="mt-2 space-y-1">
          <li>employee@example.local — Empleado</li>
          <li>manager@example.local — Gerente</li>
          <li>admin@example.local — Admin</li>
          <li>superadmin@example.local — Super Admin</li>
        </ul>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
