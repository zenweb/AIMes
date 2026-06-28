<template>
  <section class="skill-matrix-panel" aria-label="人员技能矩阵">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">人员约束</span>
        <h3>技能矩阵与资质有效期</h3>
      </div>
    <div class="panel-actions">
      <span class="coverage-badge">{{ coverageText }}</span>
      <button type="button" class="sync-button" @click="syncSkillEvidence">同步人员证据</button>
    </div>
  </div>

    <div v-if="syncError" class="sync-error" role="alert" aria-live="assertive">
      {{ syncError }}
    </div>

    <div class="skill-grid">
      <article v-for="item in skillRows" :key="item.employeeNumber" class="skill-card">
        <div class="skill-topline">
          <strong>{{ item.name }}</strong>
          <span>{{ item.employeeNumber }} · {{ item.team }} · {{ item.shift }}</span>
        </div>
        <div class="skill-tags">
          <span v-for="skill in item.skills" :key="skill">{{ skill }}</span>
        </div>
        <div class="cert-list">
          <span
            v-for="cert in item.certifications"
            :key="cert.name"
            class="cert"
            :class="cert.status"
          >
            {{ cert.name }} · {{ cert.expiresAt }}
          </span>
        </div>
        <div class="availability-line" :class="item.availability.status">
          <strong>{{ item.availability.statusLabel }}</strong>
          <span>{{ item.availability.window }} · {{ item.availability.source }}</span>
        </div>
      </article>
    </div>

    <div class="reassignment-panel">
      <div class="reassignment-heading">
        <div>
          <span class="eyebrow">替班闭环</span>
          <h4>资质临期替班建议</h4>
        </div>
        <button type="button" class="sync-button secondary" @click="generateReassignmentSuggestion">
          生成替班建议
        </button>
      </div>
      <div id="labor-reassignment-help" class="labor-reassignment-guidance">
        <div>
          <strong>替班/停工复核前，请核对资质有效期、排班窗口、工程复核人与生产开工影响。</strong>
          <span>Before reassignment or stop-work review, verify certification validity, shift window, engineering reviewer, and production start impact.</span>
        </div>
        <nav aria-label="人员替班关联入口">
          <a href="/scheduling/production">生产开工 / Production</a>
          <a href="/scheduling/scheduling">AI 排产 / Scheduling</a>
          <a href="/scheduling/audit-logs">审计回放 / Audit trail</a>
          <a href="#labor-reassignment-help">帮助 / Help</a>
        </nav>
      </div>
      <div class="reassignment-grid">
        <div>
          <span>当前风险</span>
          <strong>{{ reassignmentPreview.blockedEmployeeNumber }} {{ reassignmentPreview.blockedEmployeeName }}</strong>
          <p>{{ reassignmentPreview.blockedCertification }} {{ reassignmentPreview.blockedExpiresAt }} 临期，不能继续压给下周关键热处理任务。</p>
        </div>
        <div>
          <span>{{ hasReassignmentCandidate ? '替班执行' : '停工复核' }}</span>
          <strong v-if="hasReassignmentCandidate">
            {{ reassignmentPreview.replacementEmployeeNumber }} {{ reassignmentPreview.replacementEmployeeName }}
          </strong>
          <strong v-else>无有效替班候选</strong>
          <p v-if="hasReassignmentCandidate">{{ reassignmentPreview.replacementCertification }} 接管 {{ reassignmentPreview.replacementSkill }}，{{ reassignmentPreview.reviewerName }} 做工程复核。</p>
          <p v-else>{{ qualificationBlockPreview.reason }}</p>
        </div>
        <div>
          <span>影响对象</span>
          <strong>{{ decisionAuditObject }}</strong>
          <p>{{ decisionAuditId }} / {{ decisionTraceId }}</p>
        </div>
      </div>
      <div class="candidate-ranking">
        <span>候选排序</span>
        <strong>{{ candidateDecision }}</strong>
        <div class="candidate-tags">
          <em v-for="candidate in reassignmentCandidates" :key="candidate.employee.employeeNumber">
            {{ candidate.employee.employeeNumber }} {{ candidate.employee.name }} · {{ candidate.reason }} · {{ candidate.score }} 分
          </em>
        </div>
      </div>
      <div class="reassignment-note">
        <strong>{{ reassignmentTitle }}</strong>
        <span>{{ reassignmentMessage }}</span>
      </div>
      <div
        v-if="showQualificationReview"
        class="qualification-review"
        role="alert"
        aria-labelledby="qualification-review-title"
        aria-describedby="labor-reassignment-help"
      >
        <div>
          <span>停工复核处置</span>
          <strong id="qualification-review-title">{{ reviewStatusText }}</strong>
          <p>{{ reviewAlertMessage }}</p>
        </div>
        <div class="review-actions">
          <button type="button" class="sync-button warning" @click="confirmQualificationReview">
            主管确认停工复核
          </button>
          <button type="button" class="sync-button secondary" @click="releaseQualificationBlock">
            补证改派并重新放行
          </button>
        </div>
      </div>
    </div>

    <div class="sync-note">
      <strong>{{ syncTitle }}</strong>
      <span>{{ syncMessage }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Employee, EmployeeAvailability, EmployeeCertification } from '../../types/employee'
