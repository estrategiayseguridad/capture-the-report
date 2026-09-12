# Historial anual de tickets — fase 4

El historial guarda **conteos mensuales por cliente y año** en SQLite. No persiste `Ticket[]`, no crea reportes ficticios y no cambia la importación XLSX ni las reglas SLA.

## Flujo

- `/reportes/nuevo` ofrece Importación, Gráficas e Historial. Los pasos SLA, Información y Vista previa permanecen deshabilitados.
- Al entrar al paso Historial, se vincula el cliente del reporte mediante su nombre y se consultan sus meses guardados. Vincular un cliente puede crearlo, pero no guarda automáticamente ningún mes.
- El período importado se obtiene del contexto seleccionado al importar y su total es `result.tickets.length`. No se deducen meses anteriores de ese XLSX.
- El mes importado se resalta y tiene prioridad visual sobre el conteo guardado. Si difieren, una advertencia muestra ambos valores. Solo **Guardar historial** actualiza la base.
- `/historial` permite recuperar los datos guardados sin importar nuevamente un archivo. Selecciona el cliente y el año correspondientes. El contexto temporal del XLSX está disponible en el flujo del reporte; la pantalla independiente muestra lo persistido.

## Reglas de edición

El formulario siempre contiene los doce meses; sus nombres proceden de `src/lib/months.ts`, que también usa el formulario de importación.

- Un campo vacío representa `null`, no cero. No se crea registro para un mes vacío.
- Un valor `0` sí se guarda y aparece en la gráfica.
- Vaciar un mes previamente guardado **no elimina el registro**. El guardado omite ese campo y vuelve a mostrar el valor existente. No se implementa borrado de historial.
- Se admiten enteros de 0 a 2147483647, el rango de Prisma `Int` compatible con PostgreSQL. No se admiten texto, negativos, decimales ni NaN.
- El origen se guarda como `MANUAL` o `IMPORT`. Un ajuste del conteo importado se guarda como `MANUAL`; el conteo original propuesto desde el XLSX se guarda como `IMPORT`. Un dato guardado sin cambios conserva su origen.
- **Generar / Actualizar gráfica** aplica el borrador a la vista previa y no escribe en la base. Escribir o guardar no cambia automáticamente una gráfica ya generada.
- **Restablecer** consulta otra vez el historial guardado, combina el período importado y restaura campos y gráfica. No elimina ni actualiza registros.
- Cambiar cliente o año consulta exclusivamente esa combinación. Los borradores se descartan al cambiar filtros; guarda primero. Las respuestas de consultas anteriores no se muestran sobre el cliente seleccionado después.
- Cambiar entre los tres pasos del reporte conserva el borrador de historial mientras se mantengan sus filtros. Cambiar la importación descarta su contexto temporal; lo ya guardado permanece en SQLite.

La gráfica usa `SimpleBarChart`, con año dinámico, valores encima de las barras y solo meses registrados. Los meses cortos usan menor ancho de categoría que las etiquetas de tipos/severidades. En pantallas estrechas o con muchas categorías se puede desplazar horizontalmente dentro de la gráfica.

## Prisma y servicio

Migración: `20260912010000_monthly_ticket_history`.

Agrega `MonthlyTicketHistory`: `id`, `clientId`, `year`, `month`, `totalTickets`, `source`, `createdAt` y `updatedAt`. Tiene relación N:1 con `Client` y restricción única `(clientId, year, month)`. El guardado usa `upsert` dentro de una transacción para los meses con valor. Las actualizaciones concurrentes no crean filas duplicadas; la última escritura aplicada determina el valor final.

Agrega `Client.nameKey`, opcional y único, para reutilizar el cliente al importar nuevamente. Se normalizan espacios, mayúsculas y representación Unicode del nombre; se conserva el nombre visible. Los clientes anteriores sin clave pueden vincularse conservando su ID. Si existieran clientes antiguos duplicados con el mismo nombre normalizado, esta fase no fusiona sus historiales.

`history.service.ts` accede a Prisma solo en servidor. `history-data.ts` construye los doce meses, combina los datos importados, detecta diferencias y prepara la gráfica mediante funciones puras. `history.api.ts` comunica los componentes con Route Handlers:

