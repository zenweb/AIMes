import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BomBoard from '../../src/components/bom/BomBoard.vue'
import type { BomDetail, BomSummary } from '../../src/types/bom'

const getBomList = vi.hoisted(() => vi.fn())
const getBomById = vi.hoisted(() => vi.fn())
const explodeBom = vi.hoisted(() => vi.fn())
const readAlternateMaterialApprovalBackendFirst = vi.hoisted(() => vi.fn())
const readEngineeringChangeImpactAnalysisBackendFirst = vi.hoisted(() => vi.fn())
const readBomKittingPackageBackendFirst = vi.hoisted(() => vi.fn())
const writeAlternateMaterialApproval = vi.hoisted(() => vi.fn())
const writeEngineeringChangeImpactAnalysis = vi.hoisted(() => vi.fn())
const writeBomKittingPackage = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const approveEngineeringChangeImpactAnalysis = vi.hoisted(() => vi.fn())
const rejectEngineeringChangeImpactAnalysis = vi.hoisted(() => vi.fn())
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)

vi.mock('../../src/api/bom', () => ({
  explodeBom,
  getBomById,
  getBomList,
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  approveEngineeringChangeImpactAnalysis,
  readAlternateMaterialApprovalBackendFirst,
  readEngineeringChangeImpactAnalysisBackendFirst,
  rejectEngineeringChangeImpactAnalysis,
  writeAlternateMaterialApproval,
  writeEngineeringChangeImpactAnalysis,
}))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readBomKittingPackageBackendFirst,
  writeBomKittingPackage,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
}))

const bomSummaries: BomSummary[] = [
  {
    id: 'bom-1',
    bomCode: 'BOM-A100',
    bomName: '产品A 物料清单',
    productCode: 'PROD-A1',
    productName: '精密轴承组件 A',
    bomType: 'Manufacturing',
    version: 'V1.0',
    status: 'Released',
    effectiveDate: '2026-01-01',
    expireDate: null,
    itemCount: 5,
    createdAt: '2026-01-01',
  },
  {
    id: 'bom-2',
    bomCode: 'BOM-B200',
    bomName: '产品B 物料清单',
    productCode: 'PROD-B1',
    productName: '传动轴总成 B',
    bomType: 'Manufacturing',
    version: 'V2.1',
    status: 'Released',
    effectiveDate: '2026-03-15',
    expireDate: null,
    itemCount: 8,
    createdAt: '2026-03-10',
  },
]

function buildBomDetail(summary: BomSummary): BomDetail {
  return {
    ...summary,
    changeHistory: [{ changeDescription: '初始创建', changedBy: 'admin', changedAt: summary.createdAt }],
    items: [],
    updatedAt: null,
  }
}

