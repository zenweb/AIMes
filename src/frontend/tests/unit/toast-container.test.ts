import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ToastContainer from '../../src/components/notifications/ToastContainer.vue'
import type { Toast } from '../../src/stores/notifications'

function toast(overrides: Partial<Toast>): Toast {
  return {
    id: 'toast-1',
    type: 'error',
    title: '请求错误',
    message: '登录已过期',
    timestamp: new Date('2026-05-31T00:00:00Z'),
    ...overrides,
  }
}

describe('ToastContainer', () => {
  it('exposes error toasts as alerts with the title and message', () => {
    const wrapper = mount(ToastContainer, {
      props: {
        toasts: [toast({})],
      },
      global: {
        stubs: {
          Teleport: true,
          TransitionGroup: false,
        },
      },
    })

    const alert = wrapper.get('[role="alert"]')

    expect(alert.text()).toContain('请求错误')
    expect(alert.text()).toContain('登录已过期')
    expect(alert.attributes('aria-live')).toBe('assertive')
  })

  it('hides decorative toast icons from assistive technology', () => {
    const wrapper = mount(ToastContainer, {
      props: {
        toasts: [toast({ type: 'success', title: '保存成功', message: '工单已更新' })],
      },
      global: {
        stubs: {
          Teleport: true,
          TransitionGroup: false,
        },
      },
    })

    expect(wrapper.get('.toast-icon').attributes('aria-hidden')).toBe('true')
  })

  it('announces each toast as an atomic live region', () => {
    const wrapper = mount(ToastContainer, {
      props: {
        toasts: [toast({ type: 'warning', title: '库存预警', message: '物料不足' })],
      },
      global: {
        stubs: {
          Teleport: true,
          TransitionGroup: false,
        },
      },
    })

    const status = wrapper.get('[role="status"]')

    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.attributes('aria-atomic')).toBe('true')
  })
})
