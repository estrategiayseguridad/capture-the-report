# 🎤 Guía de pitch y demo — Equipo 05 · ProdigiES

## El pitch (2:45 PM — máximo 2 minutos, un representante)

### 1. El dolor (30 seg)

> **"¿Quién de la casa sabe hacer esto?"** Cada vez que entra una licitación, Comercial tiene que
> preguntarle a los líderes de CSC, Ingeniería y Consulting quién califica — y esperar. Son **3 a 5
> horas de trabajo repartidas en uno o dos días**, y el tiempo no se va buscando: se va **esperando
> respuestas**. Lo peor: la respuesta depende de a quién le preguntaste. Se propone a quien alguien
> recordó, no a quien mejor califica — y a veces se subcontrata o se declina una oportunidad por una
> capacidad que **sí existía adentro** y nadie tenía visible.

### 2. La solución (30 seg)

> Construimos **ProdigiES**: le escribes el requisito de la licitación — *"Infoblox"*, *"VAPT Web +
> inglés"* — y te devuelve **quién califica, ordenado por mejor match**, con su nivel en cada skill
> (0 a 3), sus certificaciones y su **% de disponibilidad**. De ahí sale la **ficha de capacidades
> imprimible** para adjuntar a la propuesta. Y no se queda ahí: **RRHH mantiene la matriz, PM asigna
> el equipo del proyecto adjudicado y Dirección lee las brechas del área** — el mismo dato, las tres
> áreas que hoy no se hablan.

### 3. El flujo (30 seg)

> 1. Escribes el requisito de la licitación.
> 2. ProdigiES cruza el catálogo de habilidades — **técnicas, soluciones y blandas** — y ordena a
>    las personas por nivel, certificación y disponibilidad.
> 3. Generas la ficha del candidato para la propuesta.

### 4. La promesa de demo (30 seg)

> A las 6 nos van a ver **escribir "Infoblox" y encontrar en segundos a la persona certificada,
> disponible al 50%, y al practicante que puede acompañarla** — con la ficha lista para la propuesta.
> Y después la vamos a **asignar al proyecto en vivo**: su disponibilidad baja al 10% en toda la
> plataforma, y el reporte del área ya nos dice dónde quedamos flacos.

---

## La demo (6:00 PM — máximo 5 minutos)

**Guión de 4 actos.** No es un recorrido de features: es la historia de una oportunidad real,
de punta a punta. Un solo hilo — Infoblox para una municipalidad.

### Acto 1 · Entra un colaborador nuevo (45 seg)

**Pantalla:** `/perfiles` → **+ Nuevo colaborador** → la ficha de **Marvin Tercero Jr.**

> "Marvin entra a ES Consulting. En su incorporación, RRHH lo registra acá —" *(muestras el formulario:
> posición, área, descripción, nivel de educación)* "— y después lo califica: **cada habilidad del
> catálogo, de 0 a 3**, y sus **certificaciones con la fecha de vencimiento y el diploma adjunto**.
> Así queda el perfil de Marvin: **Infoblox intermedio, certificado, liderazgo avanzado**. A partir de
> ese momento la organización *sabe* que Marvin existe."

💡 No llenes el formulario entero en vivo (se come el tiempo): muéstralo, escribe el nombre y salta al
perfil de Marvin ya cargado. Si das de alta a alguien, **usa un nombre ficticio** — se escribe en el
repo. `npm run seed` borra las altas de la demo y deja todo como estaba.

### Acto 2 · La oportunidad comercial (60 seg) ← *el corazón de la demo*

**Pantalla:** `/buscar` → escribir `Infoblox` → resultados.

> "Semanas después, Comercial ve una oportunidad: un proyecto de **Infoblox para una municipalidad**.
> Antes, esto eran correos a tres líderes y un día de espera. Ahora —" *(escribes Infoblox)* "—
> **Marvin, primer resultado**: nivel intermedio, certificado, 50% disponible."

Luego generas la **ficha de capacidades** y remátalo:

> "Esta ficha se adjunta a la propuesta. Comercial ya sabe a quién buscar para dimensionar la
> solución, validar requerimientos y cubrir el requisito de certificación."

### Acto 3 · PM arma el equipo (75 seg) ← *el remate*

**Pantalla:** `/carga` → el proyecto **Despliegue Infoblox DDI** (está como *oportunidad*).

