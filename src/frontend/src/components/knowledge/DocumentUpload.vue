<template>
  <div class="upload-page">
    <h2 class="page-title">文档上传</h2>

    <div class="upload-container">
      <section class="upload-guidance" aria-labelledby="knowledge-upload-guidance-title">
        <div>
          <span class="eyebrow">知识入库提示</span>
          <h3 id="knowledge-upload-guidance-title">上传前请确认分类、有效期和引用范围</h3>
          <p>Before upload, confirm category, validity window, and citation scope.</p>
        </div>
        <nav class="guidance-links" aria-label="知识入库关联入口">
          <a href="#knowledge-governance">知识治理队列</a>
          <a href="/quality">质量证据复核</a>
          <a href="/report">报表证据中心</a>
          <a href="#knowledge-upload-help" aria-label="打开知识入库帮助">帮助：知识入库支持</a>
        </nav>
      </section>

      <!-- 拖拽上传区 -->
      <div
        class="drop-zone"
        :class="{ dragover: dragOver, 'has-error': error }"
        role="button"
        tabindex="0"
        aria-label="选择或拖拽上传知识文档"
        @click="openFilePicker"
        @keydown.enter.prevent="openFilePicker"
        @keydown.space.prevent="openFilePicker"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.md"
          class="file-input"
          @change="handleFileChange"
        />
        <div class="drop-content">
          <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1890ff" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p class="drop-text">拖拽文件到此处，或<em>点击选择文件</em></p>
          <p class="drop-hint">支持 PDF、Word、Excel、TXT、Markdown 格式</p>
        </div>
      </div>

      <!-- 分类 -->
      <div class="category-row">
        <label class="cat-label">文档分类</label>
        <select v-model="category" class="cat-select">
          <option value="">通用文档</option>
          <option value="process">工艺文档</option>
          <option value="quality">质量文档</option>
          <option value="equipment">设备文档</option>
          <option value="standard">标准规范</option>
        </select>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="error-msg" role="alert" aria-live="assertive">{{ error }}</div>

      <!-- 文件队列 -->
      <div v-if="queue.length" class="file-queue">
        <h4>待上传文件 ({{ queue.length }})</h4>
        <div v-for="(f, idx) in queue" :key="f.name + f.size" class="queue-item">
          <div class="queue-info">
            <span class="queue-name">{{ f.name }}</span>
            <span class="queue-size">{{ formatSize(f.size) }}</span>
          </div>
          <div class="queue-status">
            <span v-if="f.status === 'done'" class="status-done">已上传</span>
            <div v-else-if="f.status === 'error'" class="queue-error">
              <span class="status-err" role="alert" aria-live="assertive">{{ f.errorMsg }}</span>
              <p class="queue-recovery">
                保留原文件，可直接重试。Keep the file and retry after confirming the category and evidence scope.
                <a href="#knowledge-upload-help">查看帮助</a>
              </p>
              <button type="button" class="btn-retry-upload" @click="retryFile(idx)">重试上传</button>
            </div>
            <div v-else-if="f.status === 'uploading'" class="status-progress">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: f.progress + '%' }"></div>
              </div>
            </div>
            <button v-if="f.status !== 'uploading'" class="btn-del" @click="removeFile(idx)">✕</button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button class="btn btn-clear" @click="clearQueue" :disabled="!queue.length">清空列表</button>
        <button class="btn btn-upload" @click="startUpload" :disabled="!canUpload">
          {{ uploading ? '上传中...' : '开始上传' }}
        </button>
      </div>
    </div>

    <section class="customer-import-panel" aria-label="客户真实工单导入样例">
      <div>
        <span class="eyebrow">POC 数据缺口</span>
        <h3>客户真实工单导入样例</h3>
        <p>把客户 ERP 导出的 30 单样例映射到 AIMes 字段，回写到 POC 验收证据和执行闭环评分。</p>
      </div>
      <div v-if="customerImportLoadError" class="error-msg customer-import-error" role="alert" aria-live="assertive">
        <span>{{ customerImportLoadError }}</span>
        <button type="button" class="btn btn-retry" @click="refreshCustomerOrderImportEvidence">重试加载</button>
      </div>
      <div class="import-metrics" role="status" aria-live="polite">
        <span>{{ customerOrderImport?.batchId ?? '待生成导入批次' }}</span>
        <strong>{{ customerOrderImport?.importedOrders ?? 0 }} 单</strong>
        <em>{{ customerOrderImport ? `${customerOrderImport.highRiskOrders} 单高风险已识别` : '尚未准备客户样例' }}</em>
      </div>
      <div class="import-fields">
        <span v-for="field in importMappedFields" :key="field">{{ field }}</span>
      </div>
      <button type="button" class="btn btn-import" @click="prepareCustomerOrderImport">
        生成客户工单导入样例
      </button>
    </section>

    <section id="knowledge-governance" class="governance-anchor" aria-label="知识治理队列">
      <KnowledgeGovernancePanel
        :documents="governanceDocuments"
        :quality-assets="qualityKnowledgeAssets"
        :quality-retraining-versions="qualityRetrainingVersions"
        :quality-gray-release-decisions="qualityGrayReleaseDecisionRecords"
        @document-reviewed="handleKnowledgeReview"
        @quality-retraining-approved="handleQualityRetrainingApproval"
        @quality-retraining-validated="handleQualityRetrainingValidation"
        @quality-retraining-validation-passed="handleQualityRetrainingValidationPass"
        @quality-retraining-published="handleQualityRetrainingPublish"
        @quality-retraining-rolled-back="handleQualityRetrainingRollback"
        @quality-next-training-merged="handleQualityNextTrainingMerge"
        @quality-next-training-approved="handleQualityNextTrainingApproval"
        @quality-next-training-validated="handleQualityNextTrainingValidation"
        @quality-next-training-gray-published="handleQualityNextTrainingGrayPublish"
        @quality-experiment-candidate-merged="handleQualityExperimentCandidateMerge"
        @quality-experiment-shadow-validated="handleQualityExperimentShadowValidation"
        @quality-experiment-shadow-gray-published="handleQualityExperimentShadowGrayPublish"
      />
    </section>

    <section id="knowledge-upload-help" class="upload-help" aria-labelledby="knowledge-upload-help-title">
      <span class="eyebrow">帮助：知识入库支持</span>
      <h3 id="knowledge-upload-help-title">知识入库帮助</h3>
      <ul>
        <li>选择分类后再上传，避免文档进入错误的治理队列。</li>
        <li>Choose a category before upload so the document enters the right governance queue.</li>
        <li>遇到索引或证据刷新失败时，保留当前页面证据并联系知识库管理员。</li>
        <li>If indexing or evidence refresh fails, keep the current evidence visible and contact the knowledge owner.</li>
      </ul>
    </section>

    <!-- 上传记录 -->
    <div class="history-section">
      <h4>上传记录</h4>
      <table class="history-table">
        <thead>
          <tr><th>审计编号</th><th>文件名</th><th>分类</th><th>分块数</th><th>状态</th><th>时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in history" :key="r.documentId">
            <td><code>{{ r.documentId }}</code></td>
            <td>{{ r.fileName }}</td>
            <td>{{ r.category }}</td>
            <td>{{ r.chunkCount }}</td>
            <td><span class="tag st-{{ r.status }}">{{ r.status }}</span></td>
            <td>{{ formatTime(r.uploadedAt) }}</td>
          </tr>
          <tr v-if="!history.length">
            <td colspan="6" class="empty-row">暂无上传记录</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { uploadDocument } from '../../api/knowledge'
