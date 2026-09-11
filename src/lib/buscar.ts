import { certificacionDelSkill, hoyISO, normalizar } from "./skills";
import { NIVEL_MAX } from "./tipos";
import type {
  Candidato,
  Cobertura,
  Inventario,
  Persona,
  Requisito,
  ResultadoBusqueda,
  Skill,
} from "./tipos";

/**
 * Atajos para cómo la gente escribe de verdad los requisitos de una
 * licitación. Lo que ya calza por nombre no necesita entrada aquí:
 * "Infoblox", "SonarQube" o "Liderazgo" se resuelven solos.
 */
const ALIAS: Record<string, string> = {
  // Técnicas
  pentest: "vapt-web",
  "pentest web": "vapt-web",
  "pentesting web": "vapt-web",
  web: "vapt-web",
  "pentest interno": "vapt-interno",
  interno: "vapt-interno",
  "pentest movil": "vapt-movil",
  movil: "vapt-movil",
  mobile: "vapt-movil",
  ot: "vapt-ot",
  scada: "vapt-ot",
  industrial: "vapt-ot",
  wifi: "vapt-wifi",
  inalambrica: "vapt-wifi",
  cajeros: "vapt-cajeros",
  atm: "vapt-cajeros",
  ad: "active-directory",
  "directorio activo": "active-directory",
  codigo: "eval-codigo",
  "revision de codigo": "eval-codigo",
  sast: "eval-codigo",
  firewall: "seg-perimetral",
  fortinet: "seg-perimetral",
  forti: "seg-perimetral",
  vpn: "seg-perimetral",
  perimetro: "seg-perimetral",
  redes: "seg-perimetral",
  siem: "monitoreo-siem",
  soc: "monitoreo-siem",
  monitoreo: "monitoreo-siem",
  logs: "correlacion-logs",
  hunting: "threat-hunting",
  incidentes: "dfir",
  "respuesta a incidentes": "dfir",
  forense: "dfir",
  malware: "analisis-malware",
  vulnerabilidades: "analisis-vuln",
  iso: "iso-27001",
  iso27001: "iso-27001",
  "27001": "iso-27001",
  pci: "pci-dss",
  soc2: "soc-2",
  riesgos: "analisis-riesgos",
  continuidad: "bcp",
  privacidad: "proteccion-datos",
  gdpr: "proteccion-datos",
  "datos personales": "proteccion-datos",
  normativa: "politicas",
  phishing: "ing-social",
  "ingenieria social": "ing-social",
  concientizacion: "knowbe4",

  // Soluciones
  ztna: "cf-ztna",
  waf: "cf-waf",
  darktrace: "darktrace-ndr",
  ndr: "darktrace-ndr",
  pam: "beyond-trust",
  dns: "infoblox",
  ddi: "infoblox",
  ipam: "infoblox",
  honeypot: "thinkst-canary",
  edr: "crowdstrike",
  sentinel: "ms-sentinel",
  mfa: "yubico",
  elastic: "elastic-search",
  burp: "burp-suite",

  // Blandas
  reportes: "redaccion",
  informes: "redaccion",
  "redaccion de reportes": "redaccion",
  comunicacion: "comunicacion-verbal",
  presentacion: "presentacion-clientes",
  pm: "gestion-proyectos",
  "project management": "gestion-proyectos",
  teamwork: "gestion-proyectos",
  english: "ingles",
  "ingles tecnico": "ingles",
  "ingles avanzado": "ingles",
  bilingue: "ingles",
};

/**
 * El inglés es un soft skill con nivel 0–3, como lo pide el pitch. Lo que
 * queda aquí son los idiomas que solo se declaran en el perfil, sin escala,
 * para que "GRC + español" siga funcionando como un requisito más.
 */
const IDIOMAS: Record<string, string> = {
  espanol: "Español",
  castellano: "Español",
};

/** Separa "pentest web + ISO 27001, inglés" en términos sueltos. */
function partirConsulta(consulta: string): string[] {
  return consulta
    .split(/[+,;\n]| y /gi)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
}

/**
 * Resuelve un término escrito a mano contra el catálogo de skills.
 * Devuelve el mejor match, o null si no se parece a nada.
 */
function resolverSkill(termino: string, skills: Skill[]): Skill | null {
  const t = normalizar(termino);

  const porAlias = ALIAS[t];
  if (porAlias) {
    const skill = skills.find((s) => s.id === porAlias);
    if (skill) return skill;
  }

  let mejor: Skill | null = null;
  let mejorPuntaje = 0;

  for (const skill of skills) {
    const nombre = normalizar(skill.nombre);
    let puntaje = 0;

    if (nombre === t || skill.id === t) {
      puntaje = 100;
    } else if (nombre.includes(t)) {
      // "infoblox" → "Infoblox". Entre varios, gana el nombre más corto:
      // "cloudflare" cae en "Cloudflare WAF", no en "Cloudflare Magic Transit".
      puntaje = 60 + t.length / nombre.length;
    } else if (t.includes(nombre)) {
      // "necesitamos alguien de Infoblox" → "Infoblox"
      puntaje = 50 + nombre.length / t.length;
    }

    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = skill;
    }
  }

  return mejor;
}

