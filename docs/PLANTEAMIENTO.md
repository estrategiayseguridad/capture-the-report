# 📐 Planteamiento — Equipo 08

> ⛔ **Completar este documento ANTES de escribir código.** Es obligatorio, se evalúa (35% del puntaje), y es lo que hace que el agente de IA trabaje bien: un planteamiento claro = un prototipo que avanza solo.
>
> Tiempo sugerido: 30–40 minutos entre todo el equipo. Sean concretos — frases cortas valen más que párrafos.

## 1. Equipo

- **Número de equipo:** 08
- **Integrantes:** Oscar Gonzalez, Katherine Felipe, Juan Pascual, Katherine Morales
- **Nombre del prototipo:** **REPORTERO CSC** — de la pestaña `DATOS` al informe del cliente, en un clic.

## 2. El problema

_¿Qué reporte o proceso duele hoy? Sean específicos._

- **¿Qué reporte/proceso es?**
  El **Informe mensual de Atención de Alertas y Solicitudes** que el equipo de **CSC** entrega a **Banrural**. Hoy son dos artefactos hechos a mano, en cadena:
  1. `GRAFICAS.xlsx` — se pega el export de **Halo** en la pestaña `DATOS` y a partir de ahí se construyen **5 tablas dinámicas**, **4 gráficas** y **una pestaña por herramienta** (`CLOUDFLARE`, `BEYONTRUST`, `THINKSCANARY`) filtrando manualmente la columna **G (Category)**.
  2. `Reporte de Alertas BANRURAL - <Mes> <Año>.docx` — documento de **12 páginas** donde se re-escriben los conteos, se re-pegan las 4 gráficas y se actualizan las tablas de SLA.

- **¿Quién lo sufre y con qué frecuencia?**
  El equipo de **CSC**, **una vez al mes**, todos los meses, para el cierre del mes anterior. Es trabajo de analista senior gastado en copiar y pegar.

- **¿Cuánto tiempo toma hoy y por qué?**
  Estimamos **entre 4 y 6 horas por cierre**. Como evidencia dura: el `.docx` de Agosto 2026 registra **493 minutos de tiempo de edición acumulado en Word** y **38 revisiones** (`docProps/app.xml`, `revision=38`). El tiempo se va en:
  - refrescar 5 tablas dinámicas y verificar que tomaron todo el rango nuevo;
  - crear y llenar a mano una pestaña por herramienta;
  - re-generar y re-pegar 4 gráficas en el Word;
  - transcribir a mano ~15 números (63 tickets, 15 alertas, 43 solicitudes, 5 solicitudes de reporte, 53 cerrados, 10 pendientes, TPA, TMR…) en párrafos y tablas;
  - redactar la narrativa, que es lo único que realmente requiere criterio.

- **¿Qué es lo peor del proceso actual?**
  **Que el documento no es reproducible y ya arrastra errores silenciosos.** Tres cosas que verificamos en los archivos reales:

  1. **Las gráficas del Word están enlazadas a una ruta local absoluta de una sola máquina:**
     `file:///C:\Users\<analista>\Downloads\REPORTE <CLIENTE> AGOSTO\Libro2.xlsx`
     Nadie más del equipo puede actualizar esas gráficas. Si esa carpeta se mueve o se borra, el informe deja de ser editable.
  2. **Las pestañas por herramienta no cuadran con `DATOS`.** Contienen **47 de los 63 tickets**: solo los de estado `Closed`. Faltan los 16 con estado `With User` (8), `Resuelto` (6) y `On Hold` (2) — entre ellos los tickets `40010` (BeyondTrust) y `40040` (Thinkst Canary), que sí existen en `DATOS` y sí cuentan en las gráficas. **La misma cifra sale distinta según qué hoja mire el cliente.** *(IDs del dataset sanitizado de `data/`.)*
  3. **El agrupamiento por herramienta es inconsistente.** La tabla dinámica de "tickets por herramienta" colapsa `BeyondTrust>Remote Support` + `BeyondTrust>Password Safe` en `BeyondTrust`, pero deja `Cloudflare>WAF` sin colapsar. La regla vive en la cabeza de quien armó el archivo, no escrita en ningún lado.

  Es decir: el proceso no solo es lento, es **frágil y auditable en contra**. Y transcribir a mano 15 números hacia un documento que se le entrega a un banco es exactamente donde un error cuesta credibilidad.

