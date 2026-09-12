import { expect, test, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { historyTestDatabaseUrl } from "./fixtures/history-database";
import { chartReferenceFixture } from "./fixtures/charts";
import type { AnnualTicketHistory, HistoryClient } from "../src/types/history";

async function client(
  request: APIRequestContext,
  name: string,
): Promise<HistoryClient> {
  const response = await request.post("/api/clientes", { data: { name } });
  expect(response.ok()).toBe(true);
  return response.json();
}
async function history(
  request: APIRequestContext,
  clientId: string,
  year = 2026,
): Promise<AnnualTicketHistory> {
  const response = await request.get(
    `/api/historial?clientId=${clientId}&year=${year}`,
  );
  expect(response.ok()).toBe(true);
  return response.json();
}

test("history persists separately by client/year, skips blanks and upserts without duplicates or fake reports", async ({
  request,
}) => {
  const name = `API synthetic ${randomUUID()}`;
  const a = await client(request, name);
  const sameClients = await Promise.all(
    Array.from({ length: 3 }, () =>
      client(request, `  ${name.toUpperCase()}  `),
    ),
  );
  expect(sameClients.every((item) => item.id === a.id)).toBe(true);
  const b = await client(request, `Other ${randomUUID()}`);
  const payload = {
    clientId: a.id,
    year: 2026,
    months: [
      { month: 1, totalTickets: 0, source: "MANUAL" },
      { month: 6, totalTickets: 24, source: "IMPORT" },
      { month: 7, totalTickets: null, source: "MANUAL" },
    ],
  };
  const writes = await Promise.all(
    Array.from({ length: 3 }, () =>
      request.put("/api/historial", { data: payload }),
    ),
  );
  expect(writes.every((response) => response.ok())).toBe(true);
  const stored = await history(request, a.id);
  expect(stored.months[0].totalTickets).toBe(0);
  expect(stored.months[5]).toEqual({
    month: 6,
    totalTickets: 24,
    source: "IMPORT",
  });
  expect(stored.months[6].totalTickets).toBeNull();
  expect(
    (await history(request, b.id)).months.every(
      (row) => row.totalTickets === null,
    ),
  ).toBe(true);
  expect(
    (await history(request, a.id, 2027)).months.every(
      (row) => row.totalTickets === null,
    ),
  ).toBe(true);
  expect(
    (
      await request.put("/api/historial", {
        data: {
          clientId: a.id,
          year: 2027,
          months: [{ month: 1, totalTickets: 9, source: "MANUAL" }],
        },
      })
    ).ok(),
  ).toBe(true);
  expect((await history(request, a.id)).months[0].totalTickets).toBe(0);
  expect((await history(request, a.id, 2027)).months[0].totalTickets).toBe(9);
  for (const invalid of [-5, 1.5, "24", "text"]) {
    const response = await request.put("/api/historial", {
      data: {
        ...payload,
        months: [{ month: 6, totalTickets: invalid, source: "MANUAL" }],
      },
    });
    expect(response.status()).toBe(400);
  }
  expect(
    (
      await request.put("/api/historial", {
        data: { ...payload, months: [payload.months[0], payload.months[0]] },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.put("/api/historial", {
        data: { ...payload, clientId: "missing-client" },
      })
    ).status(),
  ).toBe(404);
  await request.put("/api/historial", {
    data: {
      ...payload,
      months: [{ month: 6, totalTickets: 23, source: "MANUAL" }],
    },
  });
  await request.put("/api/historial", {
    data: {
      ...payload,
      months: [{ month: 6, totalTickets: null, source: "MANUAL" }],
    },
  });
  expect((await history(request, a.id)).months[5].totalTickets).toBe(23);
  const db = await new PrismaBetterSqlite3({
    url: historyTestDatabaseUrl,
  }).connect();
  try {
    for (const [sql, expected] of [
      [
        'SELECT COUNT(*) FROM "MonthlyTicketHistory" WHERE "clientId" = ? AND year = 2026',
        2,
      ],
      [
        'SELECT COUNT(*) FROM "MonthlyTicketHistory" WHERE "clientId" = ? AND year = 2026 AND month = 6',
        1,
      ],
      ['SELECT COUNT(*) FROM "Report" WHERE "clientId" = ?', 0],
    ] as const) {
      const result = await db.queryRaw({
        sql,
        args: [a.id],
        argTypes: [{ scalarType: "string", arity: "scalar" }],
      });
      expect(Number(result.rows[0][0])).toBe(expected);
    }
  } finally {
    await db.dispose();
  }
});

test("imports current month, warns before replacing history and recovers saved data after reload", async ({
  page,
  request,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const name = `June synthetic ${randomUUID()}`;
  const a = await client(request, name);
  const b = await client(request, `Separate synthetic ${randomUUID()}`);
  await request.put("/api/historial", {
    data: {
      clientId: a.id,
      year: 2026,
      months: [{ month: 6, totalTickets: 23, source: "MANUAL" }],
    },
  });
  await page.goto("/reportes/nuevo");
  await page.getByLabel("Cliente", { exact: true }).fill(name);
  await page.getByLabel("Mes", { exact: true }).selectOption("6");
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await page.getByLabel("Archivo XLSX").setInputFiles({
    name: "synthetic-june.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: chartReferenceFixture(),
  });
  await page.getByRole("button", { name: "Importar y analizar" }).click();
  await expect(
    page.getByRole("heading", { name: "Tickets importados (24)" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "3. Historial" }).click();
  const workspace = page.getByRole("region", {
    name: "Historial anual",
    exact: true,
  });
  const editor = page.getByRole("region", { name: "Edición del historial" });
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("24");
  await expect(editor.getByLabel("Julio", { exact: true })).toHaveValue("");
  await expect(editor.getByRole("alert")).toContainText(
    "historial guardado indica 23 tickets",
  );
  expect((await history(request, a.id)).months[5].totalTickets).toBe(23);
  for (const [month, value] of [
    ["Enero", "15"],
    ["Febrero", "15"],
    ["Marzo", "17"],
    ["Abril", "15"],
    ["Mayo", "23"],
  ])
    await editor.getByLabel(month, { exact: true }).fill(value);
  await editor
    .getByRole("button", { name: "Generar / Actualizar gráfica" })
    .click();
  await editor.getByText("Ver datos de la gráfica").click();
  const table = editor.getByRole("table", {
    name: "Datos: HISTORIAL DE TICKETS 2026",
  });
  await expect(table.getByRole("row")).toHaveCount(7);
  await editor.getByLabel("Enero", { exact: true }).fill("14");
  await expect(
    table
      .getByRole("row")
      .filter({ hasText: "Enero" })
      .getByRole("cell")
      .last(),
  ).toHaveText("15");
  await editor.getByLabel("Enero", { exact: true }).fill("-5");
  await editor.getByRole("button", { name: "Guardar historial" }).click();
  await expect(editor.getByLabel("Enero", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect((await history(request, a.id)).months[5].totalTickets).toBe(23);
  await editor.getByLabel("Enero", { exact: true }).fill("15");
  await editor.getByRole("button", { name: "Guardar historial" }).click();
  await expect(editor.getByRole("status")).toContainText("Historial guardado.");
  await expect(editor.getByRole("alert")).toHaveCount(0);
  const saved = await history(request, a.id);
  expect(saved.months.slice(0, 6).map((row) => row.totalTickets)).toEqual([
    15, 15, 17, 15, 23, 24,
  ]);
  expect(saved.months[5].source).toBe("IMPORT");
  expect(saved.months.slice(6).every((row) => row.totalTickets === null)).toBe(
    true,
  );
  await editor.getByLabel("Junio", { exact: true }).fill("22");
  await page.getByRole("button", { name: "1. Importación" }).click();
  const source = page.getByRole("table", {
    name: "Tickets importados",
    exact: true,
  });
  await expect(source.getByRole("row")).toHaveCount(25);
  await page.getByRole("button", { name: "3. Historial" }).click();
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("22");
  await editor
    .getByRole("button", { name: "Restablecer", exact: true })
    .click();
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("24");
  await expect(editor.getByRole("status")).toContainText(
    "Valores restablecidos",
  );
  expect((await history(request, a.id)).months[5].totalTickets).toBe(24);
  await workspace.getByLabel("Cliente", { exact: true }).selectOption(b.id);
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("");
  await workspace.getByLabel("Cliente", { exact: true }).selectOption(a.id);
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("24");
  await workspace.getByLabel("Año", { exact: true }).fill("2027");
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("");
  await workspace.getByLabel("Año", { exact: true }).fill("2026");
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("24");

  await page.goto("/historial");
  await page.getByLabel("Cliente", { exact: true }).selectOption(a.id);
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("24");
  await page.reload();
  await page.getByLabel("Cliente", { exact: true }).selectOption(a.id);
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await expect(editor.getByLabel("Enero", { exact: true })).toHaveValue("15");
  await expect(editor.getByLabel("Junio", { exact: true })).toHaveValue("24");
  await expect(editor.getByLabel("Julio", { exact: true })).toHaveValue("");
  await editor
    .getByRole("button", { name: "Generar / Actualizar gráfica" })
    .click();
  await expect(editor.getByRole("img")).toBeVisible();
  if (testInfo.project.name === "desktop") {
    expect(
      await editor
        .locator("canvas")
        .evaluate(
          (canvas) =>
            canvas.clientWidth <=
            (canvas.parentElement?.parentElement?.clientWidth ?? 0),
        ),
    ).toBe(true);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("annual-history.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("failed history load can retry and failed save retains the editable draft", async ({
  page,
  request,
}) => {
  const a = await client(request, `Retry synthetic ${randomUUID()}`);
  await page.route("**/api/historial?**", (route) =>
    route.fulfill({ status: 500, json: { error: "Temporary failure" } }),
  );
  await page.goto("/historial");
  await page.getByLabel("Cliente", { exact: true }).selectOption(a.id);
  await expect(
    page.getByText(/No fue posible cargar el historial/),
  ).toBeVisible();
  await page.unroute("**/api/historial?**");
  await page.getByRole("button", { name: "Reintentar" }).click();
  const editor = page.getByRole("region", { name: "Edición del historial" });
  await editor.getByLabel("Enero", { exact: true }).fill("0");
  await page.route("**/api/historial", (route) =>
    route.fulfill({
      status: 500,
      json: { error: "No fue posible guardar el historial." },
    }),
  );
  await editor.getByRole("button", { name: "Guardar historial" }).click();
  await expect(editor.getByRole("alert")).toContainText(
    "No fue posible guardar",
  );
  await expect(editor.getByLabel("Enero", { exact: true })).toHaveValue("0");
  await page.unroute("**/api/historial");
  await editor.getByRole("button", { name: "Guardar historial" }).click();
  await expect(editor.getByRole("status")).toContainText("Historial guardado.");
});
