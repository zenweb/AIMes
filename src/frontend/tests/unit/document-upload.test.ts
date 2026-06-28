import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DocumentUpload from '../../src/components/knowledge/DocumentUpload.vue'

const uploadDocument = vi.hoisted(() => vi.fn())
const writeCustomerOrderImportEvidence = vi.hoisted(() => vi.fn())
const readCustomerOrderImportEvidenceBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeSamplesBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeReviewQueueRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readQualityKnowledgeGrayReleaseDecisionRecords = vi.hoisted(() => vi.fn())
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn())
const grayPublishQualityKnowledgeNextTrainingSetVersion = vi.hoisted(() => vi.fn())
const grayPublishQualityExperimentShadowValidationVersion = vi.hoisted(() => vi.fn())
const approveQualityKnowledgeNextTrainingSetVersion = vi.hoisted(() => vi.fn())
const approveQualityKnowledgeRetrainingCandidate = vi.hoisted(() => vi.fn())
const publishQualityKnowledgeRetrainingVersion = vi.hoisted(() => vi.fn())
const readQualityKnowledgeRetrainingVersionRecords = vi.hoisted(() => vi.fn())
const readQualityKnowledgeRetrainingVersionRecordsBackendFirst = vi.hoisted(() => vi.fn())
const rollbackQualityKnowledgeRetrainingVersion = vi.hoisted(() => vi.fn())
const runQualityKnowledgeRetrainingValidation = vi.hoisted(() => vi.fn())
const rerunQualityKnowledgeRetrainingValidationPass = vi.hoisted(() => vi.fn())
const runQualityKnowledgeNextTrainingSetValidationPass = vi.hoisted(() => vi.fn())
const mergeQualityKnowledgeNextTrainingSetCandidate = vi.hoisted(() => vi.fn())
const buildQualityKnowledgeRecommendationExperimentCandidateRecords = vi.hoisted(() => vi.fn())
const mergeQualityExperimentNegativeSampleCandidate = vi.hoisted(() => vi.fn())
const runQualityExperimentShadowValidationCandidate = vi.hoisted(() => vi.fn())
const readKnowledgeGovernanceDocuments = vi.hoisted(() => vi.fn())
const writeKnowledgeGovernanceReview = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/knowledge', () => ({
  uploadDocument,
}))

vi.mock('../../src/utils/customer-order-import-sync', () => ({
  readCustomerOrderImportEvidence: vi.fn(() => null),
  readCustomerOrderImportEvidenceBackendFirst,
  writeCustomerOrderImportEvidence,
}))

vi.mock('../../src/utils/knowledge-governance-sync', () => ({
  applyKnowledgeGovernanceReviewToDocument: vi.fn(document => document),
  createDefaultKnowledgeGovernanceReview: vi.fn(() => ({
    auditId: 'AUD-KG-001',
    documentTitle: '测试文档',
    reviewedVersion: 'V1.0',
    reviewedAt: '2026-06-01T00:00:00.000Z',
  })),
  readKnowledgeGovernanceDocuments,
  writeKnowledgeGovernanceReview,
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  approveQualityKnowledgeNextTrainingSetVersion,
  approveQualityKnowledgeRetrainingCandidate,
  buildQualityKnowledgeAssetGovernanceRecords: vi.fn(() => []),
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  grayPublishQualityExperimentShadowValidationVersion,
  grayPublishQualityKnowledgeNextTrainingSetVersion,
  isQualityKnowledgeGrayRepublishEvidence: vi.fn(() => false),
  mergeQualityExperimentNegativeSampleCandidate,
  mergeQualityKnowledgeNextTrainingSetCandidate,
  publishQualityKnowledgeRetrainingVersion,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecords: vi.fn(() => []),
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  readQualityKnowledgeRetrainingVersionRecords,
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst,
  readQualityKnowledgeReviewQueueRecords: vi.fn(() => []),
  readQualityKnowledgeReviewQueueRecordsBackendFirst,
  readQualityKnowledgeSamples: vi.fn(() => []),
  readQualityKnowledgeSamplesBackendFirst,
  rerunQualityKnowledgeRetrainingValidationPass,
  rollbackQualityKnowledgeRetrainingVersion,
  runQualityExperimentShadowValidationCandidate,
  runQualityKnowledgeNextTrainingSetValidationPass,
  runQualityKnowledgeRetrainingValidation,
}))

function mountDocumentUpload() {
  return mount(DocumentUpload, {
    global: {
      stubs: {
        KnowledgeGovernancePanel: true,
      },
    },
  })
}

function makeValidationPassedVersion() {
  return {
    id: 'quality-version-r3',
    sourceReviewQueueId: 'recommendation-feedback-feedback-r3-001',
    targetWorkOrderId: 'WO-DEMO-1018',
    operationCode: 'OP-20',
    candidateTraceId: 'TRACE-QK-R3-CANDIDATE',
    trainingSetVersion: 'QK-TRAIN-20260521-R3',
    trainingSetName: 'OP-20 装配扭矩推荐 R3',
    status: 'validation_passed',
    statusLabel: '灰度前校验已通过',
    approvedBy: '质量主管',
    approvedAt: '2026-06-01T00:00:00.000Z',
    approvalAuditId: 'AUD-QK-R3-APPROVAL',
    approvalTraceId: 'TRACE-QK-R3-APPROVAL',
    positiveSampleCount: 8,
    negativeSampleCount: 4,
    featurePolicy: '禁用直接复用，保留负样本降权',
    changeSummary: ['合并现场反馈'],
    validationGates: ['字段完整', '负样本覆盖'],
    validationStatus: 'passed',
    validatedAt: '2026-06-01T01:00:00.000Z',
    validationAuditId: 'AUD-QK-R3-VALIDATION',
    validationTraceId: 'TRACE-QK-R3-VALIDATION',
    validationFindings: ['灰度前校验通过'],
  }
}

