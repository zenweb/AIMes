import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MainLayout from '../../src/components/layout/MainLayout.vue'
import { installMemoryLocalStorage } from './test-storage'

const routerPush = vi.hoisted(() => vi.fn())
const logout = vi.hoisted(() => vi.fn())
const connect = vi.hoisted(() => vi.fn())
const disconnect = vi.hoisted(() => vi.fn())
const route = vi.hoisted(() => ({ path: '/dashboard' }))
const authState = vi.hoisted(() => ({
  user: { __v_isRef: true, value: { displayName: '王工' } as { displayName: string } | null },
  isLoggedIn: { __v_isRef: true, value: true },
}))
const notificationState = vi.hoisted(() => ({
  toasts: { __v_isRef: true, value: [] },
  connected: { __v_isRef: true, value: true },
}))

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('../../src/stores/auth', () => ({
  useAuth: () => ({
    user: authState.user,
    isLoggedIn: authState.isLoggedIn,
    logout,
  }),
}))

vi.mock('../../src/stores/notifications', () => ({
  useNotifications: () => ({
    toasts: notificationState.toasts,
    connected: notificationState.connected,
    connect,
    disconnect,
  }),
}))

vi.mock('../../src/components/chat/ChatPanel.vue', () => ({
  default: {
    props: ['visible'],
    emits: ['close'],
    template: '<aside data-testid="chat-panel" :data-visible="visible"><button type="button" @click="$emit(\'close\')">关闭</button></aside>',
  },
}))

vi.mock('../../src/components/notifications/ToastContainer.vue', () => ({
  default: {
    props: ['toasts'],
    template: '<div data-testid="toast-container">{{ toasts.length }}</div>',
  },
}))

function mountLayout() {
  return mount(MainLayout, {
    global: {
      stubs: {
        NuxtLink: {
          props: ['to'],
          emits: ['click'],
          template: '<a :href="to" @click.prevent="$emit(\'click\', $event)"><slot /></a>',
        },
        PrimeInputText: {
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template: '<input :value="modelValue" />',
        },
        PrimeTag: {
          props: ['value'],
          template: '<span>{{ value }}</span>',
        },
        PrimeButton: {
          props: ['label', 'icon'],
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')"><span v-if="icon">{{ icon }}</span>{{ label }}</button>',
        },
      },
    },
    slots: {
      default: '<div>页面内容</div>',
    },
  })
}

describe('MainLayout', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    routerPush.mockReset()
    logout.mockReset()
    connect.mockReset()
    disconnect.mockReset()
    route.path = '/dashboard'
    authState.user.value = { displayName: '王工' }
    authState.isLoggedIn.value = true
    notificationState.connected.value = true
    notificationState.toasts.value = []
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('exposes mobile menu expansion state to assistive technology', async () => {
    const wrapper = mountLayout()

    const menuButton = wrapper.get('.mobile-menu-btn')

    expect(menuButton.attributes('aria-expanded')).toBe('false')
    expect(menuButton.attributes('aria-controls')).toBe('mobile-nav-panel')
    expect(wrapper.find('#mobile-nav-panel').exists()).toBe(false)

    await menuButton.trigger('click')

    expect(menuButton.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#mobile-nav-panel').exists()).toBe(true)
  })

  it('restores dark mode from local storage and persists toggle changes', async () => {
    localStorage.setItem('aimes_dark', 'true')
    const wrapper = mountLayout()
    await nextTick()

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await wrapper.get('.topbar-actions button').trigger('click')

    expect(localStorage.getItem('aimes_dark')).toBe('false')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('disconnects and redirects to login when logging out', async () => {
    const wrapper = mountLayout()
    const buttons = wrapper.findAll('.topbar-actions button')

    await buttons[1].trigger('click')

    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(logout).toHaveBeenCalledTimes(1)
    expect(routerPush).toHaveBeenCalledWith('/login')
  })

  it('closes mobile navigation after selecting a module and keeps the active module context visible', async () => {
    route.path = '/scheduling'
    const wrapper = mountLayout()

    expect(wrapper.get('[aria-label="当前模块"]').text()).toContain('计划执行')
    expect(wrapper.get('[aria-label="当前模块"]').text()).toContain('AI 排产')
    expect(wrapper.get('[aria-label="当前模块"]').text()).toContain('约束排产与方案采纳')
    expect(wrapper.get('.side-link.active').text()).toContain('AI 排产')

    await wrapper.get('.mobile-menu-btn').trigger('click')
    const schedulingLink = wrapper.findAll('#mobile-nav-panel .mobile-link')
      .find(link => link.text().includes('AI 排产'))
    expect(schedulingLink).toBeDefined()

    await schedulingLink?.trigger('click')

    expect(wrapper.find('#mobile-nav-panel').exists()).toBe(false)
    expect(wrapper.get('.mobile-menu-btn').attributes('aria-expanded')).toBe('false')
  })

  it('guides operators from the active module to related evidence and help', () => {
    route.path = '/scheduling'
    const wrapper = mountLayout()

    const guidance = wrapper.get('.module-guidance')
    expect(guidance.attributes('aria-label')).toBe('当前模块关联证据与帮助')
    expect(guidance.text()).toContain('先核对排产约束、审计回放和交付报告，再采纳复杂动作。')
    expect(guidance.text()).toContain('Review scheduling constraints, audit replay, and delivery evidence before complex actions.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual(['AI 排产', '报表中心', '审计日志', '帮助：当前模块操作支持'])
    expect(links.map(link => link.attributes('href'))).toEqual(['/scheduling', '/report', '/audit-logs', '#module-help'])

    const help = wrapper.get('#module-help')
    expect(help.text()).toContain('复杂模块操作支持')
    expect(help.text()).toContain('Complex operations should preserve source evidence, owner, target module, and audit trail.')
  })
})
