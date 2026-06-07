import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SkillMatrixPanel from '../../src/components/employee/SkillMatrixPanel.vue'
import type { Employee } from '../../src/types/employee'

vi.mock('../../src/utils/labor-assignment-sync', async importOriginal => {
  const actual = await importOriginal<typeof import('../../src/utils/labor-assignment-sync')>()
  return {
    ...actual,
    writeLaborQualificationBlock: vi.fn(record => record),
    writeLaborQualificationBlockReview: vi.fn(record => ({ ...record, status: 'reviewing' })),
    writeLaborReassignment: vi.fn(record => record),
    releaseLaborQualificationBlock: vi.fn((block, reassignment, releaseReason) => ({
      block: {
        ...block,
        status: 'released',
        releaseAuditId: reassignment.auditId,
        releaseTraceId: reassignment.traceId,
        releaseReason,
      },
      reassignment,
    })),
  }
})

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord: vi.fn(),
}))

const employeesWithoutReplacement: Employee[] = [
  {
    id: 'emp-heat-risk',
    employeeNumber: 'EMP-001',
    name: '张三',
    phone: null,
    email: null,
    role: 'Operator',
    team: '甲班',
    shift: 'Day',
    skills: ['热处理'],
    certifications: [
      { name: '热处理上岗证', expiresAt: '2026-05-25', status: 'expiring' },
    ],
    availability: {
      date: '2026-05-20',
      status: 'available',
      statusLabel: '白班排班',
      window: '2026-05-20 08:00-17:00',
      capacityHours: 8,
      source: '排班计划',
    },
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'emp-reviewer',
    employeeNumber: 'EMP-004',
    name: '赵六',
    phone: null,
    email: null,
    role: 'Engineer',
    team: '工艺组',
    shift: 'Day',
    skills: ['工艺复核'],
    certifications: [
      { name: '工程放行', expiresAt: '2026-12-31', status: 'valid' },
    ],
    availability: {
      date: '2026-05-20',
      status: 'available',
      statusLabel: '白班排班',
      window: '2026-05-20 08:00-17:00',
      capacityHours: 8,
      source: '排班计划',
    },
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
]

describe('SkillMatrixPanel', () => {
  it('announces qualification blocks when no replacement candidate can release production', () => {
    const wrapper = mount(SkillMatrixPanel, {
      props: {
        employees: employeesWithoutReplacement,
      },
    })

    const review = wrapper.get('.qualification-review')
    expect(review.attributes('role')).toBe('alert')
    expect(review.attributes('aria-labelledby')).toBe('qualification-review-title')
    expect(wrapper.get('#qualification-review-title').text()).toBe('等待阻断')
    expect(review.text()).toContain('无有效替班候选')
  })

  it('announces when syncing skill evidence fails and keeps the panel visible', async () => {
    const { upsertOtdEvidenceChainRecord } = await import('../../src/utils/otd-evidence-chain-sync')
    vi.mocked(upsertOtdEvidenceChainRecord).mockImplementationOnce(() => {
      throw new Error('evidence chain unavailable')
    })

    const wrapper = mount(SkillMatrixPanel, {
      props: {
        employees: employeesWithoutReplacement,
      },
    })

    await wrapper.get('.sync-button').trigger('click')

    const syncError = wrapper.get('.sync-error')
    expect(wrapper.find('.qualification-review').exists()).toBe(true)
    expect(syncError.attributes('role')).toBe('alert')
    expect(syncError.text()).toBe('人员证据同步失败：evidence chain unavailable')
  })
})