> "Un mes después el proyecto se adjudica." *(botón **Adjudicar y arrancar**)* "PM ve acá mismo a los
> candidatos que califican: **Marvin, al 50%** — lo toma no solo por Infoblox, también por su
> **liderazgo** — y **Pedrito, nivel básico, 90% disponible**, que entra **para que desarrolle
> experiencia**."

Asignas a Marvin al **40%** y a Pedrito al **30%**, y vuelves al buscador:

> "Y esto es lo que cambia: Marvin **ya no está al 50%, está al 10%**. La disponibilidad no se captura
> a mano — sale de los proyectos. La próxima licitación que llegue va a ver la realidad, no lo que
> alguien se acuerde."

Dos ángulos que nadie más va a mostrar: el buscador no solo encuentra al experto, **también encuentra
a quién hay que hacer crecer**; y la asignación **cierra el ciclo** en lugar de quedar en un correo.

### Acto 4 · Cierre: la decisión estratégica (60 seg)

**Pantalla:** `/reportes` con **Ingeniería** seleccionada.

> "A fin de mes, PM, RRHH y Dirección abren el reporte del área: **fortalezas**, **deficiencias** —
> qué skill lo cubre una sola persona, cuál no tiene a nadie en avanzado —, el **comparativo mes a
> mes** de cómo se movió el punteo, y **dónde invertir**: a quién capacitar y a quién certificar.
> Se imprime y entra a la reunión."

Y el extra del escenario, que es el que se queda en la cabeza del jurado:

> "Y además, esto: **la certificación de Infoblox de Marvin vence en 65 días**. La plataforma ya lo
> está avisando a RRHH — porque una capacidad que no se puede acreditar, en una licitación, no
> existe."

**Frase de cierre — con esta se termina, sin agregar nada después:**

> ### "Pasamos de conocimiento disperso a gestión integral de talento, capacidades y recursos."

---

### Notas de honestidad para la demo

Si un árbitro pregunta, esto es lo que se responde sin titubear:

- **Los datos son de demo.** Ninguna persona real aparece con sus datos. Los 18 perfiles de
  Ingeniería son sintéticos provisionales, en espera de los niveles reales de la matriz de
  habilidades; cuando entren, los nombres van anonimizados y el mapeo se queda fuera del repo.
- **La escala 0–3 sí es la lógica real** de la matriz de Ingeniería: 0 no tiene, 1 básico con
  supervisión, 2 intermedio autónomo, 3 avanzado — puede liderar, entrenar y diseñar.
- **ProdigiES propone; la gente decide.** El líder del equipo confirma la disponibilidad real y
  Comercial valida el perfil antes de que la ficha salga en la propuesta.
- **Los proyectos y el histórico también son de demo.** Los 15 proyectos son de clientes ficticios
  (ACME Corp, Banco Demo, Municipalidad Demo) y de los 6 meses del comparativo, **solo el último es
  el punteo real** calculado del JSON; los anteriores son generados. En producción se snapshotea el
  punteo en cada cierre de mes.
- **No hay login ni roles.** Cualquiera puede editar cualquier perfil. En producción, el alta y la
  calificación son de RRHH, y la autoevaluación del propio colaborador.
- **Sí escribe.** Todo lo que se guarda en la demo cae en `data/colaboradores.json`, no en una base de
  datos — la regla del evento lo pide así. `npm run seed` lo restaura al estado del ensayo.

### Checklist antes de la demo

- [ ] `npm run dev` corre desde cero en la rama (pruébenlo).
- [ ] `npm run seed` corrido **justo antes** de la demo: Marvin al 50%, Pedrito al 90%, el proyecto de
      la municipalidad como oportunidad abierta. Se puede correr con el servidor levantado.
- [ ] Buscar `Infoblox` devuelve a Marvin primero y a Pedrito visible abajo — **ensáyenlo tal cual**.
- [ ] Ensayado el Acto 3 completo (adjudicar → asignar → volver al buscador y ver el 10%), y
      **`npm run seed` otra vez** después del ensayo.
- [ ] `docs/PLANTEAMIENTO.md` está completo y committeado (faltan integrantes y reparto).
- [ ] `README-EQUIPO.md` existe: qué hace, cómo correrlo, qué quedó pendiente.
- [ ] Último push hecho ANTES de las 6:00 PM (code freeze).
- [ ] 🌐 ¿Les dio tiempo de desplegarlo en línea? Puntos extra — avisen a los árbitros con el link.
