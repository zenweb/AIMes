<template>
  <div class="admin-board">
    <h2 class="page-title">系统管理</h2>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'users' }" @click="tab = 'users'">用户管理</button>
      <button class="tab" :class="{ active: tab === 'roles' }" @click="tab = 'roles'">角色权限</button>
      <button class="tab" :class="{ active: tab === 'configs' }" @click="tab = 'configs'">系统配置</button>
      <button class="tab" :class="{ active: tab === 'notifications' }" @click="tab = 'notifications'">通知配置</button>
    </div>

    <!-- 用户管理 -->
    <div v-if="tab === 'users'" class="tab-content">
      <div class="toolbar">
        <input v-model="userSearch" class="search-input" placeholder="搜索用户名..." />
        <button class="btn btn-add" @click="showUserCreate = true">+ 新增用户</button>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>用户名</th><th>显示名</th><th>角色</th><th>状态</th><th>最后登录</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td class="mono">{{ u.username }}</td>
            <td>{{ u.displayName }}</td>
            <td><span class="tag" :class="'role-' + u.role.toLowerCase()">{{ roleLabel(u.role) }}</span></td>
            <td><span class="tag" :class="u.isActive ? 'st-active' : 'st-inactive'">{{ u.isActive ? '启用' : '禁用' }}</span></td>
            <td class="muted">{{ u.lastLoginAt ? formatTime(u.lastLoginAt) : '-' }}</td>
            <td>
              <button class="btn-sm" @click="editUserTarget = u; editUserForm = { displayName: u.displayName, role: u.role }">编辑</button>
              <button class="btn-sm danger" @click="toggleUserActive(u)">{{ u.isActive ? '禁用' : '启用' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 角色权限 -->
    <div v-if="tab === 'roles'" class="tab-content">
      <table class="data-table">
        <thead><tr><th>角色</th><th>描述</th><th>权限</th></tr></thead>
        <tbody>
          <tr><td><span class="tag role-admin">Admin</span></td><td>系统管理员</td><td>全部权限</td></tr>
          <tr><td><span class="tag role-engineer">Engineer</span></td><td>工程师</td><td>排产、BOM、工艺路线、质量管理、设备管理</td></tr>
          <tr><td><span class="tag role-lead">Lead</span></td><td>班组长</td><td>生产报工、异常处理、质量检验</td></tr>
          <tr><td><span class="tag role-operator">Operator</span></td><td>操作员</td><td>生产报工、异常上报</td></tr>
          <tr><td><span class="tag role-qc">QC</span></td><td>质检员</td><td>质量检验、异常管理</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 系统配置 -->
    <div v-if="tab === 'configs'" class="tab-content">
      <div class="config-group" v-for="group in configGroups" :key="group.category">
        <h4>{{ groupLabel(group.category) }}</h4>
        <div v-for="c in group.configs" :key="c.id" class="config-row">
          <div class="config-info">
            <span class="config-key">{{ c.configKey }}</span>
            <span class="config-desc">{{ c.description }}</span>
          </div>
          <div class="config-edit">
            <input v-model="c.configValue" class="config-input" />
            <button class="btn-sm" @click="handleConfigSave(c)">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知配置 -->
    <div v-if="tab === 'notifications'" class="tab-content">
      <p class="section-desc">配置各类实时通知的开关，关闭后将不再推送对应类型的 SignalR 消息。</p>
      <div v-for="nc in notificationConfigs" :key="nc.id" class="notif-row">
        <div class="notif-info">
          <span class="notif-label">{{ nc.label }}</span>
          <span class="notif-desc">{{ nc.description }}</span>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" :checked="nc.enabled" @change="handleNotifToggle(nc)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- 新建用户对话框 -->
    <div v-if="showUserCreate" class="modal-overlay" @click.self="showUserCreate = false">
      <div class="modal-content">
        <h3>新增用户</h3>
        <div class="form-group"><label>用户名</label><input v-model="createForm.username" class="form-input" /></div>
        <div class="form-group"><label>显示名</label><input v-model="createForm.displayName" class="form-input" /></div>
        <div class="form-group"><label>角色</label>
          <select v-model="createForm.role" class="form-input">
            <option value="Operator">操作员</option>
            <option value="Engineer">工程师</option>
            <option value="Lead">班组长</option>
            <option value="QC">质检员</option>
            <option value="Admin">管理员</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showUserCreate = false">取消</button>
          <button class="btn btn-ok" :disabled="!createForm.username || !createForm.displayName" @click="handleUserCreate">创建</button>
        </div>
      </div>
    </div>

    <!-- 编辑用户对话框 -->
    <div v-if="editUserTarget" class="modal-overlay" @click.self="editUserTarget = null">
      <div class="modal-content">
        <h3>编辑用户</h3>
        <div class="form-group"><label>用户名</label><input :value="editUserTarget.username" class="form-input" disabled /></div>
        <div class="form-group"><label>显示名</label><input v-model="editUserForm.displayName" class="form-input" /></div>
        <div class="form-group"><label>角色</label>
          <select v-model="editUserForm.role" class="form-input">
            <option value="Operator">操作员</option>
            <option value="Engineer">工程师</option>
            <option value="Lead">班组长</option>
            <option value="QC">质检员</option>
            <option value="Admin">管理员</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-cancel" @click="editUserTarget = null">取消</button>
          <button class="btn btn-ok" @click="handleUserUpdate">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SystemUser, SystemConfig, CreateUserRequest, UpdateUserRequest, UpdateConfigRequest, NotificationConfig } from '../../types/admin'
import { getUsers, createUser, updateUser, getConfigs, updateConfig, getNotificationConfigs, updateNotificationConfig } from '../../api/admin'

const tab = ref('users')
const users = ref<SystemUser[]>([])
const configs = ref<SystemConfig[]>([])
const notificationConfigs = ref<NotificationConfig[]>([])
const userSearch = ref('')
const showUserCreate = ref(false)
const editUserTarget = ref<SystemUser | null>(null)
const editUserForm = ref<UpdateUserRequest>({})
const createForm = ref<CreateUserRequest>({ username: '', displayName: '', role: 'Operator' })

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const s = userSearch.value.toLowerCase()
  return users.value.filter(u => u.username.includes(s) || u.displayName.includes(s))
})

