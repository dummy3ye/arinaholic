import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 60_000,
  globalTimeout: isCI ? 60 * 60 * 1000 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    navigationTimeout: 60_000,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command: isCI ? "bun run build && bun run start" : "bun run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !isCI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
        gracefulShutdown: { signal: "SIGTERM", timeout: 500 },
      },
});
