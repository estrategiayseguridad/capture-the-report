import { promises as fs } from "fs";
import path from "path";
import { EMPTY_STORE, type AppStore } from "../src/lib/types";
import type { ExpenseInput } from "../src/services/expenses";
import { hashPassword } from "../src/lib/password";
import { nowIso } from "../src/lib/ids";
import { writeStore } from "./seed-store";
import { createExpense, authorizeExpense } from "../src/services/expenses";
import { recordReimbursement } from "../src/services/reimbursements";
import { ingestBillingFiles, processBillingDocuments } from "../src/services/billing";
import type { PublicUser } from "../src/lib/types";
import { receiptsDir, billingDir } from "../src/lib/paths";

const PASSWORD = "Demo123!";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mP8z8BQz0AEYBxVSF+FAP5FDvcfW4Q0AAAAAElFTkSuQmCC",
  "base64",
);

function userOf(store: AppStore, email: string): PublicUser {
  const user = store.users.find((item) => item.email === email);
  if (!user) throw new Error(`missing ${email}`);
  const { passwordHash: _passwordHash, ...rest } = user;
  void _passwordHash;
  return rest;
}

async function addUser(
  store: AppStore,
  input: {
    id: string;
    name: string;
    email: string;
    role: PublicUser["role"];
    employeeNumber: string;
    departmentId: string;
    managerId: string | null;
  },
) {
  const timestamp = nowIso();
  store.users.push({
    ...input,
    passwordHash: await hashPassword(PASSWORD),
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function receipt(store: AppStore, userId: string, label: string) {
  await fs.mkdir(receiptsDir(), { recursive: true });
  const storedName = `${label}.png`;
  await fs.writeFile(path.join(receiptsDir(), storedName), PNG);
  const item = {
    id: `rcpt_${label}`,
    storedName,
    originalName: `${label}.png`,
    mimeType: "image/png",
    size: PNG.length,
    uploadedBy: userId,
    createdAt: nowIso(),
  };
  store.receiptFiles.push(item);
  return item.id;
}

function input(partial: ExpenseInput): ExpenseInput {
  return partial;
}

async function main() {
  const store: AppStore = structuredClone(EMPTY_STORE);
  const timestamp = nowIso();

  store.departments = [
    { id: "dep-ops", name: "Operaciones", code: "OPS", managerId: "usr_manager", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "dep-cons", name: "Consultoría", code: "CON", managerId: "usr_manager", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "dep-adm", name: "Administración", code: "ADM", managerId: "usr_admin", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "dep-ti", name: "TI interna", code: "TI", managerId: "usr_admin", active: true, createdAt: timestamp, updatedAt: timestamp },
  ];
  store.clients = [
    { id: "cli-acme", name: "ACME Corp", code: "ACME", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "cli-norte", name: "NorteLogística", code: "NORTE", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "cli-andes", name: "Clínica Andes", code: "ANDES", active: true, createdAt: timestamp, updatedAt: timestamp },
  ];
  store.projects = [
    { id: "prj-vapt", name: "VAPT aplicativo web", code: "VAPT", clientId: "cli-acme", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "prj-soc", name: "SOC gestionado 2026", code: "SOC", clientId: "cli-norte", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "prj-fw", name: "Endurecimiento perimetral Q3", code: "FW", clientId: "cli-andes", active: true, createdAt: timestamp, updatedAt: timestamp },
    { id: "prj-cierre", name: "Cierre contable interno", code: "CIERRE", clientId: "cli-acme", active: true, createdAt: timestamp, updatedAt: timestamp },
  ];

  await addUser(store, { id: "usr_super", name: "Sofía Super", email: "superadmin@example.local", role: "SuperAdmin", employeeNumber: "E-0001", departmentId: "dep-adm", managerId: null });
  await addUser(store, { id: "usr_admin", name: "Carlos Admin", email: "admin@example.local", role: "Admin", employeeNumber: "E-0002", departmentId: "dep-adm", managerId: "usr_super" });
  await addUser(store, { id: "usr_manager", name: "Marta Ruiz", email: "manager@example.local", role: "Manager", employeeNumber: "E-0100", departmentId: "dep-ops", managerId: "usr_admin" });
  await addUser(store, { id: "usr_ana", name: "Ana Pérez", email: "employee@example.local", role: "Employee", employeeNumber: "E-2101", departmentId: "dep-cons", managerId: "usr_manager" });
  await addUser(store, { id: "usr_luis", name: "Luis Soto", email: "employee2@example.local", role: "Employee", employeeNumber: "E-2102", departmentId: "dep-ops", managerId: "usr_manager" });

  const ana = userOf(store, "employee@example.local");
  const luis = userOf(store, "employee2@example.local");
  const manager = userOf(store, "manager@example.local");
  const admin = userOf(store, "admin@example.local");

  const r1 = await receipt(store, ana.id, "dte-ana-1");
  const r2 = await receipt(store, ana.id, "dte-ana-2");
  const r3 = await receipt(store, luis.id, "dte-luis-1");

  const draft = createExpense(store, ana, input({
    receiptFileId: r1,
    confirmedDocumentNumber: "DTE-2026-88011",
    confirmedTotal: 450,
    confirmedDate: "2026-09-08",
    confirmedVendor: "Café del Equipo",
    confirmedCurrency: "GTQ",
    departmentId: "dep-cons",
    clientId: "cli-acme",
    projectId: "prj-cierre",
    ocrRawText: "Numero de DTE: DTE-2026-88011\nTotal: Q450",
    ocrDocumentNumber: "DTE-2026-88011",
    ocrTotal: 450,
  }), false);

  const pending = createExpense(store, ana, input({
    receiptFileId: r2,
    confirmedDocumentNumber: "FEL-9A1B2C3D4E5F67890",
    confirmedTotal: 12600,
    confirmedDate: "2026-09-01",
    confirmedVendor: "Licencias Seguras S.A.",
    confirmedCurrency: "GTQ",
    departmentId: "dep-cons",
    clientId: "cli-acme",
    projectId: "prj-vapt",
    ocrDocumentNumber: "FEL-9A1B2C3D4E5F67890",
    ocrRawText: "Número de DTE:\nFEL-9A1B2C3D4E5F67890\nGran Total Q12,600.00",
    ocrTotal: 12600,
  }), true);

  const approved = createExpense(store, ana, input({
    confirmedDocumentNumber: "DTE-SOC-44120",
    confirmedTotal: 4850,
    confirmedDate: "2026-08-28",
    confirmedVendor: "CloudHost Demo",
    confirmedCurrency: "GTQ",
    departmentId: "dep-ops",
    clientId: "cli-norte",
    projectId: "prj-soc",
  }), true);
  authorizeExpense(store, manager, approved.id, "approve", "Hosting del SOC");

  const partial = createExpense(store, luis, input({
    receiptFileId: r3,
    confirmedDocumentNumber: "DTE-FW-77821",
    confirmedTotal: 8900,
    confirmedDate: "2026-09-03",
    confirmedVendor: "NetLabs Example",
    confirmedCurrency: "GTQ",
    departmentId: "dep-ops",
    clientId: "cli-andes",
    projectId: "prj-fw",
  }), true);
  authorizeExpense(store, admin, partial.id, "approve", "Laboratorio");
  recordReimbursement(store, admin, partial.id, 6000, "2026-09-09", "TRX-6000");

  const reimbursed = createExpense(store, luis, input({
    confirmedDocumentNumber: "DTE-VIA-32001",
    confirmedTotal: 3200,
    confirmedDate: "2026-09-02",
    confirmedVendor: "Viajes Andinos",
    confirmedCurrency: "GTQ",
    departmentId: "dep-cons",
    clientId: "cli-andes",
    projectId: "prj-fw",
  }), true);
  authorizeExpense(store, admin, reimbursed.id, "approve", "Viáticos");
  recordReimbursement(store, admin, reimbursed.id, 3200, "2026-09-08", "TRX-3200");

  const rejected = createExpense(store, luis, input({
    confirmedDocumentNumber: "DTE-PAP-640",
    confirmedTotal: 640,
    confirmedDate: "2026-09-02",
    confirmedVendor: "Papelería Central",
    confirmedCurrency: "GTQ",
    departmentId: "dep-adm",
    clientId: "cli-acme",
    projectId: "prj-cierre",
  }), true);
  authorizeExpense(store, admin, rejected.id, "reject", "No es reembolsable");

  createExpense(store, ana, input({
    confirmedDocumentNumber: "DTE-DUP-99901",
    confirmedTotal: 1500,
    confirmedDate: "2026-09-04",
    confirmedVendor: "CloudHost Demo",
    confirmedCurrency: "GTQ",
    departmentId: "dep-ti",
    clientId: "cli-norte",
    projectId: "prj-soc",
  }), true);
  createExpense(store, ana, input({
    confirmedDocumentNumber: "DTE-DUP-99901",
    confirmedTotal: 1500,
    confirmedDate: "2026-09-04",
    confirmedVendor: "CloudHost Demo",
    confirmedCurrency: "GTQ",
    departmentId: "dep-ti",
    clientId: "cli-norte",
    projectId: "prj-soc",
  }), true);

  const managerExpense = createExpense(store, manager, input({
    confirmedDocumentNumber: "DTE-MGR-110",
    confirmedTotal: 980,
    confirmedDate: "2026-09-05",
    confirmedVendor: "Taxi Seguro",
    confirmedCurrency: "GTQ",
    departmentId: "dep-ops",
    clientId: "cli-norte",
    projectId: "prj-soc",
  }), true);
  authorizeExpense(store, admin, managerExpense.id, "approve", "Aprobado por admin, no auto-aprobado");

  await fs.mkdir(billingDir(), { recursive: true });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<dte:GTDocumento xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0">
  <dte:SAT>
    <dte:DTE>
      <dte:DatosEmision>
        <dte:DatosGenerales Tipo="FACT" FechaHoraEmision="2026-08-28T10:00:00" CodigoMoneda="GTQ"/>
        <dte:Emisor NombreEmisor="CloudHost Demo" NITEmisor="12345678"/>
        <dte:Receptor NombreReceptor="ES Consulting"/>
        <dte:Totales><dte:GranTotal>4850.00</dte:GranTotal></dte:Totales>
      </dte:DatosEmision>
      <dte:Certificacion>
        <dte:NumeroAutorizacion>DTE-SOC-44120</dte:NumeroAutorizacion>
      </dte:Certificacion>
    </dte:DTE>
  </dte:SAT>
</dte:GTDocumento>`;
  const jsonDoc = JSON.stringify({
    documentType: "FACT",
    documentNumber: "DTE-FW-77821",
    date: "2026-09-03",
    total: 8900,
    currency: "GTQ",
    issuer: "NetLabs Example",
    recipient: "ES Consulting",
  });
  const unmatched = JSON.stringify({
    documentType: "FACT",
    documentNumber: "DTE-ORPHAN-0001",
    date: "2026-09-10",
    total: 199.99,
    currency: "GTQ",
    issuer: "Proveedor Fantasma",
    recipient: "ES Consulting",
  });
  const ambiguous = JSON.stringify({
    documentType: "FACT",
    documentNumber: "DTE-DUP-99901",
    date: "2026-09-04",
    total: 1500,
    currency: "GTQ",
    issuer: "CloudHost Demo",
    recipient: "ES Consulting",
  });

  await ingestBillingFiles(store, admin, [
    { name: "fel-soc.xml", type: "application/xml", size: Buffer.byteLength(xml), buffer: Buffer.from(xml) },
    { name: "fel-fw.json", type: "application/json", size: Buffer.byteLength(jsonDoc), buffer: Buffer.from(jsonDoc) },
    { name: "fel-orphan.json", type: "application/json", size: Buffer.byteLength(unmatched), buffer: Buffer.from(unmatched) },
    { name: "fel-dup.json", type: "application/json", size: Buffer.byteLength(ambiguous), buffer: Buffer.from(ambiguous) },
  ]);
  await processBillingDocuments(store, admin, undefined, 20);

  await writeStore(store);
  console.log("Seed OK");
  console.log("Demo password: Demo123!");
  console.log("employee@example.local / manager@example.local / admin@example.local / superadmin@example.local");
  console.log(`Draft leftover: ${draft.id}, pending: ${pending.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
