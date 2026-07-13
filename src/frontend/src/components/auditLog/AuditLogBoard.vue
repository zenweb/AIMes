<template>
  <div class="audit-board">
    <div class="page-header">
      <h2 class="page-title">{{ tr('title') }}</h2>
    </div>

    <section class="audit-pro-hero" :aria-label="tr('replayAria')">
      <div>
        <span class="audit-eyebrow">Evidence Replay Console</span>
        <h1>{{ tr('heroTitle') }}</h1>
        <p>{{ tr('heroDescription') }}</p>
      </div>
      <div class="audit-hero-steps">
        <div>
          <span>01</span><strong>{{ tr('input') }}</strong
          ><em>{{ tr('inputDetail') }}</em>
        </div>
        <div>
          <span>02</span><strong>{{ tr('suggestion') }}</strong
          ><em>{{ tr('suggestionDetail') }}</em>
        </div>
        <div>
          <span>03</span><strong>{{ tr('action') }}</strong
          ><em>{{ tr('actionDetail') }}</em>
        </div>
        <div>
          <span>04</span><strong>{{ tr('replay') }}</strong
          ><em>{{ tr('replayDetail') }}</em>
        </div>
      </div>
    </section>

    <AuditDecisionReplayPanel />

    <div v-if="loadError" class="audit-list-alert" role="alert" aria-live="assertive">
      {{ loadError }}
    </div>

    <div class="toolbar">
      <select v-model="actionFilter" class="filter-select">
        <option value="">{{ tr('allActions') }}</option>
        <option value="POST">{{ tr('post') }}</option>
        <option value="PUT">{{ tr('put') }}</option>
        <option value="DELETE">{{ tr('delete') }}</option>
        <option value="PATCH">{{ tr('patch') }}</option>
      </select>
      <span v-if="traceIdFilter" class="trace-filter">{{ auditMessage('traceReplay', { trace: traceIdFilter }) }}</span>
      <button v-if="traceIdFilter" class="btn-sm" type="button" @click="clearTraceFilter">
        {{ tr('clearFilter') }}
      </button>
      <span class="info-text">{{ tr('adminOnly') }}</span>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>{{ tr('time') }}</th>
          <th>{{ tr('user') }}</th>
          <th>{{ tr('operation') }}</th>
          <th>{{ tr('resource') }}</th>
          <th>{{ tr('resourceId') }}</th>
          <th>{{ tr('view') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td class="mono">{{ formatTime(log.createdAt) }}</td>
          <td>{{ log.userId }}</td>
          <td>
            <span class="tag" :class="'act-' + log.action.toLowerCase()">{{ actionLabel(log.action) }}</span>
          </td>
          <td>{{ log.resource }}</td>
          <td class="mono muted">{{ log.resourceId || '-' }}</td>
          <td>
            <button class="btn-sm" :aria-label="detailActionLabel(log)" @click="openDetail(log.id)">
              {{ tr('detail') }}
            </button>
          </td>
        </tr>
        <tr v-if="!logs.length">
          <td colspan="6" class="empty">{{ tr('empty') }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">{{ tr('previous') }}</button>
      <span class="page-info">{{ auditMessage('page', { page, totalPages, totalCount }) }}</span>
      <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">{{ tr('next') }}</button>
    </div>

    <!-- 详情对话框 -->
    <div v-if="detail" class="modal-overlay" @click.self="detail = null">
      <div class="modal-content detail-modal">
        <h3>{{ tr('detailTitle') }}</h3>
        <div class="detail-grid">
          <div class="detail-field">
            <label>ID</label><span class="mono">{{ detail.id }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('user') }}</label
            ><span>{{ detail.userId }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('operation') }}</label
            ><span class="tag" :class="'act-' + detail.action.toLowerCase()">{{ actionLabel(detail.action) }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('resource') }}</label
            ><span>{{ detail.resource }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('resourceId') }}</label
            ><span class="mono">{{ detail.resourceId || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('initiatedBy') }}</label><span>{{ detail.initiatedBy || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('businessKey') }}</label><span class="mono">{{ detail.businessKey || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('traceId') }}</label>
            <button
              v-if="detail.traceId"
              type="button"
              class="detail-trace-button mono"
              :aria-label="auditMessage('filterTrace', { trace: detail.traceId })"
              @click="filterByDetailTrace(detail.traceId)"
            >
              {{ detail.traceId }}
            </button>
            <span v-else>-</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('promptHash') }}</label><span class="mono">{{ detail.promptHash || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('contextHash') }}</label><span class="mono">{{ detail.contextHash || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('ipAddress') }}</label
            ><span class="mono">{{ detail.ipAddress || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('userAgent') }}</label
            ><span class="ua">{{ detail.userAgent || '-' }}</span>
          </div>
          <div class="detail-field">
            <label>{{ tr('time') }}</label
            ><span>{{ formatTime(detail.createdAt) }}</span>
          </div>
        </div>
        <div v-if="detail.newValues" class="detail-section">
          <label>{{ tr('newValue') }}</label>
          <pre class="json-block">{{ formatJson(detail.newValues) }}</pre>
        </div>
        <div v-if="detail.oldValues" class="detail-section">
          <label>{{ tr('oldValue') }}</label>
          <pre class="json-block">{{ formatJson(detail.oldValues) }}</pre>
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="detail = null">{{ tr('close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { AuditLog, AuditLogDetail } from '../../types/auditLog'
import { getAuditLogs, getAuditLogDetail } from '../../api/auditLog'
import AuditDecisionReplayPanel from './AuditDecisionReplayPanel.vue'
import { errorMessage } from '../../utils/error-message'
import { isOfflineDemoError } from '../../utils/offline-demo-mode'
import { useLocale } from '../../composables/useLocale'

const { t } = useLocale()

function tr(key: string): string {
  return t('audit', key)
}

function auditMessage(key: string, replacements: Record<string, string | number>): string {
  return Object.entries(replacements).reduce(
    (message, [name, value]) => message.replace(`{${name}}`, String(value)),
    tr(key),
  )
}

const logs = ref<AuditLog[]>([])
const detail = ref<AuditLogDetail | null>(null)
const loadError = ref('')
const actionFilter = ref('')
const traceIdFilter = ref(readAuditQueryParameter('traceId'))
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const totalPages = ref(1)

async function load() {
  try {
    const result = traceIdFilter.value
      ? await getAuditLogs(actionFilter.value || undefined, page.value, pageSize, traceIdFilter.value)
      : await getAuditLogs(actionFilter.value || undefined, page.value, pageSize)
    if (!Array.isArray(result.items)) {
      throw new Error(tr('nonArrayPayload'))
    }
    const malformedItem = result.items.find((item) => !isAuditLogRecord(item))
    if (malformedItem) {
      throw new Error(`${describeAuditLogCandidate(malformedItem)} ${tr('nonObjectPayload')}`)
    }
    logs.value = result.items
    totalCount.value = result.totalCount
    totalPages.value = result.totalPages || 1
    loadError.value = ''
  } catch (error) {
    if (traceIdFilter.value) {
      logs.value = []
      totalCount.value = 0
      totalPages.value = 1
      loadError.value = auditMessage('traceLoadFailed', {
        trace: traceIdFilter.value,
        reason: errorMessage(error, tr('retry')),
      })
      return
    }
    logs.value = [
      {
        id: 'al1',
        userId: 'admin',
        action: 'POST',
        resource: 'Equipment',
        resourceId: null,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'al2',
        userId: 'operator1',
        action: 'PUT',
        resource: 'Production',
        resourceId: 'wo-001',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'al3',
        userId: 'admin',
        action: 'POST',
        resource: 'Purchase',
        resourceId: 'po-003',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]
    totalCount.value = logs.value.length
    totalPages.value = 1
    if (isOfflineDemoError(error)) {
      loadError.value = ''
      return
    }
    loadError.value = auditMessage('listLoadFailed', { reason: errorMessage(error, tr('retry')) })
  }
}

function readAuditQueryParameter(name: string): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(name)?.trim() ?? ''
}

function clearTraceFilter() {
  traceIdFilter.value = ''
  page.value = 1
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', window.location.pathname)
  }
  void load()
}

function filterByDetailTrace(traceId: string) {
  traceIdFilter.value = traceId
  page.value = 1
  detail.value = null
  if (typeof window !== 'undefined') {
    const query = new URLSearchParams({ traceId })
    window.history.replaceState({}, '', `${window.location.pathname}?${query.toString()}`)
  }
  void load()
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  load()
}

async function openDetail(id: string) {
  try {
    const auditDetail = await getAuditLogDetail(id)
    if (!isAuditLogDetailRecord(auditDetail)) {
      throw new Error(auditMessage('nonObjectDetail', { id }))
    }
    detail.value = auditDetail
    loadError.value = ''
  } catch (error) {
    detail.value = null
    loadError.value = auditMessage('detailLoadFailed', { reason: errorMessage(error, tr('retry')) })
  }
}

function isAuditLogDetailRecord(value: unknown): value is AuditLogDetail {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Partial<AuditLogDetail>
  return (
    typeof record.id === 'string' &&
    typeof record.userId === 'string' &&
    typeof record.action === 'string' &&
    typeof record.resource === 'string' &&
    typeof record.createdAt === 'string' &&
    Object.prototype.hasOwnProperty.call(record, 'newValues') &&
    Object.prototype.hasOwnProperty.call(record, 'oldValues')
  )
}

function isAuditLogRecord(value: unknown): value is AuditLog {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Partial<AuditLog>
  return (
    typeof record.id === 'string' &&
    typeof record.userId === 'string' &&
    typeof record.action === 'string' &&
    typeof record.resource === 'string' &&
    typeof record.createdAt === 'string' &&
    Object.prototype.hasOwnProperty.call(record, 'resourceId')
  )
}

function describeAuditLogCandidate(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return tr('unknown')
  const id = (value as Partial<AuditLog>).id
  return typeof id === 'string' && id ? id : tr('unknown')
}

function actionLabel(a: string) {
  return { POST: tr('created'), PUT: tr('updated'), DELETE: tr('deleted'), PATCH: tr('modified') }[a] || a
}
function detailActionLabel(log: AuditLog) {
  return auditMessage('detailAria', {
    user: log.userId,
    action: actionLabel(log.action),
    resource: log.resource,
    resourceId: log.resourceId || '-',
  })
}
function formatTime(t: string) {
  return t?.slice(0, 19).replace('T', ' ') || ''
}
function formatJson(s: string) {
  try {
    return JSON.stringify(JSON.parse(s), null, 2)
  } catch {
    return s
  }
}

watch(actionFilter, () => {
  page.value = 1
  void load()
})
onMounted(() => {
  void load()
  const auditId = readAuditQueryParameter('id')
  if (auditId) void openDetail(auditId)
})
</script>

<style scoped>
.audit-board {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 16px;
}
.page-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 0;
}
.audit-pro-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(520px, 0.9fr);
  gap: 16px;
  padding: 16px;
  border: 1px solid #d8e2ee;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(7, 17, 31, 0.96), rgba(14, 45, 76, 0.92)), #07111f;
  color: #f8fafc;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
}
.audit-eyebrow {
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.audit-pro-hero h1 {
  margin: 7px 0 0;
  font-size: 24px;
  font-weight: 800;
}
.audit-pro-hero p {
  margin: 7px 0 0;
  color: #cfe5ff;
  font-size: 13px;
  line-height: 1.55;
}
.audit-hero-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.audit-hero-steps div {
  padding: 10px;
  border: 1px solid rgba(125, 211, 252, 0.22);
  border-radius: 7px;
  background: rgba(2, 8, 23, 0.28);
}
.audit-hero-steps span {
  color: #7dd3fc;
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 800;
}
.audit-hero-steps strong {
  display: block;
  margin-top: 5px;
  color: #fff;
  font-size: 14px;
}
.audit-hero-steps em {
  display: block;
  margin-top: 3px;
  color: #a9c9e9;
  font-size: 11px;
  font-style: normal;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
.filter-select {
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
}
.info-text {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}
.audit-list-alert {
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  border-radius: 6px;
  background: #fff5f5;
  color: #991b1b;
  font-size: 13px;
  line-height: 1.5;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table th {
  background: #fafafa;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
}
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
}
.mono {
  font-family: monospace;
  font-size: 12px;
}
.muted {
  color: #999;
}
.detail-trace-button {
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1677ff;
  cursor: pointer;
  text-align: left;
  text-decoration: underline;
}
.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
}
.act-post {
  background: #e6f7ff;
  color: #1890ff;
}
.act-put {
  background: #fff7e6;
  color: #fa8c16;
}
.act-delete {
  background: #fff2f0;
  color: #ff4d4f;
}
.act-patch {
  background: #f6ffed;
  color: #52c41a;
}
.btn-sm {
  padding: 3px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 90vw;
}
.detail-modal {
  width: 640px;
}
.modal-content h3 {
  font-size: 16px;
  margin: 0 0 16px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.detail-field label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}
.detail-field span {
  font-size: 13px;
  color: #333;
}
.detail-field .ua {
  font-size: 11px;
  word-break: break-all;
}
.detail-section {
  margin-bottom: 12px;
}
.detail-section label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}
.json-block {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
}
.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
.btn-cancel {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 0;
}
.page-btn {
  padding: 4px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  background: #fafafa;
}
.page-info {
  font-size: 13px;
  color: #666;
}

@media (max-width: 1180px) {
  .audit-pro-hero,
  .audit-hero-steps {
    grid-template-columns: 1fr;
  }
}
</style>
