<template>
  <section class="knowledge-governance-panel" aria-label="知识库治理">
    <div class="governance-heading">
      <div>
        <span class="eyebrow">RAG 数据治理</span>
        <h3>分类、版本、索引状态与引用追踪</h3>
      </div>
      <span class="risk-badge" role="status" aria-live="polite" aria-label="知识库过期风险数量">
        {{ expiredCount }} 个过期风险
      </span>
    </div>

    <div class="governance-grid">
      <article
        v-for="item in documents"
        :key="item.id"
        class="governance-card"
        :class="[item.indexStatus, { stale: item.freshnessStatus !== '有效' }]"
      >
        <div class="doc-topline">
          <span>{{ item.category }}</span>
          <strong>{{ item.version }}</strong>
        </div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.summary }}</p>
        <div class="doc-meta">
          <span>索引：{{ indexStatusLabel(item.indexStatus) }}</span>
          <span>有效期：{{ item.validUntil }}</span>
        </div>
        <div class="reference-list">
          <span v-for="ref in item.references" :key="ref">{{ ref }}</span>
        </div>
        <div v-if="item.freshnessStatus !== '有效'" class="stale-note">
          {{ item.freshnessStatus }}：需要复核后再进入 AI 生产助手引用。
        </div>
        <button
          v-if="item.indexStatus !== 'indexed' || item.freshnessStatus !== '有效'"
          type="button"
          class="review-button"
          :aria-label="`复核并重建索引：${item.title}`"
          @click="requestReview(item)"
        >
          复核并重建索引
        </button>
      </article>
    </div>

    <div class="quality-asset-panel" aria-label="质量知识资产治理">
      <div class="asset-heading">
        <div>
          <h4>质量知识资产治理</h4>
          <span>同一视图核对样本入库、直接复用禁用、负样本和再训练候选。</span>
        </div>
        <strong>{{ qualityAssets.length }} 项资产</strong>
      </div>
      <div v-if="qualityAssets.length" class="asset-grid">
        <article
          v-for="asset in qualityAssets"
          :key="asset.id"
          class="asset-card"
          :class="asset.statusClass"
        >
          <div class="asset-topline">
            <span>{{ asset.assetStage }}</span>
            <em :class="'asset-' + asset.statusClass">{{ asset.statusLabel }}</em>
          </div>
          <h5>{{ asset.title }}</h5>
          <p>{{ asset.summary }}</p>
          <div class="asset-meta">
            <span>{{ asset.scoreLabel }}</span>
            <code>{{ asset.traceId }}</code>
          </div>
          <div class="asset-policy">
            <span>下一步</span>
            <strong>{{ asset.nextAction }}</strong>
          </div>
          <div class="asset-policy">
            <span>审计编号</span>
            <code>{{ asset.auditId }}</code>
          </div>
          <div v-if="asset.references.length" class="asset-reference-list">
            <span v-for="ref in asset.references" :key="ref">{{ ref }}</span>
          </div>
          <div
            v-if="asset.assetStage === '再训练候选'"
            class="retraining-actions"
          >
            <button
              v-if="!retrainingVersionFor(asset)"
              type="button"
              class="review-button"
              :aria-label="`批准进入训练集：${asset.title}`"
              @click="approveRetraining(asset)"
            >
              批准进入训练集
            </button>
            <template v-else-if="retrainingVersionFor(asset)?.status !== 'rolled_back'">
              <button
                v-if="retrainingVersionFor(asset)?.status === 'approved'"
                type="button"
                class="review-button"
                :aria-label="`运行发布前校验：${asset.title}`"
                @click="validateRetraining(asset)"
              >
                运行发布前校验
              </button>
              <button
                v-if="retrainingVersionFor(asset)?.status === 'validation_failed'"
                type="button"
                class="review-button"
                :aria-label="`补齐字段并重新校验：${asset.title}`"
                @click="passRetrainingValidation(asset)"
              >
                补齐字段并重新校验
              </button>
              <button
                v-if="retrainingVersionFor(asset)?.status === 'validation_passed'"
                type="button"
                class="review-button publish"
                :aria-label="`发布到 AI 推荐：${asset.title}`"
                @click="publishRetraining(asset)"
              >
                发布到 AI 推荐
              </button>
              <button
                v-if="retrainingVersionFor(asset)?.status !== 'published'"
                type="button"
                class="review-button rollback"
                :aria-label="`回滚训练集版本：${asset.title}`"
                @click="rollbackRetraining(asset)"
              >
                回滚训练集版本
              </button>
              <span v-else class="publish-note">已发布到 AI 推荐链路，并保留审批、校验和发布审计。</span>
            </template>
            <span v-else class="rollback-note">已回滚，等待字段补齐后重新审批。</span>
          </div>
          <div
            v-if="asset.assetStage === '下一轮训练集'"
            class="retraining-actions"
          >
            <button
              v-if="!nextTrainingVersionFor(asset)"
              type="button"
              class="review-button"
              :aria-label="`合并现场反馈：${asset.title}`"
              @click="mergeNextTrainingSet(asset)"
            >
              合并现场反馈
            </button>
            <template v-else>
              <button
                v-if="nextTrainingVersionFor(asset)?.status === 'merged'"
                type="button"
                class="review-button"
                @click="approveNextTrainingSet(asset)"
              >
                批准 R3 训练集
              </button>
              <button
                v-if="nextTrainingVersionFor(asset)?.status === 'approved' || nextTrainingReopenedPending(asset)"
                type="button"
                class="review-button"
                @click="validateNextTrainingSet(asset)"
              >
                {{ nextTrainingReopenedPending(asset) ? '重新运行灰度前校验' : '运行灰度前校验' }}
              </button>
              <button
                v-if="nextTrainingVersionFor(asset)?.status === 'validation_passed'"
                type="button"
                class="review-button publish"
                @click="grayPublishNextTrainingSet(asset)"
              >
                {{ nextTrainingReopened(asset) ? '重新灰度发布 R3' : '灰度发布 R3' }}
              </button>
              <span v-if="nextTrainingVersionFor(asset)?.status === 'gray_published'" class="publish-note">R3 已灰度发布，并保留合并、审批、校验和发布审计。</span>
            </template>
          </div>
          <div
            v-if="asset.assetStage === '实验候选'"
            class="retraining-actions"
          >
            <button
              v-if="asset.experimentCandidateType === 'negative_sample_patch' && !experimentCandidateVersionFor(asset)"
              type="button"
              class="review-button"
              :aria-label="`合并 ${experimentCandidateVersionLabel(asset)} 负样本：${asset.title}`"
              @click="mergeExperimentCandidate(asset)"
            >
              合并 {{ experimentCandidateVersionLabel(asset) }} 负样本
            </button>
            <button
              v-if="asset.experimentCandidateType === 'shadow_validation' && canRunShadowValidation(asset)"
              type="button"
              class="review-button publish"
              :aria-label="`运行 ${experimentCandidateVersionLabel(asset)} 影子验证：${asset.title}`"
              @click="runShadowValidation(asset)"
            >
              运行 {{ experimentCandidateVersionLabel(asset) }} 影子验证
            </button>
            <button
              v-if="asset.experimentCandidateType === 'shadow_validation' && canPublishShadowGray(asset)"
              type="button"
              class="review-button publish"
              :aria-label="`发布 ${experimentCandidateVersionLabel(asset)} 影子灰度：${asset.title}`"
              @click="publishShadowGray(asset)"
            >
              发布 {{ experimentCandidateVersionLabel(asset) }} 影子灰度
            </button>
            <span
              v-if="asset.experimentCandidateType === 'negative_sample_patch' && experimentCandidateVersionFor(asset)"
              class="publish-note"
            >
              {{ experimentCandidateVersionLabel(asset) }} 负样本已合并，等待影子验证。
            </span>
            <span
              v-if="asset.experimentCandidateType === 'shadow_validation' && experimentCandidateVersionFor(asset)?.status === 'validation_passed'"
              class="publish-note"
            >
              {{ experimentCandidateVersionLabel(asset) }} 影子验证已通过，可准备扩大审批。
            </span>
            <span
              v-if="asset.experimentCandidateType === 'shadow_validation' && experimentCandidateVersionFor(asset)?.status === 'gray_published'"
              class="publish-note"
            >
              {{ experimentCandidateVersionLabel(asset) }} 影子灰度已发布，等待系统管理提交扩大并由质量主管确认。
            </span>
          </div>
        </article>
      </div>
      <div v-else class="asset-empty">
        质量闭环生成样本或低分复核后，这里会形成统一知识资产清单。
      </div>
    </div>

    <div class="assistant-trace-panel" aria-label="AI 助手引用链">
      <div class="trace-heading">
        <h4>AI 助手引用链</h4>
        <span>业务问答必须命中已索引来源，过期或待索引文档只作为阻断提示。</span>
      </div>
      <div class="trace-list">
        <article v-for="trace in citationTraces" :key="trace.id" class="trace-card">
          <div class="trace-topline">
            <strong>{{ trace.question }}</strong>
            <span :class="{ review: trace.status === '需复核' }">{{ trace.status }}</span>
          </div>
          <p>{{ trace.answerIntent }}</p>
          <div class="reference-list">
            <span v-for="source in trace.sources" :key="source.sourceId">{{ source.sourceName }}</span>
          </div>
          <div class="blocked-source">{{ trace.blockedSource }}</div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { readAssistantCitationTraces } from '../../utils/knowledge-citations'
