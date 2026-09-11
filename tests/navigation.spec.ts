import { expect, test } from "@playwright/test";

test("dashboard redirects and opens the import form with validation", async ({
  page,
}, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "CSC Report Automation" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });
  await page
    .getByRole("main")
    .getByRole("link", { name: "Nuevo reporte" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/reportes\/nuevo$/);
  await expect(page.getByLabel("Cliente", { exact: true })).toBeEnabled();
  await page.getByLabel("Mes", { exact: true }).selectOption("9");
  await page.getByLabel("Año", { exact: true }).fill("2026");
  await expect(
    page.getByRole("button", { name: "Importar y analizar" }),
  ).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath("new-report.png"),
    fullPage: true,
  });
  await page.getByLabel("Año", { exact: true }).press("Enter");
  await expect(page.getByText("Ingresa el nombre del cliente.")).toBeVisible();
  await expect(page).toHaveURL(/\/reportes\/nuevo$/);
  expect(pageErrors).toEqual([]);
});

test("navigation marks the current page and works on mobile", async ({
  page,
}, testInfo) => {
  await page.goto("/dashboard");
  const isMobile = testInfo.project.name === "mobile";
  if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
  const navigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });
  await navigation
    .getByRole("link", { name: "Historial de reportes", exact: true })
    .click();
  await expect(page.getByText("No existen reportes generados.")).toBeVisible();
  await expect(page.getByRole("columnheader")).toHaveCount(7);
  if (isMobile) {
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("button", { name: "Abrir menú" }).click();
  }
  await expect(
    navigation.getByRole("link", {
      name: "Historial de reportes",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "page");
  if (isMobile) {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Abrir menú" }),
    ).toBeFocused();
  }
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(noOverflow).toBe(true);
});

test("history and configuration expose only their placeholders", async ({
  page,
}) => {
  await page.goto("/historial");
  await expect(
    page.getByRole("heading", { name: "Historial anual de tickets" }),
  ).toBeVisible();
  await page.goto("/configuracion");
  await expect(
    page.getByRole("main").getByText("Próximamente", { exact: true }),
  ).toHaveCount(3);
  await expect(page.getByRole("main").getByRole("button")).toHaveCount(0);
});
