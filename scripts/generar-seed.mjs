/**
 * Regenera `data/colaboradores.json` con el modelo completo del pitch
 * (docs/PITCH-REQUISITOS.md): perfiles con descripción/educación/ingreso,
 * certificaciones con emisión + adjunto, catálogo con Inglés como soft skill,
 * proyectos con asignaciones y el histórico mensual de punteos.
 *
 *   node scripts/generar-seed.mjs      (o `npm run seed`)
 *
 * Es idempotente y determinista: correrlo dos veces da el mismo archivo, y
 * corre después de una demo para dejar el seed como estaba (Marvin al 50%,
 * Pedrito al 90%, el proyecto de la municipalidad como oportunidad abierta).
 *
 * La disponibilidad NO se guarda: se deriva de las asignaciones a proyectos en
 * ejecución. La tabla de abajo es la carga con la que se genera el seed.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const RUTA = path.join(process.cwd(), "data", "colaboradores.json");
const HOY = "2026-09-11";

/** % disponible con el que arranca cada persona. carga = 100 − disponible. */
const DISPONIBILIDAD = {
  "inge-01": 95,
  "inge-02": 30,
  "inge-03": 10,
  "inge-04": 90,
  "inge-05": 5,
  "inge-06": 45,
  "inge-07": 85,
  "inge-08": 10,
  "inge-09": 10,
  "inge-10": 55,
  "inge-11": 80,
  "inge-12": 60,
  "inge-13": 10,
  "inge-14": 80,
  "inge-15": 60,
  "inge-16": 5,
  "inge-17": 85,
  "inge-18": 50,
  "inge-marvin": 50,
  "inge-pedrito": 90,
  "csc-01": 35,
  "csc-02": 55,
  "csc-03": 10,
  "csc-04": 90,
  "csc-05": 40,
  "csc-06": 90,
  "csc-07": 45,
  "csc-08": 5,
  "cons-01": 5,
  "cons-02": 0,
  "cons-03": 55,
  "cons-04": 100,
  "cons-05": 30,
  "cons-06": 40,
  "cons-07": 50,
  "cons-08": 95,
};

/**
 * Proyectos de la cartera de demo. `oportunidad` no consume carga: solo los
 * que están `en-ejecucion` cuentan para la cargabilidad de la gente.
 */
