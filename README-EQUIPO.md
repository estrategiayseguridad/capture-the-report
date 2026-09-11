# EventPulse 360 — Equipo 04

Prototipo de la hackathon interna **Capture The Report**.

Convierte el listado de asistentes de un evento en un tablero de seguimiento comercial y
en un reporte listo para el patrocinador — sin las hojas de cálculo intermedias que hoy
toman varios días después de cada evento.

---

## Qué hace

Entra un **CSV de asistentes** y sale, en un solo paso:

1. **Proyección de asistencia** calculada con el histórico de eventos: la tasa base se
   agrupa por franja horaria (los eventos nocturnos rinden ~71%, los diurnos ~88%) y cada
   registro se pondera según su canal de registro.
2. **Segmentación automática por perfil** — Decisor / Gerencial / Técnico — inferida del
   cargo declarado en el registro.
3. **Score y prioridad de cada lead** (0-100) a partir de perfil, canal de registro,
   industria estratégica y tema de interés.
4. **Asignación automática a ejecutivos de cuenta (CAM)**: cada lead va al especialista de
   su industria y, si ese ejecutivo ya llegó a su capacidad, se balancea al de menor carga.
   La tabla muestra el motivo de cada asignación.
5. **Dashboard de estatus** con el embudo por lead (Pendiente → Contactado → Reunión
   agendada → Oportunidad / Descartado), editable y persistido en el navegador.
6. **Reporte para el patrocinador**, imprimible o exportable a PDF desde el navegador, con
   resumen ejecutivo redactado, indicadores del evento, costo por lead calificado y calidad
   de la audiencia.

## Cómo correrlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

**Para ver la demo en un clic:** pulsa *Cargar datos de demo* y luego *Procesar y generar
dashboard*. O abre directamente la URL con los datos ya procesados:

- Dashboard: <http://localhost:3000/?demo=1>
- Reporte del sponsor: <http://localhost:3000/?demo=1&vista=reporte>

## Guion de la demo (3 minutos)

1. Abrir `http://localhost:3000` — pantalla de carga vacía.
2. *Cargar datos de demo* → se llenan el CSV (45 registros) y los datos del evento.
3. *Procesar y generar dashboard*: **45 registrados, 32 proyectados, 34 asistentes reales
   (+2 sobre la proyección), 34 leads, 25 calificados, 100% con ejecutivo asignado.**
4. Señalar la segmentación: el 38% de los asistentes son perfiles con poder de decisión,
   mientras que los técnicos son los que más faltaron (9 de 17 registrados).
5. Bajar a la tabla de leads: filtrar por *Alejandra Morales* y mostrar que los leads de
   Banca cayeron con la especialista; buscar un lead con motivo
   *"Balanceo de carga"* para explicar el desborde por capacidad.
6. Cambiar un estatus a *Reunión agendada* y recargar la página con `?demo=1` para mostrar
   que el estatus se conservó.
7. Cambiar a *Reporte sponsor* → *Imprimir / Guardar PDF*: el mismo dato ya redactado, con
   costo por lead calificado de **Q1,920**.

## Datos de la demo

Todo es ficticio y vive en el repo (no hay base de datos ni servicios externos):

| Archivo | Contenido |
|---|---|
| `data/asistentes-demo.csv` | 45 asistentes ficticios con cargo, industria, canal de registro y check-in |
| `data/historico-eventos.json` | 10 eventos históricos derivados de `DETALLES POR EVENTOS 2026-ejemplo.xlsx`, usados para la proyección |
| `data/cams.json` | Roster de 5 ejecutivos con sus industrias y capacidad |

Los dos `.xlsx` de `data/` son los archivos reales de referencia (ya venían con nombres
genéricos): el control Pre/Durante/Post del evento y el detalle de eventos del año.

### CSV propio

Basta una columna `nombre`. Se reconocen además `email`, `empresa`, `cargo`, `industria`,
`telefono`, `canal_registro`, `fecha_registro`, `check_in` e `interes`, con alias en inglés
(`name`, `company`, `title`, `sector`…) y tolerancia a acentos, comillas y CRLF. Si falta
una columna la app avisa en pantalla en lugar de fallar; los duplicados por email se
descartan.

## Cómo está armado

```
src/app/page.tsx              Shell de la página
src/app/api/demo/route.ts     GET: entrega el CSV de demo del repo
src/app/api/procesar/route.ts POST: recibe {csv, evento} y devuelve el resultado completo
src/lib/csv.ts                Parser de CSV (comillas, CRLF, alias de encabezados)
src/lib/engine.ts             Motor: segmentación, scoring, asignación, proyección, métricas
src/lib/types.ts              Contratos compartidos
src/components/EventPulse.tsx Orquestador de la UI (carga → dashboard → reporte)
src/components/Dashboard.tsx  KPIs, proyección, segmentación, carga por ejecutivo
src/components/TablaLeads.tsx Tabla de leads con filtros y estatus editable
src/components/ReporteSponsor.tsx Reporte imprimible para el patrocinador
```

Next.js 15+ (App Router) con TypeScript y Tailwind CSS 4. Sin dependencias adicionales: el
motor es TypeScript puro y la persistencia del estatus es `localStorage`.

Los colores del tablero salen de una paleta validada para daltonismo y contraste sobre la
superficie oscura; la identidad nunca depende solo del color (siempre hay etiqueta directa
o leyenda).

## Supuestos que conviene revisar

- Los **multiplicadores por canal** de la proyección (referido 1.15x, invitación directa
  1.10x, formulario web 0.92x) son supuestos de negocio, no salen del histórico. Se ven en
  pantalla, bajo la gráfica de proyección, y hay que recalibrarlos con datos reales.
- La **tasa base por franja** se calcula sobre pocos eventos (4 nocturnos en el histórico
  de ejemplo). Es honesta pero ruidosa; la app muestra sobre cuántos eventos se calculó.
- El **scoring** y la **capacidad de 8 leads por ejecutivo** son parámetros de `engine.ts` y
  `data/cams.json`; se ajustan sin tocar la UI.
- Solo quien tiene **check-in** se convierte en lead. Los no-show quedan fuera del embudo
  (pendiente: lista de renurturing).

## Qué quedó pendiente

- Integración con Mailchimp y envío automático de correos.
- Lectura directa de los `.xlsx` (hoy el histórico está en JSON derivado de ellos).
- Histórico multi-evento en la app: cada corrida analiza un evento a la vez.
- Persistencia real del estatus de los leads (hoy `localStorage`, por navegador) y empuje
  al CRM.
- Exportación nativa a PDF: se resuelve con la impresión del navegador.
- Lista de renurturing para los registrados que no asistieron.
