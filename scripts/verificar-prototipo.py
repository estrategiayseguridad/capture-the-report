"""
Verifica el prototipo de punta a punta contra el servidor corriendo en local.

Comprueba las dos cosas que importan:
  1. Que las rutas responden y el circuito completo funciona (subir -> dashboard ->
     informe -> descarga -> volver al demo).
  2. Que las CIFRAS DE CONTROL del informe de Agosto se reproducen exactamente,
     por los dos caminos de entrada (dataset de demo y .xlsx subido). Si el motor
     de metricas se rompe, esto lo detecta.

Uso:  npm run dev        (en otra terminal)
      python scripts/verificar-prototipo.py
"""

import io
import json
import re
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

BASE = "http://localhost:3000"
RAIZ = Path(__file__).resolve().parent.parent
XLSX_DEMO = RAIZ / "data" / "halo-demo-agosto.xlsx"

# Las cifras del informe ya entregado al cliente. Son el criterio de correctitud.
CIFRAS = [
    "Tickets 63",
    "Alertas 15",
    "Solicitudes 43",
    "Cerrados 53",
    "Pendientes 10",
    "TMR 29.29 h (n=53)",
]

resultados: list[tuple[bool, str, str]] = []


def revisar(ok: bool, prueba: str, detalle: str = "") -> bool:
    resultados.append((ok, prueba, detalle))
    print(f"  {'OK  ' if ok else 'FALLA'}  {prueba}{f'  -> {detalle}' if detalle else ''}")
    return ok


def cabeceras(respuesta) -> dict[str, str]:
    """Las cabeceras HTTP no distinguen mayusculas; se normalizan a minuscula."""
    return {k.lower(): v for k, v in respuesta.headers.items()}


def pedir(ruta, metodo="GET", cuerpo=None, tipo=None):
    req = urllib.request.Request(f"{BASE}{ruta}", method=metodo, data=cuerpo)
    if tipo:
        req.add_header("Content-Type", tipo)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace"), cabeceras(r)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), cabeceras(e)


def texto_visible(html: str) -> str:
    sin_script = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", sin_script))


def multipart(nombre: str, contenido: bytes):
    """Arma un multipart/form-data a mano para no depender de `requests`."""
    borde = uuid.uuid4().hex
    b = io.BytesIO()
    b.write(f"--{borde}\r\n".encode())
    b.write(f'Content-Disposition: form-data; name="archivo"; filename="{nombre}"\r\n'.encode())
    b.write(b"Content-Type: application/octet-stream\r\n\r\n")
    b.write(contenido)
    b.write(f"\r\n--{borde}--\r\n".encode())
    return b.getvalue(), f"multipart/form-data; boundary={borde}"


def main() -> int:
    if not XLSX_DEMO.exists():
        print(f"No se encontro {XLSX_DEMO}")
        return 1

    print(f"\nVerificando {BASE}\n")

    estado, _, _ = pedir("/api/cargar", "DELETE")
    if not revisar(estado == 200, "el servidor responde", f"reset -> {estado}"):
        print("\n  ¿Esta corriendo `npm run dev`?\n")
        return 1

    print("\n[1] Dashboard con el dataset de demo")
    estado, html, _ = pedir("/")
    revisar(estado == 200, "GET /", f"HTTP {estado}")
    visible = texto_visible(html)
    revisar("dataset de demo" in visible, "arranca con el dataset de demo")
    for cifra in CIFRAS:
        revisar(cifra in visible, f"cifra de control: {cifra}")
    revisar("16" in visible and "proceso manual pierde" in visible, "panel de tickets perdidos")

    print("\n[2] Subir el .xlsx exportado de Halo")
    cuerpo, tipo = multipart(XLSX_DEMO.name, XLSX_DEMO.read_bytes())
    estado, respuesta, _ = pedir("/api/cargar", "POST", cuerpo, tipo)
    revisar(estado == 200, "POST /api/cargar", f"HTTP {estado}")
    datos = json.loads(respuesta) if estado == 200 else {}
    revisar(datos.get("total") == 63, "parsea 63 tickets", str(datos.get("total")))
    revisar(datos.get("hoja") == "DATOS", "encuentra la hoja DATOS", str(datos.get("hoja")))
    revisar(datos.get("avisos") == [], "sin columnas faltantes", str(datos.get("avisos")))

    print("\n[3] Las mismas cifras por el camino del .xlsx")
    estado, html, _ = pedir("/")
    visible = texto_visible(html)
    revisar("dataset de demo" not in visible, "el dashboard usa el archivo subido")
    for cifra in CIFRAS:
        revisar(cifra in visible, f"cifra de control: {cifra}")

    print("\n[4] Informe y descarga")
    estado, html, _ = pedir("/informe")
    revisar(estado == 200, "GET /informe", f"HTTP {estado}")
    visible = texto_visible(html)
    for seccion in ["1. Introduccion", "7. Cumplimiento", "8. Analisis", "Anexo"]:
        revisar(seccion in visible, f"seccion presente: {seccion}")
    revisar("29.29" in visible and "63 tickets" in visible, "cifras inyectadas en la redaccion")

    estado, doc, cab = pedir("/api/informe")
    revisar(estado == 200, "GET /api/informe", f"HTTP {estado}")
    revisar(
        "msword" in cab.get("content-type", ""),
        "se descarga como documento de Word",
        cab.get("content-type", ""),
    )
    revisar(".doc" in cab.get("content-disposition", ""), "nombre de archivo correcto")
    doc_visible = texto_visible(doc)
    revisar("Enero 73" in doc_visible, "la grafica de historial va en el documento")
    revisar(doc_visible.count("Cloudflare") > 5, "el anexo trae el detalle de tickets")

    print("\n[5] Manejo de errores")
    cuerpo, tipo = multipart("notas.md", b"esto no es un excel")
    estado, respuesta, _ = pedir("/api/cargar", "POST", cuerpo, tipo)
    revisar(estado == 400, "rechaza un archivo que no es Excel", f"HTTP {estado}")

    cuerpo, tipo = multipart("vacio.xlsx", b"PK\x03\x04 basura")
    estado, respuesta, _ = pedir("/api/cargar", "POST", cuerpo, tipo)
    revisar(estado in (422, 500), "rechaza un .xlsx ilegible", f"HTTP {estado}")

    estado, _, _ = pedir("/api/cargar", "DELETE")
    estado, html, _ = pedir("/")
    revisar("dataset de demo" in texto_visible(html), "vuelve al dataset de demo")

    fallas = [r for r in resultados if not r[0]]
    print(f"\n{'-' * 58}")
    if fallas:
        print(f"  {len(fallas)} de {len(resultados)} comprobaciones FALLARON:")
        for _, prueba, detalle in fallas:
            print(f"    - {prueba} {detalle}")
        return 1
    print(f"  {len(resultados)} comprobaciones OK. El prototipo esta listo para la demo.")
    print(f"{'-' * 58}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
