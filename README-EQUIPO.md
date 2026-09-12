# Rinde — Equipo 01

Gestión de gastos y reembolsos: el colaborador fotografía la factura, OCR local extrae el DTE, administración autoriza, concilia documentos SAT y reembolsa. Persistencia JSON local, sin nube de pago.

## Setup

```bash
git checkout equipo-01
npm install
npm run seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Cuentas demo

Contraseña de todas: `Demo123!`

| Rol | Correo |
|-----|--------|
| Empleado | employee@example.local |
| Empleado 2 | employee2@example.local |
| Gerente | manager@example.local |
| Admin | admin@example.local |
| Super Admin | superadmin@example.local |

## Camino feliz de demo

1. Entra como `employee@example.local`.
2. En **Inicio** ves *Te debemos* (cálculo de servidor).
3. **Escanear factura** → cámara o subir imagen → OCR local → corrige DTE / total / proveedor → cliente y proyecto → enviar.
4. Entra como `admin@example.local`.
5. Dashboard con totales reales → Autorizaciones → aprobar.
6. Facturación SAT: sube XML/JSON → procesa → concilia.
7. Reembolsos (permite parcial) → el saldo del empleado baja.
8. Exportar XLSX o ZIP. La bitácora registra los eventos.

## Persistencia

- JSON: `data/app-store.json` (se crea con `npm run seed`)
- Recibos: `uploads/receipts/` (no se sirven en `/public`)
- SAT: `uploads/billing-documents/`
- Acceso a archivos solo por rutas protegidas `/api/files/...`

No hay PostgreSQL ni servicios externos.

## OCR

Motor: **tesseract.js** (OCR real en el servidor Node).

La primera lectura descarga los modelos `spa`/`eng` (necesita red). Si el motor no carga, la API responde 503 y el empleado puede capturar el DTE a mano. **Nunca se inventa un número de documento.**

Idiomas: `OCR_LANGS=spa+eng` en `.env.example`.

## Teléfono / LAN

`npm run dev` escucha en `0.0.0.0:3000`.

- Laptop: `http://localhost:3000`
- Teléfono en la misma Wi-Fi: `http://<IP-LAN-DE-LA-LAPTOP>:3000`

No hay IP fija: depende de la red.

## Scripts

```bash
npm run seed
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

## Parser SAT

Arquitectura `SatBillingDocumentParser` para XML FEL-like, JSON y CSV. Extrae tipo, número, fecha, total, moneda, emisor y receptor, y luego calcula coincidencias.

**No es un validador certificador SAT de producción.** No se afirma compatibilidad FEL completa. PDF binario no se interpreta como DTE certificado.

## Limitaciones de hackathon

- Un archivo JSON no es una base transaccional (hay cola de escritura, no locking distribuido).
- OCR de fotos borrosas falla: por eso existe corrección manual y candidatos múltiples.
- HEIC nativo del iPhone puede no leerse; usa JPEG/PNG.
- Sin firma electrónica, MFA ni cifrado en reposo.

## Roles

- **Employee:** solo sus gastos.
- **Manager:** autoriza gastos de su departamento, no los propios.
- **Admin / Super Admin:** catálogos, conciliación, reembolsos, dashboard, exportación, auditoría.