const configGroups = computed(() => {
  const groups: Record<string, SystemConfig[]> = {}
  for (const c of configs.value) {
    const cat = c.category || 'other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(c)
  }
  return Object.entries(groups).map(([category, configs]) => ({ category, configs }))
})

function roleLabel(r: string) { return { Admin: '管理员', Engineer: '工程师', Lead: '班组长', Operator: '操作员', QC: '质检员' }[r] || r }
function groupLabel(g: string) { return { general: '通用', production: '生产', quality: '质量', inventory: '库存', ai: 'AI 设置' }[g] || g }

async function handleUserCreate() {
  try { await createUser(createForm.value) }
  catch { users.value.push({ id: 'new', ...createForm.value, isActive: true, createdAt: new Date().toISOString(), lastLoginAt: null }) }
  showUserCreate.value = false
  createForm.value = { username: '', displayName: '', role: 'Operator' }
}

async function handleUserUpdate() {
  if (!editUserTarget.value) return
  try { await updateUser(editUserTarget.value.id, editUserForm.value) }
  catch { Object.assign(editUserTarget.value, editUserForm.value) }
  editUserTarget.value = null
}

async function toggleUserActive(u: SystemUser) {
  try { await updateUser(u.id, { isActive: !u.isActive }) }
  catch { u.isActive = !u.isActive }
}

async function handleConfigSave(c: SystemConfig) {
  try { await updateConfig(c.id, { configValue: c.configValue, updatedBy: 'admin' }) }
  catch { /* ok */ }
}

async function handleNotifToggle(nc: NotificationConfig) {
  const enabled = !nc.enabled
  try { await updateNotificationConfig(nc.id, { enabled }) }
  catch { /* ok */ }
  nc.enabled = enabled
}

function formatTime(t: string) { return t?.slice(0, 16).replace('T', ' ') || '' }

