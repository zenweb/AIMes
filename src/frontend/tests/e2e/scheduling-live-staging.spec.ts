import { expect, test } from '@playwright/test'
import type { APIRequestContext, Locator, Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const LIVE_EVIDENCE_DIR = resolve(process.cwd(), '..', '..', 'output', 'playwright', '20260612-schedule-live-staging')
const API_BASE_URL = process.env.AIMES_LIVE_API_BASE_URL ?? 'http://localhost:5003'
const RUN_LIVE_STAGING = process.env.AIMES_RUN_LIVE_STAGING_E2E === 'true'

const probe = {
  planId: 'live-staging-dhtmlx-plan-20260612',
  itemId: 'live-staging-dhtmlx-item-rush-20260612',
  workOrderId: 'live-staging-dhtmlx-wo-rush-20260612',
  equipmentId: 'live-staging-dhtmlx-eq-cnc-20260612',
  planName: '真实 dhtmlx live staging 排产计划',
  workOrderNumber: 'WO-LIVE-RUSH-9001',
  equipmentCode: 'CNC-LIVE-9001',
  equipmentName: 'CNC live staging 验证机台',
  username: 'live-staging-dhtmlx-admin-20260612',
  password: 'LiveStaging!20260612',
  userId: 'live-staging-dhtmlx-admin-20260612',
}

test.describe.configure({ timeout: 120000 })

test.describe('Scheduling 真实 dhtmlx live staging', () => {
  test.describe.configure({ mode: 'serial' })

  test.skip(!RUN_LIVE_STAGING, 'Set AIMES_RUN_LIVE_STAGING_E2E=true to run PostgreSQL/API-backed live staging evidence.')

  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' })
  })

  test.beforeAll(async () => {
    mkdirSync(LIVE_EVIDENCE_DIR, { recursive: true })
    seedProbeData()
  })

  test.afterAll(async () => {
    cleanupProbeData()
  })

  test('真实 dhtmlx live staging 拖拽保存后刷新读回 PostgreSQL 窗口', async ({ page, request }) => {
    const auth = await loginAsDemoAdmin(request)
    await page.addInitScript(({ token, refreshToken }) => {
      localStorage.setItem('aimes_token', token)
      localStorage.setItem('aimes_refresh_token', refreshToken)
      localStorage.setItem('aimes_user', JSON.stringify({
        username: 'admin',
        displayName: 'live staging 管理员',
        role: 'Admin',
        mustChangePassword: false,
      }))
      localStorage.setItem('aimes_offline_demo', 'false')
    }, auth)

    const patchRequests: Array<{ url: string; body: unknown; status?: number }> = []
    await page.route('**/api/v1/**', async route => {
      const requestUrl = new URL(route.request().url())
      const liveUrl = `${API_BASE_URL}/api/v1${requestUrl.pathname.split('/api/v1')[1]}${requestUrl.search}`
      let patchRecord: { url: string; body: unknown; status?: number } | undefined
      if (route.request().method() === 'PATCH' && liveUrl.includes(`/scheduling/plans/${probe.planId}/items/${probe.itemId}`)) {
        patchRecord = { url: liveUrl, body: route.request().postDataJSON() }
        patchRequests.push(patchRecord)
      }
      const response = await route.fetch({ url: liveUrl })
      if (patchRecord) {
        patchRecord.status = response.status()
      }
      await route.fulfill({ response })
    })

    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    await expect(page.locator('.warnings-bar')).toHaveCount(0)
    await expect(page.locator('.gantt-e2e-markers')).toHaveCount(0)

    const liveTask = page.locator(`.gantt_task_line[task_id="${probe.itemId}"]`).first()
    await expect(liveTask).toBeVisible({ timeout: 15000 })
    await expect(liveTask).toContainText(probe.workOrderNumber)

    await dragTask(page, liveTask, () => patchRequests.length > 0)
    await expect.poll(() => patchRequests.length, { timeout: 10000 }).toBeGreaterThan(0)

    const savedWindow = getRescheduleWindow(patchRequests[0].body)
    const patchStatus = await expect.poll(() => patchRequests[0]?.status, { timeout: 10000 }).toBeGreaterThanOrEqual(200)
      .then(() => patchRequests[0].status ?? 0)
    expect(patchStatus).toBeLessThan(300)
    await expect(page.locator('.schedule-save-status')).toContainText(probe.workOrderNumber)
    await expect(page.locator('.schedule-save-status')).toContainText(savedWindow.plannedStartTime.toISOString().slice(0, 16).replace('T', ' '))
    await page.locator('.gantt-wrapper').screenshot({
      path: resolve(LIVE_EVIDENCE_DIR, 'live-staging-dhtmlx-drag-save-status.png'),
    })

    await page.getByRole('button', { name: '刷新' }).click()
    await expect(page.locator(`.gantt_task_line[task_id="${probe.itemId}"]`).first()).toBeVisible({ timeout: 15000 })

    const apiWindow = await fetchPlanItemWindow(request, auth.token)
    expect(apiWindow).toEqual({
      plannedStartTime: savedWindow.plannedStartTime.toISOString(),
      plannedEndTime: savedWindow.plannedEndTime.toISOString(),
    })

    const dbWindow = selectProbeWindow()
    expect(dbWindow).toEqual(apiWindow)

    await page.locator('.gantt-wrapper').screenshot({
      path: resolve(LIVE_EVIDENCE_DIR, 'live-staging-dhtmlx-drag-refresh-readback.png'),
    })
    writeFileSync(
      resolve(LIVE_EVIDENCE_DIR, 'live-staging-dhtmlx-drag-refresh-readback-manifest.md'),
      [
        '# 2026-06-12 真实 dhtmlx live staging 浏览器证据',
        '',
        `- API: \`${API_BASE_URL}\`。`,
        `- Plan: \`${probe.planId}\`。`,
        `- Item: \`${probe.itemId}\`。`,
        `- PATCH window: \`${savedWindow.plannedStartTime.toISOString()} | ${savedWindow.plannedEndTime.toISOString()}\`。`,
        `- GET read model window: \`${apiWindow.plannedStartTime} | ${apiWindow.plannedEndTime}\`。`,
        `- PostgreSQL window: \`${dbWindow.plannedStartTime} | ${dbWindow.plannedEndTime}\`。`,
        '- `live-staging-dhtmlx-drag-save-status.png`：live API PATCH 成功后，页面向调度员显示正式排产保存状态和保存窗口。',
        '- `live-staging-dhtmlx-drag-refresh-readback.png`：刷新后真实 dhtmlx 任务条仍从 live read model 渲染。',
        '- 证据：真实 Nuxt 页面关闭 offline demo，真实 dhtmlx 任务条拖拽触发 live API PATCH，页面显示保存状态，刷新后 GET read model 与 PostgreSQL 同窗。',
        '',
      ].join('\n'),
      'utf8',
    )
  })

  test('真实 dhtmlx live staging 拖拽被非可编辑计划拒绝时不误报保存成功', async ({ page, request }) => {
    const auth = await loginAsDemoAdmin(request)
    setProbePlanStatus(2)
    await page.addInitScript(({ token, refreshToken }) => {
      localStorage.setItem('aimes_token', token)
      localStorage.setItem('aimes_refresh_token', refreshToken)
      localStorage.setItem('aimes_user', JSON.stringify({
        username: 'admin',
        displayName: 'live staging 管理员',
        role: 'Admin',
        mustChangePassword: false,
      }))
      localStorage.setItem('aimes_offline_demo', 'false')
    }, auth)

    const patchRequests: Array<{ url: string; body: unknown; status?: number; responseText?: string }> = []
    await page.route('**/api/v1/**', async route => {
      const requestUrl = new URL(route.request().url())
      const liveUrl = `${API_BASE_URL}/api/v1${requestUrl.pathname.split('/api/v1')[1]}${requestUrl.search}`
      let patchRecord: { url: string; body: unknown; status?: number; responseText?: string } | undefined
      if (route.request().method() === 'PATCH' && liveUrl.includes(`/scheduling/plans/${probe.planId}/items/${probe.itemId}`)) {
        patchRecord = { url: liveUrl, body: route.request().postDataJSON() }
        patchRequests.push(patchRecord)
      }
      const response = await route.fetch({ url: liveUrl })
      if (patchRecord) {
        patchRecord.status = response.status()
        patchRecord.responseText = await response.text()
      }
      await route.fulfill({ response })
    })

    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    await expect(page.locator('.warnings-bar')).toHaveCount(0)
    await expect(page.locator('.gantt-e2e-markers')).toHaveCount(0)

    const liveTask = page.locator(`.gantt_task_line[task_id="${probe.itemId}"]`).first()
    await expect(liveTask).toBeVisible({ timeout: 15000 })
    await expect(liveTask).toContainText(probe.workOrderNumber)

    await dragTask(page, liveTask, () => patchRequests.length > 0)
    await expect.poll(() => patchRequests.length, { timeout: 10000 }).toBeGreaterThan(0)

    const rejectedWindow = getRescheduleWindow(patchRequests[0].body)
    await expect.poll(() => patchRequests[0]?.status, { timeout: 10000 }).toBe(400)
    expect(patchRequests[0].responseText).toContain('当前计划状态不允许调整')
    await expect(page.locator('.gantt-wrapper [role="alert"]')).toContainText('保存失败')
    await expect(page.locator('.gantt-wrapper [role="alert"]')).toContainText('当前计划状态不允许调整')
    await expect(page.locator('.schedule-save-status')).toHaveCount(0)
    await page.locator('.gantt-wrapper').screenshot({
      path: resolve(LIVE_EVIDENCE_DIR, 'live-staging-dhtmlx-drag-locked-plan-rejected.png'),
    })

    writeFileSync(
      resolve(LIVE_EVIDENCE_DIR, 'live-staging-dhtmlx-drag-locked-plan-rejected-manifest.md'),
      [
        '# 2026-06-13 真实 dhtmlx live staging 拒绝保存浏览器证据',
        '',
        `- API: \`${API_BASE_URL}\`。`,
        `- Plan: \`${probe.planId}\`，已设置为非可编辑状态 \`Locked\`。`,
        `- Item: \`${probe.itemId}\`。`,
        `- PATCH status: \`${patchRequests[0].status}\`。`,
        `- Rejected window: \`${rejectedWindow.plannedStartTime.toISOString()} | ${rejectedWindow.plannedEndTime.toISOString()}\`。`,
        '- `live-staging-dhtmlx-drag-locked-plan-rejected.png`：真实 Nuxt 页面关闭 offline demo，真实 dhtmlx 任务条拖拽触发 live API PATCH，后端以“当前计划状态不允许调整”拒绝，页面显示保存失败且不显示保存成功状态。',
        '',
      ].join('\n'),
      'utf8',
    )
  })
})