## 3. La solución

_En 2–3 frases: ¿qué va a hacer el prototipo?_

- **¿Qué hace?**
  Una web local donde el analista **sube el Excel exportado de Halo**. REPORTERO CSC lee la pestaña `DATOS`, **separa los tickets por herramienta** leyendo la columna `Category`, **calcula las 5 tablas y dibuja las 4 gráficas** del cierre, y **arma el informe completo** con todos los números ya insertados en la redacción — listo para que el analista solo revise, escriba las 2 secciones de criterio y descargue.

- **¿Qué deja de hacer el humano gracias a esto?**
  Deja de refrescar tablas dinámicas, de filtrar y copiar filas a pestañas por herramienta, de re-pegar gráficas en Word y de transcribir cifras. **El humano solo hace lo que ninguna máquina debería hacer por él: el análisis y las recomendaciones.** Todo lo mecánico —que es donde se cuelan los errores— se calcula una sola vez, de una sola fuente.

- **¿Dónde encajaría en la futura plataforma unificada de reportería?**
  Es un **generador de reportes recurrentes con conector de entrada**. Concretamente aporta tres piezas reutilizables a la plataforma:
  - un **conector** (hoy: export de Halo; mañana: la API de Halo directo);
  - un **motor de métricas** que convierte tickets crudos en el set de indicadores del servicio (por herramienta, tipo, estado, SLA);
  - un **renderizador de plantillas de cliente**, donde "Banrural" es la primera plantilla y el mismo motor sirve para los demás clientes de CSC.

## 4. El flujo

_El camino de punta a punta. Complétenlo como una lista de pasos:_

1. **Entrada:** el archivo `.xlsx` exportado de **Halo** con la pestaña `DATOS` — 17 columnas, una fila por ticket. El demo usa el cierre de **Agosto 2026: 63 tickets, del 03 al 31 de agosto**.
2. **Proceso:**
   - **Parsear** la pestaña `DATOS` (fila 1 = encabezados; `Date Created` viene como serial de Excel y hay que convertirlo a fecha).
   - **Clasificar por herramienta**: partir `Category` en el `>` y quedarse con el prefijo → `Cloudflare` (55), `BeyondTrust` (5), `Thinkst Canary` (3). Una vista por herramienta, generada sola, **con los 63 tickets — no solo los cerrados.**
   - **Agregar las 5 métricas** del informe: tickets por tipo, historial mensual, herramienta × estado, estado, y promedios de TPA/TMR por tipo.
   - **Redactar por plantilla**: inyectar cada cifra en el texto del informe (introducción, alcance, estado, tablas de SLA).
3. **Salida:**
   - **Dashboard en pantalla** con las 4 gráficas y las tablas del cierre.
   - **Vistas por herramienta** (equivalente a las pestañas `CLOUDFLARE` / `BEYONTRUST` / `THINKSCANARY`).
   - **El informe** con la estructura y el orden del `.docx` de Banrural, con los números ya puestos, **descargable como documento abrible en Word** e imprimible a PDF.
4. **¿Quién valida antes de que se use/envíe?**
   El **analista de CSC** revisa el borrador en pantalla y escribe las dos secciones de criterio (*Tipos de tickets en el periodo* y *Análisis de resultados / Recomendaciones*). Luego el **líder de CSC** aprueba antes de enviarlo a Banrural. **El prototipo produce un borrador, nunca envía nada.**

```
                          ┌─ vista CLOUDFLARE ──┐
[Halo .xlsx]              ├─ vista BEYONTRUST ──┤
  pestaña   ──▶ [Parser] ─┼─ vista THINKSCANARY ┼─▶ [Plantilla    ] ──▶ [Informe .doc]
   DATOS      (Category)  │                     │   Banrural       │    + PDF (Ctrl+P)
   63 filas               └─ [Métricas] ────────┘   (texto+cifras) │
                             5 tablas                              │
                             4 gráficas ────────────────────────────┘
                                  │
                                  └──▶ [Dashboard en pantalla]
                                            ▲
                                            └── el analista revisa y
                                                escribe Análisis + Recomendaciones
```

