import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StartQualificationPanel, {
  type StartQualificationCheck,
} from '../../src/components/production/StartQualificationPanel.vue'

function blockedCheck(): StartQualificationCheck {
  return {
    status: 'blocked',
    statusLabel: '停工复核',
    operatorName: '王五',
    employeeNumber: 'EMP-003',
    team: '乙班',
    shift: '夜班',
    requiredSkill: '热处理',
    certificationName: '热处理上岗证',
    expiresAt: '2026-05-25',
    requiredEquipment: 'HT-001 暂不占用，待主管复核后重新派工',
    materialKitting: '炉批料框保持冻结，不释放到热处理工序',
    sopDocument: '热处理作业指导书 V1.8',
    qualityGate: '硬度 HB95+ 与金相抽检需复核后重排',
    qualificationBlockAuditId: 'AUD-LABOR-BLOCK-20260520-001',
    qualificationBlockTraceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
    qualificationBlockReason: '热处理资质临期且无有效替班候选',
    blockedOperator: '王五 · EMP-003',
    replacementReviewer: '赵六 · 工程放行',
    gates: [
      { label: '人员资质', result: '停工复核', status: 'blocked' },
      { label: '替班候选', result: '无有效候选', status: 'blocked' },
      { label: '设备状态', result: '暂不占用', status: 'warning' },
      { label: '主管复核', result: '必须升级', status: 'blocked' },
    ],
    note: 'AUD-LABOR-BLOCK-20260520-001 已阻断 WO-013 淬火。',
  }
}

function reassignedCheck(): StartQualificationCheck {
  return {
    status: 'pass',
    statusLabel: '替班已确认',
    operatorName: '孙八',
    employeeNumber: 'EMP-006',
    team: '甲班',
    shift: '白班',
    requiredSkill: '热处理替班复核 / 派工确认',
    certificationName: '班组长授权',
    expiresAt: '2026-09-30',
    requiredEquipment: 'HT-001 可用，温控曲线需复核',
    materialKitting: '炉批料框已备，淬火油批次由班组长复核',
    sopDocument: '热处理作业指导书 V1.8',
    qualityGate: '硬度 HB95+ 与金相抽检',
    reassignmentAuditId: 'AUD-LABOR-REASSIGN-20260520-001',
    reassignmentTraceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
    blockedOperator: '王五 · EMP-003',
    replacementReviewer: '赵六 · 工程放行',
    gates: [
      { label: '人员资质', result: '替班已确认', status: 'pass' },
      { label: '设备状态', result: '通过', status: 'pass' },
      { label: '物料齐套', result: '批次复核', status: 'warning' },
      { label: '工程复核', result: '已安排', status: 'pass' },
    ],
    note: 'AUD-LABOR-REASSIGN-20260520-001 已完成替班复核，可按 SOP 开工。',
  }
}

describe('StartQualificationPanel', () => {
  it('announces blocked qualification state and gate results as fail-loud evidence', () => {
    const wrapper = mount(StartQualificationPanel, {
      props: {
        check: blockedCheck(),
      },
    })

    const panel = wrapper.get('.start-qualification-panel')
    expect(panel.attributes('role')).toBe('alert')
    expect(panel.attributes('aria-live')).toBe('assertive')
    expect(panel.attributes('aria-label')).toContain('停工复核')

    const blockedGate = wrapper.get('.qualification-checklist span.blocked')
    expect(blockedGate.attributes('aria-label')).toBe('人员资质：停工复核，阻断')

    const blockAudit = wrapper.get('.qualification-reassignment.blocked')
    expect(blockAudit.attributes('role')).toBe('alert')
    expect(blockAudit.attributes('aria-label')).toContain('热处理资质临期且无有效替班候选')
  })

  it('announces approved reassignment as a non-blocking start qualification state', () => {
    const wrapper = mount(StartQualificationPanel, {
      props: {
        check: reassignedCheck(),
      },
    })

    const panel = wrapper.get('.start-qualification-panel')
    expect(panel.attributes('role')).toBe('status')
    expect(panel.attributes('aria-live')).toBe('polite')
    expect(panel.attributes('aria-label')).toBe('开工资质校验：替班已确认')
    expect(wrapper.get('.qualification-header strong.pass').text()).toBe('替班已确认')
    expect(wrapper.text()).toContain('孙八 · EMP-006')
    expect(wrapper.text()).toContain('炉批料框已备，淬火油批次由班组长复核')

    const warningGate = wrapper.get('.qualification-checklist span.warning')
    expect(warningGate.attributes('aria-label')).toBe('物料齐套：批次复核，告警')

    const reassignmentAudit = wrapper.get('.qualification-reassignment')
    expect(reassignmentAudit.attributes('role')).toBe('status')
    expect(reassignmentAudit.attributes('aria-label')).toBe(
      '替班审计：AUD-LABOR-REASSIGN-20260520-001，TRACE-LABOR-REASSIGN-WO-013-OP-10'
    )
    expect(reassignmentAudit.text()).toContain('原人员：王五 · EMP-003')
    expect(reassignmentAudit.text()).toContain('复核：赵六 · 工程放行')
    expect(wrapper.find('.qualification-reassignment.blocked').exists()).toBe(false)
  })
})
