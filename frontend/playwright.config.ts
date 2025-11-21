import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: `pnpm dev -- --port ${PORT}`,
        port: PORT,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});

