# 📐 Planteamiento — Equipo 05

## 1. Equipo

- **Número de equipo:** 05
- **Integrantes:** Nadia, Denis, Isra, Daniel, Luis
- **Nombre del prototipo:** **ProdigiES** — el radar de talento de ES Consulting
  _(nombre formal ya decidido por el equipo; antes se trabajó como "SkillRadar")_

## 2. El problema

**¿Qué reporte/proceso es?**
Responder la pregunta *"¿quién de la casa puede hacer esto?"*. Hoy no existe un repositorio
centralizado y actualizado de las habilidades y competencias de los colaboradores de **CSC,
Ingeniería y Consulting**. Cada vez que se necesita saber quién califica para algo, se arma a
mano: correos y mensajes a los líderes de los tres equipos, memoria personal de quién hizo qué,
y revisión de CVs sueltos.

**¿Quién lo sufre y con qué frecuencia?** La falta de visibilidad golpea en tres niveles:

| Área | Qué no puede hacer hoy |
|------|------------------------|
| **Comercial / Ventas** | Identificar rápido al personal calificado para dimensionar proyectos y sacar propuestas y licitaciones **a tiempo**. Cada oportunidad nueva reabre la misma búsqueda manual. |
| **Gestión de Proyectos (PM)** | Analizar la carga de trabajo (*workload*) y asignar el recurso adecuado a cada proyecto, por no tener las capacidades individuales en un solo lugar. |
| **RRHH** | Detectar brechas de conocimiento (*skill gaps*), planificar estratégicamente las próximas certificaciones y ubicar practicantes y nuevos colaboradores donde suman. |

**¿Cuánto tiempo toma hoy y por qué?**
_Estimación de trabajo, a validar con Comercial antes del pitch:_ entre **3 y 5 horas de trabajo
efectivo por propuesta**, repartidas en **1 o 2 días calendario** — porque el tiempo real no se va
buscando, se va **esperando** que los líderes de los tres equipos contesten. Con varias licitaciones
al mes, el costo se multiplica.

**¿Qué es lo peor del proceso actual?**
Que la respuesta depende de a quién le preguntaste y de qué se acordó ese día. Se propone a la
persona que alguien recordó, no necesariamente a la que mejor califica — y a veces se subcontrata
o se declina una oportunidad por una capacidad que **sí existía adentro** y nadie tenía visible.

## 3. La solución

**Visión — a dónde va:** una **plataforma centralizada de gestión de habilidades y cargabilidad**,
centrada en el talento humano y sus competencias, que mantiene una **matriz de habilidades en tiempo
real** para que Comercial, PM y RRHH decidan sobre el mismo dato en lugar de sobre conocimiento
disperso.

**Qué hace el prototipo — lo de hoy:**
La plataforma navegable con los **8 menús del pitch**, recorriendo el ciclo completo del escenario
(§4b): RRHH da de alta a alguien y califica sus habilidades → Comercial busca quién califica para una
licitación → PM adjudica la oportunidad y asigna el equipo, con lo que cambia la cargabilidad de cada
uno → RRHH y Dirección leen los reportes por área para planificar.

El corazón sigue siendo el **buscador de talento interno**: el usuario escribe los requisitos de una
licitación en lenguaje natural — por ejemplo *"pentest web + ISO 27001 + inglés"* — y ProdigiES
devuelve las personas que califican, **ordenadas por mejor match**, mostrando su nivel en cada skill
requerido (**0–3**), su equipo, su rol y su **% de disponibilidad**. De ahí se genera una **ficha de
capacidades imprimible** lista para adjuntar a la propuesta.

**¿Qué deja de hacer el humano gracias a esto?**
Deja de mandar correos a tres líderes y esperar un día por la respuesta. La búsqueda pasa de
**horas repartidas en días** a **segundos**, y el resultado es el mismo para todos: comparable,
ordenado por criterio explícito y no por memoria.

**¿Dónde encajaría en la futura plataforma unificada de reportería?**
Es el **panel de capacidades + generador de fichas de talento** de la plataforma. La misma base de
datos de skills alimenta reportería para las otras dos áreas:

