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
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'e2e-test-token',
          refreshToken: 'e2e-refresh-token',
          username: 'backenduser',
          displayName: '后端用户',
          role: 'Admin',
          expiresAt: '2026-06-05T12:00:00Z',
          mustChangePassword: false,
        }),
      })
    })

    await page.goto('login')
    await page.locator('#username').fill('backenduser')
    await page.locator('#password').fill('correct-password')
    await page.locator('.login-btn').click()

    await page.waitForURL('**/dashboard', { timeout: 5000 })
    const token = await page.evaluate(() => localStorage.getItem('aimes_token'))
    expect(token).toBe('e2e-test-token')
  })

  test('首登账号登录成功后进入改密页', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
    })
    await page.route('**/api/v1/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'first-login-token',
          refreshToken: 'first-login-refresh-token',
          username: 'firstuser',
          displayName: '首登用户',
          role: 'Admin',
          expiresAt: '2026-06-05T12:00:00Z',
          mustChangePassword: true,
        }),
      })
    })

    await page.goto('login')
    await page.locator('#username').fill('firstuser')
    await page.locator('#password').fill('initial-pass-123')
    await page.locator('.login-btn').click()

    await page.waitForURL('**/change-password', { timeout: 5000 })
    await expect(page.getByRole('heading', { name: '修改初始密码' })).toBeVisible()
  })

  test('首登账号访问登录页会被路由守卫送去改密页', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'backend-access-token')
      localStorage.setItem('aimes_user', JSON.stringify({
        username: 'firstuser',
        displayName: '首登用户',
        role: 'Admin',
        mustChangePassword: true,
      }))
    })

    await page.goto('login')
    await page.waitForURL('**/change-password', { timeout: 5000 })
    await expect(page.getByRole('heading', { name: '修改初始密码' })).toBeVisible()
  })

  test('改密成功后返回登录页并显示提示', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_offline_demo', 'false')
      localStorage.setItem('aimes_token', 'backend-access-token')
      localStorage.setItem('aimes_user', JSON.stringify({
        username: 'firstuser',
        displayName: '首登用户',
        role: 'Admin',
        mustChangePassword: true,
      }))
    })

    await page.route('**/api/v1/auth/change-password', (route) => {
      route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      })
    })

    await page.goto('change-password')
    await page.waitForSelector('.change-password-card', { timeout: 5000 })
    await expect(page.getByRole('heading', { name: '修改初始密码' })).toBeVisible()

    await page.locator('#currentPassword').fill('initial-pass-123')
    await page.locator('#newPassword').fill('new-password-123')
    await page.locator('#confirmPassword').fill('new-password-123')
    await page.locator('.change-password-btn').click()

    await page.waitForURL('**/login?passwordChanged=1', { timeout: 5000 })
    await expect(page.getByText('密码已更新，请使用新密码重新登录')).toBeVisible()
    await expect(page.getByRole('heading', { name: '智能制造执行系统' })).toBeVisible()
    await expect(page.locator('#username')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('已登录用户访问登录页自动跳转', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: false }))
    })
    await page.goto('login')

    // 应自动跳转到仪表盘
    await page.waitForURL('**/dashboard', { timeout: 5000 })
  })

  test('未登录访问受保护页面跳转到登录页', async ({ page }) => {
    await page.goto('scheduling')
    await page.waitForURL(/\/login(?:\?.*)?$/, { timeout: 5000 })
  })
})
