import "server-only";
import sharp from "sharp";
import type { CountItem } from "./report";

export const COLORES = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

const ANCHO = 900;
const ALTO = 480;

async function svgAPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function escaparXml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Gráfica de barras horizontales con la etiqueta del valor al final de cada barra (fija, para Word). */
export async function barrasHorizontales(items: CountItem[], color = COLORES[0]): Promise<Buffer> {
  const datos = items.slice(0, 12);
  const margenIzq = 260;
  const margenDer = 60;
  const margenSup = 20;
  const margenInf = 20;
  const altoBarra = 28;
  const espacio = 14;
  const alto = margenSup + margenInf + datos.length * (altoBarra + espacio);
  const anchoDisponible = ANCHO - margenIzq - margenDer;
  const max = Math.max(1, ...datos.map((d) => d.total));

  const filas = datos
    .map((d, i) => {
      const y = margenSup + i * (altoBarra + espacio);
      const w = Math.max(2, (d.total / max) * anchoDisponible);
      const etiqueta = d.label.length > 32 ? d.label.slice(0, 31) + "…" : d.label;
      return `
        <text x="${margenIzq - 12}" y="${y + altoBarra / 2 + 5}" text-anchor="end" font-size="16" fill="#334155" font-family="Arial, sans-serif">${escaparXml(etiqueta)}</text>
        <rect x="${margenIzq}" y="${y}" width="${w}" height="${altoBarra}" rx="4" fill="${color}" />
        <text x="${margenIzq + w + 10}" y="${y + altoBarra / 2 + 5}" font-size="16" fill="#0f172a" font-family="Arial, sans-serif" font-weight="bold">${d.total}</text>
      `;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${alto}" viewBox="0 0 ${ANCHO} ${alto}">
    <rect width="${ANCHO}" height="${alto}" fill="#ffffff" />
    ${filas}
  </svg>`;

  return svgAPng(svg);
}

/** Gráfica de líneas simple (historial mensual) con etiqueta de valor sobre cada punto. */
export async function lineaConEtiquetas(items: CountItem[], color = COLORES[0]): Promise<Buffer> {
  const datos = items.length > 0 ? items : [{ label: "Sin datos", total: 0 }];
  const margen = { top: 40, right: 40, bottom: 50, left: 60 };
  const anchoPlot = ANCHO - margen.left - margen.right;
  const altoPlot = ALTO - margen.top - margen.bottom;
  const max = Math.max(1, ...datos.map((d) => d.total));
  const paso = datos.length > 1 ? anchoPlot / (datos.length - 1) : 0;

  const puntos = datos.map((d, i) => {
    const x = margen.left + i * paso;
    const y = margen.top + altoPlot - (d.total / max) * altoPlot;
    return { x, y, d };
  });

  const linea = puntos.map((p) => `${p.x},${p.y}`).join(" ");

  const marcas = puntos
    .map(
      (p) => `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="${color}" />
        <text x="${p.x}" y="${p.y - 14}" text-anchor="middle" font-size="15" font-weight="bold" fill="#0f172a" font-family="Arial, sans-serif">${p.d.total}</text>
        <text x="${p.x}" y="${ALTO - margen.bottom + 24}" text-anchor="middle" font-size="13" fill="#334155" font-family="Arial, sans-serif">${escaparXml(p.d.label)}</text>
      `
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
    <rect width="${ANCHO}" height="${ALTO}" fill="#ffffff" />
    <line x1="${margen.left}" y1="${margen.top + altoPlot}" x2="${ANCHO - margen.right}" y2="${margen.top + altoPlot}" stroke="#cbd5e1" stroke-width="1" />
    <polyline points="${linea}" fill="none" stroke="${color}" stroke-width="3" />
    ${marcas}
  </svg>`;

  return svgAPng(svg);
}

/** Gráfica de pastel con la etiqueta (nombre + cantidad) junto a cada porción. */
export async function pastelConEtiquetas(items: CountItem[]): Promise<Buffer> {
  const datos = items.filter((d) => d.total > 0);
  const total = datos.reduce((s, d) => s + d.total, 0) || 1;
  const cx = 230;
  const cy = ALTO / 2;
  const r = 160;

  let anguloActual = -Math.PI / 2;
  const porciones: string[] = [];
  const leyenda: string[] = [];

  datos.forEach((d, i) => {
    const color = COLORES[i % COLORES.length];
    const angulo = (d.total / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(anguloActual);
    const y1 = cy + r * Math.sin(anguloActual);
    const anguloFin = anguloActual + angulo;
    const x2 = cx + r * Math.cos(anguloFin);
    const y2 = cy + r * Math.sin(anguloFin);
    const largo = angulo > Math.PI ? 1 : 0;
    porciones.push(`<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largo} 1 ${x2},${y2} Z" fill="${color}" />`);
    anguloActual = anguloFin;

    const porcentaje = Math.round((d.total / total) * 100);
    const ly = 40 + i * 32;
    leyenda.push(`
      <rect x="500" y="${ly - 16}" width="18" height="18" fill="${color}" />
      <text x="526" y="${ly}" font-size="16" fill="#0f172a" font-family="Arial, sans-serif">${escaparXml(d.label)}: ${d.total} (${porcentaje}%)</text>
    `);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
    <rect width="${ANCHO}" height="${ALTO}" fill="#ffffff" />
    ${porciones.join("")}
    ${leyenda.join("")}
  </svg>`;

  return svgAPng(svg);
}
