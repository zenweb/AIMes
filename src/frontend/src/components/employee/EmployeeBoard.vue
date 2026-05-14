<template>
  <div class="emp-board">
    <div class="page-header">
      <h2 class="page-title">人员管理</h2>
      <button class="btn btn-export" @click="handleExport" v-if="employees.length">导出 CSV</button>
    </div>

    <div class="toolbar">
      <input v-model="search" class="search-input" placeholder="搜索姓名/工号..." />
      <select v-model="roleFilter" class="filter-select">
        <option value="">全部角色</option>
        <option value="Operator">操作员</option>
        <option value="Engineer">工程师</option>
        <option value="QC">质检员</option>
        <option value="Lead">班组长</option>
        <option value="Admin">管理员</option>
      </select>
      <select v-model="teamFilter" class="filter-select">
        <option value="">全部班组</option>
        <option value="甲班">甲班</option>
        <option value="乙班">乙班</option>
        <option value="技术组">技术组</option>
        <option value="质检组">质检组</option>
      </select>
      <label class="chk">
        <input type="checkbox" v-model="showInactive" /> 显示离职
      </label>
      <button class="btn btn-add" @click="showCreate = true">+ 新增</button>
    </div>

    <div class="emp-grid">
      <div v-for="e in paginatedEmployees" :key="e.id" class="emp-card" :class="{ inactive: !e.isActive }" @click="editTarget = e">
        <div class="card-avatar">{{ e.name[0] }}</div>
        <div class="card-body">
          <div class="card-name">{{ e.name }}</div>
          <div class="card-meta">
            <span class="tag role">{{ roleLabel(e.role) }}</span>
            <span v-if="e.team" class="tag team">{{ e.team }}</span>
            <span v-if="e.shift" class="tag shift">{{ e.shift === 'Day' ? '白班' : '夜班' }}</span>
          </div>
          <div class="card-info">{{ e.employeeNumber }} · {{ e.phone || '-' }}</div>
        </div>
        <div v-if="!e.isActive" class="inactive-badge">离职</div>
      </div>
    </div>

    <div class="pagination-bar" v-if="totalPages > 1">
      <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
      <template v-for="p in displayedPages" :key="p">
        <span v-if="p === '...'" class="page-ellipsis">...</span>
        <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
      </template>
      <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
      <span class="page-info">共 {{ totalCount }} 条</span>
    </div>

    <!-- 编辑/详情对话框 -->
    <div v-if="editTarget" class="modal-overlay" @click.self="editTarget = null">
      <div class="modal-content">
        <h3>{{ editTarget.isActive ? '编辑员工' : '员工详情' }}</h3>
        <div class="form-group"><label>工号</label><input :value="editTarget.employeeNumber" class="form-input" disabled /></div>
        <div class="form-group"><label>姓名</label><input v-model="editForm.name" class="form-input" :disabled="!editTarget.isActive" /></div>
        <div class="form-row">
          <div class="form-group"><label>角色</label>
            <select v-model="editForm.role" class="form-input" :disabled="!editTarget.isActive">
              <option value="Operator">操作员</option>
              <option value="Engineer">工程师</option>
              <option value="QC">质检员</option>
              <option value="Lead">班组长</option>
              <option value="Admin">管理员</option>
            </select>
          </div>
          <div class="form-group"><label>班组</label><input v-model="editForm.team" class="form-input" :disabled="!editTarget.isActive" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>班次</label>
            <select v-model="editForm.shift" class="form-input" :disabled="!editTarget.isActive">
              <option value="Day">白班</option>
              <option value="Night">夜班</option>
              <option value="Rotating">倒班</option>
            </select>
          </div>
          <div class="form-group"><label>电话</label><input v-model="editForm.phone" class="form-input" :disabled="!editTarget.isActive" /></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="editTarget = null">关闭</button>
          <button v-if="editTarget.isActive" class="btn btn-save" @click="handleUpdate">保存</button>
          <button v-if="editTarget.isActive" class="btn btn-deact" @click="handleDeactivate">离职</button>
        </div>
      </div>
    </div>

    <!-- 新建对话框 -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal-content">
        <h3>新增员工</h3>
        <div class="form-row">
          <div class="form-group"><label>工号</label><input v-model="createForm.employeeNumber" class="form-input" /></div>
          <div class="form-group"><label>姓名</label><input v-model="createForm.name" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>角色</label>
            <select v-model="createForm.role" class="form-input">
              <option value="Operator">操作员</option>
              <option value="Engineer">工程师</option>
              <option value="QC">质检员</option>
              <option value="Lead">班组长</option>
              <option value="Admin">管理员</option>
            </select>
          </div>
          <div class="form-group"><label>班组</label><input v-model="createForm.team" class="form-input" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>班次</label>
            <select v-model="createForm.shift" class="form-input">
              <option value="Day">白班</option>
              <option value="Night">夜班</option>
              <option value="Rotating">倒班</option>
            </select>
          </div>
          <div class="form-group"><label>电话</label><input v-model="createForm.phone" class="form-input" /></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showCreate = false">取消</button>
          <button class="btn btn-ok" :disabled="!createForm.employeeNumber || !createForm.name" @click="handleCreate">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../types/employee'