import type {
  KnowledgeGovernanceSourceDocument,
  KnowledgeIndexStatus,
} from '../../utils/knowledge-governance-sync'
import {
  isQualityKnowledgeGrayRepublishEvidence,
  type QualityKnowledgeGrayReleaseDecisionRecord,
  type QualityKnowledgeAssetGovernanceRecord,
  type QualityKnowledgeRetrainingVersionRecord,
} from '../../utils/quality-knowledge-sample-sync'

export type KnowledgeGovernanceDocument = KnowledgeGovernanceSourceDocument

const props = defineProps<{
  documents: KnowledgeGovernanceDocument[]
  qualityAssets?: QualityKnowledgeAssetGovernanceRecord[]
  qualityRetrainingVersions?: QualityKnowledgeRetrainingVersionRecord[]
  qualityGrayReleaseDecisions?: QualityKnowledgeGrayReleaseDecisionRecord[]
}>()

const emit = defineEmits<{
  'document-reviewed': [document: KnowledgeGovernanceDocument]
  'quality-retraining-approved': [reviewQueueId: string]
  'quality-retraining-validated': [versionId: string]
  'quality-retraining-validation-passed': [versionId: string]
  'quality-retraining-published': [versionId: string]
  'quality-retraining-rolled-back': [versionId: string]
  'quality-next-training-merged': [recommendationFeedbackId: string]
  'quality-next-training-approved': [versionId: string]
  'quality-next-training-validated': [versionId: string]
  'quality-next-training-gray-published': [versionId: string]
  'quality-experiment-candidate-merged': [candidateId: string]
  'quality-experiment-shadow-validated': [candidateId: string]
  'quality-experiment-shadow-gray-published': [versionId: string]
}>()

