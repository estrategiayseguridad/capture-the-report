# 📐 Planteamiento — Equipo 10

## Fase 2: importación XLSX

- **Flujo implementado:** cliente y período → archivo XLSX → validación y detección de hoja en servidor → tickets normalizados → resúmenes y tabla de revisión.
- **Regla de tiempo:** conservar Time to Respond en horas decimales y multiplicar por 60 para minutos; Time to Resolve permanece en horas.
- **Calidad de datos:** errores bloquean importación; advertencias conservan registros identificables y señalan números inválidos, valores desconocidos y duplicados. Filas sin Ticket ID se listan como inválidas.
- **Alcance:** importar, validar, transformar y visualizar temporalmente. Sin persistencia, SLA, gráficas, historial anual real, Word/PDF, IA ni envío.
- **Referencia pendiente:** `Reporte INV-Junio (Interno).xlsx` fue descrito, pero no adjuntado. Las verificaciones usan fixtures sintéticos y no acreditan el contenido del archivo real.

Detalle técnico y comprobación manual en `docs/IMPORTACION-XLSX.md`.

## Alcance acordado: CSC Report Automation, fase 1

- **Nombre técnico:** `csc-report-automation`.
- **Problema:** preparar y entregar mensualmente reportes del Cyber Shield Center. El tiempo actual y el ahorro esperado están pendientes de medir con el equipo.
- **Usuarios:** equipo responsable de los reportes mensuales CSC; integrantes y roles por confirmar.
- **Visión:** importar tickets XLSX, normalizar tiempos, mantener historial, calcular SLA y generar un reporte Word corporativo. La revisión y modalidad de entrega se definirán en las siguientes fases.
- **Flujo futuro:** cliente y período → XLSX → tickets normalizados → indicadores y SLA → información complementaria → reporte corporativo.
- **Esta fase:** arquitectura Next.js/TypeScript, layout responsive, cinco pantallas visuales, tipos, constantes SLA y Prisma con Client 1:N Report en SQLite.
- **Fuera de esta fase:** lectura de Excel, conversiones, cálculos SLA, gráficas, Word/PDF, autenticación, IA, envío automático y lógica completa de negocio.
- **Demostración actual:** navegación, estados vacíos y formulario sin procesamiento. Sin datos de prueba ni registros iniciales.
- **Continuidad:** servicios separados por responsabilidad y documentación en `README-EQUIPO.md`; PostgreSQL será una migración posterior de infraestructura y datos.

La plantilla original se conserva debajo para completar las decisiones de equipo y el alcance de la siguiente fase.

---

> ⛔ **Completar este documento ANTES de escribir código.** Es obligatorio, se evalúa (35% del puntaje), y es lo que hace que el agente de IA trabaje bien: un planteamiento claro = un prototipo que avanza solo.
>
> Tiempo sugerido: 30–40 minutos entre todo el equipo. Sean concretos — frases cortas valen más que párrafos.

## 1. Equipo

- **Número de equipo:**
- **Integrantes:**
- **Nombre del prototipo:** (pónganle nombre, es más divertido)

## 2. El problema

_¿Qué reporte o proceso duele hoy? Sean específicos._

- **¿Qué reporte/proceso es?** (ej. "el reporte semanal de escaneos que se arma a mano en Word")
- **¿Quién lo sufre y con qué frecuencia?** (ej. "los consultores de VAPT, cada lunes")
- **¿Cuánto tiempo toma hoy y por qué?** (ej. "2 horas: copiar datos del escáner, dar formato, revisar")
- **¿Qué es lo peor del proceso actual?**

## 3. La solución

_En 2–3 frases: ¿qué va a hacer el prototipo?_

- **¿Qué hace?**
- **¿Qué deja de hacer el humano gracias a esto?**
- **¿Dónde encajaría en la futura plataforma unificada de reportería?** (¿es un generador? ¿un conector? ¿un validador? ¿un panel?)

## 4. El flujo

_El camino de punta a punta. Complétenlo como una lista de pasos:_

1. **Entrada:** ¿qué recibe el prototipo? (ej. "un CSV exportado del escáner" — usen los datos de `data/`)
2. **Proceso:** ¿qué hace con eso? (ej. "agrupa por severidad, redacta resumen con IA")
3. **Salida:** ¿qué produce? (ej. "un reporte HTML con branding listo para imprimir")
4. **¿Quién valida antes de que se use/envíe?**

```
[Entrada] ──▶ [Paso 1] ──▶ [Paso 2] ──▶ [Salida]
```
_(Opcional: dibujen el flujo con más detalle)_

## 5. Alcance del prototipo de HOY

_Con ~3 horas de desarrollo, sean brutalmente realistas:_

- **Hoy SÍ se demuestra:** (máximo 3 cosas — el camino feliz)
  1.
  2.
  3.
- **Hoy NO (queda para después):**
  -
- **Datos de entrada para la demo:** (¿cuál archivo de `data/` o qué dato sintético?)

## 6. Reparto rápido

- ¿Quién maneja el agente / código?
- ¿Quién prepara datos y prueba el flujo?
- ¿Quién arma el pitch y la demo?

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
