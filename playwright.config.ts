import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const isCI = Boolean(process.env.CI)

/**
 * End-to-end suite against a production build (`npm run build` first).
 * Uses the system's Google Chrome, so no browser download is needed; set E2E_WEBKIT=1
 * (after `npx playwright install webkit`) to add an iPhone/Safari engine pass.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // Parallel browsers on a busy machine can stall for seconds; a real slowdown is measured separately.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: isCI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    ...(process.env.E2E_WEBKIT ? [{ name: 'iphone-safari', use: { ...devices['iPhone 15'] } }] : []),
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
    env: {
      LEADS_MODE: 'log',
      NEXT_TELEMETRY_DISABLED: '1',
      // The full marketplace flow runs against the in-process store, with mail in a test outbox.
      MARKETPLACE_MODE: 'memory',
      MARKETPLACE_DEV_ADMIN_EMAIL: 'admin@example.com',
      MARKETPLACE_DEV_ADMIN_PASSWORD: 'e2e-admin-password',
    },
  },
})