const expiredCount = computed(() => props.documents.filter(item => item.freshnessStatus !== '有效').length)
const qualityAssets = computed(() => props.qualityAssets ?? [])
const qualityRetrainingVersions = computed(() => props.qualityRetrainingVersions ?? [])
const qualityGrayReleaseDecisions = computed(() => props.qualityGrayReleaseDecisions ?? [])
const citationTraces = computed(() => {
  props.documents.map(item => `${item.id}-${item.version}-${item.indexStatus}-${item.freshnessStatus}`).join('|')
  return readAssistantCitationTraces()
})

function indexStatusLabel(status: KnowledgeIndexStatus) {
  return {
    indexed: '已索引',
    pending: '待索引',
    failed: '失败',
  }[status]
}

function requestReview(document: KnowledgeGovernanceDocument) {
  emit('document-reviewed', document)
}

function reviewQueueIdFromAsset(asset: QualityKnowledgeAssetGovernanceRecord) {
  return asset.id.replace('quality-asset-retraining-', '')
}

function retrainingVersionFor(asset: QualityKnowledgeAssetGovernanceRecord) {
  const reviewQueueId = reviewQueueIdFromAsset(asset)
  return qualityRetrainingVersions.value.find(item => item.sourceReviewQueueId === reviewQueueId)
}

function approveRetraining(asset: QualityKnowledgeAssetGovernanceRecord) {
  emit('quality-retraining-approved', reviewQueueIdFromAsset(asset))
}

function validateRetraining(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = retrainingVersionFor(asset)
  if (!version) return
  emit('quality-retraining-validated', version.id)
}

function passRetrainingValidation(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = retrainingVersionFor(asset)
  if (!version) return
  emit('quality-retraining-validation-passed', version.id)
}

function publishRetraining(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = retrainingVersionFor(asset)
  if (!version) return
  emit('quality-retraining-published', version.id)
}

function rollbackRetraining(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = retrainingVersionFor(asset)
  if (!version) return
  emit('quality-retraining-rolled-back', version.id)
}

