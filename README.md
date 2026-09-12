# 🏁 Capture The Report

Hackathon interna de ES Consulting — el inicio de la **plataforma unificada de reportería**.

## Equipo 01 — Rinde

Prototipo de **gastos y reembolsos** en esta rama (`equipo-01`).

```bash
git checkout equipo-01
npm install
npm run seed
npm run dev
```

Demo: `employee@example.local` / `admin@example.local` — contraseña `Demo123!`.

Instrucciones completas, OCR, LAN y limitaciones: [`README-EQUIPO.md`](README-EQUIPO.md).

---

Cada equipo construye un prototipo web que resuelva un dolor real de reportería: automatizar un reporte manual, convertir la salida de una herramienta en un documento presentable, asistentes de redacción, paneles de hallazgos… lo que su equipo elija.

## 🚀 Cómo empezar (5 minutos)

```bash
# 1. Clona el repo
git clone https://github.com/estrategiayseguridad/capture-the-report.git
cd capture-the-report

# 2. Crea la rama de tu equipo (usa tu número de equipo)
git checkout -b equipo-01

# 3. Instala dependencias y corre el proyecto
npm install
npm run dev
```

Abre http://localhost:3000 — si ves la página de bienvenida, estás listo.

> ⚠️ **Nunca trabajes en `main`.** Todo el trabajo de tu equipo vive en su rama `equipo-XX`. Hagan commits frecuentes y push a su rama.

> 👤 **¿Eres líder de equipo?** Pasa por [`docs/LIDERES.md`](docs/LIDERES.md): checklist de preparación, cómo configurar Claude Code para el evento y tu rol durante el día.

## 📋 El flujo del día

| Fase | Hora | Qué hacer |
|------|------|-----------|
| **1. Tema** | 1:00 – 1:45 | Durante el almuerzo, el equipo debate y elige su tema. |
| **2. Planteamiento y pitch** | 1:45 – 2:45 | ⛔ **Sin código todavía.** Llenen [`docs/PLANTEAMIENTO.md`](docs/PLANTEAMIENTO.md) con calma: problema, solución y flujo. De ahí sale el pitch ([`docs/PITCH.md`](docs/PITCH.md)). Un buen planteamiento = un agente que trabaja bien. |
| **3. Pitch** | 2:45 – 3:15 | Un representante, máximo 2 minutos. |
| **4. Prototipo** | 3:15 – 6:00 | A construir. El agente ya conoce las reglas (ver `CLAUDE.md`). Prioridad: algo que se vea funcionando en pantalla. |
| **5. Demo** | 6:00 – 7:30 | Máximo 5 minutos por equipo, demo en vivo desde su rama. |

## 🛠 Stack (muy recomendado)

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS** — ya configurado, solo `npm install`. Es el camino rápido: arrancan en 5 minutos y el agente ya conoce el terreno.
- **¿Su equipo domina otro stack web?** Úsenlo. Vale más avanzar con lo que ya manejan que pelearse con algo nuevo en 3 horas. Solo documenten en su `README-EQUIPO.md` cómo instalarlo y correrlo, para que cualquiera pueda levantar su rama.
- **Lo único no negociable:** el prototipo debe ser **web** y **correr en local** para la demo.
- Para persistencia del prototipo: archivos JSON, memoria o `localStorage` — no pierdan tiempo montando bases de datos.
- Datos de prueba sanitizados en [`data/`](data/) — úsenlos como entrada de sus prototipos.

## 📏 Reglas

1. **Todo vive en el repo.** Si no está en tu rama al code freeze (6:00 PM), no existe.
2. **Planteamiento primero.** `docs/PLANTEAMIENTO.md` completo antes de la primera línea de código. Es obligatorio y se evalúa.
3. **Agentes de IA permitidos y fomentados.** Solo pide una cosa: que el equipo entienda y pueda explicar lo que entrega.
4. **Demo en vivo.** Lo que se evalúa corre en pantalla. Si algo quedó a medias, se muestra hasta donde llegó.
5. **🔒 Cuiden los datos.** Eviten datos que divulguen información sensible o identificable de clientes. Si parten de algo real, sanitícenlo antes: anonimicen hosts, nombres y hallazgos. Los de [`data/`](data/) ya vienen listos para usar.

## 🏆 Evaluación

**Hay un solo ganador**, y sale de la evaluación del proyecto más el bonus de la Copa de Retos.

### Evaluación del proyecto (sobre 100)

| Criterio | Peso | Evidencia que se verifica |
|----------|------|---------------------------|
| **Planteamiento y visión** | **35%** | `docs/PLANTEAMIENTO.md` completo y committeado **antes de las 3:15 PM** (lo dice el timestamp de git). Problema específico, solución clara, flujo completo y encaje en la plataforma. |
| Funciona en vivo | 30% | El camino feliz corre completo en la demo, desde la rama, con los datos de prueba. |
| Impacto en el día a día | 20% | Estimación argumentada de horas ahorradas por semana/proyecto. |
| Calidad y continuidad | 15% | `README-EQUIPO.md` + la rama corre desde cero siguiendo sus propias instrucciones. |

Cada criterio lo puntúan los jueces con rúbrica de 1–5, y hay voto popular (nadie vota por su propio equipo). **Puntaje del proyecto = 50% jueces + 50% voto popular.**

### Copa de Retos (bonus, máximo +10)

Los puntos de retos se normalizan contra el líder para que sumen emoción sin distorsionar la evaluación:

```
Bonus = 10 × (puntos de retos de tu equipo ÷ puntos del equipo líder)
```

**Puntaje final = Evaluación (máx 100) + Bonus Copa (máx 10).**

Desempates, en orden: (1) más puntos brutos de retos, (2) mejor puntaje en Planteamiento y visión, (3) último commit más temprano antes del code freeze.

## ⚡ Retos bonus (Copa de Retos)

Marcador en vivo durante todo el día, fijado en el canal del evento. Retos conocidos: *First blood* +25 (primer prototipo funcional en pantalla), *Rescate* +50 (destrabar a otro equipo), *Prompt maestro* +50 (el mejor flujo con agentes), *Manual de vuelo* +50 (otro equipo corre tu rama solo con el README), 🌐 *Deploy* +100 (demo desplegada en línea) — y sorpresas que se anuncian durante la tarde.

🏎️ **Grand Prix:** durante el bloque de desarrollo habrá carreras de Mario Kart (Switch, 4 jugadores de equipos distintos). Cada carrera reparte **+10 / +6 / +3 / +1** a la Copa de Retos del equipo del corredor. Participar es totalmente opcional — es para despejarse un rato.

**Regla de validación:** un reto solo existe si un árbitro (Tomás o Mei) lo valida en el momento y queda registrado en el marcador con equipo, reto, hora y evidencia (screenshot o link al commit). Sin registro no hay puntos — así el veredicto final es auditable.

---

¿Dudas? Tomás o Mei. 🏁
