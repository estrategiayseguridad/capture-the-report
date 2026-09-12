# 🎤 Guía de pitch y demo — Equipo 01

## El pitch (2:45 PM — máximo 2 minutos, un representante)

Un buen pitch de 2 minutos tiene exactamente 4 partes. Escriban una o dos frases por casilla y ensáyenlo UNA vez con cronómetro:

### 1. El dolor (30 seg)
_Arranquen con el problema, no con la solución. Que todos en la sala digan "uf, sí"._

> "Cada semana, [quién] pierde [cuánto tiempo] haciendo [qué] a mano…"

**Nuestro gancho:**

Cada mes, del 1 al 5, administración pierde ~5 minutos por factura copiando número, motivo y destino a un reporte que se desarma si alguien borra el archivo.

### 2. La solución (30 seg)
_Qué construyen, en lenguaje simple. Sin arquitectura, sin stack._

> "Vamos a construir [nombre del prototipo]: le das [entrada] y te devuelve [salida]."

**Nuestra solución:**

Rinde: le das la foto de la factura y te devuelve el gasto con DTE confirmado, adjudicado, listo para autorizar, conciliar y reembolsar.

### 3. El flujo (30 seg)
_Los 3 pasos del camino feliz. Nada más._

> "Funciona así: 1)… 2)… 3)…"

**Nuestro flujo:**

1) El colaborador fotografía la factura. 2) OCR lee el DTE y el humano confirma. 3) Admin autoriza, concilia SAT y reembolsa; sale el dashboard y el Excel.

### 4. La promesa de demo (30 seg)
_Qué van a mostrar funcionando a las 6:00 PM. Comprométanse a algo concreto._

> "A las 6 nos van a ver [acción específica en pantalla]."

**Nuestra promesa:**

A las 6 nos van a ver escanear una factura, leer el DTE, autorizarla y ver cómo baja *Te debemos* después del reembolso.

---

## La demo (6:00 PM — máximo 5 minutos)

Estructura que funciona:

1. **(30 seg)** Recuerden el dolor: "prometimos resolver X".
2. **(3 min)** Demo en vivo del camino feliz — con los datos de prueba ya cargados y ensayado al menos una vez. Diapositivas solo de apoyo, lo que se evalúa corre en pantalla.
3. **(1 min)** Qué aprendieron: qué fue fácil, qué fue difícil, cuántas horas ahorraría a la semana.
4. **(30 seg)** Dónde encaja en la plataforma unificada y qué construirían después.

### Guion rápido de demo

1. Dashboard con el cierre precargado (`data/gastos-ejemplo.json`).
2. Ingesta: cargar `data/facturas-septiembre.csv` e importar.
3. Volver al dashboard: el total y las barras cambian.
4. Reporte: filtrar por ACME Corp → Imprimir / PDF.
5. Admin: mostrar un catálogo (opcional si hay tiempo).

### Checklist antes de la demo

- [ ] `npm run dev` corre desde cero en la rama (pruébenlo).
- [ ] Los datos de prueba están cargados y el flujo se ensayó completo.
- [ ] `docs/PLANTEAMIENTO.md` está completo y committeado.
- [ ] `README-EQUIPO.md` existe: qué hace, cómo correrlo, qué quedó pendiente.
- [ ] Último push hecho ANTES de las 6:00 PM (code freeze).
- [ ] 🌐 ¿Les dio tiempo de desplegarlo en línea? Puntos extra — avisen a los árbitros con el link.
