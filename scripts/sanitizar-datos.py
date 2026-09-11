"""
Genera el dataset de demo SANITIZADO a partir del export real de Halo.

Entradas (NO se versionan):  assets/GRAFICAS.xlsx            -> pestana DATOS
                             assets/mapeo-sanitizacion.json  -> tabla de reemplazos
Salidas  (si se versionan): data/halo-demo-agosto.xlsx   (pestana DATOS, mismo layout que Halo)
                            data/halo-demo-agosto.json   (mismos tickets, para import directo)
                            data/historial-mensual.json  (conteo Ene-Ago del grafico de historial)

Que se PRESERVA exacto (para que las metricas del informe cuadren):
  Status, Category, Team, ITIL Type, Ticket Type, SLA, Priority,
  Date/Hour Created y los decimales de Time to Respond / Time to Resolve.

Que se REEMPLAZA (datos identificables del cliente):
  Ticket ID, Summary, Assigned Agent, User Name, Client.

Nota importante: la tabla de reemplazos NO vive en este archivo, porque sus CLAVES
son datos del cliente (dominios de produccion, nombres de proyecto, correo del SOC).
Vive en assets/mapeo-sanitizacion.json, que esta en .gitignore junto con el resto de
assets/. Este script es publicable; ese JSON no.

Uso:  python scripts/sanitizar-datos.py
"""

import collections
import datetime
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "assets" / "GRAFICAS.xlsx"
MAPEO = RAIZ / "assets" / "mapeo-sanitizacion.json"
DESTINO = RAIZ / "data"
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
HOJA_DATOS = "xl/worksheets/sheet5.xml"

# Columnas de la pestana DATOS de Halo. A es el indice de fila del export.
COLUMNAS = [
    "", "Ticket ID", "Summary", "Status", "Date Created", "Hour Created",
    "Category", "Team", "ITIL Type", "Ticket Type", "Assigned Agent",
    "User Name", "Client", "SLA", "Time to Respond (Decimal)",
    "Time to Resolve (Decimal)", "Priority",
]

# Historial mensual: esta escrito a mano en la pestana GRAFICAS (A17:B24).
# No se deriva de DATOS, asi que se replica aqui para que el grafico se pueda dibujar.
HISTORIAL = [
    ("Enero", 73), ("Febrero", 47), ("Marzo", 61), ("Abril", 65),
    ("Mayo", 53), ("Junio", 52), ("Julio", 62), ("Agosto", 63),
]


def cargar_mapeo(ruta):
    """La tabla de reemplazos es dato del cliente: se carga de assets/, no se versiona."""
    if not ruta.exists():
        raise SystemExit(
            f"No se encontro {ruta}.\n"
            "Es la tabla real -> sintetico y no se versiona a proposito (contiene datos\n"
            "del cliente). Pidansela a quien tenga la carpeta assets/ original."
        )
    cfg = json.loads(ruta.read_text(encoding="utf-8"))
    # El orden importa: primero lo mas especifico, tal como viene en el JSON.
    reemplazos = [(viejo, nuevo) for viejo, nuevo in cfg["reemplazos"]]
    return cfg, reemplazos


CONFIG, REEMPLAZOS = cargar_mapeo(MAPEO)
CLIENTE_DEMO = CONFIG["cliente_destino"]
CORREO_SOC = CONFIG["correo_soc"]
CORREO_SOC_DEMO = CONFIG["correo_soc_destino"]


def leer_datos(ruta):
    """Lee la pestana DATOS sin openpyxl (falla con las cachés de tablas dinamicas)."""
    with zipfile.ZipFile(ruta) as z:
        cadenas = [
            "".join(t.text or "" for t in si.iter(f"{NS}t"))
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall(f"{NS}si")
        ]
        hoja = ET.fromstring(z.read(HOJA_DATOS))

    filas = []
    for fila in hoja.iter(f"{NS}row"):
        if int(fila.get("r")) == 1:  # encabezados
            continue
        celdas = {}
        for celda in fila.findall(f"{NS}c"):
            col = "".join(c for c in celda.get("r") if c.isalpha())
            valor = celda.find(f"{NS}v")
            if celda.get("t") == "s" and valor is not None:
                celdas[col] = cadenas[int(valor.text)]
            else:
                celdas[col] = valor.text if valor is not None else None
        if celdas.get("B"):
            filas.append(celdas)
    return filas