/** Un término escrito a mano → un requisito resuelto, o null. */
function resolverRequisito(termino: string, skills: Skill[]): Requisito | null {
  const idioma = IDIOMAS[normalizar(termino)];
  if (idioma) {
    return { tipo: "idioma", textoOriginal: termino, etiqueta: idioma, idioma };
  }

  const skill = resolverSkill(termino, skills);
  if (!skill) return null;

  return {
    tipo: "skill",
    textoOriginal: termino,
    etiqueta: skill.nombre,
    skill,
  };
}

/** Clave con la que se deduplica un requisito ya agregado. */
function claveRequisito(requisito: Requisito): string {
  return requisito.tipo === "skill"
    ? `skill:${requisito.skill.id}`
    : `idioma:${requisito.idioma}`;
}

/**
 * Pesos del score, explícitos para poder defenderlos en la demo. El orden es
 * el que fijó el planteamiento: primero cuántos requisitos cubre, luego con
 * qué nivel, luego si lo respalda una certificación vigente, y de último la
 * disponibilidad como desempate.
 */
const PESO_COBERTURA = 0.5;
const PESO_NIVEL = 0.28;
const PESO_CERTIFICACION = 0.12;
const PESO_DISPONIBILIDAD = 0.1;

function evaluar(
  persona: Persona,
  requisitos: Requisito[],
  hoy: string,
): Candidato {
  const nivelPorSkill = new Map(
    persona.skills.map((ps) => [ps.skillId, ps.nivel as number] as const),
  );

  const coberturas: Cobertura[] = requisitos.map((requisito) => {
    if (requisito.tipo === "idioma") {
      // Un idioma no tiene escala en el seed: o lo maneja o no. Se cuenta al
      // máximo para que pese igual que un skill cubierto a nivel avanzado.
      const loTiene = persona.idiomas.includes(requisito.idioma);
      return {
        requisito,
        nivel: loTiene ? NIVEL_MAX : 0,
        certificacion: null,
      };
    }

    const nivel = nivelPorSkill.get(requisito.skill.id) ?? 0;
    return {
      requisito,
      nivel,
      certificacion:
        nivel > 0 ? certificacionDelSkill(persona, requisito.skill, hoy) : null,
    };
  });

  const requisitosCubiertos = coberturas.filter((c) => c.nivel > 0).length;
  const requisitosCertificados = coberturas.filter(
    (c) => c.certificacion !== null,
  ).length;
  const sumaNiveles = coberturas.reduce((acc, c) => acc + c.nivel, 0);

  const cobertura = requisitosCubiertos / requisitos.length;
  const nivel = sumaNiveles / (NIVEL_MAX * requisitos.length);
  const certificacion = requisitosCertificados / requisitos.length;
  const disponibilidad = persona.disponibilidad / 100;

  const score = Math.round(
    100 *
      (PESO_COBERTURA * cobertura +
        PESO_NIVEL * nivel +
        PESO_CERTIFICACION * certificacion +
        PESO_DISPONIBILIDAD * disponibilidad),
  );

  return {
    persona,
    score,
    coberturas,
    requisitosCubiertos,
    requisitosCertificados,
  };
}

/**
 * El corazón del prototipo: requisitos escritos a mano → candidatos ordenados
 * por qué tan bien califican contra *esos* requisitos (no por punteo total de
 * la categoría, que sacaría arriba a quien no sabe lo que se busca).
 */
export function buscar(
  inventario: Inventario,
  consulta: string,
): ResultadoBusqueda {
  const requisitos: Requisito[] = [];
  const noReconocidos: string[] = [];
  const yaAgregados = new Set<string>();

  for (const termino of partirConsulta(consulta)) {
    const requisito = resolverRequisito(termino, inventario.skills);
    if (!requisito) {
      noReconocidos.push(termino);
      continue;
    }

    const clave = claveRequisito(requisito);
    if (yaAgregados.has(clave)) continue;

    yaAgregados.add(clave);
    requisitos.push(requisito);
  }

  if (requisitos.length === 0) {
    return { consulta, requisitos, noReconocidos, candidatos: [] };
  }

  const hoy = hoyISO();
  const candidatos = inventario.personas
    .map((p) => evaluar(p, requisitos, hoy))
    .filter((c) => c.requisitosCubiertos > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.requisitosCubiertos - a.requisitosCubiertos ||
        b.requisitosCertificados - a.requisitosCertificados ||
        b.persona.disponibilidad - a.persona.disponibilidad ||
        a.persona.nombre.localeCompare(b.persona.nombre),
    );

  return { consulta, requisitos, noReconocidos, candidatos };
}