## 5. Alcance del prototipo de HOY

_Con ~3 horas de desarrollo, sean brutalmente realistas:_

- **Hoy SÍ se demuestra:** (máximo 3 cosas — el camino feliz)
  1. **Subir el `.xlsx` de Halo y ver el dashboard del cierre** — las 4 gráficas (historial mensual, tipos de ticket, herramienta × estado, estado) y las tablas, calculadas de la pestaña `DATOS` sin tocar una tabla dinámica.
  2. **Ver las vistas por herramienta generadas solas** desde la columna `Category`, con el conteo cuadrando contra `DATOS` — y mostrar en vivo los tickets que hoy se pierden en el proceso manual.
  3. **Generar el informe de Banrural con las cifras ya insertadas** en la redacción y **descargarlo** para abrirlo en Word.

- **Hoy NO (queda para después):**
  - `.docx` nativo fiel a la plantilla corporativa (fuentes embebidas, portada, encabezados, índice automático). **Hoy generamos un documento que Word abre y respeta el formato básico; el `.docx` pixel-perfect con la plantilla real es el siguiente paso.**
  - **Redacción con IA** de *Análisis de resultados* y *Recomendaciones*: hoy van como campos editables con un borrador armado por plantilla. Sin dependencia de red — si el WiFi se cae, la demo sigue.
  - **Historial multi-mes persistente.** Los 8 meses del gráfico de historial (Enero 73 … Agosto 63) hoy se leen de un JSON en el repo; guardar cierres históricos de verdad es después.
  - Conexión directa a la **API de Halo**, login, usuarios, y multi-cliente (hoy solo la plantilla Banrural).
  - Cálculo de **% de cumplimiento de SLA** contra los umbrales contractuales reales (hoy se muestran TPA/TMR calculados y los umbrales 10 min / 48 h como en el informe de Agosto).

- **Datos de entrada para la demo:**
  **`data/halo-demo-agosto.xlsx`** — dataset sintético de 63 tickets con la estructura exacta del export de Halo (pestaña `DATOS`, 17 columnas). Cliente `Banco Demo, S.A.`, agentes `Agente 01`–`12`, dominios `.example`, IPs en rangos de documentación.

  Las distribuciones y los decimales de tiempo se preservaron intactos, así que **el dashboard tiene que reproducir exactamente las cifras del informe real** (63 / 43-15-5 / 53 cerrados / 10 pendientes / TPA 0.10 / TMR 29.29). Eso lo vuelve nuestro criterio de correctitud, no solo un dato bonito.

  Se genera con `python scripts/sanitizar-datos.py` a partir del export real, que vive en `assets/` y **no se versiona** (está en `.gitignore`). Detalle completo del mapeo en [`data/README.md`](../data/README.md).

## 6. Reparto rápido

- **¿Quién maneja el agente / código?** Oscar Gonzalez
- **¿Quién prepara datos y prueba el flujo?** Juan Pascual y Katherine Morales — sanitizar el dataset y **verificar cada cifra del dashboard contra el informe de Agosto ya publicado** (63 / 15 / 43 / 5 / 53 / 10). Es nuestra prueba de que el motor está bien.
- **¿Quién arma el pitch y la demo?** Oscar Gonzalez 

---

## 7. Anexo técnico — lo que ya sabemos de los archivos reales

_No es parte de la plantilla, pero es el contexto que hace que el agente no adivine._

### `GRAFICAS.xlsx` — 5 hojas

| Hoja | Qué contiene |
|------|--------------|
| `DATOS` | Export de Halo. 63 tickets + fila de encabezado. **Fuente única de verdad.** |
| `GRAFICAS` | 5 tablas dinámicas + 4 gráficas (3 de barras, 1 de pastel). |
| `CLOUDFLARE` | 41 filas. Debería tener 55. |
| `BEYONTRUST` | 4 filas. Debería tener 5. |
| `THINKSCANARY` | 2 filas. Debería tener 3. |