- **Para RRHH:** reporte de brechas por equipo y calendario de certificaciones por vencer.
- **Para PM:** reporte de disponibilidad y carga para armar el equipo de un proyecto.
- **Para Comercial:** la ficha de capacidades que ya generamos hoy, como anexo de la propuesta.

**Beneficios esperados de la plataforma completa:**

| Beneficio | En qué se traduce |
|-----------|-------------------|
| **Agilidad comercial** | Identificación inmediata de expertos para licitaciones y dimensionamiento de requerimientos según el tipo de proyecto. |
| **Optimización operativa** | Análisis en tiempo real de la carga de trabajo del equipo para equilibrar asignaciones y evitar sobrecargas. |
| **Desarrollo estratégico de talento** | Brechas de conocimiento visibles por área, para planificar formación y certificaciones de RRHH. |
| **Asignación eficiente** | Criterios claros para ubicar practicantes y nuevos integrantes donde más se necesitan. |

> **Hacia dónde escala (no es de hoy):** formulario de **autoevaluación** para que cada colaborador
> mantenga su perfil al día (hoy la edición es de RRHH, sin roles), subida real del archivo del
> diploma, e integración con el inventario de certificaciones de RRHH y con la herramienta de horas.

## 4. El flujo

1. **Entrada:** dos entradas, según quién esté frente a la pantalla.
   - **RRHH:** el perfil de un colaborador (nombre, posición, área, descripción, nivel de educación,
     idiomas, foto), su **calificación 0–3 en cada habilidad** del catálogo y sus **certificaciones**
     con fecha de emisión, vencimiento y nombre del adjunto.
   - **Comercial:** los requisitos de una licitación, escritos como texto libre (ej. *"pentest web +
     ISO 27001 + inglés"*). El seed de perfiles viene de `data/colaboradores.json` (**datos
     sintéticos**, ver §5).
2. **Proceso:** se interpretan los requisitos contra el catálogo de skills, se filtran las personas
   que los cubren y se calcula un **score de match** por persona: cuántos requisitos cubre, con qué
   nivel, si lo respalda con certificación vigente y qué tan disponible está. La **disponibilidad no
   se captura**: se deriva de las asignaciones a proyectos en ejecución (`100 − carga`).
3. **Salida:**
   - **En pantalla:** dashboard con KPIs por área, lista de candidatos ordenada por match, perfil
     completo de cada persona, cartera de proyectos con la carga de cada ingeniero y reportes por
     área (fortalezas, deficiencias, comparativo mes a mes, dónde invertir).
   - **Documentos imprimibles:** la **ficha de capacidades** del grupo seleccionado (`/reporte`), el
     **CV** de una persona (`/persona/[id]/cv`) y el **reporte del área** (`/reportes`) — HTML limpio
     con `@media print`, para imprimir o guardar como PDF desde el navegador.
   - **Escritura:** la asignación a un proyecto queda registrada y **baja la disponibilidad de esa
     persona en todas las pantallas**.
4. **¿Quién valida antes de que se use/envíe?** El **líder del equipo** de la persona propuesta
   confirma disponibilidad real, y **Comercial** valida que el perfil calce con el cliente antes de
   que la ficha salga en la propuesta. ProdigiES propone; la gente decide.

```
[RRHH: perfil + calificación 0–3 + certificaciones]
        │
        ▼
[Matriz de habilidades]  ◀── catálogo por categoría (técnicas · soluciones · blandas)
        │
        ├──▶ [Comercial escribe requisitos] ──▶ [Score: cobertura + nivel + certificación +
        │                                        disponibilidad] ──▶ [Candidatos ordenados]
        │                                                                    │
        │                                                                    ▼
        │                                                     [Ficha de capacidades imprimible]
        │
        ├──▶ [PM adjudica el proyecto y asigna] ──▶ [Carga por ingeniero · disponibilidad derivada]
        │
        └──▶ [RRHH y Dirección: reportes por área] ──▶ [Brechas · mes a mes · dónde invertir]
```

## 4b. Escenario de referencia — el ciclo completo

Historia que usamos para explicar la plataforma en el pitch. Recorre el ciclo entero: incorporación →
oportunidad comercial → ejecución → decisión estratégica. **El prototipo demuestra los cuatro pasos,
en vivo y en ese orden** — cada paso escribe en el JSON y el siguiente lee lo que dejó el anterior.