import type { DocumentUploadResponse } from '../../types/knowledge'
import { errorMessage } from '../../utils/error-message'
import {
  readCustomerOrderImportEvidence,
  readCustomerOrderImportEvidenceBackendFirst,
  writeCustomerOrderImportEvidence,
  type CustomerOrderImportEvidence,
} from '../../utils/customer-order-import-sync'
import {
  applyKnowledgeGovernanceReviewToDocument,
  createDefaultKnowledgeGovernanceReview,
  readKnowledgeGovernanceDocuments,
  writeKnowledgeGovernanceReview,
  type KnowledgeGovernanceSourceDocument,
} from '../../utils/knowledge-governance-sync'
import {
  approveQualityKnowledgeRetrainingCandidate,
  buildQualityKnowledgeAssetGovernanceRecords,
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  approveQualityKnowledgeNextTrainingSetVersion,
  grayPublishQualityExperimentShadowValidationVersion,
  mergeQualityExperimentNegativeSampleCandidate,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  readQualityKnowledgeRetrainingVersionRecords,
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst,
  readQualityKnowledgeReviewQueueRecords,
  readQualityKnowledgeReviewQueueRecordsBackendFirst,
  readQualityKnowledgeSamples,
  readQualityKnowledgeSamplesBackendFirst,
  grayPublishQualityKnowledgeNextTrainingSetVersion,
  isQualityKnowledgeGrayRepublishEvidence,
  mergeQualityKnowledgeNextTrainingSetCandidate,
  publishQualityKnowledgeRetrainingVersion,
  rerunQualityKnowledgeRetrainingValidationPass,
  rollbackQualityKnowledgeRetrainingVersion,
  runQualityKnowledgeNextTrainingSetValidationPass,
  runQualityExperimentShadowValidationCandidate,
  runQualityKnowledgeRetrainingValidation,
  type QualityKnowledgeRetrainingVersionRecord,
} from '../../utils/quality-knowledge-sample-sync'
import KnowledgeGovernancePanel from './KnowledgeGovernancePanel.vue'