const PROYECTOS = [
  {
    id: "prj-infoblox-muni",
    nombre: "Despliegue Infoblox DDI",
    cliente: "Municipalidad Demo",
    area: "Ingeniería",
    estado: "oportunidad",
    inicio: "2026-10-01",
    fin: "2027-01-31",
    descripcion:
      "Oportunidad del escenario del pitch: implementación de Infoblox DDI para una municipalidad. Requiere personal con nivel intermedio y certificación vigente de Infoblox para cumplir el requisito de la licitación.",
    requisitos: "Infoblox",
  },
  {
    id: "prj-perimetro-banco",
    nombre: "Renovación de perímetro",
    cliente: "Banco Demo",
    area: "Ingeniería",
    estado: "en-ejecucion",
    inicio: "2026-06-01",
    fin: "2026-12-15",
    descripcion:
      "Reemplazo de firewalls y rediseño de reglas con TUFIN para un banco regional.",
    requisitos: "Seguridad Perimetral + TUFIN + Checkpoint",
  },
  {
    id: "prj-ztna-acme",
    nombre: "Cloudflare ZTNA",
    cliente: "ACME Corp",
    area: "Ingeniería",
    estado: "en-ejecucion",
    inicio: "2026-07-15",
    fin: "2026-11-30",
    descripcion:
      "Migración de VPN tradicional a acceso Zero Trust para 800 usuarios.",
    requisitos: "Cloudflare ZTNA + Cloudflare WAF",
  },
  {
    id: "prj-segmentacion-ind",
    nombre: "Segmentación de red OT",
    cliente: "Industrias Demo",
    area: "Ingeniería",
    estado: "en-ejecucion",
    inicio: "2026-05-02",
    fin: "2026-10-31",
    descripcion:
      "Separación de red industrial y corporativa en dos plantas de producción.",
    requisitos: "VAPT OT + Seguridad Perimetral",
  },
  {
    id: "prj-ndr-aseg",
    nombre: "Darktrace NDR",
    cliente: "Aseguradora Demo",
    area: "Ingeniería",
    estado: "en-ejecucion",
    inicio: "2026-08-01",
    fin: "2027-02-28",
    descripcion: "Implementación de detección de anomalías de red y correo.",
    requisitos: "Darktrace NDR + Darktrace Email",
  },
  {
    id: "prj-checkpoint-retail",
    nombre: "Migración Checkpoint",
    cliente: "Retail Demo",
    area: "Ingeniería",
    estado: "cerrado",
    inicio: "2026-01-15",
    fin: "2026-05-30",
    descripcion: "Migración de 12 gateways a la plataforma Checkpoint.",
    requisitos: "Checkpoint + Seguridad Perimetral",
  },
  {
    id: "prj-soc-acme",
    nombre: "SOC gestionado 24/7",
    cliente: "ACME Corp",
    area: "CSC",
    estado: "en-ejecucion",
    inicio: "2026-01-02",
    fin: "2026-12-31",
    descripcion: "Monitoreo continuo con turnos rotativos y reporte mensual.",
    requisitos: "Monitoreo SIEM + Correlación de logs",
  },
  {
    id: "prj-siem-banco",
    nombre: "Monitoreo SIEM",
    cliente: "Banco Demo",
    area: "CSC",
    estado: "en-ejecucion",
    inicio: "2026-03-01",
    fin: "2027-02-28",
    descripcion: "Ingesta, correlación de logs y casos de uso regulatorios.",
    requisitos: "Monitoreo SIEM + Elastic Search",
  },
  {
    id: "prj-dfir-retainer",
    nombre: "Retainer DFIR",
    cliente: "Empresa Demo",
    area: "CSC",
    estado: "en-ejecucion",
    inicio: "2026-04-01",
    fin: "2027-03-31",
    descripcion: "Horas reservadas de respuesta a incidentes y análisis forense.",
    requisitos: "Respuesta a Incidentes (DFIR) + Análisis de Malware",
  },
  {
    id: "prj-hunting-telecom",
    nombre: "Threat hunting trimestral",
    cliente: "Telecom Demo",
    area: "CSC",
    estado: "cerrado",
    inicio: "2026-02-01",
    fin: "2026-04-30",
    descripcion: "Campañas de búsqueda proactiva sobre la red del cliente.",
    requisitos: "Threat Hunting + Monitoreo SIEM",
  },
  {
    id: "prj-iso-empresa",
    nombre: "Certificación ISO 27001",
    cliente: "Empresa Demo",
    area: "Consulting",
    estado: "en-ejecucion",
    inicio: "2026-02-15",
    fin: "2026-12-20",
    descripcion:
      "Acompañamiento completo hasta la auditoría de certificación del SGSI.",
    requisitos: "Auditoría ISO 27001 + Redacción",
  },
  {
    id: "prj-pci-procesadora",
    nombre: "Auditoría PCI DSS",
    cliente: "Procesadora Demo",
    area: "Consulting",
    estado: "en-ejecucion",
    inicio: "2026-06-01",
    fin: "2026-11-15",
    descripcion: "Evaluación anual de cumplimiento del entorno de tarjetas.",
    requisitos: "PCI DSS + Auditoría ISO 27001",
  },
  {
    id: "prj-awareness-acme",
    nombre: "Programa de concientización",
    cliente: "ACME Corp",
    area: "Consulting",
    estado: "en-ejecucion",
    inicio: "2026-05-01",
    fin: "2026-10-31",
    descripcion: "Campañas de phishing simulado y capacitación con KnowBe4.",
    requisitos: "KnowBe4 + Ingeniería Social / Phishing",
  },
  {
    id: "prj-vapt-fintech",
    nombre: "VAPT Web anual",
    cliente: "Fintech Demo",
    area: "Consulting",
    estado: "en-ejecucion",
    inicio: "2026-08-15",
    fin: "2026-10-15",
    descripcion: "Pruebas de penetración sobre la banca en línea y su API.",
    requisitos: "VAPT Web + Evaluación de código",
  },
  {
    id: "prj-riesgos-muni",
    nombre: "Análisis de riesgos",
    cliente: "Municipalidad Demo",
    area: "Consulting",
    estado: "oportunidad",
    inicio: "2026-11-01",
    fin: "2027-01-31",
    descripcion:
      "Oportunidad abierta: levantamiento de riesgos y plan de tratamiento.",
    requisitos: "Análisis de Riesgos + Presentación a clientes",
  },
];