1. **Ingreso de un nuevo colaborador.** Marvin Tercero Jr. entra a ES Consulting. En la
   incorporación, RRHH registra sus habilidades, conocimientos y certificaciones y le construye el
   perfil en la plataforma: conocimiento **intermedio en Infoblox**, **certificación de Infoblox** y
   **habilidades de liderazgo**. Queda disponible para consulta.
   → _En el prototipo: `/perfiles/nuevo` y las tres pestañas de `/persona/[id]/editar`._
2. **Identificación de talento para una oportunidad comercial.**
   Semanas después, Comercial ve una oportunidad de un proyecto de Infoblox para una municipalidad.
   Filtra colaboradores por solución, conocimiento y certificaciones, y encuentra que Marvin tiene
   nivel intermedio y certificación en Infoblox. Sabe de inmediato a quién acudir para dimensionar la
   solución, validar requerimientos técnicos, cumplir requisitos de certificación y definir el
   alcance técnico de la propuesta.
   → _En el prototipo: `/buscar?q=Infoblox` y la ficha imprimible de `/reporte`._
3. **Adjudicación y asignación.** Un mes después el proyecto se adjudica y PM arma el equipo: elige a
   Marvin por su conocimiento técnico **y** su liderazgo, y suma a Pedrito, con nivel inicial en
   Infoblox, para que gane experiencia en el proyecto. PM deja la asignación registrada en la
   plataforma, y con eso se puede ver la carga de trabajo de los ingenieros.
   → _En el prototipo: `/proyecto/prj-infoblox-muni` (botón **Adjudicar y arrancar** + asignar) y
   `/carga`. Al asignar, la disponibilidad de Marvin baja en el buscador y en su perfil._
4. **Análisis de capacidades y planificación.** A fin de mes PM descarga los reportes de habilidades
   y carga de proyectos, y se reúne con Dirección y RRHH para revisar brechas, necesidades de
   capacitación y certificación, disponibilidad y carga, necesidad de nuevo personal, distribución
   entre proyectos y áreas de conocimiento por desarrollar.
   → _En el prototipo: `/reportes?area=Ingeniería`, imprimible._
5. **El extra.** La certificación de Infoblox de Marvin está por vencer. La plataforma lo saca en el
   aviso a RRHH — vencidas o a menos de 90 días — para reprogramar el examen antes de que la
   capacidad deje de ser acreditable en una licitación.
   → _En el prototipo: panel **Certificaciones · aviso a RRHH** del dashboard y la sección
   equivalente en `/reportes`._

> Los nombres del escenario son ilustrativos. El seed de datos del prototipo usa **nombres ficticios**
> (ver §5) — ninguna persona real de ES Consulting entra al repo.

## 5. Alcance del prototipo de HOY

- **Hoy SÍ se demuestra** — los 8 menús que pide el pitch, más el extra:

  | # | Menú | Ruta | Qué hace |
  |---|------|------|----------|
  | 1 | Perfil del colaborador | `/perfiles/nuevo`, `/persona/[id]/editar` | Alta y edición con nombre, posición, área, descripción, nivel de educación, idiomas y foto; pestaña de certificaciones con adjunto y vigencia; calificación de **cada** habilidad del catálogo. |
  | 2 | Catálogo de habilidades | `/catalogo` | Agregar, renombrar, recategorizar y eliminar, seccionado en técnicas, soluciones y blandas. |
  | 3 | Ponderación | en la calificación | Escala **0–3** tomada del JSON, no hardcodeada. |
  | 4 | Perfiles | `/perfiles`, `/persona/[id]/cv` | Colaboradores por área, con búsqueda y **descarga de CV** imprimible. |
  | 5 | Búsqueda de habilidades | `/buscar` | Requisitos en texto libre → candidatos ordenados por match. |
  | 6 | Carga laboral | `/carga`, `/proyecto/[id]` | Cartera de proyectos, carga por colaborador, adjudicar una oportunidad y asignar recursos. |
  | 7 | Dashboard | `/` | Buscador, KPIs, colaboradores y proyectos por área, top 10 de habilidades. |
  | 8 | Reportes | `/reportes` | Por área: fortalezas, deficiencias, comparativo mes a mes, dónde invertir en capacitación o certificación, y carga por ingeniero. Imprimible. |
  | + | Extra del escenario | dashboard y `/reportes` | Aviso a RRHH de certificaciones vencidas o a ≤ 90 días. |

  Y la **ficha de capacidades imprimible** (`/reporte`) a partir del resultado del buscador, que es
  el anexo de la propuesta.

