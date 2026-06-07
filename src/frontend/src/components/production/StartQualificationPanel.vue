<template>
  <section
    class="start-qualification-panel"
    :aria-label="`开工资质校验：${check.statusLabel}`"
    :role="panelRole"
    :aria-live="panelAriaLive"
  >
    <div class="qualification-header">
      <span>开工前校验</span>
      <strong :class="check.status">{{ check.statusLabel }}</strong>
    </div>
    <div class="qualification-grid">
      <div>
        <label>推荐人员</label>
        <strong>{{ check.operatorName }} · {{ check.employeeNumber }}</strong>
      </div>
      <div>
        <label>班组/班次</label>
        <strong>{{ check.team }} · {{ check.shift }}</strong>
      </div>
      <div>
        <label>必需技能</label>
        <strong>{{ check.requiredSkill }}</strong>
      </div>
      <div>
        <label>资质有效期</label>
        <strong>{{ check.certificationName }} · {{ check.expiresAt }}</strong>
      </div>
      <div>
        <label>设备要求</label>
        <strong>{{ check.requiredEquipment }}</strong>
      </div>
      <div>
        <label>物料齐套</label>
        <strong>{{ check.materialKitting }}</strong>
      </div>
      <div>
        <label>SOP</label>
        <strong>{{ check.sopDocument }}</strong>
      </div>
      <div>
        <label>质检点</label>
        <strong>{{ check.qualityGate }}</strong>
      </div>
    </div>
    <div class="qualification-checklist">
      <span
        v-for="item in check.gates"
        :key="item.label"
        :class="item.status"
        :aria-label="`${item.label}：${item.result}，${gateStatusLabel(item.status)}`"
      >
        {{ item.label }}：{{ item.result }}
      </span>
    </div>
    <div
      v-if="check.reassignmentAuditId"
      class="qualification-reassignment"
      role="status"
      :aria-label="`替班审计：${check.reassignmentAuditId}，${check.reassignmentTraceId}`"
    >
      <span>替班审计</span>
      <strong>{{ check.reassignmentAuditId }}</strong>
      <p>原人员：{{ check.blockedOperator }}；复核：{{ check.replacementReviewer }}；追踪：{{ check.reassignmentTraceId }}</p>
    </div>
    <div
      v-if="check.qualificationBlockAuditId"
      class="qualification-reassignment blocked"
      role="alert"
      :aria-label="`阻断审计：${check.qualificationBlockAuditId}，${check.qualificationBlockTraceId}，${check.qualificationBlockReason || check.note}`"
    >
      <span>阻断审计</span>
      <strong>{{ check.qualificationBlockAuditId }}</strong>
      <p>原人员：{{ check.blockedOperator }}；复核：{{ check.replacementReviewer }}；追踪：{{ check.qualificationBlockTraceId }}；{{ check.qualificationBlockReason }}</p>
    </div>
    <p>{{ check.note }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface StartQualificationCheck {
  status: 'pass' | 'warning' | 'blocked'
  statusLabel: string
  operatorName: string
  employeeNumber: string
  team: string
  shift: string
  requiredSkill: string
  certificationName: string
  expiresAt: string
  requiredEquipment: string
  materialKitting: string
  sopDocument: string
  qualityGate: string
  reassignmentAuditId?: string
  reassignmentTraceId?: string
  qualificationBlockAuditId?: string
  qualificationBlockTraceId?: string
  qualificationBlockReason?: string
  blockedOperator?: string
  replacementReviewer?: string
  gates: Array<{
    label: string
    result: string
    status: 'pass' | 'warning' | 'blocked'
  }>
  note: string
}

const props = defineProps<{
  check: StartQualificationCheck
}>()

const panelRole = computed(() => props.check.status === 'blocked' ? 'alert' : 'status')
const panelAriaLive = computed(() => props.check.status === 'blocked' ? 'assertive' : 'polite')

function gateStatusLabel(status: StartQualificationCheck['gates'][number]['status']) {
  return status === 'blocked' ? '阻断' : status === 'warning' ? '告警' : '通过'
}
</script>

<style scoped>
.start-qualification-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #f8fbff;
}

.qualification-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.qualification-header span {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.qualification-header strong {
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 12px;
}

.qualification-header strong.pass {
  background: #f0fdf4;
  color: #15803d;
}

.qualification-header strong.warning {
  background: #fffbeb;
  color: #b45309;
}

.qualification-header strong.blocked {
  background: #fff1f2;
  color: #be123c;
}

.qualification-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.qualification-checklist {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.qualification-reassignment {
  display: grid;
  grid-template-columns: auto minmax(180px, 0.4fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 7px 8px;
  border: 1px solid #bbf7d0;
  border-radius: 5px;
  background: #f0fdf4;
}

.qualification-reassignment.blocked {
  border-color: #fecdd3;
  background: #fff1f2;
}

.qualification-reassignment span {
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.qualification-reassignment.blocked span {
  color: #be123c;
}

.qualification-reassignment strong {
  color: #111827;
  font-size: 12px;
}

.qualification-reassignment p {
  margin: 0;
}

.qualification-checklist span {
  padding: 3px 7px;
  border-radius: 4px;
  font-size: 12px;
}

.qualification-checklist span.pass {
  background: #f0fdf4;
  color: #15803d;
}

.qualification-checklist span.warning {
  background: #fffbeb;
  color: #b45309;
}

.qualification-checklist span.blocked {
  background: #fff1f2;
  color: #be123c;
}

.qualification-grid div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.qualification-grid label,
p {
  color: #6b7280;
  font-size: 12px;
}

.qualification-grid strong {
  color: #111827;
  font-size: 13px;
}

p {
  margin: 0;
  line-height: 1.45;
}

@media (max-width: 760px) {
  .qualification-grid,
  .qualification-reassignment {
    grid-template-columns: 1fr;
  }
}
</style>
