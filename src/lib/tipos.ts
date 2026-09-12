export type Equipo = "CSC" | "Ingeniería" | "Consulting";

/** Las tres áreas del pitch, en el orden en que se muestran. */
export const EQUIPOS: Equipo[] = ["Ingeniería", "CSC", "Consulting"];

/**
 * Las tres categorías con las que trabaja la matriz de habilidades de
 * Ingeniería (ver docs/PLANTEAMIENTO.md §Modelo de datos).
 */
export type CategoriaSkill = "technical" | "solutions" | "soft";

export type Skill = {
  id: string;
  nombre: string;
  categoria: CategoriaSkill;
};

/**
 * Escala 0–3 de la matriz real:
 * 0 no tiene · 1 básico (con supervisión) · 2 intermedio (autónomo)
 * · 3 avanzado (puede liderar, entrenar y diseñar).
 */
export type Nivel = 0 | 1 | 2 | 3;

export const NIVEL_MAX = 3;

/** El nivel de una persona en un skill. Si no aparece, es 0. */
export type PersonaSkill = {
  skillId: string;
  nivel: Nivel;
};

export type Certificacion = {
  nombre: string;
  /** Fecha ISO (YYYY-MM-DD) de emisión. */
  emitida: string;
  /** Fecha ISO (YYYY-MM-DD) de vencimiento. */
  vence: string;
  /**
   * Nombre del archivo adjunto (el diploma). En el prototipo es solo el
   * nombre: no se sube ni se guarda el binario.
   */
  archivo: string | null;
};

/** De dónde salieron los datos de esta persona. Se muestra en su perfil. */
export type OrigenDatos =
  | "sintetico"
  | "sintetico-pendiente-excel"
  | "escenario-pitch"
  | "alta-en-plataforma";

/** El perfil tal como está guardado en `data/colaboradores.json`. */
export type PersonaGuardada = {
  id: string;
  nombre: string;
  equipo: Equipo;
  /** La "Posición" del pitch. */
  rol: string;
  descripcion: string;
  /** Nivel de educación. */
  educacion: string;
  /** Fecha ISO de ingreso a ES Consulting. */
  ingreso: string;
  /** URL o ruta de la foto. `null` → se dibujan las iniciales. */
  foto: string | null;
  idiomas: string[];
  origen: OrigenDatos;
  skills: PersonaSkill[];
  certificaciones: Certificacion[];
};

/**
 * El perfil como lo consume la app: igual al guardado más la carga y la
 * disponibilidad, que **no se guardan** — se derivan de las asignaciones a
 * proyectos en ejecución (ver `src/lib/datos.ts`).
 */
export type Persona = PersonaGuardada & {
  /** % del tiempo comprometido en proyectos en ejecución. */
  carga: number;
  /** % de tiempo libre para tomar proyecto nuevo. `100 − carga`. */
  disponibilidad: number;
};

export type EstadoProyecto = "oportunidad" | "en-ejecucion" | "cerrado";

export type Asignacion = {
  personaId: string;
  rolProyecto: string;
  /** % del tiempo de la persona comprometido en este proyecto. */
  dedicacion: number;
};

export type Proyecto = {
  id: string;
  nombre: string;
  cliente: string;
  /** Área dueña del proyecto. */
  area: Equipo;
  estado: EstadoProyecto;
  inicio: string;
  fin: string;
  descripcion: string;
  /** Requisitos escritos como los pide el cliente; se pasan al buscador. */
  requisitos: string;
  asignaciones: Asignacion[];
};

/** Cómo se lee cada nivel de la escala. Viene del JSON, no se hardcodea. */
export type EscalaNivel = {
  nivel: Nivel;
  etiqueta: string;
  corto: string;
};

/** Punteo por área y categoría en un mes, para el comparativo mes a mes. */
export type HistorialMes = {
  /** YYYY-MM */
  mes: string;
  punteos: Record<Equipo, Record<CategoriaSkill, number>>;
};

export type Inventario = {
  nota: string;
  generado: string;
  escala: EscalaNivel[];
  skills: Skill[];
  personas: Persona[];
  proyectos: Proyecto[];
  historial: HistorialMes[];
};

/** El JSON crudo, antes de derivar carga y disponibilidad. */
export type InventarioGuardado = Omit<Inventario, "personas"> & {
  personas: PersonaGuardada[];
};

/**
 * Un requisito de la licitación ya resuelto: o cae en un skill del catálogo,
 * o es un idioma (los idiomas viven en la persona, no en el catálogo).
 */
export type Requisito =
  | { tipo: "skill"; textoOriginal: string; etiqueta: string; skill: Skill }
  | { tipo: "idioma"; textoOriginal: string; etiqueta: string; idioma: string };

/** Cómo cubre una persona un requisito puntual. */
export type Cobertura = {
  requisito: Requisito;
  /** 0–3. 0 = no lo tiene registrado. */
  nivel: number;
  /** Certificación vigente relacionada con el requisito, si la hay. */
  certificacion: Certificacion | null;
};

/** Suma de niveles de la persona en cada categoría. Se calcula, no se guarda. */
export type Punteos = Record<CategoriaSkill, number>;

export type Candidato = {
  persona: Persona;
  /** 0–100. */
  score: number;
  coberturas: Cobertura[];
  /** Cuántos requisitos cubre con nivel ≥ 1. */
  requisitosCubiertos: number;
  /** Cuántos requisitos respalda con certificación vigente. */
  requisitosCertificados: number;
};

export type ResultadoBusqueda = {
  consulta: string;
  requisitos: Requisito[];
  /** Términos que no se pudieron mapear a ningún skill ni idioma. */
  noReconocidos: string[];
  candidatos: Candidato[];
};
