<template>
  <section class="equipment-impact-panel" aria-label="设备故障排产影响">
    <div class="impact-heading">
      <div>
        <span class="eyebrow">设备故障与瓶颈联动</span>
        <h3>CNC-001 不可用影响分析</h3>
      </div>
      <span class="risk-badge">预计停机 {{ downtime.downtimeHours }}h</span>
    </div>

    <div class="impact-grid">
      <article class="impact-card critical">
        <span>影响工单</span>
        <strong>{{ downtime.affectedOrders }}</strong>
        <p>锁定期外 CNC 工序需要重新找窗口，急单不能直接强插到故障设备。</p>
      </article>
      <article class="impact-card warning">
        <span>可替代设备</span>
        <strong>{{ downtime.alternativeEquipment }}</strong>
        <p>CNC-002 可承接精加工，但换线增加 15 分钟；CNC-003 可分流低优先级工序。</p>
      </article>
      <article class="impact-card">
        <span>维护窗口</span>
        <strong>{{ downtime.maintenanceWindow }}</strong>
        <p>推荐预防维护窗口放入夜班低负载时段，避免挤占白班急单首件确认。</p>
      </article>
    </div>

    <div class="strategy-box">
      <h4>瓶颈保护策略</h4>
      <div class="strategy-list">
        <span>减少换线：合并 CNC 同材质批次</span>
        <span>优先关键订单：保护 WO-RUSH-9001</span>
        <span>预防维护：夜班插入主轴检查</span>
        <span>需要重排：是，生成设备故障事件</span>
      </div>
    </div>

    <button type="button" class="sync-btn" @click="syncDowntimeEvent">
      标记故障并同步排产
    </button>

    <section v-if="equipmentDispatch" class="dispatch-maintenance-panel" aria-label="异常分流设备维护">
      <div>
        <span class="eyebrow">异常分流接入</span>
        <h4>{{ equipmentDispatch.title }}</h4>
        <p>{{ equipmentDispatch.summary }}</p>
      </div>
      <div class="dispatch-maintenance-grid">
        <span>{{ equipmentDispatch.affectedOrders }}</span>
        <span>{{ equipmentDispatch.scheduleWindow }}</span>
        <span>{{ equipmentDispatch.owner }}</span>
      </div>
      <button type="button" class="sync-btn secondary" @click="syncDispatchMaintenance">
        生成维护复核单
      </button>
    </section>

    <section class="customer-fault-panel" aria-label="客户真实设备故障数据">
      <div>
        <span class="eyebrow">POC 数据缺口</span>
        <h4>客户真实设备故障数据</h4>
        <p>导入客户设备联网平台的 CNC-001 故障样例，把真实停机、维修和影响工单回写到排产事件与 POC 评分。</p>
      </div>
      <div class="fault-metrics">
        <span>{{ customerFaultEvidence?.batchId ?? '待生成故障样例批次' }}</span>
        <strong>{{ customerFaultEvidence?.faultSamples ?? 0 }} 条</strong>
        <em>{{ customerFaultEvidence ? `${customerFaultEvidence.downtimeHours}h 停机样例已映射` : '尚未接入客户故障样例' }}</em>
      </div>
      <div class="fault-signals">
        <span v-for="signal in faultSignals" :key="signal">{{ signal }}</span>
      </div>
      <button type="button" class="sync-btn secondary" @click="prepareCustomerFaultEvidence">
        生成客户设备故障样例
      </button>
    </section>

    <div class="sync-note">
      <strong>{{ syncTitle }}</strong>
      <span>{{ syncMessage }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  readCustomerEquipmentFaultEvidence,
  writeCustomerEquipmentFaultEvidence,
  writeEquipmentDowntimeEvent,
  type CustomerEquipmentFaultEvidence,
} from '../../utils/equipment-risk-sync'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'
import { readAnomalyDispatchRecordByType, type AnomalyDispatchRecord } from '../../utils/anomaly-dispatch-sync'

const downtime = reactive({
  equipmentCode: 'CNC-001',
  equipmentName: 'CNC-001 加工中心',
  downtimeHours: 4,
  affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
  alternativeEquipment: 'CNC-002 / CNC-003',
  maintenanceWindow: '今日夜班 22:00-02:00',
  protectionStrategy: '减少换线、优先关键订单、推荐预防维护窗口',
})

const syncTitle = ref('等待同步')
const syncMessage = ref('标记设备故障后，AI 排产会读取停机事件并生成换设备、延后、加班或拆单建议。')
const customerFaultEvidence = ref<CustomerEquipmentFaultEvidence | null>(readCustomerEquipmentFaultEvidence())
const equipmentDispatch = ref<AnomalyDispatchRecord | null>(readAnomalyDispatchRecordByType('equipment'))
const faultSignals = computed(() => customerFaultEvidence.value?.capturedSignals ?? ['主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'])

function syncDowntimeEvent() {
  writeEquipmentDowntimeEvent({
    ...downtime,
    createdAt: new Date().toISOString(),
  })
  upsertOtdEvidenceChainRecord({
    id: `equipment-downtime-${downtime.equipmentCode}`,
    stage: '设备维护',
    title: `${downtime.equipmentCode} 停机窗口已同步重排`,
    summary: `${downtime.downtimeHours}h 停机影响 ${downtime.affectedOrders}，按 ${downtime.protectionStrategy} 保护瓶颈设备。`,
    object: downtime.affectedOrders,
    source: '设备维护 / 瓶颈保护',
    traceId: `TRACE-EQ-DOWNTIME-${downtime.equipmentCode}`,
    status: 'active',
    statusLabel: '待维护',
    createdAt: new Date().toISOString(),
  })
  syncTitle.value = '设备故障已同步 AI 排产'
  syncMessage.value = `${downtime.equipmentCode} 预计停机 ${downtime.downtimeHours}h，${downtime.affectedOrders} 已进入事件触发 Agent。`
}

