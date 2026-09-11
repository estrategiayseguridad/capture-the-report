"use client";

const CLAVE = "reportero-csc-tema";

/**
 * Interruptor de tema. Arranca en claro siempre; si el analista elige oscuro se
 * recuerda en `localStorage`. No se lee `prefers-color-scheme` a proposito: el
 * tema no debe cambiar solo segun la maquina donde se presente.
 *
 * Sin estado de React: la clase `oscuro` del <html> ya es la unica fuente de
 * verdad, y las dos etiquetas del boton se muestran u ocultan por CSS. Asi no hay
 * que sincronizar nada tras la hidratacion.
 */
export function BotonDeTema() {
  function alternar() {
    const oscuro = document.documentElement.classList.toggle("oscuro");
    try {
      localStorage.setItem(CLAVE, oscuro ? "oscuro" : "claro");
    } catch {
      // Modo privado o storage bloqueado: el tema igual funciona en esta sesion.
    }
  }

  return (
    <button
      onClick={alternar}
      aria-label="Cambiar entre tema claro y oscuro"
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <span className="dark:hidden">☾ Oscuro</span>
      <span className="hidden dark:inline">☀ Claro</span>
    </button>
  );
}

/** Aplica el tema guardado antes del primer pintado, para que no haya destello. */
export const scriptDeTema = `
try {
  if (localStorage.getItem("${CLAVE}") === "oscuro") {
    document.documentElement.classList.add("oscuro");
  }
} catch (e) {}
`;
