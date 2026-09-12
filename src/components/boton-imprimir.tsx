"use client";

/**
 * Abre el diálogo de impresión del navegador. Desde ahí se imprime o se
 * guarda como PDF: no generamos el PDF en el backend (no hay tiempo y no
 * hace falta para la demo).
 *
 * Vive en dos superficies distintas — la hoja blanca de la ficha y el CV, y el
 * tema oscuro del reporte del área —, así que cambia de color con `claro`: el
 * azul de marca sobre papel, el cyan de marca sobre oscuro. Un solo color no
 * alcanza los 3:1 contra las dos superficies.
 */
export function BotonImprimir({ claro = false }: { claro?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${
        claro
          ? "bg-azul text-papel hover:bg-acento-fuerte"
          : "bg-acento text-fondo hover:bg-acento-claro"
      }`}
    >
      Imprimir / guardar PDF
    </button>
  );
}