import {
  createDefaultLaborQualificationBlock,
  createDefaultLaborReassignment,
  releaseLaborQualificationBlock,
  type LaborQualificationBlockRecord,
  writeLaborQualificationBlock,
  writeLaborQualificationBlockReview,
  writeLaborReassignment,
} from '../../utils/labor-assignment-sync'
import { upsertOtdEvidenceChainRecord } from '../../utils/otd-evidence-chain-sync'

export interface SkillMatrixRow {
  employeeNumber: string
  name: string
  team: string
  shift: string
  skills: string[]
  certifications: EmployeeCertification[]
  availability: EmployeeAvailability
}

const props = defineProps<{
  employees: Employee[]
}>()

function shiftLabel(shift: string | null | undefined) {
  return shift === 'Night' ? '夜班' : shift === 'Rotating' ? '倒班' : '白班'
}

function normalizeShift(shift: string | null | undefined) {
  return shift || 'Day'
}

function defaultAvailability(employee: Employee): EmployeeAvailability {
  const normalizedShift = normalizeShift(employee.shift)
  if (normalizedShift === 'Night') {
    return {
      date: '2026-05-20',
      status: 'available',
      statusLabel: '夜班排班',
      window: '2026-05-20 20:00-2026-05-21 08:00',
      capacityHours: 8,
      source: '人员主数据班次',
    }
  }
  return {
    date: '2026-05-20',
    status: 'available',
    statusLabel: normalizedShift === 'Rotating' ? '倒班排班' : '白班排班',
    window: normalizedShift === 'Rotating' ? '2026-05-20 08:00-20:00' : '2026-05-20 08:00-17:00',
    capacityHours: normalizedShift === 'Rotating' ? 6 : 8,
    source: '人员主数据班次',
  }
}

function employeeAvailability(employee: Employee): EmployeeAvailability {
  const fallback = defaultAvailability(employee)
  if (!employee.availability) return fallback
  return {
    ...fallback,
    ...employee.availability,
    statusLabel: employee.availability.statusLabel || fallback.statusLabel,
    window: employee.availability.window || fallback.window,
    source: employee.availability.source || fallback.source,
  }
}

function isAvailabilityEligible(availability: EmployeeAvailability) {
  return availability.status !== 'leave' && availability.capacityHours > 0
}

function availabilityScore(availability: EmployeeAvailability) {
  if (!isAvailabilityEligible(availability)) return 0
  return availability.status === 'overtime' || availability.status === 'on_call' ? 14 : 10
}

function availabilityReason(availability: EmployeeAvailability) {
  return `${availability.statusLabel} ${availability.window}`
}

const skillRows = computed<SkillMatrixRow[]>(() => props.employees
  .filter(employee => employee.isActive && employee.role !== 'Admin')
  .slice(0, 8)
  .map(employee => ({
    employeeNumber: employee.employeeNumber,
    name: employee.name,
    team: employee.team || '未分组',
    shift: shiftLabel(employee.shift),
    skills: employee.skills?.length ? employee.skills : [employee.role],
    certifications: employee.certifications || [],
    availability: employeeAvailability(employee),
  })))