interface QueueFile {
  file: File
  name: string
  size: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  errorMsg?: string
}

const fileInput = ref<HTMLInputElement>()
const dragOver = ref(false)
const category = ref('')
const error = ref('')
const customerImportLoadError = ref('')
const queue = ref<QueueFile[]>([])
const uploading = ref(false)
const history = ref<(DocumentUploadResponse & { category: string })[]>([])
const customerOrderImport = ref<CustomerOrderImportEvidence | null>(readCustomerOrderImportEvidence())
const qualityKnowledgeSamples = ref(readQualityKnowledgeSamples())
const qualityKnowledgeReviewRecords = ref(readQualityKnowledgeReviewQueueRecords())
const qualityRecommendationFeedbackRecords = ref(readQualityKnowledgeRecommendationFeedbackRecords())
const qualityRetrainingVersions = ref<QualityKnowledgeRetrainingVersionRecord[]>(readQualityKnowledgeRetrainingVersionRecords())
const qualityGrayReleaseDecisionRecords = ref(readQualityKnowledgeGrayReleaseDecisionRecords())
const qualityKnowledgeAssets = computed(() =>
  buildQualityKnowledgeAssetGovernanceRecords(
    qualityKnowledgeSamples.value,
    qualityKnowledgeReviewRecords.value,
    qualityRetrainingVersions.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value
  )
)

function isDocumentUploadResponse(value: unknown): value is DocumentUploadResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<DocumentUploadResponse>
  return typeof candidate.documentId === 'string'
    && typeof candidate.fileName === 'string'
    && typeof candidate.chunkCount === 'number'
    && Number.isFinite(candidate.chunkCount)
    && typeof candidate.uploadedAt === 'string'
    && typeof candidate.status === 'string'
}

function isCustomerOrderImportEvidence(value: unknown): value is CustomerOrderImportEvidence {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CustomerOrderImportEvidence>
  return typeof candidate.batchId === 'string'
    && candidate.batchId.trim().length > 0
    && typeof candidate.fileName === 'string'
    && candidate.fileName.trim().length > 0
    && typeof candidate.source === 'string'
    && candidate.source.trim().length > 0
    && typeof candidate.importedOrders === 'number'
    && Number.isFinite(candidate.importedOrders)
    && typeof candidate.highRiskOrders === 'number'
    && Number.isFinite(candidate.highRiskOrders)
    && Array.isArray(candidate.mappedFields)
    && candidate.mappedFields.length > 0
    && candidate.mappedFields.every(field => typeof field === 'string' && field.trim().length > 0)
    && typeof candidate.preparedAt === 'string'
    && candidate.preparedAt.trim().length > 0
}

const governanceDocuments = ref<KnowledgeGovernanceSourceDocument[]>(([
  ...qualityKnowledgeSampleDocuments(),
  ...readKnowledgeGovernanceDocuments(),
] satisfies KnowledgeGovernanceSourceDocument[]))

const canUpload = computed(() => queue.value.some(f => f.status === 'pending'))
const importMappedFields = computed(() => customerOrderImport.value?.mappedFields ?? ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'])

function openFilePicker() {
  fileInput.value?.click()
}

async function refreshCustomerOrderImportEvidence() {
  try {
    const record = await readCustomerOrderImportEvidenceBackendFirst()
    if (record !== null && !isCustomerOrderImportEvidence(record)) {
      throw new Error('后端返回非客户工单导入证据载荷')
    }
    customerOrderImport.value = record
    customerImportLoadError.value = ''
  } catch (e: unknown) {
    customerImportLoadError.value = `客户工单导入证据刷新失败，已保留本地导入样例状态：${errorMessage(e, '请稍后重试')}`
  }
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  error.value = ''
  const files = Array.from(e.dataTransfer?.files || [])
  addFiles(files)
}

function handleFileChange(e: Event) {
  error.value = ''
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
  input.value = ''
}

function addFiles(files: File[]) {
  const validTypes = ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.csv', '.md']
  for (const f of files) {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!validTypes.includes(ext)) {
      error.value = `不支持的文件格式: ${f.name}`
      continue
    }
    if (f.size > 50 * 1024 * 1024) {
      error.value = `文件过大 (最大 50MB): ${f.name}`
      continue
    }
    if (queue.value.some(q => q.name === f.name && q.size === f.size)) continue
    queue.value.push({ file: f, name: f.name, size: f.size, status: 'pending', progress: 0 })
  }
}

