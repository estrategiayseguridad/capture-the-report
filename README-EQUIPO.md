# Cámara Check — Equipo 11

Panel de recolección de datos y generación de documentación de cumplimiento de
los **Lineamientos de Seguridad para los Participantes en las Cámaras de
Compensación Bancaria (CCB) y Automatizada (CCA)** — Marco de Referencia para la
Seguridad de la Información v2023 (ICG).

## Qué hace

El auditor captura los **23 controles** obligatorios del lineamiento y la
aplicación calcula el cumplimiento y la madurez hacia arriba —
**control → objetivo → principio → global** — para luego generar el informe
listo para entregar.

Por cada control se captura:

| Campo | Valores |
|---|---|
| Nivel de clasificación | Cumple / No cumple |
| Nivel de madurez | No controlable, Inicio, Repetible, Definido, Administrado, Optimizado |
| Nota nivel de madurez | 0–5, **derivada automáticamente** del nivel de madurez |
| Observaciones | texto libre |
| Comentarios | texto libre |

Y se obtiene:

- **Panel** (`/`): cumplimiento global, por principio y por objetivo,
  recalculado en vivo; filtros *Todos / Pendientes / No cumple*; autoguardado en
  el navegador; exportar e importar la evaluación en JSON.
- **Informe** (`/reporte`): portada con datos de la evaluación, resumen
  ejecutivo, tabla de cumplimiento por principio, cumplimiento por objetivo,
  listado de controles que no cumplen con sus observaciones, y matriz detallada
  de los 23 controles. Botón **Imprimir / Guardar PDF**.

## Cómo correrlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

Otros comandos:

```bash
npm run build   # build de producción
npm start       # servir el build
npm run lint
```

## Cómo probarlo en 30 segundos

1. Abre <http://localhost:3000>.
2. Pulsa **Cargar ejemplo** → se llena la evaluación completa de un participante
   ficticio (*Banco Demo, S.A.*): 65.2% de cumplimiento, madurez 2.43 / 5, 8
   controles en incumplimiento.
3. Despliega el objetivo **11.2** y cambia el nivel de clasificación o el nivel
   de madurez de un control → observa cómo se recalculan al instante el
   porcentaje del objetivo, del principio y el global.
4. Pulsa **Generar reporte** y luego **Imprimir / Guardar PDF**.

Atajo para la demo: <http://localhost:3000/reporte?demo=1> abre el informe con
los datos de ejemplo sin tocar lo que tengas capturado.

## Cómo se calcula el cumplimiento

- **% de cumplimiento** de un objetivo/principio/global = controles en estado
  *Cumple* ÷ **total** de controles de ese nivel. Un control sin capturar no
  cuenta como cumplido, por lo que baja el porcentaje; el avance de la
  recolección se muestra por separado (`n/total evaluados`).
- **Madurez promedio** = promedio de las notas (0–5) de los controles **ya
  evaluados**; los pendientes se excluyen para no sesgar el promedio a 0.
- Hoy **todos los controles pesan igual**. Ponderar por criticidad quedó como
  siguiente paso.

## Estructura del código

```
src/
├─ lib/
│  ├─ lineamientos.ts   Catálogo: 4 principios / 7 objetivos / 23 controles
│  ├─ evaluacion.ts     Tipos, niveles de madurez, cálculo de cumplimiento
│  ├─ useEvaluacion.ts  Estado + persistencia en localStorage
│  └─ ejemplo.ts        Evaluación sintética de demo
└─ app/
   ├─ page.tsx          Panel de captura + resumen
   ├─ reporte/page.tsx  Informe imprimible
   └─ components/       FichaControl, Medidores
```

Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. **Sin base de
datos ni servicios externos**: la evaluación vive en `localStorage` y se
comparte como JSON.

## Datos

Todos los datos incluidos son **ficticios** (*Banco Demo, S.A.*). No peguen en
el prototipo hallazgos, IPs o nombres de clientes reales.

## Qué quedó pendiente

- Adjuntar evidencias por control (archivo o enlace).
- Plan de acción por brecha: responsable y fecha compromiso.
- Exportación a Excel/CSV de la matriz de controles.
- Comparar dos evaluaciones para ver la evolución de la madurez.
- Ponderación de controles por criticidad.
- Mapa de calor de riesgo (lo pide el propio control 11.7.1).
- Persistencia multiusuario y control de versiones del informe.

## Documentación relacionada

- [docs/PLANTEAMIENTO.md](docs/PLANTEAMIENTO.md) — problema, solución y alcance.
- [docs/DOC.md](docs/DOC.md) — texto del lineamiento (fuente de los controles).
- [context.md](context.md) — bitácora de decisiones e iteraciones.
