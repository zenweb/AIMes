import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChangePasswordPage from '../../src/components/auth/ChangePasswordPage.vue'

const changePassword = vi.hoisted(() => vi.fn())
const routerPush = vi.hoisted(() => vi.fn())
const logout = vi.hoisted(() => vi.fn())
const authUser = vi.hoisted(() => ({
  value: { username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: true } as {
    username: string
    displayName: string
    role: string
    mustChangePassword: boolean
  } | null,
}))

vi.mock('../../src/api/auth', () => ({
  changePassword,
}))

vi.mock('../../src/stores/auth', () => ({
  useAuth: () => ({
    user: authUser,
    logout,
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    authUser.value = { username: 'admin', displayName: '管理员', role: 'Admin', mustChangePassword: true }
    changePassword.mockReset()
    routerPush.mockReset()
    logout.mockReset()
  })

  it('redirects to login when the forced password-change session is no longer valid', async () => {
    authUser.value = null
    const wrapper = mount(ChangePasswordPage)

    await wrapper.get('#currentPassword').setValue('admin123')
    await wrapper.get('#newPassword').setValue('new-password-123')
    await wrapper.get('#confirmPassword').setValue('new-password-123')
    await wrapper.get('form').trigger('submit')

    expect(changePassword).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toBe('当前登录信息已失效，请重新登录')
    expect(routerPush).toHaveBeenCalledWith('/login')
  })

  it('requires all password fields before the security-sensitive backend call', async () => {
    const wrapper = mount(ChangePasswordPage, { attachTo: document.body })

    await wrapper.get('form').trigger('submit')

    expect(changePassword).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toBe('请完整填写当前密码、新密码和确认密码')
    expect(wrapper.get('#currentPassword').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#newPassword').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#confirmPassword').attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('#currentPassword').element)

    wrapper.unmount()
  })

  it('focuses the first missing password field so the user can recover quickly', async () => {
    const wrapper = mount(ChangePasswordPage, { attachTo: document.body })

    await wrapper.get('#currentPassword').setValue('admin123')
    await wrapper.get('form').trigger('submit')

    expect(changePassword).not.toHaveBeenCalled()
    expect(wrapper.get('#currentPassword').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('#newPassword').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#confirmPassword').attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('#newPassword').element)

    wrapper.unmount()
  })

  it('rejects mismatched new passwords before calling the backend', async () => {
    const wrapper = mount(ChangePasswordPage, { attachTo: document.body })

    await wrapper.get('#currentPassword').setValue('admin123')
    await wrapper.get('#newPassword').setValue('new-password-123')
    await wrapper.get('#confirmPassword').setValue('new-password-456')
    await wrapper.get('form').trigger('submit')

    expect(changePassword).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toBe('两次输入的新密码不一致')
    expect(wrapper.get('#newPassword').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#confirmPassword').attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('#confirmPassword').element)

    wrapper.unmount()
  })

  it('clears validation state when the operator edits a rejected field', async () => {
    const wrapper = mount(ChangePasswordPage)

    await wrapper.get('#currentPassword').setValue('admin123')
    await wrapper.get('#newPassword').setValue('new-password-123')
    await wrapper.get('#confirmPassword').setValue('new-password-456')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('#confirmPassword').setValue('new-password-123')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('#newPassword').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get('#confirmPassword').attributes('aria-invalid')).toBeUndefined()
  })

  it('submits the change-password request and returns the user to login after success', async () => {
    changePassword.mockResolvedValueOnce(undefined)
    const wrapper = mount(ChangePasswordPage)

    await wrapper.get('#currentPassword').setValue('  admin123  ')
    await wrapper.get('#newPassword').setValue('  new-password-123  ')
    await wrapper.get('#confirmPassword').setValue('  new-password-123  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(changePassword).toHaveBeenCalledWith({
      username: 'admin',
      currentPassword: 'admin123',
      newPassword: 'new-password-123',
    })
    expect(logout).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledWith({ path: '/login', query: { passwordChanged: '1' } })
  })

  it('keeps the user on the forced password-change page when the backend rejects rotation', async () => {
    changePassword.mockRejectedValueOnce(new Error('当前密码错误'))
    const wrapper = mount(ChangePasswordPage, { attachTo: document.body })

    await wrapper.get('#currentPassword').setValue('wrong-password')
    await wrapper.get('#newPassword').setValue('new-password-123')
    await wrapper.get('#confirmPassword').setValue('new-password-123')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('当前密码错误')
    expect(wrapper.get('#currentPassword').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#newPassword').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#confirmPassword').attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('#currentPassword').element)
    expect(logout).not.toHaveBeenCalled()
    expect(routerPush).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
