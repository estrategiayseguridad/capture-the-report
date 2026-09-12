# Equipo 05 — ProdigiES

> **ProdigiES** — la plataforma de gestión de habilidades y cargabilidad de ES Consulting. RRHH
> mantiene la matriz de habilidades, Comercial pregunta **quién de la casa califica** para una
> licitación, PM adjudica el proyecto y asigna el equipo, y Dirección lee las brechas del área. El
> mismo dato para las tres áreas que hoy no se hablan.
>
> Planteamiento completo en [`docs/PLANTEAMIENTO.md`](docs/PLANTEAMIENTO.md) · guion de pitch y demo
> en [`docs/PITCH.md`](docs/PITCH.md).

## Qué hace el prototipo

**El problema:** cada vez que entra una licitación, Comercial tiene que preguntarle a los líderes de
CSC, Ingeniería y Consulting quién califica — y esperar. Son **3 a 5 horas repartidas en uno o dos
días**, y el tiempo no se va buscando: se va **esperando respuestas**. Peor: la respuesta depende de
a quién le preguntaste, así que se propone a quien alguien recordó, no a quien mejor califica.

**Lo que hace ProdigiES:** cubre el ciclo completo — alta y calificación del colaborador, búsqueda de
talento, adjudicación y asignación del proyecto, y reportes de planificación. El corazón es el
buscador: escribes el requisito en lenguaje natural — `Infoblox`, `VAPT Web + inglés`,
`ISO 27001 + redacción` — y devuelve las personas que califican **ordenadas por qué tan bien cubren
esos requisitos**, mostrando:

- su **nivel en cada skill pedido** en la escala 0–3 de la matriz de habilidades,
- la **certificación** que respalda el nivel, cuando existe,
- su **% de disponibilidad**, su equipo y su rol.

De ahí seleccionas a quién incluir y sale una **ficha de capacidades imprimible** para anexar a la
propuesta.

**Cómo rankea** (los pesos están explícitos en [`src/lib/buscar.ts`](src/lib/buscar.ts) para poder
defenderlos en la demo): primero **cuántos** de los requisitos cubre, luego **con qué nivel**, luego
si lo respalda una **certificación vigente**, y la **disponibilidad** como desempate. No ordena por
punteo total de la categoría, porque eso sacaría arriba a quien no sabe lo que se está buscando.

Los términos que no calzan con nada del catálogo se reportan en pantalla como *no reconocidos* en vez
de ignorarse en silencio. Y si nadie cubre el requisito, eso también se dice: es una **brecha de
conocimiento** que RRHH debería ver.

### Pantallas

Los seis menús de la barra de navegación, más las pantallas de detalle:

| Ruta | Qué es |
|------|--------|
| `/` | **Dashboard**: buscador, KPIs por área, oportunidades abiertas, top 10 de habilidades y el aviso a RRHH de certificaciones por vencer |
| `/buscar` | **Buscar skills**: ranking de candidatos contra los requisitos, con casillas para armar la ficha |
| `/perfiles` | **Perfiles** por área, con búsqueda y alta de colaborador |
| `/perfiles/nuevo` | Alta de colaborador: posición, área, descripción, nivel de educación, idiomas, foto |
| `/persona/[id]` | Perfil: punteos por categoría, habilidades, certificaciones y proyectos |
| `/persona/[id]/editar` | Edición en tres pestañas: datos, **calificación 0–3 de cada habilidad**, certificaciones con adjunto y vigencia |
| `/persona/[id]/cv` | **CV imprimible** de la persona |
| `/carga` | **Carga laboral**: cartera de proyectos y cargabilidad de cada colaborador |
| `/proyecto/[id]` | Adjudicar la oportunidad y **asignar recursos**; al asignar baja la disponibilidad en toda la plataforma |
| `/reportes` | **Reportes** por área: fortalezas, deficiencias, comparativo mes a mes, dónde invertir y carga por ingeniero. Imprimible |
| `/catalogo` | **Catálogo** de habilidades: agregar, editar y eliminar, por categoría |
| `/reporte` | Ficha de capacidades **imprimible** (Ctrl+P) del personal seleccionado en el buscador |
| `/api/buscar?q=…` | El mismo motor expuesto como JSON, para probar el ranking sin abrir el navegador |

## Cómo correrlo

```bash
git clone https://github.com/estrategiayseguridad/capture-the-report.git
cd capture-the-report
git checkout equipo-05

npm install
npm run dev
```

Abre <http://localhost:3000>. No necesita base de datos, contenedores, variables de entorno ni
servicios externos: los datos viven en un JSON del repo.

