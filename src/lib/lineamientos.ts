/**
 * Catálogo de los Lineamientos de Seguridad para los Participantes en las
 * Cámaras de Compensación Bancaria y Automatizada (Marco de Referencia v2023, ICG).
 *
 * Jerarquía: Principio ─▶ Objetivo ─▶ Control
 * Los controles son la unidad que se evalúa; principios y objetivos se calculan
 * a partir de ellos (ver src/lib/evaluacion.ts).
 *
 * Fuente: docs/DOC.md (numeral 11, descripción detallada de los controles).
 */

export type Control = {
  /** Código del control, ej. "11.2.5" */
  id: string;
  nombre: string;
  /** Enunciado del control tal como aparece en el lineamiento. */
  descripcion: string;
};

export type Objetivo = {
  /** Código del objetivo, ej. "11.2" */
  id: string;
  nombre: string;
  controles: Control[];
};

export type Principio = {
  id: string;
  nombre: string;
  objetivos: Objetivo[];
};

export const PRINCIPIOS: Principio[] = [
  {
    id: "P1",
    nombre: "Conocer y asegurar su entorno",
    objetivos: [
      {
        id: "11.1",
        nombre: "Segregación de ambientes y control de acceso a internet",
        controles: [
          {
            id: "11.1.1",
            nombre: "Segregación de ambientes y zonas seguras",
            descripcion:
              "Definir y mantener una zona segura segregada para disminuir o mitigar el compromiso ante cualquier ataque, tanto desde la red interna como externa del participante a la infraestructura relacionada a la interconexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.1.2",
            nombre: "Proteger las plataformas de virtualización",
            descripcion:
              "Proteger las plataformas de virtualización y las máquinas virtuales que alojan componentes relacionados con las Cámaras de Compensación.",
          },
        ],
      },
      {
        id: "11.2",
        nombre: "Mitigación de vulnerabilidades y ataques físicos y lógicos",
        controles: [
          {
            id: "11.2.1",
            nombre: "Seguridad en el flujo de datos",
            descripcion:
              "Implementar mecanismos para proteger la confidencialidad, integridad, disponibilidad y autenticación en los flujos de datos.",
          },
          {
            id: "11.2.2",
            nombre: "Hardening de sistemas",
            descripcion:
              "Definir un procedimiento formal de hardening para la infraestructura relacionada a la interconexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.2.3",
            nombre: "Licenciamiento y actualización de seguridad de software",
            descripcion:
              "Mantener el licenciamiento, soporte y aplicar de manera oportuna los parches y las actualizaciones de seguridad a todo hardware y software relacionado a la interconexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.2.4",
            nombre: "Gestión de cambios",
            descripcion:
              "Contar con procedimientos para cualquier cambio en la infraestructura relacionada con la interconexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.2.5",
            nombre: "Análisis de vulnerabilidades",
            descripcion:
              "Identificar, evaluar y dar tratamiento oportuno a las vulnerabilidades técnicas de la infraestructura relacionada con la interconexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.2.6",
            nombre: "Protección Antimalware",
            descripcion:
              "Implementar y gestionar un sistema antimalware para proteger los sistemas relacionados con la conexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.2.7",
            nombre: "Hardening de aplicaciones",
            descripcion:
              "Realizar comprobaciones de todas las aplicaciones previo, durante y posterior a su instalación relacionadas con las Cámaras de Compensación, reduciendo capacidades, características y protocolos usables durante un ataque.",
          },
        ],
      },
      {
        id: "11.3",
        nombre: "Detección de actividades anómalas",
        controles: [
          {
            id: "11.3.1",
            nombre: "Gestión de bitácoras",
            descripcion:
              "Registrar todos los eventos de los sistemas asociados con las Cámaras de Compensación.",
          },
          {
            id: "11.3.2",
            nombre: "Integridad de software",
            descripcion:
              "Realizar comprobaciones de integridad al software instalado en la infraestructura relacionada con las Cámaras de Compensación (servidores, equipos de cómputo operativo, entre otros).",
          },
          {
            id: "11.3.3",
            nombre: "Integridad de base de datos",
            descripcion:
              "Realizar comprobaciones de integridad a las bases de datos de los sistemas relacionados con la operación de las Cámaras de Compensación.",
          },
          {
            id: "11.3.4",
            nombre: "Pruebas de Pentest",
            descripcion:
              "Llevar a cabo pruebas de penetración cuyo alcance contemple los activos: servidores, equipos de telecomunicaciones, equipos operativos de usuarios y los sistemas relacionados con las Cámaras de Compensación.",
          },
        ],
      },
      {
        id: "11.4",
        nombre: "Aseguramiento del entorno físico",
        controles: [
          {
            id: "11.4.1",
            nombre: "Seguridad y accesos físicos",
            descripcion:
              "Implementar controles de seguridad física para la protección de la infraestructura relacionada con las Cámaras de Compensación.",
          },
        ],
      },
    ],
  },
  {
    id: "P2",
    nombre: "Conocer y gestionar accesos",
    objetivos: [
      {
        id: "11.5",
        nombre: "Control de accesos y administración de personal e identidades",
        controles: [
          {
            id: "11.5.1",
            nombre: "Gestión de personal",
            descripcion:
              "Asegurar que los colaboradores y proveedores comprendan sus responsabilidades respecto a la seguridad de la información y que sus roles sean consistentes con sus capacidades y con la información que acceden.",
          },
          {
            id: "11.5.2",
            nombre: "Políticas de contraseñas",
            descripcion:
              "Establecer reglas para la implementación de contraseñas seguras en la infraestructura relacionada con las Cámaras de Compensación (mínimo 12 caracteres, 4 tipos de caracteres, cambio cada 60 días, no reutilizar las últimas 6, bloqueo a los 3 intentos fallidos).",
          },
          {
            id: "11.5.3",
            nombre: "Gestión de accesos lógicos",
            descripcion:
              "Contar con un proceso de gestión de accesos lógicos para la protección de la información relacionada con las Cámaras de Compensación, bajo el principio de menor privilegio.",
          },
          {
            id: "11.5.4",
            nombre: "Autenticación Multifactor (MFA)",
            descripcion:
              "Implementar un sistema de autenticación multifactor tomando en cuenta: algo que tienes, algo que sabes y algo que eres.",
          },
        ],
      },
    ],
  },
  {
    id: "P3",
    nombre: "Conocer y gestionar Terceros",
    objetivos: [
      {
        id: "11.6",
        nombre: "Gestión de proveedores y actividades subcontratadas",
        controles: [
          {
            id: "11.6.1",
            nombre: "Gestión de proveedores",
            descripcion:
              "Establecer una debida gestión de proveedores con el fin de asegurar que sus aportes contribuyan a que los participantes puedan operar cumpliendo con los niveles de servicio y horarios establecidos.",
          },
        ],
      },
    ],
  },
  {
    id: "P4",
    nombre: "Gestión de Ciber resiliencia",
    objetivos: [
      {
        id: "11.7",
        nombre:
          "Prevención, detección, respuesta y recuperación a incidentes",
        controles: [
          {
            id: "11.7.1",
            nombre: "Gestión de riesgos",
            descripcion:
              "Identificar, analizar, evaluar y dar tratamiento a los riesgos que puedan afectar los servicios de las Cámaras de Compensación, incluyendo matriz de riesgos y mapa de calor.",
          },
          {
            id: "11.7.2",
            nombre: "Gestión de incidentes",
            descripcion:
              "Establecer responsabilidades y procedimientos para la gestión de incidentes de seguridad de la información relacionados con la interconexión y operación de las Cámaras de Compensación.",
          },
          {
            id: "11.7.3",
            nombre: "Gestión de continuidad del negocio",
            descripcion:
              "Definir y establecer los requisitos de seguridad de la información y continuidad del negocio en situaciones adversas, mediante un proceso formal de recuperación de servicios y sistemas (BIA, RTO, RPO, MBCO, MTPD, planes y pruebas).",
          },
          {
            id: "11.7.4",
            nombre: "Ciberseguridad",
            descripcion:
              "Gestionar la ciberseguridad bajo las funciones Identificar, Proteger, Detectar, Responder y Recuperar sobre los activos en el ciberespacio que soportan los servicios de las Cámaras de Compensación.",
          },
        ],
      },
    ],
  },
];

/** Todos los controles en una sola lista plana, con su objetivo y principio. */
export const CONTROLES_PLANOS = PRINCIPIOS.flatMap((principio) =>
  principio.objetivos.flatMap((objetivo) =>
    objetivo.controles.map((control) => ({
      ...control,
      objetivoId: objetivo.id,
      objetivoNombre: objetivo.nombre,
      principioId: principio.id,
      principioNombre: principio.nombre,
    })),
  ),
);

export const TOTAL_CONTROLES = CONTROLES_PLANOS.length;

export function buscarControl(id: string) {
  return CONTROLES_PLANOS.find((c) => c.id === id);
}
