# Fase 2 — Importación XLSX

## Iniciar y probar

Desde una copia con la fase 1 configurada:

```powershell
npm ci
npm run db:generate
npm run dev
```

Abrir http://localhost:3000/reportes/nuevo. Escribir **Banco INV** en Cliente, seleccionar **Junio**, ingresar **2026**, elegir `Reporte INV-Junio (Interno).xlsx` y pulsar **Importar y analizar**. Cliente se captura como texto: esta fase no crea ni consulta clientes en SQLite. El formulario muestra `Analizando archivo...` y se deshabilita hasta recibir respuesta.

El resultado aparece debajo del formulario: hoja elegida, fila de encabezados, filas leídas, inválidas, advertencias, tarjetas de estados, resúmenes por prioridad/tipo y tabla de tickets (25 por página). Cambiar el formulario borra el resultado anterior para no confundir períodos o archivos. Una nueva importación fallida no conserva un éxito anterior.

Pruebas y comprobaciones:

```powershell
npm run test:unit
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas unitarias no necesitan servidor ni navegador. Las pruebas E2E arrancan un servidor de producción temporal en el puerto 3100; debe estar disponible.

## Resultado esperado del archivo de referencia

Según el requerimiento, no según una inspección del archivo real:

| Dato | Esperado |
| --- | ---: |
| Tickets | Aproximadamente 24 |
| Closed / With User / Open | 20 / 4 / 0 |
| Baja / Media / Alta / Crítica | 21 / 3 / 0 / 0 |
| Solicitud / Solicitud de Reporte | 18 / 6 |

`0.0165048607777773` horas produce `0.990291646666638` minutos internamente y aproximadamente `0.9903` en pantalla. No se reemplaza el original ni se redondea el valor almacenado en memoria. Resolución no se multiplica por 60.

**El XLSX real no fue adjuntado.** No se puede confirmar su nombre de hoja, advertencias, conteos o diferencias reales. `tests/fixtures/excel.ts` genera únicamente archivos sintéticos, incluido un caso con los conteos descritos; no es una copia del archivo de referencia.

## Decisiones y límites

- Una sola dependencia nueva: **SheetJS CE `xlsx` 0.20.3**, desde el [tarball oficial](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/). No se procesa el workbook en el navegador.
- Solo `.xlsx`, hasta **10 MB**. El endpoint limita también el cuerpo real de la petición, incluso sin Content-Length, a 10 MB más 64 KiB de multipart.
- Se verifica firma ZIP, lectura como workbook y partes OOXML. Renombrar CSV/HTML a XLSX no permite importarlos.
- No se evalúan fórmulas, macros ni enlaces. Se leen valores almacenados; las partes de macros y vínculos a libros externos se rechazan. No hay descargas externas ni escritura en `/public`.
- Hasta 30 hojas, 256 columnas y 10 000 filas de datos; se buscan encabezados en las primeras 50 filas. Un rango de hoja que exceda las 10 050 filas físicas también se rechaza. Los límites se informan como errores, sin truncar silenciosamente.
- Si hay varias hojas completas se utiliza la primera según el orden del workbook, con advertencia y lista de candidatas disponible en el resultado. No se fusionan hojas.
- Encabezados: se normalizan espacios y mayúsculas; se conservan original, normalizado e índice. No hay alias arbitrarios. Los encabezados conocidos duplicados se rechazan por ambigüedad.
- Si faltan columnas se muestra la lista de la hoja con más coincidencias; si no se detectan encabezados se listan las siete requeridas.
- Filas vacías se omiten; filas parciales sin ID se listan como inválidas con su número original de Excel. Los registros identificables con advertencias sí se importan.
- Un ID repetido se conserva en todas sus filas y cuenta en los totales. Se muestran IDs y números de fila. La cantidad de duplicados indica IDs distintos repetidos, no filas sobrantes.
- Números: se admiten números finitos y strings numéricos completos con punto o coma decimal y notación científica. No se admiten separadores de miles. Celdas vacías, texto inválido o duraciones negativas producen `null` y una advertencia con valor original. Cero es válido.
- Fechas y horas de Excel se conservan como texto de calendario sin convertirlas a UTC, respetando el sistema de fechas del workbook. Las fechas textuales originales permanecen textuales.
- Estados conocidos: Closed, With User, Open. Prioridades: Crítica, Alta, Media, Baja. Los valores desconocidos se conservan con advertencia y se incluyen en resúmenes. Los tipos de ticket son abiertos a valores futuros.
- Cliente, mes y año seleccionados son contexto de la importación. No filtran filas ni reemplazan la columna Client; no hay comprobación automática de correspondencia con el archivo en esta fase.
- No se crean registros Client, Report ni Ticket. No se modifica Prisma. Todos los resultados se pierden al recargar o abandonar la pantalla.

## Archivos creados

```text
playwright.unit.config.ts
docs/IMPORTACION-XLSX.md
src/
  app/api/reportes/importar/route.ts
  components/reports/
    report-import.tsx
    import-summary.tsx
    import-warnings.tsx
    count-summary.tsx
    tickets-table.tsx
  services/excel/
    excel.service.ts
    sheet-detection.ts
    normalization.ts
    ticket-mapper.ts
  types/excel.ts
  validators/excel.validator.ts
tests/
  fixtures/excel.ts
  unit/excel.spec.ts
  import.spec.ts
```

## Archivos modificados

`package.json`, `package-lock.json`, `playwright.config.ts`, `README-EQUIPO.md`, `docs/PLANTEAMIENTO.md`, `src/app/reportes/nuevo/page.tsx`, `src/components/forms/new-report-form.tsx`, `src/types/ticket.ts`, `src/validators/report.ts`, `src/services/excel/README.md` y `tests/navigation.spec.ts`.

## Fuera de alcance

SLA, promedios de SLA, filtros de Closed para SLA, gráficas, historial anual real, Word, PDF, IA, persistencia de tickets y envío de reportes. Esta fase termina en la revisión visual de los datos importados.