> La rama de trabajo del equipo es `equipo-05-prodigies` (en el fork de `dcamey`); ya está mergeada
> a `equipo-05` en el repo de la organización, que es la que hay que clonar.

Probar el motor sin navegador:

```bash
curl "http://localhost:3000/api/buscar?q=Infoblox" | jq
```

**Restaurar los datos de la demo** (la plataforma escribe de verdad en el JSON):

```bash
npm run seed
```

Deja el archivo como se ensaya la demo —Marvin al 50%, Pedrito al 90%, el proyecto de la
municipalidad como oportunidad abierta— y **descarta las altas hechas durante la demo**. Se puede
correr con el servidor levantado: el cache se invalida solo.

## Cómo se demuestra (guion corto)

El guion completo de 4 actos está en [`docs/PITCH.md`](docs/PITCH.md). La ruta rápida:

1. **Un colaborador nuevo** — `/perfiles/nuevo` es lo que llena RRHH en la incorporación, y
   `/persona/inge-marvin/editar` cómo lo califica: Infoblox intermedio, certificación con vencimiento
   y liderazgo avanzado. Desde ese momento la organización *sabe* que Marvin existe.
2. **La oportunidad comercial** *(el corazón de la demo)* — en `/buscar` escribe **`Infoblox`**. Sale
   **Marvin primero**: intermedio, certificado, 50% disponible. Abajo aparece **Pedrito, nivel
   básico, 90% disponible** — el buscador no solo encuentra al experto, **también encuentra a quién
   hay que hacer crecer**.
3. **La ficha** — deja marcados a Marvin y Pedrito, genera el reporte e imprímelo. Ese es el anexo
   de la propuesta.
4. **PM arma el equipo** — en `/proyecto/prj-infoblox-muni`: **Adjudicar y arrancar**, asignar a
   Marvin al 40% y a Pedrito al 30%. Vuelve al buscador: **Marvin ya está al 10%**. La disponibilidad
   no se captura a mano, sale de los proyectos.
5. **La decisión estratégica** — `/reportes?area=Ingeniería`: fortalezas, deficiencias, comparativo
   mes a mes, dónde invertir. Y el aviso de que **la certificación de Marvin vence en 65 días**.

Cierre: *"Pasamos de conocimiento disperso a gestión integral de talento, capacidades y recursos."*

## Datos

Todo vive en [`data/colaboradores.json`](data/colaboradores.json): **36 colaboradores** (20 de
Ingeniería, 8 de CSC, 8 de Consulting), **61 habilidades** en 3 categorías —técnicas, soluciones y
blandas—, **15 proyectos** con sus asignaciones, **6 meses de histórico** de punteos y la escala de
niveles. Lo regenera `scripts/generar-seed.mjs` (`npm run seed`), que es determinista.

La **disponibilidad no está en el JSON**: se deriva de las asignaciones a los proyectos en ejecución
(`100 − carga`). Por eso asignar a alguien a un proyecto cambia su disponibilidad en todas las
pantallas.

**Son datos de demostración. Ninguna persona real de ES Consulting aparece con sus datos.** Los
perfiles de Ingeniería son sintéticos provisionales (`origen: "sintetico-pendiente-excel"`), en
espera de los niveles reales de la matriz de habilidades; cuando entren, los nombres van anonimizados
y el mapeo real→ficticio se queda fuera del repo (está en `.gitignore`).

Lo que **sí** es real es la **escala 0–3** de la matriz de Ingeniería:

| Nivel | Significado |
|-------|-------------|
| 0 | No tiene conocimiento |
| 1 | Básico (con supervisión) |
| 2 | Intermedio (autónomo) |
| 3 | Avanzado (puede liderar, entrenar y diseñar) |

Los archivos `data/escaneo-ejemplo.csv` y `data/hallazgos-ejemplo.json` vienen del boilerplate del
repo y **este prototipo no los usa**.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 — el boilerplate del repo, sin cambios de
  stack y **sin dependencias nuevas**.
- Lectura en Server Components (`src/app/`), escrituras en server actions (`src/lib/acciones.ts`),
  motor de búsqueda en `src/lib/buscar.ts`, reportes en `src/lib/analitica.ts`, persistencia en
  `src/lib/datos.ts`. La búsqueda también está expuesta en `src/app/api/buscar/route.ts`.
- Persistencia: un archivo JSON en el repo, cacheado en memoria e invalidado por `mtime`. Sin base de
  datos.
- Gráficas: barras de una sola serie con el valor escrito al lado, y estados siempre con etiqueta de
  texto además del color — nada depende solo del color.
