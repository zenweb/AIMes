import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

const employeesWithReplacement: Employee[] = [
  employeesWithoutReplacement[0],
  {
    id: 'emp-heat-replacement',
    employeeNumber: 'EMP-006',
    name: '孙八',
    phone: null,
    email: null,
    role: 'Operator',
    team: '甲班',
    shift: 'Day',
    skills: ['热处理', '炉批复核'],
    certifications: [
      { name: '热处理上岗证', expiresAt: '2026-12-31', status: 'valid' },
    ],
    availability: {
      date: '2026-05-20',
      status: 'overtime',
      statusLabel: '加班窗口',
      window: '2026-05-20 18:00-22:00',
      capacityHours: 4,
      source: '排班计划 SCH-LABOR-20260520-A',
    },
    isActive: true,
    createdAt: '2026-05-01T00:00:00.000Z',
  },
  employeesWithoutReplacement[1],
]

describe('SkillMatrixPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('shows bilingual guidance, contextual links, and help before labor reassignment decisions', () => {
    const wrapper = mount(SkillMatrixPanel, {
      props: {
        employees: employeesWithoutReplacement,
      },
    })

    const guidance = wrapper.get('.labor-reassignment-guidance')
    expect(guidance.attributes('id')).toBe('labor-reassignment-help')
    expect(guidance.text()).toContain('替班/停工复核前，请核对资质有效期、排班窗口、工程复核人与生产开工影响。')
    expect(guidance.text()).toContain('Before reassignment or stop-work review, verify certification validity, shift window, engineering reviewer, and production start impact.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      '生产开工 / Production',
      'AI 排产 / Scheduling',
      '审计回放 / Audit trail',
      '帮助 / Help',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/scheduling/production',
      '/scheduling/scheduling',
      '/scheduling/audit-logs',
      '#labor-reassignment-help',
    ])
    expect(wrapper.get('.qualification-review').attributes('aria-describedby')).toBe('labor-reassignment-help')
  })

  it('keeps production blocked until supervisor review is released by a compensating reassignment', async () => {
    const {
      releaseLaborQualificationBlock,
      writeLaborQualificationBlock,
      writeLaborQualificationBlockReview,
    } = await import('../../src/utils/labor-assignment-sync')
    const wrapper = mount(SkillMatrixPanel, {
      props: {
        employees: employeesWithoutReplacement,
      },
    })

    const confirmReviewButton = wrapper.findAll('button').find(button => button.text() === '主管确认停工复核')
    expect(confirmReviewButton).toBeDefined()
    await confirmReviewButton!.trigger('click')

    expect(writeLaborQualificationBlock).not.toHaveBeenCalled()
    expect(writeLaborQualificationBlockReview).toHaveBeenCalledTimes(1)
    const reviewingBlock = vi.mocked(writeLaborQualificationBlockReview).mock.results[0].value
    expect(reviewingBlock.status).toBe('reviewing')
    expect(wrapper.get('#qualification-review-title').text()).toBe('主管复核中')
    expect(wrapper.get('.qualification-review').text()).toContain('补证/改派前 WO-013')
    expect(wrapper.get('.qualification-review').text()).toContain('保持冻结')

    const releaseButton = wrapper.findAll('button').find(button => button.text() === '补证改派并重新放行')
    expect(releaseButton).toBeDefined()
    await releaseButton!.trigger('click')

    expect(releaseLaborQualificationBlock).toHaveBeenCalledTimes(1)
    const [, reassignment, releaseReason] = vi.mocked(releaseLaborQualificationBlock).mock.calls[0]
    expect(reassignment.replacementEmployeeNumber).toBe('EMP-006')
    expect(reassignment.replacementSkill).toContain('主管复核放行')
    expect(releaseReason).toContain('补证有效')
    expect(wrapper.get('#qualification-review-title').text()).toBe('已重新放行')
    expect(wrapper.get('.reassignment-note').text()).toContain('停工复核已重新放行')
    expect(wrapper.get('.reassignment-note').text()).toContain('TRACE-LABOR-RELEASE-WO-013-OP-10')
  })

  it('releases a qualification block without persisting an intermediate active block', async () => {
    const {
      releaseLaborQualificationBlock,
      writeLaborQualificationBlock,
    } = await import('../../src/utils/labor-assignment-sync')
    const wrapper = mount(SkillMatrixPanel, {
      props: {
        employees: employeesWithoutReplacement,
      },
    })

    const releaseButton = wrapper.findAll('button').find(button => button.text() === '补证改派并重新放行')
    expect(releaseButton).toBeDefined()
    await releaseButton!.trigger('click')

    expect(writeLaborQualificationBlock).not.toHaveBeenCalled()
    expect(releaseLaborQualificationBlock).toHaveBeenCalledTimes(1)
    const [block] = vi.mocked(releaseLaborQualificationBlock).mock.calls[0]
    expect(block.status).toBe('active')
    expect(wrapper.get('#qualification-review-title').text()).toBe('已重新放行')
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

  it('recommends the highest ranked qualified replacement and writes auditable reassignment evidence', async () => {
    const { writeLaborReassignment } = await import('../../src/utils/labor-assignment-sync')
    const wrapper = mount(SkillMatrixPanel, {
      props: {
        employees: employeesWithReplacement,
      },
    })

    expect(wrapper.find('.qualification-review').exists()).toBe(false)
    expect(wrapper.get('.candidate-ranking').text()).toContain('推荐 EMP-006 孙八')
    expect(wrapper.get('.candidate-ranking').text()).toContain('热处理技能匹配')
    expect(wrapper.get('.candidate-ranking').text()).toContain('同证书有效')

    const generateButton = wrapper.findAll('button').find(button => button.text() === '生成替班建议')
    expect(generateButton).toBeDefined()
    await generateButton!.trigger('click')

    expect(writeLaborReassignment).toHaveBeenCalledTimes(1)
    const record = vi.mocked(writeLaborReassignment).mock.calls[0][0]
    expect(record.blockedEmployeeNumber).toBe('EMP-001')
    expect(record.replacementEmployeeNumber).toBe('EMP-006')
    expect(record.replacementSkill).toContain('热处理替班复核')
    expect(record.reason).toContain('排班计划 SCH-LABOR-20260520-A')
    expect(record.reviewerEmployeeNumber).toBe('EMP-004')
    expect(record.auditId).toBe('AUD-LABOR-REASSIGN-20260520-001')
    expect(record.traceId).toBe('TRACE-LABOR-REASSIGN-WO-013-OP-10')
    expect(wrapper.get('.reassignment-note').text()).toContain('替班建议已同步生产开工与 OTD 复盘')
    expect(wrapper.get('.reassignment-note').text()).toContain('EMP-006 孙八')
    expect(wrapper.get('.reassignment-note').text()).toContain('TRACE-LABOR-REASSIGN-WO-013-OP-10')
  })
})
