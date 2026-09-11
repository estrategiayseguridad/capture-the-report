import { expect, test } from "@playwright/test";
import { Buffer } from "node:buffer";
import {
  HEADERS,
  referenceFixture,
  ticketRow,
  workbookBuffer,
} from "./fixtures/excel";

test("imports XLSX on the server and displays dynamic summaries and conversion", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/reportes/nuevo");
  await page.getByLabel("Cliente", { exact: true }).fill("Cliente sintético");
  await page.getByLabel("Mes", { exact: true }).selectOption("6");
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await page.getByLabel("Archivo XLSX").setInputFiles({
    name: "synthetic-june.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: referenceFixture(),
  });
  const responsePromise = page.waitForResponse("**/api/reportes/importar");
  await page.getByRole("button", { name: "Importar y analizar" }).click();
  expect((await responsePromise).status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Tickets importados (24)" }),
  ).toBeVisible();
  const tickets = page.getByRole("table", {
    name: "Tickets importados",
    exact: true,
  });
  await expect(tickets.getByRole("row")).toHaveCount(25);
  await expect(
    tickets.getByRole("cell", { name: "0.0165048607777773", exact: true }),
  ).toBeVisible();
  await expect(
    tickets.getByRole("cell", { name: "0.9903", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("table", { name: "Resumen por prioridad" })
      .getByRole("row")
      .filter({ hasText: "Baja" }),
  ).toContainText("21");
  await expect(
    page
      .getByRole("table", { name: "Resumen por tipo de ticket" })
      .getByRole("row")
      .filter({ hasText: "Solicitud de Reporte" }),
  ).toContainText("6");
  await page.screenshot({
    path: testInfo.outputPath("import-result.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  // A failed second import replaces the previous result; no stale success remains.
  await page.getByLabel("Archivo XLSX").setInputFiles({
    name: "invalid.xlsx",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not an Excel file"),
  });
  await expect(
    page.getByRole("heading", { name: "Tickets importados (24)" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Importar y analizar" }).click();
  await expect(
    page
      .getByRole("region", { name: "Resultado de importación" })
      .getByRole("alert"),
  ).toContainText("No fue posible leer el archivo seleccionado.");
  expect(errors).toEqual([]);
});

test("API enforces required fields, real file content and missing columns", async ({
  request,
}) => {
  const metadata = {
    clientName: "Cliente sintético",
    month: "6",
    year: "2026",
  };
  const missingFile = await request.post("/api/reportes/importar", {
    multipart: metadata,
  });
  expect(missingFile.status()).toBe(400);
  const withoutPriority = HEADERS.filter((header) => header !== "Priority");
  const response = await request.post("/api/reportes/importar", {
    multipart: {
      ...metadata,
      file: {
        name: "missing.xlsx",
        mimeType: "application/octet-stream",
        buffer: workbookBuffer([
          {
            name: "Tickets",
            rows: [withoutPriority, ticketRow().slice(0, -1)],
          },
        ]),
      },
    },
  });
  expect(response.status()).toBe(422);
  expect((await response.json()).missingColumns).toEqual(["Priority"]);
  const wrongExtension = await request.post("/api/reportes/importar", {
    multipart: {
      ...metadata,
      file: {
        name: "test.csv",
        mimeType: "application/octet-stream",
        buffer: referenceFixture(),
      },
    },
  });
  expect(wrongExtension.status()).toBe(400);
});

test("shows a busy state and prevents a second simultaneous submission", async ({
  page,
}) => {
  let requests = 0;
  let finishRequest: () => void = () => {};
  const waiting = new Promise<void>((resolve) => {
    finishRequest = resolve;
  });
  await page.route("**/api/reportes/importar", async (route) => {
    requests++;
    await waiting;
    await route.continue();
  });
  await page.goto("/reportes/nuevo");
  await page.getByLabel("Cliente", { exact: true }).fill("Cliente sintético");
  await page.getByLabel("Mes", { exact: true }).selectOption("6");
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await page.getByLabel("Archivo XLSX").setInputFiles({
    name: "test.xlsx",
    mimeType: "application/octet-stream",
    buffer: referenceFixture(),
  });
  await page.getByRole("button", { name: "Importar y analizar" }).click();
  await expect(
    page.getByRole("button", { name: "Analizando archivo..." }),
  ).toBeDisabled();
  await expect(page.getByLabel("Cliente", { exact: true })).toBeDisabled();
  finishRequest();
  await expect(
    page.getByRole("heading", { name: "Tickets importados (24)" }),
  ).toBeVisible();
  expect(requests).toBe(1);
});