function recommendationFeedbackIdFromAsset(asset: QualityKnowledgeAssetGovernanceRecord) {
  return asset.id.replace('quality-asset-next-training-', '')
}

function nextTrainingVersionFor(asset: QualityKnowledgeAssetGovernanceRecord) {
  const feedbackId = recommendationFeedbackIdFromAsset(asset)
  const versionLabel = asset.title.split(' ')[0]
  return qualityRetrainingVersions.value.find(item =>
    item.sourceReviewQueueId === `recommendation-feedback-${feedbackId}`
    || item.trainingSetVersion === versionLabel
  )
}

function reopenedGrayDecisionFor(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = nextTrainingVersionFor(asset)
  if (!version) return undefined
  return qualityGrayReleaseDecisions.value.find(decision =>
    decision.trainingSetVersion === version.trainingSetVersion
    && decision.targetWorkOrderId === version.targetWorkOrderId
    && decision.operationCode === version.operationCode
    && decision.reviewIssueStatus === 'prevalidation_reopened'
  )
}

function nextTrainingReopened(asset: QualityKnowledgeAssetGovernanceRecord) {
  return !!reopenedGrayDecisionFor(asset)
}

function nextTrainingReopenedPending(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = nextTrainingVersionFor(asset)
  const decision = reopenedGrayDecisionFor(asset)
  if (!version || !decision || version.status !== 'gray_published') return false
  return !isQualityKnowledgeGrayRepublishEvidence(version)
}

function mergeNextTrainingSet(asset: QualityKnowledgeAssetGovernanceRecord) {
  emit('quality-next-training-merged', recommendationFeedbackIdFromAsset(asset))
}

function approveNextTrainingSet(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = nextTrainingVersionFor(asset)
  if (!version) return
  emit('quality-next-training-approved', version.id)
}

function validateNextTrainingSet(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = nextTrainingVersionFor(asset)
  if (!version) return
  emit('quality-next-training-validated', version.id)
}

function grayPublishNextTrainingSet(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = nextTrainingVersionFor(asset)
  if (!version) return
  emit('quality-next-training-gray-published', version.id)
}

function experimentCandidateIdFromAsset(asset: QualityKnowledgeAssetGovernanceRecord) {
  return asset.id.replace('quality-asset-', '')
}

function experimentCandidateVersionLabel(asset: QualityKnowledgeAssetGovernanceRecord) {
  return asset.title.split(' ')[0]?.match(/R\d+$/)?.[0] ?? '候选'
}

function experimentCandidateVersionFor(asset: QualityKnowledgeAssetGovernanceRecord) {
  return qualityRetrainingVersions.value.find(item => item.sourceReviewQueueId === `experiment-candidate-${experimentCandidateIdFromAsset(asset)}`)
}

function mergedNegativeCoverageVersionFor(asset: QualityKnowledgeAssetGovernanceRecord) {
  const candidateVersion = asset.title.split(' ')[0]
  const suffixNumber = Number(candidateVersion.match(/R(\d+)$/)?.[1] ?? '0')
  if (!suffixNumber) return undefined
  const patchVersion = candidateVersion.replace(/R\d+$/, `R${suffixNumber - 1}`)
  return qualityRetrainingVersions.value.find(item =>
    item.trainingSetVersion === patchVersion
    && item.sourceReviewQueueId.includes('negative-coverage')
  )
}

function canRunShadowValidation(asset: QualityKnowledgeAssetGovernanceRecord) {
  return asset.experimentCandidateType === 'shadow_validation'
    && !experimentCandidateVersionFor(asset)
    && !!mergedNegativeCoverageVersionFor(asset)
}

function canPublishShadowGray(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = experimentCandidateVersionFor(asset)
  return asset.experimentCandidateType === 'shadow_validation'
    && version?.status === 'validation_passed'
}

function mergeExperimentCandidate(asset: QualityKnowledgeAssetGovernanceRecord) {
  emit('quality-experiment-candidate-merged', experimentCandidateIdFromAsset(asset))
}

function runShadowValidation(asset: QualityKnowledgeAssetGovernanceRecord) {
  emit('quality-experiment-shadow-validated', experimentCandidateIdFromAsset(asset))
}

function publishShadowGray(asset: QualityKnowledgeAssetGovernanceRecord) {
  const version = experimentCandidateVersionFor(asset)
  if (!version) return
  emit('quality-experiment-shadow-gray-published', version.id)
}
</script>

<style scoped>
.knowledge-governance-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
  padding: 14px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.governance-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

h3,
h4,
p {
  margin: 0;
}

