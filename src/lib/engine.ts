import camsData from "../../data/cams.json";
import historicoData from "../../data/historico-eventos.json";
import type {
  Asistencia,
  AsistenteCrudo,
  Cam,
  CargaCam,
  EventoConfig,
  EventoHistorico,
  Franja,
  Lead,
  MetricasSponsor,
  Perfil,
  Prioridad,
  Proyeccion,
  Resultado,
} from "./types";

export const CAMS: Cam[] = camsData.cams;
export const HISTORICO: EventoHistorico[] = historicoData.eventos as EventoHistorico[];

function sinAcentos(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/* ------------------------------------------------------------------ */
/* 1. Segmentacion por perfil                                          */
/* ------------------------------------------------------------------ */

/** Palabras del cargo que identifican a un decisor (firma o define presupuesto). */
const CARGOS_DECISOR = [
  "ciso",
  "cio",
  "cto",
  "ceo",
  "cfo",
  "director",
  "directora",
  "gerente general",
  "gerente pais",
  "socio",
  "vp",
  "vicepresidente",
  "presidente",
  "oficial de seguridad",
];

/** Palabras del cargo que identifican mando medio (influye y prioriza). */
const CARGOS_GERENCIAL = [
  "gerente",
  "jefe",
  "jefa",
  "subgerente",
  "coordinador",
  "coordinadora",
  "encargado",
  "encargada",
  "supervisor",
  "product owner",
  "lider",
  "responsable",
];

export function clasificarPerfil(cargo: string): Perfil {
  const c = sinAcentos(cargo);
  if (CARGOS_DECISOR.some((p) => c.includes(p))) return "Decisor";
  if (CARGOS_GERENCIAL.some((p) => c.includes(p))) return "Gerencial";
  return "Tecnico";
}

/* ------------------------------------------------------------------ */
/* 2. Scoring del lead                                                 */
/* ------------------------------------------------------------------ */

const PUNTOS_PERFIL: Record<Perfil, number> = {
  Decisor: 50,
  Gerencial: 35,
  Tecnico: 20,
};

/** Supuesto de negocio: un referido de ventas pesa mas que un registro web frio. */
const PUNTOS_CANAL: Record<string, number> = {
  "referido ventas": 20,
  "invitacion directa": 15,
  "formulario web": 5,
};

/** Industrias donde la oferta de ciberseguridad tiene mayor ticket y urgencia. */
const INDUSTRIAS_ESTRATEGICAS = ["banca", "fintech", "seguros", "gobierno", "energia", "salud"];

/** Temas que indican una necesidad concreta y con presupuesto asociado. */
const INTERESES_ALTO_VALOR = [
  "soc gestionado",
  "deteccion de amenazas",
  "cumplimiento normativo",
  "seguridad ot",
  "alianza comercial",
  "fraude digital",
  "continuidad del negocio",
];

export function calcularScore(a: AsistenteCrudo, perfil: Perfil): number {
  let score = PUNTOS_PERFIL[perfil];

  score += PUNTOS_CANAL[sinAcentos(a.canal)] ?? 0;

  if (INDUSTRIAS_ESTRATEGICAS.includes(sinAcentos(a.industria))) score += 10;

  if (INTERESES_ALTO_VALOR.includes(sinAcentos(a.interes))) score += 10;

  return Math.min(100, score);
}

export function calcularPrioridad(score: number): Prioridad {
  if (score >= 70) return "Alta";
  if (score >= 45) return "Media";
  return "Baja";
}

/* ------------------------------------------------------------------ */
/* 3. Proyeccion de asistencia con base en el historico                */
/* ------------------------------------------------------------------ */

/**
 * Multiplicador relativo por canal de registro. Supuesto de negocio, no sale
 * del historico: al integrar el CRM debe recalcularse con datos reales.
 */
const MULTIPLICADOR_CANAL: Record<string, number> = {
  "referido ventas": 1.15,
  "invitacion directa": 1.1,
  "formulario web": 0.92,
};

export function tasaHistoricaPorFranja(franja: Franja): {
  tasa: number;
  eventos: number;
  origen: string;
} {
  const deLaFranja = HISTORICO.filter((e) => e.franja === franja && e.invitados > 0);

  if (deLaFranja.length > 0) {
    const invitados = deLaFranja.reduce((s, e) => s + e.invitados, 0);
    const asistentes = deLaFranja.reduce((s, e) => s + e.asistentes, 0);
    return {
      tasa: asistentes / invitados,
      eventos: deLaFranja.length,
      origen: `franja ${franja}`,
    };
  }

  const invitados = HISTORICO.reduce((s, e) => s + e.invitados, 0);
  const asistentes = HISTORICO.reduce((s, e) => s + e.asistentes, 0);
  return {
    tasa: asistentes / invitados,
    eventos: HISTORICO.length,
    origen: "todas las franjas (sin historico de esta franja)",
  };
}

export function proyectarAsistencia(
  asistentes: AsistenteCrudo[],
  franja: Franja,
): Proyeccion {
  const base = tasaHistoricaPorFranja(franja);

  // Se pondera cada registro por su canal: la mezcla de canales cambia la
  // asistencia esperada aunque el total de registrados sea el mismo.
  const esperadoCrudo = asistentes.reduce((suma, a) => {
    const mult = MULTIPLICADOR_CANAL[sinAcentos(a.canal)] ?? 1;
    return suma + Math.min(0.98, base.tasa * mult);
  }, 0);

  const esperados = Math.round(esperadoCrudo);
  const tasasIndividuales = HISTORICO.filter((e) => e.franja === franja && e.invitados > 0).map(
    (e) => e.asistentes / e.invitados,
  );

  const dispersion =
    tasasIndividuales.length > 1
      ? (Math.max(...tasasIndividuales) - Math.min(...tasasIndividuales)) / 2
      : 0.1;

  const notas = [
    `Tasa base ${(base.tasa * 100).toFixed(1)}% calculada sobre ${base.eventos} evento(s) historico(s) de ${base.origen}.`,
    "Cada registro se pondera por canal (referido 1.15x, invitacion directa 1.10x, formulario web 0.92x).",
    "Los multiplicadores por canal son supuestos de negocio: recalibrar con el historico real del CRM.",
  ];

  return {
    registrados: asistentes.length,
    tasaBaseFranja: base.tasa,
    eventosBase: base.eventos,
    esperados,
    rangoMin: Math.max(0, Math.round(esperadoCrudo * (1 - dispersion))),
    rangoMax: Math.min(asistentes.length, Math.round(esperadoCrudo * (1 + dispersion))),
    notas,
  };
}

/* ------------------------------------------------------------------ */
/* 4. Asignacion de leads a ejecutivos (CAM)                           */
/* ------------------------------------------------------------------ */

/**
 * Asigna cada lead al CAM especialista en su industria; si el especialista ya
 * llego a su capacidad, cae al CAM con menor carga. Los leads se recorren de
 * mayor a menor score para que los mas valiosos se queden con el especialista.
 */
export function asignarLeads(leads: Lead[]): void {
  const carga = new Map<string, number>(CAMS.map((c) => [c.id, 0]));
  const porIndustria = new Map<string, Cam>();

  for (const cam of CAMS) {
    for (const ind of cam.industrias) {
      porIndustria.set(sinAcentos(ind), cam);
    }
  }

  const ordenados = [...leads].sort((a, b) => b.score - a.score);

  for (const lead of ordenados) {
    const especialista = porIndustria.get(sinAcentos(lead.industria));
    let elegido: Cam | undefined;
    let motivo = "";

    if (especialista && (carga.get(especialista.id) ?? 0) < especialista.capacidad) {
      elegido = especialista;
      motivo = `Especialista en ${lead.industria}`;
    } else {
      // Balanceo: el CAM con menos leads asignados y capacidad disponible.
      const disponibles = CAMS.filter((c) => (carga.get(c.id) ?? 0) < c.capacidad).sort(
        (a, b) => (carga.get(a.id) ?? 0) - (carga.get(b.id) ?? 0),
      );
      elegido = disponibles[0];
      motivo = especialista
        ? `Balanceo de carga (${especialista.nombre} sin capacidad)`
        : `Balanceo de carga (sin especialista para ${lead.industria})`;
    }

    if (!elegido) {
      lead.camId = null;
      lead.camNombre = null;
      lead.motivoAsignacion = "Sin capacidad disponible en el equipo";
      continue;
    }

    carga.set(elegido.id, (carga.get(elegido.id) ?? 0) + 1);
    lead.camId = elegido.id;
    lead.camNombre = elegido.nombre;
    lead.motivoAsignacion = motivo;
  }
}

function resumirPorCam(leads: Lead[]): CargaCam[] {
  return CAMS.map((cam) => {
    const suyos = leads.filter((l) => l.camId === cam.id);
    return {
      camId: cam.id,
      nombre: cam.nombre,
      industrias: cam.industrias,
      capacidad: cam.capacidad,
      asignados: suyos.length,
      alta: suyos.filter((l) => l.prioridad === "Alta").length,
      media: suyos.filter((l) => l.prioridad === "Media").length,
      baja: suyos.filter((l) => l.prioridad === "Baja").length,
      porIndustria: suyos.some((l) => l.motivoAsignacion.startsWith("Especialista")),
    };
  });
}

/* ------------------------------------------------------------------ */
/* 5. Metricas para el sponsor                                         */
/* ------------------------------------------------------------------ */

function calcularSponsor(
  evento: EventoConfig,
  leads: Lead[],
  asistencia: Asistencia,
): MetricasSponsor {
  const perfiles: Perfil[] = ["Decisor", "Gerencial", "Tecnico"];
  const mixPerfiles = perfiles.map((perfil) => {
    const total = leads.filter((l) => l.perfil === perfil).length;
    return {
      perfil,
      total,
      porcentaje: leads.length > 0 ? (total / leads.length) * 100 : 0,
    };
  });

  const conteoIndustrias = new Map<string, number>();
  for (const lead of leads) {
    conteoIndustrias.set(lead.industria, (conteoIndustrias.get(lead.industria) ?? 0) + 1);
  }
  const topIndustrias = [...conteoIndustrias.entries()]
    .map(([industria, total]) => ({ industria, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const leadsCalificados = leads.filter((l) => l.prioridad !== "Baja").length;
  const asignados = leads.filter((l) => l.camId !== null).length;
  const decisores = mixPerfiles.find((m) => m.perfil === "Decisor");

  const resumenEjecutivo = [
    `${evento.nombre} reunio a ${asistencia.confirmados} asistentes de ${asistencia.registrados} registrados (${(asistencia.tasaReal * 100).toFixed(1)}% de conversion de registro a asistencia).`,
    `Se generaron ${leads.length} leads, de los cuales ${leadsCalificados} son calificados (prioridad alta o media) y ${decisores?.total ?? 0} corresponden a perfiles con poder de decision.`,
    `${asignados} de ${leads.length} leads quedaron con ejecutivo responsable asignado el mismo dia del evento (${leads.length > 0 ? ((asignados / leads.length) * 100).toFixed(0) : "0"}% de cobertura de seguimiento).`,
    evento.montoQ > 0
      ? `Con una inversion de Q${evento.montoQ.toLocaleString("es-GT")}, el costo por lead calificado es de Q${leadsCalificados > 0 ? Math.round(evento.montoQ / leadsCalificados).toLocaleString("es-GT") : "-"}.`
      : "No se registro monto de inversion para este evento.",
  ];

  return {
    invitados: evento.invitados,
    registrados: asistencia.registrados,
    asistentes: asistencia.confirmados,
    tasaAsistencia: asistencia.tasaReal,
    leadsGenerados: leads.length,
    leadsCalificados,
    mixPerfiles,
    topIndustrias,
    montoQ: evento.montoQ,
    costoPorAsistente:
      asistencia.confirmados > 0 ? evento.montoQ / asistencia.confirmados : 0,
    costoPorLeadCalificado: leadsCalificados > 0 ? evento.montoQ / leadsCalificados : 0,
    coberturaSeguimiento: leads.length > 0 ? (asignados / leads.length) * 100 : 0,
  resumenEjecutivo,
  };
}

/* ------------------------------------------------------------------ */
/* 6. Orquestador                                                      */
/* ------------------------------------------------------------------ */

export function procesarEvento(
  asistentes: AsistenteCrudo[],
  evento: EventoConfig,
  advertenciasPrevias: string[] = [],
): Resultado {
  const advertencias = [...advertenciasPrevias];

  const proyeccion = proyectarAsistencia(asistentes, evento.franja);

  const confirmados = asistentes.filter((a) => a.checkIn);
  const asistencia: Asistencia = {
    registrados: asistentes.length,
    confirmados: confirmados.length,
    noShow: asistentes.length - confirmados.length,
    tasaReal: asistentes.length > 0 ? confirmados.length / asistentes.length : 0,
    desviacionVsProyeccion: confirmados.length - proyeccion.esperados,
  };

  // Solo quien asistio se convierte en lead: el resto queda para renurturing.
  const leads: Lead[] = confirmados.map((a, i) => {
    const perfil = clasificarPerfil(a.cargo);
    const score = calcularScore(a, perfil);
    return {
      ...a,
      id: `lead-${String(i + 1).padStart(3, "0")}`,
      perfil,
      score,
      prioridad: calcularPrioridad(score),
      camId: null,
      camNombre: null,
      motivoAsignacion: "",
      estatus: "Pendiente",
    };
  });

  asignarLeads(leads);

  const perfiles: Perfil[] = ["Decisor", "Gerencial", "Tecnico"];
  const segmentacion = perfiles.map((perfil) => ({
    perfil,
    registrados: asistentes.filter((a) => clasificarPerfil(a.cargo) === perfil).length,
    asistentes: leads.filter((l) => l.perfil === perfil).length,
  }));

  const sinAsignar = leads.filter((l) => l.camId === null).length;
  if (sinAsignar > 0) {
    advertencias.push(
      `${sinAsignar} lead(s) quedaron sin ejecutivo: la capacidad total del equipo (${CAMS.reduce((s, c) => s + c.capacidad, 0)}) es menor que el numero de leads.`,
    );
  }

  if (evento.invitados > 0 && asistentes.length > evento.invitados) {
    advertencias.push(
      `Hay mas registrados (${asistentes.length}) que invitados declarados (${evento.invitados}); revisar el numero de invitados del evento.`,
    );
  }

  return {
    evento,
    proyeccion,
    asistencia,
    segmentacion,
    leads,
    porCam: resumirPorCam(leads),
    sponsor: calcularSponsor(evento, leads, asistencia),
    advertencias,
  };
}
