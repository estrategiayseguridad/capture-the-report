# 📐 Planteamiento — Equipo de Gestión de Eventos

> ⛔ **Completar este documento ANTES de escribir código.**

## 1. Equipo
- **Número de equipo:** 04
- **Integrantes:** Evander Ramirez, Alejandra Morales, Geovani Milian, Pamela Coronado, Gerber Villegas.
- **Nombre del prototipo:** EventPulse 360

## 2. El problema
- **¿Qué reporte/proceso es?** Gestión manual de eventos (invitaciones, control de asistencia, seguimiento post-evento y reportes de ROI para sponsors) dispersos en hojas de cálculo.
- **¿Quién lo sufre y con qué frecuencia?** Marketing y Ejecutivos de cuenta (CAMs), en cada evento (mensual/bimensual).
- **¿Cuánto tiempo toma hoy y por qué?** Varios días post-evento: consolidar listas, cruzar asistencia real, perseguir ejecutivos para el estatus de leads y armar reportes manuales para sponsors.
- **¿Qué es lo peor del proceso actual?** Pérdida de leads por seguimiento tardío (enfriamiento) e incapacidad de justificar el ROI a patrocinadores por falta de datos.

## 3. La solución
- **¿Qué hace?** Centraliza el ciclo de vida del evento: desde la segmentación de asistentes hasta la asignación en tiempo real de leads a ejecutivos (CAMs).
- **¿Qué deja de hacer el humano gracias a esto?** Tabular asistencias manualmente, perseguir ejecutivos para actualizar estados y crear reportes de patrocinio desde cero.
- **¿Dónde encajaría en la futura plataforma unificada?** Módulo Core de "Marketing & Sales Event Orchestration", actuando como conector entre encuestas, asistencia y CRM.

## 4. El flujo
1. **Entrada:** Listado de asistentes (CSV) con datos de registro y perfil.
2. **Proceso:** 
   - Cálculo de proyección de asistencia (histórico).
   - Clasificación por perfil (técnico vs gerencial).
   - Asignación automática de leads a ejecutivos (CAMs).
3. **Salida:** Dashboard de estatus en tiempo real: leads asignados, pendientes y métricas para sponsors.
## 5. Alcance del prototipo de HOY
- **Hoy SÍ se demuestra:**
  1. Interfaz para subir el listado de asistentes (CSV).
  2. Motor de segmentación y asignación de ejecutivos.
  3. Dashboard visual que muestra el estatus de los leads.
  4. Pestaña de eventos con el histórico: los eventos ya analizados y el histórico de referencia que alimenta la proyección de asistencia.
- **Hoy NO (queda para después):** Integración con Mailchimp, envío automático de correos, lectura directa de los `.xlsx`, exportación nativa a PDF (se resuelve con la impresión del navegador), empuje del estatus al CRM.
- **Datos de entrada para la demo:** `data/asistentes-demo.csv`

## 6. Reparto rápido
- **¿Quién maneja el agente / código?** [Nombre]
- **¿Quién prepara datos y prueba el flujo?** [Nombre]
- **¿Quién arma el pitch y la demo?** [Nombre]
---

### Ejemplo express

_Así se ve un planteamiento bien llenado (no lo copien, es solo la referencia del nivel de detalle):_

- **Problema:** el resumen semanal de escaneos se arma a mano en Word — 2 horas cada lunes, copiando y pegando del escáner.
- **Quién lo sufre:** los consultores de VAPT, todas las semanas.
- **Solución:** una web donde subes el CSV del escáner y te devuelve el resumen ya redactado, listo para revisar.
- **Flujo:** subir CSV → parsear filas → agrupar por severidad → redactar el resumen con IA → mostrar un HTML imprimible.
- **Alcance de HOY:** (1) subir el CSV de `data/`, (2) ver el reporte generado en pantalla.
- **Hoy NO:** login, guardar histórico, exportar a PDF.
- **Dato de demo:** `data/escaneo-ejemplo.csv`.
