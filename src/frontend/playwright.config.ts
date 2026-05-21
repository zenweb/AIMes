import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/scheduling/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'node ./scripts/preview.mjs',
    env: {
      VITE_SHOW_DEMO_HINTS: 'true',
    },
    url: 'http://localhost:4173/scheduling/login',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
