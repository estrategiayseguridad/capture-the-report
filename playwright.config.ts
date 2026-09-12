import { defineConfig, devices } from "@playwright/test";
import { historyTestDatabaseUrl } from "./tests/fixtures/history-database";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/unit/**",
  globalSetup: "./tests/setup.ts",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    env: { DATABASE_URL: historyTestDatabaseUrl },
  },
});
