# Equipo 05 — ProdigiES

> **ProdigiES** — el radar de talento de ES Consulting. Escribes el requisito de una licitación y
> te dice **quién de la casa califica**, ordenado por mejor match, con la ficha lista para adjuntar
> a la propuesta.
>
> Planteamiento completo en [`docs/PLANTEAMIENTO.md`](docs/PLANTEAMIENTO.md) · guion de pitch y demo
> en [`docs/PITCH.md`](docs/PITCH.md).

## Qué hace el prototipo

**El problema:** cada vez que entra una licitación, Comercial tiene que preguntarle a los líderes de
CSC, Ingeniería y Consulting quién califica — y esperar. Son **3 a 5 horas repartidas en uno o dos
días**, y el tiempo no se va buscando: se va **esperando respuestas**. Peor: la respuesta depende de
a quién le preguntaste, así que se propone a quien alguien recordó, no a quien mejor califica.

**Lo que hace ProdigiES:** escribes el requisito en lenguaje natural — `Infoblox`, `VAPT Web + inglés`,
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

| Ruta | Qué es |
|------|--------|
| `/` | Buscador y ranking de candidatos, con casillas para armar la ficha |
| `/persona/[id]` | Perfil de una persona: niveles por categoría, idiomas, certificaciones, disponibilidad |
| `/reporte` | Ficha de capacidades **imprimible** (Ctrl+P) del personal seleccionado |
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

## Cómo se demuestra (guion corto)

El guion completo de 4 actos está en [`docs/PITCH.md`](docs/PITCH.md). La ruta rápida:

1. **Un colaborador nuevo** — abre `/persona/inge-marvin`: RRHH registró que Marvin trae Infoblox
   intermedio, su certificación y liderazgo avanzado. Desde ese momento la organización *sabe* que
   Marvin existe.
2. **La oportunidad comercial** *(el corazón de la demo)* — en `/` escribe **`Infoblox`**. Sale
   **Marvin primero**: intermedio, certificado, 50% disponible.
3. **PM arma el equipo** — abajo aparece **Pedrito, nivel básico, 90% disponible**. PM lo suma para
   que desarrolle experiencia: el buscador no solo encuentra al experto, **también encuentra a quién
   hay que hacer crecer**.
4. **La ficha** — deja marcados a Marvin y Pedrito, genera el reporte e imprímelo. Ese es el anexo
   de la propuesta.

Cierre: *"Pasamos de conocimiento disperso a gestión integral de talento, capacidades y recursos."*

## Datos

Todo vive en [`data/colaboradores.json`](data/colaboradores.json): **36 colaboradores** (20 de
Ingeniería, 8 de CSC, 8 de Consulting), **60 habilidades** en 3 categorías —técnicas, soluciones y
blandas— y la escala de niveles.

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

- Next.js 15 (App Router) + TypeScript + Tailwind CSS — el boilerplate del repo, sin cambios de stack
  y **sin dependencias nuevas**.
- Interfaz en `src/app/`, motor de búsqueda en `src/lib/buscar.ts`, backend en `src/app/api/buscar/route.ts`.
- Persistencia: un archivo JSON leído en el servidor. Sin base de datos.
- La ficha imprimible es HTML con estilos `print:` — se exporta a PDF desde el diálogo de impresión
  del navegador.

## Qué quedó pendiente

Lo honesto, para no prometer lo que no hay:

- [ ] **No hay formulario de alta ni edición.** Los perfiles son de solo lectura; el alta la haría
      RRHH. En la demo se dice así: *"el registro lo hace RRHH; hoy les muestro el perfil ya cargado"*.
- [ ] **Faltan los niveles reales** de la matriz de habilidades de Ingeniería (hoy sintéticos).
- [ ] **El panel de brechas de conocimiento no está construido** — skills con un solo experto,
      certificaciones por vencer, dónde ubicar practicantes. Sale del mismo dato, pero es Acto 4: se
      cuenta, no se muestra.
- [ ] **Cargabilidad real:** hoy la disponibilidad es un % en el JSON, no viene de la carga de
      proyectos.
- [ ] Sin autenticación ni control de acceso — es un prototipo local.
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