- **Hoy NO (queda para después):**
  - **Autoevaluación por colaborador:** hoy cualquiera puede editar cualquier perfil, porque no hay
    login ni roles. En producción esto es de RRHH y del propio colaborador.
  - **Subida real de archivos:** la certificación registra el *nombre* del adjunto, no sube el PDF.
  - **Histórico real:** los 6 meses del comparativo mes a mes son generados; el último mes sí es el
    punteo real calculado del JSON. En producción, se snapshotea el punteo cada cierre de mes.
  - Login, roles y permisos.
  - Base de datos, PDF generado en backend, despliegue.

- **Los datos se escriben de verdad.** Todo lo que se guarda en la demo cae en
  `data/colaboradores.json`. **`npm run seed` restaura el archivo** al estado con el que se ensaya
  (Marvin al 50%, Pedrito al 90%, el proyecto de la municipalidad como oportunidad abierta) y
  descarta las altas hechas durante la demo. Se puede correr con el servidor levantado.

- **Datos de entrada para la demo:**
  Los datos de `data/` que ya trae el repo son de VAPT y vulnerabilidades: **no aplican** a este
  problema. El seed es `data/colaboradores.json`, y lo regenera `scripts/generar-seed.mjs`
  (`npm run seed`) de forma determinista: **36 colaboradores** repartidos en Ingeniería (20), CSC (8)
  y Consulting (8), cada uno con rol, descripción, nivel de educación, fecha de ingreso, niveles por
  skill y certificaciones con emisión y vencimiento; **61 habilidades**; **15 proyectos** con sus
  asignaciones (13 de cartera y 2 oportunidades abiertas); y **6 meses de histórico** de punteos.
  - **Ingeniería:** 18 perfiles **sintéticos provisionales** (`origen: sintetico-pendiente-excel`),
    a la espera de los niveles reales de la matriz de habilidades del equipo. Cuando se carguen, los
    **nombres van anonimizados** y el mapeo real→ficticio se queda en
    `data/mapeo-nombres.local.json`, que está en `.gitignore`.
  - **CSC y Consulting:** sintéticos, con la misma escala y categorías.
  - **Marvin Tercero Jr. y Pedrito:** los dos personajes del escenario del pitch (§4b), con
    atributos fijos. Son los únicos con Infoblox en el seed, para que la demo salga igual siempre.

  **Ningún dato de personas reales de ES Consulting entra al repo.**

### Modelo de datos

- **Persona** — `id`, `nombre`, `equipo`, `rol` (la *posición*), `descripcion`, `educacion`,
  `ingreso`, `foto`, `idiomas`, `certificaciones[]`, `skills[]`, `origen` (de dónde vienen sus datos).
  `carga` y `disponibilidad` **no se guardan**: se derivan (ver abajo).
- **Skill** — `id`, `nombre`, `categoria`. **Tres categorías**, tal como las maneja la matriz de
  habilidades de Ingeniería:
  - `technical` — capacidades propias del oficio (VAPT Web, VAPT OT, Active Directory, Evaluación de
    código, y sus equivalentes de GRC para Consulting y de SOC/DFIR para CSC).
  - `solutions` — producto/fabricante que la persona sabe implementar y operar (Infoblox, Cloudflare
    ZTNA, Darktrace NDR, Checkpoint, SonarQube…).
  - `soft` — Redacción, Comunicación verbal, Presentación a clientes, Liderazgo, Gestión de
    proyectos, Uso adecuado de Slack e **Inglés**.
- **Certificacion** — `nombre`, `emitida`, `vence`, `archivo` (nombre del adjunto). La vigencia se
  calcula de `vence`; a ≤ **90 días** entra en el aviso a RRHH.
- **Proyecto** — `id`, `nombre`, `cliente`, `area`, `estado` (`oportunidad` · `en-ejecucion` ·
  `cerrado`), `inicio`, `fin`, `descripcion`, `requisitos` (texto que se pasa al buscador) y
  `asignaciones[]` de `{ personaId, rolProyecto, dedicacion }`.
