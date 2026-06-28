import { test, expect } from '@playwright/test'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SCREENSHOT_DIR = resolve(process.cwd(), '..', '..', '_docs', '_marketing', 'demo-screenshots')
const REPORT_PATH = resolve(process.cwd(), 'public', 'reports', 'latest-ab-report.json')

interface LatestAbReport {
  baseline: { otd: number }
  agent: { otd: number }
  delta: { otd: number }
  confidence: { pValue: number }
}

const latestAbReport = JSON.parse(readFileSync(REPORT_PATH, 'utf8')) as LatestAbReport
const expectedBaselineOtd = formatPercent(latestAbReport.baseline.otd)
const expectedAgentOtd = formatPercent(latestAbReport.agent.otd)
const expectedOtdDelta = formatPoint(latestAbReport.delta.otd)

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function formatPoint(value: number) {
  return `${(value * 100).toFixed(1)}`
}

test.describe('Demo 5-Minute Asset Capture', () => {
  test.describe.configure({ timeout: 60000 })

  test.beforeAll(async () => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true })
  })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'demo-token-asset-capture')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-asset-capture')
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem(
        'aimes_user',
        JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }),
      )
    })
  })

  test('Shot 01 — Dashboard hero with V1.5 OTD numbers', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('dashboard?offlineDemo=1', { waitUntil: 'commit' })
    await expect(page.locator('.command-center')).toBeVisible({ timeout: 30000 })
    const otdSummary = page.locator('.otd-summary')
    await expect(otdSummary).toContainText(`${expectedBaselineOtd} -> ${expectedAgentOtd}`)
    await expect(otdSummary).toContainText(`+${expectedOtdDelta}pt`)
    await page.screenshot({
      path: resolve(SCREENSHOT_DIR, '01-dashboard-hero.png'),
      fullPage: true,
    })
  })

  test('Shot 02 — Risk action queue', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('risk?offlineDemo=1', { waitUntil: 'commit' })
    await expect(page.locator('.risk-action-panel')).toBeVisible({ timeout: 30000 })
    await page.screenshot({
      path: resolve(SCREENSHOT_DIR, '02-risk-queue.png'),
      fullPage: true,
    })
  })

  test('Shot 03 — Scheduling Agent multi-scenario decision', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('scheduling?offlineDemo=1', { waitUntil: 'commit' })
    await expect(page.locator('.agent-workbench-panel')).toBeVisible({ timeout: 30000 })
    await page.screenshot({
      path: resolve(SCREENSHOT_DIR, '03-scheduling-agent.png'),
      fullPage: true,
    })
  })

  test('Shot 04 — Production execution writeback', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('production?offlineDemo=1', { waitUntil: 'commit' })
    await expect(page.locator('.production-board')).toBeVisible({ timeout: 30000 })
    await page.screenshot({
      path: resolve(SCREENSHOT_DIR, '04-production-execution.png'),
      fullPage: true,
    })
  })

  test('Shot 05 — Report center A/B real numbers', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    const reportSection = page.locator('.otd-report-section')
    await expect(reportSection).toContainText('OTD 改善复盘报告', { timeout: 30000 })
    await expect(reportSection).toContainText('人工基线')
    await expect(reportSection).toContainText('Agent 推荐')
    await page.screenshot({
      path: resolve(SCREENSHOT_DIR, '05-report-center.png'),
      fullPage: true,
    })
  })
})