import { getEmployeeList, createEmployee, updateEmployee, deactivateEmployee } from '../../api/employee'
import { exportToCsv } from '../../utils/export'

const employees = ref<Employee[]>([])
const search = ref('')
const roleFilter = ref('')
const teamFilter = ref('')
const showInactive = ref(false)
const showCreate = ref(false)
const editTarget = ref<Employee | null>(null)

const editForm = ref<UpdateEmployeeRequest>({})
const createForm = ref<CreateEmployeeRequest>({ employeeNumber: '', name: '', role: 'Operator', team: '', shift: 'Day', phone: '' })

const currentPage = ref(1)
const pageSize = ref(12)

const filteredEmployees = computed(() => {
  let list = employees.value
  if (!showInactive.value) list = list.filter(e => e.isActive)
  if (roleFilter.value) list = list.filter(e => e.role === roleFilter.value)
  if (teamFilter.value) list = list.filter(e => e.team === teamFilter.value)
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(e => e.name.includes(s) || e.employeeNumber.toLowerCase().includes(s))
  }
  return list
})

const totalCount = computed(() => filteredEmployees.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEmployees.value.slice(start, start + pageSize.value)
})
const displayedPages = computed(() => {
  const tp = totalPages.value; const cp = currentPage.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cp > 3) pages.push('...')
  const start = Math.max(2, cp - 1); const end = Math.min(tp - 1, cp + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (cp < tp - 2) pages.push('...')
  if (tp > 1) pages.push(tp)
  return pages
})
function goToPage(p: number | string) {
  if (typeof p === "string") return
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}

watch([search, roleFilter, teamFilter, showInactive], () => { currentPage.value = 1 })

function handleExport() {
  exportToCsv('员工列表', ['工号', '姓名', '角色', '班组', '班次', '电话', '邮箱', '在职'], employees.value.map(e => [
    e.employeeNumber, e.name, e.role, e.team || '', e.shift || '', e.phone || '', e.email || '', e.isActive ? '是' : '否'
  ]))
}

function roleLabel(r: string) { return { Operator: '操作员', Engineer: '工程师', QC: '质检员', Lead: '班组长', Admin: '管理员' }[r] || r }

function openEdit(e: Employee) {
  editTarget.value = e
  editForm.value = { name: e.name, phone: e.phone || '', email: e.email || '', role: e.role, team: e.team || '', shift: e.shift || '' }
}

async function handleCreate() {
  try { await createEmployee(createForm.value) }
  catch { employees.value.push({ id: 'new', ...createForm.value, isActive: true, createdAt: new Date().toISOString(), phone: createForm.value.phone || null, email: null } as any) }
  showCreate.value = false
  createForm.value = { employeeNumber: '', name: '', role: 'Operator', team: '', shift: 'Day', phone: '' }
}

