import { defineConfig } from '@playwright/test'

const e2eBuildId = process.env.AIMES_E2E_BUILD_ID ?? process.pid.toString()
const e2ePort = process.env.AIMES_E2E_PORT ?? '4173'
const e2eBaseUrl = `http://localhost:${e2ePort}/scheduling/`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: e2eBaseUrl,
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
      PORT: e2ePort,
      HOST: '127.0.0.1',
      VITE_SHOW_DEMO_HINTS: 'true',
      NUXT_BUILD_DIR: process.env.NUXT_BUILD_DIR ?? `.nuxt-e2e-${e2eBuildId}`,
      NITRO_OUTPUT_DIR: process.env.NITRO_OUTPUT_DIR ?? `.output-e2e-${e2eBuildId}`,
    },
    url: `${e2eBaseUrl}login`,
    reuseExistingServer: false,
    timeout: 120000,
  },
})
