# 📐 Planteamiento — Equipo 07

## 1. Equipo

- **Número de equipo:** 07
- **Integrantes:** Equipo 7 — Convivencia Septiembre
- **Nombre del prototipo:** Checklist preventa-comercial v1.0
- **Rol principal que resuelve:** Arquitecto de Operaciones y Preventa de Ciberseguridad

## 2. El problema

- **¿Qué reporte/proceso es?** La toma de requerimientos y cotización inicial de servicios de ciberseguridad (scoping de preventa).
- **¿Quién lo sufre y con qué frecuencia?** El equipo Comercial (pierde tiempo y asume riesgos) y el equipo de Operaciones/Delivery (hereda alcances mal definidos y falta de insumos) — en **cada nueva oportunidad de venta**.
- **¿Cuánto tiempo toma hoy y por qué?** Más de 8 horas por semana entre el comercial y preventa: se cotiza a ciegas, se consulta por chat cuántas horas lleva cada servicio y se rearma la propuesta cuando aparecen requisitos olvidados.
- **¿Qué es lo peor del proceso actual?** La omisión de variables técnicas críticas — los **"costos ocultos"**: rondas de re-testing, ventanas nocturnas o de fin de semana, integraciones (SSO, AD/LDAP, Syslog), presentación a C-Level, accesos y reglas de firewall. Eso reduce la rentabilidad del proyecto y genera fricción con el cliente por re-cotizaciones y retrasos.

## 3. La solución

- **¿Qué hace?** Un formulario web estructurado y **condicional** que mapea los requisitos técnicos, insumos, accesos y horas de ingeniería exactas según el servicio seleccionado, y calcula el esfuerzo en tiempo real.
- **¿Qué deja de hacer el humano gracias a esto?** El comercial deja de "adivinar" tiempos de ingeniería y deja de olvidar preguntar por prerrequisitos (reglas de firewall, VPN, credenciales, ventanas de mantenimiento).
- **¿Dónde encajaría en la futura plataforma unificada?** Es el **motor de cálculo y validación de alcance** en la etapa de preventa: alimenta la propuesta comercial y, más adelante, se expone como módulo del CRM.

## 4. El flujo

1. **Entrada:** respuestas del cliente obtenidas con las **5 preguntas clave del Cheat Sheet** comercial (ver §7).
2. **Proceso:** el asesor ingresa los datos en el Checklist preventa-comercial — selecciona categoría y servicio, y llena las métricas de dimensionamiento; la matriz aplica multiplicadores y horas adicionales según cada variable.
3. **Salida:** estimación de **horas de ingeniería desglosadas** (levantamiento, ejecución, informe, PM), listado de **entregables** y **checklist de prerrequisitos técnicos** listo para adjuntar a la propuesta comercial.
4. **¿Quién valida?** **Preventa** revisa el output antes de que Comercial envíe la cotización final.

```
[Cheat Sheet: 5 preguntas] ──▶ [Checklist: servicio + volúmenes] ──▶ [Motor de cálculo] ──▶ [Horas + entregables + prerrequisitos]
```

## 5. Alcance del prototipo de HOY

- **Hoy SÍ se demuestra:**
  1. Formulario web con las **5 secciones** de la matriz y campos condicionales según el servicio elegido.
  2. **Cálculo automático de horas** (con multiplicadores de ventana, re-testing, integraciones y presentación ejecutiva) actualizándose en vivo.
  3. **Resumen imprimible** de scoping: horas desglosadas, entregables y checklist de prerrequisitos.
- **Hoy NO (queda para después):**
  - Integración automatizada con el CRM (Salesforce / HubSpot).
  - Generación automática del PDF de la propuesta comercial.
  - Catálogo completo de servicios (hoy solo los del caso de demo) y tarifas/precios.
- **Datos de entrada para la demo:** caso sintético **ACME Corp S.A.** — Pentest Web Gray Box (50 IPs públicas, 3 apps transaccionales) + despliegue de EDR, ventana de fin de semana, 1 ronda de re-testing y presentación a Junta Directiva.

> Nota de alcance: la matriz de §6 se implementa como formulario web (requisito del reto: prototipo web en local). El export a Excel/CSV con las mismas columnas y fórmulas queda como salida secundaria si da tiempo.

## 6. Matriz de dimensionamiento técnico (especificación del formulario)

### 6.1 Datos generales y contexto

