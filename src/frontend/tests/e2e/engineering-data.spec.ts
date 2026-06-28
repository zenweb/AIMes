import { test, expect } from '@playwright/test'

test.describe('Engineering data 工程数据约束', () => {
  test.describe.configure({ timeout: 60000 })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('aimes_e2e_storage_reset')) {
        localStorage.removeItem('aimes_engineering_change_impact_analysis')
        localStorage.removeItem('aimes_bom_kitting_package')
        localStorage.removeItem('aimes_shortage_kitting_event')
        localStorage.removeItem('aimes_otd_evidence_chain')
        sessionStorage.setItem('aimes_e2e_storage_reset', '1')
      }
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.route('**/api/v1/**', async route => {
      const url = route.request().url()
      if (url.includes('/api/v1/auth/refresh')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-e2e-token',
            refreshToken: 'mock-e2e-refresh',
            expiresAt: '2026-12-31T23:59:59Z',
          }),
        })
        return
      }
      if (url.includes('/latest')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
        return
      }
      if (url.includes('/api/v1/bom') || url.includes('/api/v1/routing')) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'engineering data e2e uses local fallback fixtures' }),
        })
        return
      }
      if (url.includes('/api/v1/scheduling/')) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'engineering data e2e uses local evidence fallback' }),
        })
        return
      }
      if (url.includes('/api/v1/report/dashboard')) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'engineering data e2e uses report fallback fixtures' }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }),
      })
    })
  })

  test('BOM 列表加载失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/bom**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium bom list API unavailable' }),
    }))

    await page.goto('bom', { waitUntil: 'domcontentloaded' })

    const alert = page.locator('[role="alert"]').filter({ hasText: 'BOM 列表加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Request failed with status code 503')
    const listbox = page.getByRole('listbox', { name: 'BOM 列表' })
    await expect(listbox.getByRole('option', { name: /产品A 物料清单/ })).toBeVisible()
    await expect(listbox.getByRole('option', { name: /BOM-A100/ })).toBeVisible()
  })

  test('BOM 启动工程证据同步失败时真实浏览器仍可操作列表', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithEngineeringEvidenceFailure(key: string) {
        if (key === 'aimes_engineering_change_impact_analysis') {
          throw new Error('chromium engineering evidence storage unavailable')
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithEngineeringEvidenceFailure(key: string) {
        if (key === 'aimes_engineering_change_impact_analysis') {
          throw new Error('chromium engineering evidence storage unavailable')
        }
        return originalRemoveItem.call(this, key)
      }
    })
    await page.route('**/api/v1/scheduling/engineering-change-impact/latest', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium engineering evidence API unavailable' }),
    }))
    await page.route('**/api/v1/bom?**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'bom-1',
          bomCode: 'BOM-A100',
          bomName: '产品A 物料清单',
          productCode: 'PROD-A1',
          productName: '精密轴承组件 A',
          bomType: 'Manufacturing',
          version: 'V1.0',
          status: 'Released',
          effectiveDate: '2026-01-01',
          expireDate: null,
          itemCount: 5,
          createdAt: '2026-01-01',
        }],
        totalCount: 1,
        page: 1,
        pageSize: 10,
      }),
    }))

    await page.goto('bom', { waitUntil: 'domcontentloaded' })

    const alert = page.locator('[role="alert"]').filter({ hasText: 'BOM 工程证据加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('ECN 影响分析')
    await expect(alert).toContainText('chromium engineering evidence storage unavailable')
    const listbox = page.getByRole('listbox', { name: 'BOM 列表' })
    await expect(listbox.getByRole('option', { name: /产品A 物料清单/ })).toBeVisible()
    await expect(listbox.getByRole('option', { name: /BOM-A100/ })).toBeVisible()
  })

  test('BOM 启动工程证据和列表加载同时失败时真实浏览器保留全部告警', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithEngineeringEvidenceFailure(key: string) {
        if (key === 'aimes_engineering_change_impact_analysis') {
          throw new Error('chromium engineering evidence storage unavailable')
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithEngineeringEvidenceFailure(key: string) {
        if (key === 'aimes_engineering_change_impact_analysis') {
          throw new Error('chromium engineering evidence cleanup unavailable')
        }
        return originalRemoveItem.call(this, key)
      }
    })
    await page.route('**/api/v1/scheduling/engineering-change-impact/latest', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium engineering evidence API unavailable' }),
    }))
    await page.route('**/api/v1/bom?**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium bom list API unavailable' }),
    }))

    await page.goto('bom', { waitUntil: 'domcontentloaded' })

    const alert = page.locator('.bom-error[role="alert"]')
    await expect(alert).toContainText('BOM 工程证据加载失败')
    await expect(alert).toContainText('chromium engineering evidence')
    await expect(alert).toContainText('unavailable')
    await expect(alert).toContainText('BOM 列表加载失败')
    await expect(alert).toContainText('Request failed with status code 503')
    const listbox = page.getByRole('listbox', { name: 'BOM 列表' })
    await expect(listbox.getByRole('option', { name: /产品A 物料清单/ })).toBeVisible()
    await expect(listbox.getByRole('option', { name: /BOM-A100/ })).toBeVisible()
  })

  test('BOM 选择时工程证据刷新失败仍打开详情并 fail-loud', async ({ page }) => {
    let impactRequests = 0
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      let impactStorageReads = 0
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithImpactRefreshFailure(key: string) {
        if (key === 'aimes_engineering_change_impact_analysis') {
          impactStorageReads += 1
          if (impactStorageReads > 1) {
            throw new Error('chromium impact refresh storage unavailable')
          }
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithImpactRefreshFailure(key: string) {
        if (key === 'aimes_engineering_change_impact_analysis' && impactStorageReads > 1) {
          throw new Error('chromium impact refresh storage cleanup unavailable')
        }
        return originalRemoveItem.call(this, key)
      }
    })
    await page.route('**/api/v1/scheduling/engineering-change-impact/latest', route => {
      impactRequests += 1
      return route.fulfill({
        status: impactRequests === 1 ? 200 : 503,
        contentType: 'application/json',
        body: impactRequests === 1
          ? 'null'
          : JSON.stringify({ message: 'chromium impact refresh unavailable' }),
      })
    })
    await page.route('**/api/v1/bom?**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'bom-1',
          bomCode: 'BOM-A100',
          bomName: '产品A 物料清单',
          productCode: 'PROD-A1',
          productName: '精密轴承组件 A',
          bomType: 'Manufacturing',
          version: 'V1.0',
          status: 'Released',
          effectiveDate: '2026-01-01',
          expireDate: null,
          itemCount: 5,
          createdAt: '2026-01-01',
        }, {
          id: 'bom-2',
          bomCode: 'BOM-B200',
          bomName: '产品B 物料清单',
          productCode: 'PROD-B1',
          productName: '传动轴总成 B',
          bomType: 'Manufacturing',
          version: 'V2.1',
          status: 'Released',
          effectiveDate: '2026-03-15',
          expireDate: null,
          itemCount: 8,
          createdAt: '2026-03-10',
        }],
        totalCount: 2,
        page: 1,
        pageSize: 10,
      }),
    }))
    await page.route('**/api/v1/bom/bom-2', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'bom-2',
        bomCode: 'BOM-B200',
        bomName: '产品B 物料清单',
        productCode: 'PROD-B1',
        productName: '传动轴总成 B',
        bomType: 'Manufacturing',
        version: 'V2.1',
        status: 'Released',
        effectiveDate: '2026-03-15',
        expireDate: null,
        items: [],
        changeHistory: [],
        createdAt: '2026-03-10',
        updatedAt: null,
      }),
    }))

    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.getByRole('option', { name: /产品B 物料清单/ }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: 'BOM 工程证据刷新失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('ECN 影响分析')
    await expect(alert).toContainText('Request failed with status code 503')
    await expect(alert).toContainText('已继续加载 BOM 详情')
    await expect(page.locator('.detail-header h3')).toHaveText('产品B 物料清单')
    await expect(page.getByText('BOM 排产约束源')).toBeVisible()
  })

  test('BOM 详情加载失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/bom?**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'bom-1',
          bomCode: 'BOM-A100',
          bomName: '产品A 物料清单',
          productCode: 'PROD-A1',
          productName: '精密轴承组件 A',
          bomType: 'Manufacturing',
          version: 'V1.0',
          status: 'Released',
          effectiveDate: '2026-01-01',
          expireDate: null,
          itemCount: 5,
          createdAt: '2026-01-01',
        }],
        totalCount: 1,
        page: 1,
        pageSize: 10,
      }),
    }))
    await page.route('**/api/v1/bom/bom-1', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium bom detail API unavailable' }),
    }))

    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.getByRole('option', { name: /产品A 物料清单/ }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: 'BOM 详情加载失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Request failed with status code 503')
    await expect(page.locator('.detail-header h3')).toHaveText('产品A 物料清单')
    await expect(page.getByText('BOM 排产约束源')).toBeVisible()
    await expect(page.getByText('M-AL-6061 缺料会冻结 CNC 后段')).toBeVisible()
  })

  test('BOM 展开失败时真实浏览器展示 fail-loud fallback', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/bom?**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          id: 'bom-1',
          bomCode: 'BOM-A100',
          bomName: '产品A 物料清单',
          productCode: 'PROD-A1',
          productName: '精密轴承组件 A',
          bomType: 'Manufacturing',
          version: 'V1.0',
          status: 'Released',
          effectiveDate: '2026-01-01',
          expireDate: null,
          itemCount: 5,
          createdAt: '2026-01-01',
        }],
        totalCount: 1,
        page: 1,
        pageSize: 10,
      }),
    }))
    await page.route('**/api/v1/bom/bom-1', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'bom-1',
        bomCode: 'BOM-A100',
        bomName: '产品A 物料清单',
        productCode: 'PROD-A1',
        productName: '精密轴承组件 A',
        bomType: 'Manufacturing',
        version: 'V1.0',
        status: 'Released',
        effectiveDate: '2026-01-01',
        expireDate: null,
        items: [],
        changeHistory: [{ changeDescription: '初始创建', changedBy: 'admin', changedAt: '2026-01-01' }],
        createdAt: '2026-01-01',
        updatedAt: null,
      }),
    }))
    await page.route('**/api/v1/bom/bom-1/explode**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'chromium bom explosion API unavailable' }),
    }))

    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.getByRole('option', { name: /产品A 物料清单/ }).click()
    await page.getByRole('button', { name: '爆炸展开' }).click()

    const alert = page.locator('[role="alert"]').filter({ hasText: 'BOM 展开失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('Request failed with status code 503')
    const explosion = page.locator('.explosion-section')
    await expect(explosion.getByText('物料展开')).toBeVisible()
    await expect(explosion.getByText('MAT-A01')).toBeVisible()
    await expect(explosion.getByText('轴承钢圈')).toBeVisible()
  })

  test('BOM 页面展示替代料、缺料和发布版本如何约束排产', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    await expect(panel.getByText('BOM 排产约束源')).toBeVisible()
    await expect(panel.getByText('M-AL-6061 缺料会冻结 CNC 后段')).toBeVisible()
    await expect(panel.getByText('M-AL-6061B 需工程确认')).toBeVisible()
    await expect(panel.getByText('BOM-A100 V1.0 已发布')).toBeVisible()
    await expect(panel.getByText(/AI 排产使用 BOM-A100 V1.0/)).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
  })

  test('BOM 替代料工程确认释放排产约束并进入 OTD 审计', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    const approval = panel.locator('.alternate-approval')
    await expect(approval.getByText('M-AL-6061B 等待工程确认')).toBeVisible()
    await approval.getByRole('button', { name: '确认替代料放行' }).click()
    await expect(approval.getByText('M-AL-6061B 已工程放行')).toBeVisible()
    await expect(approval.getByText('AUD-ENG-ALT-20260520-001')).toBeVisible()
    await expect(approval.getByText('已同步 OTD 证据链')).toBeVisible()
    await expect(panel.getByText('M-AL-6061B 已工程确认')).toBeVisible()
    await expect(panel.getByText(/AI 排产可释放 WO-RUSH-9001 \/ WO-DEMO-1002/)).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
    const scheduleConstraint = page.locator('.engineering-constraint-panel')
    await expect(scheduleConstraint.getByText('M-AL-6061B 已工程确认，可替代 M-AL-6061')).toBeVisible()
    await expect(scheduleConstraint.getByText('AUD-ENG-ALT-20260520-001', { exact: true })).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    await eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061 齐套缺口' }).getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('替代料已放行后的缺料复核')).toBeVisible()
    await expect(eventPanel.getByText(/M-AL-6061B 可替代 M-AL-6061/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'M-AL-6061B 替代 M-AL-6061 已工程确认' })
    await expect(evidence.getByText('工程放行')).toBeVisible({ timeout: 15000 })
    await expect(evidence.getByText('TRACE-ENG-ALT-BOM-A100-M-AL-6061B')).toBeVisible({ timeout: 15000 })

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '工程约束回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '工程放行：M-AL-6061B 替代 M-AL-6061 已工程确认' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('工程约束证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-ENG-ALT-BOM-A100-M-AL-6061B', { exact: true })).toBeVisible()
    await expect(detail.getByText(/工程数据读取 BOM 管理 \/ 替代料确认 的 BOM\/工艺路线版本、替代料、质量门和能力约束/)).toBeVisible()
    await expect(detail.getByText(/替代料放行、质量门保留、人员\/设备能力和排产释放窗口/)).toBeVisible()
  })

  test('BOM 展开齐套检查包进入库存齐套排产和 OTD 审计', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    const kitting = panel.locator('.bom-kitting-source')
    await expect(kitting.getByText('把 BOM 展开结果送入库存齐套')).toBeVisible()
    await expect(kitting.locator('.kitting-source-card').filter({ hasText: 'M-AL-6061' }).getByText('M-AL-6061', { exact: true })).toBeVisible()
    await expect(kitting.getByText(/缺 19 件/)).toBeVisible()
    await kitting.getByRole('button', { name: '生成 BOM 齐套检查包' }).click()
    await expect(kitting.getByText('BOM 展开齐套包已进入库存与排产')).toBeVisible()
    await expect(kitting.getByText('AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522')).toBeVisible()
    await expect(kitting.getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()
    await expect(kitting.getByRole('button', { name: 'BOM 齐套检查包已发布' })).toBeDisabled()

    await page.goto('inventory', { waitUntil: 'commit' })
    await page.waitForSelector('.inv-board', { timeout: 30000 })
    const inventoryPackage = page.locator('.bom-kitting-package-panel')
    await expect(inventoryPackage.getByText('BOM-A100 展开齐套包')).toBeVisible()
    await expect(inventoryPackage.getByText(/M-AL-6061 缺口 19 件/)).toBeVisible()
    await expect(inventoryPackage.getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()

    await page.goto('scheduling', { waitUntil: 'commit' })
    await page.waitForSelector('.engineering-constraint-panel', { timeout: 45000 })
    const constraintPanel = page.locator('.engineering-constraint-panel')
    await expect(constraintPanel.getByText('BOM-A100 已展开为工单齐套包')).toBeVisible()
    await expect(constraintPanel.locator('.constraint-evidence').getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001', { exact: true })).toBeVisible()
    const eventPanel = page.locator('.event-queue-panel')
    const kittingEvent = eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061 工单齐套缺口' })
    await expect(kittingEvent.locator('.event-evidence').getByText('BOM-A100 V1.0', { exact: true })).toBeVisible()
    await expect(kittingEvent.locator('.event-evidence').getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001', { exact: true })).toBeVisible()
    await kittingEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('缺料约束重排建议')).toBeVisible()
    await expect(eventPanel.getByText(/引用 BOM 替代料规则/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'BOM-A100 展开齐套检查包已进入排产复核' })
    await expect(evidence.locator('.evidence-topline span').getByText('库存齐套', { exact: true })).toBeVisible()
    await expect(evidence.locator('code').getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001', { exact: true })).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '库存齐套：BOM-A100 展开齐套检查包已进入排产复核' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('库存齐套证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/BOM 管理 \/ BOM-A100 V1.0/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/调拨、替代料、采购加急和排产顺序调整是否闭环/)).toBeVisible()
  })

  test('BOM 齐套检查包 OTD 证据链同步失败后真实浏览器锁定发布动作', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function setItemWithOtdEvidenceFailure(key: string, value: string) {
        if (key === 'aimes_otd_evidence_chain') {
          throw new Error('chromium OTD evidence storage unavailable')
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    const kitting = panel.locator('.bom-kitting-source')
    await expect(kitting.getByText('把 BOM 展开结果送入库存齐套')).toBeVisible()
    await kitting.getByRole('button', { name: '生成 BOM 齐套检查包' }).click()

    await expect(kitting.getByText('BOM 展开齐套包已进入库存与排产')).toBeVisible()
    await expect(kitting.getByText('AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522')).toBeVisible()
    await expect(kitting.getByText('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')).toBeVisible()
    await expect(kitting.getByRole('button', { name: 'BOM 齐套检查包已发布' })).toBeDisabled()

    const alert = page.locator('[role="alert"]').filter({ hasText: 'BOM 齐套检查包已发布，但 OTD 证据链同步失败' })
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('chromium OTD evidence storage unavailable')

    const storedPackage = await page.evaluate(() => localStorage.getItem('aimes_bom_kitting_package'))
    expect(storedPackage).toContain('bom-kitting-package-bom-a100-wo-rush-9001')
    const otdEvidence = await page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))
    expect(otdEvidence).toBeNull()
  })

  test('BOM 工程变更影响分析进入排产模拟和 OTD 审计', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    const impact = panel.locator('.change-impact')
    await expect(impact.getByText('替代料变更先算影响再进排产')).toBeVisible()
    await expect(impact.getByText('缺口 19 件 / 替代可用 28 件')).toBeVisible()
    await impact.getByRole('button', { name: '生成影响分析' }).click()
    await expect(impact.getByText('M-AL-6061B 替代 M-AL-6061 工程变更影响分析')).toBeVisible()
    await expect(impact.getByText('AUD-ENG-ECN-20260521-001')).toBeVisible()
    await expect(impact.getByText('TRACE-ENG-ECN-BOM-A100-6061B')).toBeVisible()
    await expect(impact.getByText(/材料成本 \+1.8%/)).toBeVisible()
    await expect(panel.getByText(/AI 排产可按 锁定期后第一个 CNC 空窗/)).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
    await page.waitForSelector('.engineering-constraint-panel', { timeout: 45000 })
    const scheduleConstraint = page.locator('.engineering-constraint-panel')
    await expect(scheduleConstraint.getByText('ECN-BOM-A100-6061B-20260521 已完成替代料影响分析')).toBeVisible()
    await expect(scheduleConstraint.getByText('AUD-ENG-ECN-20260521-001', { exact: true })).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const engineeringEvent = eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析' })
    await expect(engineeringEvent.locator('.event-type').getByText('工程变更影响', { exact: true })).toBeVisible()
    await expect(engineeringEvent.getByText('ECN-BOM-A100-6061B-20260521')).toBeVisible()
    await engineeringEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('工程变更影响后的审批前排产模拟')).toBeVisible()
    await expect(eventPanel.getByText(/正式采纳前需工程审批/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521 替代料影响分析已生成' })
    await expect(evidence.getByText('工程变更影响', { exact: true })).toBeVisible()
    await expect(evidence.getByText('TRACE-ENG-ECN-BOM-A100-6061B')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '工程变更回放' }).getByText('1')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '工程变更影响：ECN-BOM-A100-6061B-20260521 替代料影响分析已生成' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('工程变更证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-ENG-ECN-BOM-A100-6061B', { exact: true })).toBeVisible()
    await expect(detail.getByText(/工程变更读取 BOM 管理 \/ 工程变更影响分析 的库存缺口、替代料可用量、质量影响、供应批次、成本和 OTD 模拟/)).toBeVisible()
    await expect(detail.getByText(/审批前模拟、正式放行或驳回撤回是否已同步 AI 排产/)).toBeVisible()
  })

  test('BOM 工程变更批准后进入正式排产释放和 OTD 审计', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    const impact = panel.locator('.change-impact')
    await impact.getByRole('button', { name: '生成影响分析' }).click()
    await impact.getByRole('button', { name: '批准 ECN 放行' }).click()
    await expect(impact.getByText('已批准正式释放')).toBeVisible()
    await expect(impact.getByText('AUD-ENG-ECN-20260521-APPROVE')).toBeVisible()
    await expect(panel.getByText(/AI 排产可正式释放 WO-RUSH-9001 \/ WO-DEMO-1002/)).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await page.waitForSelector('.engineering-constraint-panel', { timeout: 45000 })
    const scheduleConstraint = page.locator('.engineering-constraint-panel')
    await expect(scheduleConstraint.getByText('ECN-BOM-A100-6061B-20260521 已批准正式释放')).toBeVisible()
    await expect(scheduleConstraint.getByText('AUD-ENG-ECN-20260521-APPROVE', { exact: true })).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const engineeringEvent = eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析' })
    await expect(engineeringEvent.locator('.event-severity').getByText('已批准', { exact: true })).toBeVisible()
    await expect(engineeringEvent.getByText('已缓解')).toBeVisible()
    await engineeringEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.getByText('工程变更批准后的正式排产释放')).toBeVisible()
    await expect(eventPanel.getByText(/正式释放 WO-RUSH-9001 \/ WO-DEMO-1002/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521 正式批准并释放替代料' })
    await expect(evidence.getByText('工程变更批准')).toBeVisible()
    await expect(evidence.getByText('已批准')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '工程变更批准：ECN-BOM-A100-6061B-20260521 正式批准并释放替代料' })
    await expect(auditCard).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '工程变更回放' }).getByText('2')).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('工程变更证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/库存缺口、替代料可用量、质量影响、供应批次、成本和 OTD 模拟/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/审批前模拟、正式放行或驳回撤回是否已同步 AI 排产/)).toBeVisible()
  })

  test('BOM 工程变更驳回后撤回排产模拟并进入 OTD 审计', async ({ page }) => {
    await page.goto('bom', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'BOM-A100' }).click()

    const panel = page.locator('.constraint-section')
    const impact = panel.locator('.change-impact')
    await impact.getByRole('button', { name: '生成影响分析' }).click()
    await impact.getByRole('button', { name: '驳回 ECN' }).click()
    await expect(impact.getByText('已驳回，审批前模拟撤回')).toBeVisible()
    await expect(impact.getByText('AUD-ENG-ECN-20260521-REJECT')).toBeVisible()
    await expect(panel.getByText(/AI 排产撤回模拟并保持 M-AL-6061 原物料策略/)).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await page.waitForSelector('.engineering-constraint-panel', { timeout: 45000 })
    const scheduleConstraint = page.locator('.engineering-constraint-panel')
    await expect(scheduleConstraint.getByText('ECN-BOM-A100-6061B-20260521 已驳回')).toBeVisible()
    await expect(scheduleConstraint.getByText('AUD-ENG-ECN-20260521-REJECT', { exact: true })).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const engineeringEvent = eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析' })
    await expect(engineeringEvent.locator('.event-severity').getByText('已驳回', { exact: true })).toBeVisible()
    await engineeringEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('工程变更驳回后的模拟撤回')).toBeVisible()
    await expect(eventPanel.locator('.agent-suggestion').getByText(/保持 M-AL-6061 原物料策略/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'ECN-BOM-A100-6061B-20260521 工程变更已驳回' })
    await expect(evidence.getByText('工程变更驳回')).toBeVisible()
    await expect(evidence.locator('.evidence-topline em').getByText('已驳回', { exact: true })).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '工程变更驳回：ECN-BOM-A100-6061B-20260521 工程变更已驳回' })
    await expect(auditCard).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '工程变更回放' }).getByText('2')).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('工程变更证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/工程变更读取 BOM 管理 \/ ECN 审批 的库存缺口、替代料可用量、质量影响、供应批次、成本和 OTD 模拟/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/审批前模拟、正式放行或驳回撤回是否已同步 AI 排产/)).toBeVisible()
  })

  test('工艺路线页面展示设备能力、质量门和节拍如何约束 Agent', async ({ page }) => {
    await page.goto('routing', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'R-A100' }).click()

    const panel = page.locator('.routing-constraint-section')
    await expect(panel.getByText('工艺路线排产约束')).toBeVisible()
    await expect(panel.getByText('CNC 精加工必须匹配 CNC 设备能力')).toBeVisible()
    await expect(panel.getByText('来料检验和最终检验不可跳过')).toBeVisible()
    await expect(panel.getByText('45min 标准总前置时间')).toBeVisible()
    await expect(panel.getByText(/AI 排产引用 R-A100/)).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
  })

  test('工艺路线能力校验确认后进入排产事件和 OTD 审计', async ({ page }) => {
    await page.goto('routing', { waitUntil: 'domcontentloaded' })
    await page.locator('.list-item').filter({ hasText: 'R-B200' }).click()

    const panel = page.locator('.routing-constraint-section')
    const validation = panel.locator('.capability-validation')
    await expect(validation.getByText('OP-090 热处理瓶颈能力复核')).toBeVisible()
    await expect(validation.getByText('热处理炉 HT-01')).toBeVisible()
    await validation.getByRole('button', { name: '运行能力校验' }).click()
    await expect(validation.getByText('瓶颈已校验')).toBeVisible()
    await expect(validation.getByText('AUD-ROUTE-CAP-20260521-001')).toBeVisible()
    await validation.getByRole('button', { name: '确认分流/合批方案' }).click()
    await expect(validation.getByText('分流已确认')).toBeVisible()
    await expect(validation.getByText('TRACE-ROUTE-CAP-R-B200-OP-090')).toBeVisible()

    await panel.getByRole('link', { name: '查看 AI 排产解释' }).click()
    await expect(page).toHaveURL(/\/scheduling\/scheduling$/)
    await page.waitForSelector('.engineering-constraint-panel', { timeout: 45000 })
    const scheduleConstraint = page.locator('.engineering-constraint-panel')
    await expect(scheduleConstraint.getByText('OP-090 热处理分流/合批已确认')).toBeVisible()
    await expect(scheduleConstraint.locator('.constraint-evidence span').getByText('AUD-ROUTE-CAP-20260521-001', { exact: true })).toBeVisible()

    const eventPanel = page.locator('.event-queue-panel')
    const routeEvent = eventPanel.locator('.event-card').filter({ hasText: 'R-B200 OP-090 热处理能力缺口' })
    await expect(routeEvent.getByText('工艺能力')).toBeVisible()
    await routeEvent.getByRole('button', { name: '复核排产影响' }).click()
    const suggestion = eventPanel.locator('.agent-suggestion')
    await expect(suggestion.getByText('热处理分流确认后的排产复核')).toBeVisible()
    await expect(suggestion.getByText(/HT-02 夜班窗口 \/ 外协 HT-SUP-01/)).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'R-B200 OP-090 热处理能力分流/合批已确认' })
    await expect(evidence.getByText('工艺能力放行')).toBeVisible()
    await expect(evidence.getByText('TRACE-ROUTE-CAP-R-B200-OP-090')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '工艺能力放行：R-B200 OP-090 热处理能力分流/合批已确认' })
    await expect(auditCard).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '工艺能力回放' }).getByText('1')).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('工艺能力证据')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-ROUTE-CAP-R-B200-OP-090', { exact: true })).toBeVisible()
    await expect(detail.getByText(/工艺路线读取 工艺路线 \/ 能力校验 的瓶颈资源、候选设备\/外协、能力缺口和合批窗口/)).toBeVisible()
    await expect(detail.getByText(/分流\/合批方案、外协兜底和排产释放条件/)).toBeVisible()
  })

  test('AI 排产同步工程约束到 OTD 证据链与审计回放', async ({ page }) => {
    await page.goto('scheduling', { waitUntil: 'commit', timeout: 45000 })
    await page.waitForSelector('.engineering-constraint-panel', { timeout: 45000 })

    const panel = page.locator('.engineering-constraint-panel')
    await expect(panel.getByText('BOM 与工艺路线进入排产解释')).toBeVisible()
    await panel.getByRole('button', { name: '同步工程证据' }).click()
    await expect(panel.getByText('工程约束证据已同步 OTD 复盘')).toBeVisible()
    await expect(panel.getByText('4 条工程约束已写入统一证据链')).toBeVisible()

    await page.goto('report', { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidenceChain = page.locator('.otd-evidence-chain')
    const bomEvidence = evidenceChain.locator('.evidence-chain-card').filter({ hasText: 'BOM 替代料：M-AL-6061B 可替代 M-AL-6061' })
    await expect(bomEvidence).toBeVisible()
    await expect(bomEvidence.getByText('工程约束')).toBeVisible()
    await expect(bomEvidence.getByText('TRACE-ENG-ENG-BOM-AL6061')).toBeVisible()

    await page.goto('audit-logs', { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 30000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '工程约束回放' }).getByText('4')).toBeVisible()
    const auditCard = auditPanel.locator('.decision-card').filter({ hasText: '工程约束：BOM 替代料：M-AL-6061B 可替代 M-AL-6061' })
    await expect(auditCard).toBeVisible()
    await expect(auditCard.locator('.decision-topline').getByText('工程约束证据')).toBeVisible()
    await expect(auditCard.getByText('TRACE-ENG-ENG-BOM-AL6061')).toBeVisible()
    await auditCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-ENG-ENG-BOM-AL6061', { exact: true })).toBeVisible()
    await expect(detail.getByText(/工程数据读取 AI 排产 \/ 工程数据约束 的 BOM\/工艺路线版本、替代料、质量门和能力约束/)).toBeVisible()
    await expect(detail.getByText(/替代料放行、质量门保留、人员\/设备能力和排产释放窗口/)).toBeVisible()
  })
})