h3 {
  color: #111827;
  font-size: 16px;
}

.risk-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.governance-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.governance-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 170px;
  padding: 11px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.governance-card.indexed {
  border-color: #bbf7d0;
}

.governance-card.pending {
  border-color: #fde68a;
}

.governance-card.failed,
.governance-card.stale {
  border-color: #fecaca;
}

.doc-topline,
.doc-meta,
.reference-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.doc-topline span,
.doc-meta span,
.reference-list span {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 12px;
}

.doc-topline strong {
  color: #111827;
  font-size: 12px;
}

.governance-card h4 {
  color: #111827;
  font-size: 14px;
}

.governance-card p,
.stale-note {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.stale-note {
  margin-top: auto;
  padding: 7px;
  border-radius: 4px;
  background: #fff1f2;
  color: #be123c;
  font-weight: 700;
}

.review-button {
  width: fit-content;
  padding: 5px 10px;
  border: 1px solid #1d4ed8;
  border-radius: 4px;
  background: #1d4ed8;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.review-button:hover {
  background: #1e40af;
}

.review-button.rollback {
  border-color: #b91c1c;
  background: #b91c1c;
}

.review-button.rollback:hover {
  background: #991b1b;
}

.review-button.publish {
  border-color: #15803d;
  background: #15803d;
}

.review-button.publish:hover {
  background: #166534;
}

.quality-asset-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
}

.asset-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.asset-heading span {
  display: block;
  margin-top: 3px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.asset-heading strong {
  flex: 0 0 auto;
  color: #92400e;
  font-size: 18px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.asset-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 230px;
  padding: 11px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.asset-card.accepted {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.asset-card.guarded {
  border-color: #fecaca;
  background: #fef2f2;
}

.asset-card.logged {
  border-color: #fde68a;
  background: #fffbeb;
}

.asset-topline,
.asset-meta,
.asset-policy,
.asset-reference-list {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.asset-topline,
.asset-meta,
.asset-policy {
  justify-content: space-between;
}

.asset-reference-list {
  flex-wrap: wrap;
}

.asset-topline span,
.asset-topline em,
.asset-meta span,
.asset-reference-list span {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.asset-topline span {
  background: #111827;
  color: #fff;
}

.asset-reference-list span {
  background: rgba(37, 99, 235, 0.09);
  color: #1d4ed8;
  line-height: 1.35;
}

.asset-topline em {
  flex: 0 0 auto;
  font-style: normal;
}

.asset-accepted {
  background: #dcfce7;
  color: #166534;
}

.asset-guarded {
  background: #fee2e2;
  color: #991b1b;
}

.asset-logged {
  background: #fef3c7;
  color: #92400e;
}

.asset-card h5 {
  margin: 0;
  color: #111827;
  font-size: 14px;
}

.asset-card p,
.asset-policy strong,
.asset-policy span,
.asset-empty {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.asset-policy {
  padding-top: 7px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.asset-policy span {
  flex: 0 0 52px;
  color: #6b7280;
}

.asset-policy strong {
  font-weight: 600;
  text-align: right;
}

.asset-card code,
.asset-policy code {
  color: #1d4ed8;
  font-family: monospace;
  font-size: 12px;
  text-align: right;
}

.asset-empty {
  padding: 10px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
}

.retraining-actions {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

.rollback-note,
.publish-note {
  display: block;
  padding: 7px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.rollback-note {
  background: #fee2e2;
  color: #991b1b;
}

.publish-note {
  background: #dcfce7;
  color: #166534;
}

.assistant-trace-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  background: #f9fafb;
}

.trace-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.trace-heading span {
  max-width: 520px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
  text-align: right;
}

.trace-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.trace-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.trace-topline {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.trace-topline strong {
  color: #111827;
  font-size: 13px;
  line-height: 1.35;
}

.trace-topline span {
  flex: 0 0 auto;
  padding: 2px 6px;
  border-radius: 4px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
}

.trace-topline span.review {
  background: #fff7ed;
  color: #c2410c;
}

.trace-card p,
.blocked-source {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.blocked-source {
  margin-top: auto;
  padding: 7px;
  border-radius: 4px;
  background: #fef2f2;
  color: #991b1b;
}

@media (max-width: 1180px) {
  .governance-grid,
  .asset-grid,
  .trace-list {
    grid-template-columns: 1fr;
  }

  .trace-heading {
    flex-direction: column;
  }

  .trace-heading span {
    text-align: left;
  }
}
</style>
