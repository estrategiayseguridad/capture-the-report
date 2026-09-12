# 📐 Planteamiento — Equipo 11

## 1. Equipo

- **Número de equipo:** 11
- **Integrantes:** _(⚠️ completar con los nombres del equipo)_
- **Nombre del prototipo:** **Cámara Check** — panel de cumplimiento para
  participantes de las Cámaras de Compensación

## 2. El problema

- **¿Qué reporte/proceso es?** La evaluación de cumplimiento de los
  *Lineamientos de Seguridad para los Participantes en las Cámaras de
  Compensación Bancaria (CCB) y Automatizada (CCA)* — Marco de Referencia v2023
  de ICG. Hoy se lleva en una hoja de Excel con 23 controles y luego se
  transcribe a un informe en Word.
- **¿Quién lo sufre y con qué frecuencia?** Los consultores de auditoría /
  GRC en cada revisión a un participante (banco, cooperativa, entidad
  financiera). Al menos una vez al año por participante, más los seguimientos.
- **¿Cuánto tiempo toma hoy y por qué?** Entre 3 y 4 horas por informe: llenar
  el Excel, calcular a mano los porcentajes de cumplimiento por objetivo y por
  principio, promediar las notas de madurez, y copiar observaciones y
  comentarios control por control al documento final.
- **¿Qué es lo peor del proceso actual?** Los **cálculos a mano**. Un cambio en
  un solo control obliga a recalcular el objetivo, el principio y el total; las
  fórmulas del Excel se rompen y los porcentajes del informe terminan sin
  cuadrar con el detalle. Además la nota de madurez (0–5) se escribe a mano y se
  desalinea del nivel de madurez seleccionado.

## 3. La solución

- **¿Qué hace?** Una web donde el auditor captura los 23 controles del
  lineamiento (nivel de clasificación, nivel de madurez, observaciones y
  comentarios) y el sistema calcula en vivo el cumplimiento y la madurez por
  control → objetivo → principio → global, para luego generar el informe listo
  para imprimir o guardar como PDF.
- **¿Qué deja de hacer el humano gracias a esto?** Calcular porcentajes,
  promediar notas de madurez, mantener fórmulas de Excel y transcribir el
  detalle al documento final.
- **¿Dónde encajaría en la futura plataforma unificada de reportería?** Es un
  **recolector + generador** con un marco normativo específico: captura
  estructurada según un estándar y produce el documento de salida. El JSON
  exportado puede alimentar después un panel consolidado de varios
  participantes.

## 4. El flujo

1. **Entrada:** el auditor llena el panel control por control (23 controles
   agrupados en 7 objetivos y 4 principios), más los datos de la evaluación
   (participante, auditor, fecha, alcance). También puede **importar un JSON**
   de una evaluación previa para dar seguimiento.
2. **Proceso:** la nota de madurez (0–5) se deriva automáticamente del nivel
   seleccionado; se calcula el % de cumplimiento y la madurez promedio de cada
   objetivo, cada principio y el global.
3. **Salida:** informe imprimible en `/reporte` (resumen ejecutivo, tabla por
   principio, cumplimiento por objetivo, listado de brechas con sus
   observaciones, y matriz detallada de los 23 controles) + export JSON.
4. **¿Quién valida antes de que se use/envíe?** El auditor líder revisa el
   informe generado antes de entregarlo al participante o a ICG. El pie del
   documento lo indica explícitamente.

```
[Captura de 23 controles] ──▶ [Nota de madurez derivada] ──▶ [Rollup control→objetivo→principio→global] ──▶ [Informe imprimible + JSON]
```

## 5. Alcance del prototipo de HOY

- **Hoy SÍ se demuestra:**
  1. Capturar los controles en el panel con los 5 campos definidos y ver el
     cumplimiento y la madurez recalcularse en vivo en los tres niveles.
  2. Generar el informe imprimible con resumen ejecutivo, brechas y matriz de
     detalle (Imprimir → Guardar como PDF).
  3. Guardado automático en el navegador + exportar/importar la evaluación en
     JSON.
- **Hoy NO (queda para después):** login y multiusuario, base de datos,
  adjuntar evidencias, plan de acción con responsable y fecha compromiso,
  exportación a Excel, comparación entre evaluaciones, ponderación por
  criticidad del control, mapa de calor de riesgo.
- **Datos de entrada para la demo:** el botón **"Cargar ejemplo"** llena la
  evaluación completa de un participante ficticio (*Banco Demo, S.A.*,
  65% de cumplimiento, madurez 2.43, 8 brechas). Datos sintéticos, ningún dato
  real de cliente.

## 6. Reparto rápido

_(⚠️ completar con los nombres del equipo)_

- ¿Quién maneja el agente / código?
- ¿Quién prepara datos y prueba el flujo?
- ¿Quién arma el pitch y la demo?

---

## Anexo — El marco normativo

Estructura de tres niveles tomada de [DOC.md](DOC.md), numeral 11:

| Principio | Objetivos | Controles |
|---|---|---|
| Conocer y asegurar su entorno | 11.1, 11.2, 11.3, 11.4 | 14 |
| Conocer y gestionar accesos | 11.5 | 4 |
| Conocer y gestionar Terceros | 11.6 | 1 |
| Gestión de Ciber resiliencia | 11.7 | 4 |
| **Total** | **7** | **23** |

Niveles de madurez y su nota: No controlable (0), Inicio (1), Repetible (2),
Definido (3), Administrado (4), Optimizado (5).
