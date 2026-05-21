<template>
  <div class="upload-page">
    <h2 class="page-title">文档上传</h2>

    <div class="upload-container">
      <!-- 拖拽上传区 -->
      <div
        class="drop-zone"
        :class="{ dragover: dragOver, 'has-error': error }"
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
      <div v-if="error" class="error-msg">{{ error }}</div>

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
            <span v-else-if="f.status === 'error'" class="status-err">{{ f.errorMsg }}</span>
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
      <div class="import-metrics">
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

    <!-- 上传记录 -->
    <div class="history-section">
      <h4>上传记录</h4>
      <table class="history-table">
        <thead>
          <tr><th>文件名</th><th>分类</th><th>分块数</th><th>状态</th><th>时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in history" :key="r.documentId">
            <td>{{ r.fileName }}</td>
            <td>{{ r.category }}</td>
            <td>{{ r.chunkCount }}</td>
            <td><span class="tag st-{{ r.status }}">{{ r.status }}</span></td>
            <td>{{ formatTime(r.uploadedAt) }}</td>
          </tr>
          <tr v-if="!history.length">
            <td colspan="5" class="empty-row">暂无上传记录</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadDocument } from '../../api/knowledge'
import type { DocumentUploadResponse } from '../../types/knowledge'
import {
  readCustomerOrderImportEvidence,
  writeCustomerOrderImportEvidence,
  type CustomerOrderImportEvidence,
} from '../../utils/customer-order-import-sync'
import {
  createDefaultKnowledgeGovernanceReview,
  readKnowledgeGovernanceReview,
  writeKnowledgeGovernanceReview,
} from '../../utils/knowledge-governance-sync'
import {
  approveQualityKnowledgeRetrainingCandidate,
  buildQualityKnowledgeAssetGovernanceRecords,
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  approveQualityKnowledgeNextTrainingSetVersion,
  grayPublishQualityExperimentShadowValidationVersion,
  mergeQualityExperimentNegativeSampleCandidate,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeRetrainingVersionRecords,
  readQualityKnowledgeReviewQueueRecords,
  readQualityKnowledgeSamples,
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
import KnowledgeGovernancePanel, {
  type KnowledgeGovernanceDocument,
} from './KnowledgeGovernancePanel.vue'

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
const queue = ref<QueueFile[]>([])
const uploading = ref(false)
const history = ref<(DocumentUploadResponse & { category: string })[]>([])
const customerOrderImport = ref<CustomerOrderImportEvidence | null>(readCustomerOrderImportEvidence())
const qualityRetrainingVersions = ref<QualityKnowledgeRetrainingVersionRecord[]>(readQualityKnowledgeRetrainingVersionRecords())
const qualityGrayReleaseDecisionRecords = ref(readQualityKnowledgeGrayReleaseDecisionRecords())
const qualityKnowledgeAssets = computed(() =>
  buildQualityKnowledgeAssetGovernanceRecords(
    readQualityKnowledgeSamples(),
    readQualityKnowledgeReviewQueueRecords(),
    qualityRetrainingVersions.value,
    readQualityKnowledgeRecommendationFeedbackRecords(),
    qualityGrayReleaseDecisionRecords.value
  )
)
const governanceDocuments = ref<KnowledgeGovernanceDocument[]>(([
  ...qualityKnowledgeSampleDocuments(),
  {
    id: 'kg-sop-cnc',
    title: 'CNC 精加工 SOP',
    category: '工艺文档',
    version: 'V2.3',
    summary: '用于 OP-020 CNC 精加工参数、首件确认和刀具寿命预警。',
    indexStatus: 'indexed',
    validUntil: '2026-12-31',
    freshnessStatus: '有效',
    references: ['AI 生产助手', '工艺路线', '生产报工'],
  },
  {
    id: 'kg-quality-torque',
    title: '装配扭矩检验规范',
    category: '质量文档',
    version: 'V1.8',
    summary: '定义 OP-040 扭矩 32-36 N.m 的检验窗口和复验规则。',
    indexStatus: 'indexed',
    validUntil: '2026-06-05',
    freshnessStatus: '即将过期',
    references: ['质量闭环', 'AI 生产助手'],
  },
  {
    id: 'kg-equipment-cnc-maint',
    title: 'CNC-01 主轴维护手册',
    category: '设备文档',
    version: 'V1.1',
    summary: '用于设备健康下降、主轴振动和预防维护窗口推荐。',
    indexStatus: 'pending',
    validUntil: '2026-05-10',
    freshnessStatus: '已过期',
    references: ['设备维护', '风险预警', 'AI 排产'],
  },
] satisfies KnowledgeGovernanceDocument[]).map(applyKnowledgeReview))

const canUpload = computed(() => queue.value.some(f => f.status === 'pending'))
const importMappedFields = computed(() => customerOrderImport.value?.mappedFields ?? ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'])

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
      clearInterval(progressInterval)
      item.progress = 100
      item.status = 'done'
      history.value.unshift({ ...result, category: category.value || '通用' })
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
      })
    } catch (e: any) {
      clearInterval(progressInterval)
      item.status = 'error'
      item.errorMsg = e?.response?.data?.message || e?.message || '上传失败'
    }
  }

  uploading.value = false
}