async function startUpload() {
  if (uploading.value) return
  uploading.value = true
  error.value = ''

  for (const item of queue.value) {
    if (item.status !== 'pending') continue
    item.status = 'uploading'
    item.progress = 0

    // 模拟进度
    const progressInterval = setInterval(() => {
      if (item.progress < 90) item.progress += Math.random() * 15
    }, 300)

    try {
      const result = await uploadDocument(item.file, category.value || undefined)
      if (!isDocumentUploadResponse(result)) {
        throw new Error('后端返回非文档上传载荷')
      }
      clearInterval(progressInterval)
      item.progress = 100
      item.status = 'done'
      history.value.unshift({ ...result, category: categoryLabel(category.value) })
      governanceDocuments.value.unshift({
        id: result.documentId,
        title: result.fileName,
        category: categoryLabel(category.value),
        version: 'V1.0',
        summary: '新上传文档已进入治理队列，等待分块索引和引用范围确认。',
        indexStatus: 'pending',
        validUntil: '待填写',
        freshnessStatus: '即将过期',
        references: ['待确认'],
        owner: '知识库管理员',
        recommendedAction: '确认文档分类、有效期和引用范围后再重建索引。',
        auditHint: '待生成审计编号',
      })
    } catch (e: unknown) {
      clearInterval(progressInterval)
      item.status = 'error'
      item.errorMsg = errorMessage(e, '上传失败')
    }
  }

  uploading.value = false
}

function applyKnowledgeReview(document: KnowledgeGovernanceSourceDocument): KnowledgeGovernanceSourceDocument {
  return applyKnowledgeGovernanceReviewToDocument(document)
}

function qualityKnowledgeSampleDocuments(): KnowledgeGovernanceSourceDocument[] {
  return qualityKnowledgeSamples.value.map(sample => ({
    id: sample.documentId,
    title: sample.documentTitle,
    category: '质量文档',
    version: sample.version,
    summary: sample.summary,
    indexStatus: 'indexed',
    validUntil: sample.validUntil,
    freshnessStatus: '有效',
    references: sample.reuseTargets,
    owner: '质量工程师 / 知识库管理员',
    recommendedAction: '保持扫码返工样本与质量闭环、AI 助手和审计日志的引用范围一致。',
    auditHint: sample.auditId,
  }))
}

function handleKnowledgeReview(document: KnowledgeGovernanceSourceDocument) {
  let review: ReturnType<typeof writeKnowledgeGovernanceReview>
  try {
    review = writeKnowledgeGovernanceReview(createDefaultKnowledgeGovernanceReview(new Date().toISOString(), {
      documentId: document.id,
      documentTitle: document.title,
      version: document.version,
    }))
  } catch (e: unknown) {
    error.value = `知识文档索引复核失败，当前文档仍未进入可审计治理闭环：${errorMessage(e, '请稍后重试')}`
    return
  }
  governanceDocuments.value = governanceDocuments.value.map(item =>
    item.id === document.id ? applyKnowledgeReview(item) : item
  )
  history.value.unshift({
    documentId: review.auditId,
    fileName: `${review.auditId} ${review.documentTitle}_${review.reviewedVersion}_索引复核`,
    chunkCount: 12,
    uploadedAt: review.reviewedAt,
    status: 'done',
    category: 'RAG 治理',
  })
}

