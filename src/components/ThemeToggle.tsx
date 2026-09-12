"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "dark");
  document.documentElement.style.colorScheme = tema;
}

export default function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    // El script inline en layout.tsx ya aplicó la clase antes del primer render; solo sincronizamos el estado del switch con ese DOM externo.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de estado externo (DOM) al montar, no un fetch encadenado
    setTema(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function alternar() {
    const nuevo: Tema = tema === "dark" ? "light" : "dark";
    setTema(nuevo);
    aplicarTema(nuevo);
    try {
      window.localStorage.setItem("tema", nuevo);
    } catch {
      // localStorage no disponible (modo privado, etc.) — el tema sigue funcionando solo para esta carga
    }
  }

  return (
    <button
      onClick={alternar}
      aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="fixed right-4 top-4 z-50 flex h-9 w-16 items-center rounded-full border border-slate-300 bg-white px-1 shadow-sm transition-colors dark:border-slate-600 dark:bg-slate-800"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm shadow transition-transform ${
          tema === "dark" ? "translate-x-7 bg-slate-100 text-slate-900" : "translate-x-0 bg-slate-900 text-white"
        }`}
      >
        {tema === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