function makePublishedVersion() {
  return {
    ...makeValidationPassedVersion(),
    status: 'published',
    statusLabel: '已发布到 AI 推荐',
    publishAuditId: 'AUD-QK-R3-PUBLISH',
    publishTraceId: 'TRACE-QK-R3-PUBLISH',
    publishSummary: '已发布到质量知识推荐链路。',
    recommendationScope: ['OP-20 装配扭矩推荐链路', 'AI 生产助手引用链'],
    publishedAt: '2026-06-01T02:00:00.000Z',
  }
}

function mountDocumentUploadWithQualityAction(eventName: string, versionId = 'quality-version-r3') {
  return mount(DocumentUpload, {
    global: {
      stubs: {
        KnowledgeGovernancePanel: {
          emits: [eventName],
          template: `
            <button
              type="button"
              class="quality-action-trigger"
              @click="$emit('${eventName}', '${versionId}')"
            >
              质量知识动作
            </button>
          `,
        },
      },
    },
  })
}

describe('DocumentUpload', () => {
  beforeEach(() => {
    uploadDocument.mockReset()
    writeCustomerOrderImportEvidence.mockReset()
    readCustomerOrderImportEvidenceBackendFirst.mockReset()
    readCustomerOrderImportEvidenceBackendFirst.mockResolvedValue(null)
    readQualityKnowledgeSamplesBackendFirst.mockReset()
    readQualityKnowledgeSamplesBackendFirst.mockResolvedValue([])
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockReset()
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockReset()
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockReset()
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeGrayReleaseDecisionRecords.mockReset()
    readQualityKnowledgeGrayReleaseDecisionRecords.mockReturnValue([])
    readKnowledgeGovernanceDocuments.mockReset()
    readKnowledgeGovernanceDocuments.mockReturnValue([])
    grayPublishQualityKnowledgeNextTrainingSetVersion.mockReset()
    grayPublishQualityExperimentShadowValidationVersion.mockReset()
    readQualityKnowledgeRetrainingVersionRecords.mockReset()
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockReset()
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([])
    publishQualityKnowledgeRetrainingVersion.mockReset()
    approveQualityKnowledgeRetrainingCandidate.mockReset()
    approveQualityKnowledgeNextTrainingSetVersion.mockReset()
    rollbackQualityKnowledgeRetrainingVersion.mockReset()
    runQualityKnowledgeRetrainingValidation.mockReset()
    rerunQualityKnowledgeRetrainingValidationPass.mockReset()
    runQualityKnowledgeNextTrainingSetValidationPass.mockReset()
    mergeQualityKnowledgeNextTrainingSetCandidate.mockReset()
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReset()
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValue([])
    mergeQualityExperimentNegativeSampleCandidate.mockReset()
    runQualityExperimentShadowValidationCandidate.mockReset()
    writeKnowledgeGovernanceReview.mockReset()
    writeKnowledgeGovernanceReview.mockImplementation(review => review)
  })

  it('exposes the drop zone as a keyboard-accessible file picker trigger', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined)
    const wrapper = mountDocumentUpload()

    const dropZone = wrapper.get('.drop-zone')
    expect(dropZone.attributes('role')).toBe('button')
    expect(dropZone.attributes('tabindex')).toBe('0')
    expect(dropZone.attributes('aria-label')).toBe('选择或拖拽上传知识文档')

    await dropZone.trigger('keydown.enter')

    expect(click).toHaveBeenCalledOnce()
    click.mockRestore()
  })

  it('guides knowledge upload with bilingual prompts, related evidence links, and help support', () => {
    const wrapper = mountDocumentUpload()

    const guidance = wrapper.get('.upload-guidance')
    expect(guidance.text()).toContain('上传前请确认分类、有效期和引用范围')
    expect(guidance.text()).toContain('Before upload, confirm category, validity window, and citation scope')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      '知识治理队列',
      '质量证据复核',
      '报表证据中心',
      '帮助：知识入库支持',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '#knowledge-governance',
      '/quality',
      '/report',
      '#knowledge-upload-help',
    ])
    expect(links[3].attributes('aria-label')).toBe('打开知识入库帮助')
  })

  it('anchors knowledge governance and help targets with bilingual operator guidance', () => {
    const wrapper = mountDocumentUpload()

    const governanceAnchor = wrapper.get('#knowledge-governance')
    expect(governanceAnchor.attributes('aria-label')).toBe('知识治理队列')

    const help = wrapper.get('#knowledge-upload-help')
    expect(help.text()).toContain('知识入库帮助')
    expect(help.text()).toContain('选择分类后再上传，避免文档进入错误的治理队列')
    expect(help.text()).toContain('Choose a category before upload so the document enters the right governance queue')
    expect(help.text()).toContain('遇到索引或证据刷新失败时，保留当前页面证据并联系知识库管理员')
    expect(help.text()).toContain('If indexing or evidence refresh fails, keep the current evidence visible and contact the knowledge owner')
  })

  it('announces rejected files through an alert message', async () => {
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    const files = [new File(['demo'], 'virus.exe', { type: 'application/octet-stream' })]
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: files,
    })

    await input.trigger('change')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('不支持的文件格式: virus.exe')
  })

  it('rejects oversized files before they enter the upload queue', async () => {
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    const file = new File(['quality'], '大型质量手册.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', {
      configurable: true,
      value: 51 * 1024 * 1024,
    })
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    })

    await input.trigger('change')

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('文件过大 (最大 50MB): 大型质量手册.pdf')
    expect(wrapper.find('.file-queue').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.btn-upload').element.disabled).toBe(true)
    expect(uploadDocument).not.toHaveBeenCalled()
  })

  it('announces generated customer order import evidence as a status update', async () => {
    writeCustomerOrderImportEvidence.mockReturnValue({
      batchId: 'IMP-POC-WO-20260602-001',
      fileName: '客户真实工单导入样例_30单.csv',
      source: '客户 ERP 导出样例',
      importedOrders: 30,
      highRiskOrders: 6,
      mappedFields: ['工单号', '产品', '交期'],
      preparedAt: '2026-06-02T01:00:00.000Z',
    })
    const wrapper = mountDocumentUpload()
    await flushPromises()

    await wrapper.get('.btn-import').trigger('click')

    const metrics = wrapper.get('.import-metrics')
    expect(metrics.attributes('role')).toBe('status')
    expect(metrics.attributes('aria-live')).toBe('polite')
    expect(metrics.text()).toContain('IMP-POC-WO-20260602-001')
    expect(metrics.text()).toContain('30 单')
    expect(wrapper.text()).toContain('6 单高风险已识别')
    expect(wrapper.text()).toContain('客户真实工单导入样例_30单.csv')
  })

  it('fails loud when customer order import evidence generation cannot be written', async () => {
    writeCustomerOrderImportEvidence.mockImplementationOnce(() => {
      throw new Error('customer import generation storage unavailable')
    })
    const wrapper = mountDocumentUpload()
    await flushPromises()

    await wrapper.get('.btn-import').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('客户工单导入样例生成失败')
    expect(alert.text()).toContain('customer import generation storage unavailable')
    expect(wrapper.get('.import-metrics').text()).toContain('待生成导入批次')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when customer order import evidence refresh fails and keeps the local sample state visible', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockRejectedValueOnce(new Error('customer import API unavailable'))

    const wrapper = mountDocumentUpload()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('客户工单导入证据刷新失败')
    expect(alert.text()).toContain('customer import API unavailable')
    expect(wrapper.get('.customer-import-panel').text()).toContain('待生成导入批次')
    expect(wrapper.get('.import-metrics').text()).toContain('尚未准备客户样例')
  })

  it('keeps local customer import sample state quiet when offline demo skips backend refresh', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockResolvedValueOnce(null)

    const wrapper = mountDocumentUpload()
    await flushPromises()

    expect(wrapper.find('.customer-import-error').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('客户工单导入证据刷新失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.get('.import-metrics').text()).toContain('尚未准备客户样例')
  })

  it('fails loud when customer order import evidence refresh returns a non-evidence payload', async () => {
    readCustomerOrderImportEvidenceBackendFirst.mockResolvedValueOnce('<!doctype html><title>502</title>')

    const wrapper = mountDocumentUpload()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('客户工单导入证据刷新失败')
    expect(alert.text()).toContain('后端返回非客户工单导入证据载荷')

    const metrics = wrapper.get('.import-metrics')
    expect(metrics.text()).toContain('待生成导入批次')
    expect(metrics.text()).toContain('0 单')
    expect(metrics.text()).toContain('尚未准备客户样例')
    expect(metrics.text()).not.toContain('undefined 单高风险已识别')
  })

  it('retries customer order import evidence refresh after an initial failure and restores the live sample state', async () => {
    readCustomerOrderImportEvidenceBackendFirst
      .mockRejectedValueOnce(new Error('customer import API unavailable'))
      .mockResolvedValueOnce({
        batchId: 'IMP-POC-WO-20260602-001',
        fileName: '客户真实工单导入样例_30单.csv',
        source: '客户 ERP 导出样例',
        importedOrders: 30,
        highRiskOrders: 6,
        mappedFields: ['工单号', '产品', '交期'],
        preparedAt: '2026-06-02T01:00:00.000Z',
      })

    const wrapper = mountDocumentUpload()
    await flushPromises()

    const initialAlert = wrapper.get('[role="alert"]')
    expect(initialAlert.text()).toContain('客户工单导入证据刷新失败')
    expect(wrapper.get('.customer-import-panel').text()).toContain('待生成导入批次')

    await wrapper.get('.customer-import-error .btn-retry').trigger('click')
    await flushPromises()

    expect(readCustomerOrderImportEvidenceBackendFirst).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.customer-import-error').exists()).toBe(false)
    const metrics = wrapper.get('.import-metrics')
    expect(metrics.text()).toContain('IMP-POC-WO-20260602-001')
    expect(metrics.text()).toContain('30 单')
    expect(metrics.text()).toContain('6 单高风险已识别')
  })

  it('uploads queued documents and records the returned indexing result', async () => {
    uploadDocument.mockResolvedValueOnce({
      documentId: 'DOC-KG-001',
      fileName: '质量作业指导书.pdf',
      chunkCount: 12,
      uploadedAt: '2026-06-02T02:00:00.000Z',
      status: 'indexed',
    })
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['quality'], '质量作业指导书.pdf', { type: 'application/pdf' })],
    })

    await input.trigger('change')
    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()

    expect(uploadDocument).toHaveBeenCalledWith(expect.any(File), undefined)
    expect(wrapper.get('.status-done').text()).toBe('已上传')
    expect(wrapper.get('.history-table tbody').text()).toContain('质量作业指导书.pdf')
    expect(wrapper.get('.history-table tbody').text()).toContain('12')
    expect(wrapper.get('.history-table tbody').text()).toContain('indexed')
  })

  it('announces malformed upload responses on the queued document row without recording bad history', async () => {
    uploadDocument.mockResolvedValueOnce('<!doctype html><html><body>SPA fallback</body></html>')
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['quality'], '质量作业指导书.pdf', { type: 'application/pdf' })],
    })

    await input.trigger('change')
    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()

    const status = wrapper.get('.status-err')
    expect(status.attributes('role')).toBe('alert')
    expect(status.attributes('aria-live')).toBe('assertive')
    expect(status.text()).toContain('后端返回非文档上传载荷')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('adds dropped files once, clears drag state, and lets operators remove queued mistakes', async () => {
    const wrapper = mountDocumentUpload()
    const dropZone = wrapper.get('.drop-zone')
    const file = new File(['# work instruction'], '装配作业指导.md', { type: 'text/markdown' })

    await dropZone.trigger('dragover')
    expect(dropZone.classes()).toContain('dragover')

    await dropZone.trigger('drop', {
      dataTransfer: {
        files: [file, file],
      },
    })
    await flushPromises()

    expect(dropZone.classes()).not.toContain('dragover')
    expect(wrapper.findAll('.queue-item')).toHaveLength(1)
    expect(wrapper.get('.queue-name').text()).toBe('装配作业指导.md')

    await wrapper.get('.btn-del').trigger('click')

    expect(wrapper.find('.file-queue').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.btn-upload').element.disabled).toBe(true)
  })

  it('keeps uploading files when clearing the queue so in-flight evidence is not discarded', async () => {
    let resolveUpload: (value: unknown) => void = () => undefined
    uploadDocument.mockReturnValueOnce(new Promise(resolve => {
      resolveUpload = resolve
    }))
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [
        new File(['quality'], '质量检验规程.pdf', { type: 'application/pdf' }),
        new File(['process'], '工艺路线说明.txt', { type: 'text/plain' }),
      ],
    })

    await input.trigger('change')
    expect(wrapper.findAll('.queue-item')).toHaveLength(2)

    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()
    await wrapper.get('.btn-clear').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.queue-item')).toHaveLength(1)
    expect(wrapper.get('.status-progress').exists()).toBe(true)
    expect(wrapper.get('.queue-name').text()).toBe('质量检验规程.pdf')

    resolveUpload({
      documentId: 'DOC-KG-UPLOADING-001',
      fileName: '质量检验规程.pdf',
      chunkCount: 8,
      uploadedAt: '2026-06-15T04:40:00.000Z',
      status: 'indexed',
    })
    await flushPromises()

    expect(wrapper.get('.status-done').text()).toBe('已上传')
    expect(wrapper.get('.history-table tbody').text()).toContain('DOC-KG-UPLOADING-001')
  })

  it('adds successful uploads to the governance review queue with the selected category', async () => {
    uploadDocument.mockResolvedValueOnce({
      documentId: 'DOC-KG-QUALITY-SOP-001',
      fileName: '质量作业指导书.pdf',
      chunkCount: 12,
      uploadedAt: '2026-06-02T02:00:00.000Z',
      status: 'indexed',
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            props: {
              documents: Array,
            },
            template: `
              <section class="governance-probe">
                <article v-for="doc in documents" :key="doc.id" class="governance-doc">
                  <strong>{{ doc.id }}</strong>
                  <span>{{ doc.title }}</span>
                  <em>{{ doc.category }}</em>
                  <code>{{ doc.indexStatus }}</code>
                  <p>{{ doc.recommendedAction }}</p>
                </article>
              </section>
            `,
          },
        },
      },
    })
    await flushPromises()
    await wrapper.get('.cat-select').setValue('quality')
    const input = wrapper.get<HTMLInputElement>('.file-input')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['quality'], '质量作业指导书.pdf', { type: 'application/pdf' })],
    })

    await input.trigger('change')
    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()

    expect(uploadDocument).toHaveBeenCalledWith(expect.any(File), 'quality')
    const governanceDoc = wrapper.get('.governance-doc')
    expect(governanceDoc.text()).toContain('DOC-KG-QUALITY-SOP-001')
    expect(governanceDoc.text()).toContain('质量作业指导书.pdf')
    expect(governanceDoc.text()).toContain('质量文档')
    expect(governanceDoc.text()).toContain('pending')
    expect(governanceDoc.text()).toContain('确认文档分类、有效期和引用范围后再重建索引')
    const history = wrapper.get('.history-table tbody').text()
    expect(history).toContain('质量文档')
    expect(history).not.toContain('quality')
  })

  it('announces upload failures on the queued document row', async () => {
    uploadDocument.mockRejectedValueOnce(new Error('索引服务不可用'))
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['quality'], '质量检验规程.pdf', { type: 'application/pdf' })],
    })

    await input.trigger('change')
    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()

    const status = wrapper.get('.status-err')
    expect(status.attributes('role')).toBe('alert')
    expect(status.attributes('aria-live')).toBe('assertive')
    expect(status.text()).toBe('索引服务不可用')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('lets operators retry a failed upload in place with bilingual recovery guidance and help links', async () => {
    uploadDocument
      .mockRejectedValueOnce(new Error('索引服务不可用'))
      .mockResolvedValueOnce({
        documentId: 'DOC-KG-RETRY-001',
        fileName: '质量检验规程.pdf',
        chunkCount: 8,
        uploadedAt: '2026-06-19T04:40:00.000Z',
        status: 'indexed',
      })
    const wrapper = mountDocumentUpload()
    const input = wrapper.get<HTMLInputElement>('.file-input')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['quality'], '质量检验规程.pdf', { type: 'application/pdf' })],
    })

    await input.trigger('change')
    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()

    const recovery = wrapper.get('.queue-recovery')
    expect(recovery.text()).toContain('保留原文件，可直接重试')
    expect(recovery.text()).toContain('Keep the file and retry after confirming the category and evidence scope')
    expect(recovery.get('a').attributes('href')).toBe('#knowledge-upload-help')
    expect(wrapper.get<HTMLButtonElement>('.btn-upload').element.disabled).toBe(true)

    await wrapper.get('.btn-retry-upload').trigger('click')
    await flushPromises()
    expect(wrapper.get<HTMLButtonElement>('.btn-upload').element.disabled).toBe(false)

    await wrapper.get('.btn-upload').trigger('click')
    await flushPromises()

    expect(uploadDocument).toHaveBeenCalledTimes(2)
    expect(wrapper.get('.status-done').text()).toBe('已上传')
    expect(wrapper.find('.queue-recovery').exists()).toBe(false)
    expect(wrapper.get('.history-table tbody').text()).toContain('DOC-KG-RETRY-001')
  })

  it('alerts when quality knowledge evidence refresh fails and keeps local data visible', async () => {
    readQualityKnowledgeSamplesBackendFirst.mockRejectedValueOnce(new Error('quality evidence API unavailable'))

    const wrapper = mountDocumentUpload()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识证据刷新失败')
    expect(alert.text()).toContain('quality evidence API unavailable')
    expect(wrapper.get('.drop-zone').exists()).toBe(true)
    expect(wrapper.get('.btn-upload').exists()).toBe(true)
  })

  it('keeps local governance documents visible when backend quality evidence refresh fails', async () => {
    readKnowledgeGovernanceDocuments.mockReturnValue([
      {
        id: 'LOCAL-KG-SOP-001',
        title: '本地质量检验规程.pdf',
        category: '质量文档',
        version: 'V1.0',
        summary: '本地治理缓存仍可用于现场复核。',
        indexStatus: 'indexed',
        validUntil: '2026-06-30',
        freshnessStatus: '有效',
        references: ['质量复核'],
        owner: '知识库管理员',
        recommendedAction: '后端不可用时保留本地治理证据，待恢复后再刷新。',
        auditHint: 'AUD-LOCAL-KG-001',
      },
    ])
    readQualityKnowledgeSamplesBackendFirst.mockRejectedValueOnce(new Error('quality evidence API unavailable'))
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            props: {
              documents: Array,
            },
            template: `
              <section class="governance-probe">
                <article v-for="doc in documents" :key="doc.id" class="governance-doc">
                  <strong>{{ doc.id }}</strong>
                  <span>{{ doc.title }}</span>
                  <em>{{ doc.category }}</em>
                  <p>{{ doc.summary }}</p>
                  <small>{{ doc.recommendedAction }}</small>
                  <code>{{ doc.auditHint }}</code>
                </article>
              </section>
            `,
          },
        },
      },
    })
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量知识证据刷新失败')
    expect(alert.text()).toContain('quality evidence API unavailable')

    const governanceDoc = wrapper.get('.governance-doc')
    expect(governanceDoc.text()).toContain('LOCAL-KG-SOP-001')
    expect(governanceDoc.text()).toContain('本地质量检验规程.pdf')
    expect(governanceDoc.text()).toContain('本地治理缓存仍可用于现场复核')
    expect(governanceDoc.text()).toContain('后端不可用时保留本地治理证据')
    expect(governanceDoc.text()).toContain('AUD-LOCAL-KG-001')
  })

  it('hydrates the governance queue from backend quality knowledge evidence', async () => {
    readQualityKnowledgeSamplesBackendFirst.mockResolvedValueOnce([
      {
        documentId: 'QK-DOC-OP20-TORQUE-001',
        documentTitle: 'OP-20 扭矩偏移返工样本',
        version: 'V1.2',
        summary: '跨线 OP-20 扭矩偏移返工样本已进入推荐知识库。',
        validUntil: '2026-06-30',
        reuseTargets: ['AI 生产助手', '质量返工复核'],
        auditId: 'AUD-QK-OP20-001',
      },
    ])
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            props: {
              documents: Array,
            },
            template: `
              <section class="governance-probe">
                <article v-for="doc in documents" :key="doc.id" class="governance-doc">
                  <strong>{{ doc.id }}</strong>
                  <span>{{ doc.title }}</span>
                  <em>{{ doc.category }}</em>
                  <p>{{ doc.summary }}</p>
                  <small>{{ doc.recommendedAction }}</small>
                  <code>{{ doc.auditHint }}</code>
                </article>
              </section>
            `,
          },
        },
      },
    })
    await flushPromises()

    const governanceDoc = wrapper.get('.governance-doc')
    expect(governanceDoc.text()).toContain('QK-DOC-OP20-TORQUE-001')
    expect(governanceDoc.text()).toContain('OP-20 扭矩偏移返工样本')
    expect(governanceDoc.text()).toContain('质量文档')
    expect(governanceDoc.text()).toContain('跨线 OP-20 扭矩偏移返工样本已进入推荐知识库')
    expect(governanceDoc.text()).toContain('保持扫码返工样本与质量闭环、AI 助手和审计日志的引用范围一致')
    expect(governanceDoc.text()).toContain('AUD-QK-OP20-001')
  })

  it('fails loud when knowledge governance review cannot be written', async () => {
    writeKnowledgeGovernanceReview.mockImplementationOnce(() => {
      throw new Error('knowledge review storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['document-reviewed'],
            template: `
              <button
                type="button"
                class="knowledge-review-trigger"
                @click="$emit('document-reviewed', {
                  id: 'DOC-KG-REVIEW-001',
                  title: '过期质量手册.pdf',
                  category: '质量文档',
                  version: 'V1.0'
                })"
              >
                复核文档
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.knowledge-review-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('知识文档索引复核失败')
    expect(alert.text()).toContain('knowledge review storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality next-training gray publish cannot be written', async () => {
    const version = makeValidationPassedVersion()
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    grayPublishQualityKnowledgeNextTrainingSetVersion.mockImplementationOnce(() => {
      throw new Error('gray publish storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-next-training-gray-published'],
            template: `
              <button
                type="button"
                class="gray-publish-trigger"
                @click="$emit('quality-next-training-gray-published', 'quality-version-r3')"
              >
                灰度发布 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.gray-publish-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识灰度发布失败')
    expect(alert.text()).toContain('gray publish storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality retraining approval cannot be written', async () => {
    const reviewRecord = {
      id: 'review-r3-001',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeSamplesBackendFirst.mockResolvedValue([])
    readQualityKnowledgeReviewQueueRecordsBackendFirst.mockResolvedValue([reviewRecord])
    approveQualityKnowledgeRetrainingCandidate.mockImplementationOnce(() => {
      throw new Error('approval storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-retraining-approved'],
            template: `
              <button
                type="button"
                class="approval-trigger"
                @click="$emit('quality-retraining-approved', 'review-r3-001')"
              >
                审批 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.approval-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识审批失败')
    expect(alert.text()).toContain('approval storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality retraining validation cannot be written', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      status: 'approved',
      statusLabel: '已审批待校验',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    runQualityKnowledgeRetrainingValidation.mockImplementationOnce(() => {
      throw new Error('validation storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-retraining-validated'],
            template: `
              <button
                type="button"
                class="validation-trigger"
                @click="$emit('quality-retraining-validated', 'quality-version-r3')"
              >
                校验 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.validation-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识发布前校验失败')
    expect(alert.text()).toContain('validation storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality retraining validation pass cannot be written', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      status: 'validation_failed',
      statusLabel: '发布前校验未通过',
      validationStatus: 'failed',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    rerunQualityKnowledgeRetrainingValidationPass.mockImplementationOnce(() => {
      throw new Error('validation pass storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-retraining-validation-passed'],
            template: `
              <button
                type="button"
                class="validation-pass-trigger"
                @click="$emit('quality-retraining-validation-passed', 'quality-version-r3')"
              >
                校验通过 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.validation-pass-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识发布前校验通过写入失败')
    expect(alert.text()).toContain('validation pass storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality next-training approval cannot be written', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      status: 'candidate_merged',
      statusLabel: '现场反馈已合并',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    approveQualityKnowledgeNextTrainingSetVersion.mockImplementationOnce(() => {
      throw new Error('next training approval storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-next-training-approved'],
            template: `
              <button
                type="button"
                class="next-training-approval-trigger"
                @click="$emit('quality-next-training-approved', 'quality-version-r3')"
              >
                下一训练集审批 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.next-training-approval-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识下一训练集审批失败')
    expect(alert.text()).toContain('next training approval storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality next-training validation cannot be written', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      status: 'approved',
      statusLabel: '下一训练集已审批',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    runQualityKnowledgeNextTrainingSetValidationPass.mockImplementationOnce(() => {
      throw new Error('next training validation storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-next-training-validated'],
            template: `
              <button
                type="button"
                class="next-training-validation-trigger"
                @click="$emit('quality-next-training-validated', 'quality-version-r3')"
              >
                下一训练集校验 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.next-training-validation-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识下一训练集灰度前校验失败')
    expect(alert.text()).toContain('next training validation storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality next-training candidate merge cannot be written', async () => {
    const feedbackRecord = {
      id: 'recommendation-feedback-r3-001',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
    }
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockResolvedValueOnce([feedbackRecord])
    mergeQualityKnowledgeNextTrainingSetCandidate.mockImplementationOnce(() => {
      throw new Error('next training merge storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-next-training-merged'],
            template: `
              <button
                type="button"
                class="next-training-merge-trigger"
                @click="$emit('quality-next-training-merged', 'recommendation-feedback-r3-001')"
              >
                合并下一训练集 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.next-training-merge-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识下一训练集合并失败')
    expect(alert.text()).toContain('next training merge storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality experiment candidate merge cannot be written', async () => {
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValueOnce([
      {
        id: 'quality-experiment-candidate-r6-negative-coverage',
        candidateTrainingSetVersion: 'QK-TRAIN-20260521-R6',
        sourceTrainingSetVersion: 'QK-TRAIN-20260521-R5',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateType: 'negative_sample_patch',
        statusLabel: '补样待合并',
        statusClass: 'guarded',
        triggerLabel: 'R5 回滚触发',
        negativeCoverageLabel: '6 / 8 条',
        coveragePercentLabel: '75%',
        gapLabel: '需补 2 条跨线负样本',
        adoptionRateLabel: '100%',
        recheckPassRateLabel: '96%',
        falseRecallLabel: '0 次',
        gatePolicyLabel: '扩大前必须 0 误召回',
        sourceAuditId: 'AUD-QK-R5-ROLLBACK',
        sourceTraceId: 'TRACE-QK-R5-ROLLBACK',
        auditId: 'AUD-QK-R6-MERGE',
        traceId: 'TRACE-QK-R6-MERGE',
        nextAction: '合并 R6 补样后进入 R7 影子验证。',
        summary: 'R5 回滚后需要补齐跨线负样本。',
        references: ['AUD-QK-R5-ROLLBACK / TRACE-QK-R5-ROLLBACK'],
      },
    ])
    mergeQualityExperimentNegativeSampleCandidate.mockImplementationOnce(() => {
      throw new Error('experiment candidate merge storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-experiment-candidate-merged'],
            template: `
              <button
                type="button"
                class="experiment-candidate-merge-trigger"
                @click="$emit('quality-experiment-candidate-merged', 'quality-experiment-candidate-r6-negative-coverage')"
              >
                合并实验候选 R6
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.experiment-candidate-merge-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量实验候选合并失败')
    expect(alert.text()).toContain('experiment candidate merge storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality experiment shadow validation cannot be written', async () => {
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValueOnce([
      {
        id: 'quality-experiment-candidate-r7-shadow-validation',
        candidateTrainingSetVersion: 'QK-TRAIN-20260521-R7',
        sourceTrainingSetVersion: 'QK-TRAIN-20260521-R5',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        candidateType: 'shadow_validation',
        statusLabel: '影子验证待执行',
        statusClass: 'logged',
        triggerLabel: 'R6 补样后触发',
        negativeCoverageLabel: '8 / 8 条',
        coveragePercentLabel: '100%',
        gapLabel: '追加 2 个跨线影子场景',
        adoptionRateLabel: '100%',
        recheckPassRateLabel: '96%',
        falseRecallLabel: '0 次',
        gatePolicyLabel: '扩大前必须 0 误召回',
        sourceAuditId: 'AUD-QK-R6-MERGE',
        sourceTraceId: 'TRACE-QK-R6-MERGE',
        auditId: 'AUD-QK-R7-SHADOW',
        traceId: 'TRACE-QK-R7-SHADOW',
        nextAction: '执行 R7 影子验证后才能提交扩大审批。',
        summary: 'R7 影子验证用于确认跨线 OP-20 扭矩偏移不会误召回。',
        references: ['AUD-QK-R6-MERGE / TRACE-QK-R6-MERGE'],
      },
    ])
    runQualityExperimentShadowValidationCandidate.mockImplementationOnce(() => {
      throw new Error('shadow validation storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-experiment-shadow-validated'],
            template: `
              <button
                type="button"
                class="experiment-shadow-validation-trigger"
                @click="$emit('quality-experiment-shadow-validated', 'quality-experiment-candidate-r7-shadow-validation')"
              >
                执行影子验证 R7
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.experiment-shadow-validation-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量实验影子验证失败')
    expect(alert.text()).toContain('shadow validation storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('refreshes gray decision evidence after quality experiment shadow gray publish succeeds', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      id: 'quality-version-r7',
      trainingSetVersion: 'QK-TRAIN-20260521-R7',
      trainingSetName: 'R7 跨线扭矩偏移影子验证集',
      sourceReviewQueueId: 'experiment-candidate-r7-shadow-validation',
    }
    const published = {
      ...version,
      status: 'gray_published',
      statusLabel: '影子验证已灰度发布',
      publishAuditId: 'AUD-QK-R7-GRAY-PUBLISH',
      publishTraceId: 'TRACE-QK-R7-GRAY-PUBLISH',
      publishedAt: '2026-06-01T04:00:00.000Z',
      recommendationScope: ['OP-20 跨线扭矩偏移影子灰度'],
    }
    const refreshedDecision = {
      id: 'gray-decision-r7-shadow',
      trainingSetVersion: 'QK-TRAIN-20260521-R7',
      targetWorkOrderId: 'WO-DEMO-1018',
      operationCode: 'OP-20',
      reviewIssueStatus: 'shadow_gray_published',
      decisionAuditId: 'AUD-QK-R7-GRAY-PUBLISH',
      decisionTraceId: 'TRACE-QK-R7-GRAY-PUBLISH',
      summary: 'R7 影子验证已灰度发布到 OP-20。',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    grayPublishQualityExperimentShadowValidationVersion.mockReturnValueOnce(published)
    readQualityKnowledgeGrayReleaseDecisionRecords
      .mockReturnValueOnce([])
      .mockReturnValueOnce([refreshedDecision])
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            props: {
              qualityGrayReleaseDecisions: Array,
            },
            emits: ['quality-experiment-shadow-gray-published'],
            template: `
              <section>
                <button
                  type="button"
                  class="shadow-gray-publish-trigger"
                  @click="$emit('quality-experiment-shadow-gray-published', 'quality-version-r7')"
                >
                  影子灰度发布 R7
                </button>
                <article
                  v-for="decision in qualityGrayReleaseDecisions"
                  :key="decision.id"
                  class="gray-decision-probe"
                >
                  <strong>{{ decision.trainingSetVersion }}</strong>
                  <span>{{ decision.reviewIssueStatus }}</span>
                  <code>{{ decision.decisionAuditId }}</code>
                  <p>{{ decision.summary }}</p>
                </article>
              </section>
            `,
          },
        },
      },
    })
    await flushPromises()

    expect(wrapper.find('.gray-decision-probe').exists()).toBe(false)

    await wrapper.get('.shadow-gray-publish-trigger').trigger('click')
    await flushPromises()

    expect(grayPublishQualityExperimentShadowValidationVersion).toHaveBeenCalledWith(version)
    const decision = wrapper.get('.gray-decision-probe')
    expect(decision.text()).toContain('QK-TRAIN-20260521-R7')
    expect(decision.text()).toContain('shadow_gray_published')
    expect(decision.text()).toContain('AUD-QK-R7-GRAY-PUBLISH')
    expect(decision.text()).toContain('R7 影子验证已灰度发布到 OP-20')
    const history = wrapper.get('.history-table tbody').text()
    expect(history).toContain('AUD-QK-R7-GRAY-PUBLISH')
    expect(history).toContain('质量实验灰度发布')
  })

  it('records successful quality publish, gray publish, and rollback actions in history', async () => {
    const validationPassedVersion = makeValidationPassedVersion()
    const publishedVersion = makePublishedVersion()
    const grayPublishedVersion = {
      ...publishedVersion,
      status: 'gray_published',
      statusLabel: '已灰度发布',
      publishAuditId: 'AUD-QK-R3-GRAY-PUBLISH',
      publishTraceId: 'TRACE-QK-R3-GRAY-PUBLISH',
      recommendationScope: ['OP-20 装配扭矩推荐灰度', 'AI 生产助手引用链灰度'],
    }
    const rolledBackVersion = {
      ...publishedVersion,
      status: 'rolled_back',
      statusLabel: '已回滚',
      rollbackAuditId: 'AUD-QK-R3-ROLLBACK',
      rollbackTraceId: 'TRACE-QK-R3-ROLLBACK',
      rollbackTargetVersion: 'QK-TRAIN-20260520-R2',
      rolledBackAt: '2026-06-01T03:00:00.000Z',
    }

    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([validationPassedVersion])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([validationPassedVersion])
    publishQualityKnowledgeRetrainingVersion.mockReturnValueOnce(publishedVersion)
    const publishWrapper = mountDocumentUploadWithQualityAction('quality-retraining-published')
    await flushPromises()

    await publishWrapper.get('.quality-action-trigger').trigger('click')
    await flushPromises()

    expect(publishQualityKnowledgeRetrainingVersion).toHaveBeenCalledWith(validationPassedVersion)
    let history = publishWrapper.get('.history-table tbody').text()
    expect(history).toContain('AUD-QK-R3-PUBLISH')
    expect(history).toContain('QK-TRAIN-20260521-R3_发布到_AI_推荐链路')
    expect(history).toContain('质量再训练发布')
    expect(history).toContain('done')

    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([validationPassedVersion])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([validationPassedVersion])
    grayPublishQualityKnowledgeNextTrainingSetVersion.mockReturnValueOnce(grayPublishedVersion)
    const grayPublishWrapper = mountDocumentUploadWithQualityAction('quality-next-training-gray-published')
    await flushPromises()

    await grayPublishWrapper.get('.quality-action-trigger').trigger('click')
    await flushPromises()

    expect(grayPublishQualityKnowledgeNextTrainingSetVersion).toHaveBeenCalledWith(
      validationPassedVersion,
      expect.any(String),
      'initial'
    )
    history = grayPublishWrapper.get('.history-table tbody').text()
    expect(history).toContain('AUD-QK-R3-GRAY-PUBLISH')
    expect(history).toContain('QK-TRAIN-20260521-R3_灰度发布到质量推荐链路')
    expect(history).toContain('质量再训练灰度发布')
    expect(history).toContain('done')

    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([publishedVersion])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([publishedVersion])
    rollbackQualityKnowledgeRetrainingVersion.mockReturnValueOnce(rolledBackVersion)
    const rollbackWrapper = mountDocumentUploadWithQualityAction('quality-retraining-rolled-back')
    await flushPromises()

    await rollbackWrapper.get('.quality-action-trigger').trigger('click')
    await flushPromises()

    expect(rollbackQualityKnowledgeRetrainingVersion).toHaveBeenCalledWith(publishedVersion)
    history = rollbackWrapper.get('.history-table tbody').text()
    expect(history).toContain('AUD-QK-R3-ROLLBACK')
    expect(history).toContain('QK-TRAIN-20260521-R3_回滚到_QK-TRAIN-20260520-R2')
    expect(history).toContain('质量再训练回滚')
    expect(history).toContain('done')
  })

  it('fails loud but keeps local publish history when quality publish readback fails', async () => {
    const validationPassedVersion = makeValidationPassedVersion()
    const publishedVersion = makePublishedVersion()
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([validationPassedVersion])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst
      .mockResolvedValueOnce([validationPassedVersion])
      .mockRejectedValueOnce(new Error('quality publish readback unavailable'))
    publishQualityKnowledgeRetrainingVersion.mockReturnValueOnce(publishedVersion)
    const wrapper = mountDocumentUploadWithQualityAction('quality-retraining-published')
    await flushPromises()

    await wrapper.get('.quality-action-trigger').trigger('click')
    await flushPromises()

    expect(publishQualityKnowledgeRetrainingVersion).toHaveBeenCalledWith(validationPassedVersion)
    expect(readQualityKnowledgeRetrainingVersionRecordsBackendFirst).toHaveBeenCalledTimes(2)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量知识正式发布读回失败')
    expect(alert.text()).toContain('quality publish readback unavailable')
    const history = wrapper.get('.history-table tbody').text()
    expect(history).toContain('AUD-QK-R3-PUBLISH')
    expect(history).toContain('QK-TRAIN-20260521-R3_发布到_AI_推荐链路')
    expect(history).toContain('质量再训练发布')
  })

  it('fails loud when quality retraining publish cannot be written', async () => {
    const version = makeValidationPassedVersion()
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    publishQualityKnowledgeRetrainingVersion.mockImplementationOnce(() => {
      throw new Error('publish storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-retraining-published'],
            template: `
              <button
                type="button"
                class="publish-trigger"
                @click="$emit('quality-retraining-published', 'quality-version-r3')"
              >
                正式发布 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.publish-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识正式发布失败')
    expect(alert.text()).toContain('publish storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality retraining rollback cannot be written', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      status: 'published',
      statusLabel: '已发布',
      publishAuditId: 'AUD-QK-R3-PUBLISH',
      publishedAt: '2026-06-01T02:00:00.000Z',
      rollbackTargetVersion: 'QK-TRAIN-20260520-R2',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    rollbackQualityKnowledgeRetrainingVersion.mockImplementationOnce(() => {
      throw new Error('rollback storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-retraining-rolled-back'],
            template: `
              <button
                type="button"
                class="rollback-trigger"
                @click="$emit('quality-retraining-rolled-back', 'quality-version-r3')"
              >
                回滚 R3
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.rollback-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量知识回滚失败')
    expect(alert.text()).toContain('rollback storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })

  it('fails loud when quality experiment shadow gray publish cannot be written', async () => {
    const version = {
      ...makeValidationPassedVersion(),
      id: 'quality-version-r7',
      trainingSetVersion: 'QK-TRAIN-20260521-R7',
      trainingSetName: 'R7 跨线扭矩偏移影子验证集',
      sourceReviewQueueId: 'experiment-candidate-r7-shadow-validation',
    }
    readQualityKnowledgeRetrainingVersionRecords.mockReturnValue([version])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([version])
    grayPublishQualityExperimentShadowValidationVersion.mockImplementationOnce(() => {
      throw new Error('shadow gray publish storage unavailable')
    })
    const wrapper = mount(DocumentUpload, {
      global: {
        stubs: {
          KnowledgeGovernancePanel: {
            emits: ['quality-experiment-shadow-gray-published'],
            template: `
              <button
                type="button"
                class="shadow-gray-publish-trigger"
                @click="$emit('quality-experiment-shadow-gray-published', 'quality-version-r7')"
              >
                影子灰度发布 R7
              </button>
            `,
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('.shadow-gray-publish-trigger').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量实验影子灰度发布失败')
    expect(alert.text()).toContain('shadow gray publish storage unavailable')
    expect(wrapper.get('.history-table tbody').text()).toContain('暂无上传记录')
  })
})
