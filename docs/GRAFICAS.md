# Gráficas del reporte CSC — fase 3

La fase 4 agregó el tercer paso **Historial** y habilitó el botón Continuar hacia él. Consulta [la guía de historial anual](HISTORIAL.md) para su persistencia; esta guía describe las dos gráficas del período.

La ruta `/reportes/nuevo` incorpora dos pasos: **Importación** y **Gráficas**. Se reutiliza el resultado de la importación existente; cambiar de paso no lee otra vez el XLSX ni consulta Prisma.

## Arquitectura y datos temporales

`ReportImport` conserva los tickets y `ReportChartsConfig`, que contiene únicamente las configuraciones aplicadas. Los formularios mantienen borradores separados con React Hook Form; Zod valida los campos. Los servicios puros calculan los valores detectados desde `Ticket[]`. El componente `SimpleBarChart` recibe datos independientes de React y dibuja las dos gráficas con Chart.js.

- **Generar / Actualizar gráfica** aplica el formulario válido. Escribir no cambia la vista previa.
- **Restablecer valores** restaura tanto el formulario como la vista previa a los datos detectados.
- Un total distinto del número de tickets importados muestra una advertencia, pero permite aplicar el ajuste.
- Cantidades negativas, fraccionarias, vacías, texto, NaN y números fuera del rango entero seguro no se aplican. Tampoco se admiten totales fuera del rango entero seguro.
- Los tipos y severidades de las filas manuales son obligatorios. No se admiten combinaciones repetidas en el formulario (ignorando mayúsculas y espacios exteriores); se debe editar la fila existente. Debe quedar al menos una fila; sus cantidades pueden ser cero.
- Closed, With User y Open siempre existen. Los estados desconocidos se enumeran como advertencia: permanecen en los tickets y en el total XLSX, pero no se incluyen en estas tres barras.
- El período conserva tipos y severidades desconocidos. Ordena primero Incidente, Alerta, Solicitud y Solicitud de Reporte; dentro de cada tipo, Crítica, Alta, Media y Baja. Las categorías restantes se ordenan alfabéticamente después de las conocidas. Los nombres conocidos se normalizan en espacios, mayúsculas y acentos sin modificar el ticket fuente.
- Volver entre pasos conserva el archivo, los tickets, los borradores y las vistas previas. Cambiar los campos de importación o iniciar otra importación descarta el resultado anterior y sus gráficas. Recargar o salir de esta página pierde el estado temporal.
- Cada vista previa ofrece una tabla accesible con los valores aplicados. Las etiquetas largas se dividen en líneas y las categorías numerosas usan desplazamiento horizontal dentro de la gráfica.

No se persisten tickets ni configuraciones de estas dos gráficas. **Continuar** lleva ahora al historial anual, que guarda sus conteos mensuales en un modelo independiente. SLA, Word, PDF e imágenes PNG en servidor siguen pendientes.

## Archivos creados y estructura relevante

```text
docs/
  GRAFICAS.md
src/
  types/chart.ts
  validators/chart.ts
  services/charts/
    chart-data.service.ts
  components/
    charts/
      simple-bar-chart.tsx
      chart-validation-message.tsx
      ticket-status-chart-form.tsx
      period-tickets-chart-form.tsx
    reports/
      report-charts.tsx
tests/
  charts.spec.ts
  fixtures/charts.ts
  unit/charts.spec.ts
```

Archivos modificados: `src/components/reports/report-import.tsx`, `src/services/charts/README.md`, `README-EQUIPO.md`, `package.json` y `package-lock.json`.

Dependencias nuevas: **chart.js 4.5.1** y **react-chartjs-2 5.3.1**. Las etiquetas de valores usan un pequeño plugin tipado local; no se agregó otra biblioteca de gráficas, de etiquetas ni de estado global.

## Probar manualmente

En una instalación existente:

```powershell
npm ci
npm run db:generate
npm run dev
```

Para instalar desde cero, sigue primero las instrucciones de `.env` y migraciones en [README-EQUIPO.md](../README-EQUIPO.md). Esta fase no necesita nuevas migraciones.

1. Abre **http://localhost:3000/reportes/nuevo**. Entra a Gráficas sin importar: debe aparecer «Primero debe importar y analizar un archivo XLSX.» y el botón de regreso.
2. Regresa, completa cliente/mes/año, selecciona tu XLSX y pulsa **Importar y analizar**. Revisa los tickets, las advertencias y el total de filas válidas.
3. Pulsa **Continuar a gráficas**. Comprueba que los campos muestran los conteos del archivo. Pulsa **Generar / Actualizar gráfica** en cada sección.
4. Cambia una cantidad. La vista previa mantiene su último valor aplicado hasta pulsar el botón; una suma distinta del total muestra advertencia. Aplica el ajuste y abre **Ver datos de la gráfica** para comprobar los valores.
5. Prueba un negativo o una fracción: debe aparecer el error y conservarse la última gráfica válida.
6. En el período agrega una fila con tipo/severidad/cantidad, aplícala y después elimínala y actualiza. Prueba también una combinación repetida.
7. Pulsa **Restablecer valores** en ambas secciones: deben regresar los conteos originales en los formularios y las barras.
8. Vuelve a Importación y verifica que la tabla mantiene todos sus datos originales. Vuelve a Gráficas: el estado se conserva. Recarga y comprueba que requiere importar de nuevo.

## Referencia de junio de 2026

Si el XLSX contiene la distribución descrita en los requisitos, los resultados serán:

| Gráfica | Categoría                   | Cantidad |
| ------- | --------------------------- | -------: |
| Estados | Closed                      |       20 |
| Estados | With User                   |        4 |
| Estados | Open                        |        0 |
| Período | Solicitud / Media           |        3 |
| Período | Solicitud / Baja            |       15 |
| Período | Solicitud de Reporte / Baja |        6 |

Total: **24 tickets**. Media aparece antes de Baja por el orden de severidades solicitado.

**El XLSX real no fue adjuntado a esta fase.** No se pudo contrastar su contenido ni afirmar diferencias reales con estos valores. `tests/fixtures/charts.ts` genera un archivo sintético con esa distribución conjunta para verificar el flujo completo; los conteos de la aplicación siempre se calculan desde los tickets importados.

La fixture sintética anterior de importación (`tests/fixtures/excel.ts`) se conserva: verifica totales marginales, pero tiene una distribución conjunta diferente (Solicitud/Baja 18, Solicitud de Reporte/Baja 3 y Solicitud de Reporte/Media 3). No representa el archivo real ni se utiliza como referencia de aceptación de estas gráficas.

## Verificación automatizada

```powershell
npm run test:unit
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas E2E usan el puerto 3100 y requieren la compilación anterior. `playwright install` se ejecuta una vez por entorno. Los archivos XLSX de prueba se generan en memoria; no contienen datos reales ni se insertan registros en SQLite.

Cobertura: agrupaciones, categorías cero y desconocidas, inmutabilidad, validación, edición y aplicación explícita, restauración, filas manuales, conservación entre pasos, invalidación al cambiar de importación, ausencia de nuevas lecturas y ausencia de desbordamiento de la página en escritorio y móvil. Las pruebas anteriores de importación y navegación también se ejecutan.

Referencias de integración: [react-chartjs-2](https://react-chartjs-2.js.org/) y [Chart.js](https://www.chartjs.org/docs/latest/getting-started/).
