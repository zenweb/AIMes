import { test, expect } from '@playwright/test'

test.describe('Audit 审计决策回放', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
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
      if (url.includes('/api/v1/scheduling/')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }),
      })
    })
    await page.goto('audit-logs')
    await page.waitForSelector('.audit-board', { timeout: 20000 })
  })

  test('展示 AI 建议、人工采纳、重排动作和配置审批回放', async ({ page }) => {
    const panel = page.locator('.audit-replay-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('建议、采纳、重排动作与配置审批可回放')).toBeVisible()
    const cards = panel.locator('.decision-card')
    await expect(cards.filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(cards.filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()
    await expect(cards.filter({ hasText: '锁定期保护从 8 小时调整为 10 小时' })).toBeVisible()
    await expect(panel.getByText('配置审批中')).toBeVisible()
    await expect(panel.getByText('证据链覆盖')).toBeVisible()
  })

  test('回放急单插入决策链', async ({ page }) => {
    const panel = page.locator('.audit-replay-panel')
    await panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' }).getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.getByRole('region', { name: 'WO-RUSH-9001 急单插入重排建议 回放链' })
    await expect(detail.getByText('TRACE-SCH-20260520-001')).toBeVisible()
    await expect(detail.getByText(/风险队列收到 WO-RUSH-9001 客户插单事件/)).toBeVisible()
    await expect(detail.getByText(/调度员填写/)).toBeVisible()
    await expect(detail.getByText(/AI 建议、人工采纳、反馈原因已归档/)).toBeVisible()
  })

  test('业务落库审计接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let auditLogRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      auditLogRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'audit log unavailable from chromium' }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计加载失败')
    await expect(alert).toContainText('audit log unavailable from chromium')
    expect(auditLogRequests).toBeGreaterThan(0)
  })

  test('业务落库审计列表载荷非数组时真实浏览器保留基础回放并告警', async ({ page }) => {
    let malformedAuditListRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('action') === 'AgentExecutePurchaseAction') {
        malformedAuditListRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: { rows: [] },
            totalCount: 1,
            page: 1,
            pageSize: 8,
            totalPages: 1,
          }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/poc-review-signoff/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/agent-config-approvals**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/assistant-action-audits**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计加载失败')
    await expect(alert).toContainText('后端返回非数组审计载荷')
    expect(malformedAuditListRequests).toBeGreaterThan(0)
  })

  test('审计日志列表接口失败时真实浏览器展示本地演示日志 fail-loud', async ({ page }) => {
    let auditLogRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      auditLogRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'audit list unavailable from chromium' }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const board = page.locator('.audit-board')
    const alert = board.locator('.audit-list-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('审计日志列表加载失败')
    await expect(alert).toContainText('已显示本地演示日志')
    await expect(alert).toContainText('audit list unavailable from chromium')
    await expect(board.getByText('operator1')).toBeVisible()
    await expect(board.getByRole('cell', { name: 'Production', exact: true })).toBeVisible()
    expect(auditLogRequests).toBeGreaterThan(0)
  })

  test('审计日志列表载荷非数组时真实浏览器展示本地演示日志 fail-loud', async ({ page }) => {
    let malformedListRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      if (!url.searchParams.has('action')) {
        malformedListRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: { rows: [] },
            totalCount: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const board = page.locator('.audit-board')
    const alert = board.locator('.audit-list-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('审计日志列表加载失败')
    await expect(alert).toContainText('已显示本地演示日志')
    await expect(alert).toContainText('后端返回非数组审计日志载荷')
    await expect(board.getByText('operator1')).toBeVisible()
    await expect(board.getByRole('cell', { name: 'Production', exact: true })).toBeVisible()
    expect(malformedListRequests).toBeGreaterThan(0)
  })

  test('审计日志列表单项载荷坏形状时真实浏览器展示本地演示日志 fail-loud', async ({ page }) => {
    let malformedItemRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      if (!url.searchParams.has('action')) {
        malformedItemRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [{
              id: 'audit-list-item-shape',
              userId: 'operator1',
              resource: 'Production',
              resourceId: 'wo-001',
              createdAt: '2026-06-01T09:00:00.000Z',
            }],
            totalCount: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const board = page.locator('.audit-board')
    const alert = board.locator('.audit-list-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('审计日志列表加载失败')
    await expect(alert).toContainText('已显示本地演示日志')
    await expect(alert).toContainText('audit-list-item-shape 后端返回非对象审计日志载荷')
    await expect(board.getByText('operator1')).toBeVisible()
    await expect(board.getByRole('cell', { name: 'Production', exact: true })).toBeVisible()
    expect(malformedItemRequests).toBeGreaterThan(0)
  })

  test('审计日志详情接口失败时真实浏览器不打开空弹窗并告警', async ({ page }) => {
    let detailRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === 'audit-board-detail-fail') {
        detailRequests += 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'audit detail unavailable from board chromium' }),
        })
        return
      }

      const items = url.searchParams.has('action')
        ? []
        : [{
            id: 'audit-board-detail-fail',
            userId: 'operator1',
            action: 'PUT',
            resource: 'Production',
            resourceId: 'wo-001',
            createdAt: '2026-06-01T09:00:00.000Z',
          }]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 20,
          totalPages: items.length ? 1 : 0,
        }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const board = page.locator('.audit-board')
    await board.getByRole('button', { name: '查看审计日志详情：operator1 更新 Production wo-001' }).click()

    const alert = board.locator('.audit-list-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('审计日志详情加载失败')
    await expect(alert).toContainText('audit detail unavailable from board chromium')
    await expect(board.locator('.detail-modal')).toBeHidden()
    expect(detailRequests).toBeGreaterThan(0)
  })

  test('审计日志详情载荷非详情对象时真实浏览器不打开空弹窗并告警', async ({ page }) => {
    let malformedDetailRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === 'audit-board-detail-shape') {
        malformedDetailRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        })
        return
      }

      const items = url.searchParams.has('action')
        ? []
        : [{
            id: 'audit-board-detail-shape',
            userId: 'operator1',
            action: 'PUT',
            resource: 'Production',
            resourceId: 'wo-001',
            createdAt: '2026-06-01T09:00:00.000Z',
          }]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 20,
          totalPages: items.length ? 1 : 0,
        }),
      })
    })
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const board = page.locator('.audit-board')
    await board.getByRole('button', { name: '查看审计日志详情：operator1 更新 Production wo-001' }).click()

    const alert = board.locator('.audit-list-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('审计日志详情加载失败')
    await expect(alert).toContainText('audit-board-detail-shape 后端返回非对象审计详情载荷')
    await expect(board.locator('.detail-modal')).toBeHidden()
    expect(malformedDetailRequests).toBeGreaterThan(0)
  })

  test('业务落库审计详情失败时真实浏览器保留成功回放并告警', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const successfulDetail = {
      id: 'audit-agent-purchase-ok',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-purchase-ok',
      businessKey: 'PurchaseOrder:po-agent-ok',
      traceId: 'trace-agent-purchase-ok',
      oldValues: null,
      newValues: JSON.stringify({
        actionName: 'ExecutePurchaseAction',
        requestActionName: 'receive-expedited-material',
        reason: 'Agent confirmed expedited supply arrival',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-agent-ok',
          orderNumber: 'PO-DETAIL-OK-001',
          materialCode: 'MAT-DETAIL-6061',
          receivedQuantity: 12,
          status: 'Completed',
        },
      }),
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:20:00.000Z',
    }
    let failedDetailRequests = 0

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === 'audit-agent-purchase-failed') {
        failedDetailRequests += 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'audit detail unavailable from chromium' }),
        })
        return
      }
      if (id === successfulDetail.id) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successfulDetail),
        })
        return
      }

      const action = url.searchParams.get('action')
      const items = action === 'AgentExecutePurchaseAction'
        ? [
            {
              id: successfulDetail.id,
              userId: successfulDetail.userId,
              initiatedBy: successfulDetail.initiatedBy,
              action: successfulDetail.action,
              resource: successfulDetail.resource,
              resourceId: successfulDetail.resourceId,
              businessKey: successfulDetail.businessKey,
              traceId: successfulDetail.traceId,
              createdAt: successfulDetail.createdAt,
            },
            {
              id: 'audit-agent-purchase-failed',
              userId: 'purchase.wang',
              initiatedBy: 'User',
              action: 'AgentExecutePurchaseAction',
              resource: 'scheduling-agent',
              resourceId: 'agent-decision-purchase-failed',
              businessKey: 'PurchaseOrder:po-agent-failed',
              traceId: 'trace-agent-purchase-failed',
              createdAt: '2026-05-25T01:21:00.000Z',
            },
          ]
        : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length > 0 ? 1 : 0,
        }),
      })
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const successfulCard = panel.locator('.decision-card').filter({ hasText: '采购收货落库：PO-DETAIL-OK-001' })
    await expect(successfulCard).toBeVisible()
    await expect(successfulCard.getByText(/MAT-DETAIL-6061 收货 12/)).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计详情加载失败')
    await expect(alert).toContainText('audit detail unavailable from chromium')
    expect(failedDetailRequests).toBeGreaterThan(0)
  })

  test('业务落库审计详情载荷非详情对象时真实浏览器保留成功回放并告警', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const successfulDetail = {
      id: 'audit-agent-detail-shape-ok',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-detail-shape-ok',
      businessKey: 'PurchaseOrder:po-agent-detail-shape-ok',
      traceId: 'trace-agent-detail-shape-ok',
      oldValues: null,
      newValues: JSON.stringify({
        actionName: 'ExecutePurchaseAction',
        requestActionName: 'receive-expedited-material',
        reason: 'Agent confirmed expedited supply arrival before reviewing malformed detail shape',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-agent-detail-shape-ok',
          orderNumber: 'PO-DETAIL-SHAPE-OK-001',
          materialCode: 'MAT-DETAIL-SHAPE-6061',
          receivedQuantity: 14,
          status: 'Completed',
        },
      }),
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:25:00.000Z',
    }
    const malformedDetailId = 'audit-agent-detail-shape-broken'
    let malformedDetailRequests = 0

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === successfulDetail.id) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successfulDetail),
        })
        return
      }
      if (id === malformedDetailId) {
        malformedDetailRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        })
        return
      }

      const action = url.searchParams.get('action')
      const items = action === 'AgentExecutePurchaseAction'
        ? [
            {
              id: successfulDetail.id,
              userId: successfulDetail.userId,
              initiatedBy: successfulDetail.initiatedBy,
              action: successfulDetail.action,
              resource: successfulDetail.resource,
              resourceId: successfulDetail.resourceId,
              businessKey: successfulDetail.businessKey,
              traceId: successfulDetail.traceId,
              createdAt: successfulDetail.createdAt,
            },
            {
              id: malformedDetailId,
              userId: 'purchase.wang',
              initiatedBy: 'User',
              action: 'AgentExecutePurchaseAction',
              resource: 'scheduling-agent',
              resourceId: 'agent-decision-detail-shape-broken',
              businessKey: 'PurchaseOrder:po-agent-detail-shape-broken',
              traceId: 'trace-agent-detail-shape-broken',
              createdAt: '2026-05-25T01:26:00.000Z',
            },
          ]
        : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length ? 1 : 0,
        }),
      })
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const successfulCard = panel.locator('.decision-card').filter({ hasText: '采购收货落库：PO-DETAIL-SHAPE-OK-001' })
    await expect(successfulCard).toBeVisible()
    await expect(successfulCard.getByText(/MAT-DETAIL-SHAPE-6061 收货 14/)).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计详情加载失败')
    await expect(alert).toContainText('audit-agent-detail-shape-broken 后端返回非对象审计载荷')
    expect(malformedDetailRequests).toBeGreaterThan(0)
  })

  test('业务落库审计载荷损坏时真实浏览器保留成功回放并告警', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const successfulDetail = {
      id: 'audit-agent-payload-ok',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-payload-ok',
      businessKey: 'PurchaseOrder:po-agent-payload-ok',
      traceId: 'trace-agent-payload-ok',
      oldValues: null,
      newValues: JSON.stringify({
        actionName: 'ExecutePurchaseAction',
        requestActionName: 'receive-expedited-material',
        reason: 'Agent confirmed expedited supply arrival before reviewing malformed payload evidence',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-agent-payload-ok',
          orderNumber: 'PO-PAYLOAD-OK-001',
          materialCode: 'MAT-PAYLOAD-6061',
          receivedQuantity: 16,
          status: 'Completed',
        },
      }),
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:30:00.000Z',
    }
    const malformedDetail = {
      id: 'audit-agent-payload-broken',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-payload-broken',
      businessKey: 'PurchaseOrder:po-agent-payload-broken',
      traceId: 'trace-agent-payload-broken',
      oldValues: null,
      newValues: '{broken-business-write-payload',
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:31:00.000Z',
    }
    let malformedDetailRequests = 0

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === successfulDetail.id) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successfulDetail),
        })
        return
      }
      if (id === malformedDetail.id) {
        malformedDetailRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(malformedDetail),
        })
        return
      }

      const action = url.searchParams.get('action')
      const items = action === 'AgentExecutePurchaseAction'
        ? [
            {
              id: successfulDetail.id,
              userId: successfulDetail.userId,
              initiatedBy: successfulDetail.initiatedBy,
              action: successfulDetail.action,
              resource: successfulDetail.resource,
              resourceId: successfulDetail.resourceId,
              businessKey: successfulDetail.businessKey,
              traceId: successfulDetail.traceId,
              createdAt: successfulDetail.createdAt,
            },
            {
              id: malformedDetail.id,
              userId: malformedDetail.userId,
              initiatedBy: malformedDetail.initiatedBy,
              action: malformedDetail.action,
              resource: malformedDetail.resource,
              resourceId: malformedDetail.resourceId,
              businessKey: malformedDetail.businessKey,
              traceId: malformedDetail.traceId,
              createdAt: malformedDetail.createdAt,
            },
          ]
        : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length ? 1 : 0,
        }),
      })
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const successfulCard = panel.locator('.decision-card').filter({ hasText: '采购收货落库：PO-PAYLOAD-OK-001' })
    await expect(successfulCard).toBeVisible()
    await successfulCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('trace-agent-payload-ok', { exact: true })).toBeVisible()
    await expect(detail.getByText(/业务写入 purchase-order：po-agent-payload-ok \/ MAT-PAYLOAD-6061 \/ 收货 16/)).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计详情加载失败')
    await expect(alert).toContainText('audit-agent-payload-broken 审计载荷解析失败')
    expect(malformedDetailRequests).toBeGreaterThan(0)
  })

  test('业务落库审计资源未知时真实浏览器保留成功回放并告警', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const successfulDetail = {
      id: 'audit-agent-resource-ok',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-resource-ok',
      businessKey: 'PurchaseOrder:po-agent-resource-ok',
      traceId: 'trace-agent-resource-ok',
      oldValues: null,
      newValues: JSON.stringify({
        actionName: 'ExecutePurchaseAction',
        requestActionName: 'receive-expedited-material',
        reason: 'Agent confirmed expedited supply arrival before reviewing unsupported resource evidence',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-agent-resource-ok',
          orderNumber: 'PO-RESOURCE-OK-001',
          materialCode: 'MAT-RESOURCE-6061',
          receivedQuantity: 18,
          status: 'Completed',
        },
      }),
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:32:00.000Z',
    }
    const unsupportedDetail = {
      id: 'audit-agent-resource-unsupported',
      userId: 'warehouse.zhao',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-resource-unsupported',
      businessKey: 'WarehouseTransfer:wt-agent-unsupported',
      traceId: 'trace-agent-resource-unsupported',
      oldValues: null,
      newValues: JSON.stringify({
        actionName: 'ExecutePurchaseAction',
        requestActionName: 'transfer-warehouse-stock',
        reason: 'Agent attempted unsupported warehouse transfer evidence',
        businessWrite: {
          resource: 'warehouse-transfer',
          materialCode: 'MAT-RESOURCE-6061',
          receivedQuantity: 9,
          status: 'Transferred',
        },
      }),
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:33:00.000Z',
    }
    let unsupportedDetailRequests = 0

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === successfulDetail.id) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successfulDetail),
        })
        return
      }
      if (id === unsupportedDetail.id) {
        unsupportedDetailRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(unsupportedDetail),
        })
        return
      }

      const action = url.searchParams.get('action')
      const items = action === 'AgentExecutePurchaseAction'
        ? [
            {
              id: successfulDetail.id,
              userId: successfulDetail.userId,
              initiatedBy: successfulDetail.initiatedBy,
              action: successfulDetail.action,
              resource: successfulDetail.resource,
              resourceId: successfulDetail.resourceId,
              businessKey: successfulDetail.businessKey,
              traceId: successfulDetail.traceId,
              createdAt: successfulDetail.createdAt,
            },
            {
              id: unsupportedDetail.id,
              userId: unsupportedDetail.userId,
              initiatedBy: unsupportedDetail.initiatedBy,
              action: unsupportedDetail.action,
              resource: unsupportedDetail.resource,
              resourceId: unsupportedDetail.resourceId,
              businessKey: unsupportedDetail.businessKey,
              traceId: unsupportedDetail.traceId,
              createdAt: unsupportedDetail.createdAt,
            },
          ]
        : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length ? 1 : 0,
        }),
      })
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const successfulCard = panel.locator('.decision-card').filter({ hasText: '采购收货落库：PO-RESOURCE-OK-001' })
    await expect(successfulCard).toBeVisible()
    await successfulCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('trace-agent-resource-ok', { exact: true })).toBeVisible()
    await expect(detail.getByText(/业务写入 purchase-order：po-agent-resource-ok \/ MAT-RESOURCE-6061 \/ 收货 18/)).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计详情加载失败')
    await expect(alert).toContainText('audit-agent-resource-unsupported 不支持的业务落库资源：warehouse-transfer')
    expect(unsupportedDetailRequests).toBeGreaterThan(0)
  })

  test('业务落库审计载荷缺失时真实浏览器保留成功回放并告警', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const successfulDetail = {
      id: 'audit-agent-missing-payload-ok',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-missing-payload-ok',
      businessKey: 'PurchaseOrder:po-agent-missing-payload-ok',
      traceId: 'trace-agent-missing-payload-ok',
      oldValues: null,
      newValues: JSON.stringify({
        actionName: 'ExecutePurchaseAction',
        requestActionName: 'receive-expedited-material',
        reason: 'Agent confirmed expedited supply arrival before reviewing missing payload evidence',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-agent-missing-payload-ok',
          orderNumber: 'PO-MISSING-PAYLOAD-OK-001',
          materialCode: 'MAT-MISSING-PAYLOAD-6061',
          receivedQuantity: 20,
          status: 'Completed',
        },
      }),
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:34:00.000Z',
    }
    const missingPayloadDetail = {
      id: 'audit-agent-missing-payload',
      userId: 'purchase.wang',
      initiatedBy: 'User',
      action: 'AgentExecutePurchaseAction',
      resource: 'scheduling-agent',
      resourceId: 'agent-decision-missing-payload',
      businessKey: 'PurchaseOrder:po-agent-missing-payload',
      traceId: 'trace-agent-missing-payload',
      oldValues: null,
      newValues: null,
      promptHash: 'prompt-hash',
      contextHash: 'context-hash',
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-05-25T01:35:00.000Z',
    }
    let missingPayloadDetailRequests = 0

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').at(-1)
      if (id === successfulDetail.id) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successfulDetail),
        })
        return
      }
      if (id === missingPayloadDetail.id) {
        missingPayloadDetailRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(missingPayloadDetail),
        })
        return
      }

      const action = url.searchParams.get('action')
      const items = action === 'AgentExecutePurchaseAction'
        ? [
            {
              id: successfulDetail.id,
              userId: successfulDetail.userId,
              initiatedBy: successfulDetail.initiatedBy,
              action: successfulDetail.action,
              resource: successfulDetail.resource,
              resourceId: successfulDetail.resourceId,
              businessKey: successfulDetail.businessKey,
              traceId: successfulDetail.traceId,
              createdAt: successfulDetail.createdAt,
            },
            {
              id: missingPayloadDetail.id,
              userId: missingPayloadDetail.userId,
              initiatedBy: missingPayloadDetail.initiatedBy,
              action: missingPayloadDetail.action,
              resource: missingPayloadDetail.resource,
              resourceId: missingPayloadDetail.resourceId,
              businessKey: missingPayloadDetail.businessKey,
              traceId: missingPayloadDetail.traceId,
              createdAt: missingPayloadDetail.createdAt,
            },
          ]
        : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length ? 1 : 0,
        }),
      })
    })

    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const successfulCard = panel.locator('.decision-card').filter({ hasText: '采购收货落库：PO-MISSING-PAYLOAD-OK-001' })
    await expect(successfulCard).toBeVisible()
    await successfulCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('trace-agent-missing-payload-ok', { exact: true })).toBeVisible()
    await expect(detail.getByText(/业务写入 purchase-order：po-agent-missing-payload-ok \/ MAT-MISSING-PAYLOAD-6061 \/ 收货 20/)).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('业务落库审计详情加载失败')
    await expect(alert).toContainText('audit-agent-missing-payload 审计载荷缺失')
    expect(missingPayloadDetailRequests).toBeGreaterThan(0)
  })

  test('POC 证据治理接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let pocEvidenceRequests = 0
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      pocEvidenceRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'poc order evidence unavailable from chromium' }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      pocEvidenceRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'poc equipment evidence unavailable from chromium' }),
      })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_customer_order_import')
      localStorage.removeItem('aimes_customer_equipment_fault_evidence')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('POC 证据治理加载失败')
    await expect(alert).toContainText('poc order evidence unavailable from chromium')
    expect(pocEvidenceRequests).toBeGreaterThan(0)
  })

  test('知识治理接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let knowledgeGovernanceRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      knowledgeGovernanceRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'knowledge governance unavailable from chromium' }),
      })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_customer_order_import')
      localStorage.removeItem('aimes_customer_equipment_fault_evidence')
      localStorage.removeItem('aimes_knowledge_governance_reviews')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('知识治理加载失败')
    await expect(alert).toContainText('knowledge governance unavailable from chromium')
    expect(knowledgeGovernanceRequests).toBeGreaterThan(0)
  })

  test('质量灰度决策接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let grayDecisionRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('evidenceType') === 'QualityKnowledgeGrayReleaseDecision') {
        grayDecisionRequests += 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'quality gray release unavailable from chromium' }),
        })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_customer_order_import')
      localStorage.removeItem('aimes_customer_equipment_fault_evidence')
      localStorage.removeItem('aimes_knowledge_governance_reviews')
      localStorage.removeItem('aimes_quality_knowledge_recommendation_feedback')
      localStorage.removeItem('aimes_quality_knowledge_retraining_versions')
      localStorage.removeItem('aimes_quality_knowledge_gray_release_decisions')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量灰度决策加载失败')
    await expect(alert).toContainText('quality gray release unavailable from chromium')
    expect(grayDecisionRequests).toBeGreaterThan(0)
  })

  test('质量灰度决策载荷非数组时真实浏览器保留基础回放并告警', async ({ page }) => {
    let grayDecisionRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('evidenceType') === 'QualityKnowledgeGrayReleaseDecision') {
        grayDecisionRequests += 1
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_customer_order_import')
      localStorage.removeItem('aimes_customer_equipment_fault_evidence')
      localStorage.removeItem('aimes_knowledge_governance_reviews')
      localStorage.removeItem('aimes_quality_knowledge_recommendation_feedback')
      localStorage.removeItem('aimes_quality_knowledge_retraining_versions')
      localStorage.removeItem('aimes_quality_knowledge_gray_release_decisions')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量灰度决策加载失败')
    await expect(alert).toContainText('后端返回非数组审计载荷')
    expect(grayDecisionRequests).toBeGreaterThan(0)
  })

  test('质量推荐反馈接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let recommendationFeedbackRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('evidenceType') === 'QualityKnowledgeRecommendationFeedback') {
        recommendationFeedbackRequests += 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'quality recommendation feedback unavailable from chromium' }),
        })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_customer_order_import')
      localStorage.removeItem('aimes_customer_equipment_fault_evidence')
      localStorage.removeItem('aimes_knowledge_governance_reviews')
      localStorage.removeItem('aimes_quality_knowledge_recommendation_feedback')
      localStorage.removeItem('aimes_quality_knowledge_retraining_versions')
      localStorage.removeItem('aimes_quality_knowledge_gray_release_decisions')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量推荐反馈加载失败')
    await expect(alert).toContainText('quality recommendation feedback unavailable from chromium')
    expect(recommendationFeedbackRequests).toBeGreaterThan(0)
  })

  test('质量再训练版本接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let retrainingVersionRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('evidenceType') === 'QualityKnowledgeRetrainingVersion') {
        retrainingVersionRequests += 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'quality retraining version unavailable from chromium' }),
        })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_customer_order_import')
      localStorage.removeItem('aimes_customer_equipment_fault_evidence')
      localStorage.removeItem('aimes_knowledge_governance_reviews')
      localStorage.removeItem('aimes_quality_knowledge_recommendation_feedback')
      localStorage.removeItem('aimes_quality_knowledge_retraining_versions')
      localStorage.removeItem('aimes_quality_knowledge_gray_release_decisions')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('质量再训练版本加载失败')
    await expect(alert).toContainText('quality retraining version unavailable from chromium')
    expect(retrainingVersionRequests).toBeGreaterThan(0)
  })

  test('回放客户 POC 证据导入与设备故障样例链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_customer_order_import', JSON.stringify({
        batchId: 'IMP-POC-WO-20260520-001',
        fileName: '客户真实工单导入样例_30单.csv',
        source: '客户 IT / ERP 导出样例',
        importedOrders: 30,
        highRiskOrders: 6,
        mappedFields: ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'],
        preparedAt: '2026-05-20T09:30:00.000Z',
      }))
      localStorage.setItem('aimes_customer_equipment_fault_evidence', JSON.stringify({
        batchId: 'IMP-POC-EQ-FAULT-20260520-001',
        fileName: '客户真实设备故障样例_CNC-001.csv',
        source: '客户设备联网平台 / 点检历史导出',
        equipmentCode: 'CNC-001',
        faultSamples: 12,
        affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
        downtimeHours: 4,
        capturedSignals: ['主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'],
        preparedAt: '2026-05-20T09:35:00.000Z',
      }))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('POC 证据回放')).toBeVisible()
    const cards = panel.locator('.decision-card')
    await expect(cards.filter({ hasText: '客户工单导入样例治理' })).toBeVisible()
    await expect(cards.filter({ hasText: '客户设备故障样例治理' })).toBeVisible()

    const equipmentFaultCard = cards.filter({ hasText: '客户设备故障样例治理' })
    await equipmentFaultCard.scrollIntoViewIfNeeded()
    await equipmentFaultCard.getByRole('button', { name: '回放决策链' }).click()
    const detail = panel.locator('.replay-detail')
    await expect(detail.getByRole('heading', { name: '客户设备故障样例治理 回放链' })).toBeVisible({ timeout: 15000 })
    await expect(detail.getByText('AUD-POC-EQ-001')).toBeVisible()
    await expect(detail.getByText(/客户设备联网平台/)).toBeVisible()
    await expect(detail.getByText(/同步进入 AI 排产事件队列/)).toBeVisible()
    await expect(detail.getByText(/客户设备故障样例、停机事件、排产影响和 POC 评分回写已归档/)).toBeVisible()
  })

  test('回放统一 OTD 复盘证据链', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'purchase-receipt-PO-RUSH-20260519',
          stage: '采购回写',
          title: 'M-AL-6061 加急采购收货已释放缺料风险',
          summary: 'PO-RUSH-20260519 收货完成，WO-RUSH-9001 / WO-DEMO-1002 的齐套缺口清零。',
          object: 'WO-RUSH-9001 / WO-DEMO-1002',
          source: '采购协同 / 华东铝材快供',
          traceId: 'PO-RUSH-20260519',
          status: 'closed',
          statusLabel: '已收货',
          createdAt: '2026-05-20T10:05:00.000Z',
        },
        {
          id: 'production-completion-op-020',
          stage: '生产完工',
          title: 'WO-DEMO-1001 CNC 精加工 完工回写',
          summary: '10 件完工，工单进度更新为 100%，质检结果 Pass。',
          object: 'WO-DEMO-1001',
          source: '生产报工 / admin',
          traceId: 'TRACE-PROD-COMPLETE-OP-020',
          status: 'closed',
          statusLabel: 'OTD 达成',
          createdAt: '2026-05-20T10:20:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('OTD 证据回放')).toBeVisible()
    const cards = panel.locator('.decision-card')
    const productionCard = cards.filter({ hasText: '生产完工：WO-DEMO-1001 CNC 精加工 完工回写' })
    await expect(productionCard).toBeVisible()
    await expect(productionCard.getByText('TRACE-PROD-COMPLETE-OP-020')).toBeVisible()
    await productionCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-PROD-COMPLETE-OP-020', { exact: true })).toBeVisible()
    await expect(detail.getByText(/生产完工 阶段生成执行证据/)).toBeVisible()
    await expect(detail.getByText(/当前状态为 OTD 达成，审计回放要求核对排产页复核、质量门放行和承诺交期是否仍成立/)).toBeVisible()
    await expect(detail.getByText(/留痕状态：生产完工、工单进度、质量联动、排产复核和 OTD 证据已归档/)).toBeVisible()
  })

  test('OTD 本地证据链损坏时真实浏览器保留基础回放并告警', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'true')
      localStorage.setItem('aimes_otd_evidence_chain', '{bad json')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('OTD 证据链加载失败')
    await expect(alert).toContainText('本地审计证据链载荷损坏')
    const otdMetric = panel.locator('.metric-chip').filter({ hasText: 'OTD 证据回放' })
    await expect(otdMetric.locator('strong')).toHaveText('0')
    await expect(panel.locator('.decision-card').filter({ hasText: 'OTD 证据链' })).not.toBeVisible()
    await expect(page.evaluate(() => localStorage.getItem('aimes_otd_evidence_chain'))).resolves.toBeNull()
  })

  test('回放后端 Agent execute 业务落库证据', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const auditDetails = {
      'audit-agent-purchase-1': {
        id: 'audit-agent-purchase-1',
        userId: 'purchase.wang',
        initiatedBy: 'User',
        action: 'AgentExecutePurchaseAction',
        resource: 'scheduling-agent',
        resourceId: 'agent-decision-purchase-1',
        businessKey: 'PurchaseOrder:po-agent-1',
        traceId: 'trace-agent-purchase-1',
        oldValues: null,
        newValues: JSON.stringify({
          actionName: 'ExecutePurchaseAction',
          requestActionName: 'receive-expedited-material',
          reason: 'Agent confirmed expedited supply arrival',
          businessWrite: {
            resource: 'purchase-order',
            purchaseOrderId: 'po-agent-1',
            orderNumber: 'PO-AGENT-001',
            materialCode: 'MAT-AGENT-6061',
            receivedQuantity: 10,
            status: 'Completed',
          },
        }),
        promptHash: 'prompt-hash',
        contextHash: 'context-hash',
        ipAddress: null,
        userAgent: null,
        createdAt: '2026-05-25T01:20:00.000Z',
      },
      'audit-agent-quality-1': {
        id: 'audit-agent-quality-1',
        userId: 'qc.zhang',
        initiatedBy: 'User',
        action: 'AgentExecuteQualityDisposition',
        resource: 'scheduling-agent',
        resourceId: 'agent-decision-quality-1',
        businessKey: 'QualityInspection:insp-agent-1',
        traceId: 'trace-agent-quality-1',
        oldValues: null,
        newValues: JSON.stringify({
          actionName: 'ExecuteQualityDisposition',
          requestActionName: 'record-defect-and-capa',
          reason: 'Agent confirmed MRB disposition should be recorded',
          businessWrite: {
            resource: 'quality-inspection',
            inspectionId: 'insp-agent-1',
            result: 'Failed',
            defectType: '尺寸超差',
            quantity: 2,
            severity: 'Major',
          },
        }),
        promptHash: 'prompt-hash',
        contextHash: 'context-hash',
        ipAddress: null,
        userAgent: null,
        createdAt: '2026-05-25T01:25:00.000Z',
      },
      'audit-agent-equipment-1': {
        id: 'audit-agent-equipment-1',
        userId: 'equipment.liu',
        initiatedBy: 'User',
        action: 'AgentExecuteMaintenanceAction',
        resource: 'scheduling-agent',
        resourceId: 'agent-decision-equipment-1',
        businessKey: 'Equipment:eq-agent-1',
        traceId: 'trace-agent-equipment-1',
        oldValues: null,
        newValues: JSON.stringify({
          actionName: 'ExecuteMaintenanceAction',
          requestActionName: 'switch-equipment-maintenance',
          reason: 'Agent confirmed maintenance window should be locked',
          businessWrite: {
            resource: 'equipment',
            equipmentId: 'eq-agent-1',
            equipmentCode: 'CNC-AGENT-01',
            targetStatus: 'Maintenance',
          },
        }),
        promptHash: 'prompt-hash',
        contextHash: 'context-hash',
        ipAddress: null,
        userAgent: null,
        createdAt: '2026-05-25T01:30:00.000Z',
      },
    } as const
    const auditListByAction = {
      AgentExecutePurchaseAction: ['audit-agent-purchase-1'],
      AgentExecuteQualityDisposition: ['audit-agent-quality-1'],
      AgentExecuteMaintenanceAction: ['audit-agent-equipment-1'],
    } as const

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const parts = url.pathname.split('/')
      const id = parts[parts.length - 1]
      if (id in auditDetails) {
        const detail = auditDetails[id as keyof typeof auditDetails]
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(detail),
        })
        return
      }

      const action = url.searchParams.get('action')
      const ids = action && action in auditListByAction
        ? auditListByAction[action as keyof typeof auditListByAction]
        : []
      const items = ids.map(itemId => {
        const detail = auditDetails[itemId]
        return {
          id: detail.id,
          userId: detail.userId,
          initiatedBy: detail.initiatedBy,
          action: detail.action,
          resource: detail.resource,
          resourceId: detail.resourceId,
          businessKey: detail.businessKey,
          traceId: detail.traceId,
          createdAt: detail.createdAt,
        }
      })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length > 0 ? 1 : 0,
        }),
      })
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('业务落库回放')).toBeVisible()
    const card = panel.locator('.decision-card').filter({ hasText: '采购收货落库：PO-AGENT-001' })
    await expect(card).toBeVisible()
    await expect(card.getByText(/MAT-AGENT-6061 收货 10/)).toBeVisible()
    await card.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('trace-agent-purchase-1', { exact: true })).toBeVisible()
    await expect(detail.getByText(/业务写入 purchase-order：po-agent-1 \/ MAT-AGENT-6061 \/ 收货 10/)).toBeVisible()
    await expect(detail.getByText(/PurchaseOrder.Receive、AgentActionResult 和 AuditLog 已归档/)).toBeVisible()
    const purchaseLink = detail.getByRole('link', { name: '打开采购协同' })
    await expect(purchaseLink).toBeVisible()
    await purchaseLink.click()
    await expect(page.locator('.audit-focus-banner').getByText('PO-AGENT-001')).toBeVisible()
    await expect(page.locator('.audit-focus-banner').getByText('po-agent-1')).toBeVisible()
    await expect(page.locator('.detail-header').getByText('PO-AGENT-001')).toBeVisible()
    await page.goto('audit-logs')
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    await expect(panel.getByText('业务落库回放')).toBeVisible()
    const qualityCard = panel.locator('.decision-card').filter({ hasText: '质量处置落库：insp-agent-1' })
    await expect(qualityCard).toBeVisible()
    await expect(qualityCard.getByText(/尺寸超差 2 件/)).toBeVisible()
    await qualityCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('trace-agent-quality-1', { exact: true })).toBeVisible()
    await expect(detail.getByText(/业务写入 quality-inspection：insp-agent-1，缺陷 尺寸超差 \/ 数量 2/)).toBeVisible()
    await expect(detail.getByText(/QualityInspection.RecordDefect、AgentActionResult 和 AuditLog 已归档/)).toBeVisible()
    const qualityLink = detail.getByRole('link', { name: '打开质量闭环' })
    await expect(qualityLink).toBeVisible()
    await qualityLink.click()
    await expect(page.locator('.audit-focus-banner strong')).toHaveText('insp-agent-1')
    await expect(page.locator('.analysis-header').getByText('insp-agent-1')).toBeVisible()
    await page.goto('audit-logs')
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    await expect(panel.getByText('业务落库回放')).toBeVisible()
    const equipmentCard = panel.locator('.decision-card').filter({ hasText: '设备状态落库：CNC-AGENT-01' })
    await expect(equipmentCard).toBeVisible()
    await expect(equipmentCard.getByText(/状态切换为 Maintenance/)).toBeVisible()
    await equipmentCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('trace-agent-equipment-1', { exact: true })).toBeVisible()
    await expect(detail.getByText(/业务写入 equipment：eq-agent-1 \/ CNC-AGENT-01/)).toBeVisible()
    await expect(detail.getByText(/Equipment.TransitionTo、AgentActionResult 和 AuditLog 已归档/)).toBeVisible()
    const equipmentLink = detail.getByRole('link', { name: '打开设备维护' })
    await expect(equipmentLink).toBeVisible()
    await equipmentLink.click()
    await expect(page.locator('.audit-focus-banner').getByText('CNC-AGENT-01')).toBeVisible()
    await expect(page.locator('.audit-focus-banner').getByText('eq-agent-1')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'CNC-AGENT-01 审计定位设备' })).toBeVisible()
  })

  test('真实浏览器回放排产采纳反馈审计原因说明', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('aimes_offline_demo', 'false'))

    const scheduleFeedbackDetail = {
      id: 'audit-schedule-feedback-1',
      userId: 'planner.li',
      initiatedBy: null,
      action: 'ScheduleAdoptionFeedbackUpsert',
      resource: 'schedule-adoption-feedback',
      resourceId: 'feedback-1',
      businessKey: 'SchedulePlan:plan-1',
      traceId: 'TRACE-SCHEDULE-FEEDBACK-1',
      oldValues: null,
      newValues: JSON.stringify({
        Id: 'feedback-1',
        SchedulePlanId: 'plan-1',
        WorkshopId: 'WS-001',
        OptimizationObjective: 'balanced',
        Decision: 'accepted',
        DecisionLabel: '已采纳 Agent 排产建议',
        ReasonCategory: 'UrgentInsertion',
        CategoryLabel: '紧急插单',
        ReasonDetail: '急单插入后采纳综合平衡方案',
        ObjectiveLabel: '综合平衡',
        OperatorUser: 'planner.li',
        AiTraceId: 'TRACE-SCHEDULE-FEEDBACK-1',
        AgentDecisionId: 'decision-1',
        CreatedAt: '2026-06-14T10:15:00Z',
      }),
      promptHash: null,
      contextHash: null,
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-06-14T10:15:00.000Z',
    }

    await page.route('**/api/v1/audit-logs**', async route => {
      const url = new URL(route.request().url())
      const parts = url.pathname.split('/')
      const id = parts[parts.length - 1]
      if (id === scheduleFeedbackDetail.id) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(scheduleFeedbackDetail),
        })
        return
      }

      const action = url.searchParams.get('action')
      const items = action === 'ScheduleAdoptionFeedbackUpsert'
        ? [{
            id: scheduleFeedbackDetail.id,
            userId: scheduleFeedbackDetail.userId,
            initiatedBy: scheduleFeedbackDetail.initiatedBy,
            action: scheduleFeedbackDetail.action,
            resource: scheduleFeedbackDetail.resource,
            resourceId: scheduleFeedbackDetail.resourceId,
            businessKey: scheduleFeedbackDetail.businessKey,
            traceId: scheduleFeedbackDetail.traceId,
            createdAt: scheduleFeedbackDetail.createdAt,
          }]
        : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: items.length,
          page: 1,
          pageSize: 8,
          totalPages: items.length > 0 ? 1 : 0,
        }),
      })
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('排产反馈回放')).toBeVisible()
    const card = panel.locator('.decision-card').filter({ hasText: '排产采纳反馈：已采纳 Agent 排产建议' })
    await expect(card).toBeVisible()
    await expect(card.getByText(/紧急插单：急单插入后采纳综合平衡方案/)).toBeVisible()
    await card.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-SCHEDULE-FEEDBACK-1', { exact: true })).toBeVisible()
    await expect(detail.getByText(/原因分类 紧急插单，优化目标 综合平衡/)).toBeVisible()
    await expect(detail.getByText(/调度员填写原因说明：急单插入后采纳综合平衡方案/)).toBeVisible()
    await expect(detail.getByText(/排产采纳反馈、原因说明、优化目标和审计日志已归档/)).toBeVisible()
    const scheduleLink = detail.getByRole('link', { name: '打开AI 排产' })
    await expect(scheduleLink).toBeVisible()
    await scheduleLink.click()
    await expect(page).toHaveURL(/\/scheduling/)
  })

  test('回放关键配置审批通过链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
        {
          id: 'cfg-lock-window',
          status: 'approved',
          decidedBy: 'admin',
          decidedAt: '2026-05-20T10:45:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const approvalCard = panel.locator('.decision-card').filter({ hasText: '配置审批：锁定期保护从 8 小时调整为 10 小时' })
    await expect(approvalCard.getByText(/当前状态：已通过/)).toBeVisible()
    await approvalCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-CFG-20260520-002', { exact: true })).toBeVisible()
    await expect(detail.getByText(/admin 审批通过/)).toBeVisible()
    await expect(detail.getByText(/关键配置审批通过，变更已进入配置审计/)).toBeVisible()
  })

  test('回放质量推荐实验扩大门禁审批链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
        {
          id: 'cfg-quality-experiment-gate',
          status: 'approved',
          decidedBy: '质量主管 刘工',
          decidedAt: '2026-05-21T18:45:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const approvalCard = panel.locator('.decision-card').filter({ hasText: '配置审批：质量推荐实验扩大门禁复验通过率从 100% 调整为 95%' })
    await expect(approvalCard.getByText(/当前状态：已通过/)).toBeVisible()
    await approvalCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001', { exact: true })).toBeVisible()
    await expect(detail.getByText(/系统识别为影响质量推荐实验策略的关键配置/)).toBeVisible()
    await expect(detail.getByText(/门禁指标调整：推荐采纳率 100% -> 100% \/ 复验通过率 100% -> >=95% \/ 负样本误召回 0 次 -> 0 次/)).toBeVisible()
    await expect(detail.getByText(/R4\/R6\/R7 扩大灰度必须同时满足推荐采纳率 100%、复验通过率 >=95%、负样本误召回 0 次/)).toBeVisible()
    await expect(detail.getByText(/质量主管 刘工 审批通过/)).toBeVisible()
  })

  test('配置审批接口失败时真实浏览器保留基础回放并告警', async ({ page }) => {
    let approvalRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/poc-review-signoff/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/agent-config-approvals**', async route => {
      approvalRequests += 1
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'agent config approvals unavailable from chromium' }),
      })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_agent_config_approvals')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.approval-badge')).toHaveText('0 个配置待审批')

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('配置审批加载失败')
    await expect(alert).toContainText('agent config approvals unavailable from chromium')
    expect(approvalRequests).toBeGreaterThan(0)
  })

  test('配置审批载荷非数组时真实浏览器保留基础回放并告警', async ({ page }) => {
    let approvalRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/poc-review-signoff/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/agent-config-approvals**', async route => {
      approvalRequests += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.route('**/api/v1/scheduling/assistant-action-audits**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_agent_config_approvals')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.approval-badge')).toHaveText('0 个配置待审批')

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('配置审批加载失败')
    await expect(alert).toContainText('后端返回非数组审计载荷')
    expect(approvalRequests).toBeGreaterThan(0)
  })

  test('助手动作审计载荷非数组时真实浏览器保留基础回放并告警', async ({ page }) => {
    let assistantAuditRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/assistant-action-audits**', async route => {
      assistantAuditRequests += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/poc-review-signoff/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/agent-config-approvals**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_assistant_action_audits')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('助手动作审计加载失败')
    await expect(alert).toContainText('后端返回非数组审计载荷')
    expect(assistantAuditRequests).toBeGreaterThan(0)
  })

  test('回放 R5 回滚后的 R6 R7 实验候选链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
          id: 'quality-recommendation-feedback-r5-rejected',
          rankingId: 'reuse-rank-published-torque-r5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'rejected',
          decisionLabel: '现场拒绝推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: 'R5 引入跨线样本后出现同名缺陷误召回，需回滚复核。',
          decidedAt: '2026-05-21T17:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-R5-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-RECOMMENDATION-REJECTED',
          effectScoreBefore: 96,
          effectScoreAfter: 91,
          effectTrendLabel: '96 -> 91 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R6',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R6',
          feedbackActions: ['记录跨线负样本误召回。'],
          feedbackMetrics: [
            { label: '复验通过率', value: '82%' },
            { label: '负样本误召回', value: '2 次' },
          ],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-qk-train-20260521-r5',
          sourceReviewQueueId: 'recommendation-feedback-quality-recommendation-feedback-r5-rejected',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          trainingSetName: '跨线扭矩偏移探索实验样本集',
          status: 'gray_published',
          statusLabel: '已灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T16:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R5-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-APPROVED',
          positiveSampleCount: 38,
          negativeSampleCount: 6,
          featurePolicy: 'R5 探索跨线扭矩偏移样本，但需严格监控误召回。',
          changeSummary: ['R5 引入跨产线同名缺陷样本。'],
          validationGates: ['R5 灰度前需复核跨线负样本误召回。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T16:50:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R5-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-VALIDATION-PASSED',
          validationSummary: 'R5 灰度前校验通过，但标记跨线误召回观察项。',
          validationFindings: ['跨线负样本误召回 2 次。'],
          publishedAt: '2026-05-21T17:00:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-PUBLISHED',
          publishSummary: 'R5 已灰度发布到跨线扭矩偏移推荐实验。',
          recommendationScope: ['跨线 OP-20 扭矩偏移', '质量知识复用排序灰度'],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([
        {
          id: 'quality-gray-release-decision-qk-train-20260521-r5-initial-rolled_back',
          monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          releaseCycleLabel: '首次灰度发布',
          releaseAuditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-PUBLISH-20260521-001',
          releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-PUBLISHED',
          releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
          decision: 'rolled_back',
          decisionLabel: '回滚到 R2 正式版',
          statusClass: 'guarded',
          decidedBy: '质量主管 刘工 / 知识库管理员',
          decidedAt: '2026-05-21T17:30:00.000Z',
          auditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-ROLLED-BACK',
          reason: 'R5 跨线样本误召回超过阈值，先回滚到 R2 正式版。',
          approvalStatus: 'not_required',
          approvalLabel: '回滚无需扩大审批',
          rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
          reviewIssueId: 'R5-REVIEW-ISSUE-20260521-001',
          reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-REVIEW-ISSUE',
          reviewIssueStatus: 'open',
          reviewIssueLabel: '待复核',
          metricSnapshot: [
            { label: '推荐采纳率', value: '0%' },
            { label: '复验通过率', value: '82%' },
            { label: '负样本误召回', value: '2 次' },
          ],
          actions: ['R5 跨线推荐实验回滚。'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const candidateMetric = panel.locator('.metric-chip').filter({ hasText: '质量实验候选' })
    await expect(candidateMetric.locator('strong')).toHaveText('2')
    await expect(candidateMetric.locator('span')).toHaveText('质量实验候选')
    const r6Card = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R6 补样待合并回放' })
    await expect(r6Card).toBeVisible()
    await expect(r6Card.getByText('AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-20260521-001')).toBeVisible()
    await r6Card.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R6-NEGATIVE-COVERAGE', { exact: true })).toBeVisible()
    await expect(detail.getByText(/负样本覆盖 6 \/ 8 条，覆盖率 75%，需补 2 条跨线负样本/)).toBeVisible()
    await expect(detail.getByText(/R5 回滚审计 AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001/)).toBeVisible()
    await expect(detail.getByText(/实验回滚、负样本覆盖率、下一轮候选和影子验证策略已归档/)).toBeVisible()

    const r7Card = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R7 影子验证待排队回放' })
    await expect(r7Card).toBeVisible()
  })

  test('回放 POC 复盘会评分表签署链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_poc_review_signoff', JSON.stringify({
        id: 'poc-review-signoff-20260520',
        meetingId: 'POC-REVIEW-20260520-001',
        targetCustomer: '离散制造工厂：多品种小批量、插单频繁、设备瓶颈明显',
        totalScore: 100,
        passScore: 85,
        result: 'approved',
        signedBy: '项目经理 / 客户代表',
        signedAt: '2026-05-20T11:20:00.000Z',
        reviewers: ['客户厂长', 'MES 项目经理', '调度主管', '设备主管'],
        evidenceBatches: ['IMP-POC-WO-20260520-001', 'IMP-POC-EQ-FAULT-20260520-001'],
        auditId: 'AUD-POC-REVIEW-20260520',
        summary: 'POC 评分 100 / 100，客户工单导入与设备故障样例证据齐套，达到 85 分通过线。',
      }))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('POC 复盘签署')).toBeVisible()
    const signoffCard = panel.locator('.decision-card').filter({ hasText: 'POC 复盘会评分表签署' })
    await expect(signoffCard.getByText('AUD-POC-REVIEW-20260520')).toBeVisible()
    await signoffCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('AUD-POC-REVIEW-20260520', { exact: true })).toBeVisible()
    await expect(detail.getByText(/评分结果 100 \/ 100，通过线 85 分/)).toBeVisible()
    await expect(detail.getByText(/IMP-POC-WO-20260520-001/)).toBeVisible()
    await expect(detail.getByText(/POC 评分、证据批次、签署人和复盘结论已归档/)).toBeVisible()
  })

  test('POC 复盘签署载荷缺失时真实浏览器保留基础回放并告警', async ({ page }) => {
    let signoffRequests = 0
    await page.route('**/api/v1/audit-logs**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 8,
          totalPages: 0,
        }),
      })
    })
    await page.route('**/api/v1/scheduling/customer-order-import/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/customer-equipment-fault/latest', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })
    await page.route('**/api/v1/scheduling/knowledge-governance-reviews**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/quality-knowledge-evidence**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/v1/scheduling/poc-review-signoff/latest', async route => {
      signoffRequests += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'poc-review-signoff-missing-payload',
          meetingId: 'POC-REVIEW-MISSING-PAYLOAD',
          targetCustomer: '离散制造工厂 POC',
          totalScore: 92,
          passScore: 85,
          result: 'approved',
          signedBy: '客户代表 / 项目经理',
          signedAt: '2026-06-02T01:20:00.000Z',
          auditId: 'AUD-POC-REVIEW-MISSING-PAYLOAD',
          summary: '复盘证据齐套，评分达到通过线。',
        }),
      })
    })
    await page.evaluate(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.removeItem('aimes_poc_review_signoff')
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(panel.locator('.decision-card').filter({ hasText: 'AUD-POC-REVIEW-MISSING-PAYLOAD' })).toHaveCount(0)

    const alert = panel.locator('.replay-sync-alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('POC 复盘签署加载失败')
    await expect(alert).toContainText('poc-review-signoff-missing-payload 复盘签署审计载荷缺失')
    expect(signoffRequests).toBeGreaterThan(0)
  })

  test('回放知识治理复核与索引重建链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_knowledge_governance_reviews', JSON.stringify([
        {
          id: 'knowledge-governance-review-kg-equipment-cnc-maint',
          documentId: 'kg-equipment-cnc-maint',
          documentTitle: 'CNC-01 主轴维护手册',
          version: 'V1.1',
          reviewedVersion: 'V1.2',
          validUntil: '2026-12-31',
          reviewer: '设备主管 / 知识库管理员',
          reviewedAt: '2026-05-20T12:10:00.000Z',
          auditId: 'AUD-KG-REINDEX-20260520-001',
          traceId: 'TRACE-KG-CNC-MAINT-REINDEX',
          action: '复核有效期并重建 RAG 索引',
          status: 'approved',
          summary: 'CNC-01 主轴维护手册已由设备主管复核，升级为 V1.2 并完成分块索引，可作为设备停机影响问答的正式引用来源。',
          references: ['AI 生产助手', '设备维护', '风险预警', 'AI 排产'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('知识治理回放')).toBeVisible()
    const knowledgeCard = panel.locator('.decision-card').filter({ hasText: 'CNC-01 主轴维护手册 V1.1 -> V1.2 复核重建索引' })
    await expect(knowledgeCard).toBeVisible()
    await expect(knowledgeCard.getByText('证据：AUD-KG-REINDEX-20260520-001')).toBeVisible()
    await knowledgeCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-CNC-MAINT-REINDEX', { exact: true })).toBeVisible()
    await expect(detail.getByText(/复核有效期并重建 RAG 索引/)).toBeVisible()
    await expect(detail.getByText(/文档升级为 V1.2/)).toBeVisible()
    await expect(detail.getByText(/知识复核、版本升级、索引重建和引用范围已归档/)).toBeVisible()
  })

  test('回放质量推荐采纳与下一轮训练集链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
          id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
          rankingId: 'reuse-rank-published-torque',
          trainingSetVersion: 'QK-TRAIN-20260521-R2',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'accepted',
          decisionLabel: '现场已采纳推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
          decidedAt: '2026-05-21T13:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
          effectScoreBefore: 89,
          effectScoreAfter: 93,
          effectTrendLabel: '89 -> 93 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          feedbackActions: ['按独立扭矩 CAPA 执行复验。', '采纳结果回写为正样本。'],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '18 分钟' },
            { label: '复验通过率', value: '100%' },
          ],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('质量推荐回放')).toBeVisible()
    const feedbackCard = panel.locator('.decision-card').filter({ hasText: 'WO-DEMO-1018 OP-20 QK-TRAIN-20260521-R2 推荐采纳回放' })
    await expect(feedbackCard).toBeVisible()
    await expect(feedbackCard.getByText('AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')).toBeVisible()
    await feedbackCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED', { exact: true })).toBeVisible()
    await expect(detail.getByText(/QK-TRAIN-20260521-R2 已发布到质量知识复用排序和 AI 推荐链路/)).toBeVisible()
    await expect(detail.getByText(/效果趋势 89 -> 93 分/)).toBeVisible()
    await expect(detail.locator('ol li').filter({ hasText: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3' })).toBeVisible()
    await expect(detail.getByText(/质量推荐采纳、效果趋势、下一轮训练集候选已归档/)).toBeVisible()
  })

  test('回放 R3 重新灰度发布链路', async ({ page }) => {
    await page.evaluate(() => {
      const feedback = {
        id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
        rankingId: 'reuse-rank-published-torque',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
        decidedAt: '2026-05-21T13:10:00.000Z',
        auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
        effectScoreBefore: 89,
        effectScoreAfter: 93,
        effectTrendLabel: '89 -> 93 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        feedbackActions: ['按独立扭矩 CAPA 执行复验。'],
        feedbackMetrics: [
          { label: '推荐采纳耗时', value: '18 分钟' },
          { label: '复验通过率', value: '100%' },
        ],
      }
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-qk-train-20260521-r3',
          sourceReviewQueueId: `recommendation-feedback-${feedback.id}`,
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          trainingSetName: '推荐采纳效果持续学习样本集',
          status: 'gray_published',
          statusLabel: '已重新灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T13:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
          positiveSampleCount: 24,
          negativeSampleCount: 4,
          featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照。',
          changeSummary: ['R2 现场采纳反馈作为正样本进入 QK-TRAIN-20260521-R3。'],
          validationGates: ['R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T15:20:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION-PASSED',
          validationSummary: 'R3 调整灰度范围后重新通过灰度前校验。',
          validationFindings: [
            'Top-3 召回命中独立扭矩 CAPA 样本。',
            'R2 回滚期间补充的负样本未被误召回。',
          ],
          publishedAt: '2026-05-21T15:35:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
          publishSummary: 'R3 在调整灰度范围并重新通过校验后，再次灰度发布到 OP-20 装配扭矩推荐链路。',
          recommendationScope: ['WO-DEMO-1018 OP-20 装配扭矩偏移', '同设备族装配扭矩偏移灰度', 'AI 生产助手引用链灰度'],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([
        {
          id: 'quality-gray-release-decision-qk-train-20260521-r3-republish-rolled_back',
          monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          releaseCycleLabel: '重新灰度发布',
          releaseAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
          releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
          releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
          decision: 'rolled_back',
          decisionLabel: '回滚到 R2 正式版',
          statusClass: 'guarded',
          decidedBy: '质量主管 刘工 / 知识库管理员',
          decidedAt: '2026-05-21T15:55:00.000Z',
          auditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK',
          reason: '重新灰度发布后仍要求保守验证，二次回滚到 R2 正式版。',
          approvalStatus: 'not_required',
          approvalLabel: '回滚无需扩大审批',
          rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
          reviewIssueId: 'R3-REPUBLISH-REVIEW-ISSUE-20260521-001',
          reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REPUBLISH-REVIEW-ISSUE',
          reviewIssueStatus: 'open',
          reviewIssueLabel: '待复核',
          metricSnapshot: [
            { label: '推荐采纳率', value: '100%' },
            { label: '复验通过率', value: '100%' },
            { label: '负样本误召回', value: '0 次' },
          ],
          actions: ['重新灰度发布周期从 active 推荐选择中排除 QK-TRAIN-20260521-R3。'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('质量灰度发布').first()).toBeVisible()
    const republishCard = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 重新灰度发布回放' })
    await expect(republishCard).toBeVisible()
    await expect(republishCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001')).toBeVisible()
    await republishCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED', { exact: true })).toBeVisible()
    await expect(detail.getByText(/完成重新灰度发布/)).toBeVisible()
    await expect(detail.getByText(/同设备族装配扭矩偏移灰度/)).toBeVisible()
    await expect(detail.getByText(/推荐采纳率 100% \/ 复验通过率 100% \/ 负样本误召回 0 次/)).toBeVisible()
    await expect(detail.getByText(/重新灰度发布审计、灰度范围、监控指标和回滚目标已归档/)).toBeVisible()

    const republishDecisionCard = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 回滚到 R2 正式版回放 · 重新灰度发布' })
    await expect(republishDecisionCard).toBeVisible()
    await expect(republishDecisionCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001').first()).toBeVisible()
    await republishDecisionCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK', { exact: true })).toBeVisible()
    await expect(detail.getByText(/重新灰度发布发布证据：AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001/)).toBeVisible()
    await expect(detail.getByText(/R3-REPUBLISH-REVIEW-ISSUE-20260521-001 待复核问题单已打开/)).toBeVisible()
  })
})