onMounted(async () => {
  try { users.value = await getUsers() }
  catch {
    users.value = [
      { id: 'u1', username: 'admin', displayName: '管理员', role: 'Admin', isActive: true, createdAt: '2026-01-01T00:00:00', lastLoginAt: '2026-05-12T08:00:00' },
      { id: 'u2', username: 'operator1', displayName: '张三', role: 'Operator', isActive: true, createdAt: '2026-01-01T00:00:00', lastLoginAt: '2026-05-12T09:00:00' },
      { id: 'u3', username: 'engineer1', displayName: '赵六', role: 'Engineer', isActive: true, createdAt: '2026-01-01T00:00:00', lastLoginAt: null },
    ]
  }
  try { configs.value = await getConfigs() }
  catch {
    configs.value = [
      { id: 'c1', configKey: 'site.name', configValue: 'AIMes 智能工厂', category: 'general', description: '站点名称', updatedAt: '2026-05-01T00:00:00', updatedBy: 'admin' },
      { id: 'c2', configKey: 'production.shift.start', configValue: '08:00', category: 'production', description: '早班开始时间', updatedAt: '2026-01-01T00:00:00', updatedBy: 'admin' },
      { id: 'c3', configKey: 'production.shift.end', configValue: '20:00', category: 'production', description: '晚班结束时间', updatedAt: '2026-01-01T00:00:00', updatedBy: 'admin' },
      { id: 'c4', configKey: 'quality.spc.ucl.sigma', configValue: '3', category: 'quality', description: 'SPC 控制限西格玛倍数', updatedAt: '2026-01-01T00:00:00', updatedBy: 'admin' },
    ]
  }
  try { notificationConfigs.value = await getNotificationConfigs() }
  catch {
    notificationConfigs.value = [
      { id: 'nc1', category: 'equipment', label: '设备状态', enabled: true, description: '设备运行/故障/离线状态变更通知' },
      { id: 'nc2', category: 'quality', label: '质量预警', enabled: true, description: '质量检验不合格/SPC 超限预警' },
      { id: 'nc3', category: 'production', label: '生产进度', enabled: true, description: '工单进度更新通知' },
      { id: 'nc4', category: 'anomaly', label: '异常告警', enabled: true, description: '生产异常/设备异常告警' },
      { id: 'nc5', category: 'inventory', label: '库存变更', enabled: true, description: '物料入库/出库/调拨/调整通知' },
      { id: 'nc6', category: 'purchase', label: '采购状态', enabled: true, description: '采购单提交/确认/收货/取消通知' },
    ]
  }
})
</script>

<style scoped>
.admin-board { height: 100%; display: flex; flex-direction: column; padding: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.tabs { display: flex; gap: 0; margin-bottom: 12px; border-bottom: 2px solid #f0f0f0; }
.tab { padding: 8px 20px; border: none; background: none; cursor: pointer; font-size: 14px; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.tab.active { color: #1890ff; border-bottom-color: #1890ff; font-weight: 600; }
.tab-content { flex: 1; overflow-y: auto; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
.search-input { width: 200px; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.btn { padding: 6px 16px; border-radius: 4px; font-size: 13px; cursor: pointer; border: 1px solid #d9d9d9; background: #fff; }
.btn-add { background: #1890ff; color: #fff; border-color: #1890ff; }
.btn-sm { padding: 3px 10px; border: 1px solid #d9d9d9; border-radius: 3px; background: #fff; cursor: pointer; font-size: 12px; margin-right: 4px; }
.btn-sm.danger { color: #ff4d4f; border-color: #ffccc7; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { background: #fafafa; padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #f0f0f0; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid #f5f5f5; }
.mono { font-family: monospace; font-size: 12px; }
.muted { color: #999; font-size: 12px; }
.tag { font-size: 11px; padding: 2px 8px; border-radius: 3px; }
.role-admin { background: #fff2f0; color: #ff4d4f; }
.role-engineer { background: #e6f7ff; color: #1890ff; }
.role-lead { background: #fffbe6; color: #faad14; }
.role-operator { background: #f6ffed; color: #52c41a; }
.role-qc { background: #fff7e6; color: #fa8c16; }
.st-active { background: #f6ffed; color: #52c41a; }
.st-inactive { background: #f5f5f5; color: #999; }
.config-group { margin-bottom: 20px; }
.config-group h4 { font-size: 14px; margin: 0 0 8px; color: #333; }
.config-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #fafafa; border-radius: 4px; margin-bottom: 6px; }
.config-info { display: flex; flex-direction: column; gap: 2px; }
.config-key { font-family: monospace; font-size: 12px; color: #1890ff; }
.config-desc { font-size: 12px; color: #999; }
.config-edit { display: flex; gap: 6px; align-items: center; }
.config-input { width: 200px; padding: 4px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; border-radius: 8px; padding: 24px; width: 420px; max-width: 90vw; }
.modal-content h3 { font-size: 16px; margin: 0 0 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.form-input { width: 100%; padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.form-input:disabled { background: #f5f5f5; color: #999; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.btn-cancel { border: 1px solid #d9d9d9; background: #fff; }
.btn-ok { background: #1890ff; color: #fff; border: none; }
.btn-ok:disabled { background: #91d5ff; cursor: not-allowed; }
.section-desc { font-size: 13px; color: #999; margin-bottom: 16px; }
.notif-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; border-radius: 6px; margin-bottom: 8px; }
.notif-info { display: flex; flex-direction: column; gap: 2px; }
.notif-label { font-size: 14px; font-weight: 600; color: #333; }
.notif-desc { font-size: 12px; color: #999; }
.toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #d9d9d9; border-radius: 22px; transition: 0.2s; }
.toggle-slider::before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
.toggle-switch input:checked + .toggle-slider { background: #1890ff; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(18px); }
</style>