def limpiar(texto, refs):
    if not texto:
        return texto
    texto = unicodedata.normalize("NFC", texto).replace("\xa0", " ")
    for viejo, nuevo in REEMPLAZOS:
        texto = texto.replace(viejo, nuevo)
    for viejo, nuevo in refs.items():
        texto = texto.replace(viejo, nuevo)
    return re.sub(r"\s+", " ", texto).strip()


def serial_a_fecha(serial):
    return datetime.date(1899, 12, 30) + datetime.timedelta(days=float(serial))


def construir_mapas(filas):
    """Mapas estables: el mismo valor real siempre da el mismo valor sintetico."""
    refs = sorted({m for f in filas for m in re.findall(r"\b(1\d{6})\b", f.get("C") or "")})
    mapa_refs = {r: str(900101 + i) for i, r in enumerate(refs)}

    # Agente 01 = el de mas tickets, para que el dashboard se lea natural.
    agentes = [a for a, _ in collections.Counter(f.get("K") for f in filas).most_common()]
    mapa_agentes = {a: f"Agente {i + 1:02d}" for i, a in enumerate(agentes)}

    usuarios = [
        u for u, _ in collections.Counter(f.get("L") for f in filas).most_common()
        if u != CORREO_SOC
    ]
    mapa_usuarios = {u: f"Usuario {i + 1:02d}" for i, u in enumerate(usuarios)}
    mapa_usuarios[CORREO_SOC] = CORREO_SOC_DEMO

    ids = sorted({int(f["B"]) for f in filas})
    mapa_ids = {viejo: 40001 + i for i, viejo in enumerate(ids)}

    return mapa_refs, mapa_agentes, mapa_usuarios, mapa_ids


def sanitizar(filas):
    refs, agentes, usuarios, ids = construir_mapas(filas)
    tickets = []
    for i, f in enumerate(filas, start=1):
        tickets.append({
            "indice": i,
            "ticket_id": ids[int(f["B"])],
            "summary": limpiar(f.get("C"), refs),
            "status": f.get("D"),
            "serial_fecha": float(f["E"]),
            "fecha_creacion": serial_a_fecha(f["E"]).isoformat(),
            "hora_creacion": int(f["F"]),
            "category": f.get("G"),
            "team": f.get("H"),
            "itil_type": f.get("I"),
            "ticket_type": f.get("J"),
            "assigned_agent": agentes[f.get("K")],
            "user_name": usuarios.get(f.get("L"), "Usuario 00"),
            "client": CLIENTE_DEMO,
            "sla": f.get("N"),
            "time_to_respond": float(f["O"]) if f.get("O") else None,
            "time_to_resolve": float(f["P"]) if f.get("P") else None,
            "priority": f.get("Q"),
        })
    return tickets, ids


def escribir_xlsx(tickets, ruta):
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "DATOS"
    ws.append(COLUMNAS)
    for t in tickets:
        ws.append([
            t["indice"], t["ticket_id"], t["summary"], t["status"],
            t["serial_fecha"], t["hora_creacion"], t["category"], t["team"],
            t["itil_type"], t["ticket_type"], t["assigned_agent"],
            t["user_name"], t["client"], t["sla"], t["time_to_respond"],
            t["time_to_resolve"], t["priority"],
        ])
    for col, ancho in zip("ABCDEFGHIJKLMNOPQ",
                          [5, 10, 62, 12, 14, 8, 28, 22, 16, 20, 14, 22, 20, 32, 12, 12, 10]):
        ws.column_dimensions[col].width = ancho
    ws.freeze_panes = "A2"
    wb.save(ruta)


