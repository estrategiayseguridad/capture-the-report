# 📐 Planteamiento — Equipo 02

## 1. Equipo

- **Número de equipo:** 02
- **Integrantes:** Franklin (dev/código), Victor Hugo (dueño del proceso, datos y pitch), Lizz (ideas), Charlie II (ideas)
- **Nombre del prototipo:** Reporte Mensual SOC

## 2. El problema

- **¿Qué reporte/proceso es?** El reporte mensual del SOC para cada cliente. Ya existe una plantilla Word estandarizada, pero se arma a mano.
- **¿Quién lo sufre y con qué frecuencia?** Victor Hugo (y quien cubra el proceso), una vez al mes por cada cliente.
- **¿Cuánto tiempo toma hoy y por qué?**
  1. Se exporta manualmente desde Halo ITSM un CSV con un rango de fechas — trae los tickets de **todos** los clientes mezclados.
  2. Se filtra y separa el CSV por cliente.
  3. Se crea un Excel nuevo por cliente para generar los gráficos: historial de tickets, tickets por tipo, tickets por producto/herramienta, estado (abierto, en espera, resuelto, con el usuario) y SLA (incidentes y requerimientos por separado).
  4. Con esos Excels se redacta a mano el Word final siguiendo la plantilla estándar.
- **¿Qué es lo peor del proceso actual?** Es 100% manual y repetitivo: separar por cliente, rehacer los mismos gráficos y volver a redactar las mismas secciones cada mes, para cada cliente.

## 3. La solución

- **¿Qué hace?** Una web donde se sube el CSV exportado de Halo ITSM (todos los clientes, rango de fechas ya elegido en Halo), se selecciona un cliente, y el sistema calcula las métricas, genera los gráficos y redacta el reporte siguiendo la estructura estándar — mostrándolo en pantalla y generando el Word descargable.
- **¿Qué deja de hacer el humano gracias a esto?** Filtrar el CSV a mano, armar los Excels intermedios de gráficos, y redactar manualmente cada sección del Word.
- **¿Dónde encajaría en la futura plataforma unificada de reportería?** Es un **generador**: toma una exportación cruda de una herramienta (Halo ITSM) y produce el documento final listo para revisión humana.

## 4. El flujo

1. **Entrada:** CSV exportado de Halo ITSM (rango de fechas seleccionado por el usuario en Halo, incluye todos los clientes).
2. **Proceso:**
   - Parsear el CSV.
   - Filtrar/separar por el cliente elegido.
   - Calcular métricas y armar gráficos: historial de tickets, tipos de ticket, tickets por producto/herramienta, estado de tickets, SLA de incidentes, SLA de solicitudes.
   - Redactar con IA las secciones de texto (introducción, análisis de resultados, recomendación) a partir de esas métricas.
3. **Salida:** Reporte visible en la web (gráficos + texto) siguiendo la estructura: Portada, Introducción, Historial de tickets, Tipos de Tickets, Tickets por herramienta/producto, Estado de los tickets, SLA (Incidentes, Solicitudes), Análisis de resultados, Recomendación, Anexo — y el mismo reporte generado como documento Word descargable.
4. **¿Quién valida antes de que se use/envíe?** Victor Hugo (dueño del proceso), antes de enviarlo al cliente.

```
[CSV Halo ITSM (todos los clientes)] ──▶ [Filtrar por cliente] ──▶ [Métricas + gráficos + redacción IA] ──▶ [Reporte en web + Word descargable]
```

## 5. Alcance del prototipo de HOY

- **Hoy SÍ se demuestra:**
  1. Subir el CSV de Halo ITSM y filtrar por cliente.
  2. Ver el reporte en la web con gráficos (historial, tipos, producto, estado, SLA incidentes/solicitudes) y el texto redactado.
  3. Generar/descargar el documento Word con la estructura estándar completa.
- **Hoy NO (queda para después):**
  - Login / autenticación.
  - Historial guardado de reportes generados.
  - Envío automático por correo.
  - PDF (se prioriza Word; PDF queda para después si da tiempo).
- **Datos de entrada para la demo:** CSV sintético con columnas al estilo Halo ITSM (cliente, id de ticket, fecha de creación, fecha de cierre, tipo de ticket, producto/herramienta, estado, categoría incidente/solicitud, cumplimiento de SLA).

## 6. Reparto rápido

- **Agente / código:** Franklin.
- **Datos y prueba del flujo:** Victor Hugo (es su proceso el que se automatiza).
- **Pitch y demo:** Victor Hugo.
- **Ideas / apoyo:** Lizz, Charlie II.