function mountBomBoard() {
  return mount(BomBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('BomBoard', () => {
  beforeEach(() => {
    getBomList.mockResolvedValue({
      items: bomSummaries,
      totalCount: bomSummaries.length,
    })
    getBomById.mockImplementation((id: string) => Promise.resolve(buildBomDetail(bomSummaries.find(bom => bom.id === id) ?? bomSummaries[0])))
    explodeBom.mockResolvedValue({ items: [] })
    readAlternateMaterialApprovalBackendFirst.mockResolvedValue(null)
    readEngineeringChangeImpactAnalysisBackendFirst.mockResolvedValue(null)
    readBomKittingPackageBackendFirst.mockResolvedValue(null)
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
    writeBomKittingPackage.mockReturnValue(undefined)
    upsertOtdEvidenceChainRecord.mockReturnValue(undefined)
    approveEngineeringChangeImpactAnalysis.mockReturnValue({
      id: 'engineering-change-impact-bom-a100-al6061b',
      changeId: 'ECN-BOM-A100-6061B-20260521',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      changeTitle: 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析',
      sourceMaterialCode: 'M-AL-6061',
      alternateMaterialCode: 'M-AL-6061B',
      alternateMaterialName: '铝合金 6061B',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005',
      inventoryImpact: 'M-AL-6061 当前缺口 19 件，M-AL-6061B 可用 28 件。',
      qualityImpact: '替代料必须保留首件材质复核。',
      supplierImpact: '华东快供二厂批次 B-6061B-0521 已承诺到料。',
      costImpact: '单件成本增加 3.2%。',
      otdImpact: '预计 OTD +7%。',
      recommendedDecision: '建议工程批准后进入排产。',
      decision: 'approved',
      decisionLabel: '已批准',
      decidedBy: '工程经理 / EMP-004',
      decisionAuditId: 'AUD-ENG-ECN-DECISION-20260521-APPROVED',
      analyzedBy: '工程经理 / EMP-004',
      analyzedAt: '2026-05-21T08:00:00.000Z',
      auditId: 'AUD-ENG-ECN-20260521-001',
      traceId: 'TRACE-ENG-ECN-BOM-A100-6061B',
    })
    rejectEngineeringChangeImpactAnalysis.mockReturnValue({
      id: 'engineering-change-impact-bom-a100-al6061b',
      changeId: 'ECN-BOM-A100-6061B-20260521',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      changeTitle: 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析',
      sourceMaterialCode: 'M-AL-6061',
      alternateMaterialCode: 'M-AL-6061B',
      alternateMaterialName: '铝合金 6061B',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005',
      inventoryImpact: 'M-AL-6061 当前缺口 19 件，M-AL-6061B 可用 28 件。',
      qualityImpact: '替代料必须保留首件材质复核。',
      supplierImpact: '华东快供二厂批次 B-6061B-0521 已承诺到料。',
      costImpact: '单件成本增加 3.2%。',
      otdImpact: '预计 OTD +7%。',
      recommendedDecision: '建议工程批准后进入排产。',
      decision: 'rejected',
      decisionLabel: '已驳回',
      decidedBy: '工程经理 / EMP-004',
      decisionAuditId: 'AUD-ENG-ECN-DECISION-20260521-REJECTED',
      analyzedBy: '工程经理 / EMP-004',
      analyzedAt: '2026-05-21T08:00:00.000Z',
      auditId: 'AUD-ENG-ECN-20260521-001',
      traceId: 'TRACE-ENG-ECN-BOM-A100-6061B',
    })
    writeAlternateMaterialApproval.mockReturnValue({
      id: 'alt-mat-approval-bom-a100-al6061b',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      sourceMaterialCode: 'M-AL-6061',
      alternateMaterialCode: 'M-AL-6061B',
      alternateMaterialName: '铝合金 6061B',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      approvedBy: '工程师 / EMP-004',
      approvedAt: '2026-05-20T08:00:00.000Z',
      auditId: 'AUD-ENG-ALT-20260520-001',
      traceId: 'TRACE-ENG-ALT-BOM-A100-M-AL-6061B',
      status: 'approved',
      summary: '替代料 M-AL-6061B 已完成工程确认。',
    })
    writeEngineeringChangeImpactAnalysis.mockReturnValue({
      id: 'engineering-change-impact-bom-a100-al6061b',
      changeId: 'ECN-BOM-A100-6061B-20260521',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      changeTitle: 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析',
      sourceMaterialCode: 'M-AL-6061',
      alternateMaterialCode: 'M-AL-6061B',
      alternateMaterialName: '铝合金 6061B',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005',
      inventoryImpact: 'M-AL-6061 当前缺口 19 件，M-AL-6061B 可用 28 件。',
      qualityImpact: '替代料必须保留首件材质复核。',
      supplierImpact: '华东快供二厂批次 B-6061B-0521 已承诺到料。',
      costImpact: '单件成本增加 3.2%。',
      otdImpact: '预计 OTD +7%。',
      recommendedDecision: '建议工程批准后进入排产。',
      decision: 'pending',
      decisionLabel: '待工程批准',
      analyzedBy: '工程经理 / EMP-004',
      analyzedAt: '2026-05-21T08:00:00.000Z',
      auditId: 'AUD-ENG-ECN-20260521-001',
      traceId: 'TRACE-ENG-ECN-BOM-A100-6061B',
    })
  })

  it('lets keyboard users select BOM records and exposes the active record state', async () => {
    const wrapper = mountBomBoard()
    await flushPromises()

    const listbox = wrapper.get('[role="listbox"]')
    expect(listbox.attributes('aria-label')).toBe('BOM 列表')

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(options[1].attributes('tabindex')).toBe('0')
    expect(options[1].attributes('aria-selected')).toBe('false')

    await options[1].trigger('keydown.enter')
    await flushPromises()

    expect(getBomById).toHaveBeenCalledWith('bom-2')
    expect(wrapper.get('.detail-header h3').text()).toBe('产品B 物料清单')
    expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')
  })

  it('alerts while showing local BOM records when the BOM list API is unavailable', async () => {
    getBomList.mockRejectedValueOnce(new Error('bom list API unavailable'))

    const wrapper = mountBomBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.get('[role="listbox"]').text()).toContain('产品A 物料清单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 列表加载失败')
    expect(alert.text()).toContain('bom list API unavailable')
  })

  it('quietly shows local BOM records when offline demo skips the BOM list request', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/bom')
    offlineDemoError.name = 'OfflineDemoApiError'
    getBomList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountBomBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.get('[role="listbox"]').text()).toContain('产品A 物料清单')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('BOM 列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('keeps the BOM list usable when startup engineering evidence sync fails', async () => {
    readEngineeringChangeImpactAnalysisBackendFirst.mockRejectedValueOnce(new Error('engineering evidence storage unavailable'))

    const wrapper = mountBomBoard()
    await flushPromises()

    expect(getBomList).toHaveBeenCalled()
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.get('[role="listbox"]').text()).toContain('产品A 物料清单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 工程证据加载失败')
    expect(alert.text()).toContain('engineering evidence storage unavailable')
  })

  it('keeps alternate material and kitting startup evidence failures visible together', async () => {
    readAlternateMaterialApprovalBackendFirst.mockRejectedValueOnce(new Error('alternate evidence backend unavailable'))
    readBomKittingPackageBackendFirst.mockRejectedValueOnce(new Error('kitting package backend unavailable'))

    const wrapper = mountBomBoard()
    await flushPromises()

    expect(getBomList).toHaveBeenCalled()
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.get('[role="listbox"]').text()).toContain('产品A 物料清单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 工程证据加载失败')
    expect(alert.text()).toContain('替代料确认：alternate evidence backend unavailable')
    expect(alert.text()).toContain('齐套检查包：kitting package backend unavailable')
  })

  it('keeps both startup engineering evidence and BOM list fallback failures visible', async () => {
    readEngineeringChangeImpactAnalysisBackendFirst.mockRejectedValueOnce(new Error('engineering evidence storage unavailable'))
    getBomList.mockRejectedValueOnce(new Error('bom list API unavailable'))

    const wrapper = mountBomBoard()
    await flushPromises()

    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.get('[role="listbox"]').text()).toContain('产品A 物料清单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 工程证据加载失败')
    expect(alert.text()).toContain('engineering evidence storage unavailable')
    expect(alert.text()).toContain('BOM 列表加载失败')
    expect(alert.text()).toContain('bom list API unavailable')
  })

  it('keeps BOM detail selection usable when engineering evidence refresh fails', async () => {
    readAlternateMaterialApprovalBackendFirst
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('alternate evidence refresh unavailable'))
    readEngineeringChangeImpactAnalysisBackendFirst
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('impact evidence refresh unavailable'))
    readBomKittingPackageBackendFirst
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('kitting evidence refresh unavailable'))
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    expect(getBomById).toHaveBeenCalledWith('bom-1')
    expect(readAlternateMaterialApprovalBackendFirst).toHaveBeenLastCalledWith({ failLoud: true })
    expect(readEngineeringChangeImpactAnalysisBackendFirst).toHaveBeenLastCalledWith({ failLoud: true })
    expect(readBomKittingPackageBackendFirst).toHaveBeenLastCalledWith({ failLoud: true })
    expect(wrapper.get('.detail-header h3').text()).toContain('产品A 物料清单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 工程证据刷新失败')
    expect(alert.text()).toContain('alternate evidence refresh unavailable')
    expect(alert.text()).toContain('impact evidence refresh unavailable')
    expect(alert.text()).toContain('kitting evidence refresh unavailable')
  })

  it('clears stale startup engineering evidence errors after selection refresh succeeds', async () => {
    readEngineeringChangeImpactAnalysisBackendFirst
      .mockRejectedValueOnce(new Error('startup engineering evidence unavailable'))
      .mockResolvedValueOnce(null)

    const wrapper = mountBomBoard()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('startup engineering evidence unavailable')

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    expect(getBomById).toHaveBeenCalledWith('bom-1')
    expect(wrapper.get('.detail-header h3').text()).toContain('产品A 物料清单')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('alerts while showing local BOM detail when the BOM detail API is unavailable', async () => {
    getBomById.mockRejectedValueOnce(new Error('bom detail API unavailable'))
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('.detail-header h3').text()).toContain('产品A 物料清单')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 详情加载失败')
    expect(alert.text()).toContain('bom detail API unavailable')
  })

  it('alerts while falling back to a local explosion tree when BOM explosion fails asynchronously', async () => {
    explodeBom.mockRejectedValueOnce(new Error('bom explosion API unavailable'))
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    await wrapper.get('.btn-explode').trigger('click')
    await flushPromises()

    expect(explodeBom).toHaveBeenCalledWith('bom-1', 1)
    expect(wrapper.get('.explosion-section').text()).toContain('MAT-A01')
    expect(wrapper.get('.explosion-section').text()).toContain('轴承钢圈')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 展开失败')
    expect(alert.text()).toContain('bom explosion API unavailable')
  })

  it('keeps the selected BOM material tree when detail and explosion APIs both fall back locally', async () => {
    getBomById.mockRejectedValueOnce(new Error('bom B200 detail API unavailable'))
    explodeBom.mockRejectedValueOnce(new Error('bom B200 explosion API unavailable'))
    const wrapper = mountBomBoard()
    await flushPromises()

    const b200Option = wrapper.findAll('[role="option"]')
      .find(option => option.text().includes('产品B 物料清单'))
    expect(b200Option).toBeTruthy()
    await b200Option!.trigger('click')
    await flushPromises()

    expect(wrapper.get('.detail-header h3').text()).toContain('产品B 物料清单')
    expect(wrapper.get('.items-section').text()).toContain('MAT-B01')
    expect(wrapper.get('.items-section').text()).toContain('MAT-B01a')
    expect(wrapper.get('[role="alert"]').text()).toContain('bom B200 detail API unavailable')

    await wrapper.get('.btn-explode').trigger('click')
    await flushPromises()

    expect(explodeBom).toHaveBeenCalledWith('bom-2', 1)
    const explosion = wrapper.get('.explosion-section')
    expect(explosion.text()).toContain('MAT-B01')
    expect(explosion.text()).toContain('圆钢 φ60mm')
    expect(explosion.text()).toContain('MAT-B02')
    expect(explosion.text()).not.toContain('MAT-A01')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 展开失败')
    expect(alert.text()).toContain('bom B200 explosion API unavailable')
  })

  it('renders backend BOM explosion results and lets operators collapse child materials', async () => {
    explodeBom.mockResolvedValueOnce({
      bomId: 'bom-1',
      bomName: '产品A 物料清单',
      productCode: 'PROD-A1',
      productName: '精密轴承组件 A',
      items: [{
        materialCode: 'MAT-PARENT',
        materialName: '父级组件',
        quantityPerUnit: 1,
        totalQuantity: 1,
        unit: '套',
        lossRate: 0.1,
        leadTimeDays: 3,
        consumptionTiming: '装配前',
        level: 0,
        children: [{
          materialCode: 'MAT-CHILD',
          materialName: '子级物料',
          quantityPerUnit: 2,
          totalQuantity: 2,
          unit: '件',
          lossRate: null,
          leadTimeDays: 1,
          consumptionTiming: '装配',
          level: 1,
          children: [],
        }],
      }],
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    await wrapper.get('.btn-explode').trigger('click')
    await flushPromises()

    expect(explodeBom).toHaveBeenCalledWith('bom-1', 1)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('.explosion-section').text()).toContain('MAT-PARENT')
    expect(wrapper.get('.explosion-section').text()).toContain('子级物料')

    await wrapper.get('.tree-toggle').trigger('click')
    await flushPromises()

    expect(wrapper.get('.tree-toggle').text()).toBe('▶')
    expect(wrapper.get('.explosion-section').text()).not.toContain('子级物料')
  })

  it('alerts and keeps alternate material pending when approval persistence fails', async () => {
    writeAlternateMaterialApproval.mockImplementationOnce(() => {
      throw new Error('alternate approval storage unavailable')
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const approveButton = wrapper.findAll('button').find(button => button.text() === '确认替代料放行')
    expect(approveButton).toBeTruthy()
    await approveButton!.trigger('click')
    await flushPromises()

    expect(writeAlternateMaterialApproval).toHaveBeenCalledWith({
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
    })
    expect(wrapper.get('.alternate-approval h4').text()).toContain('M-AL-6061B 等待工程确认')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('替代料放行失败')
    expect(alert.text()).toContain('alternate approval storage unavailable')
  })

  it('locks alternate material approval and updates scheduling bridge after successful release', async () => {
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const approveButton = wrapper.findAll('button').find(button => button.text() === '确认替代料放行')
    expect(approveButton).toBeTruthy()
    await approveButton!.trigger('click')
    await flushPromises()

    expect(writeAlternateMaterialApproval).toHaveBeenCalledWith({
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
    })
    expect(wrapper.get('.alternate-approval').classes()).toContain('approved')
    expect(wrapper.get('.alternate-approval h4').text()).toContain('M-AL-6061B 已工程放行')
    expect(wrapper.get('.alternate-approval').text()).toContain('AUD-ENG-ALT-20260520-001')
    expect(wrapper.get('.agent-bridge').text()).toContain('已确认 M-AL-6061B 可替代 M-AL-6061')
    expect(wrapper.findAll('button').some(button => button.text() === '确认替代料放行')).toBe(false)
  })

  it('alerts and keeps engineering change pending when impact analysis persistence fails', async () => {
    writeEngineeringChangeImpactAnalysis.mockImplementationOnce(() => {
      throw new Error('engineering change storage unavailable')
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const analyzeButton = wrapper.findAll('button').find(button => button.text() === '生成影响分析')
    expect(analyzeButton).toBeTruthy()
    await analyzeButton!.trigger('click')
    await flushPromises()

    expect(writeEngineeringChangeImpactAnalysis).toHaveBeenCalledWith({
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
    })
    expect(wrapper.get('.change-impact h4').text()).toContain('替代料变更先算影响再进排产')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('ECN 影响分析失败')
    expect(alert.text()).toContain('engineering change storage unavailable')
  })

  it('alerts and keeps BOM kitting package unpublished when package persistence fails', async () => {
    writeBomKittingPackage.mockImplementationOnce(() => {
      throw new Error('bom kitting storage unavailable')
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const publishButton = wrapper.findAll('button').find(button => button.text() === '生成 BOM 齐套检查包')
    expect(publishButton).toBeTruthy()
    await publishButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).not.toHaveBeenCalled()
    expect(wrapper.get('.bom-kitting-source h4').text()).toContain('把 BOM 展开结果送入库存齐套')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('BOM 齐套检查包发布失败')
    expect(alert.text()).toContain('bom kitting storage unavailable')
  })

  it('guides BOM kitting release with bilingual prompts, evidence links, and help support', async () => {
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const guidance = wrapper.get('.kitting-source-guidance')
    expect(guidance.attributes('id')).toBe('bom-kitting-help')
    expect(guidance.text()).toContain('生成齐套检查包前，请确认 BOM 版本、缺料口径、替代料状态和 OTD 证据链。')
    expect(guidance.text()).toContain('Before generating the kitting package, confirm BOM version, shortage basis, alternate material status, and OTD evidence trail.')

    const links = wrapper.findAll('.kitting-source-links a')
    expect(links.map(link => link.text())).toEqual(['AI 排产复核 / Scheduling', '库存齐套 / Inventory', '审计回放 / Audit trail', '帮助 / Help'])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/scheduling',
      '/inventory',
      '/audit-logs',
      '#bom-kitting-help',
    ])
  })

  it('locks the BOM kitting package after publishing and links it into the OTD evidence chain', async () => {
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const publishButton = wrapper.findAll('button').find(button => button.text() === '生成 BOM 齐套检查包')
    expect(publishButton).toBeTruthy()
    await publishButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'bom-kitting-package-bom-a100-wo-rush-9001',
      stage: '库存齐套',
      object: 'WO-RUSH-9001',
      source: 'BOM 管理 / BOM-A100 V1.0',
      traceId: 'TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001',
      status: 'active',
      statusLabel: '待库存齐套',
    }))
    expect(wrapper.get('.bom-kitting-source').classes()).toContain('published')
    expect(wrapper.get('.bom-kitting-source h4').text()).toContain('BOM 展开齐套包已进入库存与排产')
    expect(wrapper.get('.kitting-source-trace').text()).toContain('WO-RUSH-9001')
    expect(wrapper.get('.kitting-source-trace').text()).toContain('TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001')
    const lockedButton = wrapper.findAll('button').find(button => button.text() === 'BOM 齐套检查包已发布')
    expect(lockedButton?.attributes('disabled')).toBeDefined()
  })

  it('fails loud but keeps the BOM kitting package locked when package readback fails after publishing', async () => {
    readBomKittingPackageBackendFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('bom kitting readback unavailable'))
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const publishButton = wrapper.findAll('button').find(button => button.text() === '生成 BOM 齐套检查包')
    expect(publishButton).toBeTruthy()
    await publishButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(readBomKittingPackageBackendFirst).toHaveBeenCalledTimes(3)
    expect(wrapper.get('.bom-kitting-source').classes()).toContain('published')
    expect(wrapper.get('[role="alert"]').text()).toContain('BOM 齐套检查包读回失败')
    expect(wrapper.get('[role="alert"]').text()).toContain('bom kitting readback unavailable')
    const lockedButton = wrapper.findAll('button').find(button => button.text() === 'BOM 齐套检查包已发布')
    expect(lockedButton?.attributes('disabled')).toBeDefined()
  })

  it('locks the BOM kitting package when OTD evidence sync fails so operators do not duplicate the release', async () => {
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('otd evidence chain unavailable')
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()

    const publishButton = wrapper.findAll('button').find(button => button.text() === '生成 BOM 齐套检查包')
    expect(publishButton).toBeTruthy()
    await publishButton!.trigger('click')
    await flushPromises()

    expect(writeBomKittingPackage).toHaveBeenCalledTimes(1)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.get('.bom-kitting-source').classes()).toContain('published')
    expect(wrapper.get('.bom-kitting-source h4').text()).toContain('BOM 展开齐套包已进入库存与排产')
    expect(wrapper.get('[role="alert"]').text()).toContain('BOM 齐套检查包已发布，但 OTD 证据链同步失败')
    expect(wrapper.get('[role="alert"]').text()).toContain('otd evidence chain unavailable')

    const lockedButton = wrapper.findAll('button').find(button => button.text() === 'BOM 齐套检查包已发布')
    expect(lockedButton?.attributes('disabled')).toBeDefined()
  })

  it('locks the ECN decision after approval and exposes the release evidence for scheduling', async () => {
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '生成影响分析')!.trigger('click')
    await flushPromises()

    const approveButton = wrapper.findAll('button').find(button => button.text() === '批准 ECN 放行')
    expect(approveButton).toBeTruthy()
    await approveButton!.trigger('click')
    await flushPromises()

    expect(approveEngineeringChangeImpactAnalysis).toHaveBeenCalledWith()
    expect(wrapper.get('.impact-decision').classes()).toContain('approved')
    expect(wrapper.get('.impact-decision').text()).toContain('已批准')
    expect(wrapper.get('.impact-decision').text()).toContain('AUD-ENG-ECN-DECISION-20260521-APPROVED')
    expect(wrapper.get('.agent-bridge').text()).toContain('AI 排产可正式释放')
    expect(wrapper.findAll('button').some(button => button.text() === '批准 ECN 放行')).toBe(false)
    expect(wrapper.findAll('button').some(button => button.text() === '驳回 ECN')).toBe(false)
  })

  it('locks the ECN decision after rejection and keeps scheduling on the original material strategy', async () => {
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '生成影响分析')!.trigger('click')
    await flushPromises()

    const rejectButton = wrapper.findAll('button').find(button => button.text() === '驳回 ECN')
    expect(rejectButton).toBeTruthy()
    await rejectButton!.trigger('click')
    await flushPromises()

    expect(rejectEngineeringChangeImpactAnalysis).toHaveBeenCalledWith()
    expect(wrapper.get('.impact-decision').classes()).toContain('rejected')
    expect(wrapper.get('.impact-decision').text()).toContain('已驳回')
    expect(wrapper.get('.impact-decision').text()).toContain('AUD-ENG-ECN-DECISION-20260521-REJECTED')
    expect(wrapper.get('.agent-bridge').text()).toContain('已驳回 ECN-BOM-A100-6061B-20260521')
    expect(wrapper.get('.agent-bridge').text()).toContain('保持 M-AL-6061 原物料策略')
    expect(wrapper.findAll('button').some(button => button.text() === '批准 ECN 放行')).toBe(false)
    expect(wrapper.findAll('button').some(button => button.text() === '驳回 ECN')).toBe(false)
  })

  it('loads the requested BOM page when operators use pagination', async () => {
    getBomList
      .mockResolvedValueOnce({
        items: bomSummaries,
        totalCount: 12,
      })
      .mockResolvedValueOnce({
        items: [{
          id: 'bom-3',
          bomCode: 'BOM-C300',
          bomName: '产品C 物料清单',
          productCode: 'PROD-C1',
          productName: '液压阀体 C',
          bomType: 'Manufacturing',
          version: 'V1.0',
          status: 'Draft',
          effectiveDate: '2026-05-01',
          expireDate: null,
          itemCount: 3,
          createdAt: '2026-05-01',
        }],
        totalCount: 12,
      })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('.detail-header h3').text()).toBe('产品A 物料清单')

    const nextButton = wrapper.findAll('.page-btn').find(button => button.text() === '下一页')
    expect(nextButton).toBeTruthy()
    await nextButton!.trigger('click')
    await flushPromises()

    expect(getBomList).toHaveBeenLastCalledWith(2, 10)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.get('[role="listbox"]').text()).toContain('产品C 物料清单')
    expect(wrapper.get('.empty-state').text()).toBe('选择一个 BOM 查看详情')
    expect(wrapper.text()).not.toContain('产品A 物料清单')
    expect(wrapper.get('.page-info').text()).toBe('共 12 条')
  })

  it('alerts and keeps engineering change pending when approval persistence fails', async () => {
    approveEngineeringChangeImpactAnalysis.mockImplementationOnce(() => {
      throw new Error('engineering change approval unavailable')
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '生成影响分析')!.trigger('click')
    await flushPromises()

    const approveButton = wrapper.findAll('button').find(button => button.text() === '批准 ECN 放行')
    expect(approveButton).toBeTruthy()
    await approveButton!.trigger('click')
    await flushPromises()

    expect(approveEngineeringChangeImpactAnalysis).toHaveBeenCalled()
    expect(wrapper.get('.impact-decision').text()).toContain('待工程批准')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('ECN 放行失败')
    expect(alert.text()).toContain('engineering change approval unavailable')
  })

  it('alerts and keeps engineering change pending when rejection persistence fails', async () => {
    rejectEngineeringChangeImpactAnalysis.mockImplementationOnce(() => {
      throw new Error('engineering change rejection unavailable')
    })
    const wrapper = mountBomBoard()
    await flushPromises()

    await wrapper.get('[role="option"]').trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === '生成影响分析')!.trigger('click')
    await flushPromises()

    const rejectButton = wrapper.findAll('button').find(button => button.text() === '驳回 ECN')
    expect(rejectButton).toBeTruthy()
    await rejectButton!.trigger('click')
    await flushPromises()

    expect(rejectEngineeringChangeImpactAnalysis).toHaveBeenCalled()
    expect(wrapper.get('.impact-decision').text()).toContain('待工程批准')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('ECN 驳回失败')
    expect(alert.text()).toContain('engineering change rejection unavailable')
  })
})