| Variable | Tipo | Opciones sugeridas | Ejemplo |
|---|---|---|---|
| Nombre del cliente | Texto | N/A | ACME Corp S.A. |
| Industria | Selección | Financiera, Retail, Salud, Gobierno, Tecnología, Manufactura | Financiera |
| Driver / Motivo | Selección | Cumplimiento/Auditoría, Incidente reciente, Iniciativa proactiva, Renovación anual | Cumplimiento/Auditoría |
| Fecha límite propuesta | Fecha | N/A | 25/09/2026 |
| Fecha inicio proyecto | Fecha | N/A | 15/10/2026 |

### 6.2 Clasificación del servicio

| Variable | Tipo | Opciones sugeridas | Ejemplo |
|---|---|---|---|
| Categoría principal | Selección | Evaluaciones de Seguridad, Implementación, Consultoría y Gobierno, Soporte | Evaluaciones de Seguridad |
| Servicio específico | Selección (dependiente) | Pentest Web, Pentest Red, EDR, NDR, ISO 27001, PCI-DSS | Pentest Web |
| Modalidad | Selección | Black Box, Gray Box, White Box, N/A | Gray Box |

### 6.3 Dimensionamiento técnico (condicional según el servicio)

| Variable | Tipo | Opciones | Ejemplo | Ayuda / Fórmula |
|---|---|---|---|---|
| Volumen de activos | Número | IPs, endpoints, servidores | 50 (IPs públicas) | `SI(Categoría="Evaluaciones"; base * activos; 0)` |
| Volumen de aplicaciones / APIs | Número | N/A | 3 (apps transaccionales) | Suma ponderada según complejidad |
| Volumen de logs / EPS | Número | Para SIEM / NDR | 5,000 EPS | Define tamaño de appliance / licencia |
| N.º de usuarios / sedes | Número | Para consultoría | 250 usuarios / 3 sedes | Multiplicador de entrevistas / auditorías |
| Integraciones requeridas | Selección múltiple | SSO (SAML/OIDC), AD/LDAP, Syslog, API/Ticketing (Jira/ServiceNow), Ninguna | SSO, AD/LDAP | `CONTARA(celdas) * X horas adicionales` |

### 6.4 Variables de esfuerzo y entregables (cálculo de horas)

| Variable | Tipo | Opciones | Ejemplo | Ayuda / Fórmula |
|---|---|---|---|---|
| Rondas de re-testing | Número | 0, 1, 2 | 1 | `horas_ejecución * 0.20 * rondas` |
| Ventana de ejecución | Selección | Horario hábil, Nocturno, Fin de semana | Fin de semana | `SI(ventana="Fin de semana"; horas*1.5; horas)` |
| Presentación ejecutiva | Selección | Sí (C-Level/Directiva), No (solo técnico) | Sí (C-Level/Directiva) | `SI(presentación="Sí"; +4 h PM/Consultor; 0)` |
| Total horas proyectadas | Fórmula | Cálculo automático | 45 horas | `SUMA(levantamiento; ejecución; informe; PM)` |

### 6.5 Riesgos, prerrequisitos y asunciones

| Variable | Tipo | Opciones | Ejemplo |
|---|---|---|---|
| Accesos confirmados | Selección múltiple | VPN cliente, Credenciales admin, Consola de terceros, IPs permitidas | VPN cliente, Credenciales admin |
| Dependencias del cliente | Texto largo | N/A | "El cliente debe abrir el puerto 443 en el FW perimetral antes del Día 1" |
| Nivel de madurez actual | Selección | Desde cero (Greenfield), Reemplazo/Migración, Optimización | Desde cero (Greenfield) |

## 7. Cheat Sheet comercial (5 preguntas tácticas)

El vendedor **no llena la matriz frente al cliente**: conversa con estas 5 preguntas y llena el checklist post-llamada.

1. **Driver** — "¿Cuál es el motivo principal de este proyecto: una auditoría inminente o una iniciativa interna?" → llena §6.1
2. **Alcance** — "¿Cuántos servidores, usuarios o aplicaciones exactas entran en la revisión?" → llena §6.3
3. **Tiempos** — "¿Tienen fecha límite estricta para tenerlo en producción?" → llena §6.1 y §6.4 (define nocturno / fin de semana)
4. **Entregables** — "¿Requieren que sustentemos los resultados ante Gerencia o Junta Directiva?" → llena §6.4 (horas de PM / presentación)
5. **Fricción operativa** — "¿Contamos con accesos (VPN/credenciales) desde el día 1, o TI requiere procesos largos de aprobación?" → llena §6.5

## 8. Reparto rápido

- **Agente / código:** —
- **Datos y prueba del flujo:** —
- **Pitch y demo:** —
