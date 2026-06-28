import { readFile } from 'node:fs/promises'
import { test, expect, type Page } from '@playwright/test'

test.describe.configure({ timeout: 90000 })

async function seedOfflineDemoSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'demo-token-admin')
    localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
  })
}

async function routeEvidenceWrites(page: Page) {
  await page.route('**/hubs/notifications/negotiate**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        connectionId: 'mock-notifications',
        connectionToken: 'mock-notifications',
        availableTransports: [],
      }),
    })
  })
  await page.route('**/api/v1/**', (route) => {
    const method = route.request().method()
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: method === 'GET' ? '[]' : route.request().postData() || '{}',
    })
  })
  await page.route('**/api/v1/scheduling/labor-reassignments**', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
      return
    }
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/api/v1/scheduling/labor-qualification-blocks**', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
      return
    }
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/api/v1/scheduling/otd-evidence**', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: route.request().postData() || '{}',
      })
      return
    }
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
}

async function routeNoCandidateEmployees(page: Page) {
  const seedLiveMockSession = () => {
    localStorage.setItem('aimes_e2e_live_mock', 'true')
    localStorage.setItem('aimes_offline_demo', 'false')
    localStorage.setItem('aimes_token', 'mock-e2e-token')
    localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
  }
  await page.addInitScript(seedLiveMockSession)
  await routeEvidenceWrites(page)

  await page.route('**/api/v1/auth/refresh', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-e2e-token',
        refreshToken: 'mock-e2e-refresh',
        expiresAt: '2026-12-31T23:59:59Z',
      }),
    })
  })

  await page.route('**/api/v1/employee**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'emp1', employeeNumber: 'EMP-001', name: '张三', role: 'Operator', team: '甲班', shift: 'Day', phone: null, email: null, skills: ['CNC 精加工'], certifications: [{ name: 'CNC-2 级', expiresAt: '2026-12-31', status: 'valid' }], isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp2', employeeNumber: 'EMP-002', name: '李四', role: 'Operator', team: '甲班', shift: 'Day', phone: null, email: null, skills: ['装配'], certifications: [{ name: '装配资质', expiresAt: '2026-11-30', status: 'valid' }], isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp3', employeeNumber: 'EMP-003', name: '王五', role: 'Operator', team: '乙班', shift: 'Night', phone: null, email: null, skills: ['热处理', '炉温曲线确认'], certifications: [{ name: '热处理上岗证', expiresAt: '2026-05-25', status: 'expiring' }], isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp4', employeeNumber: 'EMP-004', name: '赵六', role: 'Engineer', team: '技术组', shift: 'Day', phone: null, email: null, skills: ['工艺变更'], certifications: [{ name: '工程放行', expiresAt: '2027-01-31', status: 'valid' }], isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp5', employeeNumber: 'EMP-005', name: '钱七', role: 'QC', team: '质检组', shift: 'Day', phone: null, email: null, skills: ['终检放行'], certifications: [{ name: '质量检验员', expiresAt: '2026-10-31', status: 'valid' }], isActive: true, createdAt: '2026-01-01T00:00:00' },
        ],
        totalCount: 5,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    })
  })
}