function handleQualityRetrainingApproval(reviewQueueId: string) {
  const reviewRecord = qualityKnowledgeReviewRecords.value.find(item => item.id === reviewQueueId)
  if (!reviewRecord) return
  let version: QualityKnowledgeRetrainingVersionRecord
  try {
    version = approveQualityKnowledgeRetrainingCandidate(reviewRecord)
  } catch (e: unknown) {
    error.value = `质量知识审批失败，当前训练集仍未进入发布前校验链路：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: version.approvalAuditId,
    fileName: `${version.trainingSetVersion}_${version.trainingSetName}_审批`,
    chunkCount: version.positiveSampleCount + version.negativeSampleCount,
    uploadedAt: version.approvedAt,
    status: 'done',
    category: '质量再训练',
  })
}

function handleQualityRetrainingValidation(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  let validated: QualityKnowledgeRetrainingVersionRecord
  try {
    validated = runQualityKnowledgeRetrainingValidation(version)
  } catch (e: unknown) {
    error.value = `质量知识发布前校验失败，当前训练集仍停留在审批后状态：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: validated.validationAuditId ?? validated.approvalAuditId,
    fileName: `${validated.trainingSetVersion}_发布前校验未通过`,
    chunkCount: validated.validationFindings?.length ?? validated.validationGates.length,
    uploadedAt: validated.validatedAt ?? validated.approvedAt,
    status: 'done',
    category: '质量再训练校验',
  })
}

function handleQualityRetrainingValidationPass(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  let validated: QualityKnowledgeRetrainingVersionRecord
  try {
    validated = rerunQualityKnowledgeRetrainingValidationPass(version)
  } catch (e: unknown) {
    error.value = `质量知识发布前校验通过写入失败，当前训练集仍未进入可发布状态：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: validated.validationAuditId ?? validated.approvalAuditId,
    fileName: `${validated.trainingSetVersion}_发布前校验已通过`,
    chunkCount: validated.validationFindings?.length ?? validated.validationGates.length,
    uploadedAt: validated.validatedAt ?? validated.approvedAt,
    status: 'done',
    category: '质量再训练校验',
  })
}

function handleQualityRetrainingPublish(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  let published: QualityKnowledgeRetrainingVersionRecord
  try {
    published = publishQualityKnowledgeRetrainingVersion(version)
  } catch (e: unknown) {
    error.value = `质量知识正式发布失败，当前训练集仍未进入 AI 推荐链路：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst()
    .then(records => {
      qualityRetrainingVersions.value = records
      if (error.value.startsWith('质量知识正式发布读回失败')) error.value = ''
    })
    .catch((e: unknown) => {
      error.value = `质量知识正式发布读回失败，已保留本地发布历史：${errorMessage(e, '请稍后重试')}`
    })
  history.value.unshift({
    documentId: published.publishAuditId ?? published.approvalAuditId,
    fileName: `${published.trainingSetVersion}_发布到_AI_推荐链路`,
    chunkCount: published.recommendationScope?.length ?? 1,
    uploadedAt: published.publishedAt ?? published.approvedAt,
    status: 'done',
    category: '质量再训练发布',
  })
}

function handleQualityRetrainingRollback(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  let rolledBack: QualityKnowledgeRetrainingVersionRecord
  try {
    rolledBack = rollbackQualityKnowledgeRetrainingVersion(version)
  } catch (e: unknown) {
    error.value = `质量知识回滚失败，当前训练集仍保留在发布状态：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: rolledBack.rollbackAuditId ?? rolledBack.approvalAuditId,
    fileName: `${rolledBack.trainingSetVersion}_回滚到_${rolledBack.rollbackTargetVersion}`,
    chunkCount: rolledBack.negativeSampleCount,
    uploadedAt: rolledBack.rolledBackAt ?? rolledBack.approvedAt,
    status: 'done',
    category: '质量再训练回滚',
  })
}

function handleQualityNextTrainingMerge(recommendationFeedbackId: string) {
  const feedbackRecord = qualityRecommendationFeedbackRecords.value.find(item => item.id === recommendationFeedbackId)
  if (!feedbackRecord) return
  let version: QualityKnowledgeRetrainingVersionRecord
  try {
    version = mergeQualityKnowledgeNextTrainingSetCandidate(feedbackRecord)
  } catch (e: unknown) {
    error.value = `质量知识下一训练集合并失败，当前现场反馈仍未进入灰度前审批链路：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: version.approvalAuditId,
    fileName: `${version.trainingSetVersion}_现场反馈合并`,
    chunkCount: version.positiveSampleCount + version.negativeSampleCount,
    uploadedAt: version.approvedAt,
    status: 'done',
    category: '质量再训练合并',
  })
}

