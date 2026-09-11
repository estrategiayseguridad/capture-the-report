export type Franja = "matutino" | "vespertino" | "nocturno" | "jornada";

export type Perfil = "Decisor" | "Gerencial" | "Tecnico";

export type Prioridad = "Alta" | "Media" | "Baja";

export const ESTATUS_LEAD = [
  "Pendiente",
  "Contactado",
  "Reunion agendada",
  "Oportunidad",
  "Descartado",
] as const;

export type EstatusLead = (typeof ESTATUS_LEAD)[number];

/** Configuracion del evento que se esta analizando (la llena el usuario en la UI). */
export interface EventoConfig {
  nombre: string;
  fecha: string;
  lugar: string;
  franja: Franja;
  tipo: "Propio" | "Sponsor";
  invitados: number;
  montoQ: number;
}

/** Fila del CSV ya normalizada. */
export interface AsistenteCrudo {
  nombre: string;
  email: string;
  empresa: string;
  cargo: string;
  industria: string;
  telefono: string;
  canal: string;
  fechaRegistro: string;
  checkIn: boolean;
  interes: string;
}

export interface Lead extends AsistenteCrudo {
  id: string;
  perfil: Perfil;
  score: number;
  prioridad: Prioridad;
  camId: string | null;
  camNombre: string | null;
  motivoAsignacion: string;
  estatus: EstatusLead;
}

export interface Cam {
  id: string;
  nombre: string;
  industrias: string[];
  capacidad: number;
}

export interface EventoHistorico {
  id: string;
  nombre: string;
  trimestre: number;
  horario: string;
  franja: Franja;
  tipo: string;
  invitados: number;
  asistentes: number;
  montoQ: number;
}

export interface Proyeccion {
  registrados: number;
  tasaBaseFranja: number;
  eventosBase: number;
  esperados: number;
  rangoMin: number;
  rangoMax: number;
  notas: string[];
}

export interface Asistencia {
  registrados: number;
  confirmados: number;
  noShow: number;
  tasaReal: number;
  desviacionVsProyeccion: number;
}

export interface CargaCam {
  camId: string;
  nombre: string;
  industrias: string[];
  capacidad: number;
  asignados: number;
  alta: number;
  media: number;
  baja: number;
  porIndustria: boolean;
}

export interface MetricasSponsor {
  invitados: number;
  registrados: number;
  asistentes: number;
  tasaAsistencia: number;
  leadsGenerados: number;
  leadsCalificados: number;
  mixPerfiles: { perfil: Perfil; total: number; porcentaje: number }[];
  topIndustrias: { industria: string; total: number }[];
  montoQ: number;
  costoPorAsistente: number;
  costoPorLeadCalificado: number;
  coberturaSeguimiento: number;
  resumenEjecutivo: string[];
}

export interface Resultado {
  evento: EventoConfig;
  proyeccion: Proyeccion;
  asistencia: Asistencia;
  segmentacion: { perfil: Perfil; registrados: number; asistentes: number }[];
  leads: Lead[];
  porCam: CargaCam[];
  sponsor: MetricasSponsor;
  advertencias: string[];
}
