import { expect, test, type Page } from "@playwright/test";
import { chartReferenceFixture } from "./fixtures/charts";
import { HEADERS, ticketRow, workbookBuffer } from "./fixtures/excel";

async function importChartFile(page: Page, buffer = chartReferenceFixture()) {
  await page.goto("/reportes/nuevo");
  await page.getByLabel("Cliente", { exact: true }).fill("Cliente sintético");
  await page.getByLabel("Mes", { exact: true }).selectOption("6");
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await page.getByLabel("Archivo XLSX").setInputFiles({
    name: "synthetic-charts.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer,
  });
  await page.getByRole("button", { name: "Importar y analizar" }).click();
  await page.getByRole("button", { name: "Continuar a gráficas" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test("charts require an import and provide a return action", async ({
  page,
}) => {
  await page.goto("/reportes/nuevo");
  await page.getByRole("button", { name: "2. Gráficas" }).click();
  await expect(
    page.getByText("Primero debe importar y analizar un archivo XLSX."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Regresar a Importación" }).click();
  await expect(page.getByLabel("Archivo XLSX")).toBeVisible();
});

test("edits, applies, resets and retains charts without rereading or changing source tickets", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  let imports = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().endsWith("/api/reportes/importar")) imports++;
  });
  await importChartFile(page);
  const status = page.getByRole("region", {
    name: "Estados de los tickets",
    exact: true,
  });
  const period = page.getByRole("region", {
    name: "Tickets del período",
    exact: true,
  });
  const update = "Generar / Actualizar gráfica";
  await expect(status.getByLabel("Closed", { exact: true })).toHaveValue("20");
  await expect(status.getByLabel("With User")).toHaveValue("4");
  await expect(status.getByLabel("Open", { exact: true })).toHaveValue("0");
  await expect(status.getByRole("img")).toHaveCount(0);
  await status.getByRole("button", { name: update }).click();
  await status.getByText("Ver datos de la gráfica").click();
  const statusData = status.getByRole("table");
  const closed = statusData.getByRole("row").filter({ hasText: "Closed" });
  await status.getByLabel("Closed", { exact: true }).fill("19");
  await expect(status.getByRole("status")).toContainText("suman 23 tickets");
  await expect(closed.getByRole("cell").last()).toHaveText("20");
  await status.getByRole("button", { name: update }).click();
  await expect(closed.getByRole("cell").last()).toHaveText("19");
  for (const value of ["-1", "1.5", ""]) {
    await status.getByLabel("Closed", { exact: true }).fill(value);
    await status.getByRole("button", { name: update }).click();
    await expect(status.getByLabel("Closed", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(closed.getByRole("cell").last()).toHaveText("19");
  }
  await status.getByRole("button", { name: "Restablecer valores" }).click();
  await expect(status.getByLabel("Closed", { exact: true })).toHaveValue("20");
  await expect(closed.getByRole("cell").last()).toHaveText("20");
  await expect(status.getByRole("status")).toContainText(
    "Los valores coinciden",
  );

  await expect(
    period.getByLabel("Cantidad fila 1", { exact: true }),
  ).toHaveValue("3");
  await expect(
    period.getByLabel("Cantidad fila 2", { exact: true }),
  ).toHaveValue("15");
  await expect(
    period.getByLabel("Cantidad fila 3", { exact: true }),
  ).toHaveValue("6");
  await period.getByRole("button", { name: update }).click();
  await period.getByText("Ver datos de la gráfica").click();
  const periodData = period.getByRole("table", {
    name: "Datos: TICKETS DEL PERÍODO",
  });
  const low = periodData
    .getByRole("row")
    .filter({ hasText: "Solicitud - Baja" });
  await period.getByLabel("Cantidad fila 2", { exact: true }).fill("14");
  await expect(period.getByRole("status")).toContainText("suman 23 tickets");
  await expect(low.getByRole("cell").last()).toHaveText("15");
  await period.getByRole("button", { name: update }).click();
  await expect(low.getByRole("cell").last()).toHaveText("14");
  await period.getByRole("button", { name: "Agregar fila" }).click();
  await period.getByRole("button", { name: update }).click();
  await expect(
    period.getByLabel("Tipo fila 4", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await period.getByLabel("Tipo fila 4", { exact: true }).fill("Incidente");
  await period.getByLabel("Severidad fila 4", { exact: true }).fill("Alta");
  await period.getByLabel("Cantidad fila 4", { exact: true }).fill("2");
  await period.getByRole("button", { name: update }).click();
  await expect(
    periodData.getByRole("row").filter({ hasText: "Incidente - Alta" }),
  ).toContainText("2");
  await period
    .getByRole("button", { name: "Eliminar fila 4", exact: true })
    .click();
  await expect(
    period
      .getByRole("table", { name: "Configuración del período" })
      .getByRole("row"),
  ).toHaveCount(4);
  await period.getByRole("button", { name: update }).click();
  await expect(
    periodData.getByRole("row").filter({ hasText: "Incidente - Alta" }),
  ).toHaveCount(0);
  await period.getByLabel("Cantidad fila 1", { exact: true }).fill("-3");
  await period.getByRole("button", { name: update }).click();
  await expect(
    period.getByLabel("Cantidad fila 1", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(low.getByRole("cell").last()).toHaveText("14");

  // Both applied overrides and unfinished drafts survive step navigation.
  await page.getByRole("button", { name: "1. Importación" }).click();
  const source = page.getByRole("table", {
    name: "Tickets importados",
    exact: true,
  });
  await expect(
    source.getByRole("cell", { name: "Closed", exact: true }),
  ).toHaveCount(20);
  await expect(
    source.getByRole("cell", { name: "Baja", exact: true }),
  ).toHaveCount(21);
  await expect(page.getByLabel("Cliente", { exact: true })).toHaveValue(
    "Cliente sintético",
  );
  await page.getByRole("button", { name: "2. Gráficas" }).click();
  await expect(
    period.getByLabel("Cantidad fila 1", { exact: true }),
  ).toHaveValue("-3");
  await period.getByText("Ver datos de la gráfica").click();
  await expect(low.getByRole("cell").last()).toHaveText("14");
  await period.getByRole("button", { name: "Restablecer valores" }).click();
  await expect(
    period.getByLabel("Cantidad fila 1", { exact: true }),
  ).toHaveValue("3");
  await expect(low.getByRole("cell").last()).toHaveText("15");
  await expect(period.getByRole("status")).toContainText(
    "Los valores coinciden",
  );
  await expect(
    page.getByRole("button", { name: "Continuar", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Historial anual se implementará en la siguiente fase."),
  ).toBeVisible();
  for (const canvas of await page.locator("canvas").all()) {
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(250);
    expect(box?.height).toBeGreaterThan(250);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document
      .querySelectorAll('[data-slot="table-container"]')
      .forEach((element) => {
        element.scrollLeft = 0;
      });
  });
  await page.screenshot({
    path: testInfo.outputPath("report-charts.png"),
    fullPage: true,
  });
  expect(imports).toBe(1);
  expect(errors).toEqual([]);

  // Editing the import invalidates old tickets and their chart configuration.
  await page.getByRole("button", { name: "1. Importación" }).click();
  await page.getByLabel("Cliente", { exact: true }).fill("Otro cliente");
  await page.getByRole("button", { name: "2. Gráficas" }).click();
  await expect(
    page.getByText("Primero debe importar y analizar un archivo XLSX."),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("unknown status and long new types remain visible without breaking the page", async ({
  page,
}) => {
  const newType =
    "Investigación y seguimiento de incidentes de infraestructura corporativa";
  await importChartFile(
    page,
    workbookBuffer([
      {
        name: "Tickets",
        rows: [
          HEADERS,
          ticketRow({
            Status: "Escalado",
            "Ticket Type": newType,
            Priority: "Urgente",
          }),
        ],
      },
    ]),
  );
  const status = page.getByRole("region", {
    name: "Estados de los tickets",
    exact: true,
  });
  const period = page.getByRole("region", {
    name: "Tickets del período",
    exact: true,
  });
  await expect(
    status.getByText(/Estados fuera de las tres categorías/),
  ).toContainText("Escalado (1)");
  await expect(status.getByText(/Advertencia:/)).toContainText(
    "suman 0 tickets",
  );
  await status
    .getByRole("button", { name: "Generar / Actualizar gráfica" })
    .click();
  await expect(status.getByRole("img")).toBeVisible();
  await expect(period.getByLabel("Tipo fila 1", { exact: true })).toHaveValue(
    newType,
  );
  await expect(
    period.getByLabel("Severidad fila 1", { exact: true }),
  ).toHaveValue("Urgente");
  await period
    .getByRole("button", { name: "Generar / Actualizar gráfica" })
    .click();
  await expect(period.getByRole("img")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