function handleQualityNextTrainingApproval(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  let approved: QualityKnowledgeRetrainingVersionRecord
  try {
    approved = approveQualityKnowledgeNextTrainingSetVersion(version)
  } catch (e: unknown) {
    error.value = `质量知识下一训练集审批失败，当前训练集仍未进入灰度前校验链路：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: approved.approvalAuditId,
    fileName: `${approved.trainingSetVersion}_R3训练集审批`,
    chunkCount: approved.positiveSampleCount + approved.negativeSampleCount,
    uploadedAt: approved.approvedAt,
    status: 'done',
    category: '质量再训练审批',
  })
}

function handleQualityNextTrainingValidation(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  const reopenedDecision = qualityGrayReleaseDecisionRecords.value.find(decision =>
    decision.trainingSetVersion === version.trainingSetVersion
    && decision.targetWorkOrderId === version.targetWorkOrderId
    && decision.operationCode === version.operationCode
    && decision.reviewIssueStatus === 'prevalidation_reopened'
  )
  const reopenedPending = !!reopenedDecision
    && version.status === 'gray_published'
    && !isQualityKnowledgeGrayRepublishEvidence(version)
  let validated: QualityKnowledgeRetrainingVersionRecord
  try {
    validated = runQualityKnowledgeNextTrainingSetValidationPass(version, new Date().toISOString(), reopenedPending ? 'reopened' : 'initial')
  } catch (e: unknown) {
    error.value = `质量知识下一训练集灰度前校验失败，当前训练集仍未进入灰度发布前可用状态：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: validated.validationAuditId ?? validated.approvalAuditId,
    fileName: `${validated.trainingSetVersion}_灰度前校验已通过`,
    chunkCount: validated.validationFindings?.length ?? validated.validationGates.length,
    uploadedAt: validated.validatedAt ?? validated.approvedAt,
    status: 'done',
    category: '质量再训练校验',
  })
}

function handleQualityNextTrainingGrayPublish(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  const reopenedDecision = qualityGrayReleaseDecisionRecords.value.find(decision =>
    decision.trainingSetVersion === version.trainingSetVersion
    && decision.targetWorkOrderId === version.targetWorkOrderId
    && decision.operationCode === version.operationCode
    && decision.reviewIssueStatus === 'prevalidation_reopened'
  )
  let published: QualityKnowledgeRetrainingVersionRecord
  try {
    published = grayPublishQualityKnowledgeNextTrainingSetVersion(version, new Date().toISOString(), reopenedDecision ? 'reopened' : 'initial')
  } catch (e: unknown) {
    error.value = `质量知识灰度发布失败，当前训练集仍停留在灰度前校验状态：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: published.publishAuditId ?? published.approvalAuditId,
    fileName: `${published.trainingSetVersion}_灰度发布到质量推荐链路`,
    chunkCount: published.recommendationScope?.length ?? 1,
    uploadedAt: published.publishedAt ?? published.approvedAt,
    status: 'done',
    category: '质量再训练灰度发布',
  })
}

function qualityExperimentCandidates() {
  return buildQualityKnowledgeRecommendationExperimentCandidateRecords(
    qualityRetrainingVersions.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value
  )
}

function handleQualityExperimentCandidateMerge(candidateId: string) {
  const candidate = qualityExperimentCandidates().find(item => item.id === candidateId)
  if (!candidate) return
  let version: QualityKnowledgeRetrainingVersionRecord
  try {
    version = mergeQualityExperimentNegativeSampleCandidate(candidate)
  } catch (e: unknown) {
    error.value = `质量实验候选合并失败，当前 R6 补样实验仍未进入影子验证准备链路：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: version.approvalAuditId,
    fileName: `${version.trainingSetVersion}_R6负样本补样已合并`,
    chunkCount: version.negativeSampleCount,
    uploadedAt: version.approvedAt,
    status: 'done',
    category: '质量实验候选',
  })
}