async function routeAvailabilityEmployees(page: Page) {
  const seedLiveMockSession = () => {
    localStorage.setItem('aimes_e2e_live_mock', 'true')
    localStorage.setItem('aimes_offline_demo', 'false')
    localStorage.setItem('aimes_token', 'mock-e2e-token')
    localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
  }
  await page.addInitScript(seedLiveMockSession)
  await page.evaluate(seedLiveMockSession)
  await routeEvidenceWrites(page)

  await page.route('**/api/v1/auth/refresh', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-e2e-token',
        refreshToken: 'mock-e2e-refresh',
        expiresAt: '2026-12-31T23:59:59Z',
      }),
    })
  })

  await page.route('**/api/v1/employee**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'emp1', employeeNumber: 'EMP-001', name: '张三', role: 'Operator', team: '甲班', shift: 'Day', phone: null, email: null, skills: ['CNC 精加工'], certifications: [{ name: 'CNC-2 级', expiresAt: '2026-12-31', status: 'valid' }], availability: { date: '2026-05-20', status: 'available', statusLabel: '白班排班', window: '2026-05-20 08:00-17:00', capacityHours: 8, source: '班组排班 SCH-LABOR-20260520-D' }, isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp3', employeeNumber: 'EMP-003', name: '王五', role: 'Operator', team: '乙班', shift: 'Night', phone: null, email: null, skills: ['热处理', '炉温曲线确认'], certifications: [{ name: '热处理上岗证', expiresAt: '2026-05-25', status: 'expiring' }], availability: { date: '2026-05-20', status: 'available', statusLabel: '夜班排班', window: '2026-05-20 20:00-2026-05-21 08:00', capacityHours: 8, source: '班组排班 SCH-LABOR-20260520-N' }, isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp4', employeeNumber: 'EMP-004', name: '赵六', role: 'Engineer', team: '技术组', shift: 'Day', phone: null, email: null, skills: ['工艺变更'], certifications: [{ name: '工程放行', expiresAt: '2027-01-31', status: 'valid' }], availability: { date: '2026-05-20', status: 'on_call', statusLabel: '待命窗口', window: '2026-05-20 09:00-21:00', capacityHours: 4, source: '工程值班 SCH-ENG-20260520-A' }, isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp6', employeeNumber: 'EMP-006', name: '孙八', role: 'Lead', team: '甲班', shift: 'Day', phone: null, email: null, skills: ['热处理', '派工确认', '异常升级'], certifications: [{ name: '热处理上岗证', expiresAt: '2026-09-30', status: 'valid' }, { name: '班组长授权', expiresAt: '2026-09-30', status: 'valid' }], availability: { date: '2026-05-20', status: 'overtime', statusLabel: '加班窗口', window: '2026-05-20 18:00-22:00', capacityHours: 4, source: '排班计划 SCH-LABOR-20260520-A' }, isActive: true, createdAt: '2026-01-01T00:00:00' },
          { id: 'emp9', employeeNumber: 'EMP-009', name: '高十一', role: 'Operator', team: '乙班', shift: 'Night', phone: null, email: null, skills: ['热处理', '炉温曲线确认', '首件复核'], certifications: [{ name: '热处理上岗证', expiresAt: '2026-12-31', status: 'valid' }], availability: { date: '2026-05-20', status: 'leave', statusLabel: '请假不可用', window: '2026-05-20 全天', capacityHours: 0, source: '请假单 LEAVE-20260520-009' }, isActive: true, createdAt: '2026-01-01T00:00:00' },
        ],
        totalCount: 5,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    })
  })
}

async function routeManyEmployees(page: Page) {
  const seedLiveMockSession = () => {
    localStorage.setItem('aimes_e2e_live_mock', 'true')
    localStorage.setItem('aimes_offline_demo', 'false')
    localStorage.setItem('aimes_token', 'mock-e2e-token')
    localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: false,
    }))
  }
  await page.addInitScript(seedLiveMockSession)
  await routeEvidenceWrites(page)

  const employees = Array.from({ length: 25 }, (_, index) => {
    const sequence = String(index + 1).padStart(3, '0')
    return {
      id: `emp-${sequence}`,
      employeeNumber: `EMP-${sequence}`,
      name: `员工${sequence}`,
      role: index === 24 ? 'Engineer' : 'Operator',
      team: index === 24 ? '技术组' : '甲班',
      shift: 'Day',
      phone: null,
      email: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00',
    }
  })

  await page.route('**/api/v1/auth/refresh', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-e2e-token',
        refreshToken: 'mock-e2e-refresh',
        expiresAt: '2026-12-31T23:59:59Z',
      }),
    })
  })

  await page.route('**/api/v1/employee**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: employees,
        totalCount: employees.length,
        page: 1,
        pageSize: 20,
        totalPages: 2,
      }),
    })
  })
}

