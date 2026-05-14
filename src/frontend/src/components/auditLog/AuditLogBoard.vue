<template>
  <div class="audit-board">
    <div class="page-header">
      <h2 class="page-title">审计日志</h2>
    </div>

    <div class="toolbar">
      <select v-model="actionFilter" class="filter-select">
        <option value="">全部操作</option>
        <option value="POST">POST（创建）</option>
        <option value="PUT">PUT（更新）</option>
        <option value="DELETE">DELETE（删除）</option>
      </select>
      <span class="info-text">仅 Admin 角色可见</span>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>时间</th><th>用户</th><th>操作</th><th>资源</th><th>资源 ID</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td class="mono">{{ formatTime(log.createdAt) }}</td>
          <td>{{ log.userId }}</td>
          <td><span class="tag" :class="'act-' + log.action.toLowerCase()">{{ actionLabel(log.action) }}</span></td>
          <td>{{ log.resource }}</td>
          <td class="mono muted">{{ log.resourceId || '-' }}</td>
          <td><button class="btn-sm" @click="openDetail(log.id)">详情</button></td>
        </tr>
        <tr v-if="!logs.length"><td colspan="6" class="empty">暂无审计日志</td></tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} / {{ totalPages }} 页（共 {{ totalCount }} 条）</span>
      <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
    </div>

    <!-- 详情对话框 -->
    <div v-if="detail" class="modal-overlay" @click.self="detail = null">
      <div class="modal-content detail-modal">
        <h3>审计日志详情</h3>
        <div class="detail-grid">
          <div class="detail-field"><label>ID</label><span class="mono">{{ detail.id }}</span></div>
          <div class="detail-field"><label>用户</label><span>{{ detail.userId }}</span></div>
          <div class="detail-field"><label>操作</label><span class="tag" :class="'act-' + detail.action.toLowerCase()">{{ actionLabel(detail.action) }}</span></div>
          <div class="detail-field"><label>资源</label><span>{{ detail.resource }}</span></div>
          <div class="detail-field"><label>资源 ID</label><span class="mono">{{ detail.resourceId || '-' }}</span></div>
          <div class="detail-field"><label>IP 地址</label><span class="mono">{{ detail.ipAddress || '-' }}</span></div>
          <div class="detail-field"><label>User Agent</label><span class="ua">{{ detail.userAgent || '-' }}</span></div>
          <div class="detail-field"><label>时间</label><span>{{ formatTime(detail.createdAt) }}</span></div>
        </div>
        <div v-if="detail.newValues" class="detail-section">
          <label>新值</label>
          <pre class="json-block">{{ formatJson(detail.newValues) }}</pre>
        </div>
        <div v-if="detail.oldValues" class="detail-section">
          <label>旧值</label>
          <pre class="json-block">{{ formatJson(detail.oldValues) }}</pre>
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="detail = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { AuditLog, AuditLogDetail } from '../../types/auditLog'
import { getAuditLogs, getAuditLogDetail } from '../../api/auditLog'

const logs = ref<AuditLog[]>([])
const detail = ref<AuditLogDetail | null>(null)
const actionFilter = ref('')
const page = ref(1)
const pageSize = 20
const totalCount = ref(0)
const totalPages = ref(1)

async function load() {
  try {
    const result = await getAuditLogs(actionFilter.value || undefined, page.value, pageSize)
    logs.value = result.items
    totalCount.value = result.totalCount
    totalPages.value = result.totalPages || 1
  } catch {
    logs.value = [
      { id: 'al1', userId: 'admin', action: 'POST', resource: 'Equipment', resourceId: null, createdAt: new Date(Date.now() - 10800000).toISOString() },
      { id: 'al2', userId: 'operator1', action: 'PUT', resource: 'Production', resourceId: 'wo-001', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'al3', userId: 'admin', action: 'POST', resource: 'Purchase', resourceId: 'po-003', createdAt: new Date(Date.now() - 3600000).toISOString() },
    ]
    totalCount.value = logs.value.length
    totalPages.value = 1
  }
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  load()
}

async function openDetail(id: string) {
  try { detail.value = await getAuditLogDetail(id) }
  catch { detail.value = null }
}

function actionLabel(a: string) { return { POST: '创建', PUT: '更新', DELETE: '删除', PATCH: '修改' }[a] || a }
function formatTime(t: string) { return t?.slice(0, 19).replace('T', ' ') || '' }
function formatJson(s: string) { try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s } }

watch(actionFilter, () => { page.value = 1; load() })
onMounted(() => load())
</script>

<style scoped>
.audit-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
.filter-select { padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.info-text { font-size: 12px; color: #999; margin-left: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { background: #fafafa; padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid #f5f5f5; }
.mono { font-family: monospace; font-size: 12px; }
.muted { color: #999; }
.empty { text-align: center; color: #999; padding: 40px 0; }
.tag { font-size: 11px; padding: 2px 8px; border-radius: 3px; }
.act-post { background: #e6f7ff; color: #1890ff; }
.act-put { background: #fff7e6; color: #fa8c16; }
.act-delete { background: #fff2f0; color: #ff4d4f; }
.act-patch { background: #f6ffed; color: #52c41a; }
.btn-sm { padding: 3px 10px; border: 1px solid #d9d9d9; border-radius: 3px; background: #fff; cursor: pointer; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 8px; padding: 24px; max-width: 90vw; }
.detail-modal { width: 640px; }
.modal-content h3 { font-size: 16px; margin: 0 0 16px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.detail-field label { display: block; font-size: 11px; color: #999; margin-bottom: 2px; }
.detail-field span { font-size: 13px; color: #333; }
.detail-field .ua { font-size: 11px; word-break: break-all; }
.detail-section { margin-bottom: 12px; }
.detail-section label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.json-block { background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 200px; overflow: auto; white-space: pre-wrap; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel { padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font-size: 13px; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px 0; }
.page-btn { padding: 4px 14px; border: 1px solid #d9d9d9; border-radius: 4px; background: #fff; cursor: pointer; font-size: 13px; }
.page-btn:disabled { color: #ccc; cursor: not-allowed; background: #fafafa; }
.page-info { font-size: 13px; color: #666; }
</style>