/**
 * A qué proyectos se carga cada persona. Los porcentajes suman
 * 100 − DISPONIBILIDAD; quien no aparece está en banca (100% disponible).
 */
const ASIGNACIONES = {
  "inge-01": [["prj-ndr-aseg", 5]],
  "inge-02": [
    ["prj-perimetro-banco", 40],
    ["prj-ztna-acme", 30],
  ],
  "inge-03": [
    ["prj-segmentacion-ind", 60],
    ["prj-perimetro-banco", 30],
  ],
  "inge-04": [["prj-ndr-aseg", 10]],
  "inge-05": [
    ["prj-ztna-acme", 60],
    ["prj-ndr-aseg", 35],
  ],
  "inge-06": [
    ["prj-perimetro-banco", 35],
    ["prj-segmentacion-ind", 20],
  ],
  "inge-07": [["prj-ztna-acme", 15]],
  "inge-08": [
    ["prj-segmentacion-ind", 50],
    ["prj-ndr-aseg", 40],
  ],
  "inge-09": [["prj-perimetro-banco", 90]],
  "inge-10": [["prj-ztna-acme", 45]],
  "inge-11": [["prj-ztna-acme", 20]],
  "inge-12": [["prj-ndr-aseg", 40]],
  "inge-13": [
    ["prj-ndr-aseg", 50],
    ["prj-segmentacion-ind", 40],
  ],
  "inge-14": [["prj-segmentacion-ind", 20]],
  "inge-15": [["prj-perimetro-banco", 40]],
  "inge-16": [
    ["prj-ztna-acme", 55],
    ["prj-perimetro-banco", 40],
  ],
  "inge-17": [["prj-ndr-aseg", 15]],
  "inge-18": [["prj-segmentacion-ind", 50]],
  "inge-marvin": [["prj-perimetro-banco", 50]],
  "inge-pedrito": [["prj-segmentacion-ind", 10]],
  "csc-01": [["prj-soc-acme", 65]],
  "csc-02": [["prj-siem-banco", 45]],
  "csc-03": [
    ["prj-soc-acme", 50],
    ["prj-siem-banco", 40],
  ],
  "csc-04": [["prj-soc-acme", 10]],
  "csc-05": [["prj-dfir-retainer", 60]],
  "csc-06": [["prj-soc-acme", 10]],
  "csc-07": [["prj-siem-banco", 55]],
  "csc-08": [
    ["prj-dfir-retainer", 55],
    ["prj-soc-acme", 40],
  ],
  "cons-01": [
    ["prj-iso-empresa", 60],
    ["prj-pci-procesadora", 35],
  ],
  "cons-02": [
    ["prj-iso-empresa", 55],
    ["prj-pci-procesadora", 45],
  ],
  "cons-03": [["prj-pci-procesadora", 45]],
  "cons-05": [
    ["prj-iso-empresa", 40],
    ["prj-awareness-acme", 30],
  ],
  "cons-06": [["prj-awareness-acme", 60]],
  "cons-07": [["prj-vapt-fintech", 50]],
  "cons-08": [["prj-awareness-acme", 5]],
};

/** Rol dentro del proyecto según la posición de la persona. */
function rolEnProyecto(rol) {
  if (/Líder|Gerente/.test(rol)) return "Líder de proyecto";
  if (/Practicante/.test(rol)) return "Apoyo — en formación";
  if (/Sr\.|N3/.test(rol)) return "Especialista senior";
  return "Consultor asignado";
}

