# 🎤 Guía de pitch y demo — Equipo 08 · REPORTERO CSC

## El pitch (2:45 PM — máximo 2 minutos, un representante)

**Presenta:** Katherine Felipe

Un buen pitch de 2 minutos tiene exactamente 4 partes. Escriban una o dos frases por casilla y ensáyenlo UNA vez con cronómetro:

### 1. El dolor (30 seg)
_Arranquen con el problema, no con la solución. Que todos en la sala digan "uf, sí"._

> "Cada semana, [quién] pierde [cuánto tiempo] haciendo [qué] a mano…"

**Nuestro gancho:**

> "Cada mes, el equipo de **CSC** pierde **entre 4 y 6 horas** armando a mano el informe de tickets de **Banrural**: refrescar cinco tablas dinámicas, crear una pestaña por herramienta filtrando a mano, re-pegar cuatro gráficas en Word y transcribir quince números a doce páginas.
>
> Y les traigo un dato: nos pusimos a abrir el archivo del cierre de Agosto. **Las pestañas por herramienta tienen 47 tickets. `DATOS` tiene 63.** Dieciséis tickets no aparecen. Nadie lo notó, porque **nadie tiene tiempo de auditar lo que copió a mano.**
>
> Ese es el problema: no es solo lento. Es que **el número que le llega al banco depende de qué pestaña abrió el analista** — y las gráficas del Word están enlazadas a una carpeta de Descargas de una sola computadora. Si esa laptop no está, el informe no se puede actualizar."

*(Si hay que recortar por tiempo: quédense con las dos cifras — **47 contra 63** — y la frase de la laptop. Eso es el pitch.)*

### 2. La solución (30 seg)
_Qué construyen, en lenguaje simple. Sin arquitectura, sin stack._

> "Vamos a construir [nombre del prototipo]: le das [entrada] y te devuelve [salida]."

**Nuestra solución:**

> "Vamos a construir **REPORTERO CSC**: le das **el Excel que ya descargas de Halo**, tal como sale, y te devuelve **el informe del mes armado** — las cuatro gráficas dibujadas, los tickets ya separados por herramienta, y los quince números puestos en su lugar dentro del texto.
>
> No cambia el proceso de nadie ni pide aprender nada nuevo. **La entrada es el archivo que ya bajan y la salida es el documento que ya entregan.** Solo desaparece lo que hay en medio.
>
> Y lo importante: **el análisis y las recomendaciones los sigue escribiendo el analista.** Eso es criterio profesional, no lo queremos automatizar. Lo que automatizamos es exactamente lo que no debería hacer una persona: contar filas y copiar cifras."

### 3. El flujo (30 seg)
_Los 3 pasos del camino feliz. Nada más._

> "Funciona así: 1)… 2)… 3)…"

**Nuestro flujo:**

> "Tres pasos:
>
> **Uno** — arrastras el Excel de Halo a la página.
> **Dos** — en la pantalla aparecen las cuatro gráficas y las pestañas por herramienta, ya separadas por la columna Category, con los 63 tickets cuadrando.
> **Tres** — le das a *Generar informe* y descargas el documento con toda la redacción y las cifras adentro, listo para revisar y firmar.
>
> Un archivo entra, un informe sale."

### 4. La promesa de demo (30 seg)
_Qué van a mostrar funcionando a las 6:00 PM. Comprométanse a algo concreto._

> "A las 6 nos van a ver [acción específica en pantalla]."

**Nuestra promesa:**

> "A las 6 nos van a ver **arrastrar el Excel de Agosto y que aparezcan las cuatro gráficas en pantalla**, con las pestañas por herramienta generadas solas — y les vamos a mostrar, en vivo, **los 16 tickets que el proceso manual perdió.**
>
> Y después le damos a un botón y **se descarga el informe de Banrural abriéndose en Word**, con los 63 tickets, los 53 cerrados y los 10 pendientes ya escritos en el texto.
>
> Lo que hoy toma cinco horas, en la demo va a tomar **menos de un minuto.**"

---

## La demo (6:00 PM — máximo 5 minutos)

**Presenta:** Oscar Gonzalez, con Katherine Felipe en la narrativa.

Estructura que funciona:

1. **(30 seg)** Recuerden el dolor: "prometimos resolver X".
   > "Prometimos que el cierre mensual de Banrural dejara de tomar cinco horas de copiar y pegar. Vamos a hacerlo en un minuto."

2. **(3 min)** Demo en vivo del camino feliz — con los datos de prueba ya cargados y ensayado al menos una vez.

   **Guion minuto a minuto:**

   | Tiempo | Qué se hace en pantalla | Qué se dice |
   |--------|-------------------------|-------------|
   | 0:00 | Mostrar el `GRAFICAS.xlsx` real abierto al lado — las 5 pestañas, las dinámicas. | "Esto es lo que hay hoy. Cinco pestañas, cinco tablas dinámicas, todo a mano." |
   | 0:20 | Arrastrar el `.xlsx` a REPORTERO CSC. | "Este es el archivo que ya se descarga de Halo. No lo tocamos, no lo preparamos. Va como sale." |
   | 0:30 | **Aparece el dashboard.** Señalar las 4 gráficas. | "Ahí están las cuatro gráficas del informe: historial mensual, tipos de ticket, herramienta por estado, y estado. Ninguna tabla dinámica se refrescó." |
   | 1:00 | Click en las vistas por herramienta: Cloudflare / BeyondTrust / Thinkst Canary. | "Y estas pestañas se generaron solas leyendo la columna Category. **Cloudflare 55, BeyondTrust 5, Thinkst Canary 3. Suman 63.**" |
   | 1:30 | 🎯 **El momento.** Mostrar el contador o el panel de tickets que faltan en el archivo manual. | "En el archivo de Agosto que se entregó, estas pestañas tienen 47. Aquí están los 16 que faltaban. Este —el 40010— es un ticket de BeyondTrust que nunca llegó a su pestaña." |
   | 2:10 | Click en **Generar informe**. Mostrar el informe en pantalla, hacer scroll. | "Y este es el informe. Misma estructura, mismo orden, mismas secciones que el de Agosto — pero los números no los escribió nadie." |
   | 2:40 | Descargar y **abrirlo en Word**. | "Se abre en Word. De aquí el analista escribe el análisis y las recomendaciones, que es lo único que debería estar escribiendo." |

   > ⚠️ **Regla de oro de la demo:** el archivo de entrada ya debe estar en el escritorio, la app ya corriendo, el navegador ya abierto en `localhost:3000`. Cero `npm install` en vivo. Cero buscar archivos en carpetas.

