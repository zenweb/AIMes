<template>
  <div class="admin-board">
    <h2 class="page-title">系统管理</h2>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'users' }" @click="tab = 'users'">用户管理</button>
      <button class="tab" :class="{ active: tab === 'roles' }" @click="tab = 'roles'">角色权限</button>
      <button class="tab" :class="{ active: tab === 'configs' }" @click="tab = 'configs'">系统配置</button>
      <button class="tab" :class="{ active: tab === 'notifications' }" @click="tab = 'notifications'">通知配置</button>
      <button class="tab" :class="{ active: tab === 'agent' }" @click="tab = 'agent'">Agent 治理</button>
      <button class="tab" :class="{ active: tab === 'llm' }" @click="tab = 'llm'; loadLlmStatus()">LLM 设置</button>
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
          <tr v-for="u in paginatedUsers" :key="u.id">
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
      <div class="pagination-bar" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>
        <template v-for="p in displayedPages" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">...</span>
          <button v-else class="page-btn" :class="{ active: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
        <span class="page-info">共 {{ totalCount }} 条</span>
      </div>
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

    <!-- Agent 治理 -->
    <div v-if="tab === 'agent'" class="tab-content">
      <section class="agent-governance-panel">
        <div class="agent-heading">
          <div>
            <span class="eyebrow">AI MES Governance</span>
            <h3>Agent 策略与权限治理</h3>
            <p>把可执行 Agent 动作、角色权限、审计编号和关键配置审批放在同一个管理面。</p>
          </div>
          <div class="agent-heading-actions">
            <button type="button" class="btn btn-add" @click="openKnowledgeGovernance">打开文档治理</button>
            <button type="button" class="btn btn-add" @click="openAuditLogs">查看审计回放</button>
          </div>
        </div>

        <div class="agent-metrics">
          <div v-for="metric in agentGovernanceMetrics" :key="metric.label" class="agent-metric">
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.label }}</span>
          </div>
        </div>

        <div class="agent-grid">
          <article v-for="action in agentActions" :key="action.name" class="agent-action-card">
            <div class="action-topline">
              <span>{{ action.scope }}</span>
              <em :class="'policy-' + action.statusClass">{{ action.status }}</em>
            </div>
            <h4>{{ action.name }}</h4>
            <p>{{ action.description }}</p>
            <div class="policy-row">
              <span>所需角色</span>
              <strong>{{ action.requiredRole }}</strong>
            </div>
            <div class="policy-row">
              <span>审计编号</span>
              <code>{{ action.auditId }}</code>
            </div>
          </article>
        </div>

        <div class="assistant-action-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>AI 助手动作治理</h4>
                <p>监管 AI 生产助手最近执行或拒绝的动作，核对执行人、角色、权限结果、目标页面和审计编号。</p>
              </div>
              <strong>{{ assistantActionAudits.length }} 条</strong>
            </div>
            <div v-if="assistantActionAudits.length" class="assistant-action-list">
              <article v-for="record in assistantActionAudits" :key="record.id" class="assistant-action-card">
                <div class="action-topline">
                  <span>{{ assistantActionTypeLabel(record.type) }}</span>
                  <em :class="'policy-' + assistantActionStatusClass(record.permitted)">{{ record.permitted ? '已执行' : '已拒绝' }}</em>
                </div>
                <strong>{{ record.label }}</strong>
                <p>{{ record.resultMessage }}</p>
                <div class="policy-row">
                  <span>执行人</span>
                  <code>{{ record.actor }} / {{ record.role }}</code>
                </div>
                <div class="policy-row">
                  <span>目标页面</span>
                  <code>{{ record.targetRoute || '无跳转' }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditCode }}</code>
                </div>
                <div v-if="record.traceId" class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div class="policy-row">
                  <span>执行时间</span>
                  <code>{{ formatTime(record.createdAt) }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待 AI 助手动作</strong>
              <span>从 AI 生产助手执行页面跳转、导出、异常处置卡或交期恢复执行包后，这里会显示权限结果和审计编号。</span>
            </div>
          </div>
        </div>

        <div class="assistant-package-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>交期恢复执行包治理</h4>
                <p>监管 AI 生产助手生成的交期恢复执行包，核对排产、风险、采购和质量责任动作是否闭合并进入 OTD 证据链。</p>
              </div>
              <strong>{{ assistantRecoveryPackages.length }} 条</strong>
            </div>
            <div v-if="assistantRecoveryPackages.length" class="assistant-package-list">
              <article v-for="record in assistantRecoveryPackages" :key="record.id" class="assistant-package-card">
                <div class="action-topline">
                  <span>{{ record.owner }}</span>
                  <em :class="'policy-' + assistantPackageStatusClass(record)">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>影响工单</span>
                  <code>{{ record.workOrders }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditCode }}</code>
                </div>
                <div class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.closureTraceId ?? record.traceId }}</code>
                </div>
                <div v-if="record.purchaseActionSummary" class="assistant-package-closure">
                  <span>采购责任动作</span>
                  <strong>{{ record.purchaseActionSummary }}</strong>
                  <code>{{ record.purchaseActionTraceId }}</code>
                </div>
                <div v-if="record.qualityActionSummary" class="assistant-package-closure quality">
                  <span>质量责任动作</span>
                  <strong>{{ record.qualityActionSummary }}</strong>
                  <code>{{ record.qualityActionTraceId }}</code>
                </div>
                <div class="assistant-package-steps">
                  <span>责任动作</span>
                  <ul>
                    <li v-for="step in record.dispatchSteps" :key="step.evidence">
                      <b>{{ step.module }}</b>
                      <em>{{ step.status === 'closed' ? '已闭合' : step.owner }}</em>
                      <code>{{ step.evidence }}</code>
                    </li>
                  </ul>
                </div>
                <div class="assistant-package-actions">
                  <button type="button" class="btn-sm" @click="openSchedulingBoard">查看 AI 排产</button>
                  <button type="button" class="btn-sm" @click="openRiskBoard">查看风险预警</button>
                  <button type="button" class="btn-sm" @click="openPurchaseBoard">查看采购协同</button>
                  <button type="button" class="btn-sm" @click="openQualityBoard">查看质量闭环</button>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待交期恢复执行包</strong>
              <span>AI 生产助手生成交期恢复执行包后，会在这里显示排产、风险、采购和质量责任动作的闭环状态。</span>
            </div>
          </div>
        </div>

        <div class="outsourcing-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>外协承诺治理</h4>
                <p>监管产品族外协承诺、到货确认和排产释放，确保厂外等待口径不被误计为厂内恢复。</p>
              </div>
              <strong>{{ outsourcingCommitmentPackages.length }} 条</strong>
            </div>
            <div v-if="outsourcingCommitmentPackages.length" class="outsourcing-governance-list">
              <article v-for="record in outsourcingCommitmentPackages" :key="record.id" class="outsourcing-governance-card">
                <div class="action-topline">
                  <span>{{ record.dimensionLabel }}</span>
                  <em :class="'policy-' + outsourcingCommitmentStatusClass(record)">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>外协对象</span>
                  <code>{{ record.targetName }} / {{ record.affectedOrders }}</code>
                </div>
                <div class="policy-row">
                  <span>外协厂</span>
                  <code>{{ record.partnerName }} / {{ record.promiseDate }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div class="policy-row">
                  <span>到货 / 释放</span>
                  <code>{{ record.receiptTraceId ?? '待到货' }} / {{ record.scheduleReleaseTraceId ?? '待释放' }}</code>
                </div>
                <div class="outsourcing-governance-actions">
                  <button type="button" class="btn-sm" @click="openPurchaseBoard">查看采购协同</button>
                  <button type="button" class="btn-sm" @click="openSchedulingBoard">查看 AI 排产</button>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待外协承诺</strong>
              <span>报表中心生成外协承诺包后，会在这里显示外协厂、到货、排产释放和审计追踪。</span>
            </div>
          </div>
        </div>

        <div class="quality-mrb-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量 MRB 处置治理</h4>
                <p>监管质量报废补料决策，核对隔离、补料、排产重建、客户说明和审计追踪。</p>
              </div>
              <strong>{{ qualityMrbDisposition ? qualityMrbDisposition.actions.length + ' 项' : '0 项' }}</strong>
            </div>
            <article v-if="qualityMrbDisposition" class="quality-mrb-governance-card">
              <div class="action-topline">
                <span>{{ qualityMrbDisposition.dispositionLabel }}</span>
                <em :class="qualityMrbDisposition.status === 'closed' ? 'policy-accepted' : 'policy-guarded'">{{ qualityMrbDisposition.statusLabel }}</em>
              </div>
              <strong>{{ qualityMrbDisposition.title }}</strong>
              <p>{{ qualityMrbDisposition.scheduleImpact }}</p>
              <div class="policy-row">
                <span>OTD 影响</span>
                <code>{{ qualityMrbDisposition.otdImpact }}</code>
              </div>
              <div class="policy-row">
                <span>审计编号</span>
                <code>{{ qualityMrbDisposition.auditId }}</code>
              </div>
              <div class="policy-row">
                <span>排产追踪</span>
                <code>{{ qualityMrbDisposition.scheduleTraceId }}</code>
              </div>
              <div v-if="qualityMrbDisposition.closureTraceId" class="policy-row">
                <span>闭环追踪</span>
                <code>{{ qualityMrbDisposition.closureAuditId }} / {{ qualityMrbDisposition.closureTraceId }}</code>
              </div>
            </article>
            <div v-else class="poc-evidence-empty">
              <strong>等待 MRB 处置决策</strong>
              <span>质量闭环生成报废补料决策后，会在这里显示责任动作、排产追踪和审计编号。</span>
            </div>
          </div>
        </div>

        <div class="risk-sla-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>风险 SLA 晨会治理</h4>
                <p>监管风险处置队列升级来的晨会复核包，核对逾期数、关键风险、责任动作和审计追踪。</p>
              </div>
              <strong>{{ riskSlaReview ? riskSlaReview.overdueCount + '/' + riskSlaReview.criticalCount : '0/0' }}</strong>
            </div>
            <article v-if="riskSlaReview" class="risk-sla-governance-card">
              <div class="action-topline">
                <span>{{ riskSlaReview.reviewMeetingId }}</span>
                <em class="policy-guarded">{{ riskSlaReview.statusLabel }}</em>
              </div>
              <strong>{{ riskSlaReview.title }}</strong>
              <p>{{ riskSlaReview.summary }}</p>
              <div class="policy-row">
                <span>影响对象</span>
                <code>{{ riskSlaReview.affectedOrders }}</code>
              </div>
              <div class="policy-row">
                <span>责任动作</span>
                <code>{{ riskSlaReview.actions.length }} 项</code>
              </div>
              <div class="policy-row">
                <span>审计编号</span>
                <code>{{ riskSlaReview.auditId }}</code>
              </div>
              <div v-if="riskSlaReview.closureTraceId" class="policy-row">
                <span>闭环追踪</span>
                <code>{{ riskSlaReview.closureAuditId }} / {{ riskSlaReview.closureTraceId }}</code>
              </div>
            </article>
            <div v-else class="poc-evidence-empty">
              <strong>等待风险 SLA 复核包</strong>
              <span>风险预警生成晨会复核包后，会在这里显示逾期数、关键风险、责任动作和审计编号。</span>
            </div>
          </div>
        </div>

        <div class="kitting-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>缺料齐套治理</h4>
                <p>监管库存齐套缺口是否已经进入排产、采购和 BOM 约束复核，避免缺料证据只停留在库存页。</p>
              </div>
              <strong>{{ activeKittingEvidenceRecords.length }} 待处理 / {{ kittingEvidenceRecords.length }} 条</strong>
            </div>
            <div v-if="kittingEvidenceRecords.length" class="kitting-governance-list">
              <article v-for="record in kittingEvidenceRecords" :key="record.id" class="kitting-governance-card">
                <div class="action-topline">
                  <span>{{ record.stage }}</span>
                  <em :class="'policy-' + otdEvidenceStatusClass(record.status)">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>影响对象</span>
                  <code>{{ record.object }}</code>
                </div>
                <div class="policy-row">
                  <span>来源</span>
                  <code>{{ record.source }}</code>
                </div>
                <div class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div class="kitting-governance-actions">
                  <button type="button" class="btn-sm" @click="openInventoryBoard">查看库存齐套</button>
                  <button type="button" class="btn-sm" @click="openSchedulingBoard">查看 AI 排产</button>
                  <button type="button" class="btn-sm" @click="openPurchaseBoard">查看采购协同</button>
                  <button type="button" class="btn-sm" @click="openBomBoard">查看 BOM 约束</button>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待缺料齐套证据</strong>
              <span>库存齐套生成缺料排产事件后，会在这里显示工单、物料、BOM 来源、追踪编号和跨页处置入口。</span>
            </div>
          </div>
        </div>

        <div class="poc-evidence-lane">
          <div class="policy-block">
            <h4>客户 POC 证据治理</h4>
            <div v-if="pocEvidenceRecords.length || pocReviewSignoff || pocRolloutPackage || pocPilotRun || pocHypercareAcceptance" class="poc-evidence-list">
              <article v-for="record in pocEvidenceRecords" :key="record.id" class="poc-evidence-card">
                <div class="action-topline">
                  <span>{{ record.scope }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.status }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.description }}</p>
                <div class="policy-row">
                  <span>批次</span>
                  <code>{{ record.batchId }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditId }}</code>
                </div>
              </article>
              <article v-if="pocReviewSignoff" class="poc-evidence-card signoff">
                <div class="action-topline">
                  <span>POC 签署</span>
                  <em class="policy-accepted">已签署</em>
                </div>
                <strong>POC 复盘会评分表治理</strong>
                <p>评分 {{ pocReviewSignoff.totalScore }} / 100，{{ pocReviewSignoff.signedBy }} 已完成复盘签署。</p>
                <div class="policy-row">
                  <span>会议编号</span>
                  <code>{{ pocReviewSignoff.meetingId }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ pocReviewSignoff.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>证据批次</span>
                  <code>{{ pocReviewSignoff.evidenceBatches.join(' / ') }}</code>
                </div>
              </article>
              <article v-if="pocRolloutPackage" class="poc-evidence-card rollout">
                <div class="action-topline">
                  <span>POC 上线交付</span>
                  <em class="policy-pending">{{ pocRolloutPackage.statusLabel }}</em>
                </div>
                <strong>{{ pocRolloutPackage.title }}</strong>
                <p>{{ pocRolloutPackage.summary }}</p>
                <div class="policy-row">
                  <span>上线窗口</span>
                  <code>{{ pocRolloutPackage.rolloutWindow }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ pocRolloutPackage.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>责任动作</span>
                  <code>{{ pocRolloutPackage.actions.length }} 项</code>
                </div>
              </article>
              <article v-if="pocPilotRun" class="poc-evidence-card pilot">
                <div class="action-topline">
                  <span>POC 试点运行</span>
                  <em class="policy-accepted">{{ pocPilotRun.statusLabel }}</em>
                </div>
                <strong>{{ pocPilotRun.title }}</strong>
                <p>{{ pocPilotRun.summary }}</p>
                <div class="policy-row">
                  <span>试点批次</span>
                  <code>{{ pocPilotRun.batchId }}</code>
                </div>
                <div class="policy-row">
                  <span>OTD 实测</span>
                  <code>{{ pocPilotRun.actualOtd }} / {{ pocPilotRun.sampleSize }} 单</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ pocPilotRun.auditId }}</code>
                </div>
              </article>
              <article v-if="pocHypercareAcceptance" class="poc-evidence-card hypercare">
                <div class="action-topline">
                  <span>POC Hypercare</span>
                  <em class="policy-guarded">{{ pocHypercareAcceptance.statusLabel }}</em>
                </div>
                <strong>{{ pocHypercareAcceptance.title }}</strong>
                <p>{{ pocHypercareAcceptance.summary }}</p>
                <div class="policy-row">
                  <span>验收门禁</span>
                  <code>{{ pocHypercareAcceptance.acceptanceGate }}</code>
                </div>
                <div class="policy-row">
                  <span>稳定指标</span>
                  <code>OTD {{ pocHypercareAcceptance.actualOtd }} / OEE {{ pocHypercareAcceptance.currentOee }} / P1P2 {{ pocHypercareAcceptance.unresolvedP1P2 }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ pocHypercareAcceptance.auditId }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待客户证据导入</strong>
              <span>客户工单导入样例与设备故障样例生成后，会在这里显示批次、角色和审计编号。</span>
            </div>
          </div>
        </div>

        <div class="knowledge-governance-lane">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>知识来源治理</h4>
                <p>复核 RAG 文档版本、有效期、索引状态和引用范围，确保 AI 助手只引用已治理知识。</p>
              </div>
              <strong>{{ knowledgePendingDocuments.length }} 待治理 / {{ knowledgeReviewRecords.length }} 已复核</strong>
            </div>
            <div v-if="knowledgePendingDocuments.length" class="knowledge-pending-list">
              <article v-for="document in knowledgePendingDocuments" :key="document.id" class="knowledge-pending-card">
                <div class="action-topline">
                  <span>{{ document.category }}</span>
                  <em :class="document.freshnessStatus === '已过期' || document.indexStatus !== 'indexed' ? 'policy-guarded' : 'policy-pending'">{{ document.freshnessStatus }}</em>
                </div>
                <strong>{{ document.title }}</strong>
                <p>{{ document.summary }}</p>
                <div class="policy-row">
                  <span>索引状态</span>
                  <code>{{ knowledgeIndexStatusLabel(document.indexStatus) }}</code>
                </div>
                <div class="policy-row">
                  <span>有效期</span>
                  <code>{{ document.validUntil }}</code>
                </div>
                <div class="policy-row">
                  <span>责任人</span>
                  <code>{{ document.owner }}</code>
                </div>
                <div class="policy-row">
                  <span>引用范围</span>
                  <code>{{ document.references.join(' / ') }}</code>
                </div>
                <div class="knowledge-action-note">
                  <span>处置建议</span>
                  <strong>{{ document.recommendedAction }}</strong>
                </div>
              </article>
            </div>
            <button
              v-if="knowledgePendingDocuments.length"
              type="button"
              class="btn-sm knowledge-open-button"
              @click="openKnowledgeGovernance"
            >
              打开文档治理
            </button>
            <div v-if="knowledgeReviewRecords.length" class="knowledge-review-list">
              <article v-for="record in knowledgeReviewRecords" :key="record.id" class="knowledge-review-card">
                <div class="action-topline">
                  <span>{{ record.action }}</span>
                  <em class="policy-accepted">已复核</em>
                </div>
                <strong>{{ record.documentTitle }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>版本</span>
                  <code>{{ record.version }} -> {{ record.reviewedVersion }}</code>
                </div>
                <div class="policy-row">
                  <span>有效期</span>
                  <code>{{ record.validUntil }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>引用范围</span>
                  <code>{{ record.references.join(' / ') }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待知识来源复核</strong>
              <span>过期或待索引文档完成复核后，会在这里显示版本变更、索引重建和审计编号。</span>
            </div>
          </div>
        </div>

        <div class="otd-evidence-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>OTD 复盘证据治理</h4>
                <p>从统一证据链读取采购、设备、生产、质量、排产和签署记录，按阶段核对复盘覆盖范围。</p>
              </div>
              <strong>{{ otdEvidenceRecords.length }} 条</strong>
            </div>
            <div v-if="otdEvidenceCards.length" class="otd-evidence-list">
              <article v-for="record in otdEvidenceCards" :key="record.id" class="otd-evidence-card">
                <div class="action-topline">
                  <span>{{ record.stage }}</span>
                  <em :class="'policy-' + otdEvidenceStatusClass(record.status)">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>对象</span>
                  <code>{{ record.object }}</code>
                </div>
                <div class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.traceId }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待 OTD 复盘证据</strong>
              <span>采购收货、设备停机、生产完工、调度采纳或质量 CAPA 写入后，会在这里形成治理清单。</span>
            </div>
          </div>
        </div>

        <div class="quality-policy-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量知识策略治理</h4>
                <p>把低分复核结论转成复用阈值、禁用规则和再训练候选，避免错误泛化继续进入 AI 推荐。</p>
              </div>
              <strong>{{ qualityKnowledgePolicyCards.length }} 条</strong>
            </div>
            <div v-if="qualityKnowledgePolicyCards.length" class="quality-policy-list">
              <article v-for="record in qualityKnowledgePolicyCards" :key="record.id" class="quality-policy-card">
                <div class="action-topline">
                  <span>{{ record.thresholdLabel }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>禁用规则</span>
                  <code>{{ record.rule }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div v-if="record.retrainingTraceId" class="policy-row">
                  <span>再训练候选</span>
                  <code>{{ record.retrainingTraceId }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待质量复用策略证据</strong>
              <span>低分样本复核完成后，会在这里形成阈值、禁用规则和再训练候选治理记录。</span>
            </div>
          </div>
        </div>

        <div class="quality-retraining-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量再训练版本治理</h4>
                <p>监管已批准训练集、发布前校验门、负样本准入和回滚目标，避免再训练版本脱离 Agent 策略面。</p>
              </div>
              <strong>{{ qualityRetrainingGovernanceCards.length }} 条</strong>
            </div>
            <div v-if="qualityRetrainingGovernanceCards.length" class="quality-retraining-list">
              <article v-for="record in qualityRetrainingGovernanceCards" :key="record.id" class="quality-retraining-card">
                <div class="action-topline">
                  <span>{{ record.sampleLabel }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>版本策略</span>
                  <code>{{ record.versionLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>校验门</span>
                  <code>{{ record.validationSummary }}</code>
                </div>
                <div class="policy-row">
                  <span>审计编号</span>
                  <code>{{ record.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>追踪编号</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div v-if="record.rollbackTarget" class="policy-row">
                  <span>回滚目标</span>
                  <code>{{ record.rollbackTarget }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待质量再训练版本</strong>
              <span>再训练候选完成审批或回滚后，会在这里显示训练集版本、校验门、审计编号和回滚目标。</span>
            </div>
          </div>
        </div>

        <div class="quality-feedback-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量推荐采纳治理</h4>
                <p>监管已发布推荐的现场采纳、效果趋势和下一轮训练集候选，避免发布后缺少业务反馈闭环。</p>
              </div>
              <strong>{{ qualityRecommendationFeedbackCards.length }} 条</strong>
            </div>
            <div v-if="qualityRecommendationFeedbackCards.length" class="quality-feedback-list">
              <article v-for="record in qualityRecommendationFeedbackCards" :key="record.id" class="quality-feedback-card">
                <div class="action-topline">
                  <span>{{ record.trainingLabel }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="policy-row">
                  <span>效果趋势</span>
                  <code>{{ record.effectTrendLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>反馈指标</span>
                  <code>{{ record.metricsLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>反馈审计</span>
                  <code>{{ record.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>反馈追踪</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div class="policy-row">
                  <span>下一轮训练</span>
                  <code>{{ record.nextTrainingSetVersion }} / {{ record.nextTrainingTraceId }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待质量推荐采纳反馈</strong>
              <span>已发布训练集推荐被现场采纳或拒绝后，会在这里显示效果趋势、反馈审计和下一轮训练候选。</span>
            </div>
          </div>
        </div>

        <div class="quality-experiment-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量推荐实验池</h4>
                <p>对比 R3/R4/R5/R7 灰度实验的采纳、复验、误召回、效果趋势和扩大/回滚决策。</p>
              </div>
              <strong>{{ qualityRecommendationExperimentCards.length }} 条</strong>
            </div>
            <div v-if="qualityRecommendationExperimentCards.length" class="quality-experiment-list">
              <article
                v-for="record in qualityRecommendationExperimentCards"
                :key="record.id"
                class="quality-experiment-card"
                :class="'policy-' + record.statusClass"
              >
                <div class="action-topline">
                  <span>{{ record.trainingSetVersion }} · {{ record.releaseCycleLabel }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="experiment-metric-grid">
                  <div>
                    <span>推荐采纳</span>
                    <strong>{{ record.adoptionRateLabel }}</strong>
                  </div>
                  <div>
                    <span>复验通过</span>
                    <strong>{{ record.recheckPassRateLabel }}</strong>
                  </div>
                  <div>
                    <span>误召回</span>
                    <strong>{{ record.falseRecallLabel }}</strong>
                  </div>
                  <div>
                    <span>实验评分</span>
                    <strong>{{ record.experimentScoreLabel }}</strong>
                  </div>
                </div>
                <div class="policy-row">
                  <span>效果趋势</span>
                  <code>{{ record.effectTrendLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>反馈审计</span>
                  <code>{{ record.feedbackAuditLabel }} / {{ record.feedbackTraceLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>灰度范围</span>
                  <code>{{ record.releaseScopeLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>灰度审计</span>
                  <code>{{ record.releaseAuditId }} / {{ record.releaseTraceId }}</code>
                </div>
                <div class="policy-row">
                  <span>决策状态</span>
                  <code>{{ record.decisionLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>扩大门禁</span>
                  <code>{{ record.gatePassLabel }} / {{ record.gatePolicyLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>门禁审计</span>
                  <code>{{ record.gateAuditLabel }}</code>
                </div>
                <div v-if="record.decisionAuditId" class="policy-row">
                  <span>决策审计</span>
                  <code>{{ record.decisionAuditId }} / {{ record.decisionTraceId }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待质量推荐实验反馈</strong>
              <span>R3/R4/R5/R7 灰度实验产生采纳、复验和扩大/回滚决策后，会在这里沉淀多版本实验池；当前扩大门禁为 {{ qualityExperimentGatePolicy.policyLabel }}。</span>
            </div>
          </div>
        </div>

        <div class="quality-experiment-candidate-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量实验候选治理</h4>
                <p>把回滚实验转成下一轮 R6/R7 候选，先补齐负样本覆盖，再进入影子验证，避免失败实验直接重新扩大。</p>
              </div>
              <strong>{{ qualityExperimentCandidateCards.length }} 条</strong>
            </div>
            <div v-if="qualityExperimentCandidateCards.length" class="quality-experiment-candidate-list">
              <article
                v-for="record in qualityExperimentCandidateCards"
                :key="record.id"
                class="quality-experiment-candidate-card"
                :class="'policy-' + record.statusClass"
              >
                <div class="action-topline">
                  <span>{{ record.candidateTrainingSetVersion }} · {{ record.triggerLabel }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="experiment-metric-grid">
                  <div>
                    <span>负样本覆盖</span>
                    <strong>{{ record.negativeCoverageLabel }}</strong>
                  </div>
                  <div>
                    <span>覆盖率</span>
                    <strong>{{ record.coveragePercentLabel }}</strong>
                  </div>
                  <div>
                    <span>误召回</span>
                    <strong>{{ record.falseRecallLabel }}</strong>
                  </div>
                  <div>
                    <span>补齐缺口</span>
                    <strong>{{ record.gapLabel }}</strong>
                  </div>
                </div>
                <div class="policy-row">
                  <span>门禁策略</span>
                  <code>{{ record.gatePolicyLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>来源审计</span>
                  <code>{{ record.sourceAuditId }} / {{ record.sourceTraceId }}</code>
                </div>
                <div class="policy-row">
                  <span>候选审计</span>
                  <code>{{ record.auditId }} / {{ record.traceId }}</code>
                </div>
                <div class="policy-row">
                  <span>下一步</span>
                  <code>{{ record.nextAction }}</code>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待回滚实验沉淀候选</strong>
              <span>实验回滚后会在这里派生 R6/R7 候选，展示负样本覆盖率、误召回缺口和影子验证策略。</span>
            </div>
          </div>
        </div>

        <div class="quality-gray-monitor-governance">
          <div class="policy-block">
            <div class="otd-governance-heading">
              <div>
                <h4>质量推荐灰度监控</h4>
                <p>监管 R3 灰度后的推荐采纳率、复验通过率和负样本误召回，确认灰度发布是否可继续扩大范围。</p>
              </div>
              <strong>{{ qualityGrayReleaseMonitorCards.length }} 条</strong>
            </div>
            <div v-if="qualityGrayReleaseMonitorCards.length" class="quality-gray-monitor-list">
              <article v-for="record in qualityGrayReleaseMonitorCards" :key="record.id" class="quality-gray-monitor-card">
                <div class="action-topline">
                  <span>{{ record.scopeLabel }}</span>
                  <em :class="'policy-' + record.statusClass">{{ record.statusLabel }}</em>
                </div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
                <div class="gray-metric-grid">
                  <div v-for="metric in record.metrics" :key="metric.label" class="gray-metric" :class="'policy-' + metric.statusClass">
                    <span>{{ metric.label }}</span>
                    <strong>{{ metric.value }}</strong>
                  </div>
                </div>
                <div class="policy-row">
                  <span>版本</span>
                  <code>{{ record.versionLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>负样本监控</span>
                  <code>{{ record.negativeSampleLabel }}</code>
                </div>
                <div class="policy-row">
                  <span>灰度审计</span>
                  <code>{{ record.auditId }}</code>
                </div>
                <div class="policy-row">
                  <span>灰度追踪</span>
                  <code>{{ record.traceId }}</code>
                </div>
                <div v-if="grayReleaseDecisionFor(record)" class="gray-decision-result" :class="'policy-' + grayReleaseDecisionFor(record)?.statusClass">
                  <span>{{ grayReleaseDecisionFor(record)?.decisionLabel }}</span>
                  <em>{{ grayReleaseDecisionFor(record)?.approvalLabel }}</em>
                  <strong>{{ grayReleaseDecisionFor(record)?.auditId }}</strong>
                  <code>{{ grayReleaseDecisionFor(record)?.traceId }}</code>
                  <div v-if="grayReleaseDecisionFor(record)?.reviewIssueId" class="gray-review-issue">
                    <span>{{ grayReleaseDecisionFor(record)?.reviewIssueLabel ?? '待复核' }}</span>
                    <code>{{ grayReleaseDecisionFor(record)?.reviewIssueId }} / {{ grayReleaseDecisionFor(record)?.reviewIssueTraceId }}</code>
                    <small v-if="grayReleaseDecisionFor(record)?.reviewIssueValidationAuditId">
                      {{ grayReleaseDecisionFor(record)?.reviewIssueValidationAuditId }}
                    </small>
                  </div>
                  <button
                    v-if="grayReleaseDecisionFor(record)?.decision === 'expanded' && grayReleaseDecisionFor(record)?.approvalStatus === 'pending'"
                    type="button"
                    class="btn-sm approve"
                    @click="approveGrayReleaseExpansion(grayReleaseDecisionFor(record)!)"
                  >
                    质量主管确认扩大
                  </button>
                  <template v-if="grayReleaseDecisionFor(record)?.decision === 'rolled_back' && grayReleaseDecisionFor(record)?.reviewIssueStatus === 'open'">
                    <button
                      type="button"
                      class="btn-sm approve"
                      @click="closeGrayReviewIssueWithNegativeSample(grayReleaseDecisionFor(record)!)"
                    >
                      补充负样本并关闭
                    </button>
                    <button
                      type="button"
                      class="btn-sm"
                      @click="reopenGrayPrevalidationWithScopeAdjustment(grayReleaseDecisionFor(record)!)"
                    >
                      调整范围重开校验
                    </button>
                  </template>
                </div>
                <div v-else class="gray-decision-actions">
                  <button type="button" class="btn-sm approve" @click="handleGrayReleaseDecision(record, 'expanded')">扩大灰度</button>
                  <button type="button" class="btn-sm reject" @click="handleGrayReleaseDecision(record, 'rolled_back')">回滚到 R2</button>
                </div>
              </article>
            </div>
            <div v-else class="poc-evidence-empty">
              <strong>等待质量推荐灰度发布</strong>
              <span>R3 训练集灰度发布后，会在这里持续监控采纳率、复验通过率和负样本误召回。</span>
            </div>
          </div>
        </div>

        <div class="policy-lane">
          <div class="policy-block">
            <h4>执行策略</h4>
            <div v-for="policy in agentPolicies" :key="policy.label" class="policy-row">
              <span>{{ policy.label }}</span>
              <strong>{{ policy.value }}</strong>
            </div>
          </div>
          <div class="policy-block">
            <h4>关键配置变更审批</h4>
            <div v-for="approval in agentApprovals" :key="approval.title" class="approval-row">
              <div>
                <strong>{{ approval.title }}</strong>
                <p>{{ approval.reason }}</p>
              </div>
              <div class="approval-actions">
                <em :class="'approval-' + approval.status">{{ approvalStatusLabel(approval.status) }}</em>
                <button v-if="isApprovalOpen(approval.status)" type="button" class="btn-sm approve" @click="handleApprovalDecision(approval.id, 'approved')">通过</button>
                <button v-if="isApprovalOpen(approval.status)" type="button" class="btn-sm reject" @click="handleApprovalDecision(approval.id, 'rejected')">驳回</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 新建用户对话框 -->
    <div v-if="showUserCreate" class="modal-overlay" @click.self="showUserCreate = false">
      <div class="modal-content">
        <h3>新增用户</h3>
        <div class="form-group"><label>用户名</label><input v-model="createForm.username" class="form-input" /></div>
        <div class="form-group"><label>显示名</label><input v-model="createForm.displayName" class="form-input" /></div>
        <div class="form-group"><label>初始密码</label><input v-model="createForm.password" type="password" class="form-input" placeholder="默认 aimes123" /></div>
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

    <!-- LLM 设置 -->
    <div v-if="tab === 'llm'" class="tab-content">
      <div class="llm-section">
        <h4>LLM 状态</h4>
        <div v-if="llmLoading" class="llm-loading">检测中...</div>
        <div v-else class="llm-status">
          <div class="status-row">
            <span class="status-label">提供者</span>
            <span class="status-value">{{ llmStatus.provider || '-' }}</span>
          </div>
          <div class="status-row">
            <span class="status-label">模型</span>
            <span class="status-value">{{ llmStatus.model || '-' }}</span>
          </div>
          <div class="status-row">
            <span class="status-label">连通性</span>
            <span class="status-dot" :class="llmStatus.reachable ? 'dot-green' : 'dot-red'"></span>
            <span :style="{ color: llmStatus.reachable ? '#52c41a' : '#ff4d4f' }">
              {{ llmStatus.reachable ? '已连接' : '未连接' }}
            </span>
          </div>
          <div v-if="llmStatus.version" class="status-row">
            <span class="status-label">服务地址</span>
            <span class="status-value mono">{{ llmStatus.version }}</span>
          </div>
          <div v-if="llmStatus.error" class="status-row">
            <span class="status-label">错误信息</span>
            <span class="status-error">{{ llmStatus.error }}</span>
          </div>
        </div>
      </div>

      <div class="llm-section">
        <h4>当前配置</h4>
        <div v-if="llmConfig" class="llm-config">
          <div v-if="llmConfig.provider === 'Ollama'" class="config-detail">
            <div><span class="config-key">Ollama 地址：</span><code>{{ llmConfig.ollama.baseUrl }}</code></div>
            <div><span class="config-key">模型：</span><code>{{ llmConfig.ollama.model }}</code></div>
          </div>
          <div v-else-if="llmConfig.provider === 'AzureOpenAI'" class="config-detail">
            <div><span class="config-key">端点：</span><code>{{ llmConfig.azureOpenAI.endpoint }}</code></div>
            <div><span class="config-key">部署名：</span><code>{{ llmConfig.azureOpenAI.deploymentName }}</code></div>
          </div>
          <div v-else-if="llmConfig.provider === 'OpenAI'" class="config-detail">
            <div><span class="config-key">模型：</span><code>{{ llmConfig.openAI.modelId }}</code></div>
          </div>
        </div>
      </div>

      <div class="llm-section">
        <h4>切换提供者</h4>
        <p class="section-desc">在 <code>appsettings.Development.json</code> 中修改 <code>AI:Llm:Provider</code> 后重启服务。</p>
        <div class="provider-cards">
          <div class="provider-card" :class="{ active: llmConfig?.provider === 'Ollama' }">
            <div class="provider-name">Ollama</div>
            <div class="provider-desc">本地部署，无需联网</div>
            <div class="provider-badge" v-if="llmConfig?.provider === 'Ollama'">当前</div>
          </div>
          <div class="provider-card" :class="{ active: llmConfig?.provider === 'AzureOpenAI' }">
            <div class="provider-name">Azure OpenAI</div>
            <div class="provider-desc">企业级云服务</div>
            <div class="provider-badge" v-if="llmConfig?.provider === 'AzureOpenAI'">当前</div>
          </div>
          <div class="provider-card" :class="{ active: llmConfig?.provider === 'OpenAI' }">
            <div class="provider-name">OpenAI</div>
            <div class="provider-desc">标准 OpenAI API</div>
            <div class="provider-badge" v-if="llmConfig?.provider === 'OpenAI'">当前</div>
          </div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SystemUser, SystemConfig, CreateUserRequest, UpdateUserRequest, UpdateConfigRequest, NotificationConfig } from '../../types/admin'
import { getUsers, createUser, updateUser, getConfigs, updateConfig, getNotificationConfigs, updateNotificationConfig } from '../../api/admin'
import { getLlmStatus, getLlmConfig } from '../../api/llm'
import type { LlmStatus, LlmConfig } from '../../api/llm'
import { readAssistantActionAudits, type AssistantActionAuditRecord } from '../../utils/assistant-action-audit'
import { readAssistantRecoveryPackages, type AssistantRecoveryPackage } from '../../utils/assistant-action-package-sync'
import { readPocEvidenceGovernanceRecords, type PocEvidenceGovernanceRecord } from '../../utils/poc-evidence-governance'
import { approvalStatusLabel, decideAgentConfigApproval, isApprovalOpen, readAgentConfigApprovals, readQualityExperimentExpansionGatePolicy, type AgentConfigApprovalRecord, type AgentConfigApprovalStatus, type QualityExperimentExpansionGatePolicy } from '../../utils/agent-config-approval-sync'
import { readPocReviewSignoffRecord, type PocReviewSignoffRecord } from '../../utils/poc-review-signoff-sync'
import { readPocRolloutPackageRecord, type PocRolloutPackageRecord } from '../../utils/poc-rollout-package-sync'
import { readPocPilotRunRecord, type PocPilotRunRecord } from '../../utils/poc-pilot-run-sync'
import { readPocHypercareAcceptanceRecord, type PocHypercareAcceptanceRecord } from '../../utils/poc-hypercare-sync'
import { readRiskSlaReviewRecord, type RiskSlaReviewRecord } from '../../utils/risk-sla-review-sync'
import { readQualityMrbDispositionRecord, type QualityMrbDispositionRecord } from '../../utils/quality-mrb-disposition-sync'
import { readOutsourcingCommitmentPackages, type OutsourcingCommitmentPackage } from '../../utils/outsourcing-commitment-sync'
import { readOtdEvidenceChainRecords, type OtdEvidenceChainItem, type OtdEvidenceStatus } from '../../utils/otd-evidence-chain-sync'
import {
  readKnowledgeGovernancePendingDocuments,
  readKnowledgeGovernanceReviews,
  type KnowledgeGovernanceReviewRecord,
  type KnowledgeGovernanceSourceDocument,
  type KnowledgeIndexStatus,
} from '../../utils/knowledge-governance-sync'
import {
  approveQualityKnowledgeGrayReleaseExpansion,
  buildQualityKnowledgeRecommendationFeedbackGovernanceRecords,
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeRecommendationExperimentComparisonRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  buildQualityKnowledgePolicyGovernanceRecords,
  buildQualityKnowledgeRetrainingGovernanceRecords,
  closeQualityKnowledgeGrayReviewIssueWithNegativeSample,
  decideQualityKnowledgeGrayRelease,
  isQualityKnowledgeGrayRepublishEvidence,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeReviewQueueRecords,
  readQualityKnowledgeRetrainingVersionRecords,
  reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment,
  type QualityKnowledgeGrayReleaseDecisionRecord,
  type QualityKnowledgeGrayReleaseDecisionType,
  type QualityKnowledgeRecommendationExperimentCandidateRecord,
  type QualityKnowledgeRecommendationExperimentComparisonRecord,
  type QualityKnowledgeRecommendationFeedbackGovernanceRecord,
  type QualityKnowledgeRecommendationFeedbackRecord,
  type QualityKnowledgeGrayReleaseMonitorRecord,
  type QualityKnowledgePolicyGovernanceRecord,
  type QualityKnowledgeReviewQueueRecord,
  type QualityKnowledgeRetrainingGovernanceRecord,
  type QualityKnowledgeRetrainingVersionRecord,
} from '../../utils/quality-knowledge-sample-sync'

const router = useRouter()
const tab = ref('users')
const users = ref<SystemUser[]>([])
const currentPage = ref(1)
const pageSize = ref(15)
const configs = ref<SystemConfig[]>([])
const notificationConfigs = ref<NotificationConfig[]>([])
const pocEvidenceRecords = ref<PocEvidenceGovernanceRecord[]>([])
const agentApprovals = ref<AgentConfigApprovalRecord[]>([])
const assistantActionAudits = ref<AssistantActionAuditRecord[]>([])
const assistantRecoveryPackages = ref<AssistantRecoveryPackage[]>([])
const pocReviewSignoff = ref<PocReviewSignoffRecord | null>(null)
const pocRolloutPackage = ref<PocRolloutPackageRecord | null>(null)
const pocPilotRun = ref<PocPilotRunRecord | null>(null)
const pocHypercareAcceptance = ref<PocHypercareAcceptanceRecord | null>(null)
const riskSlaReview = ref<RiskSlaReviewRecord | null>(null)
const qualityMrbDisposition = ref<QualityMrbDispositionRecord | null>(null)
const outsourcingCommitmentPackages = ref<OutsourcingCommitmentPackage[]>([])
const otdEvidenceRecords = ref<OtdEvidenceChainItem[]>([])
const knowledgeReviewRecords = ref<KnowledgeGovernanceReviewRecord[]>([])
const knowledgePendingDocuments = ref<KnowledgeGovernanceSourceDocument[]>([])
const qualityKnowledgeReviewRecords = ref<QualityKnowledgeReviewQueueRecord[]>([])
const qualityRetrainingVersionRecords = ref<QualityKnowledgeRetrainingVersionRecord[]>([])
const qualityRecommendationFeedbackRecords = ref<QualityKnowledgeRecommendationFeedbackRecord[]>([])
const qualityGrayReleaseDecisionRecords = ref<QualityKnowledgeGrayReleaseDecisionRecord[]>([])
const userSearch = ref('')
const llmStatus = ref<LlmStatus>({ provider: '', model: '', reachable: false })
const llmConfig = ref<LlmConfig | null>(null)
const llmLoading = ref(false)
const showUserCreate = ref(false)
const editUserTarget = ref<SystemUser | null>(null)
const editUserForm = ref<UpdateUserRequest>({})
const createForm = ref<CreateUserRequest>({ username: '', displayName: '', password: '', role: 'Operator' })
const agentActions = [
  {
    scope: 'AI 排产',
    name: '生成重排建议',
    description: '由风险队列触发，输出锁定期、物料齐套、设备能力和 OTD 影响解释。',
    requiredRole: 'Engineer / Admin',
    auditId: 'TRACE-SCH-20260520-001',
    status: '人工采纳',
    statusClass: 'accepted',
  },
  {
    scope: '异常管理',
    name: '创建异常处置卡',
    description: 'AI 生产助手可把现场事件转为处置卡，并路由到异常管理现场事件中心。',
    requiredRole: 'Admin',
    auditId: 'AUD-CHAT-ANOMALY-20260520',
    status: '权限校验',
    statusClass: 'guarded',
  },
  {
    scope: '报表中心',
    name: '导出 OTD 复盘',
    description: '导出基线对比、Agent 推荐、采纳原因和 POC 验收证据。',
    requiredRole: 'Engineer / Admin',
    auditId: 'REPORT-OTD-20260520',
    status: '留痕导出',
    statusClass: 'logged',
  },
  {
    scope: '知识治理',
    name: '复核 RAG 知识来源',
    description: '过期或待索引文档复核后重建索引，并把版本、有效期、引用范围和审计编号纳入治理面。',
    requiredRole: 'Engineer / Admin',
    auditId: 'AUD-KG-REINDEX-20260520-001',
    status: '索引复核',
    statusClass: 'accepted',
  },
  {
    scope: 'POC 证据',
    name: '治理客户工单导入样例',
    description: '客户真实工单样例生成后，校验字段映射、风险识别、批次归档和报表评分回写。',
    requiredRole: 'Engineer / Admin',
    auditId: 'AUD-POC-WO-*',
    status: '证据归档',
    statusClass: 'logged',
  },
  {
    scope: 'POC 证据',
    name: '治理客户设备故障样例',
    description: '客户设备故障样例生成后，校验信号来源、影响工单、停机窗口和排产事件联动。',
    requiredRole: 'Engineer / Admin',
    auditId: 'AUD-POC-EQ-*',
    status: '事件联动',
    statusClass: 'accepted',
  },
  {
    scope: 'POC 签署',
    name: '归档 POC 复盘签署',
    description: '证据包齐套后固化复盘会评分表、签署人、证据批次和审计编号。',
    requiredRole: 'Engineer / Admin',
    auditId: 'AUD-POC-REVIEW-20260520',
    status: '验收归档',
    statusClass: 'accepted',
  },
  {
    scope: 'AI 生产助手',
    name: '治理助手可执行动作',
    description: 'AI 生产助手执行或拒绝的动作进入 Agent 治理，按执行人、角色、目标页面和审计编号核对。',
    requiredRole: 'Admin',
    auditId: 'AUD-CHAT-*',
    status: '动作审计',
    statusClass: 'logged',
  },
]
const qualityKnowledgePolicyCards = computed<QualityKnowledgePolicyGovernanceRecord[]>(() =>
  buildQualityKnowledgePolicyGovernanceRecords(qualityKnowledgeReviewRecords.value)
)
const qualityRetrainingGovernanceCards = computed<QualityKnowledgeRetrainingGovernanceRecord[]>(() =>
  buildQualityKnowledgeRetrainingGovernanceRecords(qualityRetrainingVersionRecords.value)
)
const qualityRecommendationFeedbackCards = computed<QualityKnowledgeRecommendationFeedbackGovernanceRecord[]>(() =>
  buildQualityKnowledgeRecommendationFeedbackGovernanceRecords(qualityRecommendationFeedbackRecords.value)
)
const qualityExperimentGatePolicy = computed<QualityExperimentExpansionGatePolicy>(() =>
  readQualityExperimentExpansionGatePolicy(agentApprovals.value)
)
const qualityRecommendationExperimentCards = computed<QualityKnowledgeRecommendationExperimentComparisonRecord[]>(() =>
  buildQualityKnowledgeRecommendationExperimentComparisonRecords(
    qualityRetrainingVersionRecords.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value,
    qualityExperimentGatePolicy.value
  )
)
const qualityExperimentCandidateCards = computed<QualityKnowledgeRecommendationExperimentCandidateRecord[]>(() =>
  buildQualityKnowledgeRecommendationExperimentCandidateRecords(
    qualityRetrainingVersionRecords.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value,
    qualityExperimentGatePolicy.value
  )
)
const qualityGrayReleaseMonitorCards = computed<QualityKnowledgeGrayReleaseMonitorRecord[]>(() =>
  buildQualityKnowledgeGrayReleaseMonitorRecords(qualityRetrainingVersionRecords.value, qualityRecommendationFeedbackRecords.value, qualityExperimentGatePolicy.value)
)
const qualityGrayReleaseDecisionCards = computed(() => qualityGrayReleaseDecisionRecords.value)
const latestOutsourcingCommitment = computed(() => outsourcingCommitmentPackages.value[0] ?? null)
const latestAssistantRecoveryPackage = computed(() => assistantRecoveryPackages.value[0] ?? null)
const kittingEvidenceRecords = computed(() =>
  otdEvidenceRecords.value.filter(record => record.stage === '库存齐套')
)
const activeKittingEvidenceRecords = computed(() =>
  kittingEvidenceRecords.value.filter(record => record.status !== 'closed')
)
const qualityClosedPolicy = computed(() =>
  qualityKnowledgeReviewRecords.value.find(record => record.status === 'closed')
)
const latestQualityRetrainingVersion = computed(() => qualityRetrainingVersionRecords.value[0] ?? null)
const latestQualityRecommendationFeedback = computed(() => qualityRecommendationFeedbackRecords.value[0] ?? null)
const latestQualityRecommendationExperiment = computed(() => qualityRecommendationExperimentCards.value[0] ?? null)
const qualityRecommendationRollbackExperimentCount = computed(() =>
  qualityRecommendationExperimentCards.value.filter(record => record.statusLabel.includes('回滚')).length
)
const qualityRecommendationExpandedExperimentCount = computed(() =>
  qualityRecommendationExperimentCards.value.filter(record => record.statusLabel.includes('扩大')).length
)
const latestQualityExperimentCandidate = computed(() => qualityExperimentCandidateCards.value[0] ?? null)
const latestQualityGrayReleaseMonitor = computed(() => qualityGrayReleaseMonitorCards.value[0] ?? null)
const latestQualityGrayReleaseDecision = computed(() => qualityGrayReleaseDecisionRecords.value[0] ?? null)
const qualityGrayReleaseReviewIssueCount = computed(() =>
  qualityGrayReleaseDecisionRecords.value.filter(record => record.reviewIssueId).length
)
const qualityGrayReleaseOpenReviewIssueCount = computed(() =>
  qualityGrayReleaseDecisionRecords.value.filter(record => record.reviewIssueStatus === 'open').length
)
const agentPolicies = computed(() => [
  { label: '置信度阈值', value: '0.80' },
  { label: '锁定期保护', value: '8h' },
  { label: '低置信建议', value: '只进人工复核队列' },
  { label: '质量复用低分阈值', value: '70 分' },
  {
    label: '质量低分候选',
    value: qualityClosedPolicy.value
      ? '禁用直接复用 + 再训练候选'
      : '只进人工复核队列',
  },
  {
    label: '质量再训练版本',
    value: latestQualityRetrainingVersion.value
      ? `${latestQualityRetrainingVersion.value.trainingSetVersion} / ${latestQualityRetrainingVersion.value.statusLabel}`
      : '候选审批后纳入监管',
  },
  {
    label: '质量推荐采纳',
    value: latestQualityRecommendationFeedback.value
      ? `${latestQualityRecommendationFeedback.value.effectTrendLabel} / ${latestQualityRecommendationFeedback.value.nextTrainingSetVersion}`
      : '发布推荐后等待现场反馈',
  },
  {
    label: '质量推荐实验池',
    value: latestQualityRecommendationExperiment.value
      ? `${qualityRecommendationExperimentCards.value.length} 个实验 / ${qualityRecommendationExpandedExperimentCount.value} 个扩大 / ${qualityRecommendationRollbackExperimentCount.value} 个回滚`
      : 'R3/R4/R5/R7 灰度后沉淀',
  },
  {
    label: '质量实验扩大门禁',
    value: qualityExperimentGatePolicy.value.policyLabel,
  },
  {
    label: '质量实验候选',
    value: latestQualityExperimentCandidate.value
      ? `${qualityExperimentCandidateCards.value.length} 个候选 / ${latestQualityExperimentCandidate.value.candidateTrainingSetVersion} ${latestQualityExperimentCandidate.value.coveragePercentLabel}`
      : '回滚后派生 R6/R7',
  },
  {
    label: '质量灰度监控',
    value: latestQualityGrayReleaseMonitor.value
      ? `${latestQualityGrayReleaseMonitor.value.adoptionRateLabel} 采纳 / ${latestQualityGrayReleaseMonitor.value.falseRecallLabel} 误召回`
      : '灰度发布后启用',
  },
  {
    label: '质量灰度决策',
    value: latestQualityGrayReleaseDecision.value
      ? `${latestQualityGrayReleaseDecision.value.trainingSetVersion} / ${latestQualityGrayReleaseDecision.value.decisionLabel}`
      : '达标后扩大或回滚',
  },
  {
    label: '灰度复核问题单',
    value: qualityGrayReleaseReviewIssueCount.value
      ? `${qualityGrayReleaseOpenReviewIssueCount.value} 待复核 / ${qualityGrayReleaseReviewIssueCount.value} 总数`
      : '回滚后自动生成',
  },
  { label: '关键配置变更', value: '审批通过后生效' },
])
const agentGovernanceMetrics = computed(() => [
  { label: '可执行动作', value: agentActions.length },
  { label: '需 Admin 权限', value: agentActions.filter(item => item.requiredRole === 'Admin').length },
  { label: '助手动作审计', value: assistantActionAudits.value.length },
  { label: '助手拒绝动作', value: assistantActionAudits.value.filter(item => !item.permitted).length },
  {
    label: '交期恢复包',
    value: latestAssistantRecoveryPackage.value
      ? `${assistantRecoveryPackages.value.length} 条 / ${latestAssistantRecoveryPackage.value.statusLabel}`
      : '待生成',
  },
  {
    label: '外协承诺包',
    value: latestOutsourcingCommitment.value
      ? `${outsourcingCommitmentPackages.value.length} 条 / ${latestOutsourcingCommitment.value.statusLabel}`
      : '待生成',
  },
  { label: '配置审批中', value: agentApprovals.value.filter(item => isApprovalOpen(item.status)).length },
  {
    label: '缺料齐套治理',
    value: kittingEvidenceRecords.value.length
      ? `${activeKittingEvidenceRecords.value.length} 待处理 / ${kittingEvidenceRecords.value.length} 条`
      : '待生成',
  },
  { label: '知识待治理', value: knowledgePendingDocuments.value.length },
  { label: '知识复核', value: knowledgeReviewRecords.value.length },
  { label: '质量策略规则', value: qualityKnowledgePolicyCards.value.length },
  { label: '再训练版本', value: qualityRetrainingGovernanceCards.value.length },
  { label: '推荐采纳反馈', value: qualityRecommendationFeedbackCards.value.length },
  { label: '推荐实验', value: qualityRecommendationExperimentCards.value.length },
  { label: '实验候选', value: qualityExperimentCandidateCards.value.length },
  { label: '灰度监控', value: qualityGrayReleaseMonitorCards.value.length },
  { label: '灰度决策', value: qualityGrayReleaseDecisionCards.value.length },
  { label: '灰度复核', value: qualityGrayReleaseOpenReviewIssueCount.value },
  { label: 'OTD 复盘证据', value: otdEvidenceRecords.value.length },
  { label: 'POC 复盘签署', value: pocReviewSignoff.value ? '已签署' : '待签署' },
  { label: 'POC 上线交付', value: pocRolloutPackage.value ? '行动包已生成' : '待生成' },
  { label: 'POC 试点运行', value: pocPilotRun.value ? '已闭环' : '待确认' },
  { label: 'POC Hypercare', value: pocHypercareAcceptance.value ? pocHypercareAcceptance.value.statusLabel : '待生成' },
  { label: '风险 SLA 复核', value: riskSlaReview.value ? riskSlaReview.value.statusLabel : '待生成' },
  { label: '质量 MRB 处置', value: qualityMrbDisposition.value ? qualityMrbDisposition.value.statusLabel : '待生成' },
  { label: '审计覆盖', value: '100%' },
])
const otdEvidenceCards = computed(() => otdEvidenceRecords.value.slice(0, 8))

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const s = userSearch.value.toLowerCase()
  return users.value.filter(u => u.username.includes(s) || u.displayName.includes(s))
})

const totalCount = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
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
watch(userSearch, () => { currentPage.value = 1 })

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
  createForm.value = { username: '', displayName: '', password: '', role: 'Operator' }
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

async function loadLlmStatus() {
  llmLoading.value = true
  try {
    llmStatus.value = await getLlmStatus()
    llmConfig.value = await getLlmConfig()
  } catch {
    llmStatus.value = { provider: '-', model: '-', reachable: false }
    llmConfig.value = null
  } finally {
    llmLoading.value = false
  }
}

function openAuditLogs() {
  router.push('/audit-logs')
}

function openKnowledgeGovernance() {
  router.push('/knowledge/documents')
}

function openPurchaseBoard() {
  router.push('/purchase')
}

function openInventoryBoard() {
  router.push('/inventory')
}

function openBomBoard() {
  router.push('/bom')
}

function openSchedulingBoard() {
  router.push('/scheduling')
}

function openRiskBoard() {
  router.push('/risk')
}

function openQualityBoard() {
  router.push('/quality')
}

function knowledgeIndexStatusLabel(status: KnowledgeIndexStatus) {
  return {
    indexed: '已索引',
    pending: '待索引',
    failed: '失败',
  }[status]
}

function assistantActionTypeLabel(type: AssistantActionAuditRecord['type']) {
  return {
    navigate: '页面跳转',
    schedule_suggestion: '排产建议',
    export_report: '报表导出',
    create_anomaly_card: '异常处置',
    delivery_recovery_package: '交期恢复包',
  }[type]
}

function assistantActionStatusClass(permitted: boolean) {
  return permitted ? 'accepted' : 'guarded'
}

function outsourcingCommitmentStatusClass(record: OutsourcingCommitmentPackage) {
  if (record.scheduleReleaseTraceId) return 'accepted'
  if (record.receiptTraceId) return 'guarded'
  return 'pending'
}

function assistantPackageStatusClass(record: AssistantRecoveryPackage) {
  if (record.status === 'closed') return 'accepted'
  if (record.purchaseActionStatus === 'closed' || record.qualityActionStatus === 'closed') return 'guarded'
  return 'pending'
}

function otdEvidenceStatusClass(status: OtdEvidenceStatus) {
  if (status === 'closed') return 'accepted'
  if (status === 'active') return 'guarded'
  return 'logged'
}

function handleApprovalDecision(id: string, decision: Extract<AgentConfigApprovalStatus, 'approved' | 'rejected'>) {
  decideAgentConfigApproval(id, decision, 'admin')
  agentApprovals.value = readAgentConfigApprovals()
}

function grayReleaseDecisionFor(record: QualityKnowledgeGrayReleaseMonitorRecord) {
  return qualityGrayReleaseDecisionRecords.value.find(decision =>
    decision.trainingSetVersion === record.trainingSetVersion
    && decision.targetWorkOrderId === record.targetWorkOrderId
    && decision.operationCode === record.operationCode
    && decision.releaseCycleLabel === record.releaseCycleLabel
    && (
      decision.reviewIssueStatus !== 'prevalidation_reopened'
      || !isQualityKnowledgeGrayRepublishEvidence(record)
    )
  )
}

function handleGrayReleaseDecision(
  record: QualityKnowledgeGrayReleaseMonitorRecord,
  decision: QualityKnowledgeGrayReleaseDecisionType
) {
  decideQualityKnowledgeGrayRelease(record, decision, new Date().toISOString())
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function approveGrayReleaseExpansion(record: QualityKnowledgeGrayReleaseDecisionRecord) {
  approveQualityKnowledgeGrayReleaseExpansion(record, new Date().toISOString())
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function closeGrayReviewIssueWithNegativeSample(record: QualityKnowledgeGrayReleaseDecisionRecord) {
  closeQualityKnowledgeGrayReviewIssueWithNegativeSample(record, new Date().toISOString())
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function reopenGrayPrevalidationWithScopeAdjustment(record: QualityKnowledgeGrayReleaseDecisionRecord) {
  reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment(record, new Date().toISOString())
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function formatTime(t: string) { return t?.slice(0, 16).replace('T', ' ') || '' }

onMounted(async () => {
  pocEvidenceRecords.value = readPocEvidenceGovernanceRecords()
  agentApprovals.value = readAgentConfigApprovals()
  assistantActionAudits.value = readAssistantActionAudits()
  assistantRecoveryPackages.value = readAssistantRecoveryPackages()
  pocReviewSignoff.value = readPocReviewSignoffRecord()
  pocRolloutPackage.value = readPocRolloutPackageRecord()
  pocPilotRun.value = readPocPilotRunRecord()
  pocHypercareAcceptance.value = readPocHypercareAcceptanceRecord()
  riskSlaReview.value = readRiskSlaReviewRecord()
  qualityMrbDisposition.value = readQualityMrbDispositionRecord()
  outsourcingCommitmentPackages.value = readOutsourcingCommitmentPackages()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
  knowledgeReviewRecords.value = readKnowledgeGovernanceReviews()
  knowledgePendingDocuments.value = readKnowledgeGovernancePendingDocuments()
  qualityKnowledgeReviewRecords.value = readQualityKnowledgeReviewQueueRecords()
  qualityRetrainingVersionRecords.value = readQualityKnowledgeRetrainingVersionRecords()
  qualityRecommendationFeedbackRecords.value = readQualityKnowledgeRecommendationFeedbackRecords()
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  try { users.value = (await getUsers()).items }
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

/* Agent 治理 */
.agent-governance-panel { display: flex; flex-direction: column; gap: 14px; padding: 14px; border: 1px solid #bfdbfe; border-radius: 8px; background: #f8fbff; }
.agent-heading { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.agent-heading-actions { display: flex; flex: 0 0 auto; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.agent-heading h3 { margin: 0 0 6px; font-size: 17px; color: #0f172a; }
.agent-heading p { margin: 0; color: #64748b; font-size: 13px; }
.eyebrow { display: block; margin-bottom: 4px; color: #1d4ed8; font-size: 11px; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
.agent-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.agent-metric { padding: 12px; border: 1px solid #dbeafe; border-radius: 6px; background: #fff; }
.agent-metric strong { display: block; margin-bottom: 3px; color: #0f172a; font-size: 20px; line-height: 1; }
.agent-metric span { color: #64748b; font-size: 12px; }
.agent-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.agent-action-card { padding: 13px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
.action-topline { display: flex; justify-content: space-between; gap: 8px; align-items: center; margin-bottom: 8px; color: #64748b; font-size: 12px; }
.action-topline em { padding: 2px 7px; border-radius: 3px; font-style: normal; font-weight: 700; }
.policy-accepted { background: #dcfce7; color: #15803d; }
.policy-pending { background: #ffedd5; color: #c2410c; }
.policy-guarded { background: #fee2e2; color: #b91c1c; }
.policy-logged { background: #e0f2fe; color: #0369a1; }
.agent-action-card h4,
.policy-block h4 { margin: 0 0 8px; color: #0f172a; font-size: 14px; }
.agent-action-card p { min-height: 48px; margin: 0 0 12px; color: #475569; font-size: 12px; line-height: 1.55; }
.assistant-action-governance { display: grid; grid-template-columns: 1fr; }
.assistant-action-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.assistant-action-card { padding: 11px; border: 1px solid #dbeafe; border-radius: 6px; background: #f8fbff; }
.assistant-action-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.assistant-action-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.assistant-package-governance { display: grid; grid-template-columns: 1fr; }
.assistant-package-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.assistant-package-card { padding: 11px; border: 1px solid #c7d2fe; border-radius: 6px; background: #f8faff; }
.assistant-package-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.assistant-package-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.assistant-package-closure { display: grid; gap: 4px; margin-top: 8px; padding: 8px; border: 1px solid #bfdbfe; border-radius: 5px; background: #eff6ff; }
.assistant-package-closure.quality { border-color: #bbf7d0; background: #f0fdf4; }
.assistant-package-closure span { color: #1d4ed8; font-size: 12px; font-weight: 700; }
.assistant-package-closure strong { margin: 0; color: #0f172a; font-size: 12px; line-height: 1.45; }
.assistant-package-closure code { overflow-wrap: anywhere; color: #1d4ed8; font-size: 11px; }
.assistant-package-steps { display: grid; gap: 6px; margin-top: 8px; }
.assistant-package-steps span { color: #64748b; font-size: 12px; font-weight: 700; }
.assistant-package-steps ul { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.assistant-package-steps li { display: grid; grid-template-columns: auto auto minmax(0, 1fr); gap: 6px; align-items: center; min-width: 0; padding: 7px 8px; border-radius: 5px; background: #fff; }
.assistant-package-steps b { color: #111827; font-size: 12px; }
.assistant-package-steps em { color: #64748b; font-style: normal; font-size: 11px; }
.assistant-package-steps code { overflow-wrap: anywhere; color: #1d4ed8; font-size: 11px; text-align: right; }
.assistant-package-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.outsourcing-governance { display: grid; grid-template-columns: 1fr; }
.outsourcing-governance-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.outsourcing-governance-card { padding: 11px; border: 1px solid #c7d2fe; border-radius: 6px; background: #f8faff; }
.outsourcing-governance-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.outsourcing-governance-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.outsourcing-governance-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.risk-sla-governance { display: grid; grid-template-columns: 1fr; }
.risk-sla-governance-card { padding: 11px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.risk-sla-governance-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.risk-sla-governance-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.kitting-governance { display: grid; grid-template-columns: 1fr; }
.kitting-governance-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.kitting-governance-card { padding: 11px; border: 1px solid #bfdbfe; border-radius: 6px; background: #f8fbff; }
.kitting-governance-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.kitting-governance-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.kitting-governance-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.quality-mrb-governance { display: grid; grid-template-columns: 1fr; }
.quality-mrb-governance-card { padding: 11px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-mrb-governance-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-mrb-governance-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.poc-evidence-lane { display: grid; grid-template-columns: 1fr; }
.poc-evidence-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.poc-evidence-card { padding: 11px; border: 1px solid #bbf7d0; border-radius: 6px; background: #f0fdf4; }
.poc-evidence-card.signoff { border-color: #bfdbfe; background: #eff6ff; }
.poc-evidence-card.rollout { border-color: #fed7aa; background: #fffaf5; }
.poc-evidence-card.pilot { border-color: #99f6e4; background: #f0fdfa; }
.poc-evidence-card.hypercare { border-color: #a7f3d0; background: #ecfdf5; }
.poc-evidence-card strong,
.poc-evidence-empty strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.poc-evidence-card p,
.poc-evidence-empty span { display: block; margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.poc-evidence-empty { padding: 11px; border: 1px dashed #bfdbfe; border-radius: 6px; background: #fff; }
.knowledge-governance-lane { display: grid; grid-template-columns: 1fr; }
.knowledge-pending-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 10px; }
.knowledge-pending-card { padding: 11px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.knowledge-pending-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.knowledge-pending-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.knowledge-action-note { display: grid; gap: 4px; margin-top: 8px; padding: 8px; border: 1px solid #fed7aa; border-radius: 5px; background: #fff; }
.knowledge-action-note span { color: #c2410c; font-size: 12px; font-weight: 700; }
.knowledge-action-note strong { margin: 0; color: #475569; font-size: 12px; line-height: 1.45; }
.knowledge-open-button { width: fit-content; margin-bottom: 10px; }
.knowledge-review-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.knowledge-review-card { padding: 11px; border: 1px solid #a7f3d0; border-radius: 6px; background: #f0fdfa; }
.knowledge-review-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.knowledge-review-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.otd-governance-heading { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
.otd-governance-heading h4 { margin-bottom: 4px; }
.otd-governance-heading p { margin: 0; color: #64748b; font-size: 12px; line-height: 1.45; }
.otd-governance-heading > strong { flex: 0 0 auto; color: #1d4ed8; font-size: 22px; line-height: 1; }
.otd-evidence-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.otd-evidence-card { padding: 11px; border: 1px solid #dbeafe; border-radius: 6px; background: #f8fbff; }
.otd-evidence-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.otd-evidence-card p { min-height: 44px; margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.quality-policy-governance { display: grid; grid-template-columns: 1fr; }
.quality-policy-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.quality-policy-card { padding: 11px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-policy-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-policy-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.quality-retraining-governance { display: grid; grid-template-columns: 1fr; }
.quality-retraining-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.quality-retraining-card { padding: 11px; border: 1px solid #bfdbfe; border-radius: 6px; background: #eff6ff; }
.quality-retraining-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-retraining-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.quality-feedback-governance { display: grid; grid-template-columns: 1fr; }
.quality-feedback-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.quality-feedback-card { padding: 11px; border: 1px solid #a7f3d0; border-radius: 6px; background: #f0fdf4; }
.quality-feedback-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-feedback-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.quality-experiment-governance { display: grid; grid-template-columns: 1fr; }
.quality-experiment-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.quality-experiment-card { padding: 11px; border: 1px solid #c7d2fe; border-radius: 6px; background: #eef2ff; }
.quality-experiment-card.policy-accepted { border-color: #a7f3d0; background: #f0fdf4; }
.quality-experiment-card.policy-guarded { border-color: #fecaca; background: #fef2f2; }
.quality-experiment-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-experiment-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.quality-experiment-candidate-governance { display: grid; grid-template-columns: 1fr; }
.quality-experiment-candidate-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.quality-experiment-candidate-card { padding: 11px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-experiment-candidate-card.policy-accepted { border-color: #a7f3d0; background: #f0fdf4; }
.quality-experiment-candidate-card.policy-guarded { border-color: #fecaca; background: #fef2f2; }
.quality-experiment-candidate-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-experiment-candidate-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.experiment-metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-bottom: 8px; }
.experiment-metric-grid div { min-width: 0; padding: 7px; border: 1px solid #c7d2fe; border-radius: 5px; background: #fff; }
.experiment-metric-grid span { display: block; color: #64748b; font-size: 11px; }
.experiment-metric-grid strong { margin: 2px 0 0; overflow-wrap: anywhere; font-size: 12px; }
.quality-gray-monitor-governance { display: grid; grid-template-columns: 1fr; }
.quality-gray-monitor-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.quality-gray-monitor-card { padding: 11px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-gray-monitor-card strong { display: block; margin-bottom: 6px; color: #0f172a; font-size: 13px; }
.quality-gray-monitor-card p { margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.45; }
.gray-metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-bottom: 8px; }
.gray-metric { min-width: 0; padding: 7px; border: 1px solid #fed7aa; border-radius: 5px; background: #fff; }
.gray-metric span { display: block; color: #64748b; font-size: 11px; }
.gray-metric strong { margin: 2px 0 0; overflow-wrap: anywhere; font-size: 12px; }
.gray-decision-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.gray-decision-result { display: grid; gap: 4px; margin-top: 8px; padding: 8px; border-radius: 5px; background: #fff; font-size: 12px; }
.gray-decision-result span { font-weight: 700; }
.gray-decision-result em { color: #64748b; font-style: normal; font-weight: 700; }
.gray-decision-result strong,
.gray-decision-result code { overflow-wrap: anywhere; color: #1d4ed8; font-family: monospace; font-size: 12px; }
.gray-decision-result .btn-sm { width: max-content; margin-top: 4px; }
.gray-review-issue { display: grid; gap: 3px; padding: 6px; border: 1px solid #fed7aa; border-radius: 5px; background: #fff7ed; }
.gray-review-issue span { color: #c2410c; font-size: 12px; }
.gray-review-issue small { overflow-wrap: anywhere; color: #64748b; font-size: 11px; }
.policy-lane { display: grid; grid-template-columns: minmax(260px, 0.8fr) minmax(360px, 1.2fr); gap: 12px; }
.policy-block { padding: 13px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
.policy-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 8px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 12px; }
.policy-row:first-of-type { border-top: 0; }
.policy-row strong { color: #0f172a; font-size: 12px; }
.policy-row code { min-width: 0; overflow-wrap: anywhere; color: #1d4ed8; font-family: monospace; font-size: 12px; text-align: right; }
.approval-row { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 10px 0; border-top: 1px solid #f1f5f9; }
.approval-row:first-of-type { border-top: 0; }
.approval-row strong { display: block; margin-bottom: 4px; color: #0f172a; font-size: 13px; }
.approval-row p { margin: 0; color: #64748b; font-size: 12px; }
.approval-row em { flex: 0 0 auto; padding: 3px 8px; border-radius: 3px; background: #fff7ed; color: #c2410c; font-size: 12px; font-style: normal; font-weight: 700; }
.approval-actions { display: flex; flex: 0 0 auto; flex-wrap: wrap; justify-content: flex-end; gap: 6px; min-width: 150px; }
.approval-actions .approval-approved { background: #dcfce7; color: #15803d; }
.approval-actions .approval-rejected { background: #fee2e2; color: #b91c1c; }
.approval-actions .btn-sm { margin-right: 0; }
.btn-sm.approve { border-color: #bbf7d0; color: #15803d; }
.btn-sm.reject { border-color: #fecaca; color: #b91c1c; }

/* LLM 设置 */
.llm-section { margin-bottom: 24px; }
.llm-section h4 { font-size: 14px; margin: 0 0 12px; color: #333; }
.llm-loading { color: #999; font-size: 13px; font-style: italic; }
.llm-status { display: flex; flex-direction: column; gap: 8px; }
.status-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.status-label { color: #666; min-width: 80px; flex-shrink: 0; }
.status-value { color: #333; font-weight: 500; }
.status-error { color: #ff4d4f; font-size: 12px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-green { background: #52c41a; }
.dot-red { background: #ff4d4f; }
.code { font-family: monospace; background: #f5f5f5; padding: 1px 6px; border-radius: 3px; font-size: 12px; }
.llm-config { background: #fafafa; border-radius: 6px; padding: 12px 16px; }
.config-detail { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #333; }
.config-detail code { font-family: monospace; background: #f0f0f0; padding: 1px 6px; border-radius: 3px; }
.section-desc { font-size: 13px; color: #999; margin-bottom: 12px; }
.section-desc code { font-family: monospace; background: #f0f0f0; padding: 1px 4px; border-radius: 2px; font-size: 12px; }
.provider-cards { display: flex; gap: 12px; flex-wrap: wrap; }
.provider-card { border: 1px solid #d9d9d9; border-radius: 8px; padding: 16px; flex: 1; min-width: 160px; position: relative; background: #fafafa; }
.provider-card.active { border-color: #1890ff; background: #e6f7ff; }
.provider-name { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px; }
.provider-desc { font-size: 12px; color: #999; }
.provider-badge { position: absolute; top: 8px; right: 8px; font-size: 10px; padding: 1px 6px; border-radius: 3px; background: #1890ff; color: #fff; }
.pagination-bar { display: flex; align-items: center; gap: 4px; padding: 10px 0; flex-wrap: wrap; }
.page-btn { min-width: 28px; height: 28px; padding: 0 8px; border: 1px solid #d9d9d9; background: #fff; border-radius: 4px; font-size: 12px; cursor: pointer; }
.page-btn.active { background: #1890ff; color: #fff; border-color: #1890ff; }
.page-btn:disabled { color: #d9d9d9; cursor: not-allowed; }
.page-ellipsis { width: 28px; text-align: center; color: #999; font-size: 12px; }
.page-info { margin-left: auto; font-size: 12px; color: #999; }

@media (max-width: 900px) {
  .agent-heading,
  .policy-lane { grid-template-columns: 1fr; display: grid; }
  .agent-metrics,
  .agent-grid,
  .assistant-action-list,
  .assistant-package-list,
  .outsourcing-governance-list,
  .kitting-governance-list,
  .knowledge-pending-list,
  .knowledge-review-list,
  .quality-policy-list,
  .quality-retraining-list,
  .quality-feedback-list,
  .quality-experiment-list,
  .quality-experiment-candidate-list,
  .experiment-metric-grid,
  .quality-gray-monitor-list,
  .gray-metric-grid,
  .otd-evidence-list { grid-template-columns: 1fr; }
}
</style>