function applyKnowledgeReview(document: KnowledgeGovernanceDocument): KnowledgeGovernanceDocument {
  const review = readKnowledgeGovernanceReview(document.id)
  if (!review) return document
  return {
    ...document,
    version: review.reviewedVersion,
    summary: review.summary,
    indexStatus: 'indexed',
    validUntil: review.validUntil,
    freshnessStatus: '有效',
    references: review.references,
  }
}

function qualityKnowledgeSampleDocuments(): KnowledgeGovernanceDocument[] {
  return readQualityKnowledgeSamples().map(sample => ({
    id: sample.documentId,
    title: sample.documentTitle,
    category: '质量文档',
    version: sample.version,
    summary: sample.summary,
    indexStatus: 'indexed',
    validUntil: sample.validUntil,
    freshnessStatus: '有效',
    references: sample.reuseTargets,
  }))
}

function handleKnowledgeReview(document: KnowledgeGovernanceDocument) {
  const review = writeKnowledgeGovernanceReview(createDefaultKnowledgeGovernanceReview(new Date().toISOString(), {
    documentId: document.id,
    documentTitle: document.title,
    version: document.version,
  }))
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
  const reviewRecord = readQualityKnowledgeReviewQueueRecords().find(item => item.id === reviewQueueId)
  if (!reviewRecord) return
  const version = approveQualityKnowledgeRetrainingCandidate(reviewRecord)
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
  const validated = runQualityKnowledgeRetrainingValidation(version)
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
  const validated = rerunQualityKnowledgeRetrainingValidationPass(version)
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
  const published = publishQualityKnowledgeRetrainingVersion(version)
  qualityRetrainingVersions.value = readQualityKnowledgeRetrainingVersionRecords()
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
  const rolledBack = rollbackQualityKnowledgeRetrainingVersion(version)
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
  const feedbackRecord = readQualityKnowledgeRecommendationFeedbackRecords().find(item => item.id === recommendationFeedbackId)
  if (!feedbackRecord) return
  const version = mergeQualityKnowledgeNextTrainingSetCandidate(feedbackRecord)
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
  const approved = approveQualityKnowledgeNextTrainingSetVersion(version)
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
  const validated = runQualityKnowledgeNextTrainingSetValidationPass(version, new Date().toISOString(), reopenedPending ? 'reopened' : 'initial')
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
  const published = grayPublishQualityKnowledgeNextTrainingSetVersion(version, new Date().toISOString(), reopenedDecision ? 'reopened' : 'initial')
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
    readQualityKnowledgeRecommendationFeedbackRecords(),
    qualityGrayReleaseDecisionRecords.value
  )
}

function handleQualityExperimentCandidateMerge(candidateId: string) {
  const candidate = qualityExperimentCandidates().find(item => item.id === candidateId)
  if (!candidate) return
  const version = mergeQualityExperimentNegativeSampleCandidate(candidate)
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
  const version = runQualityExperimentShadowValidationCandidate(candidate)
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
  const published = grayPublishQualityExperimentShadowValidationVersion(version)
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

function clearQueue() {
  queue.value = queue.value.filter(f => f.status === 'uploading')
}

function prepareCustomerOrderImport() {
  const evidence = writeCustomerOrderImportEvidence()
  if (!evidence) return
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
</script>

<style scoped>
.upload-page { height: 100%; overflow-y: auto; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }

.upload-container { max-width: 640px; }

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
