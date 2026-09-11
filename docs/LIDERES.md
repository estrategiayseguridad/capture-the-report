# 👤 Guía para líderes de equipo

Eres el punto de contacto de tu equipo. Esta guía tiene tres partes: lo que haces **hoy** (antes del evento), cómo **configurar Claude Code** el día del evento, y tu **rol durante el día**.

---

## ✅ Checklist de HOY (antes del evento)

Toma 10 minutos. Si algo falla, avisa a Tomás o Mei **hoy** — no mañana a la 1:00 PM.

- [ ] **Acepta la invitación al repo** (llega por correo de GitHub).
- [ ] **Clona el repo:**
  ```bash
  git clone https://github.com/estrategiayseguridad/capture-the-report.git
  cd capture-the-report
  ```
- [ ] **Instala dependencias:** `npm install`
- [ ] **Corre el proyecto:** `npm run dev` → abre http://localhost:3000 y verifica que se vea la **página de bienvenida**.
- [ ] **Instala Claude Code:**
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
  (o usa el instalador nativo si prefieres)
- [ ] **Verifica que quedó bien:** `claude --version` debe imprimir un número de versión.
- [ ] **Lee el [README](../README.md) y el [PLANTEAMIENTO](PLANTEAMIENTO.md)** para llegar con el flujo del día claro.

---

## 🔑 Configurar Claude Code para el evento

El día del evento los organizadores comparten un **token en el canal del evento**. Con ese token, cada integrante que vaya a usar el agente pega este bloque en su terminal **ANTES de correr `claude`**:

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export AWS_BEARER_TOKEN_BEDROCK=<TOKEN_DEL_EVENTO>
export ANTHROPIC_MODEL='us.anthropic.claude-opus-5'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

Reemplaza `<TOKEN_DEL_EVENTO>` por el token que compartan en el canal. Luego arranca el agente:

```bash
claude
```

**Verifica que quedó bien:** dentro de `claude`, escribe `/status`. Debe decir **Bedrock**. Si no lo dice, cierra el agente, vuelve a pegar el bloque en esa misma terminal y entra de nuevo.

> 💡 **Tranquilo:** esas variables solo viven en **esa terminal**. Si ya usas Claude Code con tu cuenta personal, tus otras pestañas siguen igual — nada se toca ni se pierde.

---

## 🏁 Durante el evento — tu rol

- **Apenas inicie:** crea la rama del equipo y súbela.
  ```bash
  git checkout -b equipo-XX
  git push -u origin equipo-XX
  ```
  Nadie trabaja en `main`.
- **Antes de las 3:15 PM:** que `docs/PLANTEAMIENTO.md` esté **completo y committeado**. Se evalúa con el **timestamp de git** — un commit a las 3:16 no cuenta. Es el criterio que más pesa (35%).
- **Commits frecuentes.** Si no está pusheado en la rama al code freeze, no existe.
- **Code freeze 6:00 PM.** Último push antes de esa hora. Planea cerrar a las 5:45 para no correr.
- **Designa quién presenta:** una persona para el **pitch** (2:45 PM, 2 minutos) y una para la **demo** (6:00 PM, 5 minutos). Pueden ser distintas — repartan el protagonismo.

---

## 🤖 Tips con el agente

- **Primer prompt: pégale el `PLANTEAMIENTO.md` completo.** Literal, todo el documento. El agente trabaja muchísimo mejor con el contexto del problema que con "hazme una web de reportes".
- **Pide el camino feliz primero.** "Que entre el CSV de `data/` y salga el reporte en pantalla, aunque se vea feo." Lo bonito viene después.
- **Itera en pasos pequeños.** Un cambio, lo pruebas en el navegador, commit. Pedirle cinco cosas a la vez es la forma más rápida de enredarse.
- **Si algo se traba:** pídele que te explique qué está pasando antes de pedirle que lo arregle. Y si siguen atorados 15 minutos, llamen a un árbitro — destrabar a otro equipo da puntos, así que alguien los ayudará.

---

¿Dudas? Tomás o Mei. 🏁

---
---

# 🟦 Equipo 08 — Plan del líder · REPORTERO CSC

> Todo lo de arriba es la guía general del evento (no la modifiquen). De aquí para abajo es el plan de nuestro equipo.

**Líder:** Oscar Gonzalez
**Equipo:** Oscar Gonzalez, Katherine Felipe, Juan Pascual, Katherine Morales
**Rama:** `equipo-08`
**Prototipo:** **REPORTERO CSC** — el cierre mensual de tickets de Banco Demo, automatizado de punta a punta.
**Planteamiento:** [`PLANTEAMIENTO.md`](PLANTEAMIENTO.md) · **Pitch y demo:** [`PITCH.md`](PITCH.md)

## ✅ Checklist del líder — estado

- [x] Rama `equipo-08` creada (verificado con `git branch --show-current`).
- [ ] Rama pusheada: `git push -u origin equipo-08`.
- [x] `npm install` y `npm run dev` verificados (Node v24.10.0, npm 11.6.1).
- [x] `docs/PLANTEAMIENTO.md` completo.
- [x] `docs/PITCH.md` completo.
- [ ] **Commit del planteamiento ANTES de las 3:15 PM** ← lo que más pesa (35%), se mide con el timestamp de git.
- [ ] Dataset sanitizado en `data/`.
- [ ] `README-EQUIPO.md` en la raíz.
- [ ] Último push antes de las 6:00 PM.

## 👥 Reparto

