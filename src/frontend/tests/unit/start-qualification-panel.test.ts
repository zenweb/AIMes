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
})