- La ficha imprimible es HTML: los tokens de color se redefinen contra el papel en un solo
  `@media print` de `globals.css`, y se exporta a PDF desde el diálogo de impresión del navegador.

## Paleta

Los colores **no se escriben en las pantallas**: viven como tokens en
[`src/app/globals.css`](src/app/globals.css). Están anclados en los cuatro colores que el sitio de ES
Consulting publica con su referencia Pantone, y los demás pasos se derivaron en OKLCH manteniendo el
tono del anclaje y moviendo solo la luminosidad.

| Anclaje de marca | Hex | Dónde cae |
|---|---|---|
| Pantone 298 C | `#38bbdd` | `acento` — botones, barras, cifras destacadas |
| Pantone 4146 C | `#18203b` | `panel` — la superficie de las tarjetas, y la tinta sobre papel |
| Classic Blue | `#124d85` | `azul` — botón sobre hoja blanca |
| Ultimate Gray | `#a2a3a4` | la luminosidad de `tinta-3`, los rótulos |

| Familia de tokens | Para qué |
|---|---|
| `fondo` · `hueco` · `panel` · `panel-alto` | superficies, de la página al chip |
| `linea-suave` · `linea` · `linea-fuerte` | divisor, borde de tarjeta, borde de control |
| `tinta` · `tinta-2` · `tinta-3` · `tinta-4` | jerarquía de texto sobre oscuro |
| `acento-claro` · `acento` · `acento-medio` · `acento-fuerte` | la rampa del cyan, un paso por superficie |
| `bien` · `aviso` · `alerta` (+ `-fuerte` para papel) | **solo estado** |
| `papel` · `tinta-papel` · `tinta-papel-2` · `tinta-papel-3` · `linea-papel` | la ficha y el CV, que son hoja blanca |

Tres reglas, para que una pantalla nueva no rompa el conjunto:

1. **Usa tokens, no colores crudos de Tailwind.** Un `bg-slate-800` o un `text-cyan-400` se ve
   parecido pero no es la marca, y no se remapea al imprimir. Si falta un paso, agrégalo a `@theme`.
2. **Un solo tono para lo que es magnitud** (barras, niveles): el largo o la cantidad llevan el dato.
   Los tres colores de estado están reservados a estado y **siempre van con su etiqueta en texto**.
3. **No inventes variantes `print:`.** La impresión ya tiene sus propios pasos validados contra papel
   blanco en el `@media print`; una pantalla que usa tokens se imprime bien sin hacer nada.

Cada paso se eligió por cómputo, no a ojo: contraste WCAG contra las tres superficies, y separación
bajo protanopía/deuteranopía para el trío de estado (ΔE 13.6 en el tema oscuro, 8.7 en papel).

## Qué quedó pendiente

Lo honesto, para no prometer lo que no hay:

- [ ] **No hay autoevaluación ni roles.** Cualquiera puede editar cualquier perfil, porque no hay
      login. En producción el alta y la calificación son de RRHH, y la autoevaluación del colaborador.
- [ ] **Faltan los niveles reales** de la matriz de habilidades de Ingeniería (hoy sintéticos).
- [ ] **Las certificaciones no suben el archivo:** se registra el *nombre* del adjunto, no el PDF.
- [ ] **El histórico mes a mes es generado**, salvo el último mes, que sí es el punteo real calculado
      del JSON. En producción se snapshotea el punteo en cada cierre de mes.
- [ ] **Sin control de concurrencia:** un solo usuario contra un archivo. Dos personas guardando al
      mismo tiempo se pisan.
- [ ] Sin despliegue en línea.

## Agente de IA (Claude Code)

El equipo trabaja con Claude Code sobre Amazon Bedrock. La configuración vive en
`.claude/settings.local.json`, que **está en `.gitignore` a propósito porque contiene una
credencial**. Cada integrante crea el suyo:

```jsonc
// .claude/settings.local.json
{
  "env": {
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "AWS_REGION": "us-east-1",
    "AWS_BEARER_TOKEN_BEDROCK": "<tu-api-key-de-bedrock>",
    "ANTHROPIC_MODEL": "us.anthropic.claude-opus-5",
    "ANTHROPIC_SMALL_FAST_MODEL": "us.anthropic.claude-haiku-4-5-20251001-v1:0"
  }
}
```

Las reglas que sigue el agente en este repo están en [`CLAUDE.md`](CLAUDE.md).

> ⚠️ Nunca pegar la API key en un archivo trackeado por git.

## Equipo

Nadia, Denis, Isra, Daniel, Luis.

- Toda la rama es `equipo-05`. **Nunca `main`.**
- Commits frecuentes: si no está en la rama al code freeze (6:00 PM), no existe.
