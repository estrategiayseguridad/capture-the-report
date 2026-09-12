# Contexto de trabajo — Equipo 11

> Archivo de bitácora del prototipo. Se actualiza en cada iteración para que
> cualquier persona (o el agente en una sesión nueva) retome el trabajo sin
> tener que releer todo el código.

## 1. Qué estamos construyendo

Aplicación web que **recolecta la evaluación de cumplimiento** de los
*Lineamientos de Seguridad para los Participantes en las Cámaras de
Compensación Bancaria (CCB) y Automatizada (CCA)* — Marco de Referencia para la
Seguridad de la Información v2023, emitido por ICG — y **exporta la
documentación** resultante.

Fuente normativa: [docs/DOC.md](docs/DOC.md) (numeral 11, descripción detallada
de los controles) y la tabla resumen de controles de la imagen adjunta al
planteamiento.

## 2. Modelo de datos acordado

Jerarquía de tres niveles: **Principio ─▶ Objetivo ─▶ Control**.
Solo los **controles** se capturan; objetivos y principios se **calculan**.

| Nivel | Cantidad | Ejemplo |
|---|---|---|
| Principios | 4 | "Conocer y asegurar su entorno" |
| Objetivos | 7 | 11.2 "Mitigación de vulnerabilidades y ataques físicos y lógicos" |
| Controles | 23 | 11.2.5 "Análisis de vulnerabilidades" |

Distribución de controles por objetivo: 11.1 → 2, 11.2 → 7, 11.3 → 4,
11.4 → 1, 11.5 → 4, 11.6 → 1, 11.7 → 4.

### Campos por control

| Campo | Tipo | Cómo se llena |
|---|---|---|
| Nivel de clasificación | `Cumple` / `No cumple` | selección del auditor |
| Nivel de madurez | No controlable, Inicio, Repetible, Definido, Administrado, Optimizado | selección del auditor |
| Nota nivel de madurez | 0–5 | **derivada** del nivel de madurez (índice en el arreglo) |
| Observaciones | texto libre | manual |
| Comentarios | texto libre | manual |

> **Decisión:** la nota de madurez es de solo lectura y se calcula como el
> índice del nivel seleccionado (`No controlable` = 0 … `Optimizado` = 5). Así
> nunca puede desalinearse del nivel. Si el equipo necesita sobreescribirla
> manualmente, hay que cambiar `notaMadurez()` en `src/lib/evaluacion.ts`.

### Cómo se calcula el cumplimiento

- **Objetivo:** `% cumplimiento = controles "Cumple" / total de controles del objetivo`.
- **Principio:** igual, sobre todos los controles de sus objetivos.
- **Global:** igual, sobre los 23 controles.
- Un control sin capturar **no cuenta como "Cumple"** (baja el %). Se reporta
  aparte como `avance` = controles capturados / total.
- **Madurez promedio:** promedio de las notas de los controles *ya evaluados*
  (los no evaluados se excluyen para no sesgar el promedio a 0).

## 3. Estructura del código

```
src/
├─ lib/
│  ├─ lineamientos.ts   Catálogo estático: 4 principios / 7 objetivos / 23 controles
│  ├─ evaluacion.ts     Tipos, niveles de madurez, cálculo de cumplimiento, validación de import
│  ├─ useEvaluacion.ts  Hook de estado + persistencia en localStorage
│  └─ ejemplo.ts        Evaluación sintética de demo (Banco Demo, S.A.)
└─ app/
   ├─ page.tsx          Panel de captura + resumen de cumplimiento
   ├─ reporte/page.tsx  Reporte imprimible (Imprimir → Guardar como PDF)
   └─ components/
      ├─ FichaControl.tsx  Formulario de un control
      └─ Medidores.tsx     Barras, anillo, escala de madurez, tarjetas
```

Sin base de datos, sin Docker, sin servicios externos: **estado en el navegador
(localStorage) + export/import JSON**.

## 4. Estado actual — iteración 1 (11 sep 2026)

Hecho:

- [x] Catálogo completo de los 23 controles con su enunciado tomado de `DOC.md`.
- [x] Panel de captura agrupado por principio → objetivo (acordeón), con los
      5 campos por control.
- [x] Nota de madurez derivada automáticamente del nivel.
- [x] Cálculo de cumplimiento y madurez en los tres niveles + global, en vivo.
- [x] Datos de la evaluación (participante, auditor, fecha, alcance).
- [x] Filtros: Todos / Pendientes / No cumple.
- [x] Autoguardado en localStorage + Exportar JSON + Importar JSON + Cargar ejemplo + Reiniciar.
- [x] Reporte imprimible en `/reporte`: portada, resumen ejecutivo, tabla por
      principio, cumplimiento por objetivo, listado de brechas y detalle completo.
- [x] `/reporte?demo=1` renderiza el informe con los datos de ejemplo sin tocar
      lo guardado (atajo para el ensayo de la demo).

### Verificación ejecutada

- `npm run build` compila y `npm run lint` pasa sin errores ni warnings.
- Prueba de interacción en el navegador (Chrome headless) contra `npm run dev`:
  - "Cargar ejemplo" → 65% global, 23/23 evaluados, madurez 2.43.
  - Recargar la página conserva los datos (localStorage) ✓.
  - Cambiar 11.2.1 de *Cumple* a *No cumple* recalcula el global a 61% ✓.
  - Nivel "Optimizado" → nota derivada 5 ✓.
  - Filtro "No cumple" deja visibles solo las fichas en incumplimiento ✓.
  - `/reporte` lee lo capturado: 60.9% y 9 brechas ✓.
  - Sin errores de consola.

> Nota técnica: `useEvaluacion` usa `useSyncExternalStore` (no `useEffect` +
> `setState`). Es lo que exige la regla `react-hooks/set-state-in-effect` del
> lint de React 19 y además resuelve bien la hidratación, porque el servidor no
> puede leer `localStorage`.

Pendiente / siguientes pasos:

- [ ] Evidencias adjuntas por control (nombre de archivo o enlace).
- [ ] Plan de acción por brecha (responsable, fecha compromiso).
- [ ] Exportación a Excel/CSV de la matriz de controles.
- [ ] Comparación entre dos evaluaciones (evolución de madurez).
- [ ] Ponderación por criticidad del control (hoy todos pesan igual).
- [ ] Mapa de calor de riesgo (control 11.7.1 pide matriz y mapa de calor).

## 5. Notas y riesgos

- **Cuidado con la carpeta de trabajo.** En `Downloads/capture-the-report-main/`
  conviven dos directorios:
  - `capture-the-report/` → **el repositorio real**: tiene `.git`, remoto
    `estrategiayseguridad/capture-the-report` y la rama **`equipo-11`**. Aquí se
    trabaja.
  - `capture-the-report-main/` → copia suelta de un ZIP, **sin git**. La primera
    iteración se escribió ahí por error y luego se movió al repo. No usarla.
- La rama del equipo es `equipo-11` (con guion), igual que el resto de las ramas
  del repositorio.
- Todos los datos de demo son ficticios (Banco Demo, S.A.). No pegar en el
  prototipo hallazgos, IPs o nombres reales de clientes.
- El reporte se genera con la función de impresión del navegador; no se agregó
  librería de PDF para no sumar dependencias.