| Endpoint                                    | Función                                          |
| ------------------------------------------- | ------------------------------------------------ |
| `GET /api/clientes`                         | Lista mínima de clientes                         |
| `POST /api/clientes`                        | Vincula o crea el cliente del reporte por nombre |
| `GET /api/historial?clientId=...&year=2026` | Consulta un año; devuelve doce meses             |
| `PUT /api/historial`                        | Valida y guarda los meses con valor              |

No se agregó un módulo de administración de clientes ni dependencias nuevas. El modelo `Report` permanece independiente.

## Probar el caso de referencia

Desde una instalación existente, con `.env` configurado:

```powershell
npm run db:deploy
npm run db:generate
npm run dev
```

La migración ya se aplicó en el entorno de desarrollo de esta fase. En un clon nuevo sigue primero [README-EQUIPO.md](../README-EQUIPO.md).

1. Abre **http://localhost:3000/reportes/nuevo**.
2. Introduce Banco INV, Junio y 2026; importa y analiza tu XLSX.
3. Entra a **3. Historial**. Si el archivo produjo 24 tickets válidos, Junio debe mostrar 24 y «Datos del período actual».
4. Ingresa manualmente los datos del histórico existente:

   | Mes     | Tickets |
   | ------- | ------: |
   | Enero   |      15 |
   | Febrero |      15 |
   | Marzo   |      17 |
   | Abril   |      15 |
   | Mayo    |      23 |

5. Deja Julio–Diciembre vacíos. Pulsa **Guardar historial** y espera la confirmación.
6. Pulsa **Generar / Actualizar gráfica**. Debe mostrar los valores `15, 15, 17, 15, 23, 24` si el conteo importado es 24.
7. Abre **http://localhost:3000/historial**, selecciona Banco INV y 2026. Recarga, vuelve a elegir los filtros y comprueba que los valores siguen disponibles.
8. Cambia a 2027: aparecerán los datos de ese año, o campos vacíos si todavía no existen registros.
9. Para comprobar el conflicto, guarda un valor diferente en Junio desde `/historial`, vuelve a importar el XLSX y entra al paso Historial. La diferencia se advertirá; no se actualizará hasta guardar.
10. Cambia un dato y pulsa **Restablecer** para recuperar lo guardado y, dentro del reporte, el mes del XLSX. Prueba también cero, negativos y fracciones.

El XLSX real de junio no fue adjuntado. El caso automatizado utiliza datos sintéticos y obtiene el total mediante la importación real del archivo sintético, sin fijarlo en los componentes. Los cinco valores anteriores se ingresan manualmente; no se deducen ni se cargan como seed.

## Archivos de esta fase

Creado:

```text
prisma/migrations/20260912010000_monthly_ticket_history/migration.sql
src/
  app/api/clientes/route.ts
  app/api/historial/route.ts
  lib/months.ts
  types/history.ts
  validators/history.ts
  services/history/
    history-data.ts
    history.service.ts
    history.api.ts
  components/history/
    history-workspace.tsx
    history-panel.tsx
    history-editor.tsx
tests/
  setup.ts
  fixtures/history-database.ts
  history.spec.ts
  unit/history.spec.ts
docs/HISTORIAL.md
```

Modificado: `prisma/schema.prisma`, `src/app/historial/page.tsx`, `src/components/forms/new-report-form.tsx`, `src/components/reports/report-import.tsx`, `src/components/reports/report-charts.tsx`, `src/components/charts/simple-bar-chart.tsx`, `playwright.config.ts`, `tests/charts.spec.ts`, `tests/navigation.spec.ts`, `README-EQUIPO.md` y `docs/GRAFICAS.md`.

## Verificaciones

```powershell
npm run db:validate
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Playwright necesita Chromium instalado (`npx playwright install chromium`) y el puerto 3100 libre. Su preparación inicializa y migra exclusivamente `.next/e2e-history.db`; no usa `prisma/dev.db`. Los clientes sintéticos de cada prueba tienen nombres únicos, y la base de pruebas queda como artefacto local ignorado por Git.

Las pruebas cubren meses vacíos y cero, combinación con el XLSX, origen de los datos, datos originales intactos, guardado/recarga, conflictos, validación en UI y API, cliente/año independientes, escritura concurrente, ausencia de duplicados y ausencia de reportes ficticios. También se ejecutan las pruebas anteriores de importación, gráficas y navegación.

Quedan fuera de esta fase SLA y promedios, Word, PDF, análisis, recomendaciones y capturas de plataformas.