function handleQualityExperimentShadowValidation(candidateId: string) {
  const candidate = qualityExperimentCandidates().find(item => item.id === candidateId)
  if (!candidate) return
  let version: QualityKnowledgeRetrainingVersionRecord
  try {
    version = runQualityExperimentShadowValidationCandidate(candidate)
  } catch (e: unknown) {
    error.value = `质量实验影子验证失败，当前 R7 影子验证仍未进入可灰度发布状态：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  history.value.unshift({
    documentId: version.validationAuditId ?? version.approvalAuditId,
    fileName: `${version.trainingSetVersion}_R7影子验证已通过`,
    chunkCount: version.validationFindings?.length ?? version.validationGates.length,
    uploadedAt: version.validatedAt ?? version.approvedAt,
    status: 'done',
    category: '质量实验候选',
  })
}

function handleQualityExperimentShadowGrayPublish(versionId: string) {
  const version = qualityRetrainingVersions.value.find(item => item.id === versionId)
  if (!version) return
  let published: QualityKnowledgeRetrainingVersionRecord
  try {
    published = grayPublishQualityExperimentShadowValidationVersion(version)
  } catch (e: unknown) {
    error.value = `质量实验影子灰度发布失败，当前 R7 影子验证仍未发布到灰度范围：${errorMessage(e, '请稍后重试')}`
    return
  }
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  history.value.unshift({
    documentId: published.publishAuditId ?? published.approvalAuditId,
    fileName: `${published.trainingSetVersion}_R7影子灰度已发布`,
    chunkCount: published.recommendationScope?.length ?? 1,
    uploadedAt: published.publishedAt ?? published.approvedAt,
    status: 'done',
    category: '质量实验灰度发布',
  })
}

function removeFile(idx: number) {
  queue.value.splice(idx, 1)
}

function retryFile(idx: number) {
  const item = queue.value[idx]
  if (!item || item.status !== 'error') return
  item.status = 'pending'
  item.progress = 0
  item.errorMsg = undefined
}

function clearQueue() {
  queue.value = queue.value.filter(f => f.status === 'uploading')
}

function prepareCustomerOrderImport() {
  let evidence: CustomerOrderImportEvidence
  try {
    const written = writeCustomerOrderImportEvidence()
    if (!written) {
      throw new Error('客户工单导入样例未写入本地证据存储')
    }
    evidence = written
  } catch (e: unknown) {
    error.value = `客户工单导入样例生成失败，当前样例仍未进入 POC 验收证据链：${errorMessage(e, '请稍后重试')}`
    return
  }
  customerOrderImport.value = evidence
  history.value.unshift({
    documentId: evidence.batchId,
    fileName: evidence.fileName,
    chunkCount: evidence.importedOrders,
    uploadedAt: evidence.preparedAt,
    status: 'done',
    category: 'POC 工单样例',
  })
  if (!governanceDocuments.value.some(doc => doc.id === evidence.batchId)) {
    governanceDocuments.value.unshift({
      id: evidence.batchId,
      title: evidence.fileName,
      category: 'POC 工单样例',
      version: 'V1.0',
      summary: `${evidence.importedOrders} 单客户样例已完成字段映射，${evidence.highRiskOrders} 单进入风险与排产验证。`,
      indexStatus: 'indexed',
      validUntil: '2026-06-30',
      freshnessStatus: '有效',
      references: ['报表中心', 'AI 排产', '生产报工'],
      owner: '交付项目经理 / 知识库管理员',
      recommendedAction: '把客户字段映射、风险识别和排产验证结果纳入 POC 验收证据。',
      auditHint: evidence.batchId,
    })
  }
}

function categoryLabel(value: string) {
  const map: Record<string, string> = {
    process: '工艺文档',
    quality: '质量文档',
    equipment: '设备文档',
    standard: '标准规范',
  }
  return map[value] || '通用文档'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatTime(t: string) {
  return t?.slice(0, 16).replace('T', ' ') || ''
}

async function refreshQualityKnowledgeEvidence() {
  try {
    qualityKnowledgeSamples.value = await readQualityKnowledgeSamplesBackendFirst()
    qualityKnowledgeReviewRecords.value = await readQualityKnowledgeReviewQueueRecordsBackendFirst()
    qualityRecommendationFeedbackRecords.value = await readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst()
    qualityRetrainingVersions.value = await readQualityKnowledgeRetrainingVersionRecordsBackendFirst()
    qualityGrayReleaseDecisionRecords.value = await readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst()
    governanceDocuments.value = [
      ...qualityKnowledgeSampleDocuments(),
      ...readKnowledgeGovernanceDocuments(),
    ]
  } catch (e: unknown) {
    error.value = `质量知识证据刷新失败，已保留本地治理数据：${errorMessage(e, '请稍后重试')}`
  }
}

onMounted(async () => {
  await refreshCustomerOrderImportEvidence()
})

onMounted(refreshQualityKnowledgeEvidence)
</script>

<style scoped>
.upload-page { height: 100%; overflow-y: auto; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }

.upload-container { max-width: 640px; }

.upload-guidance {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
}

.upload-guidance h3,
.upload-guidance p {
  margin: 0;
}

.upload-guidance h3 {
  color: #111827;
  font-size: 14px;
}

.upload-guidance p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.guidance-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.guidance-links a {
  padding: 4px 8px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #fff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.guidance-links a:hover {
  border-color: #60a5fa;
  color: #1e40af;
}

.governance-anchor {
  scroll-margin-top: 16px;
}

.upload-help {
  max-width: 900px;
  margin: 18px 0;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
}

.upload-help h3 {
  margin: 0 0 8px;
  color: #111827;
  font-size: 14px;
}

.upload-help ul {
  margin: 0;
  padding-left: 18px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.6;
}

.customer-import-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.35fr);
  gap: 12px;
  max-width: 900px;
  margin: 18px 0;
  padding: 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.customer-import-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.customer-import-panel h3,
.customer-import-panel p {
  margin: 0;
}

.customer-import-panel h3 {
  color: #111827;
  font-size: 15px;
}

.customer-import-panel p,
.import-metrics span,
.import-metrics em {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.import-metrics {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #fff;
}

.import-metrics strong {
  color: #15803d;
  font-size: 24px;
}

.import-metrics em {
  font-style: normal;
}

.import-fields {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.import-fields span {
  padding: 3px 7px;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.btn-import {
  grid-column: 1 / -1;
  width: fit-content;
  border: none;
  background: #2563eb;
  color: #fff;
}

.btn-import:hover {
  background: #1d4ed8;
}

.drop-zone {
  position: relative;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 24px;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
}
.drop-zone:hover,
.drop-zone.dragover {
  border-color: #1890ff;
  background: #e6f7ff;
}
.drop-zone.has-error { border-color: #ff4d4f; background: #fff2f0; }

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.drop-content { pointer-events: none; }
.upload-icon { margin-bottom: 12px; }
.drop-text { font-size: 15px; color: #333; margin-bottom: 6px; }
.drop-text em { color: #1890ff; font-style: normal; font-weight: 600; }
.drop-hint { font-size: 12px; color: #999; }

.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}
.cat-label { font-size: 13px; color: #666; white-space: nowrap; }
.cat-select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  max-width: 200px;
}

.error-msg {
  padding: 8px 12px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 13px;
  margin-bottom: 12px;
}

.file-queue { margin: 12px 0; }
.file-queue h4 { font-size: 13px; margin: 0 0 8px; }
.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 4px;
}
.queue-info { display: flex; gap: 12px; align-items: center; }
.queue-name { font-size: 13px; font-weight: 500; }
.queue-size { font-size: 11px; color: #999; }
.queue-status { display: flex; align-items: center; gap: 8px; min-width: 120px; justify-content: flex-end; }
.status-done { color: #52c41a; font-size: 12px; }
.status-err { color: #ff4d4f; font-size: 12px; }
.queue-error {
  display: grid;
  justify-items: end;
  gap: 5px;
  max-width: min(420px, 54vw);
  text-align: right;
}
.queue-recovery {
  margin: 0;
  color: #8c6d1f;
  font-size: 11px;
  line-height: 1.4;
}
.queue-recovery a {
  color: #096dd9;
  font-weight: 600;
  text-decoration: none;
}
.btn-retry-upload {
  width: fit-content;
  padding: 4px 10px;
  border: 1px solid #ffd666;
  border-radius: 4px;
  background: #fffbe6;
  color: #ad6800;
  font-size: 12px;
  cursor: pointer;
}
.progress-track { width: 80px; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #1890ff; border-radius: 3px; transition: width 0.3s; }
.btn-del { background: none; border: none; color: #999; cursor: pointer; font-size: 14px; padding: 2px; }
.btn-del:hover { color: #ff4d4f; }

.actions { display: flex; gap: 8px; margin-top: 12px; }
.btn { padding: 8px 20px; border-radius: 4px; font-size: 13px; cursor: pointer; }
.btn-clear { background: #fff; border: 1px solid #d9d9d9; color: #666; }
.btn-clear:hover { border-color: #bbb; }
.btn-upload { background: #1890ff; border: none; color: #fff; }
.btn-upload:hover { background: #40a9ff; }
.btn-upload:disabled { background: #91d5ff; cursor: not-allowed; }
.btn-retry { padding: 4px 10px; border: 1px solid #ffccc7; border-radius: 4px; background: #fff; color: #a8071a; font-size: 12px; }

/* 上传记录 */
.history-section { max-width: 800px; margin-top: 32px; }
.history-section h4 { font-size: 14px; margin: 0 0 12px; }
.history-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.history-table th { background: #fafafa; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.history-table td { padding: 8px; border-bottom: 1px solid #f5f5f5; }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.st-done { background: #f6ffed; color: #52c41a; }
.st-processing { background: #e6f7ff; color: #1890ff; }
.st-failed { background: #fff2f0; color: #ff4d4f; }
.empty-row { color: #bbb; text-align: center; padding: 24px; }
</style>