const coverageText = computed(() => {
  const active = props.employees.filter(employee => employee.isActive)
  const qualified = active.filter(employee =>
    employee.skills?.length
    && employee.certifications?.some(cert => cert.status === 'valid')
    && isAvailabilityEligible(employeeAvailability(employee))
  )
  return `${qualified.length}/${active.length || 1} 人具备有效资质且排班可用`
})

const syncTitle = ref('等待同步')
const syncMessage = ref('同步后，技能、班组班次和资质有效期会进入 OTD 复盘证据链，用于解释为什么某些工序不能直接开工或插单。')
const reassignmentTitle = ref('等待生成')
const reassignmentMessage = ref('生成后，人员替班建议会同步到生产开工、排产解释、报表中心和审计回放。')
const activeQualificationBlock = ref<LaborQualificationBlockRecord | null>(null)
const syncError = ref('')
const reviewMessage = ref('生成停工复核后，主管可先受理阻断，再登记补证/改派并重新放行；复核未闭环前生产开工保持禁用。')

interface ReassignmentCandidate {
  employee: Employee
  certification: EmployeeCertification
  availability: EmployeeAvailability
  score: number
  skill: string
  reason: string
}

function certificationSummary(certifications: EmployeeCertification[]) {
  if (!certifications.length) return '暂无资质记录'
  return certifications.map(cert => `${cert.name} ${cert.expiresAt} ${cert.status}`).join(' / ')
}

function qualificationStatus(certifications: EmployeeCertification[]) {
  if (certifications.some(cert => cert.status === 'expired')) {
    return { status: 'active' as const, label: '资质过期' }
  }
  if (certifications.some(cert => cert.status === 'expiring')) {
    return { status: 'active' as const, label: '资质临期' }
  }
  if (certifications.some(cert => cert.status === 'valid')) {
    return { status: 'ready' as const, label: '资质有效' }
  }
  return { status: 'active' as const, label: '待补资质' }
}

function capabilityStatus(certifications: EmployeeCertification[], availability: EmployeeAvailability) {
  if (!isAvailabilityEligible(availability)) {
    return { status: 'active' as const, label: availability.statusLabel }
  }
  return qualificationStatus(certifications)
}

function pickRequiredSkill(employee: Employee) {
  const skills = employee.skills || []
  return skills.find(skill => /热处理|CNC|装配/.test(skill)) || skills[0] || employee.role
}

function pickRiskCertification(employee: Employee) {
  return employee.certifications?.find(cert => cert.status === 'expiring')
    || employee.certifications?.find(cert => cert.status === 'expired')
    || employee.certifications?.[0]
}

function pickMatchingCertification(employee: Employee, riskCertification: EmployeeCertification | undefined) {
  const certifications = employee.certifications || []
  return certifications.find(cert => cert.status === 'valid' && riskCertification && cert.name === riskCertification.name)
    || certifications.find(cert => cert.status === 'valid')
}

const expiringLaborRisk = computed(() => props.employees.find(employee =>
  employee.isActive
  && employee.role !== 'Admin'
  && employee.certifications?.some(cert => cert.status === 'expiring')
  && employee.skills?.some(skill => /热处理|CNC|装配/.test(skill))
) ?? null)

const reviewerEmployee = computed(() => props.employees.find(employee =>
  employee.isActive
  && employee.role === 'Engineer'
  && employee.certifications?.some(cert => cert.status === 'valid')
) ?? null)