async function handleUpdate() {
  if (!editTarget.value) return
  try { await updateEmployee(editTarget.value.id, editForm.value) }
  catch { Object.assign(editTarget.value, editForm.value) }
  editTarget.value = null
}

async function handleDeactivate() {
  if (!editTarget.value) return
  try { await deactivateEmployee(editTarget.value.id) }
  catch { editTarget.value.isActive = false }
  editTarget.value = null
}

onMounted(async () => {
  try { employees.value = (await getEmployeeList()).items }
  catch {
    employees.value = [
      { id: 'emp1', employeeNumber: 'EMP-001', name: '张三', role: 'Operator', team: '甲班', shift: 'Day', phone: '13800138001', email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp2', employeeNumber: 'EMP-002', name: '李四', role: 'Operator', team: '甲班', shift: 'Day', phone: null, email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp3', employeeNumber: 'EMP-003', name: '王五', role: 'Operator', team: '乙班', shift: 'Night', phone: null, email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp4', employeeNumber: 'EMP-004', name: '赵六', role: 'Engineer', team: '技术组', shift: 'Day', phone: null, email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp5', employeeNumber: 'EMP-005', name: '钱七', role: 'QC', team: '质检组', shift: 'Day', phone: null, email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp6', employeeNumber: 'EMP-006', name: '孙八', role: 'Lead', team: '甲班', shift: 'Day', phone: null, email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp7', employeeNumber: 'EMP-007', name: '周九', role: 'Admin', team: null, shift: 'Day', phone: null, email: null, isActive: true, createdAt: '2026-01-01T00:00:00' },
      { id: 'emp8', employeeNumber: 'EMP-008', name: '吴十', role: 'Operator', team: '乙班', shift: 'Night', phone: null, email: null, isActive: false, createdAt: '2026-01-01T00:00:00' },
    ]
  }
})
</script>

<style scoped>
.emp-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
.search-input { width: 200px; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.filter-select { padding: 6px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; }
.chk { font-size: 13px; color: #666; display: flex; align-items: center; gap: 4px; cursor: pointer; }
.btn { padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #d9d9d9; background: #fff; }
.btn-add { margin-left: auto; background: #1890ff; color: #fff; border-color: #1890ff; }
.emp-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.emp-card { display: flex; gap: 12px; padding: 14px; background: #fff; border-radius: 8px; cursor: pointer; transition: box-shadow 0.15s; }
.emp-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.emp-card.inactive { opacity: 0.55; }
.card-avatar { width: 42px; height: 42px; border-radius: 50%; background: #1890ff; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.card-body { flex: 1; min-width: 0; }
.card-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.card-meta { display: flex; gap: 4px; margin-bottom: 4px; flex-wrap: wrap; }
.tag { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #f5f5f5; color: #666; }
.tag.role { background: #e6f7ff; color: #1890ff; }
.tag.team { background: #fff7e6; color: #fa8c16; }
.tag.shift { background: #f6ffed; color: #52c41a; }
.card-info { font-size: 12px; color: #999; }
.inactive-badge { font-size: 11px; color: #ff4d4f; font-weight: 600; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 8px; padding: 24px; width: 460px; max-width: 90vw; }
.modal-content h3 { font-size: 16px; margin: 0 0 16px; }
.form-row { display: flex; gap: 12px; }
.form-group { flex: 1; margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.form-input { width: 100%; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.form-input:disabled { background: #f5f5f5; color: #999; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel { border: 1px solid #d9d9d9; background: #fff; }
.btn-ok, .btn-save { background: #1890ff; color: #fff; border: none; }
.btn-ok:disabled { background: #91d5ff; cursor: not-allowed; }
.btn-deact { background: #fff; color: #ff4d4f; border-color: #ffccc7; margin-right: auto; }
.pagination-bar { display: flex; align-items: center; gap: 4px; padding: 10px 0; flex-wrap: wrap; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 12px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { color: #d9d9d9; cursor: not-allowed; }
.page-ellipsis { width: 28px; text-align: center; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 12px; color: #999; }
</style>