3. **(1 min)** Qué aprendieron: qué fue fácil, qué fue difícil, cuántas horas ahorraría a la semana.

   - **Fácil:** leer el Excel y calcular las métricas. Lo que en Excel son cinco tablas dinámicas, en código son unas líneas de agrupar y contar — y se ejecutan igual todos los meses.
   - **Difícil:** el `.docx` fiel a la plantilla corporativa. Word por dentro es un ZIP con fuentes embebidas y gráficas enlazadas a rutas absolutas. Hoy entregamos un documento que Word abre bien; el `.docx` pixel-perfect es el siguiente paso.
   - **Lo que no esperábamos:** que al leer el archivo real íbamos a **encontrar las inconsistencias**. No salimos a buscar errores, salimos a automatizar — y automatizar los hizo visibles. Eso, por sí solo, ya justifica la herramienta.
   - **Impacto:** **~4 horas ahorradas por cierre**, de 5 h a menos de 1 h. Son **~48 horas al año en un solo cliente**. Y el motor no es de Banrural: es de cualquier cliente de CSC que reporte tickets de Halo. Con cinco clientes son **20 horas al mes de analista senior** liberadas.

4. **(30 seg)** Dónde encaja en la plataforma unificada y qué construirían después.

   > "REPORTERO CSC son tres piezas que la plataforma unificada va a necesitar igual: **un conector** de entrada, **un motor de métricas** y **un renderizador de plantillas por cliente**. Banrural es la primera plantilla, no el producto.
   >
   > Lo siguiente, en orden: **uno**, conectarnos a la API de Halo para que ni el Excel haga falta; **dos**, guardar cada cierre para que el historial mensual se construya solo en lugar de escribirse a mano; **tres**, la segunda plantilla de cliente — que es donde se prueba que el motor sirve de verdad."

### Frases de respaldo (para preguntas de los jueces)

- **"¿Y si Halo cambia el export?"** → El parser busca las columnas **por nombre de encabezado**, no por letra. Si Halo mueve una columna, sigue funcionando. Si le cambia el nombre, la app avisa qué columna no encontró en lugar de dar un número mal.
- **"¿La IA escribe el informe?"** → No, y es a propósito. La IA que redacta el análisis de seguridad de un banco es un riesgo, no una función. Automatizamos las cifras y las gráficas; el criterio lo firma un analista.
- **"¿Esto reemplaza al analista?"** → Le devuelve cuatro horas para hacer análisis en lugar de transcripción. El informe de Agosto tenía las cifras mal copiadas y la narrativa bien escrita — eso dice exactamente dónde está el valor de la persona.
- **"¿Por qué no una macro de Excel?"** → Porque el problema no es solo el Excel: es la cadena Excel → Word, y las gráficas enlazadas a una laptop. Una macro arregla la mitad y sigue viviendo en un archivo que se copia por correo.
- **"¿Los datos del banco?"** → La demo corre con un dataset **sanitizado**: cliente ficticio, agentes y usuarios anonimizados, dominios `.example`, IPs en rango privado. Los conteos son idénticos, así que la herramienta se prueba igual sin exponer nada del cliente.

### Checklist antes de la demo

- [ ] `npm run dev` corre desde cero en la rama (pruébenlo).
- [ ] Los datos de prueba están cargados y el flujo se ensayó completo.
- [ ] `docs/PLANTEAMIENTO.md` está completo y committeado.
- [ ] `README-EQUIPO.md` existe: qué hace, cómo correrlo, qué quedó pendiente.
- [ ] Último push hecho ANTES de las 6:00 PM (code freeze).
- [ ] 🌐 ¿Les dio tiempo de desplegarlo en línea? Puntos extra — avisen a los árbitros con el link.

**Nuestros extras de equipo 08:**

- [ ] El `.xlsx` de demo está **en el escritorio**, a un arrastre de distancia. No en `Downloads/`, no en una subcarpeta.
- [ ] El dataset **sanitizado** es el que se muestra en pantalla (el real no se proyecta).
- [ ] El informe generado **ya se probó abriéndose en Word**, no solo en el navegador.
- [ ] Las cifras del dashboard **cuadran contra el informe de Agosto**: 63 / 15 / 43 / 5 / 53 / 10. Alguien las verificó una por una.
- [ ] El panel de "tickets que el proceso manual perdió" está listo — **es el momento del pitch, no lo dejen para el final.**
- [ ] Segundo navegador con el Excel real abierto al lado, para el contraste del inicio.
- [ ] Batería, cargador y resolución de pantalla probada en el proyector.
