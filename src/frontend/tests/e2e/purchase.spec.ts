import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface LatestAbReport {
  delta: { delayedOrdersReduced: number }
}

const latestAbReport = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public', 'reports', 'latest-ab-report.json'), 'utf8'),
) as LatestAbReport
const expectedDelayedOrdersReduced = `${latestAbReport.delta.delayedOrdersReduced} 单`

function offlineDemoPath(path: string) {
  return `${path}?offlineDemo=1`
}

async function enableLivePurchaseRequest(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    window.history.replaceState(null, '', '/scheduling/purchase?offlineDemo=0')
    localStorage.setItem('aimes_offline_demo', 'false')
    localStorage.setItem('aimes_token', 'mock-e2e-token')
    localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
  })
}

test.describe('Purchase 采购协同', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_refresh_token', 'mock-e2e-refresh')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto(offlineDemoPath('purchase'))
    await page.waitForSelector('.po-board', { timeout: 20000 })
  })

  test('离线演示采购入口不会触达采购后端接口', async ({ page }) => {
    let purchaseBackendRequests = 0
    await page.route('**/api/v1/purchase**', async route => {
      purchaseBackendRequests += 1
      await route.fulfill({
        status: 599,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'offline demo purchase backend leak' }),
      })
    })

    await page.goto(offlineDemoPath('purchase'), { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.po-board', { timeout: 20000 })

    await expect(page.getByRole('option', { name: /PO-20260501/ })).toBeVisible()
    await expect(page.locator('.purchase-notification')).toHaveCount(0)
    await expect(page.locator('body')).not.toContainText('offline demo purchase backend leak')
    expect(purchaseBackendRequests).toBe(0)
  })

  test('新建采购订单接口失败时保留弹窗并告警', async ({ page }) => {
    const orderNumber = 'PO-CHROMIUM-FAIL-001'
    let createRequestCount = 0

    await page.route('**/api/v1/purchase', async route => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      createRequestCount += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'supplier master data missing from chromium' }),
      })
    })
    await enableLivePurchaseRequest(page)

    await page.locator('.list-panel').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: '+ 新建' }).click()
    const dialog = page.getByRole('dialog', { name: '新建采购订单' })
    await expect(dialog).toBeVisible()
    const inputs = dialog.locator('.form-input')
    await inputs.nth(0).fill(orderNumber)
    await inputs.nth(1).fill('西南锻造厂')
    await dialog.locator('.btn-ok').click()

    const alert = page.locator('.purchase-notification')
    await expect(alert).toContainText('创建失败')
    await expect(alert).toContainText('supplier master data missing from chromium')
    await expect(dialog).toBeVisible()
    await expect(page.locator('.list-panel')).not.toContainText(orderNumber)
    expect(createRequestCount).toBe(1)
  })

  test('确认采购订单接口失败时保留已提交状态并告警', async ({ page }) => {
    let confirmRequestCount = 0

    await page.route('**/api/v1/purchase/*/confirm', async route => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      confirmRequestCount += 1
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'supplier credit hold from chromium' }),
      })
    })
    await page.locator('.list-panel').scrollIntoViewIfNeeded()
    await page.getByRole('option', { name: /PO-20260502/ }).click()
    await expect(page.locator('.detail-header')).toContainText('PO-20260502')
    await expect(page.locator('.detail-header .tag')).toHaveText('已提交')
    await enableLivePurchaseRequest(page)
    await page.locator('.act-confirm').click()

    const alert = page.locator('.purchase-notification')
    await expect(alert).toContainText('确认失败')
    await expect(alert).toContainText('supplier credit hold from chromium')
    await expect(page.locator('.detail-header .tag')).toHaveText('已提交')
    await expect(page.getByRole('option', { name: /PO-20260502/ }).locator('.tag').filter({ hasText: '已提交' })).toBeVisible()
    await expect(page.locator('.act-confirm')).toBeVisible()
    expect(confirmRequestCount).toBe(1)
  })

  test('收货接口失败时保留收货弹窗和已确认状态并告警', async ({ page }) => {
    let receiveRequestCount = 0

    await page.route('**/api/v1/purchase/*/receive', async route => {
      if (route.request().method() !== 'POST') {
        await route.continue()
        return
      }

      receiveRequestCount += 1
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'received quantity exceeds remaining from chromium' }),
      })
    })
    await page.locator('.list-panel').scrollIntoViewIfNeeded()
    await page.getByRole('option', { name: /PO-20260501/ }).click()
    await expect(page.locator('.detail-header')).toContainText('PO-20260501')
    await expect(page.locator('.detail-header .tag')).toHaveText('已确认')
    await expect(page.locator('.items-table tbody').getByText('MAT-A01')).toBeVisible()
    await expect(page.locator('.items-table tbody tr').filter({ hasText: 'MAT-A01' }).locator('.rec-part')).toHaveText('0')

    await page.locator('.act-receive').click()
    const dialog = page.locator('.modal-content').filter({ hasText: '收货' })
    await expect(dialog).toBeVisible()
    await dialog.locator('select').selectOption('MAT-A01')
    await dialog.locator('input[type="number"]').fill('2500')
    await enableLivePurchaseRequest(page)
    await dialog.locator('.btn-ok').click()

    const alert = page.locator('.purchase-notification')
    await expect(alert).toContainText('收货失败')
    await expect(alert).toContainText('received quantity exceeds remaining from chromium')
    await expect(dialog).toBeVisible()
    await expect(page.locator('.detail-header .tag')).toHaveText('已确认')
    await expect(page.locator('.items-table tbody tr').filter({ hasText: 'MAT-A01' }).locator('.rec-part')).toHaveText('0')
    await expect(page.locator('.act-receive')).toBeVisible()
    expect(receiveRequestCount).toBe(1)
  })

  test('收货弹窗具备可访问 dialog 名称', async ({ page }) => {
    await page.locator('.list-panel').scrollIntoViewIfNeeded()
    await page.getByRole('option', { name: /PO-20260501/ }).click()
    await expect(page.locator('.detail-header .tag')).toHaveText('已确认')

    await page.locator('.act-receive').click()

    const dialog = page.getByRole('dialog', { name: '收货' })
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('select')).toBeVisible()
    await expect(dialog.locator('input[type="number"]')).toBeVisible()
    await expect(dialog.getByRole('button', { name: '确认收货' })).toBeVisible()
  })

  test('启动证据多源同步失败时真实浏览器保留全部 fail-loud 告警且采购列表可用', async ({ page }) => {
    await page.route('**/api/v1/shortage-evidence/supply-risk-escalations/latest**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'supply risk backend unavailable from chromium' }),
      })
    })
    await page.route('**/api/v1/shortage-evidence/supplier-network-decisions/latest**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'supplier network backend unavailable from chromium' }),
      })
    })
    await page.route('**/api/v1/outsourcing-evidence/commitments/latest**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'outsourcing backend unavailable from chromium' }),
      })
    })
    await page.route('**/api/v1/scheduling/anomaly-dispatch-records**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'material dispatch backend unavailable from chromium' }),
      })
    })
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithEvidenceReadFailure(key: string) {
        if (
          key === 'aimes_supply_risk_escalation'
          || key === 'aimes_supplier_network_decision'
          || key === 'aimes_outsourcing_commitment_packages'
          || key === 'aimes_anomaly_dispatch_records'
        ) {
          throw new Error(`${key} storage read unavailable from chromium`)
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithEvidenceCleanupFailure(key: string) {
        if (
          key === 'aimes_supply_risk_escalation'
          || key === 'aimes_supplier_network_decision'
          || key === 'aimes_outsourcing_commitment_packages'
          || key === 'aimes_anomaly_dispatch_records'
        ) {
          throw new Error(`${key} storage cleanup unavailable from chromium`)
        }
        return originalRemoveItem.call(this, key)
      }
    })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.po-board', { timeout: 20000 })

    const alert = page.locator('.purchase-notification')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('供应风险状态同步失败')
    await expect(alert).toContainText('aimes_supply_risk_escalation storage read unavailable from chromium')
    await expect(alert).toContainText('供应网络决策同步失败')
    await expect(alert).toContainText('aimes_supplier_network_decision storage read unavailable from chromium')
    await expect(alert).toContainText('外协承诺同步失败')
    await expect(alert).toContainText('aimes_outsourcing_commitment_packages storage cleanup unavailable from chromium')
    await expect(alert).toContainText('异常分流供应整改同步失败')
    await expect(alert).toContainText('aimes_anomaly_dispatch_records storage cleanup unavailable from chromium')
    await expect(page.getByRole('option', { name: /PO-20260501/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '+ 新建' })).toBeVisible()
  })

  test('详情加载失败后再次选择成功时清理陈旧详情告警并保留启动证据告警', async ({ page }) => {
    let firstOrderDetailRequests = 0
    await page.route('**/api/v1/**', async route => {
      const request = route.request()
      const url = new URL(request.url())
      const method = request.method()

      if (method === 'GET' && url.pathname === '/api/v1/purchase') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'po1',
                orderNumber: 'PO-20260501',
                supplierName: '华东轴承有限公司',
                status: 'Confirmed',
                orderDate: '2026-05-01T00:00:00',
                expectedDeliveryDate: '2026-05-20',
                totalAmount: 45000,
                itemCount: 3,
                createdBy: 'admin',
                createdAt: '2026-05-01T00:00:00',
              },
              {
                id: 'po2',
                orderNumber: 'PO-20260502',
                supplierName: '南方钢材集团',
                status: 'Submitted',
                orderDate: '2026-05-08T00:00:00',
                expectedDeliveryDate: '2026-05-25',
                totalAmount: 128000,
                itemCount: 2,
                createdBy: 'admin',
                createdAt: '2026-05-08T00:00:00',
              },
            ],
            totalCount: 2,
          }),
        })
        return
      }

      if (method === 'GET' && url.pathname === '/api/v1/scheduling/supplier-network-decision/latest') {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'supplier network startup unavailable from chromium' }),
        })
        return
      }

      if (method === 'GET' && url.pathname === '/api/v1/purchase/po1') {
        firstOrderDetailRequests += 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'purchase detail unavailable from chromium' }),
        })
        return
      }

      if (method === 'GET' && url.pathname === '/api/v1/purchase/po2') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'po2',
            orderNumber: 'PO-20260502',
            supplierName: '南方钢材集团',
            supplierContact: '李经理',
            status: 'Submitted',
            orderDate: '2026-05-02T00:00:00',
            expectedDeliveryDate: '2026-05-22',
            totalAmount: 128000,
            completedDate: null,
            remark: null,
            createdBy: 'admin',
            createdAt: '2026-05-02T00:00:00',
            updatedAt: null,
            items: [],
          }),
        })
        return
      }

      await route.fulfill({
        status: method === 'GET' ? 404 : 200,
        contentType: 'application/json',
        body: JSON.stringify(method === 'GET' ? { message: 'not relevant to purchase detail recovery fixture' } : {}),
      })
    })
    await page.addInitScript(() => {
      const originalGetItem = Storage.prototype.getItem
      const originalRemoveItem = Storage.prototype.removeItem
      Storage.prototype.getItem = function getItemWithSupplierNetworkFailure(key: string) {
        if (key === 'aimes_supplier_network_decision') {
          throw new Error('supplier network local fallback unavailable from chromium')
        }
        return originalGetItem.call(this, key)
      }
      Storage.prototype.removeItem = function removeItemWithSupplierNetworkFailure(key: string) {
        if (key === 'aimes_supplier_network_decision') {
          throw new Error('supplier network local cleanup unavailable from chromium')
        }
        return originalRemoveItem.call(this, key)
      }
    })
    await enableLivePurchaseRequest(page)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.po-board', { timeout: 20000 })

    await page.getByRole('option', { name: /PO-20260501/ }).click()
    const alert = page.locator('.purchase-notification')
    await expect(alert).toContainText('供应网络决策同步失败')
    await expect(alert).toContainText('purchase detail unavailable from chromium')

    await page.getByRole('option', { name: /PO-20260502/ }).click()

    await expect(page.locator('.detail-header')).toContainText('PO-20260502')
    await expect(alert).toContainText('供应网络决策同步失败')
    await expect(alert).toContainText('supplier network local fallback unavailable from chromium')
    await expect(alert).not.toContainText('采购订单详情加载失败')
    await expect(alert).not.toContainText('purchase detail unavailable from chromium')
    expect(firstOrderDetailRequests).toBe(1)
  })

  test('列表首次降级后确认采购订单成功仍保留列表告警', async ({ page }) => {
    let listRequests = 0
    let confirmRequests = 0

    await page.route('**/api/v1/**', async route => {
      const request = route.request()
      const url = new URL(request.url())
      const method = request.method()

      if (method === 'GET' && url.pathname === '/api/v1/purchase') {
        listRequests += 1
        if (listRequests === 1) {
          await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'purchase list unavailable from chromium' }),
          })
          return
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'po2',
                orderNumber: 'PO-20260502',
                supplierName: '南方钢材集团',
                status: 'Confirmed',
                orderDate: '2026-05-08T00:00:00',
                expectedDeliveryDate: '2026-05-25',
                totalAmount: 128000,
                itemCount: 0,
                createdBy: 'admin',
                createdAt: '2026-05-08T00:00:00',
              },
            ],
            totalCount: 1,
          }),
        })
        return
      }

      if (method === 'POST' && url.pathname === '/api/v1/purchase/po2/confirm') {
        confirmRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'po2',
            orderNumber: 'PO-20260502',
            supplierName: '南方钢材集团',
            supplierContact: '李经理',
            status: 'Confirmed',
            orderDate: '2026-05-08T00:00:00',
            expectedDeliveryDate: '2026-05-25',
            totalAmount: 128000,
            completedDate: null,
            remark: null,
            createdBy: 'admin',
            createdAt: '2026-05-08T00:00:00',
            updatedAt: '2026-05-08T10:00:00',
            items: [],
          }),
        })
        return
      }

      await route.fulfill({
        status: method === 'GET' ? 404 : 200,
        contentType: 'application/json',
        body: JSON.stringify(method === 'GET' ? { message: 'not relevant to purchase list recovery fixture' } : {}),
      })
    })
    await enableLivePurchaseRequest(page)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.po-board', { timeout: 20000 })

    const alert = page.locator('.purchase-notification')
    await expect(alert).toContainText('采购订单列表加载失败')
    await expect(alert).toContainText('purchase list unavailable from chromium')

    await page.getByRole('option', { name: /PO-20260502/ }).click()
    await expect(page.locator('.detail-header')).toContainText('PO-20260502')
    await page.locator('.act-confirm').click()

    await expect(page.locator('.detail-header .tag')).toHaveText('已确认')
    await expect(alert).toContainText('采购订单列表加载失败')
    await expect(alert).toContainText('purchase list unavailable from chromium')
    expect(confirmRequests).toBe(1)
  })

  test('缺料事件生成采购加急单并回写风险下降', async ({ page }) => {
    const panel = page.locator('.shortage-action-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('M-AL-6061 排产缺口处置')).toBeVisible()
    await expect(panel.getByText('WO-RUSH-9001 / WO-DEMO-1002')).toBeVisible()
    await expect(panel.getByText('待处置')).toBeVisible()

    await panel.getByRole('button', { name: '生成采购加急单' }).click()
    await expect(panel.getByText('已加急')).toBeVisible()
    await expect(panel.getByText('已生成采购加急单')).toBeVisible()
    await expect(page.locator('.list-panel').getByText('PO-RUSH-20260519')).toBeVisible()
    await expect(page.locator('.detail-header').getByRole('heading', { name: 'PO-RUSH-20260519' })).toBeVisible()
    await expect(page.locator('.detail-panel').getByText('华东铝材快供')).toBeVisible()
    await expect(page.locator('.items-table').getByText('M-AL-6061')).toBeVisible()

    await panel.getByRole('button', { name: '模拟加急收货' }).click()
    await expect(panel.getByText('风险下降')).toBeVisible()
    await expect(panel.getByText('采购收货已回写风险')).toBeVisible()
    await expect(panel.getByText(/缺口清零/)).toBeVisible()
    await expect(page.locator('.detail-header').getByText('已完成')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'))
    const eventPanel = page.locator('.event-queue-panel')
    await expect(eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061 齐套缺口' }).getByText('风险下降')).toBeVisible()
    await expect(eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061 齐套缺口' }).getByText('已缓解')).toBeVisible()
    await expect(eventPanel.getByText(/采购收货已回写风险/)).toBeVisible()
    await eventPanel.locator('.event-card').filter({ hasText: 'M-AL-6061 齐套缺口' }).getByRole('button', { name: '复核排产影响' }).click()
    await expect(eventPanel.getByText('缺料缓解后排产复核')).toBeVisible()

    await page.goto(offlineDemoPath('dashboard'))
    await expect(page.locator('.risk-sync-card').getByText('M-AL-6061 缺料已缓解')).toBeVisible()
    await expect(page.locator('.risk-sync-card').getByText(/缺口清零/)).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const purchaseEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'M-AL-6061 加急采购收货已释放缺料风险' })
    await expect(purchaseEvidence.locator('.evidence-topline span').getByText('采购回写', { exact: true })).toBeVisible()
    await expect(purchaseEvidence.locator('code').getByText('PO-RUSH-20260519', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '采购收货回放' }).getByText('1')).toBeVisible()
    const replay = auditPanel.locator('.decision-card').filter({ hasText: '采购回写：M-AL-6061 加急采购收货已释放缺料风险' })
    await expect(replay).toBeVisible()
    await expect(replay.locator('.decision-topline').getByText('采购收货证据')).toBeVisible()
    await replay.getByRole('button', { name: '回放决策链' }).click()
    const detail = auditPanel.locator('.replay-detail')
    await expect(detail.getByText(/采购协同读取 采购协同 \/ 华东铝材快供 的 PO\/替代供应商、到货数量、齐套缺口和受影响工单/)).toBeVisible()
    await expect(detail.getByText(/齐套缺口是否清零、供应风险是否关闭、排产窗口是否可释放/)).toBeVisible()
  })

  test('采购收货后关闭缺料齐套 Agent 治理待办', async ({ page }) => {
    await page.goto(offlineDemoPath('inventory'), { waitUntil: 'commit' })
    await page.waitForSelector('.inv-board', { timeout: 30000 })
    const kittingPanel = page.locator('.kitting-panel')
    await kittingPanel.locator('.order-card').filter({ hasText: 'WO-RUSH-9001' }).getByRole('button', { name: '生成缺料排产事件' }).click()
    await expect(kittingPanel.getByText('缺料事件已同步 AI 排产')).toBeVisible()

    await page.goto(offlineDemoPath('admin'), { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    const pendingPanel = page.locator('.agent-governance-panel')
    await expect(pendingPanel.locator('.agent-metric').filter({ hasText: '缺料齐套治理' }).getByText('1 待处理 / 1 条')).toBeVisible()

    await page.goto(offlineDemoPath('purchase'), { waitUntil: 'commit' })
    await page.waitForSelector('.po-board', { timeout: 30000 })
    const purchasePanel = page.locator('.shortage-action-panel')
    await purchasePanel.getByRole('button', { name: '生成采购加急单' }).click()
    await expect(purchasePanel.getByText('已加急')).toBeVisible()
    await purchasePanel.getByRole('button', { name: '模拟加急收货' }).click()
    await expect(purchasePanel.getByText('风险下降')).toBeVisible()

    await page.goto(offlineDemoPath('admin'), { waitUntil: 'commit' })
    await page.waitForSelector('.admin-board', { timeout: 30000 })
    await page.getByRole('tab', { name: 'Agent 治理' }).click()
    const closedPanel = page.locator('.agent-governance-panel')
    await expect(closedPanel.locator('.agent-metric').filter({ hasText: '缺料齐套治理' }).getByText('0 待处理 / 1 条')).toBeVisible()
    const closedCard = closedPanel.locator('.kitting-governance-card').filter({ hasText: 'M-AL-6061 工单齐套缺口已进入排产复核' })
    await expect(closedCard.getByText('采购收货已齐套')).toBeVisible()
    await expect(closedCard.getByText(/PO-RUSH-20260519 已完成 M-AL-6061 加急收货/)).toBeVisible()
  })

  test('缺料事件可生成替代料建议', async ({ page }) => {
    const panel = page.locator('.shortage-action-panel')
    await panel.getByRole('button', { name: '启用替代料建议' }).click()

    await expect(panel.getByText('已生成替代料建议')).toBeVisible()
    await expect(panel.getByText(/M-AL-6061B 可替代 M-AL-6061/)).toBeVisible()
  })

  test('供应延期升级后锁定替代供应商并进入排产复核和审计', async ({ page }) => {
    const panel = page.locator('.supply-risk-panel')
    await expect(panel.getByRole('heading', { name: '供应延期、替代供应商与排产复核' })).toBeVisible()
    await expect(panel.getByText('PO-20260502')).toBeVisible()
    await expect(panel.getByText('MAT-B02')).toBeVisible()
    await expect(panel.getByText('待识别')).toBeVisible()

    await panel.getByRole('button', { name: '升级供应风险' }).click()
    await expect(panel.locator('.risk-badge').getByText('已升级', { exact: true })).toBeVisible()
    await expect(panel.getByText('供应延期已升级')).toBeVisible()
    await expect(panel.getByText('TRACE-PUR-MAT-B02-SUPPLY-RISK-ESCALATED')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'))
    const eventPanel = page.locator('.event-queue-panel')
    const supplyEvent = eventPanel.locator('.event-card').filter({ hasText: 'MAT-B02 供应延期风险' })
    await expect(supplyEvent.getByText('供应风险')).toBeVisible()
    await expect(supplyEvent.getByText('高风险')).toBeVisible()
    await expect(supplyEvent.getByText('AUD-PUR-SUPPLY-RISK-20260521-001')).toBeVisible()
    await supplyEvent.getByRole('button', { name: '生成重排建议' }).click()
    await expect(eventPanel.getByText('供应延期升级后的排产保护')).toBeVisible()
    await expect(eventPanel.getByText(/评估 华东快供二厂 替代承诺/)).toBeVisible()

    await page.goto(offlineDemoPath('purchase'))
    await page.waitForSelector('.po-board', { timeout: 20000 })
    const reloadedPanel = page.locator('.supply-risk-panel')
    await reloadedPanel.getByRole('button', { name: '锁定替代供应商' }).click()
    await expect(reloadedPanel.locator('.risk-badge').getByText('替代已锁定', { exact: true })).toBeVisible()
    await expect(reloadedPanel.getByText('替代供应商已锁定')).toBeVisible()
    await expect(reloadedPanel.getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-COMMITTED')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'))
    const resolvedSupplyEvent = page.locator('.event-queue-panel .event-card').filter({ hasText: 'MAT-B02 供应延期风险' })
    await expect(resolvedSupplyEvent.getByText('风险下降')).toBeVisible()
    await expect(resolvedSupplyEvent.getByText('已缓解')).toBeVisible()
    await resolvedSupplyEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText('替代供应商承诺后的排产复核')).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'MAT-B02 替代供应商已锁定' })
    await expect(evidence.locator('.evidence-topline span').getByText('供应风险', { exact: true })).toBeVisible()
    await expect(evidence.locator('code').getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-COMMITTED', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '供应风险回放' }).getByText('1')).toBeVisible()
    const replay = auditPanel.locator('.decision-card').filter({ hasText: '供应风险：MAT-B02 替代供应商已锁定' })
    await expect(replay).toBeVisible()
    await expect(replay.locator('.decision-topline').getByText('供应风险证据')).toBeVisible()
    await replay.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail .detail-title span').getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-COMMITTED', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/供应延期、替代供应商承诺、原交期和影响工单/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/冻结窗口、替代承诺、加急到货和排产复核是否闭环/)).toBeVisible()

    await page.goto(offlineDemoPath('purchase'))
    await page.waitForSelector('.po-board', { timeout: 20000 })
    const receivedPanel = page.locator('.supply-risk-panel')
    await receivedPanel.getByRole('button', { name: '确认替代到货' }).click()
    await expect(receivedPanel.locator('.risk-badge').getByText('替代已到货', { exact: true })).toBeVisible()
    await expect(receivedPanel.getByText('替代到货已确认')).toBeVisible()
    await expect(receivedPanel.getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'))
    const closedSupplyEvent = page.locator('.event-queue-panel .event-card').filter({ hasText: 'MAT-B02 供应延期风险' })
    await expect(closedSupplyEvent.getByText('已关闭')).toBeVisible()
    await expect(closedSupplyEvent.getByText('已缓解')).toBeVisible()
    await expect(closedSupplyEvent.getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED')).toBeVisible()
    await closedSupplyEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText('替代供应商到货后的排产释放')).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const receiptEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'MAT-B02 替代供应商到货已确认' })
    await expect(receiptEvidence.locator('.evidence-topline span').getByText('供应到货', { exact: true })).toBeVisible()
    await expect(receiptEvidence.locator('code').getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const receiptAuditPanel = page.locator('.audit-replay-panel')
    await expect(receiptAuditPanel.locator('.metric-chip').filter({ hasText: '采购收货回放' }).getByText('1')).toBeVisible()
    const receiptReplay = receiptAuditPanel.locator('.decision-card').filter({ hasText: '供应到货：MAT-B02 替代供应商到货已确认' })
    await expect(receiptReplay).toBeVisible()
    await expect(receiptReplay.locator('.decision-topline').getByText('采购收货证据')).toBeVisible()
    await receiptReplay.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.audit-replay-panel .replay-detail .detail-title span').getByText('TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED', { exact: true })).toBeVisible()
    await expect(receiptAuditPanel.locator('.replay-detail').getByText(/PO\/替代供应商、到货数量、齐套缺口和受影响工单/)).toBeVisible()
    await expect(receiptAuditPanel.locator('.replay-detail').getByText(/供应风险是否关闭、排产窗口是否可释放/)).toBeVisible()
  })

  test('供应商绩效 SLA 选优进入排产复核和 OTD 审计', async ({ page }) => {
    const panel = page.locator('.supplier-network-panel')
    await expect(panel.getByRole('heading', { name: '供应商绩效、交付 SLA 与多承诺比较' })).toBeVisible()
    await expect(panel.getByText('华东快供二厂')).toBeVisible()
    await expect(panel.getByText('北方精密协作厂')).toBeVisible()
    await expect(panel.getByText('南方钢材集团')).toBeVisible()
    await expect(panel.locator('span').getByText('SLA 违约', { exact: true })).toBeVisible()

    await panel.getByRole('button', { name: '选优供应商并生成 SLA 决策' }).click()
    await expect(panel.getByText('供应网络已选优')).toBeVisible()
    await expect(panel.getByText('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA')).toBeVisible()
    await expect(panel.locator('.supplier-candidate-card.selected').getByText('华东快供二厂')).toBeVisible()
    await expect(panel.getByRole('button', { name: '选优供应商并生成 SLA 决策' })).toBeDisabled()

    await page.goto(offlineDemoPath('scheduling'))
    const supplierNetworkEvent = page.locator('.event-queue-panel .event-card').filter({ hasText: 'MAT-B02 供应商绩效与 SLA 选优' })
    await expect(supplierNetworkEvent.getByText('供应网络')).toBeVisible()
    await expect(supplierNetworkEvent.getByText('已选优')).toBeVisible()
    await expect(supplierNetworkEvent.getByText('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA')).toBeVisible()
    await supplierNetworkEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText('供应商 SLA 选优后的排产复核')).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const evidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: 'MAT-B02 供应商绩效与 SLA 选优已确认' })
    await expect(evidence.locator('.evidence-topline span').getByText('供应网络', { exact: true })).toBeVisible()
    await expect(evidence.locator('code').getByText('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '供应网络回放' }).getByText('1')).toBeVisible()
    const replay = auditPanel.locator('.decision-card').filter({ hasText: '供应网络：MAT-B02 供应商绩效与 SLA 选优已确认' })
    await expect(replay).toBeVisible()
    await expect(replay.locator('.decision-topline').getByText('供应网络证据')).toBeVisible()
    await replay.getByRole('button', { name: '回放决策链' }).click()
    await expect(page.locator('.audit-replay-panel .replay-detail .detail-title span').getByText('TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/供应商绩效、准交率、SLA、报价、产能和违约状态/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/首选恢复供应商、原供应商 SLA 违约和二供观察是否进入复盘/)).toBeVisible()
  })

  test('报表生成的外协承诺可在采购确认到货并释放排产复核', async ({ page }) => {
    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const kpiPanel = page.locator('.otd-kpi-drilldown-panel')
    await kpiPanel.getByRole('tab', { name: '产品族' }).click()
    await kpiPanel.getByRole('button', { name: /法兰盘 DN100/ }).click()
    await kpiPanel.getByRole('button', { name: '生成外协承诺包' }).click()
    await expect(kpiPanel.getByText('TRACE-OUTSOURCING-FLANGE-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('purchase'), { waitUntil: 'commit' })
    await page.waitForSelector('.po-board', { timeout: 20000 })
    const outsourcingPanel = page.locator('.outsourcing-receipt-panel')
    await expect(outsourcingPanel.getByRole('heading', { name: '外协承诺到货确认与排产释放' })).toBeVisible()
    await expect(outsourcingPanel.locator('.outsourcing-receipt-grid').getByText('法兰盘 DN100', { exact: true })).toBeVisible()
    await expect(outsourcingPanel.locator('.outsourcing-receipt-grid').getByText('华东精密外协厂', { exact: true })).toBeVisible()
    await outsourcingPanel.getByRole('button', { name: '确认外协到货' }).click()
    await expect(outsourcingPanel.locator('.risk-badge').getByText('外协到货已确认', { exact: true })).toBeVisible()
    await expect(outsourcingPanel.getByText('TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('scheduling'), { waitUntil: 'commit' })
    await page.waitForSelector('.schedule-board', { timeout: 60000 })
    const outsourcingEvent = page.locator('.event-queue-panel .event-card').filter({ hasText: '法兰盘 DN100 外协到货已确认' })
    await expect(outsourcingEvent.locator('.event-severity').getByText('已到货', { exact: true })).toBeVisible()
    await expect(outsourcingEvent.getByText('已缓解')).toBeVisible()
    await expect(outsourcingEvent.getByText('TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521')).toBeVisible()
    await outsourcingEvent.getByRole('button', { name: '复核排产影响' }).click()
    await expect(page.locator('.agent-suggestion').getByText('外协到货后的排产释放复核')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText(/关闭 WO-DEMO-1013 的厂外等待口径/)).toBeVisible()
    await page.locator('.agent-suggestion').getByRole('button', { name: '采纳此建议' }).click()
    await expect(page.locator('.agent-suggestion').getByText('外协排产释放已确认')).toBeVisible()
    await expect(page.locator('.agent-suggestion').getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')).toBeVisible()
    const releasedOutsourcingEvent = page.locator('.event-queue-panel .event-card').filter({ hasText: '法兰盘 DN100 外协排产释放已确认' })
    await expect(releasedOutsourcingEvent.locator('.event-severity').getByText('已释放', { exact: true })).toBeVisible()
    await expect(releasedOutsourcingEvent.getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521')).toBeVisible()

    await page.goto(offlineDemoPath('report'), { waitUntil: 'commit' })
    await page.waitForSelector('.report-board', { timeout: 60000 })
    const releasedKpiPanel = page.locator('.otd-kpi-drilldown-panel')
    await expect(page.locator('.otd-hero').getByText(/法兰盘 DN100 外协到货和 AI 排产释放已关闭厂外等待口径/)).toBeVisible()
    await expect(page.locator('.metric-tile').filter({ hasText: '延期减少' }).locator('strong')).toHaveText(expectedDelayedOrdersReduced)
    await releasedKpiPanel.getByRole('tab', { name: '产品族' }).click()
    await releasedKpiPanel.getByRole('button', { name: /法兰盘 DN100/ }).click()
    const releasedKpiDetail = releasedKpiPanel.locator('.kpi-drilldown-detail')
    await expect(releasedKpiDetail.getByText('外协已释放')).toBeVisible()
    await expect(releasedKpiDetail.getByText('外协到货 + AI 排产释放')).toBeVisible()
    await expect(releasedKpiDetail.getByText(/当前可以计入已恢复订单/)).toBeVisible()
    const releasedSampleOrder = page.locator('.sample-orders tbody tr').filter({ hasText: 'WO-DEMO-1013' })
    await expect(releasedSampleOrder.getByText('已恢复')).toBeVisible()
    await expect(releasedSampleOrder.getByText('外协到货已释放')).toBeVisible()
    await expect(releasedSampleOrder.getByText('关闭厂外等待并释放排产')).toBeVisible()
    const receiptEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '法兰盘 DN100 外协到货已确认' })
    await expect(receiptEvidence.locator('.evidence-topline span').getByText('外协到货', { exact: true })).toBeVisible()
    await expect(receiptEvidence.locator('code').getByText('TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521', { exact: true })).toBeVisible()
    const releaseEvidence = page.locator('.otd-evidence-chain .evidence-chain-card').filter({ hasText: '法兰盘 DN100 外协排产释放已确认' })
    await expect(releaseEvidence.locator('.evidence-topline span').getByText('外协排产释放', { exact: true })).toBeVisible()
    await expect(releaseEvidence.locator('code').getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521', { exact: true })).toBeVisible()

    await page.goto(offlineDemoPath('audit-logs'), { waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })
    const auditPanel = page.locator('.audit-replay-panel')
    const replay = auditPanel.locator('.decision-card').filter({ hasText: '外协到货：法兰盘 DN100 外协到货已确认' })
    await expect(replay).toBeVisible()
    await expect(replay.locator('.decision-topline').getByText('采购收货证据')).toBeVisible()
    await replay.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail').getByText(/外协到货、采购确认、排产释放复核和 OTD 口径已归档/)).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/关闭厂外等待口径/)).toBeVisible()
    await expect(auditPanel.locator('.metric-chip').filter({ hasText: '外协释放回放' }).getByText('1')).toBeVisible()
    const releaseReplay = auditPanel.locator('.decision-card').filter({ hasText: '外协排产释放：法兰盘 DN100 外协排产释放已确认' })
    await expect(releaseReplay).toBeVisible()
    await expect(releaseReplay.locator('.decision-topline').getByText('排产释放证据')).toBeVisible()
    await releaseReplay.getByRole('button', { name: '回放决策链' }).click()
    await expect(auditPanel.locator('.replay-detail .detail-title span').getByText('TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521', { exact: true })).toBeVisible()
    await expect(auditPanel.locator('.replay-detail').getByText(/外协承诺、采购到货、排产采纳、厂外等待口径关闭和 OTD 口径已归档/)).toBeVisible()
  })
})
