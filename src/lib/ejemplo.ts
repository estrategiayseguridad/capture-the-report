/**
 * Evaluación sintética para la demo. Datos ficticios (Banco Demo, S.A.),
 * ningún dato real de cliente.
 */

import {
  Clasificacion,
  Evaluacion,
  NivelMadurez,
  evaluacionVacia,
} from "./evaluacion";

type Fila = [string, Clasificacion, NivelMadurez, string, string];

const FILAS: Fila[] = [
  [
    "11.1.1",
    "cumple",
    "Administrado",
    "Existe zona segura segregada por firewall y servidor de salto dedicado. Se evidenció el último Firewall Assessment (marzo 2026).",
    "El participante mantiene bitácora de cambios de reglas. Pendiente formalizar la revisión semestral.",
  ],
  [
    "11.1.2",
    "cumple",
    "Definido",
    "Hipervisor con hardening aplicado y MFA a nivel de sistema operativo. Los escaneos de vulnerabilidades incluyen las plataformas de virtualización.",
    "Gestión de capacidades se lleva en hoja de cálculo; se recomienda herramienta de monitoreo.",
  ],
  [
    "11.2.1",
    "cumple",
    "Administrado",
    "Canales TLS 1.2+ entre agencias y central de procesamiento. Certificados PKI renovados anualmente.",
    "Diagrama de flujo PKI actualizado en junio 2026.",
  ],
  [
    "11.2.2",
    "cumple",
    "Repetible",
    "Guía de hardening basada en CIS Benchmarks para servidores Windows y Linux.",
    "No cubre switches ni routers de la zona segura.",
  ],
  [
    "11.2.3",
    "no-cumple",
    "Inicio",
    "No se evidenció inventario de licencias con los campos mínimos requeridos. Parches CVSS 7+ aplicados fuera del plazo de 2 meses en 3 de 8 servidores muestreados.",
    "El participante indica que el inventario está en construcción con fecha compromiso a noviembre 2026.",
  ],
  [
    "11.2.4",
    "cumple",
    "Definido",
    "Procedimiento de gestión de cambios con autorización documentada y plan de rollback.",
    "Los cambios de emergencia se registran de forma retroactiva.",
  ],
  [
    "11.2.5",
    "no-cumple",
    "Inicio",
    "Escaneos de vulnerabilidades realizados una vez al año; no se ejecutaron después de los cambios significativos de mayo 2026.",
    "Se cotizó licencia de escáner con cobertura del segmento completo.",
  ],
  [
    "11.2.6",
    "cumple",
    "Administrado",
    "Solución EDR licenciada en 100% de servidores y equipos operativos, con tareas programadas semanales.",
    "Revisión de bitácoras del antimalware documentada mensualmente.",
  ],
  [
    "11.2.7",
    "no-cumple",
    "No controlable",
    "No existe procedimiento de hardening de aplicaciones; se identificaron credenciales por defecto en la consola de administración de un componente middleware.",
    "Hallazgo crítico. Requiere remediación inmediata.",
  ],
  [
    "11.3.1",
    "cumple",
    "Definido",
    "Bitácoras centralizadas con los cinco campos mínimos, retención de 12 meses y 3 meses en línea. Sincronización NTP confirmada.",
    "Falta alerta automática ante detención del servicio de auditoría.",
  ],
  [
    "11.3.2",
    "no-cumple",
    "Inicio",
    "La verificación de integridad de archivos críticos se ejecuta manualmente y sin periodicidad definida.",
    "Se evalúa implementar FIM durante el siguiente trimestre.",
  ],
  [
    "11.3.3",
    "cumple",
    "Repetible",
    "Pistas de auditoría activas sobre la base de datos transaccional y lista de administradores autorizada.",
    "Backups probados trimestralmente.",
  ],
  [
    "11.3.4",
    "cumple",
    "Definido",
    "Pentest anual ejecutado por tercero (febrero 2026) en ventana fuera de horario de liquidación. Brechas altas remediadas.",
    "Dos hallazgos medios permanecen abiertos con plan de acción.",
  ],
  [
    "11.4.1",
    "cumple",
    "Administrado",
    "Centro de datos con control de acceso biométrico, CCTV con retención de 90 días, controles ambientales y supresión de incendios.",
    "Registro de visitantes completo en la muestra revisada.",
  ],
  [
    "11.5.1",
    "cumple",
    "Repetible",
    "Expedientes completos en la muestra de 10 colaboradores. Convenios de confidencialidad firmados.",
    "La evaluación anual de competencias no se ha ejecutado en 2026.",
  ],
  [
    "11.5.2",
    "no-cumple",
    "Inicio",
    "Política vigente exige 8 caracteres y bloqueo a los 5 intentos fallidos, por debajo del mínimo de 12 caracteres y 3 intentos.",
    "Cambio de política programado en el directorio activo.",
  ],
  [
    "11.5.3",
    "cumple",
    "Definido",
    "Gestión de accesos lógicos con menor privilegio, revisión anual de cuentas e identificadores únicos.",
    "El procedimiento de acceso de emergencia existe pero no se ha probado.",
  ],
  [
    "11.5.4",
    "cumple",
    "Administrado",
    "MFA implementado en sistemas operativos y aplicaciones del alcance, con inventario de tokens por colaborador.",
    "Proceso de revocación de MFA integrado a la baja de personal.",
  ],
  [
    "11.6.1",
    "no-cumple",
    "Inicio",
    "Proveedores clasificados por criticidad, pero no se evidenció la evaluación anual de los 4 proveedores críticos.",
    "Cláusulas de confidencialidad sí están presentes en los contratos revisados.",
  ],
  [
    "11.7.1",
    "cumple",
    "Definido",
    "Matriz de riesgos y mapa de calor actualizados, con criterios de aceptación de riesgo residual aprobados por el comité.",
    "Tratamiento de riesgos altos en ejecución.",
  ],
  [
    "11.7.2",
    "cumple",
    "Administrado",
    "Gestión de incidentes documentada, con planes de respuesta probados en abril 2026.",
    "Tiempos de respuesta dentro de los umbrales definidos.",
  ],
  [
    "11.7.3",
    "no-cumple",
    "Inicio",
    "Existe BIA pero sin RTO/RPO definidos para la CCA. No hay programa anual de pruebas del data center alterno.",
    "Ejercicio de continuidad planificado para el cuarto trimestre.",
  ],
  [
    "11.7.4",
    "no-cumple",
    "Repetible",
    "Monitoreo de activos en el ciberespacio sin SOC (interno ni tercerizado) y sin membresía en un CERT.",
    "Se encuentra en proceso de contratación de SOC gestionado.",
  ],
];

export function evaluacionEjemplo(): Evaluacion {
  const evaluacion = evaluacionVacia();
  evaluacion.entidad = {
    participante: "Banco Demo, S.A.",
    auditor: "Equipo 11 — ES Consulting",
    fecha: "2026-09-11",
    alcance:
      "Capa de intercambio de datos con la CCB y la CCA: zona segura, servidores, sistemas operativos, aplicaciones, tokens y certificados, estaciones operativas y usuarios administradores. Ambientes de desarrollo, pruebas y producción.",
  };
  for (const [id, clasificacion, nivelMadurez, observaciones, comentarios] of FILAS) {
    evaluacion.controles[id] = {
      clasificacion,
      nivelMadurez,
      observaciones,
      comentarios,
    };
  }
  return evaluacion;
}
