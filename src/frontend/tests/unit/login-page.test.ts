import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../../src/components/auth/LoginPage.vue'

const login = vi.hoisted(() => vi.fn())
const routerPush = vi.hoisted(() => vi.fn())
const routeQuery = vi.hoisted(() => ({} as Record<string, string>))

vi.mock('../../src/stores/auth', () => ({
  useAuth: () => ({ login }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
  useRoute: () => ({ query: routeQuery }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset()
    routerPush.mockReset()
    for (const key of Object.keys(routeQuery)) delete routeQuery[key]
  })

  it('does not submit whitespace-only credentials to the auth store', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('   ')
    await wrapper.get('#password').setValue('   ')
    await wrapper.get('form').trigger('submit')

    expect(login).not.toHaveBeenCalled()
    expect(routerPush).not.toHaveBeenCalled()
    expect(wrapper.get('.login-error').text()).toBe('请输入用户名和密码')
  })

  it('keeps the submit button disabled while credentials are only whitespace', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('   ')
    await wrapper.get('#password').setValue('   ')

    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('submits trimmed credentials and redirects to the dashboard after login succeeds', async () => {
    login.mockResolvedValueOnce(undefined)
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('  admin  ')
    await wrapper.get('#password').setValue('  admin123  ')
    await wrapper.get('form').trigger('submit')

    expect(login).toHaveBeenCalledWith('admin', 'admin123')
    expect(routerPush).toHaveBeenCalledWith('/dashboard')
  })

  it('returns to the protected page after login when the route guard provided a local redirect', async () => {
    routeQuery.redirect = '/employee?offlineDemo=1'
    login.mockResolvedValueOnce(undefined)
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('admin123')
    await wrapper.get('form').trigger('submit')

    expect(routerPush).toHaveBeenCalledWith('/employee?offlineDemo=1')
  })

  it('ignores non-local redirects after login', async () => {
    routeQuery.redirect = '//example.com'
    login.mockResolvedValueOnce(undefined)
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('admin123')
    await wrapper.get('form').trigger('submit')

    expect(routerPush).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to the password change flow after first login succeeds with mustChangePassword', async () => {
    login.mockResolvedValueOnce({
      token: 'backend-access-token',
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      mustChangePassword: true,
    })
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('admin123')
    await wrapper.get('form').trigger('submit')

    expect(routerPush).toHaveBeenCalledWith({ path: '/change-password' })
  })

  it('exposes validation errors as alerts for assistive technology', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('   ')
    await wrapper.get('#password').setValue('   ')
    await wrapper.get('form').trigger('submit')

    const alert = wrapper.get('[role="alert"]')

    expect(alert.text()).toBe('请输入用户名和密码')
    expect(alert.attributes('aria-live')).toBe('assertive')
  })

  it('links validation errors to the credential fields', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('   ')
    await wrapper.get('#password').setValue('   ')
    await wrapper.get('form').trigger('submit')

    const alert = wrapper.get('[role="alert"]')

    expect(alert.attributes('id')).toBe('login-error')
    expect(wrapper.get('#username').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#password').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#username').attributes('aria-describedby')).toBe('login-error')
    expect(wrapper.get('#password').attributes('aria-describedby')).toBe('login-error')
  })

  it('marks the submit button busy while login is pending', async () => {
    let finishLogin!: () => void
    login.mockReturnValueOnce(new Promise<void>((resolve) => {
      finishLogin = resolve
    }))
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('admin123')
    await wrapper.get('form').trigger('submit')

    const button = wrapper.get('button[type="submit"]')
    expect(button.text()).toBe('登录中...')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')

    finishLogin()
    await flushPromises()
  })

  it('clears the password and keeps the user on the page when login fails', async () => {
    login.mockRejectedValueOnce(new Error('用户名或密码错误'))
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('用户名或密码错误')
    expect((wrapper.get('#username').element as HTMLInputElement).value).toBe('admin')
    expect((wrapper.get('#password').element as HTMLInputElement).value).toBe('')
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('returns focus to the password field after login fails', async () => {
    login.mockRejectedValueOnce(new Error('用户名或密码错误'))
    const wrapper = mount(LoginPage, {
      attachTo: document.body,
    })

    try {
      await wrapper.get('#username').setValue('admin')
      await wrapper.get('#password').setValue('wrong-password')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(document.activeElement).toBe(wrapper.get('#password').element)
    } finally {
      wrapper.unmount()
    }
  })

  it('clears stale credential errors when the user edits the password', async () => {
    login.mockRejectedValueOnce(new Error('用户名或密码错误'))
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('wrong-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await wrapper.get('#password').setValue('new-password')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('#username').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('#password').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('#username').attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.get('#password').attributes('aria-describedby')).toBeUndefined()
  })

  it('returns focus to the username field after whitespace validation fails', async () => {
    const wrapper = mount(LoginPage, {
      attachTo: document.body,
    })

    try {
      await wrapper.get('#username').setValue('   ')
      await wrapper.get('#password').setValue('   ')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(document.activeElement).toBe(wrapper.get('#username').element)
    } finally {
      wrapper.unmount()
    }
  })

  it('returns focus to the password field when only the password is blank', async () => {
    const wrapper = mount(LoginPage, {
      attachTo: document.body,
    })

    try {
      await wrapper.get('#username').setValue('admin')
      await wrapper.get('#password').setValue('   ')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(document.activeElement).toBe(wrapper.get('#password').element)
    } finally {
      wrapper.unmount()
    }
  })

  it('only marks the password field invalid when the username is present', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('   ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('[role="alert"]').text()).toBe('请输入用户名和密码')
    expect(wrapper.get('#username').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('#username').attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.get('#password').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#password').attributes('aria-describedby')).toBe('login-error')
  })

  it('shows bilingual demo account guidance and help link when offline demo mode is explicit', () => {
    routeQuery.offlineDemo = '1'

    const wrapper = mount(LoginPage)
    const hints = wrapper.get('.login-hints')

    expect(hints.text()).toContain('演示账号')
    expect(hints.text()).toContain('Demo accounts')
    expect(hints.text()).toContain('admin')
    expect(hints.text()).toContain('admin123')
    expect(hints.text()).toContain('离线演示入口不连接后端认证')
    expect(hints.text()).toContain('Offline demo login skips live backend authentication.')
    expect(wrapper.get('.login-help-link').attributes('href')).toBe('#login-demo-help')
    expect(wrapper.get('#login-demo-help').text()).toContain('真实后端登录')
    expect(wrapper.get('#login-demo-help').text()).toContain('Live backend login')
  })
})