/** Nivel de educación y descripción, derivados de la posición. */
const PERFIL_POR_ROL = {
  "Ingeniero de Seguridad Sr.": {
    educacion: "Ingeniería en Sistemas · Maestría en Ciberseguridad (en curso)",
    descripcion:
      "Lidera evaluaciones técnicas y acompaña al cliente en la remediación. Referente interno en pruebas de penetración y endurecimiento de infraestructura.",
  },
  "Ingeniero de Seguridad": {
    educacion: "Ingeniería en Sistemas",
    descripcion:
      "Ejecuta evaluaciones técnicas y despliegues de plataformas de seguridad con acompañamiento del líder técnico.",
  },
  "Ingeniero de Redes": {
    educacion: "Ingeniería en Telecomunicaciones",
    descripcion:
      "Diseña y opera la capa de red: segmentación, ruteo, DNS/DHCP y perímetro.",
  },
  "Ingeniero de Soluciones": {
    educacion: "Ingeniería en Sistemas",
    descripcion:
      "Traduce el requerimiento del cliente a una solución de fabricante: dimensiona, valida requisitos técnicos y define el alcance de implementación.",
  },
  "Ingeniero Cloud": {
    educacion: "Ingeniería en Sistemas · Especialización en Cloud",
    descripcion:
      "Responsable de la postura de seguridad en nube y de las plataformas SaaS de protección.",
  },
  "Líder Técnico": {
    educacion: "Ingeniería en Sistemas · Maestría en Gestión de TI",
    descripcion:
      "Coordina al equipo de ingeniería en la ejecución de proyectos y valida la calidad técnica de los entregables.",
  },
  "Practicante de Ingeniería": {
    educacion: "Estudiante de Ingeniería en Sistemas (8.º semestre)",
    descripcion:
      "En formación. Acompaña proyectos para adquirir experiencia de campo en implementación y operación.",
  },
  "Analista SOC N1": {
    educacion: "Técnico en Redes y Seguridad",
    descripcion:
      "Primera línea de monitoreo: triage de alertas y escalamiento según el playbook.",
  },
  "Analista SOC N2": {
    educacion: "Ingeniería en Sistemas",
    descripcion:
      "Investiga alertas escaladas, afina reglas de correlación y documenta hallazgos.",
  },
  "Analista SOC N3": {
    educacion: "Ingeniería en Sistemas · Especialización en Threat Intelligence",
    descripcion:
      "Caza amenazas, lidera investigaciones complejas y desarrolla nuevos casos de uso del SIEM.",
  },
  "Líder de Turno": {
    educacion: "Ingeniería en Sistemas",
    descripcion:
      "Coordina el turno del SOC, asegura los tiempos de respuesta y reporta al cliente.",
  },
  "Especialista DFIR": {
    educacion: "Ingeniería en Sistemas · Certificaciones forenses",
    descripcion:
      "Contiene y analiza incidentes: adquisición forense, análisis de malware y reporte ejecutivo.",
  },
  "Consultor GRC": {
    educacion: "Licenciatura en Sistemas · Diplomado en Gestión de Riesgos",
    descripcion:
      "Levanta controles, redacta políticas y acompaña al cliente en la implementación del marco normativo.",
  },
  "Consultor GRC Sr.": {
    educacion: "Ingeniería Industrial · Maestría en Gestión de Riesgos",
    descripcion:
      "Dirige proyectos de cumplimiento de punta a punta y presenta resultados a comités de dirección.",
  },
  "Auditor de Cumplimiento": {
    educacion: "Contaduría Pública y Auditoría · Certificaciones de auditoría TI",
    descripcion:
      "Evalúa controles contra el estándar aplicable y sustenta la evidencia ante el auditor externo.",
  },
  Pentester: {
    educacion: "Ingeniería en Sistemas · Formación ofensiva continua",
    descripcion:
      "Ejecuta pruebas de penetración sobre aplicaciones e infraestructura y redacta el informe técnico.",
  },
  "Gerente de Consultoría": {
    educacion: "Ingeniería en Sistemas · MBA",
    descripcion:
      "Responsable de la cartera de consultoría: propuestas, relación con el cliente y calidad de los entregables.",
  },
};

/** Marvin: perfil fijo del escenario del pitch, no derivado de la tabla. */
const PERFIL_FIJO = {
  "inge-marvin": {
    educacion: "Ingeniería en Sistemas · Certificación Infoblox",
    descripcion:
      "Se incorporó a ES Consulting en 2026. Trae conocimiento intermedio en Infoblox con certificación de fabricante y habilidades de liderazgo. Es el punto de contacto para dimensionar soluciones de DDI y validar requerimientos técnicos en propuestas.",
    ingreso: "2026-07-01",
  },
  "inge-pedrito": {
    educacion: "Estudiante de Ingeniería en Sistemas (8.º semestre)",
    descripcion:
      "Practicante con nivel inicial en Infoblox. Se le asigna a proyectos junto a un especialista para que desarrolle experiencia de campo.",
    ingreso: "2026-08-04",
  },
};