const reassignmentCandidates = computed<ReassignmentCandidate[]>(() => {
  const risk = expiringLaborRisk.value
  if (!risk) return []

  const requiredSkill = pickRequiredSkill(risk)
  const riskCertification = pickRiskCertification(risk)
  return props.employees
    .filter(employee => employee.isActive && employee.role !== 'Admin' && employee.employeeNumber !== risk.employeeNumber)
    .map((employee) => {
      const certification = pickMatchingCertification(employee, riskCertification)
      const availability = employeeAvailability(employee)
      const skills = employee.skills || []
      const hasRequiredSkill = skills.includes(requiredSkill)
      const hasDispatchAuthority = employee.role === 'Lead' && skills.some(skill => /派工|复核|异常升级/.test(skill))
      if (!certification || !isAvailabilityEligible(availability) || (!hasRequiredSkill && !hasDispatchAuthority)) return null

      const sameTeam = !!employee.team && employee.team === risk.team
      const sameShift = normalizeShift(employee.shift) === normalizeShift(risk.shift)
      const score = [
        hasRequiredSkill ? 50 : 0,
        riskCertification && certification.name === riskCertification.name ? 24 : 10,
        sameTeam ? 12 : 0,
        sameShift ? 8 : 0,
        employee.role === 'Lead' ? 6 : 0,
        availabilityScore(availability),
      ].reduce((sum, item) => sum + item, 0)
      const reasonParts = [
        hasRequiredSkill ? `${requiredSkill}技能匹配` : '班组长复核授权',
        certification.name === riskCertification?.name ? '同证书有效' : '有效资质',
        sameTeam ? '同班组' : `${employee.team || '未分组'}可调配`,
        sameShift ? '同班次' : `${shiftLabel(employee.shift)}可调班`,
        availabilityReason(availability),
      ]
      return {
        employee,
        certification,
        availability,
        score,
        skill: hasRequiredSkill ? requiredSkill : skills[0] || employee.role,
        reason: reasonParts.join(' / '),
      }
    })
    .filter((candidate): candidate is ReassignmentCandidate => !!candidate)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
})

const candidateDecision = computed(() => {
  const candidate = reassignmentCandidates.value[0]
  if (!candidate) return '未找到有效替班候选，需阻断开工并升级主管复核'
  return `推荐 ${candidate.employee.employeeNumber} ${candidate.employee.name}，按技能、班组/班次、证书有效期和排班可用性评分最高`
})

const hasReassignmentCandidate = computed(() => !!reassignmentCandidates.value[0])
const showQualificationReview = computed(() => !hasReassignmentCandidate.value || !!activeQualificationBlock.value)
const reviewStatusText = computed(() => {
  const status = activeQualificationBlock.value?.status
  if (status === 'released') return '已重新放行'
  if (status === 'reviewing') return '主管复核中'
  if (status === 'active') return '停工复核'
  return '等待阻断'
})
const reviewAlertMessage = computed(() => activeQualificationBlock.value || hasReassignmentCandidate.value
  ? reviewMessage.value
  : `无有效替班候选：${qualificationBlockPreview.value.reason}`
)

function buildLaborReassignmentRecord(createdAt = new Date().toISOString()) {
  const risk = expiringLaborRisk.value
  const candidate = reassignmentCandidates.value[0]
  const reviewer = reviewerEmployee.value
  if (!risk || !candidate) return createDefaultLaborReassignment(createdAt)

  const riskCertification = pickRiskCertification(risk)
  const reviewerCertification = reviewer?.certifications?.find(cert => cert.status === 'valid')
  return createDefaultLaborReassignment(createdAt, {
    blockedEmployeeNumber: risk.employeeNumber,
    blockedEmployeeName: risk.name,
    blockedCertification: riskCertification?.name || '待补资质',
    blockedExpiresAt: riskCertification?.expiresAt || '未维护',
    replacementEmployeeNumber: candidate.employee.employeeNumber,
    replacementEmployeeName: candidate.employee.name,
    replacementTeam: candidate.employee.team || '未分组',
    replacementShift: shiftLabel(candidate.employee.shift),
    replacementSkill: `${candidate.skill}替班复核 / ${candidate.reason}`,
    replacementCertification: candidate.certification.name,
    replacementExpiresAt: candidate.certification.expiresAt,
    reviewerEmployeeNumber: reviewer?.employeeNumber || 'EMP-004',
    reviewerName: reviewer?.name || '赵六',
    reviewerRole: reviewerCertification?.name || '工程放行',
    reason: `${risk.employeeNumber} ${risk.name} 的 ${riskCertification?.name || '岗位资质'} ${riskCertification?.expiresAt || ''} 临期；系统按技能、班组/班次、证书有效期和排班可用性评分，推荐 ${candidate.employee.employeeNumber} ${candidate.employee.name} 接管 WO-013 热处理开工复核；排班来源 ${candidate.availability.source}（${candidate.availability.window}），${reviewer?.name || '赵六'} 保留工程放行。`,
  })
}