function prepareCustomerFaultEvidence() {
  const evidence = writeCustomerEquipmentFaultEvidence({
    equipmentCode: downtime.equipmentCode,
    affectedOrders: downtime.affectedOrders,
    downtimeHours: downtime.downtimeHours,
  })
  if (!evidence) return
  customerFaultEvidence.value = evidence
  syncDowntimeEvent()
  upsertOtdEvidenceChainRecord({
    id: `customer-equipment-fault-${evidence.batchId}`,
    stage: '设备实证',
    title: '客户真实设备故障样例已映射',
    summary: `${evidence.faultSamples} 条 ${evidence.equipmentCode} 故障样例已把停机、维修工单和影响工单写入 OTD 风险口径。`,
    object: evidence.affectedOrders,
    source: evidence.source,
    traceId: evidence.batchId,
    status: 'closed',
    statusLabel: '已导入',
    createdAt: evidence.preparedAt,
  })
  syncTitle.value = '客户设备故障样例已接入'
  syncMessage.value = `${evidence.batchId} 已映射 ${evidence.faultSamples} 条故障样例，并同步 ${evidence.equipmentCode} 停机事件到 AI 排产。`
}

function syncDispatchMaintenance() {
  if (!equipmentDispatch.value) return
  const dispatch = equipmentDispatch.value
  writeEquipmentDowntimeEvent({
    equipmentCode: 'CNC-001',
    equipmentName: 'CNC-001 加工中心',
    downtimeHours: 2,
    affectedOrders: dispatch.affectedOrders,
    alternativeEquipment: 'CNC-003 / CNC-002',
    maintenanceWindow: dispatch.scheduleWindow,
    protectionStrategy: dispatch.suggestedAction,
    createdAt: new Date().toISOString(),
  })
  upsertOtdEvidenceChainRecord({
    id: `equipment-maintenance-${dispatch.anomalyId}`,
    stage: '设备维护',
    title: `${dispatch.title}维护复核单已生成`,
    summary: `${dispatch.traceId} 已从异常管理进入设备维护，按 ${dispatch.scheduleWindow} 检查主轴冷却、轴承状态和 CNC-003 分流能力。`,
    object: dispatch.affectedOrders,
    source: `设备维护 / ${dispatch.owner}`,
    traceId: dispatch.traceId,
    status: 'active',
    statusLabel: '维护复核中',
    createdAt: new Date().toISOString(),
  })
  syncTitle.value = '异常分流维护单已同步'
  syncMessage.value = `${dispatch.title} 已生成设备维护复核单，并同步 AI 排产复核 ${dispatch.affectedOrders}。`
}
</script>

<style scoped>
.equipment-impact-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fffaf5;
}

.impact-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #c2410c;
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
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fff1f2;
  color: #be123c;
  font-size: 12px;
  font-weight: 700;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.impact-card,
.strategy-box,
.sync-note {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.impact-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 106px;
  padding: 10px;
}

.impact-card.critical {
  border-color: #fecaca;
}

.impact-card.warning {
  border-color: #fde68a;
}

.impact-card span,
.strategy-list span,
.sync-note span,
.impact-card p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.impact-card strong,
.strategy-box h4,
.sync-note strong {
  color: #111827;
  font-size: 14px;
}

.strategy-box,
.sync-note {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.strategy-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.strategy-list span {
  padding: 3px 7px;
  border-radius: 4px;
  background: #f3f4f6;
}

.sync-btn {
  align-self: flex-start;
  padding: 7px 12px;
  border: 1px solid #c2410c;
  border-radius: 4px;
  background: #c2410c;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.sync-btn.secondary {
  border-color: #2563eb;
  background: #2563eb;
}

.customer-fault-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.35fr);
  gap: 10px;
  padding: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #f8fbff;
}

.customer-fault-panel p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.fault-metrics {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #fff;
}

.fault-metrics span,
.fault-metrics em {
  color: #4b5563;
  font-size: 12px;
  font-style: normal;
}

.fault-metrics strong {
  color: #1d4ed8;
  font-size: 24px;
}

.fault-signals {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fault-signals span {
  padding: 3px 7px;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.dispatch-maintenance-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.42fr);
  gap: 10px;
  padding: 12px;
  border: 1px solid #fde68a;
  border-radius: 6px;
  background: #fffbeb;
}

.dispatch-maintenance-panel p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.dispatch-maintenance-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dispatch-maintenance-grid span {
  padding: 5px 7px;
  border: 1px solid #fef3c7;
  border-radius: 4px;
  background: #fff;
  color: #92400e;
  font-size: 12px;
  font-weight: 700;
}

.dispatch-maintenance-panel .sync-btn {
  grid-column: 1 / -1;
}

@media (max-width: 1180px) {
  .impact-grid {
    grid-template-columns: 1fr;
  }

  .dispatch-maintenance-panel {
    grid-template-columns: 1fr;
  }
}
</style>