test.describe('Employee pagination live mock', () => {
  test('员工分页在搜索收窄结果时回到第一页', async ({ page }) => {
    const navigations: string[] = []
    const unauthorizedRequests: string[] = []
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) navigations.push(frame.url())
    })
    page.on('response', response => {
      if (response.status() === 401) unauthorizedRequests.push(response.url())
    })
    await routeManyEmployees(page)
    await page.goto('employee?offlineDemo=0', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    await expect(page.getByRole('button', { name: '查看员工详情：EMP-001 员工001' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-013 员工013' })).toHaveCount(0)
    await expect(page.getByText('共 25 条')).toBeVisible()

    expect(unauthorizedRequests, `401 responses before pagination: ${unauthorizedRequests.join('\n')}`).toEqual([])
    expect(page.url(), `unexpected navigations: ${navigations.join('\n')}`).toContain('/scheduling/employee')
    await page.getByRole('button', { name: '下一页' }).click()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-013 员工013' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-001 员工001' })).toHaveCount(0)

    await page.getByPlaceholder('搜索姓名/工号...').fill('EMP-025')
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-025 员工025' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-013 员工013' })).toHaveCount(0)
    await expect(page.locator('.pagination-bar')).toHaveCount(0)
  })
})

test.describe('Employee offline demo entry', () => {
  test('[employee-live-backend] 真实在线员工后端恢复会清理离线残留并读取员工 API', async ({ page }) => {
    test.skip(process.env.AIMES_E2E_LIVE_BACKEND !== 'true', 'requires live backend on the configured API target')

    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'demo-token-admin')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
      localStorage.setItem('aimes_user', JSON.stringify({
        username: 'admin',
        displayName: '管理员',
        role: 'Admin',
        mustChangePassword: false,
      }))
    })

    await page.goto('login?offlineDemo=0&redirect=/employee?offlineDemo=0', { waitUntil: 'commit' })
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('aimes_offline_demo'))).toBe('false')

    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('admin123')
    await page.getByRole('button', { name: '登 录' }).click()

    const employeeResponse = await page.waitForResponse(response =>
      response.url().includes('/api/v1/employee') && response.request().method() === 'GET',
      { timeout: 30000 },
    )
    expect(employeeResponse.status()).toBe(200)

    await page.waitForSelector('.emp-board', { timeout: 20000 })
    await expect(page).toHaveURL(/\/scheduling\/employee\?offlineDemo=0$/)
    await expect(page.getByRole('heading', { name: '人员管理' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-001 张三' })).toBeVisible()
    await expect(page.getByText('员工列表加载失败')).toHaveCount(0)
    await expect(page.getByText('Offline demo mode skipped backend request')).toHaveCount(0)
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('aimes_token')?.startsWith('demo-token-'))).toBe(false)
  })

  test('未登录访问离线演示员工入口后登录返回员工页且不暴露 backend skip 技术错误', async ({ page }) => {
    await page.goto('employee?offlineDemo=1', { waitUntil: 'commit' })
    await expect(page).toHaveURL(/\/scheduling\/login\?offlineDemo=1&redirect=\/employee\?offlineDemo=1$/)

    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('admin123')
    await page.getByRole('button', { name: '登 录' }).click()
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    await expect(page).toHaveURL(/\/scheduling\/employee\?offlineDemo=1$/)
    await expect(page.getByRole('heading', { name: '人员管理' })).toBeVisible()
    await expect(page.getByText('EMP-001 · 甲班 · 白班')).toBeVisible()
    await expect(page.getByText('员工列表加载失败')).toHaveCount(0)
    await expect(page.getByText('Offline demo mode skipped backend request')).toHaveCount(0)
  })

  test('显式离线演示入口展示本地员工且不暴露 backend skip 技术错误', async ({ page }) => {
    await seedOfflineDemoSession(page)
    await page.goto('employee?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    await expect(page.getByRole('heading', { name: '人员管理' })).toBeVisible()
    await expect(page.getByText('EMP-001 · 甲班 · 白班')).toBeVisible()
    await expect(page.getByText('EMP-006 · 甲班 · 白班')).toBeVisible()
    await expect(page.getByText('Before reassignment or stop-work review')).toBeVisible()
    await expect(page.getByRole('link', { name: '生产开工 / Production' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'AI 排产 / Scheduling' })).toBeVisible()
    await expect(page.getByRole('link', { name: '审计回放 / Audit trail' })).toBeVisible()
    await expect(page.getByText('员工列表加载失败')).toHaveCount(0)
    await expect(page.getByText('Offline demo mode skipped backend request')).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('离线员工页提供切换在线后端入口并保留员工页返回目标', async ({ page }) => {
    await seedOfflineDemoSession(page)
    await page.goto('employee?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    const recovery = page.locator('[data-employee-live-recovery]')
    await expect(recovery).toContainText('当前展示本地示例数据')
    await expect(recovery).toContainText('Current view is using local demo data')

    const link = recovery.getByRole('link', { name: '切换在线后端' })
    await expect(link).toHaveAttribute('href', /login\?offlineDemo=0&redirect=\/employee\?offlineDemo=0$/)
    await link.click()

    await expect(page).toHaveURL(/\/scheduling\/login\?offlineDemo=0&redirect=\/employee\?offlineDemo=0$/)
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('aimes_offline_demo'))).toBe('false')
  })
})