function buildLaborQualificationBlockRecord(createdAt = new Date().toISOString()) {
  const risk = expiringLaborRisk.value
  const reviewer = reviewerEmployee.value
  if (!risk) return createDefaultLaborQualificationBlock(createdAt)

  const riskCertification = pickRiskCertification(risk)
  const reviewerCertification = reviewer?.certifications?.find(cert => cert.status === 'valid')
  const requiredSkill = pickRequiredSkill(risk)
  return createDefaultLaborQualificationBlock(createdAt, {
    blockedEmployeeNumber: risk.employeeNumber,
    blockedEmployeeName: risk.name,
    blockedCertification: riskCertification?.name || '待补资质',
    blockedExpiresAt: riskCertification?.expiresAt || '未维护',
    requiredSkill,
    requiredTeam: risk.team || '未分组',
    requiredShift: shiftLabel(risk.shift),
    reviewerEmployeeNumber: reviewer?.employeeNumber || 'EMP-004',
    reviewerName: reviewer?.name || '赵六',
    reviewerRole: reviewerCertification?.name || '工程放行',
    reason: `${risk.employeeNumber} ${risk.name} 的 ${riskCertification?.name || '岗位资质'} ${riskCertification?.expiresAt || ''} 临期；系统按 ${requiredSkill} 技能、班组/班次、同证书有效期、排班可用性与复核授权评分后未找到有效替班候选，WO-013 热处理必须停工复核并升级 ${reviewer?.name || '赵六'} 处理。`,
  })
}

const reassignmentPreview = computed(() => buildLaborReassignmentRecord('2026-05-20T09:00:00.000Z'))
const qualificationBlockPreview = computed(() => buildLaborQualificationBlockRecord('2026-05-20T09:00:00.000Z'))
const decisionAuditObject = computed(() => hasReassignmentCandidate.value
  ? `${reassignmentPreview.value.workOrderNumber} ${reassignmentPreview.value.operationName}`
  : `${qualificationBlockPreview.value.workOrderNumber} ${qualificationBlockPreview.value.operationName}`
)
const decisionAuditId = computed(() => hasReassignmentCandidate.value
  ? reassignmentPreview.value.auditId
  : qualificationBlockPreview.value.auditId
)
const decisionTraceId = computed(() => hasReassignmentCandidate.value
  ? reassignmentPreview.value.traceId
  : qualificationBlockPreview.value.traceId
)

function syncSkillEvidence() {
  const createdAt = new Date().toISOString()
  try {
    skillRows.value.forEach((row) => {
      const qualification = capabilityStatus(row.certifications, row.availability)
      upsertOtdEvidenceChainRecord({
        id: `labor-skill-${row.employeeNumber}`,
        stage: '人员能力',
        title: `${row.name} 技能/资质校验进入开工约束`,
        summary: `${row.employeeNumber} 属于 ${row.team} ${row.shift}，技能：${row.skills.join(' / ')}；资质：${certificationSummary(row.certifications)}；排班：${row.availability.statusLabel} ${row.availability.window}，来源 ${row.availability.source}。`,
        object: row.employeeNumber,
        source: '人员管理 / 技能矩阵+排班计划',
        traceId: `TRACE-LABOR-${row.employeeNumber}`,
        status: qualification.status,
        statusLabel: qualification.label,
        createdAt,
      })
    })
    syncError.value = ''
    syncTitle.value = '人员能力证据已同步 OTD 复盘'
    syncMessage.value = `${skillRows.value.length} 名人员的技能和资质状态已写入统一证据链，可在报表、治理和审计中核对。`
  } catch (error: unknown) {
    syncError.value = `人员证据同步失败：${error instanceof Error ? error.message : '请稍后重试'}`
  }
}

