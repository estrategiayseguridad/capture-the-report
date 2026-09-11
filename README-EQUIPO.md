# REPORTERO CSC — Equipo 08

**Del export de Halo al informe mensual del cliente, sin transcribir una cifra a mano.**

El equipo de CSC entrega cada mes a un cliente bancario un informe de atención de alertas y solicitudes. Hoy eso son **4–6 horas** de refrescar cinco tablas dinámicas en Excel, crear a mano una pestaña por herramienta, re-pegar cuatro gráficas en Word y transcribir ~15 números a un documento de 12 páginas.

Este prototipo lee los tickets del cierre y produce el dashboard, las vistas por herramienta y el informe con las cifras ya insertadas.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir **http://localhost:3000**. No hay base de datos, ni variables de entorno, ni servicios externos: los datos son un JSON del repo.

| Ruta | Qué es |
|---|---|
| `/` | Dashboard del cierre: indicadores, las 4 gráficas, vistas por herramienta y el panel de tickets perdidos |
| `/informe` | El informe completo con las cifras insertadas. Botón para descargar e imprimir a PDF (Ctrl+P) |
| `/api/informe` | Descarga el informe como documento que Word abre respetando el formato |

## Qué hace

1. **Lee los tickets** del cierre (63 tickets de Agosto 2026, `data/halo-demo-agosto.json`).
2. **Calcula las métricas** del informe: por tipo, por estado, por herramienta, por línea de soporte, por agente, cerrados vs. pendientes, TPA y TMR.
3. **Genera las vistas por herramienta** partiendo la columna `Category` en el `>` — equivalen a las pestañas `CLOUDFLARE` / `BEYONTRUST` / `THINKSCANARY` del Excel, pero se construyen solas.
4. **Dibuja las 4 gráficas** del informe sin ninguna librería: barras con CSS, pastel con `conic-gradient`.
5. **Arma el informe** en 8 secciones + anexo con el detalle de los 63 tickets, con cada número inyectado desde los datos.

### El hallazgo

Al leer los archivos reales del cierre de Agosto encontramos que **las pestañas por herramienta tienen 47 de los 63 tickets** — exactamente los de estado `Closed` — mientras las gráficas cuentan los 63. Cloudflare 41 vs 55, BeyondTrust 4 vs 5, Thinkst Canary 2 vs 3.

El dashboard tiene un panel que lista los **16 tickets que el proceso manual pierde**, y en las tablas por herramienta esas filas van marcadas en rojo. No salimos a buscar errores: automatizar los hizo visibles.

Queda documentado como **pregunta abierta** para CSC (ver `docs/PLANTEAMIENTO.md` §7), no como afirmación de bug: puede ser una regla de negocio no escrita.

## Verificación — por qué se puede confiar en los números

El dataset preserva las distribuciones del cierre real, así que **el dashboard tiene que reproducir exactamente las cifras del informe ya entregado al cliente**. Eso es el criterio de correctitud del motor:

| Métrica | Esperado | En pantalla |
|---|---|---|
| Total de tickets | 63 | ✅ |
| Por tipo | Solicitud 43 · Alerta 15 · Sol. de Reporte 5 | ✅ |
| Por estado | Closed 47 · With User 8 · Resuelto 6 · On Hold 2 | ✅ |
| Por herramienta | Cloudflare 55 · BeyondTrust 5 · Thinkst Canary 3 | ✅ |
| Cerrados / Pendientes | 53 / 10 | ✅ |
| TPA | 0.10 h (6 min) | ✅ |
| TMR | 29.29 h sobre n=53 | ✅ |

Dos reglas que no son obvias y están en el código:

- **Cerrados = `Closed` + `Resuelto`.** Halo tiene los dos estados y el informe los suma.
- **El TMR excluye los tickets abiertos.** Los 10 en seguimiento no tienen tiempo de resolución; contarlos como 0 hundiría el promedio.

## Datos

`data/halo-demo-agosto.json` es un **dataset sintético derivado de un export real**: cliente ficticio `Banco Demo, S.A.`, agentes y usuarios anonimizados, dominios `.example`, IPs de rangos de documentación. Las distribuciones y los decimales de tiempo se preservaron intactos.

Los archivos fuente del cliente viven en `assets/`, que **está en `.gitignore` y no se versiona**. Se regenera con `python scripts/sanitizar-datos.py`. Detalle completo en [`data/README.md`](data/README.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4. **Cero dependencias añadidas** al boilerplate — las gráficas son CSS y el documento de Word es HTML con estilos en línea.

## Qué quedó pendiente

- **Subir el `.xlsx` desde el navegador.** Hoy el dataset se lee del JSON del repo. El parser de Excel es el siguiente paso y está diseñado para buscar las columnas **por nombre de encabezado**, nunca por letra — en el export `Category` cae en `G`, pero en las pestañas por herramienta cae en `F`.
- **`.docx` nativo** fiel a la plantilla corporativa (portada, encabezados, índice, fuentes embebidas). Hoy se entrega un documento que Word abre y respeta en formato básico.
- **Redacción asistida** de *Análisis de resultados* y *Recomendaciones*. Van marcados en amarillo como bloques del analista, con un borrador de arranque. **Es deliberado**: el criterio de seguridad lo firma una persona.
- **Historial multi-mes real.** Los 8 meses se leen de `data/historial-mensual.json`; en el Excel original también están escritos a mano.
- **Multi-cliente.** Hoy hay una sola plantilla. El motor de métricas ya es independiente del cliente; falta separar la plantilla del texto.
- **% de cumplimiento de SLA** contra los umbrales contractuales reales, ticket por ticket (hoy se compara el promedio del periodo contra 10 min / 48 h).

## Equipo

Oscar Gonzalez · Katherine Felipe · Juan Pascual · Katherine Morales
