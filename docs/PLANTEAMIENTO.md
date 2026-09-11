# 📐 Planteamiento — Equipo XX

> ⛔ **Completar este documento ANTES de escribir código.** Es obligatorio, se evalúa (35% del puntaje), y es lo que hace que el agente de IA trabaje bien: un planteamiento claro = un prototipo que avanza solo.
>
> Tiempo sugerido: 30–40 minutos entre todo el equipo. Sean concretos — frases cortas valen más que párrafos.

## 1. Equipo

- **03:**
- **Integrantes: *Marvin Chigüil, Guillermo López, Dany Rivas, Oscar Laroj, Melissa Chávez*
- **Nombre del prototipo: Informe Diario SOC-SIEM** (pónganle nombre, es más divertido)

## 2. El problema

_¿Qué reporte o proceso duele hoy? Sean específicos._

- **¿Qué reporte/proceso es? Reporte de alertas diarías y tickets relacionados con SIEM** (ej. "el reporte semanal de escaneos que se arma a mano en Word")
- **¿Quién lo sufre y con qué frecuencia? Equipo CSC y se realizado diariamente** (ej. "los consultores de VAPT, cada lunes")
- **¿Cuánto tiempo toma hoy y por qué? Toma mínomo una hora, por las tres secciones principales. Cantidad de alertas generadas en Elastic, cantidad de tickets abiertos y cantidad de tickets generados durannte el día** (ej. "2 horas: copiar datos del escáner, dar formato, revisar")
- **¿Qué es lo peor del proceso actual? La búsqueda de alertas en Elastic y la búsqueda de tickets en Halo**

## 3. La solución

_En 2–3 frases: ¿qué va a hacer el prototipo?_

- **¿Qué hace? Automatiza las 3 secciones de alertas y tickets**
- **¿Qué deja de hacer el humano gracias a esto? El proceso manual de revisión de tickets y alertas**
- **¿Dónde encajaría en la futura plataforma unificada de reportería? Es un generador, pues obtendría la información y ahorra el proceso manual** (¿es un generador? ¿un conector? ¿un validador? ¿un panel?)

## 4. El flujo

_El camino de punta a punta. Complétenlo como una lista de pasos:_

1. **Entrada:** Recive un CSV(ej. "un CSV exportado del escáner" — usen los datos de `data/`)
2. **Proceso:** Se hace el resumen de tickets abiertos y generados (ej. "agrupa por severidad, redacta resumen con IA")
3. **Salida:** Un Reporte con los tickets abiertos y generados el día actual (ej. "un reporte HTML con branding listo para imprimir")
4. **¿Quién valida antes de que se use/envíe? Cliente**

```
[Entrada] ──▶ [Paso 1] ──▶ [Paso 2] ──▶ [Salida]
```
_(Opcional: dibujen el flujo con más detalle)_

## 5. Alcance del prototipo de HOY

_Con ~3 horas de desarrollo, sean brutalmente realistas:_

- **Hoy SÍ se demuestra:** (máximo 3 cosas — el camino feliz)
  1. Reducción de tiempo en generación de tickets
  2. Reudcción de tiempo en análisis
  3.
- **Hoy NO (queda para después):**
  -
- **Datos de entrada para la demo:** (¿cuál archivo de `data/` o qué dato sintético?)

## 6. Reparto rápido

- ¿Quién maneja el agente / código? Marvin, Dany
- ¿Quién prepara datos y prueba el flujo? Melissa, Oscar
- ¿Quién arma el pitch y la demo? Marvin

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