function generateReassignmentSuggestion() {
  if (!hasReassignmentCandidate.value) {
    const block = writeLaborQualificationBlock(buildLaborQualificationBlockRecord())
    activeQualificationBlock.value = block
    reassignmentTitle.value = '停工复核已同步生产开工与 OTD 复盘'
    reassignmentMessage.value = `${block.auditId} 已生成：${block.blockedEmployeeNumber} ${block.blockedEmployeeName} 的临期资质没有有效替班候选，${block.workOrderNumber} ${block.operationName} 必须停工复核，${block.traceId} 可在报表和审计中追溯。`
    reviewMessage.value = `${block.auditId} 已进入停工复核，等待 ${block.reviewerName} 主管受理；复核完成前生产报工不能确认开工。`
    return
  }

  const record = writeLaborReassignment(buildLaborReassignmentRecord())
  reassignmentTitle.value = '替班建议已同步生产开工与 OTD 复盘'
  reassignmentMessage.value = `${record.auditId} 已生成：${record.blockedEmployeeNumber} ${record.blockedEmployeeName} 的临期资质风险由 ${record.replacementEmployeeNumber} ${record.replacementEmployeeName} 接管，推荐依据为技能、班组/班次、证书有效期和排班可用性评分，${record.traceId} 可在报表和审计中追溯。`
}

function ensureQualificationBlock(options: { persist?: boolean } = { persist: true }) {
  if (activeQualificationBlock.value && activeQualificationBlock.value.status !== 'released') {
    return activeQualificationBlock.value
  }
  const candidate = buildLaborQualificationBlockRecord()
  const block = options.persist === false ? candidate : writeLaborQualificationBlock(candidate)
  activeQualificationBlock.value = block
  reassignmentTitle.value = '停工复核已同步生产开工与 OTD 复盘'
  reassignmentMessage.value = `${block.auditId} 已生成：${block.blockedEmployeeNumber} ${block.blockedEmployeeName} 的临期资质没有有效替班候选，${block.workOrderNumber} ${block.operationName} 必须停工复核，${block.traceId} 可在报表和审计中追溯。`
  return block
}

function confirmQualificationReview() {
  const reviewed = writeLaborQualificationBlockReview(ensureQualificationBlock({ persist: false }))
  activeQualificationBlock.value = reviewed
  reviewMessage.value = `${reviewed.reviewerName} 已确认停工复核：补证/改派前 ${reviewed.workOrderNumber} ${reviewed.operationName} 保持冻结，${reviewed.traceId}-REVIEW 已进入 OTD 证据链。`
}

function releaseQualificationBlock() {
  const block = ensureQualificationBlock({ persist: false })
  const releaseReason = `${block.reviewerName} 确认 ${block.requiredSkill} 补证有效，并改派 EMP-006 孙八在排班计划 SCH-LABOR-20260520-A 的加班窗口承担热处理开工复核。`
  const reassignment = createDefaultLaborReassignment(new Date().toISOString(), {
    id: 'labor-reassignment-release-WO-013-heat-treatment',
    workOrderNumber: block.workOrderNumber,
    operationCode: block.operationCode,
    operationCodes: block.operationCodes,
    operationName: block.operationName,
    blockedEmployeeNumber: block.blockedEmployeeNumber,
    blockedEmployeeName: block.blockedEmployeeName,
    blockedCertification: block.blockedCertification,
    blockedExpiresAt: block.blockedExpiresAt,
    replacementEmployeeNumber: 'EMP-006',
    replacementEmployeeName: '孙八',
    replacementTeam: '甲班',
    replacementShift: '白班',
    replacementSkill: `${block.requiredSkill}补证改派 / 主管复核放行 / 加班窗口 2026-05-20 18:00-22:00`,
    replacementCertification: '热处理上岗证',
    replacementExpiresAt: '2026-12-31',
    reviewerEmployeeNumber: block.reviewerEmployeeNumber,
    reviewerName: block.reviewerName,
    reviewerRole: block.reviewerRole,
    reason: `${block.auditId} 停工复核后，${releaseReason} 生产开工需继续保留工程放行与炉批复核。`,
    auditId: 'AUD-LABOR-RELEASE-20260520-001',
    traceId: 'TRACE-LABOR-RELEASE-WO-013-OP-10',
    status: 'approved',
  })
  const result = releaseLaborQualificationBlock(block, reassignment, releaseReason)
  activeQualificationBlock.value = result.block
  reassignmentTitle.value = '停工复核已重新放行'
  reassignmentMessage.value = `${result.reassignment.auditId} 已生成：${result.reassignment.replacementEmployeeNumber} ${result.reassignment.replacementEmployeeName} 通过补证改派接管 ${result.reassignment.operationName}，${result.reassignment.traceId} 可在生产开工、排产和审计中追溯。`
  reviewMessage.value = `${result.block.releaseAuditId} 已把 ${block.auditId} 从停工复核转为重新放行；生产报工将读取 ${result.reassignment.replacementEmployeeNumber} 替班记录。`
}
</script>