- **HistorialMes** — `mes` + punteo por área y categoría, para el comparativo mes a mes.
- **PersonaSkill** — `skillId` + `nivel`, en **escala 0–3**:

  | Nivel | Significado |
  |-------|-------------|
  | **0** | No tiene conocimiento _(no se guarda: si el skill no aparece en la persona, es 0)_ |
  | **1** | Básico — trabaja con supervisión |
  | **2** | Intermedio — autónomo |
  | **3** | Avanzado — puede liderar, entrenar y diseñar |

**Punteo por categoría:** la suma de niveles de una persona en cada categoría (`technical`,
`solutions`, `soft`) se calcula en el código, no se guarda en el JSON — así no se desincroniza
cuando cambian los niveles. Sirve como perfil de la persona; **no** como orden de los resultados
(ver nota de score abajo).

**Disponibilidad derivada:** `carga` = suma de la dedicación de la persona en los proyectos
**en ejecución** (las oportunidades no consumen carga), y `disponibilidad = 100 − carga`. Por eso el
paso 3 del escenario se ve en vivo: cuando PM asigna a Marvin al 40% y adjudica el proyecto, su
disponibilidad pasa de 50% a 10% en el buscador, en su perfil y en `/carga` sin tocar nada más.

### Cómo se ordenan los candidatos (score de match)

El orden se calcula **contra los requisitos buscados**, no sobre el punteo total de la categoría. La
diferencia importa: en el seed hay ingenieros con punteo 10–11 en `solutions` que **no saben Infoblox**
— si ordenáramos por punteo de categoría, saldrían arriba de Marvin (punteo 2) en una búsqueda de
Infoblox, y la demo se cae. El score combina, en este orden de peso:

1. **Cobertura** — cuántos de los requisitos buscados cubre la persona.
2. **Nivel** — qué tan alto (1–3) los cubre.
3. **Certificación vigente** en el requisito — distintivo y desempate.
4. **Disponibilidad** — a igualdad de perfil, gana quien puede tomar el proyecto.

Con eso, buscar *"Infoblox"* devuelve **Marvin primero** (intermedio + certificado) y **Pedrito
visible en segundo** (básico, 90% disponible) — que es justo el ángulo de desarrollo de talento del
escenario.

**Persistencia:** un archivo **JSON en el repo**, cacheado en memoria (el cache se invalida por
`mtime`, así que `npm run seed` se ve sin reiniciar). Las escrituras van por **server actions** que
reescriben el archivo completo. Sin base de datos — la regla del evento lo pide así, y además es el
camino más corto al reto *Manual de vuelo*: la rama corre con `npm install && npm run dev`, sin
migraciones ni `.env`.

### Stack

Next.js 16 (App Router) + TypeScript + Tailwind v4 — el boilerplate del repo. Interfaz y lectura en
Server Components (`src/app/`), escrituras en server actions (`src/lib/acciones.ts`), lógica en
`src/lib/` (`buscar.ts` el motor de match, `analitica.ts` los reportes, `datos.ts` la persistencia).
Queda además una API route (`src/app/api/buscar/route.ts`) para consumir la búsqueda desde fuera.

## 6. Reparto rápido

- **¿Quién maneja el agente / código?** _PENDIENTE_
- **¿Quién prepara datos y prueba el flujo?** _PENDIENTE_
- **¿Quién arma el pitch y la demo?** _PENDIENTE_

## Impacto estimado

_Argumento para el criterio de impacto (20%). Los números son estimación del equipo, a validar con
Comercial antes del pitch:_

- **Hoy:** 3–5 h de trabajo efectivo por propuesta buscando quién califica, repartidas en 1–2 días
  de espera de respuestas.
- **Con ProdigiES:** la búsqueda baja a minutos; queda solo la validación humana con el líder.
- **Ahorro:** ~3–4 h por propuesta. Con **4 propuestas al mes**, son **~12–16 h/mes** solo en
  Comercial — sin contar el beneficio menos medible pero más caro: dejar de declinar o subcontratar
  oportunidades por una capacidad que sí existía adentro.
