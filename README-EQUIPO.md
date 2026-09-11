# Reporte Mensual SOC — Equipo 02

## Qué hace

Automatiza el reporte mensual de tickets del SOC que hoy se arma a mano a partir de un export de Halo ITSM:

1. Se sube el CSV exportado de Halo ITSM (trae todos los clientes mezclados, del rango de fechas que se haya elegido en Halo).
2. Se filtra por cliente.
3. La web calcula las métricas y genera los gráficos: tipos de ticket, tickets por producto/herramienta, estado de los tickets, y SLA de incidentes / SLA de solicitudes.
4. Al pulsar **"Analizar con IA"**, se redacta con IA (API de Anthropic) la introducción, el desglose de tipos de ticket por herramienta y el análisis/recomendación — usando como fuente principal el **asunto real de cada ticket** (columna `Summary` del CSV), no solo los conteos agregados. Es un botón manual a propósito: ajustar cliente, periodo o umbrales de SLA no gasta llamadas a la API por sí solo.
5. Descarga el reporte como documento **Word (.docx)** con la estructura acordada con el equipo: Portada, Índice (tabla de contenido nativa de Word), Introducción, Historial de tickets (tabla + gráfica), Tipos de Tickets en el Periodo (gráfica + análisis por herramienta), Tickets por Herramienta (gráfica), Estado de los Tickets (texto + gráfica + definiciones + tabla de pendientes), SLA (texto + tablas de Incidentes/Solicitudes), Análisis de Resultados, Recomendaciones, Anexo. Las gráficas se incrustan como imagen con las etiquetas de dato visibles (en la web se ven al pasar el mouse; en un Word estático no hay hover, así que quedan fijas).

Todo corre en local, sin base de datos: el CSV se procesa en memoria en cada generación. Lo único que sale de la máquina es la llamada a la API de Anthropic para redactar el texto (ver más abajo qué datos se le envían).

## Cómo correrlo

Requisitos: **Node.js >= 20.9** (Next.js 16 no arranca con versiones anteriores).

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

En la web:

- Click en **"Usar dato de ejemplo"** para probar de inmediato con el CSV sintético incluido en `data/halo-itsm-ejemplo.csv` (4 clientes ficticios, ~240 tickets, 6 meses, mismas columnas que un export real de Halo), o
- Click en **"Subir CSV de Halo ITSM"** para cargar el export real del mes (deja el archivo en `data/local/`, que está excluido de git, y selecciónalo desde ahí).
- Elegir el cliente en el selector.
- Ajustar el **periodo a analizar** (calendarios "Desde" / "Hasta") si no quieres el rango completo del CSV.
- Revisar/ajustar los **umbrales de SLA (horas)** para ese cliente si su contrato es distinto al estándar (panel "Umbrales de SLA"). Se guardan por cliente en el navegador (`localStorage`), no en el repo.
- Click en **"Analizar con IA"** cuando el cliente/periodo/umbrales estén como quieres — ahí sí se llama a Anthropic. Mientras no le des click, el reporte se ve con el texto por reglas (sin costo).
- Revisar el reporte en pantalla (métricas, gráficos, narrativa).
- Click en **"Descargar reporte Word"** para obtener el `.docx` final.

### Formato de CSV esperado

El mismo export nativo de Halo ITSM (todos los clientes juntos, del rango de fechas elegido en Halo). Columnas usadas:

```
Ticket ID, Status, Date Created, Category, ITIL Type, Ticket Type, Client, SLA, Time to Resolve (Decimal), Priority, Date Closed
```

- `Status`: `New`, `In Progress`, `On Hold`, `With User`, `Closed` (se normalizan a Abierto / En espera / Con el usuario / Resuelto).
- `SLA` / `ITIL Type`: se usan para clasificar el ticket como Incidente o Requerimiento.
- `Category`: la herramienta/producto (ej. `Cloudflare>WAF`, `ElasticSearch>SIEM`).
- `Ticket Type`: el tipo de ticket (Alerta, Solicitud, Cambio, etc.).
- `Time to Resolve (Decimal)`: horas reales de resolución — se compara contra el umbral de SLA configurado (por categoría y prioridad) para determinar cumplido/incumplido. Vacío si el ticket sigue abierto.
- `Date Created` / `Date Closed`: formato `M/D/YYYY` (con o sin hora/AM-PM), tal como lo exporta Halo.

Los umbrales de SLA por defecto son: Incidente Alta 4h / Media 8h / Baja 24h, Requerimiento Alta 24h / Media 48h / Baja 72h — son un valor de referencia inicial y se ajustan por cliente desde la propia web si el contrato real es distinto.

## Redacción con IA — qué datos se envían

El botón **"Analizar con IA"** es manual a propósito: cambiar de cliente, mover el rango de fechas o ajustar los umbrales de SLA no llama a la API por sí solo, solo recalcula el reporte localmente (gratis). Requiere una API key de Anthropic en `.env.local` (copiar `.env.example`); sin ella, el reporte sigue funcionando con un texto de respaldo generado por reglas fijas.

A la API de Anthropic se le envía, **por cliente**: el nombre del cliente, las métricas agregadas (conteos por tipo/producto/estado, % de SLA) y el **asunto (`Summary`) de cada ticket de ese cliente** — es la fuente que le permite a la IA describir actividades reales (ej. "bloqueo de IP en WAF", "revisión de certificados mTLS") en vez de un texto genérico.

**Sanitización:** antes de armar el prompt, `src/lib/sanitizar.ts` reemplaza IPs, dominios y hostnames/sensores del asunto por marcadores genéricos (`[IP-1]`, `[DOMINIO-2]`, `[HOST-3]`) — esos datos nunca salen de la máquina en su forma real. Al recibir la respuesta, se restauran los valores reales en el texto final, así que el reporte no pierde detalle. Es una detección heurística (patrones de IP/dominio y una regla para hostnames alfanuméricos), no infalible: puede sobre-redactar algún término técnico ambiguo, pero no debería dejar pasar IPs o dominios reales. El resultado final se guarda en memoria durante la sesión (por cliente + umbrales de SLA) para no volver a llamar a la IA si ya se había redactado.

## Qué quedó pendiente

- Sin login, sin historial de reportes generados, sin envío automático por correo, sin exportación a PDF — queda para una siguiente iteración (ver `docs/PLANTEAMIENTO.md`).
- Falta soportar más de un archivo/periodo a la vez (comparar mes contra mes); "Historial de tickets" hoy es la distribución por tipo del mes cargado, no una tendencia entre meses.
- Los umbrales de SLA por defecto (sección "Cómo correrlo") son un punto de partida razonable, no los tiempos contractuales reales por cliente — hay que confirmarlos y ajustarlos desde el panel de configuración antes de enviar un reporte real.
- El dashboard web y el Word muestran la sección "Historial de tickets" de forma distinta (el web mantiene un gráfico de tendencia mensual, el Word usa la tabla/gráfica por tipo) — pendiente de unificar si hace falta.

## Nota de entorno

Si al correr `npm run dev` aparece un error de `lightningcss` (`Cannot find module '.../lightningcss.darwin-x64.node'` o similar), es un binario nativo corrupto de una instalación previa: borrar `node_modules` y volver a correr `npm install` lo resuelve.
