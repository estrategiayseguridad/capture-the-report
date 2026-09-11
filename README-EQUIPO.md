# CSC Report Automation

Aplicación web para automatizar reportes mensuales del Cyber Shield Center. Incluye la arquitectura base, la importación XLSX y la **fase 3: gráficas editables de estados y tickets del período**, sin persistencia de tickets ni generación de documentos. Consulta [la guía de importación](docs/IMPORTACION-XLSX.md) y [la guía de gráficas](docs/GRAFICAS.md) para probar cada flujo y revisar sus archivos.

## Requisitos e inicio

Node.js 22.12 o superior (recomendado: rama 22 LTS), npm y una terminal en la raíz del repositorio. La instalación inicial descarga dependencias; la interfaz no depende de fuentes remotas.

```powershell
npm ci
Copy-Item .env.example .env
npm run db:generate
npm run db:deploy
npm run dev
```

La copia de `.env` es únicamente para la primera instalación: conserva un archivo existente. En macOS/Linux usa `cp .env.example .env`.

Abrir **http://localhost:3000**; redirige a **/dashboard**.

`DATABASE_URL="file:./prisma/dev.db"` configura SQLite. Ejecutar los comandos desde la raíz mantiene la misma ruta para Prisma CLI y el adaptador. La base local y los archivos generados no se versionan. No hay seed ni datos de prueba.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo local |
| `npm run build` | Generar Prisma Client y compilar producción |
| `npm start` | Servir la compilación de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generar tipos de rutas y comprobar TypeScript |
| `npm run format` | Formatear código propio y componentes UI |
| `npm run test:e2e` | Verificar navegación, importación y edición de gráficas en escritorio y móvil sobre una compilación existente |
| `npm run test:unit` | Probar importación, agrupación de gráficas, validación y conservación de datos fuente |
| `npm run db:validate` | Validar esquema Prisma |
| `npm run db:generate` | Generar Prisma Client tras instalar o modificar el esquema |
| `npm run db:deploy` | Aplicar migraciones existentes, incluida la inicial |
| `npm run db:migrate` | Crear una migración durante desarrollo (nombre interactivo) |
| `npm run db:studio` | Inspeccionar la base local |

## Pantallas

| Ruta | Estado |
| --- | --- |
| `/dashboard` | Cuatro indicadores iniciales y acceso a nuevo reporte |
| `/reportes/nuevo` | Importación temporal, resúmenes, tabla paginada y paso de gráficas editables |
| `/reportes` | Tabla vacía con siete columnas |
| `/historial` | Espacio reservado al historial anual |
| `/configuracion` | Secciones visuales para clientes, SLA y plantillas |

Los ceros del dashboard y los estados vacíos de historial siguen siendo marcadores iniciales de UI, no consultas a la base. El menú tiene estado activo, navegación de escritorio y panel móvil con cierre por Escape y manejo de foco. `POST /api/reportes/importar` recibe FormData y procesa el archivo en memoria; no hay operaciones CRUD ni cambios de Prisma en esta fase.

Para las pruebas de navegador, ejecutar una vez `npx playwright install chromium`, luego `npm run build` y `npm run test:e2e`. Las pruebas levantan y cierran su propio servidor en el puerto 3100, que debe estar libre. No insertan registros en SQLite.

## Arquitectura

```text
prisma/
  schema.prisma
  migrations/
tests/
  navigation.spec.ts
  import.spec.ts
  charts.spec.ts
  fixtures/excel.ts
  fixtures/charts.ts
  unit/excel.spec.ts
  unit/charts.spec.ts
src/
  app/
    dashboard/
    reportes/nuevo/
    historial/
    configuracion/
    api/reportes/importar/ # Route Handler Node.js
  components/
    layout/               # shell, sidebar y encabezados
    dashboard/            # tarjetas
    reports/              # resultados, advertencias, resúmenes y tablas
    forms/                # formulario funcional de importación
    ui/                   # componentes shadcn/ui
    charts/               # formularios, validación visual y barras Chart.js
    sla/                  # reservado
  services/
    excel/                # lectura, detección de hoja, normalización y mapeo
    sla/
    charts/               # agrupación pura de Ticket[] y adaptación de etiquetas
    word/
  config/                 # navegación y constantes SLA
  types/                  # tipos de dominio independientes de Prisma
  validators/             # contrato Zod del formulario
  lib/                    # utilidades UI y acceso servidor a Prisma
  templates/              # reservado
  generated/
    prisma/               # generado por Prisma, ignorado por Git
    charts/               # reservado para artefactos
    reports/              # reservado para artefactos
```

Las páginas componen la UI. React Hook Form gestiona los campos y Zod valida el cliente, período y metadatos del archivo tanto en la UI como en el servidor. SheetJS lee el workbook exclusivamente en Node.js; React muestra el JSON de resultado, sin procesar Excel en el navegador. La importación no filtra por cliente o período: conserva todas las filas de la hoja elegida, y esos campos identifican el contexto seleccionado.

`src/lib/prisma.ts` expone `getPrisma()` únicamente en servidor y reutiliza la conexión. La UI no importa modelos Prisma. Los futuros servicios recibirán tipos de dominio; el acceso a persistencia permanecerá fuera de componentes visuales.

`Client` tiene una relación 1:N con `Report`. Se usa un índice por cliente/año/mes y borrado restringido de clientes con reportes. No se impone todavía un reporte único por período: esa regla se definirá en una fase de negocio. `createdAt` representa creación; la fecha real de generación se definirá al implementar ese flujo.

### PostgreSQL en una fase posterior

1. Cambiar el proveedor del esquema a `postgresql` y `DATABASE_URL`.
2. Sustituir el adaptador SQLite de `lib/prisma.ts` por el adaptador PostgreSQL.
3. Generar un nuevo historial de migraciones para PostgreSQL; el SQL de SQLite no se reutiliza directamente.
4. Migrar datos existentes y regenerar Prisma Client.

Los tipos de dominio y componentes no necesitan cambiar por el proveedor. No se promete una migración de datos automática.

## Pendiente

Persistencia desde UI, historial real, gráfica histórica, cálculos SLA, información complementaria, Word, PDF, autenticación, IA y entrega automática. TMAD no se utiliza. Las dos gráficas actuales usan Chart.js en el navegador; no hay generación de PNG en servidor ni dependencias de documentos.

Las constantes SLA contienen CRITICA (10 min/4 h/95%), ALTA (10 min/8 h/95%), MEDIA (15 min/24 h/90%) y BAJA (15 min/48 h/90%).

Referencias de configuración: [Prisma SQLite](https://www.prisma.io/docs/orm/overview/databases/sqlite), [shadcn/ui](https://ui.shadcn.com/docs/installation/manual) y [React Hook Form resolvers](https://github.com/react-hook-form/resolvers). Las convenciones Next.js se verificaron en las guías de la versión instalada en `node_modules/next/dist/docs/`.