/** PRNG determinista por id, para fechas y adjuntos reproducibles. */
function semilla(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function restarMeses(iso, meses) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - meses);
  return d.toISOString().slice(0, 10);
}

function nombreArchivo(cert, persona) {
  const slug = cert.nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${persona.id}-${slug}.pdf`;
}

/** Nivel de Inglés a partir de los idiomas que ya traía el perfil. */
function nivelIngles(persona, rnd) {
  if (!persona.idiomas.some((i) => i.startsWith("Inglés"))) {
    return /Practicante|N1/.test(persona.rol) ? 1 : 0;
  }
  return rnd() < 0.45 ? 3 : 2;
}

const inventario = JSON.parse(await readFile(RUTA, "utf-8"));

// ── Catálogo: Inglés entra como soft skill (así lo pide el pitch) ────────────
if (!inventario.skills.some((s) => s.id === "ingles")) {
  const i = inventario.skills.findIndex((s) => s.id === "liderazgo");
  inventario.skills.splice(i + 1, 0, {
    id: "ingles",
    nombre: "Inglés",
    categoria: "soft",
  });
}

// ── Personas ────────────────────────────────────────────────────────────────
// Quien se dio de alta durante una demo no es parte del seed: se descarta para
// que el archivo vuelva exactamente al estado con el que se ensaya.
const altasDeDemo = inventario.personas.filter(
  (p) => p.origen === "alta-en-plataforma",
);
if (altasDeDemo.length > 0) {
  inventario.personas = inventario.personas.filter(
    (p) => p.origen !== "alta-en-plataforma",
  );
  console.log(
    `· se descartaron ${altasDeDemo.length} alta(s) de demo: ${altasDeDemo
      .map((p) => p.nombre)
      .join(", ")}`,
  );
}

for (const persona of inventario.personas) {
  const rnd = semilla(persona.id);
  const fijo = PERFIL_FIJO[persona.id];
  const plantilla = PERFIL_POR_ROL[persona.rol] ?? {
    educacion: "Ingeniería en Sistemas",
    descripcion: "Colaborador del equipo.",
  };

  persona.descripcion = fijo?.descripcion ?? plantilla.descripcion;
  persona.educacion = fijo?.educacion ?? plantilla.educacion;
  persona.ingreso =
    fijo?.ingreso ?? restarMeses(HOY, 6 + Math.floor(rnd() * 96));
  persona.foto = null;

  const ingles = nivelIngles(persona, rnd);
  persona.skills = persona.skills.filter((s) => s.skillId !== "ingles");
  if (ingles > 0) persona.skills.push({ skillId: "ingles", nivel: ingles });
  persona.skills.sort((a, b) => a.skillId.localeCompare(b.skillId));

  // Marvin: la certificación vence pronto — es el "extra" del pitch, la
  // notificación a RRHH para que entre en la planificación del trimestre.
  if (persona.id === "inge-marvin") {
    persona.certificaciones = [
      { nombre: "Infoblox Core DDI Associate", vence: "2026-11-15" },
    ];
  }

  persona.certificaciones = persona.certificaciones.map((cert) => ({
    nombre: cert.nombre,
    emitida: restarMeses(cert.vence, 24),
    vence: cert.vence,
    archivo: nombreArchivo(cert, persona),
  }));

  delete persona.disponibilidad; // se deriva de las asignaciones
}

// ── Proyectos con sus asignaciones ──────────────────────────────────────────
const personaPorId = new Map(inventario.personas.map((p) => [p.id, p]));

inventario.proyectos = PROYECTOS.map((proyecto) => ({
  ...proyecto,
  asignaciones: [],
}));
const proyectoPorId = new Map(inventario.proyectos.map((p) => [p.id, p]));

for (const [personaId, filas] of Object.entries(ASIGNACIONES)) {
  const persona = personaPorId.get(personaId);
  if (!persona) throw new Error(`Asignación de persona inexistente: ${personaId}`);

  for (const [proyectoId, dedicacion] of filas) {
    const proyecto = proyectoPorId.get(proyectoId);
    if (!proyecto) throw new Error(`Proyecto inexistente: ${proyectoId}`);
    proyecto.asignaciones.push({
      personaId,
      rolProyecto: rolEnProyecto(persona.rol),
      dedicacion,
    });
  }
}

for (const proyecto of inventario.proyectos) {
  proyecto.asignaciones.sort((a, b) =>
    b.dedicacion - a.dedicacion ||
    personaPorId.get(a.personaId).nombre.localeCompare(
      personaPorId.get(b.personaId).nombre,
    ),
  );
}

// Verificación: la carga derivada tiene que dar la disponibilidad esperada.
for (const persona of inventario.personas) {
  const carga = inventario.proyectos
    .filter((p) => p.estado === "en-ejecucion")
    .flatMap((p) => p.asignaciones)
    .filter((a) => a.personaId === persona.id)
    .reduce((acc, a) => acc + a.dedicacion, 0);

  const esperada = DISPONIBILIDAD[persona.id];
  if (100 - carga !== esperada) {
    throw new Error(
      `${persona.nombre}: carga ${carga}% → ${100 - carga}% disponible, se esperaba ${esperada}%`,
    );
  }
}

// ── Histórico mensual de punteos por área ───────────────────────────────────
// El último mes es el punteo real que calcula la app hoy; los anteriores son
// una curva de crecimiento sintética, para el comparativo mes a mes de RRHH.
const AREAS = ["Ingeniería", "CSC", "Consulting"];
const CATEGORIAS = ["technical", "solutions", "soft"];
const categoriaDeSkill = new Map(inventario.skills.map((s) => [s.id, s.categoria]));

function punteosDelArea(area) {
  const total = { technical: 0, solutions: 0, soft: 0 };
  for (const persona of inventario.personas) {
    if (persona.equipo !== area) continue;
    for (const ps of persona.skills) {
      const categoria = categoriaDeSkill.get(ps.skillId);
      if (categoria) total[categoria] += ps.nivel;
    }
  }
  return total;
}

const MESES = 6;
const actual = Object.fromEntries(AREAS.map((a) => [a, punteosDelArea(a)]));

inventario.historial = Array.from({ length: MESES }, (_, i) => {
  const mes = restarMeses(HOY, MESES - 1 - i).slice(0, 7);
  // Del 88% del punteo actual hasta el 100% en el mes corriente.
  const factor = 0.88 + (0.12 * i) / (MESES - 1);
  const punteos = Object.fromEntries(
    AREAS.map((area) => [
      area,
      Object.fromEntries(
        CATEGORIAS.map((c) => [
          c,
          i === MESES - 1
            ? actual[area][c]
            : Math.round(actual[area][c] * factor),
        ]),
      ),
    ]),
  );
  return { mes, punteos };
});

// ── Metadatos ───────────────────────────────────────────────────────────────
inventario.nota =
  "DATOS DE DEMO. Ninguna persona real de ES Consulting aparece con sus datos. " +
  "Ingeniería: 18 perfiles sintéticos PROVISIONALES (origen 'sintetico-pendiente-excel'), " +
  "en espera de los niveles reales de la matriz de habilidades; al cargarlos, los nombres van " +
  "anonimizados y el mapeo real->ficticio queda fuera del repo (.gitignore). CSC y Consulting: " +
  "sintéticos. Marvin Tercero Jr. y Pedrito son los personajes del pitch. La disponibilidad no " +
  "se guarda: se deriva de las asignaciones a proyectos en ejecución. Regenerar con `npm run seed`.";
inventario.generado = HOY;

const orden = [
  "nota",
  "generado",
  "escala",
  "skills",
  "personas",
  "proyectos",
  "historial",
];
const salida = Object.fromEntries(orden.map((k) => [k, inventario[k]]));

await writeFile(RUTA, `${JSON.stringify(salida, null, 2)}\n`, "utf-8");

console.log(
  `✓ ${salida.personas.length} personas · ${salida.skills.length} skills · ` +
    `${salida.proyectos.length} proyectos · ${salida.historial.length} meses de histórico`,
);
