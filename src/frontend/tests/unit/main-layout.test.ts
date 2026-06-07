import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MainLayout from '../../src/components/layout/MainLayout.vue'
import { installMemoryLocalStorage } from './test-storage'

const routerPush = vi.hoisted(() => vi.fn())
const logout = vi.hoisted(() => vi.fn())
const connect = vi.hoisted(() => vi.fn())
const disconnect = vi.hoisted(() => vi.fn())
const route = vi.hoisted(() => ({ path: '/dashboard' }))

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('../../src/stores/auth', () => ({
  useAuth: () => ({
    user: ref({ displayName: '王工' }),
    isLoggedIn: ref(true),
    logout,
  }),
}))

vi.mock('../../src/stores/notifications', () => ({
  useNotifications: () => ({
    toasts: ref([]),
    connected: ref(true),
    connect,
    disconnect,
  }),
}))

function mountLayout() {
  return mount(MainLayout, {
    global: {
      stubs: {
        NuxtLink: {
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
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
        ChatPanel: true,
        ToastContainer: true,
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
})
