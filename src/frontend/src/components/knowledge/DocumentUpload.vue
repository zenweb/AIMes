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

const canUpload = computed(() => queue.value.some(f => f.status === 'pending'))

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
    } catch (e: any) {
      clearInterval(progressInterval)
      item.status = 'error'
      item.errorMsg = e?.response?.data?.message || e?.message || '上传失败'
    }
  }

  uploading.value = false
}

function removeFile(idx: number) {
  queue.value.splice(idx, 1)
}

function clearQueue() {
  queue.value = queue.value.filter(f => f.status === 'uploading')
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