def verificar(tickets):
    """Falla ruidosamente si se filtro algo. Es la red de seguridad del script.

    Los terminos prohibidos son exactamente las CLAVES del mapeo: si una sobrevive
    al reemplazo, es una fuga. Asi la lista negra no se puede desincronizar del mapeo
    (y no hay que escribir datos del cliente dos veces).
    """
    prohibido = re.compile(
        "|".join(re.escape(viejo) for viejo, _ in REEMPLAZOS), re.IGNORECASE
    )
    fugas = [t for t in tickets if prohibido.search(json.dumps(t, ensure_ascii=False))]
    if fugas:
        raise SystemExit(
            f"ABORTADO: {len(fugas)} ticket(s) con datos sin sanitizar.\n"
            + "\n".join(f"  {t['ticket_id']}: {t['summary']}" for t in fugas[:5])
        )

    conteos = {
        "total": len(tickets),
        "por_tipo": collections.Counter(t["ticket_type"] for t in tickets),
        "por_status": collections.Counter(t["status"] for t in tickets),
        "por_herramienta": collections.Counter(
            t["category"].split(">")[0].strip() for t in tickets
        ),
    }
    esperado_tipo = {"Solicitud": 43, "Alerta": 15, "Solicitud de Reporte": 5}
    esperado_status = {"Closed": 47, "With User": 8, "Resuelto": 6, "On Hold": 2}
    esperado_tool = {"Cloudflare": 55, "BeyondTrust": 5, "Thinkst Canary": 3}
    for nombre, real, esp in [
        ("ticket_type", conteos["por_tipo"], esperado_tipo),
        ("status", conteos["por_status"], esperado_status),
        ("herramienta", conteos["por_herramienta"], esperado_tool),
    ]:
        if dict(real) != esp:
            raise SystemExit(f"ABORTADO: {nombre} no cuadra.\n  real={dict(real)}\n  esp={esp}")
    return conteos


def main():
    if not ORIGEN.exists():
        raise SystemExit(f"No se encontro {ORIGEN}. Este script necesita el export real de Halo.")

    filas = leer_datos(ORIGEN)
    tickets, mapa_ids = sanitizar(filas)
    conteos = verificar(tickets)

    DESTINO.mkdir(exist_ok=True)
    (DESTINO / "halo-demo-agosto.json").write_text(
        json.dumps({
            "origen": "dataset sintetico derivado de un export de Halo (estructura real, datos sanitizados)",
            "cliente": CLIENTE_DEMO,
            "periodo": "Agosto 2026",
            "total_tickets": len(tickets),
            "tickets": tickets,
        }, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (DESTINO / "historial-mensual.json").write_text(
        json.dumps({
            "nota": "Escrito a mano en la pestana GRAFICAS del archivo original (A17:B24). No se deriva de DATOS.",
            "anio": 2026,
            "meses": [{"mes": m, "tickets": n} for m, n in HISTORIAL],
        }, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    escribir_xlsx(tickets, DESTINO / "halo-demo-agosto.xlsx")

    print(f"OK  {len(tickets)} tickets sanitizados")
    print(f"    por tipo        : {dict(conteos['por_tipo'])}")
    print(f"    por status      : {dict(conteos['por_status'])}")
    print(f"    por herramienta : {dict(conteos['por_herramienta'])}")
    print(f"    cerrados={conteos['por_status']['Closed'] + conteos['por_status']['Resuelto']}"
          f"  pendientes={conteos['por_status']['With User'] + conteos['por_status']['On Hold']}")
    tpa = [t["time_to_respond"] for t in tickets if t["time_to_respond"] is not None]
    tmr = [t["time_to_resolve"] for t in tickets if t["time_to_resolve"] is not None]
    print(f"    TPA={sum(tpa)/len(tpa):.2f} (n={len(tpa)})   TMR={sum(tmr)/len(tmr):.2f} (n={len(tmr)})")
    citados = " | ".join(
        f"{viejo} -> {mapa_ids[viejo]}"
        for viejo in CONFIG.get("ids_citados_en_docs", [])
        if viejo in mapa_ids
    )
    if citados:
        print(f"    tickets citados en docs: {citados}")
    print("    escritos: data/halo-demo-agosto.xlsx, data/halo-demo-agosto.json, data/historial-mensual.json")


if __name__ == "__main__":
    main()
