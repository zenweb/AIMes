import { test, expect } from '@playwright/test'

test.describe('AI 生产助手 (ChatPanel)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('浮动按钮可见', async ({ page }) => {
    const fab = page.locator('.chat-fab')
    await expect(fab).toBeVisible()
    await expect(fab).toHaveAttribute('aria-label', '打开AI助手')
  })

  test('打开聊天面板', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.chat-panel')).toBeVisible()
    await expect(page.locator('.chat-header h3')).toHaveText('AI 生产助手')
    await expect(page.locator('.chat-input')).toBeVisible()
  })

  test('发送消息并获得回复', async ({ page }) => {
    await page.locator('.chat-fab').click()

    const input = page.locator('.chat-input')
    await input.fill('当前产能如何？')

    await page.locator('.send-btn').click()

    // 用户消息出现
    await expect(page.locator('.message.user')).toHaveCount(1, { timeout: 5000 })

    // 助手回复出现（演示模式下为即时回复）
    await expect(page.locator('.message.assistant .msg-content')).not.toHaveCount(0, { timeout: 10000 })
  })

  test('参考来源折叠展开', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await page.locator('.chat-input').fill('设备状态')
    await page.locator('.send-btn').click()

    // 等待回复
    await expect(page.locator('.sources-toggle')).toBeVisible({ timeout: 10000 })
    await page.locator('.sources-toggle').click()
    await expect(page.locator('.source-item').first()).toBeVisible()
  })

  test('关闭面板', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.chat-panel')).toBeVisible()

    await page.locator('.close-btn').click()
    await expect(page.locator('.chat-panel')).not.toBeVisible()
  })

  test('空状态显示', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.empty-chat')).toBeVisible()
    await expect(page.getByText('有什么生产相关的问题？')).toBeVisible()
  })

  test('发送按钮在输入为空时禁用', async ({ page }) => {
    await page.locator('.chat-fab').click()
    await expect(page.locator('.send-btn')).toBeDisabled()
  })
})
