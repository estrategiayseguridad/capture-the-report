# Reporte Mensual SOC — Equipo 02

## Qué hace

Automatiza el reporte mensual de tickets del SOC que hoy se arma a mano a partir de un export de Halo ITSM:

1. Se sube el CSV exportado de Halo ITSM (trae todos los clientes mezclados, del rango de fechas que se haya elegido en Halo).
2. Se filtra por cliente.
3. La web calcula las métricas y genera los gráficos: historial de tickets, tipos de ticket, tickets por producto/herramienta, estado de los tickets, y SLA de incidentes / SLA de solicitudes.
4. Redacta automáticamente la introducción, el análisis de resultados y la recomendación a partir de esas métricas.
5. Descarga el reporte como documento **Word (.docx)** siguiendo la estructura estándar del equipo: Portada, Introducción, Historial de tickets, Tipos de Tickets, Tickets por herramienta o producto, Estado de los tickets, SLA (Incidentes / Solicitudes), Análisis de Resultados, Recomendación, Anexo.

Todo corre en local, sin base de datos: el CSV se procesa en memoria en cada generación.

## Cómo correrlo

Requisitos: **Node.js >= 20.9** (Next.js 16 no arranca con versiones anteriores).

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

En la web:

- Click en **"Usar dato de ejemplo"** para probar de inmediato con el CSV sintético incluido en `data/halo-itsm-ejemplo.csv` (4 clientes ficticios, ~260 tickets, 6 meses), o
- Click en **"Subir CSV de Halo ITSM"** para cargar un export propio (ver formato de columnas abajo).
- Elegir el cliente en el selector.
- Revisar el reporte en pantalla (métricas, gráficos, narrativa).
- Click en **"Descargar reporte Word"** para obtener el `.docx` final.

### Formato de CSV esperado

Columnas (en este orden, con estos nombres exactos en el header):

```
Cliente,TicketID,FechaCreacion,FechaCierre,Categoria,Tipo,Producto,Estado,Prioridad,SLA_Cumplido
```

- `Categoria`: `Incidente` o `Requerimiento`.
- `Estado`: `Abierto`, `En espera`, `Resuelto` o `Con el usuario`.
- `SLA_Cumplido`: `Si`, `No`, o vacío si el ticket aún no cierra.
- `FechaCreacion` / `FechaCierre`: formato `YYYY-MM-DD`.

## Qué quedó pendiente

- La redacción (introducción, análisis, recomendación) es generada con reglas a partir de las métricas, no con una llamada a un LLM real — es el punto donde se conectaría un modelo de IA más adelante.
- El Word incluye las secciones con tablas de datos, no imágenes de los gráficos (los gráficos interactivos solo se ven en la web).
- Sin login, sin historial de reportes generados, sin envío automático por correo, sin exportación a PDF — queda para una siguiente iteración (ver `docs/PLANTEAMIENTO.md`).
- Falta soportar más de un archivo/periodo a la vez (comparar mes contra mes).

## Nota de entorno

Si al correr `npm run dev` aparece un error de `lightningcss` (`Cannot find module '.../lightningcss.darwin-x64.node'` o similar), es un binario nativo corrupto de una instalación previa: borrar `node_modules` y volver a correr `npm install` lo resuelve.
