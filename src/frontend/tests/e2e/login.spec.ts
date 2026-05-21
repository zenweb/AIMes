import { test, expect } from '@playwright/test'

test.describe('Login 登录页', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 token 以确保进入登录页
    await page.addInitScript(() => {
      localStorage.removeItem('aimes_token')
      localStorage.removeItem('aimes_user')
    })
  })

  test('登录页渲染正确', async ({ page }) => {
    await page.goto('login')

    await expect(page.locator('.login-card')).toBeVisible()
    await expect(page.getByText('智能制造执行系统')).toBeVisible()
    await expect(page.getByText('请登录以继续')).toBeVisible()
    await expect(page.locator('#username')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('.login-btn')).toBeVisible()
  })

  test('演示账号提示显示', async ({ page }) => {
    await page.goto('login')

    await expect(page.getByText('演示账号')).toBeVisible()
    const hints = page.locator('.login-hints')
    await expect(hints.getByText('admin', { exact: true })).toBeVisible()
    await expect(hints.getByText('operator', { exact: true })).toBeVisible()
    await expect(hints.getByText('engineer', { exact: true })).toBeVisible()
    await expect(hints.getByText('lead', { exact: true })).toBeVisible()
  })

  test('空表单登录按钮禁用', async ({ page }) => {
    await page.goto('login')

    const loginBtn = page.locator('.login-btn')
    await expect(loginBtn).toBeDisabled()
  })

  test('填写用户名后登录按钮可用', async ({ page }) => {
    await page.goto('login')

    await page.locator('#username').fill('admin')
    await expect(page.locator('.login-btn')).toBeDisabled() // 密码仍为空

    await page.locator('#password').fill('admin123')
    await expect(page.locator('.login-btn')).toBeEnabled()
  })

  test('登录失败显示错误信息', async ({ page }) => {
    // 拦截登录 API 返回 401
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: '用户名或密码错误' }),
      })
    })

    await page.goto('login')
    await page.locator('#username').fill('wrong')
    await page.locator('#password').fill('wrong')
    await page.locator('.login-btn').click()

    await expect(page.locator('.login-error')).toHaveText('用户名或密码错误')
  })

  test('登录成功后跳转到仪表盘', async ({ page }) => {
    // 拦截登录 API 返回成功
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'e2e-test-token',
          username: 'admin',
          displayName: '管理员',
          role: 'Admin',
        }),
      })
    })

    await page.goto('login')
    await page.locator('#username').fill('admin')
    await page.locator('#password').fill('admin123')
    await page.locator('.login-btn').click()

    // 应跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    // token 应写入 localStorage
    const token = await page.evaluate(() => localStorage.getItem('aimes_token'))
    expect(token).toBe('e2e-test-token')
  })

  test('已登录用户访问登录页自动跳转', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('login')

    // 应自动跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 5000 })
  })

  test('未登录访问受保护页面跳转到登录页', async ({ page }) => {
    await page.goto('scheduling')
    await page.waitForURL('**/login', { timeout: 5000 })
  })
})
