# 📐 Planteamiento — Equipo 01

> ⛔ **Completar este documento ANTES de escribir código.** Es obligatorio, se evalúa (35% del puntaje), y es lo que hace que el agente de IA trabaje bien: un planteamiento claro = un prototipo que avanza solo.
>
> Tiempo sugerido: 30–40 minutos entre todo el equipo. Sean concretos — frases cortas valen más que párrafos.

## 1. Equipo

- **Número de equipo:** 01
- **Integrantes:** Ernesto Guzman, Rene Contreras, Karelys Bruzual, Crystina Campos, Kevin Xutuc
- **Nombre del prototipo:** Rinde

## 2. El problema

_¿Qué reporte o proceso duele hoy? Sean específicos._

- **¿Qué reporte/proceso es?** El reporte mensual de gastos de facturas por proyecto, departamento o cliente, armado a mano en el cierre contable (días 1 al 5 de cada mes).
- **¿Quién lo sufre y con qué frecuencia?** Administración y líderes de proyecto, todos los meses, en la ventana de cierre.
- **¿Cuánto tiempo toma hoy y por qué?** ~5 minutos por factura: copiar número y motivo, dar formato y revisar que no se haya perdido el archivo.
- **¿Qué es lo peor del proceso actual?** Lo tedioso, los errores de digitación y las facturas que se borran o extravían antes de entrar al reporte.

## 3. La solución

_En 2–3 frases: ¿qué va a hacer el prototipo?_

- **¿Qué hace?** Rinde captura la factura desde el teléfono (cámara + OCR local del DTE), la adjudica a departamento / cliente / proyecto, y recorre autorización, conciliación SAT y reembolso hasta el dashboard y el XLSX de cierre.
- **¿Qué deja de hacer el humano gracias a esto?** Deja de digitar el número de DTE, perseguir archivos sueltos y armar el Excel de reembolsos a mano. Solo confirma lo que el OCR leyó y valida excepciones.
- **¿Dónde encajaría en la futura plataforma unificada de reportería?** Un **panel + generador**: conecta la captura del gasto con autorización, conciliación y un reporte de cierre reutilizable.

## 4. El flujo

_El camino de punta a punta. Complétenlo como una lista de pasos:_

1. **Entrada:** foto o imagen de la factura (cámara del teléfono). OCR local extrae DTE, total, fecha y proveedor; el empleado corrige y elige depto / cliente / proyecto.
2. **Proceso:** el gasto entra a autorización (el gerente no se autoaprueba). Administración concilia documentos SAT, registra reembolsos (también parciales) y deja bitácora.
3. **Salida:** dashboard ejecutivo con datos reales, reporte imprimible y XLSX/ZIP por colaborador.
4. **¿Quién valida antes de que se use/envía?** El empleado confirma el DTE; el gerente autoriza; admin concilia y reembolsa.

```
[Cámara + OCR] ──▶ [Confirmar DTE y adjudicar] ──▶ [Autorizar] ──▶ [SAT / match] ──▶ [Reembolsar] ──▶ [Dashboard + XLSX]
```

## 5. Alcance del prototipo de HOY

_Con ~3 horas de desarrollo, sean brutalmente realistas:_

- **Hoy SÍ se demuestra:**
  1. Flujo empleado: login, cámara/OCR, corrección de DTE, envío
  2. Autorización, reembolso (parcial), dashboard real y export XLSX
  3. Ingesta SAT (XML/JSON), matching y bitácora
- **Hoy NO (queda para después):**
  - Certificador FEL SAT de producción / firma electrónica
  - App nativa iOS/Android (hoy es web móvil)
- **Datos de entrada para la demo:** seed `npm run seed` (ACME, NorteLogística, Clínica Andes) y una foto real de factura para el OCR

## 6. Reparto rápido

- ¿Quién maneja el agente / código? Equipo completo
- ¿Quién prepara datos y prueba el flujo? Equipo completo
- ¿Quién arma el pitch y la demo? Un representante del equipo

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