### Columnas de `DATOS` (fila 1 = encabezados)

`A` = índice · `B` Ticket ID · `C` Summary · `D` Status · `E` Date Created *(serial Excel)* · `F` Hour Created · **`G` Category** · `H` Team · `I` ITIL Type · `J` Ticket Type · `K` Assigned Agent · `L` User Name · `M` Client · `N` SLA · `O` Time to Respond (Decimal) · `P` Time to Resolve (Decimal) · `Q` Priority

> ⚠️ **Las pestañas por herramienta usan otro layout:** no llevan la columna índice, así que arrancan en `A` = Ticket ID y `Category` cae en **`F`**, no en `G`. El parser debe normalizar por **nombre de encabezado**, nunca por letra de columna.

### Valores reales del cierre de Agosto 2026

| Campo | Distribución |
|-------|--------------|
| `Category` | Cloudflare>WAF **55** · BeyondTrust>Remote Support **3** · Thinkst Canary **3** · BeyondTrust>Password Safe **2** |
| `Status` | Closed **47** · With User **8** · Resuelto **6** · On Hold **2** |
| `Ticket Type` | Solicitud **43** · Alerta **15** · Solicitud de Reporte **5** |
| `ITIL Type` | Service Request **48** · Incident **15** |
| `Team` | 1ra Línea **26** · 2da Línea **24** · 3ra Línea **13** |
| `Priority` | Baja **63** (un solo valor este mes) |
| `Assigned Agent` | 12 agentes distintos |
| Rango de fechas | 2026-08-03 → 2026-08-31 |
| Sin `Time to Resolve` | **10 tickets** (los que siguen abiertos) — hay que excluirlos del promedio de TMR, no contarlos como 0 |

### Las 4 gráficas a reproducir

| # | Tipo | Qué grafica | Origen en `GRAFICAS` |
|---|------|-------------|----------------------|
| 1 | Barras | Historial mensual de tickets (Ene–Ago) | `A17:B24` |
| 2 | Barras | Tickets por tipo (Alerta / Solicitud / Solicitud de Reporte) | `A30:B33` |
| 3 | Barras apiladas | Herramienta × Estado | `A48:F53` |
| 4 | Pastel | Estado de los tickets | `A69:B73` |

### Reglas de negocio derivadas del informe de Agosto

- **Cerrados = `Closed` + `Resuelto` = 53.** **Pendientes = `With User` + `On Hold` = 10.** (Así cuadra la frase "53 tickets cerrados y 10 pendientes" del `.docx`.)
- **Herramienta = `Category.split('>')[0]`** → colapsa las dos subcategorías de BeyondTrust en una sola herramienta.
- **TPA** = promedio de `Time to Respond (Decimal)` = `0.10`; umbral SLA **10 min**.
- **TMR** = promedio de `Time to Resolve (Decimal)` = `29.29`; umbral SLA **48 h**.
- El informe reporta TPA/TMR **solo para Solicitudes**; la tabla de *SLA – Incidentes* iba vacía en Agosto ("no se registraron incidentes") **aunque `DATOS` tiene 15 `Incident`**. → *Pregunta abierta para CSC.*

### 🚩 Preguntas abiertas que hay que confirmar con CSC

1. **¿Las pestañas por herramienta deben incluir solo tickets `Closed` o los 63?** El archivo actual solo trae `Closed`; nosotros asumimos **todos** y dejamos un filtro por estado en la vista. Si la regla real es "solo cerrados", es un cambio de una línea.
2. **¿`Resuelto` y `Closed` son el mismo estado?** Uno está en español y otro en inglés — huele a dos flujos distintos en Halo que terminan significando lo mismo. Los sumamos como cerrados porque así cuadra el informe.
3. **¿Por qué la tabla de SLA – Incidentes va vacía si hay 15 `Incident`?** Puede ser que "incidente" en el contrato signifique algo más estricto que `ITIL Type = Incident`.
4. **El historial mensual (Ene–Ago) está escrito a mano en el Excel.** ¿De dónde sale? Mientras no haya fuente, va en un JSON editable.