async function loginAsDemoAdmin(request: APIRequestContext) {
  const response = await request.post(`${API_BASE_URL}/api/v1/auth/login`, {
    data: { username: probe.username, password: probe.password },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json() as { token?: unknown; refreshToken?: unknown }
  expect(typeof body.token).toBe('string')
  expect(typeof body.refreshToken).toBe('string')
  return {
    token: body.token as string,
    refreshToken: body.refreshToken as string,
  }
}

async function fetchPlanItemWindow(request: APIRequestContext, token: string) {
  const response = await request.get(`${API_BASE_URL}/api/v1/scheduling/plans/${probe.planId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(response.ok()).toBeTruthy()
  const plan = await response.json() as { items?: Array<{ id?: string; plannedStartTime?: string; plannedEndTime?: string }> }
  const item = plan.items?.find(candidate => candidate.id === probe.itemId)
  expect(item).toBeTruthy()
  expect(typeof item?.plannedStartTime).toBe('string')
  expect(typeof item?.plannedEndTime).toBe('string')
  return {
    plannedStartTime: new Date(item!.plannedStartTime!).toISOString(),
    plannedEndTime: new Date(item!.plannedEndTime!).toISOString(),
  }
}

function seedProbeData() {
  const now = new Date()
  const start = new Date(now.getTime() - 60 * 60 * 1000)
  const end = new Date(now.getTime() + 72 * 60 * 60 * 1000)
  const itemStart = new Date(now.getTime() + 10 * 60 * 60 * 1000)
  const itemEnd = new Date(now.getTime() + 14 * 60 * 60 * 1000)

  const passwordHash = hashPassword(probe.password)

  runPsql(`
DELETE FROM schedule_items WHERE id = '${probe.itemId}' OR "SchedulePlanId" = '${probe.planId}';
DELETE FROM schedule_plans WHERE id = '${probe.planId}';
DELETE FROM work_orders WHERE id = '${probe.workOrderId}' OR order_number = '${probe.workOrderNumber}';
DELETE FROM equipment WHERE id = '${probe.equipmentId}' OR equipment_code = '${probe.equipmentCode}';
DELETE FROM refresh_tokens WHERE username = '${probe.username}';
DELETE FROM system_users WHERE id = '${probe.userId}' OR username = '${probe.username}';

INSERT INTO system_users (
  id, username, display_name, role, is_active, created_at, last_login_at, password_hash, must_change_password
) VALUES (
  '${probe.userId}', '${probe.username}', 'live staging 管理员', 'Admin', TRUE, NOW(), NULL, '${passwordHash}', FALSE
);

INSERT INTO work_orders (
  id, order_number, product_code, product_name, planned_quantity, completed_quantity,
  planned_start_date, planned_end_date, actual_start_date, actual_end_date,
  status, workshop_id, route_code, priority, created_at, updated_at
) VALUES (
  '${probe.workOrderId}', '${probe.workOrderNumber}', 'FG-LIVE-RUSH', 'live staging 急单组件', 30, 0,
  '${toSqlTimestamp(start)}', '${toSqlTimestamp(end)}', NULL, NULL,
  'Scheduled', 'workshop-1', 'LIVE-ROUTE', 1, NOW(), NULL
);

INSERT INTO equipment (
  id, equipment_code, equipment_name, equipment_type, workshop_id, workshop_name,
  status, capacity, utilization_rate, last_maintenance_date, next_maintenance_date,
  current_work_order_id, "Parameters", created_at, updated_at
) VALUES (
  '${probe.equipmentId}', '${probe.equipmentCode}', '${probe.equipmentName}', 'CNC', 'workshop-1', 'live staging 车间',
  'Running', 120, 0.92, NULL, NULL,
  '', ''::hstore, NOW(), NULL
);

INSERT INTO schedule_plans (
  id, plan_name, plan_start_date, plan_end_date, overall_utilization_rate,
  on_time_delivery_rate, optimization_notes, created_at, updated_at, "Status"
) VALUES (
  '${probe.planId}', '${probe.planName}', '${toSqlTimestamp(start)}', '${toSqlTimestamp(end)}',
  0.92, 0.96, 'live staging dhtmlx probe', NOW() + INTERVAL '1 hour', NULL, 1
);

INSERT INTO schedule_items (
  id, work_order_id, equipment_id, planned_start_time, planned_end_time,
  sequence, setup_time, "DependentItems", "SchedulePlanId"
) VALUES (
  '${probe.itemId}', '${probe.workOrderId}', '${probe.equipmentId}',
  '${toSqlTimestamp(itemStart)}', '${toSqlTimestamp(itemEnd)}',
  1, '20 分钟', ARRAY[]::text[], '${probe.planId}'
);
`)
}

function cleanupProbeData() {
  runPsql(`
DELETE FROM schedule_items WHERE id = '${probe.itemId}' OR "SchedulePlanId" = '${probe.planId}';
DELETE FROM schedule_plans WHERE id = '${probe.planId}';
DELETE FROM work_orders WHERE id = '${probe.workOrderId}' OR order_number = '${probe.workOrderNumber}';
DELETE FROM equipment WHERE id = '${probe.equipmentId}' OR equipment_code = '${probe.equipmentCode}';
DELETE FROM refresh_tokens WHERE username = '${probe.username}';
DELETE FROM system_users WHERE id = '${probe.userId}' OR username = '${probe.username}';
`)
}

function setProbePlanStatus(status: 0 | 1 | 2 | 3 | 4) {
  runPsql(`
UPDATE schedule_plans
SET "Status" = ${status}, updated_at = NOW()
WHERE id = '${probe.planId}';
`)
}

function selectProbeWindow() {
  const output = runPsql(`
SELECT to_char(planned_start_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') || '|' ||
       to_char(planned_end_time AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
FROM schedule_items
WHERE id = '${probe.itemId}';
`, ['-t', '-A'])
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .at(-1)
  expect(output).toBeTruthy()
  const [plannedStartTime, plannedEndTime] = output!.split('|')
  return { plannedStartTime, plannedEndTime }
}

function runPsql(sql: string, extraArgs: string[] = []) {
  return execFileSync('docker', [
    'compose',
    'exec',
    '-T',
    'postgresql',
    'psql',
    '-U',
    'postgres',
    '-d',
    'mes',
    '-v',
    'ON_ERROR_STOP=1',
    ...extraArgs,
    '-c',
    sql,
  ], {
    cwd: resolve(process.cwd(), '..', '..'),
    encoding: 'utf8',
  })
}

async function dragTask(page: Page, task: Locator, isSaved: () => boolean) {
  await task.scrollIntoViewIfNeeded()
  await expect(task).toBeInViewport()
  const dragHandle = task.locator('.gantt_task_content').first()
  await expect(dragHandle).toBeVisible()

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await task.scrollIntoViewIfNeeded()
    await expect(task).toBeInViewport()
    const handleBox = await waitForStableBox(dragHandle)
    const startX = handleBox.x + Math.max(12, handleBox.width / 2)
    const startY = handleBox.y + handleBox.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 180, startY, { steps: 16 })
    await page.mouse.up()
    await expect(task).toBeVisible()

    const saved = await expect.poll(() => isSaved(), { timeout: 5000 })
      .toBe(true)
      .then(() => true)
      .catch(() => false)
    if (saved) return
  }

  await expect.poll(() => isSaved(), { timeout: 10000 }).toBe(true)
}

async function waitForStableBox(locator: Locator) {
  let stableBox = await locator.boundingBox()
  await expect.poll(async () => {
    const first = await locator.boundingBox()
    if (!first) return false
    await new Promise(resolve => setTimeout(resolve, 100))
    const second = await locator.boundingBox()
    if (!second) return false
    const isStable =
      Math.abs(first.x - second.x) < 1 &&
      Math.abs(first.y - second.y) < 1 &&
      Math.abs(first.width - second.width) < 1 &&
      Math.abs(first.height - second.height) < 1
    if (isStable) stableBox = second
    return isStable
  }, { timeout: 10000 }).toBe(true)
  expect(stableBox).not.toBeNull()
  return stableBox!
}

function getRescheduleWindow(body: unknown) {
  const payload = body as { plannedStartTime?: unknown; plannedEndTime?: unknown }
  expect(typeof payload.plannedStartTime).toBe('string')
  expect(typeof payload.plannedEndTime).toBe('string')

  const plannedStartTime = new Date(payload.plannedStartTime as string)
  const plannedEndTime = new Date(payload.plannedEndTime as string)
  expect(Number.isNaN(plannedStartTime.getTime())).toBe(false)
  expect(Number.isNaN(plannedEndTime.getTime())).toBe(false)

  return { plannedStartTime, plannedEndTime }
}

function toSqlTimestamp(value: Date) {
  return value.toISOString()
}

function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256')
  return `${salt.toString('base64')}.${hash.toString('base64')}`
}