test.describe('Employee 人员能力约束', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('aimes_e2e_live_mock') === 'true') return
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'demo-token-admin')
      localStorage.setItem('aimes_refresh_token', 'demo-refresh-admin')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('employee?offlineDemo=1')
    await page.waitForSelector('.emp-board', { timeout: 20000 })
  })

  test('展示技能矩阵与资质有效期', async ({ page }) => {
    const panel = page.locator('.skill-matrix-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('技能矩阵与资质有效期')).toBeVisible()
    await expect(panel.getByText('EMP-001 · 甲班 · 白班')).toBeVisible()
    await expect(panel.getByText('CNC 精加工')).toBeVisible()
    await expect(panel.getByText('CNC-2 级 · 2026-12-31')).toBeVisible()
    await expect(panel.getByText('热处理上岗证 · 2026-05-25')).toBeVisible()
    await expect(panel.getByText('夜班排班')).toBeVisible()
    await expect(panel.getByText('加班窗口', { exact: true })).toBeVisible()
  })

  test('员工卡片打开可命名编辑对话框', async ({ page }) => {
    const employeeCard = page.getByRole('button', { name: '查看员工详情：EMP-001 张三' })
    await employeeCard.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: '编辑员工' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('textbox').first()).toHaveValue('EMP-001')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(employeeCard).toBeFocused()
  })

  test('鼠标点击员工卡片打开可命名编辑对话框', async ({ page }) => {
    await page.getByRole('button', { name: '查看员工详情：EMP-001 张三' }).click()

    const dialog = page.getByRole('dialog', { name: '编辑员工' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('textbox').first()).toHaveValue('EMP-001')
  })

  test('员工离职需要先展示确认提示且取消后不改变在职状态', async ({ page }) => {
    await page.getByRole('button', { name: '查看员工详情：EMP-001 张三' }).click()

    const dialog = page.getByRole('dialog', { name: '编辑员工' })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: '离职' }).click()
    const confirmation = dialog.locator('[data-employee-deactivate-confirmation]')
    await expect(confirmation).toBeVisible()
    await expect(confirmation).toContainText('离职前请确认未完工派工、替班证据和审计留痕')
    await expect(confirmation).toContainText('Before deactivating this employee, confirm open work assignments, reassignment evidence, and audit trail')
    await expect(confirmation.getByRole('link', { name: '生产开工 / Production' })).toHaveAttribute('href', './production')
    await expect(confirmation.getByRole('link', { name: 'AI 排产 / Scheduling' })).toHaveAttribute('href', './scheduling')
    await expect(confirmation.getByRole('link', { name: '审计回放 / Audit trail' })).toHaveAttribute('href', './audit-logs')
    await expect(confirmation.getByRole('link', { name: '帮助 / Help' })).toHaveAttribute('href', '#employee-deactivate-help')

    await confirmation.getByRole('button', { name: '取消离职' }).click()
    await expect(confirmation).toBeHidden()
    await dialog.getByRole('button', { name: '关闭员工编辑' }).click()
    await expect(dialog).toBeHidden()

    await expect(page.getByRole('button', { name: '查看员工详情：EMP-001 张三' })).toBeVisible()
    await expect(page.getByText('离职', { exact: true })).toHaveCount(0)
  })

  test('员工移动端弹窗保持在视口内并保留操作提示', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    await page.getByRole('button', { name: '查看员工详情：EMP-001 张三' }).click()
    const editDialog = page.getByRole('dialog', { name: '编辑员工' })
    await expect(editDialog).toBeVisible()
    await expect(editDialog.locator('[data-employee-edit-guidance]')).toContainText('Before saving employee changes')

    const editBox = await editDialog.boundingBox()
    expect(editBox).not.toBeNull()
    expect(editBox!.x).toBeGreaterThanOrEqual(0)
    expect(editBox!.x + editBox!.width).toBeLessThanOrEqual(390)

    await editDialog.getByRole('button', { name: '离职' }).click()
    const confirmation = editDialog.locator('[data-employee-deactivate-confirmation]')
    await expect(confirmation).toBeVisible()
    await expect(confirmation.getByRole('button', { name: '取消离职' })).toBeVisible()
    await confirmation.getByRole('button', { name: '取消离职' }).click()
    await editDialog.getByRole('button', { name: '关闭员工编辑' }).click()

    await page.getByRole('button', { name: '+ 新增' }).click()
    const createDialog = page.getByRole('dialog', { name: '新增员工' })
    await expect(createDialog).toBeVisible()
    await expect(createDialog.locator('[data-employee-create-guidance]')).toContainText('Before creating an employee')

    const createBox = await createDialog.boundingBox()
    expect(createBox).not.toBeNull()
    expect(createBox!.x).toBeGreaterThanOrEqual(0)
    expect(createBox!.x + createBox!.width).toBeLessThanOrEqual(390)
    await expect(createDialog.getByRole('button', { name: '创建' })).toBeVisible()
  })

  test('导出员工 CSV 包含完整名册与在职状态证据', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出 CSV' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('员工列表.csv')
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()

    const csv = (await readFile(downloadPath!, 'utf8')).replace(/^\uFEFF/, '')
    expect(csv).toContain('工号,姓名,角色,班组,班次,电话,邮箱,在职')
    expect(csv).toContain('EMP-001,张三,Operator,甲班,Day,13800138001,,是')
    expect(csv).toContain('EMP-008,吴十,Operator,乙班,Night,,,否')
  })

  test('员工筛选搜索会区分班组角色与离职可见性', async ({ page }) => {
    await page.locator('.filter-select').first().selectOption('Operator')
    await page.locator('.filter-select').nth(1).selectOption('乙班')

    await expect(page.getByRole('button', { name: '查看员工详情：EMP-003 王五' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-009 高十一' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看离职员工详情：EMP-008 吴十' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-001 张三' })).toHaveCount(0)

    await page.getByLabel('显示离职').check()
    await expect(page.getByRole('button', { name: '查看离职员工详情：EMP-008 吴十' })).toBeVisible()

    await page.getByPlaceholder('搜索姓名/工号...').fill('EMP-008')
    await expect(page.getByRole('button', { name: '查看离职员工详情：EMP-008 吴十' })).toBeVisible()
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-003 王五' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '查看员工详情：EMP-009 高十一' })).toHaveCount(0)

    await page.getByRole('button', { name: '查看离职员工详情：EMP-008 吴十' }).click()
    const dialog = page.getByRole('dialog', { name: '员工详情' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: '关闭员工详情' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: '保存' })).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: '离职' })).toHaveCount(0)
  })

  test('新增员工弹窗支持 Escape 关闭并回到新增按钮', async ({ page }) => {
    const addButton = page.getByRole('button', { name: '+ 新增' })
    await addButton.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: '新增员工' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(addButton).toBeFocused()
  })

  test('按技能班组班次证书和排班可用性推荐替班候选', async ({ page }) => {
    const panel = page.locator('.skill-matrix-panel')
    await expect(panel.getByText('候选排序')).toBeVisible()
    await expect(panel.getByText(/推荐 EMP-006 孙八/)).toBeVisible()
    const candidateRanking = panel.locator('.candidate-ranking')
    const bestCandidate = candidateRanking.locator('.candidate-tags em').filter({ hasText: 'EMP-006 孙八' })
    await expect(bestCandidate).toBeVisible()
    await expect(bestCandidate).toContainText('热处理技能匹配')
    await expect(bestCandidate).toContainText('同证书有效')
    await expect(bestCandidate).toContainText('白班可调班')
    await expect(bestCandidate).toContainText('加班窗口')

    await panel.getByRole('button', { name: '生成替班建议' }).click()
    const reassignment = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_labor_reassignment') || '[]')[0])
    expect(reassignment.replacementEmployeeNumber).toBe('EMP-006')
    expect(reassignment.replacementCertification).toBe('热处理上岗证')
    expect(reassignment.replacementSkill).toContain('热处理技能匹配')
    expect(reassignment.replacementSkill).toContain('加班窗口')
    expect(reassignment.reason).toContain('排班可用性评分')
    expect(reassignment.reason).toContain('SCH-LABOR-20260520-A')
  })

  test('排班请假人员不进入替班候选', async ({ page }) => {
    await routeAvailabilityEmployees(page)
    await page.goto('employee?offlineDemo=0', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    const panel = page.locator('.skill-matrix-panel')
    await expect(panel.getByText('请假不可用')).toBeVisible()
    const candidateRanking = panel.locator('.candidate-ranking')
    await expect(candidateRanking.locator('.candidate-tags')).not.toContainText('EMP-009')
    const bestCandidate = candidateRanking.locator('.candidate-tags em').filter({ hasText: 'EMP-006 孙八' })
    await expect(bestCandidate).toBeVisible()
    await expect(bestCandidate).toContainText('加班窗口')

    await panel.getByRole('button', { name: '生成替班建议' }).click()
    const reassignment = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_labor_reassignment') || '[]')[0])
    expect(reassignment.replacementEmployeeNumber).toBe('EMP-006')
    expect(reassignment.reason).toContain('排班可用性评分')
    expect(reassignment.reason).not.toContain('EMP-009')
  })

  test('无有效替班候选时生成停工复核阻断', async ({ page }) => {
    await routeNoCandidateEmployees(page)
    await page.goto('employee?offlineDemo=0', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    const panel = page.locator('.skill-matrix-panel')
    await expect(panel.getByText('未找到有效替班候选，需阻断开工并升级主管复核')).toBeVisible()
    await expect(panel.locator('strong').getByText('无有效替班候选', { exact: true })).toBeVisible()

    await panel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(panel.getByText('停工复核已同步生产开工与 OTD 复盘')).toBeVisible()
    await expect(panel.locator('.reassignment-note').getByText(/AUD-LABOR-BLOCK-20260520-001 已生成/)).toBeVisible()

    const block = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_labor_qualification_block') || '[]')[0])
    expect(block.status).toBe('active')
    expect(block.auditId).toBe('AUD-LABOR-BLOCK-20260520-001')
    expect(block.traceId).toBe('TRACE-LABOR-BLOCK-WO-013-OP-10')
    expect(block.reason).toContain('未找到有效替班候选')
    const reassignment = await page.evaluate(() => localStorage.getItem('aimes_labor_reassignment'))
    expect(reassignment).toBeNull()

    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'true'))
    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const blockEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'WO-013 淬火 / 回火 无有效替班候选需停工复核' })
    await expect(blockEvidence.getByText('人员阻断')).toBeVisible()
    await expect(blockEvidence.locator('em').filter({ hasText: '停工复核' })).toBeVisible()
    await expect(blockEvidence.getByText('TRACE-LABOR-BLOCK-WO-013-OP-10')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '人员阻断回放' }).getByText('1')).toBeVisible()
    const replayCard = auditPanel.locator('.decision-card').filter({ hasText: '人员阻断：WO-013 淬火 / 回火 无有效替班候选需停工复核' })
    await expect(replayCard).toBeVisible()
    await expect(replayCard.locator('.decision-topline').getByText('人员阻断证据')).toBeVisible()
    await expect(replayCard.getByText('TRACE-LABOR-BLOCK-WO-013-OP-10')).toBeVisible()
    await replayCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/技能缺口、证书临期、班组\/班次、排班可用性和复核授权/)).toBeVisible()
    await expect(detail.getByText(/停工复核责任人、阻断工序和重新放行条件/)).toBeVisible()
  })

  test('停工复核经主管补证改派后重新放行生产与排程', async ({ page }) => {
    await routeNoCandidateEmployees(page)
    await page.goto('employee?offlineDemo=0', { waitUntil: 'commit' })
    await page.waitForSelector('.emp-board', { timeout: 20000 })

    const panel = page.locator('.skill-matrix-panel')
    await panel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(panel.getByText('停工复核已同步生产开工与 OTD 复盘')).toBeVisible()

    await panel.getByRole('button', { name: '主管确认停工复核' }).click()
    await expect(panel.getByText('主管复核中')).toBeVisible()
    await expect(panel.getByText(/TRACE-LABOR-BLOCK-WO-013-OP-10-REVIEW/)).toBeVisible()
    const reviewedBlock = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_labor_qualification_block') || '[]')[0])
    expect(reviewedBlock.status).toBe('reviewing')

    await panel.getByRole('button', { name: '补证改派并重新放行' }).click()
    await expect(panel.getByText('停工复核已重新放行')).toBeVisible()
    await expect(panel.getByText(/AUD-LABOR-RELEASE-20260520-001 已生成/)).toBeVisible()
    const releasedBlock = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_labor_qualification_block') || '[]')[0])
    expect(releasedBlock.status).toBe('released')
    expect(releasedBlock.releaseTraceId).toBe('TRACE-LABOR-RELEASE-WO-013-OP-10')
    const releaseReassignment = await page.evaluate(() => JSON.parse(localStorage.getItem('aimes_labor_reassignment') || '[]')[0])
    expect(releaseReassignment.auditId).toBe('AUD-LABOR-RELEASE-20260520-001')
    expect(releaseReassignment.replacementEmployeeNumber).toBe('EMP-006')
    expect(releaseReassignment.replacementSkill).toContain('补证改派')

    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'true'))
    await page.goto('production?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.production-board', { timeout: 20000 })
    await page.locator('.wo-card').filter({ hasText: 'WO-013' }).click()
    const heatOperation = page.locator('.op-card').filter({ hasText: 'OP-10' }).filter({ hasText: '淬火' })
    await expect(heatOperation.getByText('人员: EMP-006 替班已确认')).toBeVisible()
    await heatOperation.getByRole('button', { name: '开工' }).click()
    const qualificationPanel = page.locator('.start-qualification-panel')
    await expect(qualificationPanel.getByText('替班已确认', { exact: true })).toBeVisible()
    await expect(qualificationPanel.getByText('孙八 · EMP-006')).toBeVisible()
    await expect(qualificationPanel.getByText('AUD-LABOR-RELEASE-20260520-001', { exact: true })).toBeVisible()
    await expect(page.locator('.dialog-confirm')).toBeEnabled()

    await page.goto('scheduling?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.agent-workbench-panel', { timeout: 45000 })
    const constraintPanel = page.locator('.engineering-constraint-panel')
    await expect(constraintPanel.getByText('EMP-003 资质临期已生成 EMP-006 替班复核')).toBeVisible()
    await expect(constraintPanel.getByText(/生产开工可直接读取该证据/)).toBeVisible()
    await expect(page.locator('.event-queue-panel').getByText('人员替班事件')).toBeVisible()

    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const releaseEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'WO-013 淬火 / 回火 停工复核后重新放行' })
    await expect(releaseEvidence.getByText('人员放行')).toBeVisible()
    await expect(releaseEvidence.locator('em').filter({ hasText: '重新放行' })).toBeVisible()
    await expect(releaseEvidence.getByText('TRACE-LABOR-RELEASE-WO-013-OP-10')).toBeVisible()
  })

  test('人员技能资质同步到 OTD 证据链与 Agent 治理', async ({ page }) => {
    const panel = page.locator('.skill-matrix-panel')
    await panel.getByRole('button', { name: '同步人员证据' }).click()
    await expect(panel.getByText('人员能力证据已同步 OTD 复盘')).toBeVisible()
    await expect(panel.getByText('7 名人员的技能和资质状态已写入统一证据链')).toBeVisible()

    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const laborEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: '王五 技能/资质校验进入开工约束' })
    await expect(laborEvidence).toBeVisible()
    await expect(laborEvidence.getByText('人员能力')).toBeVisible()
    await expect(laborEvidence.getByText('资质临期')).toBeVisible()
    await expect(laborEvidence.getByText('TRACE-LABOR-EMP-003')).toBeVisible()

    await page.goto('admin?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    const governancePanel = page.locator('.agent-governance-panel')
    await expect(governancePanel.locator('.agent-metric').filter({ hasText: 'OTD 复盘证据' }).getByText('7')).toBeVisible()
    const governanceLane = governancePanel.locator('.otd-evidence-governance')
    await expect(governanceLane.getByText('王五 技能/资质校验进入开工约束')).toBeVisible()
    await expect(governanceLane.getByText('TRACE-LABOR-EMP-003')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '人员能力回放' }).getByText('7')).toBeVisible()
    const capabilityReplay = auditPanel.locator('.decision-card').filter({ hasText: '人员能力：王五 技能/资质校验进入开工约束' })
    await expect(capabilityReplay).toBeVisible()
    await expect(capabilityReplay.locator('.decision-topline').getByText('人员能力证据')).toBeVisible()
    await capabilityReplay.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/技能、资质有效期、排班窗口、可用工时和排班来源/)).toBeVisible()
    await expect(detail.getByText(/是否可进入开工、替班或停工复核/)).toBeVisible()
  })

  test('人员证据同步写入失败时真实浏览器展示 fail-loud 且不伪造 OTD 证据', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('aimes_otd_evidence_chain')
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithOtdFailure(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          throw new Error('otd evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    const panel = page.locator('.skill-matrix-panel')
    await panel.getByRole('button', { name: '同步人员证据' }).click()

    const alert = panel.getByRole('alert').filter({ hasText: '人员证据同步失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('otd evidence storage unavailable')
    await expect(panel.getByText('人员能力证据已同步 OTD 复盘')).toBeHidden()

    const evidenceChain = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(evidenceChain).toBeNull()
  })

  test('资质临期生成替班建议并进入报表与审计回放', async ({ page }) => {
    const panel = page.locator('.skill-matrix-panel')
    await panel.getByRole('button', { name: '生成替班建议' }).click()
    await expect(panel.getByText('替班建议已同步生产开工与 OTD 复盘')).toBeVisible()
    await expect(panel.locator('.reassignment-note').getByText(/AUD-LABOR-REASSIGN-20260520-001 已生成/)).toBeVisible()
    await expect(panel.locator('.reassignment-note').getByText(/TRACE-LABOR-REASSIGN-WO-013-OP-10/)).toBeVisible()

    await page.goto('report?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const reassignmentEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'WO-013 淬火 / 回火 资质临期替班已确认' })
    await expect(reassignmentEvidence.getByText('人员替班')).toBeVisible()
    await expect(reassignmentEvidence.getByText('已替班')).toBeVisible()
    await expect(reassignmentEvidence.getByText('TRACE-LABOR-REASSIGN-WO-013-OP-10')).toBeVisible()

    await page.goto('audit-logs?offlineDemo=1', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '人员替班回放' }).getByText('1')).toBeVisible()
    const replayCard = auditPanel.locator('.decision-card').filter({ hasText: '人员替班：WO-013 淬火 / 回火 资质临期替班已确认' })
    await expect(replayCard).toBeVisible()
    await expect(replayCard.locator('.decision-topline').getByText('人员替班证据')).toBeVisible()
    await expect(replayCard.getByText('TRACE-LABOR-REASSIGN-WO-013-OP-10')).toBeVisible()
    await replayCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-LABOR-REASSIGN-WO-013-OP-10', { exact: true })).toBeVisible()
    await expect(detail.getByText(/临期资质、候选评分、替班人员、主管复核和补证放行状态/)).toBeVisible()
    await expect(detail.getByText(/替班人员、工程确认、复核状态和排产释放窗口/)).toBeVisible()
  })
})