| Persona | Rol | Responsabilidad concreta |
|---------|-----|--------------------------|
| **Oscar Gonzalez** | Líder · agente/código | Maneja Claude Code, hace los commits, presenta la demo (6:00 PM). |
| **Katherine Felipe** | Pitch · narrativa | Presenta el pitch (2:45 PM), redacta los textos de plantilla del informe. |
| **Juan Pascual** | Datos | Sanitiza el dataset y arma el JSON del historial mensual. |
| **Katherine Morales** | QA de cifras | **Verifica cada número del dashboard contra el informe de Agosto ya entregado.** |

> El rol de Katherine Morales es el más importante del equipo y el más fácil de subestimar: si las cifras no cuadran contra el informe real, no tenemos prototipo — tenemos una página bonita. **Que empiece a verificar en cuanto exista el primer dashboard, no al final.**

## ⏱ Plan del bloque de desarrollo (3:15 – 6:00 PM)

| Hora | Objetivo | Cómo sabemos que se logró |
|------|----------|---------------------------|
| **3:15 – 3:30** | Sanitizar el dataset y dejarlo en `data/`. Instalar `xlsx` (SheetJS) y `recharts`. | `npm run dev` sigue corriendo. |
| **3:30 – 4:15** | 🎯 **Camino feliz feo.** Subir el `.xlsx` → API route lo parsea → los 63 tickets salen en una tabla en pantalla. **Sin estilo.** | Se ve la tabla con 63 filas. → **Avisar al árbitro: candidato a *First blood* (+25).** |
| **4:15 – 4:45** | Métricas + agrupación por herramienta (`Category.split('>')[0]`). Las 3 vistas por herramienta. | Cloudflare 55 · BeyondTrust 5 · Thinkst Canary 3, y suman 63. |
| **4:45 – 5:15** | Las 4 gráficas con Recharts. | Las 4 gráficas en pantalla cuadran con el informe de Agosto. |
| **5:15 – 5:40** | El informe: plantilla con cifras inyectadas + descarga abrible en Word. | El archivo descargado abre en Word con las cifras correctas. |
| **5:40 – 5:50** | `README-EQUIPO.md` y prueba desde cero. | Otro integrante clona la rama y la corre **sin ayuda**. → **Candidato a *Manual de vuelo* (+50).** |
| **5:50 – 6:00** | Último commit y push. Ensayo de la demo con cronómetro. | Code freeze cumplido, demo ensayada una vez completa. |

> 🚨 **Regla del líder:** si a las **4:15** no hay 63 filas en pantalla, se recorta. Se sacrifican las gráficas antes que el informe, y el informe antes que el camino feliz. **Un flujo completo y feo gana a tres piezas bonitas desconectadas.**

## 🤖 Cómo arrancar con el agente

Primer prompt del bloque de desarrollo — pegarle el planteamiento completo:

```
Lee docs/PLANTEAMIENTO.md completo, incluido el anexo técnico de la sección 7.
Estamos en la rama equipo-08.

Construye el camino feliz mínimo, sin estilo todavía:
1. Una página con un input de archivo para subir el .xlsx de Halo.
2. Una API route que parsee la pestaña DATOS con SheetJS, buscando las
   columnas POR NOMBRE DE ENCABEZADO (no por letra) y convirtiendo
   Date Created de serial de Excel a fecha.
3. Que devuelva los 63 tickets y se pinten en una tabla en pantalla.

Nada más por ahora. Cuando lo vea funcionando seguimos.
```

Después, un paso por prompt, probando en el navegador y haciendo commit entre cada uno:

1. Agrupar por herramienta y sacar las 3 vistas.
2. Las 5 métricas del informe.
3. Las 4 gráficas.
4. La plantilla del informe con las cifras inyectadas.
5. La descarga.

> **Consejo que ya nos costó tiempo:** este repo usa **Next.js 16**, no 15 (lo dice `package.json`; el README dice 15 y está desactualizado). Si el agente escribe algo de Next 15 que no compila, recuérdenle que lea `node_modules/next/dist/docs/` — está avisado en `AGENTS.md`.

## 🔒 Nota de datos — leer antes de proyectar

Los archivos de `assets/` son **datos reales de un cliente**: nombre del banco, correos corporativos, nombres de 12 agentes y de usuarios del cliente, subdominios de producción e IPs públicas de terceros.

- **Sirven para desarrollar y para verificar** que las cifras dan bien. Ese es su valor y por eso los tenemos.
- **Lo que se proyecta en la demo debe ser el dataset sanitizado.** La sala tiene gente de otros equipos y las demos se ven en pantalla grande.
- Antes del code freeze, decidir si `assets/` se queda en la rama o solo el dataset sanitizado. **Es decisión del líder** — pero conviene decidirlo a propósito y no por olvido.

## 🏆 Retos bonus al alcance

| Reto | Puntos | Nuestra jugada |
|------|--------|----------------|
| *First blood* | +25 | Meta de las 4:15 PM. Es el reto más fácil de ganar: **avisar al árbitro en el momento**, no después. |
| *Manual de vuelo* | +50 | El `README-EQUIPO.md` de las 5:40. Que otro equipo corra nuestra rama solo con el README. |
| *Prompt maestro* | +50 | El anexo técnico de la sección 7 del planteamiento **es** el argumento: le dimos al agente las columnas, los valores reales y las reglas de negocio antes de pedir código. |
| *Rescate* | +50 | Si terminamos temprano, ofrecerse a destrabar a otro equipo. |
| 🌐 *Deploy* | +100 | Solo si el camino feliz ya está cerrado y hay tiempo de sobra. **No sacrificar la demo local por esto.** |

Recordar: **sin registro del árbitro no hay puntos.** Screenshot o link al commit, en el momento.

