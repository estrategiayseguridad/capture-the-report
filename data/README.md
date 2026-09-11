# Datos de prueba sanitizados

Úsenlos como entrada de sus prototipos. **Todos son sintéticos** — hosts RFC 1918, dominios `.example`, cliente ficticio ACME Corp.

| Archivo | Qué simula |
|---------|-----------|
| `hallazgos-ejemplo.json` | Hallazgos de un VAPT web (formato típico de reporte de consultoría) |
| `escaneo-ejemplo.csv` | Export de un escáner de vulnerabilidades sobre red interna |

¿Necesitan otro formato (XML de Nessus, salida de nmap, notas crudas de consultoría)? Pídanle al agente que genere datos sintéticos similares — **nunca peguen datos reales de clientes**.

---

## 🟦 Equipo 08 — dataset de REPORTERO CSC

Estos tres archivos son la entrada del prototipo del equipo 08. Simulan el **cierre mensual de tickets de un servicio de SOC** exportado de la herramienta **Halo**.

| Archivo | Qué simula |
|---------|-----------|
| `halo-demo-agosto.xlsx` | Export de Halo — pestaña `DATOS`, 17 columnas, 63 tickets de Agosto 2026. **Esta es la entrada del prototipo.** |
| `halo-demo-agosto.json` | Los mismos 63 tickets en JSON, con las fechas ya convertidas a ISO. Atajo para importar directo sin parsear Excel. |
| `historial-mensual.json` | Conteo de tickets por mes (Enero–Agosto 2026) para el gráfico de historial. |

### Cómo se generaron

Son un **dataset sintético derivado de un export real**: se preservó la estructura y las distribuciones, y se reemplazó todo lo identificable. El script está en [`scripts/sanitizar-datos.py`](../scripts/sanitizar-datos.py) y se regenera con:

```bash
python scripts/sanitizar-datos.py
```

> El script lee dos cosas de `assets/`, que **no está versionado** (contiene los archivos reales del cliente):
> `GRAFICAS.xlsx` (el export) y `mapeo-sanitizacion.json` (la tabla real → sintético).
>
> La tabla de reemplazos vive **fuera** del script a propósito: sus *claves* son datos del cliente (dominios de producción, nombres de proyecto, el buzón del SOC), así que dejarlas en un `.py` versionado sería la fuga que el script intenta evitar. Como efecto secundario útil, la lista negra de la verificación final se deriva de esas mismas claves y no puede desincronizarse del mapeo.
>
> Sin la carpeta `assets/` el script no corre — pero tampoco hace falta: los archivos ya generados están acá.

**Se preservó exacto** (para que las métricas del informe cuadren y se puedan verificar):
`Status` · `Category` · `Team` · `ITIL Type` · `Ticket Type` · `SLA` · `Priority` · fecha y hora de creación · los decimales de `Time to Respond` y `Time to Resolve`.

**Se reemplazó:**

| Campo | Cómo quedó |
|-------|-----------|
| `Ticket ID` | Renumerado a `40001`–`40063`, preservando el orden original |
| `Summary` | Dominios → `.example`, IPs → rangos de documentación (RFC 5737), proyectos y proveedores → nombres ficticios (`ProyectoFenix`, `Proveedor Zeta`, `Integrador Beta`) |
| `Assigned Agent` | `Agente 01`–`Agente 12` (mapeo estable, ordenado por volumen: `Agente 01` es el de más tickets) |
| `User Name` | `Usuario 01`–`Usuario NN`, y el buzón del SOC → `soc@banco-demo.example` |
| `Client` | `Banco Demo, S.A.` |

Los nombres de las **herramientas monitoreadas** (Cloudflare, BeyondTrust, Thinkst Canary) **sí se conservan**: son productos comerciales, no datos del cliente, y son justo lo que el prototipo tiene que agrupar.

### Cifras de control

El script aborta si algo no cuadra. Estas son las cifras que el dashboard tiene que reproducir — **úsenlas para verificar que el motor de métricas está bien**:

| Métrica | Valor |
|---------|-------|
| Total de tickets | **63** |
| Por tipo | Solicitud **43** · Alerta **15** · Solicitud de Reporte **5** |
| Por estado | Closed **47** · With User **8** · Resuelto **6** · On Hold **2** |
| Por herramienta | Cloudflare **55** · BeyondTrust **5** · Thinkst Canary **3** |
| Cerrados / Pendientes | **53** / **10** *(cerrados = `Closed` + `Resuelto`)* |
| TPA (promedio `Time to Respond`) | **0.10** *(n=63)* |
| TMR (promedio `Time to Resolve`) | **29.29** *(n=53 — los 10 tickets abiertos no tienen valor y **no** cuentan como 0)* |
| Rango de fechas | 2026-08-03 → 2026-08-31 |

### Detalles que el parser tiene que manejar

- **`Date Created` viene como serial de Excel** (ej. `46247.808333`), no como fecha. Hay que convertirlo (día 0 = 1899-12-30).
- **Buscar las columnas por nombre de encabezado, nunca por letra.** La columna `A` del export es un índice sin encabezado, así que `Category` cae en `G` — pero en las pestañas por herramienta del archivo original cae en `F`. Por nombre siempre funciona.
- **`Time to Resolve` viene vacío en 10 tickets** (los que siguen abiertos). Hay que excluirlos del promedio.
- **La herramienta sale de partir `Category` en el `>`**: `Cloudflare>WAF` → `Cloudflare`. Así las dos subcategorías de BeyondTrust (`Remote Support` y `Password Safe`) colapsan en una sola herramienta.

Ver [`docs/PLANTEAMIENTO.md`](../docs/PLANTEAMIENTO.md) §7 para el contexto completo.
