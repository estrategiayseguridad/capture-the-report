/**
 * Sanitiza texto libre (el "asunto" de los tickets) antes de mandarlo a un servicio de IA externo,
 * reemplazando IPs, dominios y hostnames/sensores por marcadores genéricos. El contexto guarda el
 * mapeo para poder restaurar los valores reales en el texto que redacte la IA (desanitizarTexto),
 * sin que el dato sensible haya salido nunca de la máquina en su forma original.
 *
 * Se hace en UNA sola pasada con un regex combinado (alternancia) para que un marcador ya insertado
 * (ej. "[DOMINIO-1]") no vuelva a ser "capturado" por otra de las expresiones en una pasada posterior.
 */

const NO_ANTES = String.raw`(?<![A-Za-z0-9_.-])`;
const NO_DESPUES = String.raw`(?![A-Za-z0-9_.-])`;

const IP_PART = String.raw`(?:\d{1,3}\.){3}\d{1,3}`;

// dominio/subdominio con TLD (ej. banrural.com.gt, pt360.banrural.tech)
const DOMINIO_PART =
  String.raw`(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:com|net|org|gt|tech|io|co|info|biz|gob)(?:\.[A-Za-z]{2,3})?`;

// hostnames/sensores tipo "dt-21574-06", "srvpa001bic", "PRSGTD6-05894323": mezcla de letras y
// numeros de al menos 5 caracteres -- heuristica, no perfecta (prefiere sobre-redactar a filtrar).
const HOST_PART = String.raw`(?=[A-Za-z0-9_-]*[A-Za-z])(?=[A-Za-z0-9_-]*[0-9])[A-Za-z0-9_-]{5,}`;

const COMBINADO = new RegExp(`${NO_ANTES}(?:(${IP_PART})|(${DOMINIO_PART})|(${HOST_PART}))${NO_DESPUES}`, "g");

export interface ContextoSanitizacion {
  readonly mapa: Map<string, string>; // placeholder -> valor original
  readonly inverso: Map<string, string>; // valor original -> placeholder
  contadores: { ip: number; dominio: number; host: number };
}

export function crearContextoSanitizacion(): ContextoSanitizacion {
  return { mapa: new Map(), inverso: new Map(), contadores: { ip: 0, dominio: 0, host: 0 } };
}

function placeholderPara(valor: string, tipo: "IP" | "DOMINIO" | "HOST", ctx: ContextoSanitizacion): string {
  const existente = ctx.inverso.get(valor);
  if (existente) return existente;
  const clave = tipo === "IP" ? "ip" : tipo === "DOMINIO" ? "dominio" : "host";
  const numero = ++ctx.contadores[clave];
  const placeholder = `[${tipo}-${numero}]`;
  ctx.mapa.set(placeholder, valor);
  ctx.inverso.set(valor, placeholder);
  return placeholder;
}

export function sanitizarTexto(texto: string, ctx: ContextoSanitizacion): string {
  if (!texto) return texto;
  return texto.replace(COMBINADO, (coincidencia, ip, dominio, host) => {
    if (ip) return placeholderPara(ip, "IP", ctx);
    if (dominio) return placeholderPara(dominio, "DOMINIO", ctx);
    if (host) return placeholderPara(host, "HOST", ctx);
    return coincidencia;
  });
}

export function desanitizarTexto(texto: string, ctx: ContextoSanitizacion): string {
  if (!texto) return texto;
  let resultado = texto;
  for (const [placeholder, original] of ctx.mapa) {
    resultado = resultado.split(placeholder).join(original);
  }
  return resultado;
}