<style scoped>
.skill-matrix-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.panel-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

h3 {
  margin: 0;
  color: #111827;
  font-size: 15px;
}

h4,
p {
  margin: 0;
}

.coverage-badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.sync-button {
  padding: 5px 10px;
  border: 1px solid #1d4ed8;
  border-radius: 4px;
  background: #1d4ed8;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.sync-button.secondary {
  border-color: #047857;
  background: #047857;
}

.sync-button.warning {
  border-color: #b45309;
  background: #b45309;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.skill-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 104px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.skill-topline {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.skill-topline strong {
  color: #111827;
  font-size: 14px;
}

.skill-topline span,
.cert {
  color: #6b7280;
  font-size: 12px;
}

.skill-tags,
.cert-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-tags span,
.cert {
  padding: 2px 6px;
  border-radius: 4px;
}

.skill-tags span {
  background: #eff6ff;
  color: #1d4ed8;
}

.cert.valid {
  background: #f0fdf4;
  color: #15803d;
}

.cert.expiring {
  background: #fffbeb;
  color: #b45309;
}

.cert.expired {
  background: #fff1f2;
  color: #be123c;
}

.availability-line {
  display: grid;
  gap: 3px;
  padding: 6px;
  border-radius: 4px;
  background: #f9fafb;
}

.availability-line strong {
  font-size: 12px;
}

.availability-line span {
  color: #6b7280;
  font-size: 11px;
  line-height: 1.35;
}

.availability-line.available strong {
  color: #047857;
}

.availability-line.overtime strong,
.availability-line.on_call strong {
  color: #1d4ed8;
}

.availability-line.leave {
  background: #fff7ed;
}

.availability-line.leave strong {
  color: #b45309;
}

.reassignment-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  background: #f0fdf4;
}

.reassignment-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.reassignment-heading h4 {
  color: #111827;
  font-size: 14px;
}

.reassignment-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.reassignment-grid div,
.candidate-ranking,
.reassignment-note {
  padding: 8px;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #fff;
}

.reassignment-grid div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reassignment-grid span,
.reassignment-note span,
.reassignment-grid p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.reassignment-grid strong,
.candidate-ranking strong,
.reassignment-note strong {
  color: #111827;
  font-size: 13px;
}

.labor-reassignment-guidance {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.42fr);
  gap: 10px;
  align-items: center;
  padding: 9px;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  background: #f0f9ff;
}

.labor-reassignment-guidance strong {
  display: block;
  color: #111827;
  font-size: 13px;
  line-height: 1.45;
}

.labor-reassignment-guidance span {
  display: block;
  margin-top: 3px;
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}

.labor-reassignment-guidance nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.labor-reassignment-guidance a {
  min-height: 28px;
  padding: 6px 8px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.candidate-ranking {
  display: grid;
  grid-template-columns: auto minmax(220px, 0.35fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.candidate-ranking > span {
  color: #047857;
  font-size: 12px;
  font-weight: 700;
}

.candidate-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.candidate-tags em {
  padding: 2px 6px;
  border-radius: 4px;
  background: #ecfdf5;
  color: #047857;
  font-size: 12px;
  font-style: normal;
}

.reassignment-note {
  display: grid;
  grid-template-columns: minmax(120px, 0.25fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.qualification-review {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}

.qualification-review div:first-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qualification-review span {
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
}

.qualification-review strong {
  color: #111827;
  font-size: 13px;
}

.qualification-review p {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

.review-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.sync-note {
  display: grid;
  grid-template-columns: minmax(120px, 0.25fr) minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
}

.sync-note strong {
  color: #111827;
  font-size: 13px;
}

.sync-note span {
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}

@media (max-width: 1100px) {
  .skill-grid,
  .reassignment-grid,
  .labor-reassignment-guidance,
  .candidate-ranking,
  .reassignment-note,
  .qualification-review,
  .sync-note {
    grid-template-columns: 1fr;
  }

  .review-actions {
    justify-content: flex-start;
  }
}
</style>
