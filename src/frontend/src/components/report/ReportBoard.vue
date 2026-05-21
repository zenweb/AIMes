<template>
  <div class="report-board">
    <div class="page-header">
      <h2 class="page-title">报表中心</h2>
      <div class="header-actions">
        <button class="btn-export" @click="handleExportCsv">CSV</button>
        <button class="btn-export" @click="handleExportExcel">Excel</button>
        <button class="btn-export" @click="handleExportPdf">PDF</button>
      </div>
    </div>

    <!-- OTD 改善复盘 -->
    <section class="section otd-report-section">
      <div class="section-title-row">
        <div>
          <span class="eyebrow">可销售演示</span>
          <h3>OTD 改善复盘报告</h3>
        </div>
        <span class="dataset-badge">{{ otdReport.demoDatasetSize }} 单演示数据集</span>
      </div>

      <div class="otd-hero">
        <div>
          <span class="hero-label">交期达成率提升</span>
          <strong>+{{ pctPoint(otdReport.otdLift) }}</strong>
          <p>{{ otdReport.headline }}</p>
        </div>
        <div class="otd-comparison">
          <div class="otd-card baseline">
            <span>人工基线</span>
            <strong>{{ fmtPct(otdReport.baselineOtd) }}</strong>
            <em>{{ otdReport.baselineDelayedOrders }} 单延期</em>
          </div>
          <div class="otd-card agent">
            <span>Agent 推荐</span>
            <strong>{{ fmtPct(otdReport.agentOtd) }}</strong>
            <em>{{ otdReport.agentDelayedOrders }} 单延期</em>
          </div>
        </div>
      </div>

      <div class="otd-metrics">
        <div class="metric-tile">
          <label>延期减少</label>
          <strong>{{ otdReport.delayedOrdersReduced }} 单</strong>
        </div>
        <div class="metric-tile">
          <label>换线减少</label>
          <strong>{{ otdReport.changeoverMinutesReduced }} 分钟</strong>
        </div>
        <div class="metric-tile">
          <label>急单保护</label>
          <strong>{{ otdReport.protectedRushOrders }} 单</strong>
        </div>
        <div class="metric-tile">
          <label>决策留痕</label>
          <strong>{{ otdReport.decisionTraceCount }} 条</strong>
        </div>
      </div>

      <div v-if="qualityReworkImpact" class="quality-rework-report">
        <div>
          <span class="eyebrow danger">质量返工影响</span>
          <h4>{{ qualityReworkImpact.workOrderId }} 返工对 OTD 的影响</h4>
          <p>{{ qualityReworkImpact.recommendedAction }}</p>
        </div>
        <div class="rework-report-metrics">
          <span>{{ qualityReworkImpact.processName }}</span>
          <strong>{{ qualityReworkImpact.reworkHours }}h 返工窗口</strong>
          <em>{{ qualityReworkImpact.otdImpact }}</em>
        </div>
      </div>

      <div v-if="qualityCapaClosure" class="quality-capa-report">
        <div>
          <span class="eyebrow success">CAPA 验证回写</span>
          <h4>{{ qualityCapaClosure.workOrderId }} 质量 CAPA 已进入 OTD 复盘</h4>
          <p>{{ qualityCapaClosure.reviewAction }}</p>
        </div>
        <div class="capa-report-metrics">
          <span>{{ qualityCapaClosure.rootCause }}</span>
          <strong>{{ Math.round(qualityCapaClosure.evidenceStrength * 100) }}% 证据强度</strong>
          <em>{{ qualityCapaClosure.otdImpact }}</em>
        </div>
      </div>

      <div v-if="qualityMrbDisposition" class="quality-mrb-report">
        <div>
          <span class="eyebrow warning">质量 MRB 处置</span>
          <h4>{{ qualityMrbDisposition.workOrderId }} MRB 报废补料进入 OTD 复盘</h4>
          <p>{{ qualityMrbDisposition.scheduleImpact }}</p>
        </div>
        <div class="mrb-report-metrics">
          <span>{{ qualityMrbDisposition.dispositionLabel }} / {{ qualityMrbDisposition.statusLabel }}</span>
          <strong>{{ qualityMrbDisposition.defectQuantity }} 件报废补料</strong>
          <em>{{ qualityMrbDisposition.otdImpact }}</em>
          <code>{{ qualityMrbDisposition.closureTraceId ?? qualityMrbDisposition.traceId }}</code>
        </div>
      </div>

      <div v-if="qualityRecommendationFeedbackRecords.length" class="quality-learning-report">
        <div class="sample-header">
          <div>
            <span class="eyebrow success">质量推荐学习闭环</span>
            <h4>已发布推荐采纳后进入下一轮训练集</h4>
          </div>
          <span>{{ qualityRecommendationFeedbackRecords.length }} 条反馈</span>
        </div>
        <article v-for="record in qualityRecommendationFeedbackRecords" :key="record.id" class="learning-row">
          <div>
            <strong>{{ record.targetWorkOrderId }} {{ record.operationCode }} · {{ record.trainingSetVersion }} -> {{ record.nextTrainingSetVersion }}</strong>
            <p>{{ record.decisionLabel }}，效果趋势 {{ record.effectTrendLabel }}；{{ record.reason }}</p>
          </div>
          <div class="learning-meta">
            <span>{{ record.auditId }}</span>
            <code>{{ record.nextTrainingTraceId }}</code>
          </div>
        </article>
      </div>

      <div v-if="qualityGrayReleaseMonitorRecords.length" class="quality-gray-monitor-report">
        <div class="sample-header">
          <div>
            <span class="eyebrow success">质量推荐灰度监控</span>
            <h4>质量推荐灰度发布后的采纳率、复验和误召回</h4>
          </div>
          <span>{{ qualityGrayReleaseMonitorRecords.length }} 个灰度版本</span>
        </div>
        <article v-for="record in qualityGrayReleaseMonitorRecords" :key="record.id" class="gray-monitor-row">
          <div>
            <strong>{{ record.title }} · {{ record.scopeLabel }} · {{ record.releaseCycleLabel }}</strong>
            <p>{{ record.summary }}</p>
            <code>{{ record.traceId }}</code>
          </div>
          <div class="gray-report-metrics">
            <span>灰度周期 {{ record.releaseCycleLabel }}</span>
            <span>推荐采纳率 {{ record.adoptionRateLabel }}</span>
            <span>复验通过率 {{ record.recheckPassRateLabel }}</span>
            <span>负样本误召回 {{ record.falseRecallLabel }}</span>
            <em>{{ record.auditId }}</em>
          </div>
        </article>
      </div>

      <div v-if="qualityGrayReleaseDecisionRecords.length" class="quality-gray-decision-report">
        <div class="sample-header">
          <div>
            <span class="eyebrow danger">质量灰度决策统计</span>
            <h4>扩大、回滚和待复核问题单</h4>
          </div>
          <span>{{ qualityGrayReleaseDecisionSummary.expanded }} 次扩大 / {{ qualityGrayReleaseDecisionSummary.rolledBack }} 次回滚</span>
        </div>
        <div class="gray-decision-summary">
          <div>
            <span>待主管确认</span>
            <strong>{{ qualityGrayReleaseDecisionSummary.pendingApproval }}</strong>
          </div>
          <div>
            <span>已确认扩大</span>
            <strong>{{ qualityGrayReleaseDecisionSummary.approvedExpansion }}</strong>
          </div>
          <div>
            <span>待复核问题单</span>
            <strong>{{ qualityGrayReleaseDecisionSummary.openReviewIssues }}</strong>
          </div>
          <div>
            <span>已关闭/重开校验</span>
            <strong>{{ qualityGrayReleaseDecisionSummary.closedReviewIssues }} / {{ qualityGrayReleaseDecisionSummary.reopenedPrevalidation }}</strong>
          </div>
        </div>
        <div class="gray-cycle-summary">
          <div v-for="cycle in qualityGrayReleaseDecisionCycleSummaries" :key="cycle.label">
            <span>{{ cycle.label }}</span>
            <strong>{{ cycle.expanded }} 扩大 / {{ cycle.rolledBack }} 回滚</strong>
            <em>{{ cycle.pendingApproval }} 待确认 / {{ cycle.openReviewIssues }} 待复核</em>
          </div>
        </div>
        <article v-for="record in qualityGrayReleaseDecisionRecords" :key="record.id" class="gray-decision-row" :class="record.decision">
          <div>
            <strong>{{ record.trainingSetVersion }} · {{ record.releaseCycleLabel }} · {{ record.decisionLabel }} · {{ record.approvalLabel }}</strong>
            <p>{{ record.reason }}</p>
            <p>发布审计：{{ record.releaseAuditId }} / {{ record.releaseTraceId }}</p>
            <code>{{ record.auditId }} / {{ record.traceId }}</code>
          </div>
          <div class="gray-report-metrics">
            <span v-for="metric in record.metricSnapshot" :key="metric.label">{{ metric.label }} {{ metric.value }}</span>
            <em v-if="record.reviewIssueId">{{ record.reviewIssueId }} / {{ record.reviewIssueTraceId }} / {{ record.reviewIssueLabel ?? '待复核' }}</em>
            <em v-if="record.reviewIssueValidationAuditId">{{ record.reviewIssueValidationAuditId }} / {{ record.reviewIssueValidationTraceId }}</em>
            <em v-if="!record.reviewIssueId">{{ record.expansionScope?.join(' / ') ?? '无扩大范围' }}</em>
          </div>
        </article>
      </div>

      <div v-if="qualityRecommendationExperimentComparisonRecords.length" class="quality-experiment-report">
        <div class="sample-header">
          <div>
            <span class="eyebrow success">质量推荐多版本实验对比</span>
            <h4>R3 / R4 / R5 / R7 灰度实验采纳、复验、误召回和决策对比</h4>
          </div>
          <span>{{ qualityRecommendationExperimentComparisonRecords.length }} 个实验版本</span>
        </div>
        <div class="experiment-grid">
          <article
            v-for="record in qualityRecommendationExperimentComparisonRecords"
            :key="record.id"
            class="experiment-card"
            :class="record.statusClass"
          >
            <div class="experiment-topline">
              <span>{{ record.trainingSetVersion }} · {{ record.releaseCycleLabel }}</span>
              <em>{{ record.statusLabel }}</em>
            </div>
            <strong>{{ record.title }}</strong>
            <p>{{ record.summary }}</p>
            <div class="experiment-metrics">
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
            <div class="experiment-meta">
              <span>效果趋势 {{ record.effectTrendLabel }}</span>
              <span>灰度范围 {{ record.releaseScopeLabel }}</span>
              <span>扩大门禁 {{ record.gatePassLabel }} / {{ record.gatePolicyLabel }}</span>
              <code>{{ record.releaseAuditId }} / {{ record.releaseTraceId }}</code>
              <code>{{ record.gateAuditLabel }}</code>
              <code>{{ record.feedbackAuditLabel }} / {{ record.feedbackTraceLabel }}</code>
              <em :class="'policy-' + record.decisionStatusClass">{{ record.decisionLabel }}</em>
              <code v-if="record.decisionAuditId">{{ record.decisionAuditId }} / {{ record.decisionTraceId }}</code>
            </div>
          </article>
        </div>
      </div>

      <div v-if="qualityExperimentCandidateRecords.length" class="quality-experiment-candidate-report">
        <div class="sample-header">
          <div>
            <span class="eyebrow success">质量推荐实验候选治理</span>
            <h4>R5 回滚后的 R6 / R7 负样本覆盖和影子验证</h4>
          </div>
          <span>{{ qualityExperimentCandidateRecords.length }} 个候选</span>
        </div>
        <div class="candidate-grid">
          <article
            v-for="record in qualityExperimentCandidateRecords"
            :key="record.id"
            class="candidate-card"
            :class="record.statusClass"
          >
            <div class="experiment-topline">
              <span>{{ record.candidateTrainingSetVersion }} · {{ record.triggerLabel }}</span>
              <em>{{ record.statusLabel }}</em>
            </div>
            <strong>{{ record.title }}</strong>
            <p>{{ record.summary }}</p>
            <div class="candidate-metrics">
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
                <span>缺口</span>
                <strong>{{ record.gapLabel }}</strong>
              </div>
            </div>
            <div class="experiment-meta">
              <span>门禁 {{ record.gatePolicyLabel }}</span>
              <span>{{ record.nextAction }}</span>
              <code>{{ record.sourceAuditId }} / {{ record.sourceTraceId }}</code>
              <code>{{ record.auditId }} / {{ record.traceId }}</code>
            </div>
          </article>
        </div>
      </div>

      <div class="otd-split">
        <div class="reason-panel">
          <h4>为什么改善</h4>
          <div v-for="reason in otdReport.reasons" :key="reason.label" class="reason-row">
            <strong>{{ reason.label }}</strong>
            <span>{{ reason.contribution }}</span>
          </div>
        </div>
        <div class="demo-path-panel">
          <h4>5 分钟 Demo 路径</h4>
          <ol>
            <li v-for="step in otdReport.demoPath" :key="step">{{ step }}</li>
          </ol>
        </div>
      </div>

      <div class="otd-kpi-drilldown-panel" aria-label="OTD KPI 多维钻取">
        <div class="sample-header">
          <div>
            <h4>OTD KPI 多维钻取</h4>
            <span>按客户、产线、产品族和时间窗口解释 OTD 差异</span>
          </div>
          <span>{{ otdKpiDrilldownSummary.recovered }} 个已恢复 / {{ otdKpiDrilldownSummary.atRisk }} 个仍有风险 / 平均提升 {{ otdKpiDrilldownSummary.averageLift }}%</span>
        </div>
        <div class="kpi-drilldown-layout">
          <div class="kpi-dimension-tabs" role="tablist" aria-label="OTD KPI 钻取维度">
            <button
              v-for="option in otdKpiDimensionOptions"
              :key="option.value"
              type="button"
              :class="{ active: activeOtdKpiDimension === option.value }"
              role="tab"
              @click="activeOtdKpiDimension = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <div class="kpi-drilldown-grid">
            <button
              v-for="item in filteredOtdKpiDrilldownItems"
              :key="item.id"
              type="button"
              class="kpi-drilldown-card"
              :class="[item.status, { selected: selectedOtdKpiDrilldown?.id === item.id }]"
              @click="activeOtdKpiDrilldownId = item.id"
            >
              <span>{{ item.dimensionLabel }}</span>
              <strong>{{ item.name }}</strong>
              <div class="kpi-card-metrics">
                <em>基线 {{ item.baselineOtd }}%</em>
                <em>Agent {{ item.agentOtd }}%</em>
                <em>提升 +{{ item.lift }}%</em>
              </div>
              <p>{{ item.driver }}</p>
            </button>
          </div>
          <article v-if="selectedOtdKpiDrilldown" class="kpi-drilldown-detail">
            <div class="detail-topline">
              <span>{{ selectedOtdKpiDrilldown.dimensionLabel }} · {{ selectedOtdKpiDrilldown.statusLabel }}</span>
              <code>{{ selectedOtdKpiDrilldown.traceId }}</code>
            </div>
            <h5>{{ selectedOtdKpiDrilldown.name }} OTD 差异解释</h5>
            <div class="kpi-detail-metrics">
              <div>
                <span>人工基线</span>
                <strong>{{ selectedOtdKpiDrilldown.baselineOtd }}%</strong>
              </div>
              <div>
                <span>Agent 推荐</span>
                <strong>{{ selectedOtdKpiDrilldown.agentOtd }}%</strong>
              </div>
              <div>
                <span>延期减少</span>
                <strong>{{ selectedOtdKpiDrilldown.delayedReduced }} 单</strong>
              </div>
            </div>
            <p>{{ selectedOtdKpiDrilldown.explanation }}</p>
            <div class="kpi-root-cause">
              <span>主因</span>
              <strong>{{ selectedOtdKpiDrilldown.driver }}</strong>
            </div>
            <div class="kpi-next-actions">
              <span>下一步动作</span>
              <ul>
                <li v-for="action in selectedOtdKpiDrilldown.nextActions" :key="action">{{ action }}</li>
              </ul>
            </div>
            <button type="button" class="kpi-commitment-btn" @click="handleGenerateOtdKpiCommitment">
              生成客户交付恢复承诺包
            </button>
            <div v-if="activeOtdKpiCommitment" class="kpi-commitment-card">
              <span>{{ activeOtdKpiCommitment.statusLabel }}</span>
              <strong>{{ activeOtdKpiCommitment.title }}</strong>
              <p>{{ activeOtdKpiCommitment.commitment }}</p>
              <code>{{ activeOtdKpiCommitment.auditId }} / {{ activeOtdKpiCommitment.traceId }}</code>
            </div>
          </article>
        </div>
      </div>

      <div class="otd-drilldown-panel" aria-label="经营复盘钻取">
        <div class="sample-header">
          <h4>经营复盘钻取</h4>
          <span>{{ otdDrilldownSummary.closed }} 条已闭环 / {{ otdDrilldownSummary.active }} 条处理中 / {{ otdDrilldownSummary.routes }} 个业务模块</span>
        </div>
        <div class="drilldown-layout">
          <div class="drilldown-list" role="list" aria-label="OTD 证据钻取列表">
            <button
              v-for="item in otdDrilldownItems"
              :key="item.id"
              type="button"
              class="drilldown-row"
              :class="{ selected: item.id === activeOtdDrilldownId }"
              @click="selectOtdEvidence(item.id)"
            >
              <span>{{ item.stage }}</span>
              <strong>{{ item.businessQuestion }}</strong>
              <em>{{ item.owner }} · {{ item.routeLabel }}</em>
            </button>
          </div>

          <article v-if="selectedOtdDrilldown" class="drilldown-detail">
            <div class="detail-topline">
              <span>{{ selectedOtdDrilldown.stage }} · {{ selectedOtdDrilldown.statusLabel }}</span>
              <code>{{ selectedOtdDrilldown.traceId }}</code>
            </div>
            <h5>{{ selectedOtdDrilldown.title }}</h5>
            <p>{{ selectedOtdDrilldown.explanation }}</p>
            <div class="drilldown-detail-grid">
              <div>
                <span>业务影响</span>
                <strong>{{ selectedOtdDrilldown.effectLabel }}</strong>
              </div>
              <div>
                <span>责任口径</span>
                <strong>{{ selectedOtdDrilldown.owner }}</strong>
              </div>
              <div>
                <span>风险状态</span>
                <strong>{{ selectedOtdDrilldown.riskLabel }}</strong>
              </div>
            </div>
            <div class="drilldown-next-step">
              <span>下一步动作</span>
              <strong>{{ selectedOtdDrilldown.nextAction }}</strong>
              <RouterLink :to="selectedOtdDrilldown.route">打开{{ selectedOtdDrilldown.routeLabel }}</RouterLink>
            </div>
          </article>
        </div>
      </div>

      <div class="otd-evidence-chain">
        <div class="sample-header">
          <h4>OTD 复盘证据链</h4>
          <span>从风险触发、Agent 决策、现场处置到复盘归档逐项核对</span>
        </div>
        <div class="evidence-chain-grid">
          <article
            v-for="item in otdEvidenceChain"
            :key="item.id"
            class="evidence-chain-card"
            :class="[item.status, { selected: item.id === activeOtdDrilldownId }]"
            role="button"
            tabindex="0"
            @click="selectOtdEvidence(item.id)"
            @keydown.enter="selectOtdEvidence(item.id)"
          >
            <div class="evidence-topline">
              <span>{{ item.stage }}</span>
              <em>{{ item.statusLabel }}</em>
            </div>
            <h5>{{ item.title }}</h5>
            <p>{{ item.summary }}</p>
            <div class="evidence-meta">
              <span>对象：{{ item.object }}</span>
              <span>来源：{{ item.source }}</span>
              <code>{{ item.traceId }}</code>
            </div>
          </article>
        </div>
      </div>

      <div class="sample-orders">
        <div class="sample-header">
          <h4>30 单样本节选</h4>
          <span>展示风险、动作和 Agent 恢复结果</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>工单</th>
              <th>产品</th>
              <th>交期</th>
              <th>基线</th>
              <th>Agent</th>
              <th>风险</th>
              <th>动作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in otdReport.sampleOrders" :key="order.orderNumber">
              <td>{{ order.orderNumber }}</td>
              <td>{{ order.productName }}</td>
              <td>{{ order.dueDate }}</td>
              <td><span class="status-pill" :class="order.baselineStatus">{{ statusText(order.baselineStatus) }}</span></td>
              <td><span class="status-pill" :class="order.agentStatus">{{ statusText(order.agentStatus) }}</span></td>
              <td>{{ order.risk }}</td>
              <td>{{ order.action }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- POC 评估模板 -->
    <section class="section poc-template-section">
      <div class="section-title-row">
        <div>
          <span class="eyebrow">POC 评估模板</span>
          <h3>{{ pocTemplate.title }}</h3>
        </div>
        <span class="dataset-badge">{{ pocTemplate.duration }} · 通过线 {{ pocTemplate.passScore }} 分</span>
      </div>

      <div class="poc-summary">
        <div>
          <label>目标客户</label>
          <strong>{{ pocTemplate.targetCustomer }}</strong>
        </div>
        <div>
          <label>评估口径</label>
          <strong>业务结果 + 现场闭环 + 可审计证据</strong>
        </div>
      </div>

      <div class="poc-scorecard">
        <div class="poc-score-main" :class="{ pass: pocEvaluationResult.passed }">
          <span>当前 POC 评分</span>
          <strong>{{ pocEvaluationResult.totalScore }} / 100</strong>
          <em>{{ pocEvaluationResult.passed ? '达到通过线' : '未达到通过线' }} · 通过线 {{ pocTemplate.passScore }} 分</em>
        </div>
        <div class="poc-score-bars">
          <div v-for="dimension in scoredPocDimensions" :key="dimension.name" class="score-row">
            <div>
              <strong>{{ dimension.name }}</strong>
              <span>{{ dimension.actualScore }} / {{ dimension.weight }} 分</span>
            </div>
            <div class="score-track">
              <i :style="{ width: dimension.ratio + '%' }"></i>
            </div>
          </div>
        </div>
        <div class="poc-gap-panel">
          <h4>补齐缺口</h4>
          <div v-for="gap in pocEvaluationResult.gaps" :key="gap.name" class="gap-row">
            <strong>{{ gap.name }}</strong>
            <span>{{ gap.gap }}</span>
            <RouterLink v-if="gap.name.includes('事件闭环') || gap.name.includes('客户真实设备故障数据')" to="/equipment">准备设备故障样例</RouterLink>
            <RouterLink v-if="gap.name.includes('客户真实工单导入样例')" to="/knowledge/documents">准备导入样例</RouterLink>
          </div>
          <div v-if="!pocEvaluationResult.gaps.length" class="gap-row ready">
            <strong>全部关键证据已准备</strong>
            <span>可以进入客户 POC 复盘会。</span>
          </div>
        </div>
      </div>

      <div v-if="customerPocEvidenceReady" class="poc-package-banner">
        <div>
          <span class="eyebrow success">客户 POC 证据包齐套</span>
          <h4>工单导入 + 设备故障样例已联动完成</h4>
          <p>报表中心现在可以直接作为 POC 复盘入口，验证执行回写与事件闭环两条客户证据链。</p>
        </div>
        <div class="poc-package-meta">
          <strong>{{ customerOrderImport?.batchId }}</strong>
          <span>{{ customerEquipmentFault?.batchId }}</span>
        </div>
      </div>

      <div v-if="customerPocEvidenceReady" class="poc-review-panel" :class="{ signed: pocReviewSignoff }">
        <div>
          <span class="eyebrow success">POC 复盘会评分表</span>
          <h4>{{ pocReviewSignoff ? 'POC 复盘已签署' : '生成客户 POC 复盘签署记录' }}</h4>
          <p>{{ pocReviewSignoff ? pocReviewSignoff.summary : '证据包齐套后生成复盘会评分表，把评分、批次、签署人和审计编号固化为验收结论。' }}</p>
        </div>
        <div class="poc-review-meta">
          <strong>{{ pocReviewSignoff ? pocReviewSignoff.meetingId : `${pocEvaluationResult.totalScore} / 100` }}</strong>
          <span>{{ pocReviewSignoff ? pocReviewSignoff.auditId : `通过线 ${pocTemplate.passScore} 分` }}</span>
          <button v-if="!pocReviewSignoff" type="button" class="review-signoff-btn" @click="handlePocReviewSignoff">生成 POC 复盘签署记录</button>
          <em v-else>{{ pocReviewSignoff.signedBy }} · {{ pocReviewSignoff.reviewers.join(' / ') }}</em>
        </div>
      </div>

      <div v-if="pocReviewSignoff" class="poc-rollout-panel" :class="{ ready: pocRolloutPackage }">
        <div>
          <span class="eyebrow success">POC 转上线</span>
          <h4>{{ pocRolloutPackage ? pocRolloutPackage.title : '生成 POC 成功转上线交付行动包' }}</h4>
          <p>{{ pocRolloutPackage ? pocRolloutPackage.summary : 'POC 签署后继续固化上线启动会、接口映射、首批真实工单运行和治理审计动作，避免验收停在演示结论。' }}</p>
        </div>
        <div class="poc-rollout-meta">
          <strong>{{ pocRolloutPackage ? pocRolloutPackage.rolloutWindow : 'T+7 / T+14' }}</strong>
          <span>{{ pocRolloutPackage ? pocRolloutPackage.auditId : pocReviewSignoff.auditId }}</span>
          <button v-if="!pocRolloutPackage" type="button" class="review-signoff-btn" @click="handleGeneratePocRolloutPackage">生成上线交付行动包</button>
          <em v-else>{{ pocRolloutPackage.statusLabel }} · {{ pocRolloutPackage.owner }}</em>
        </div>
      </div>

      <div v-if="pocRolloutPackage" class="poc-rollout-package">
        <div class="sample-header">
          <div>
            <h4>客户上线交付动作</h4>
            <span>{{ pocRolloutPackage.goLiveGate }}</span>
          </div>
          <code>{{ pocRolloutPackage.traceId }}</code>
        </div>
        <div class="rollout-action-grid">
          <article v-for="action in pocRolloutPackage.actions" :key="action.evidence" class="rollout-action-card">
            <div class="action-topline">
              <span>{{ action.module }}</span>
              <em>{{ action.dueAt }}</em>
            </div>
            <strong>{{ action.owner }}</strong>
            <p>{{ action.action }}</p>
            <code>{{ action.evidence }}</code>
          </article>
        </div>
        <div class="rollout-criteria">
          <span v-for="criteria in pocRolloutPackage.successCriteria" :key="criteria">{{ criteria }}</span>
        </div>
      </div>

      <div v-if="pocRolloutPackage" class="poc-pilot-panel" :class="{ closed: pocPilotRun }">
        <div>
          <span class="eyebrow success">真实工单试点</span>
          <h4>{{ pocPilotRun ? pocPilotRun.title : '确认首批真实工单试点运行' }}</h4>
          <p>{{ pocPilotRun ? pocPilotRun.summary : '把上线交付包中的“现场运行”动作继续推进为 30 单真实工单试点，核对排产采纳、生产执行、异常回写和审计复盘。' }}</p>
        </div>
        <div class="poc-pilot-meta">
          <strong>{{ pocPilotRun ? `${pocPilotRun.actualOtd} / ${pocPilotRun.sampleSize} 单` : '30 单 / OTD >= 96%' }}</strong>
          <span>{{ pocPilotRun ? pocPilotRun.auditId : pocRolloutPackage.auditId }}</span>
          <button v-if="!pocPilotRun" type="button" class="review-signoff-btn" @click="handleConfirmPocPilotRun">确认试点运行闭环</button>
          <em v-else>{{ pocPilotRun.statusLabel }} · {{ pocPilotRun.owner }}</em>
        </div>
      </div>

      <div v-if="pocPilotRun" class="poc-pilot-run-package">
        <div class="sample-header">
          <div>
            <h4>首批真实工单运行结果</h4>
            <span>{{ pocPilotRun.batchId }} · {{ pocPilotRun.runWindow }} · OTD 目标 {{ pocPilotRun.otdTarget }}</span>
          </div>
          <code>{{ pocPilotRun.traceId }}</code>
        </div>
        <div class="pilot-workorder-grid">
          <article v-for="order in pocPilotRun.workOrders" :key="order.workOrderNumber" class="pilot-workorder-card">
            <div class="action-topline">
              <span>{{ order.workOrderNumber }}</span>
              <em>{{ order.quantity }} 件</em>
            </div>
            <strong>{{ order.productName }}</strong>
            <p>{{ order.route }}</p>
            <span>{{ order.scheduleDecision }}</span>
            <code>{{ order.executionStatus }}</code>
          </article>
        </div>
        <div class="pilot-checkpoint-grid">
          <article v-for="checkpoint in pocPilotRun.checkpoints" :key="checkpoint.evidence" class="pilot-checkpoint-card">
            <div class="action-topline">
              <span>{{ checkpoint.module }}</span>
              <em>已闭环</em>
            </div>
            <strong>{{ checkpoint.owner }}</strong>
            <p>{{ checkpoint.summary }}</p>
            <code>{{ checkpoint.evidence }}</code>
          </article>
        </div>
        <div class="rollout-criteria">
          <span v-for="criteria in pocPilotRun.acceptanceCriteria" :key="criteria">{{ criteria }}</span>
        </div>
      </div>

      <div v-if="pocPilotRun" class="poc-hypercare-panel" :class="{ active: pocHypercareAcceptance }">
        <div>
          <span class="eyebrow success">正式上线验收</span>
          <h4>{{ pocHypercareAcceptance ? pocHypercareAcceptance.title : '生成上线验收与 Hypercare 监控包' }}</h4>
          <p>{{ pocHypercareAcceptance ? pocHypercareAcceptance.summary : '首批真实工单闭环后继续进入正式上线验收，把 OTD、OEE、P1/P2 未关闭事件和 AI 建议采纳率纳入 7 天稳定运行监控。' }}</p>
        </div>
        <div class="poc-hypercare-meta">
          <strong>{{ pocHypercareAcceptance ? `${pocHypercareAcceptance.actualOtd} / OEE ${pocHypercareAcceptance.currentOee}` : '7 天 / P1/P2 = 0' }}</strong>
          <span>{{ pocHypercareAcceptance ? pocHypercareAcceptance.auditId : pocPilotRun.auditId }}</span>
          <button v-if="!pocHypercareAcceptance" type="button" class="review-signoff-btn" @click="handleGeneratePocHypercareAcceptance">生成上线验收与 Hypercare 监控包</button>
          <em v-else>{{ pocHypercareAcceptance.statusLabel }} · {{ pocHypercareAcceptance.owner }}</em>
        </div>
      </div>

      <div v-if="pocHypercareAcceptance" class="poc-hypercare-package">
        <div class="sample-header">
          <div>
            <h4>Hypercare 稳定运行监控</h4>
            <span>{{ pocHypercareAcceptance.goLiveWindow }} · {{ pocHypercareAcceptance.acceptanceGate }}</span>
          </div>
          <code>{{ pocHypercareAcceptance.traceId }}</code>
        </div>
        <div class="hypercare-monitor-grid">
          <article v-for="monitor in pocHypercareAcceptance.monitors" :key="monitor.evidence" class="hypercare-monitor-card" :class="monitor.status">
            <div class="action-topline">
              <span>{{ monitor.label }}</span>
              <em>{{ monitor.statusLabel }}</em>
            </div>
            <strong>{{ monitor.current }}</strong>
            <p>目标 {{ monitor.target }}</p>
            <code>{{ monitor.evidence }}</code>
          </article>
        </div>
        <div class="hypercare-checkpoint-grid">
          <article v-for="checkpoint in pocHypercareAcceptance.checkpoints" :key="checkpoint.evidence" class="hypercare-checkpoint-card">
            <div class="action-topline">
              <span>{{ checkpoint.module }}</span>
              <em>运行中</em>
            </div>
            <strong>{{ checkpoint.owner }}</strong>
            <p>{{ checkpoint.action }}</p>
            <code>{{ checkpoint.evidence }}</code>
          </article>
        </div>
      </div>

      <div class="poc-grid">
        <div class="poc-panel">
          <h4>评分维度</h4>
          <div v-for="dimension in pocTemplate.dimensions" :key="dimension.name" class="poc-dimension">
            <div>
              <strong>{{ dimension.name }}</strong>
              <span>{{ dimension.target }}</span>
            </div>
            <em>{{ dimension.actualScore ?? dimension.weight }} / {{ dimension.weight }} 分</em>
            <p>{{ dimension.evidence }}</p>
          </div>
        </div>

        <div class="poc-panel">
          <h4>验收证据</h4>
          <div v-for="item in pocTemplate.evidenceChecklist" :key="item.item" class="evidence-row">
            <span class="status-pill" :class="item.status">{{ item.status === 'ready' ? '已准备' : '待补充' }}</span>
            <strong>{{ item.item }}</strong>
            <em>{{ item.owner }}</em>
          </div>
        </div>
      </div>

      <div v-if="customerEquipmentFault" class="customer-import-evidence equipment">
        <div>
          <span class="eyebrow success">客户设备故障已接入</span>
          <h4>{{ customerEquipmentFault.fileName }}</h4>
          <p>{{ customerEquipmentFault.source }} 已完成 {{ customerEquipmentFault.faultSamples }} 条故障样例映射，{{ customerEquipmentFault.affectedOrders }} 进入设备故障排产验证。</p>
        </div>
        <div class="import-evidence-meta">
          <span>{{ customerEquipmentFault.batchId }}</span>
          <strong>事件闭环 +1 分</strong>
          <em>{{ customerEquipmentFault.capturedSignals.join(' / ') }}</em>
        </div>
      </div>

      <div v-if="customerOrderImport" class="customer-import-evidence">
        <div>
          <span class="eyebrow success">客户样例已接入</span>
          <h4>{{ customerOrderImport.fileName }}</h4>
          <p>{{ customerOrderImport.source }} 已完成 {{ customerOrderImport.importedOrders }} 单字段映射，{{ customerOrderImport.highRiskOrders }} 单进入风险与排产验证。</p>
        </div>
        <div class="import-evidence-meta">
          <span>{{ customerOrderImport.batchId }}</span>
          <strong>执行回写 +2 分</strong>
          <em>{{ customerOrderImport.mappedFields.join(' / ') }}</em>
        </div>
      </div>

      <div class="demo-checklist">
        <div class="sample-header">
          <h4>售前 Demo Checklist</h4>
          <span>演示时逐项打勾，确保链路完整</span>
        </div>
        <div class="checklist-grid">
          <div v-for="item in pocTemplate.demoChecklist" :key="item.step" class="checklist-item" :class="{ done: item.done }">
            <span class="check-icon">{{ item.done ? '✓' : '□' }}</span>
            <div>
              <strong>{{ item.step }}</strong>
              <p>{{ item.proof }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 生产概况 -->
    <section class="section">
      <h3>生产概况</h3>
      <div class="kpi-row">
        <div class="kpi"><label>工单总数</label><span class="num">{{ r?.production.totalWorkOrders }}</span></div>
        <div class="kpi"><label>已完成</label><span class="num green">{{ r?.production.completedOrders }}</span></div>
        <div class="kpi"><label>进行中</label><span class="num blue">{{ r?.production.inProgressOrders }}</span></div>
        <div class="kpi"><label>准时率</label><span class="num" :class="onTimeClass">{{ fmtPct(r?.production.onTimeRate) }}</span></div>
      </div>
      <div class="chart-wrap">
        <svg :width="chartW" :height="160" class="chart">
          <line v-for="i in yLines" :key="i" :x1="40" :x2="chartW - 10" :y1="30 + i * 30" :y2="30 + i * 30" stroke="#f0f0f0" />
          <polyline :points="prodPoints" fill="none" stroke="#1890ff" stroke-width="2" />
          <circle v-for="(pt, i) in prodData" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="#1890ff" />
          <text v-for="(pt, i) in prodData" :key="'l'+i" :x="pt.x" :y="150" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
        </svg>
      </div>
    </section>

    <!-- 质量概况 -->
    <section class="section">
      <h3>质量概况</h3>
      <div class="kpi-row">
        <div class="kpi"><label>合格率</label><span class="num green">{{ fmtPct(r?.quality.passRate) }}</span></div>
        <div class="kpi"><label>不良率</label><span class="num red">{{ fmtPct(r?.quality.defectRate) }}</span></div>
        <div class="kpi"><label>检验批数</label><span class="num blue">{{ r?.quality.totalInspections }}</span></div>
        <div class="kpi"><label>不良数</label><span class="num red">{{ r?.quality.defectCount }}</span></div>
      </div>
      <div class="chart-wrap">
        <svg :width="chartW" :height="160" class="chart">
          <line v-for="i in yLines" :key="i" :x1="40" :x2="chartW - 10" :y1="30 + i * 30" :y2="30 + i * 30" stroke="#f0f0f0" />
          <polyline :points="defectPoints" fill="none" stroke="#ff4d4f" stroke-width="2" />
          <circle v-for="(pt, i) in defectData" :key="i" :cx="pt.x" :cy="pt.y" r="3" fill="#ff4d4f" />
          <text v-for="(pt, i) in defectData" :key="'l'+i" :x="pt.x" :y="150" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
        </svg>
      </div>
    </section>

    <!-- 设备和异常 -->
    <div class="row-split">
      <section class="section half">
        <h3>设备概况</h3>
        <div class="kpi-row">
          <div class="kpi"><label>总数</label><span class="num">{{ r?.equipment.totalEquipment }}</span></div>
          <div class="kpi"><label>运行中</label><span class="num green">{{ r?.equipment.runningCount }}</span></div>
          <div class="kpi"><label>利用率</label><span class="num blue">{{ fmtPct(r?.equipment.utilizationRate) }}</span></div>
          <div class="kpi"><label>可动率</label><span class="num green">{{ fmtPct(r?.equipment.availabilityRate) }}</span></div>
        </div>
        <div class="chart-wrap">
          <svg :width="chartW / 2 - 20" :height="140" class="chart">
            <rect v-for="(pt, i) in equipData" :key="i" :x="30 + i * 45" :y="pt.y" :width="30" :height="120 - pt.y" :fill="pt.color" rx="3" />
            <text v-for="(pt, i) in equipData" :key="'l'+i" :x="45 + i * 45" :y="135" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
          </svg>
        </div>
      </section>

      <section class="section half">
        <h3>异常分布</h3>
        <div class="kpi-row">
          <div class="kpi"><label>总数</label><span class="num">{{ r?.anomaly.totalAnomalies }}</span></div>
          <div class="kpi"><label>待处理</label><span class="num red">{{ r?.anomaly.openCount }}</span></div>
          <div class="kpi"><label>已解决</label><span class="num green">{{ r?.anomaly.resolvedCount }}</span></div>
          <div class="kpi"><label>平均响应</label><span class="num">{{ r?.anomaly.avgResolveHours }}h</span></div>
        </div>
        <div class="chart-wrap">
          <svg :width="chartW / 2 - 20" :height="140" class="chart">
            <rect v-for="(pt, i) in anomalyData" :key="i" :x="40 + i * 70" :y="pt.y" :width="50" :height="120 - pt.y" :fill="pt.color" rx="3" />
            <text v-for="(pt, i) in anomalyData" :key="'l'+i" :x="65 + i * 70" :y="135" text-anchor="middle" font-size="10" fill="#999">{{ pt.label }}</text>
          </svg>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ChartDataPoint, OtdDemoOrder, OtdImprovementReport, PocEvaluationTemplate, ReportDashboard } from '../../types/report'
import { getReportDashboard } from '../../api/report'
import { useExport } from '../../composables/useExport'
import { readQualityReworkImpact, type QualityReworkImpact } from '../../utils/quality-rework-sync'
import { readQualityCapaClosure, type QualityCapaClosure } from '../../utils/quality-capa-sync'
import { readQualityMrbDispositionRecord, type QualityMrbDispositionRecord } from '../../utils/quality-mrb-disposition-sync'
import { readCustomerOrderImportEvidence, type CustomerOrderImportEvidence } from '../../utils/customer-order-import-sync'
import { readCustomerEquipmentFaultEvidence, type CustomerEquipmentFaultEvidence } from '../../utils/equipment-risk-sync'
import { readPocReviewSignoffRecord, writePocReviewSignoffRecord, type PocReviewSignoffRecord } from '../../utils/poc-review-signoff-sync'
import { readPocRolloutPackageRecord, writePocRolloutPackageRecord, type PocRolloutPackageRecord } from '../../utils/poc-rollout-package-sync'
import { readPocPilotRunRecord, writePocPilotRunRecord, type PocPilotRunRecord } from '../../utils/poc-pilot-run-sync'
import { readPocHypercareAcceptanceRecord, writePocHypercareAcceptanceRecord, type PocHypercareAcceptanceRecord } from '../../utils/poc-hypercare-sync'
import { readRiskSlaReviewRecord, type RiskSlaReviewRecord } from '../../utils/risk-sla-review-sync'
import { readScheduleFeedbackSnapshot, type ScheduleFeedbackSnapshot } from '../../utils/schedule-feedback-sync'
import { readRiskActionTraces, type RiskActionTrace } from '../../utils/risk-action-sync'
import { readOtdEvidenceChainRecords, type OtdEvidenceChainItem } from '../../utils/otd-evidence-chain-sync'
import { readOtdKpiCommitmentPackages, writeOtdKpiCommitmentPackage, type OtdKpiCommitmentPackage } from '../../utils/otd-kpi-commitment-sync'
import {
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  buildQualityKnowledgeRecommendationExperimentComparisonRecords,
  readQualityKnowledgeGrayReleaseDecisionRecords,
  readQualityKnowledgeRecommendationFeedbackRecords,
  readQualityKnowledgeRetrainingVersionRecords,
  type QualityKnowledgeGrayReleaseDecisionRecord,
  type QualityKnowledgeGrayReleaseMonitorRecord,
  type QualityKnowledgeRecommendationExperimentCandidateRecord,
  type QualityKnowledgeRecommendationExperimentComparisonRecord,
  type QualityKnowledgeRecommendationFeedbackRecord,
  type QualityKnowledgeRetrainingVersionRecord,
} from '../../utils/quality-knowledge-sample-sync'

const { csvFilename, downloadCsv } = useExport()

const r = ref<ReportDashboard | null>(null)
const qualityReworkImpact = ref<QualityReworkImpact | null>(null)
const qualityCapaClosure = ref<QualityCapaClosure | null>(null)
const qualityMrbDisposition = ref<QualityMrbDispositionRecord | null>(null)
const customerOrderImport = ref<CustomerOrderImportEvidence | null>(null)
const customerEquipmentFault = ref<CustomerEquipmentFaultEvidence | null>(null)
const pocReviewSignoff = ref<PocReviewSignoffRecord | null>(null)
const pocRolloutPackage = ref<PocRolloutPackageRecord | null>(null)
const pocPilotRun = ref<PocPilotRunRecord | null>(null)
const pocHypercareAcceptance = ref<PocHypercareAcceptanceRecord | null>(null)
const riskSlaReview = ref<RiskSlaReviewRecord | null>(null)
const scheduleFeedback = ref<ScheduleFeedbackSnapshot | null>(null)
const riskActionTraces = ref<RiskActionTrace[]>([])
const otdEvidenceRecords = ref<OtdEvidenceChainItem[]>([])
const otdKpiCommitmentPackages = ref<OtdKpiCommitmentPackage[]>([])
const qualityRecommendationFeedbackRecords = ref<QualityKnowledgeRecommendationFeedbackRecord[]>([])
const qualityRetrainingVersionRecords = ref<QualityKnowledgeRetrainingVersionRecord[]>([])
const qualityGrayReleaseDecisionRecords = ref<QualityKnowledgeGrayReleaseDecisionRecord[]>([])
const chartW = 700
const yLines = [0, 1, 2, 3]

type OtdEvidenceItem = OtdEvidenceChainItem
type OtdKpiDimension = 'customer' | 'line' | 'product' | 'time'

interface OtdKpiDrilldownItem {
  id: string
  dimension: OtdKpiDimension
  dimensionLabel: string
  name: string
  baselineOtd: number
  agentOtd: number
  lift: number
  delayedReduced: number
  status: 'recovered' | 'at_risk'
  statusLabel: string
  driver: string
  explanation: string
  nextActions: string[]
  traceId: string
}

function fmtPct(v: number | undefined) { return v != null ? (v * 100).toFixed(1) + '%' : '-' }
function pctPoint(v: number | undefined) { return v != null ? (v * 100).toFixed(0) + '%' : '-' }

const otdReport = computed(() => r.value?.otdImprovement ?? demoOtdReport)
const customerPocEvidenceReady = computed(() => !!customerOrderImport.value && !!customerEquipmentFault.value)
const qualityGrayReleaseMonitorRecords = computed<QualityKnowledgeGrayReleaseMonitorRecord[]>(() =>
  buildQualityKnowledgeGrayReleaseMonitorRecords(qualityRetrainingVersionRecords.value, qualityRecommendationFeedbackRecords.value)
)
const qualityRecommendationExperimentComparisonRecords = computed<QualityKnowledgeRecommendationExperimentComparisonRecord[]>(() =>
  buildQualityKnowledgeRecommendationExperimentComparisonRecords(
    qualityRetrainingVersionRecords.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value
  )
)
const qualityExperimentCandidateRecords = computed<QualityKnowledgeRecommendationExperimentCandidateRecord[]>(() =>
  buildQualityKnowledgeRecommendationExperimentCandidateRecords(
    qualityRetrainingVersionRecords.value,
    qualityRecommendationFeedbackRecords.value,
    qualityGrayReleaseDecisionRecords.value
  )
)
const activeOtdKpiDimension = ref<OtdKpiDimension>('customer')
const activeOtdKpiDrilldownId = ref('customer-huadong')
const otdKpiDimensionOptions: Array<{ value: OtdKpiDimension; label: string }> = [
  { value: 'customer', label: '客户' },
  { value: 'line', label: '产线' },
  { value: 'product', label: '产品族' },
  { value: 'time', label: '时间窗口' },
]
const otdKpiDrilldownItems: OtdKpiDrilldownItem[] = [
  {
    id: 'customer-huadong',
    dimension: 'customer',
    dimensionLabel: '客户',
    name: '华东新能源',
    baselineOtd: 76,
    agentOtd: 94,
    lift: 18,
    delayedReduced: 3,
    status: 'recovered',
    statusLabel: '已恢复',
    driver: '急单插入 + M-AL-6061 缺料',
    explanation: '华东新能源订单集中命中 WO-RUSH-9001 和 WO-DEMO-1002，基线方案因缺料冻结和 CNC 窗口冲突形成 3 单延期；Agent 通过替代料复核、采购加急和锁定期后插入恢复承诺交期。',
    nextActions: ['采购确认 M-AL-6061B 批次到料承诺', '调度员采纳锁定期后插入方案', '质量保留替代料首件检验窗口'],
    traceId: 'TRACE-KPI-CUSTOMER-HUADONG-OTD-20260521',
  },
  {
    id: 'customer-export',
    dimension: 'customer',
    dimensionLabel: '客户',
    name: '出口备件客户',
    baselineOtd: 88,
    agentOtd: 92,
    lift: 4,
    delayedReduced: 1,
    status: 'at_risk',
    statusLabel: '仍有外协风险',
    driver: '外协热处理等待',
    explanation: '出口备件客户订单受 R-B200 OP-090 热处理能力缺口影响，Agent 已把夜班合批和外协兜底纳入复核，但外协确认未闭环前仍保留 1 单风险。',
    nextActions: ['工艺确认 HT-02 夜班合批窗口', '制造经理确认外协 HT-SUP-01 兜底', '报表复核外协等待是否进入客户承诺口径'],
    traceId: 'TRACE-KPI-CUSTOMER-EXPORT-OTD-20260521',
  },
  {
    id: 'line-cnc',
    dimension: 'line',
    dimensionLabel: '产线',
    name: 'CNC 精加工线',
    baselineOtd: 79,
    agentOtd: 95,
    lift: 16,
    delayedReduced: 4,
    status: 'recovered',
    statusLabel: '瓶颈已保护',
    driver: 'CNC-001 瓶颈 + 夜班维护窗口',
    explanation: 'CNC 精加工线是 OTD 改善主来源。Agent 把 CNC-001 维护窗口放入低负载夜班，并将可拆单任务分流到 CNC-003，避免急单直接挤占锁定期内任务。',
    nextActions: ['设备主管确认 CNC-001 夜班维护窗口', '调度员复核 CNC-003 分流换线成本', '生产班组确认夜班加班资源'],
    traceId: 'TRACE-KPI-LINE-CNC-OTD-20260521',
  },
  {
    id: 'line-assembly',
    dimension: 'line',
    dimensionLabel: '产线',
    name: '装配复检线',
    baselineOtd: 86,
    agentOtd: 96,
    lift: 10,
    delayedReduced: 2,
    status: 'recovered',
    statusLabel: '复检窗口已恢复',
    driver: '扫码返工释放 OP-20 接收',
    explanation: '装配复检线改善来自扫码返工复验放行，OP-20 接收窗口由质量冻结恢复为可执行，后段装配复检不再持续占用承诺交期缓冲。',
    nextActions: ['质量工程师归档复验放行证据', '排产复核 OP-20 接收窗口', '报表核对返工成本是否已归档'],
    traceId: 'TRACE-KPI-LINE-ASM-OTD-20260521',
  },
  {
    id: 'product-valve',
    dimension: 'product',
    dimensionLabel: '产品族',
    name: '阀体组件',
    baselineOtd: 74,
    agentOtd: 96,
    lift: 22,
    delayedReduced: 3,
    status: 'recovered',
    statusLabel: '急单已恢复',
    driver: '急单阀体组件共享缺料和瓶颈设备',
    explanation: '阀体组件产品族受急单插入影响最大，Agent 将共享缺料、瓶颈设备和装配检验窗口合并评估，因此恢复幅度高于全局平均。',
    nextActions: ['将阀体组件列为 POC 主样本', '采购保留共享物料安全库存规则', '销售同步客户交期恢复口径'],
    traceId: 'TRACE-KPI-PRODUCT-VALVE-OTD-20260521',
  },
  {
    id: 'product-flange',
    dimension: 'product',
    dimensionLabel: '产品族',
    name: '法兰盘 DN100',
    baselineOtd: 68,
    agentOtd: 73,
    lift: 5,
    delayedReduced: 0,
    status: 'at_risk',
    statusLabel: '仍延期',
    driver: '外协等待未闭环',
    explanation: '法兰盘 DN100 的瓶颈不在厂内排产，而在外协等待；Agent 只能保留延期并提示人工确认，当前不应把该改善计入已恢复订单。',
    nextActions: ['采购确认外协承诺日期', '计划员评估是否拆分交付', '经营复盘单独标记外部约束'],
    traceId: 'TRACE-KPI-PRODUCT-FLANGE-OTD-20260521',
  },
  {
    id: 'time-next24h',
    dimension: 'time',
    dimensionLabel: '时间窗口',
    name: '未来 24 小时',
    baselineOtd: 70,
    agentOtd: 93,
    lift: 23,
    delayedReduced: 3,
    status: 'recovered',
    statusLabel: '短窗已恢复',
    driver: '急单插入与锁定期保护',
    explanation: '未来 24 小时窗口集中体现锁定期保护价值：8 小时内任务不直接改动，急单放入锁定期后的第一个 CNC 空窗，避免现场二次混乱。',
    nextActions: ['调度员确认锁定期例外清单为空', '班组确认夜班加班资源', '报表导出短窗 OTD 恢复口径'],
    traceId: 'TRACE-KPI-TIME-24H-OTD-20260521',
  },
  {
    id: 'time-week',
    dimension: 'time',
    dimensionLabel: '时间窗口',
    name: '本周交付窗口',
    baselineOtd: 82,
    agentOtd: 96,
    lift: 14,
    delayedReduced: 4,
    status: 'recovered',
    statusLabel: '周窗口达标',
    driver: '缺料闭环 + 设备分流 + 质量放行',
    explanation: '本周窗口对应 30 单演示数据集，OTD 从 82% 到 96%，是对外演示的主口径；所有改善必须能回到证据链和责任模块。',
    nextActions: ['将本周窗口作为 POC 通过口径', '检查仍延期的外协订单是否剔除厂内改善口径', 'CSV 导出多维 KPI 钻取给客户复盘'],
    traceId: 'TRACE-KPI-TIME-WEEK-OTD-20260521',
  },
]
const filteredOtdKpiDrilldownItems = computed(() =>
  otdKpiDrilldownItems.filter(item => item.dimension === activeOtdKpiDimension.value)
)
const selectedOtdKpiDrilldown = computed(() =>
  filteredOtdKpiDrilldownItems.value.find(item => item.id === activeOtdKpiDrilldownId.value)
  ?? filteredOtdKpiDrilldownItems.value[0]
  ?? null
)
const otdKpiDrilldownSummary = computed(() => {
  const recovered = otdKpiDrilldownItems.filter(item => item.status === 'recovered').length
  const atRisk = otdKpiDrilldownItems.filter(item => item.status === 'at_risk').length
  const averageLift = Math.round(otdKpiDrilldownItems.reduce((sum, item) => sum + item.lift, 0) / Math.max(otdKpiDrilldownItems.length, 1))
  return { recovered, atRisk, averageLift }
})
const activeOtdKpiCommitment = computed(() =>
  otdKpiCommitmentPackages.value.find(item => item.sourceKpiId === selectedOtdKpiDrilldown.value?.id) ?? null
)
const qualityGrayReleaseDecisionSummary = computed(() => ({
  expanded: qualityGrayReleaseDecisionRecords.value.filter(record => record.decision === 'expanded').length,
  rolledBack: qualityGrayReleaseDecisionRecords.value.filter(record => record.decision === 'rolled_back').length,
  pendingApproval: qualityGrayReleaseDecisionRecords.value.filter(record => record.approvalStatus === 'pending').length,
  approvedExpansion: qualityGrayReleaseDecisionRecords.value.filter(record => record.decision === 'expanded' && record.approvalStatus === 'approved').length,
  openReviewIssues: qualityGrayReleaseDecisionRecords.value.filter(record => record.reviewIssueStatus === 'open').length,
  closedReviewIssues: qualityGrayReleaseDecisionRecords.value.filter(record => record.reviewIssueStatus === 'closed').length,
  reopenedPrevalidation: qualityGrayReleaseDecisionRecords.value.filter(record => record.reviewIssueStatus === 'prevalidation_reopened').length,
}))
const qualityGrayReleaseDecisionCycleSummaries = computed(() => {
  const labels = Array.from(new Set(qualityGrayReleaseDecisionRecords.value.map(record => record.releaseCycleLabel)))
  return labels.map(label => {
    const records = qualityGrayReleaseDecisionRecords.value.filter(record => record.releaseCycleLabel === label)
    return {
      label,
      records,
      expanded: records.filter(record => record.decision === 'expanded').length,
      rolledBack: records.filter(record => record.decision === 'rolled_back').length,
      pendingApproval: records.filter(record => record.approvalStatus === 'pending').length,
      openReviewIssues: records.filter(record => record.reviewIssueStatus === 'open').length,
    }
  })
})

interface OtdDrilldownItem extends OtdEvidenceItem {
  businessQuestion: string
  explanation: string
  owner: string
  route: string
  routeLabel: string
  effectLabel: string
  riskLabel: string
  nextAction: string
}

const activeOtdDrilldownId = ref('agent-baseline')

const otdEvidenceChain = computed<OtdEvidenceItem[]>(() => {
  const syncedRecords = otdEvidenceRecords.value
  const syncedIds = new Set(syncedRecords.map(item => item.id))
  const items: OtdEvidenceItem[] = [
    {
      id: 'risk-baseline',
      stage: '风险触发',
      title: '急单 / 缺料 / 设备健康进入风险队列',
      summary: 'WO-RUSH-9001、M-AL-6061 与 CNC-001 共同解释基线延期来源。',
      object: 'WO-RUSH-9001 / M-AL-6061 / CNC-001',
      source: '风险预警 / 实时监控',
      traceId: 'TRACE-RISK-20260520-001',
      status: 'active',
      statusLabel: '待复核',
      createdAt: '2026-05-20T09:00:00.000Z',
    },
    {
      id: 'agent-baseline',
      stage: 'Agent 建议',
      title: '锁定期后插入 + 采购加急 + 瓶颈保护',
      summary: 'Agent 推荐方案把 30 单样本 OTD 从 82.0% 提升到 96.0%。',
      object: '30 单演示数据集',
      source: 'AI 排产',
      traceId: 'TRACE-SCH-20260520-001',
      status: 'ready',
      statusLabel: '已解释',
      createdAt: '2026-05-20T09:05:00.000Z',
    },
  ]

  items.push(...syncedRecords)

  if (scheduleFeedback.value && !syncedIds.has('schedule-feedback')) {
    items.push({
      id: 'schedule-feedback',
      stage: '人工采纳',
      title: scheduleFeedback.value.decisionLabel,
      summary: `${scheduleFeedback.value.categoryLabel}：${scheduleFeedback.value.reasonDetail}`,
      object: scheduleFeedback.value.objectiveLabel,
      source: 'AI 排产 / 人机协同复盘',
      traceId: scheduleFeedback.value.traceId,
      status: scheduleFeedback.value.decision === 'accepted' ? 'ready' : 'active',
      statusLabel: scheduleFeedback.value.decision === 'accepted' ? '已采纳' : '已拒绝',
      createdAt: scheduleFeedback.value.createdAt,
    })
  }

  for (const trace of riskActionTraces.value.slice(0, 3)) {
    const id = `risk-action-${trace.id}`
    if (syncedIds.has(id)) continue
    items.push({
      id,
      stage: '现场处置',
      title: trace.title,
      summary: trace.trace,
      object: trace.workOrders,
      source: `风险处置队列 / ${trace.owner}`,
      traceId: trace.deliveryImpact,
      status: trace.status === 'closed' ? 'closed' : 'active',
      statusLabel: trace.statusLabel,
      createdAt: trace.createdAt,
    })
  }

  if (qualityCapaClosure.value && !syncedIds.has('quality-capa')) {
    items.push({
      id: 'quality-capa',
      stage: '质量回写',
      title: qualityCapaClosure.value.taskTitle,
      summary: qualityCapaClosure.value.reviewAction,
      object: qualityCapaClosure.value.workOrderId,
      source: `质量闭环 / ${qualityCapaClosure.value.owner}`,
      traceId: qualityCapaClosure.value.traceId,
      status: 'closed',
      statusLabel: '已验证',
      createdAt: qualityCapaClosure.value.verifiedAt,
    })
  }

  if (qualityMrbDisposition.value && !syncedIds.has('quality-mrb-disposition')) {
    items.push({
      id: 'quality-mrb-disposition',
      stage: '质量MRB处置',
      title: qualityMrbDisposition.value.title,
      summary: qualityMrbDisposition.value.closureSummary ?? qualityMrbDisposition.value.scheduleImpact,
      object: `${qualityMrbDisposition.value.workOrderId} / ${qualityMrbDisposition.value.inspectionId}`,
      source: `质量 MRB / ${qualityMrbDisposition.value.owner}`,
      traceId: qualityMrbDisposition.value.closureTraceId ?? qualityMrbDisposition.value.traceId,
      status: qualityMrbDisposition.value.status,
      statusLabel: qualityMrbDisposition.value.status === 'closed' ? 'MRB 处置已闭环' : qualityMrbDisposition.value.statusLabel,
      createdAt: qualityMrbDisposition.value.closedAt ?? qualityMrbDisposition.value.createdAt,
    })
  }

  if (pocReviewSignoff.value && !syncedIds.has('poc-signoff')) {
    items.push({
      id: 'poc-signoff',
      stage: '复盘归档',
      title: 'POC 复盘会评分表已签署',
      summary: pocReviewSignoff.value.summary,
      object: pocReviewSignoff.value.meetingId,
      source: pocReviewSignoff.value.signedBy,
      traceId: pocReviewSignoff.value.auditId,
      status: 'closed',
      statusLabel: '已签署',
      createdAt: pocReviewSignoff.value.signedAt,
    })
  }

  return items
})
const otdDrilldownItems = computed<OtdDrilldownItem[]>(() => otdEvidenceChain.value.map(mapOtdEvidenceToDrilldown))
const selectedOtdDrilldown = computed(() =>
  otdDrilldownItems.value.find(item => item.id === activeOtdDrilldownId.value)
  ?? otdDrilldownItems.value[0]
  ?? null
)
const otdDrilldownSummary = computed(() => {
  const items = otdDrilldownItems.value
  return {
    closed: items.filter(item => item.status === 'closed' || item.status === 'ready').length,
    active: items.filter(item => item.status === 'active').length,
    routes: new Set(items.map(item => item.routeLabel)).size,
  }
})

function selectOtdEvidence(id: string) {
  activeOtdDrilldownId.value = id
}

function mapOtdEvidenceToDrilldown(item: OtdEvidenceItem): OtdDrilldownItem {
  const stage = item.stage
  const source = item.source
  const isPurchase = stage.includes('采购') || source.includes('采购')
  const isEquipment = stage.includes('设备') || source.includes('设备')
  const isInventory = stage.includes('库存') || item.title.includes('齐套') || item.summary.includes('缺口')
  const isQuality = stage.includes('质量') || source.includes('质量') || item.title.includes('返工') || item.title.includes('CAPA')
  const isSchedule = stage.includes('Agent') || stage.includes('排产') || source.includes('AI 排产')
  const isRisk = stage.includes('风险') || source.includes('风险')
  const isAssistant = stage.includes('助手') || source.includes('AI 生产助手')

  const route = isAssistant
    ? '/scheduling'
    : isPurchase
    ? '/purchase'
    : isEquipment
      ? '/equipment'
      : isInventory
        ? '/inventory'
        : isQuality
          ? '/quality'
          : isRisk
            ? '/risk'
            : '/scheduling'
  const routeLabel = route === '/purchase'
    ? '采购协同'
    : route === '/equipment'
      ? '设备维护'
      : route === '/inventory'
        ? '库存齐套'
        : route === '/quality'
          ? '质量闭环'
          : route === '/risk'
            ? '风险预警'
            : 'AI 排产'
  const owner = source.includes('/')
    ? source.split('/').map(part => part.trim()).filter(Boolean).slice(-1)[0] ?? source
    : source
  const businessQuestion = isPurchase
    ? '缺料风险是否已被采购承诺消除？'
    : isEquipment
      ? '瓶颈设备停机是否还会拖累交期？'
      : isInventory
        ? '齐套缺口是否已转成可执行供应动作？'
        : isQuality
          ? '质量返工是否已回写排产和 OTD？'
          : isRisk
            ? '延期风险来源是否已进入处置队列？'
            : isAssistant
              ? 'AI 助手是否把问答转成了可执行闭环？'
              : 'Agent 推荐为什么能提升 OTD？'
  const effectLabel = item.status === 'closed'
    ? '已闭环，进入复盘口径'
    : item.status === 'ready'
      ? '已解释，可作为采纳证据'
      : '处理中，仍影响 OTD 风险'
  const riskLabel = item.statusLabel
  const nextAction = item.status === 'closed'
    ? `在${routeLabel}核对归档结果，确认复盘证据是否完整。`
    : item.status === 'ready'
      ? `在${routeLabel}核对方案解释，确认是否需要扩大到真实工单。`
      : `进入${routeLabel}处理责任动作，并回写 OTD 证据链。`
  const explanation = `${item.title} 解释了 ${item.object} 的 OTD 变化来源。${item.summary} 该证据来自 ${item.source}，当前状态为 ${item.statusLabel}，追踪号 ${item.traceId}。`

  return {
    ...item,
    businessQuestion,
    explanation,
    owner,
    route,
    routeLabel,
    effectLabel,
    riskLabel,
    nextAction,
  }
}

const pocTemplate = computed<PocEvaluationTemplate>(() => {
  const base = r.value?.pocEvaluation ?? demoPocTemplate
  if (!customerOrderImport.value && !customerEquipmentFault.value) return base
  return {
    ...base,
    dimensions: base.dimensions.map(dimension => {
      if (dimension.name === '事件闭环' && customerEquipmentFault.value) {
        return {
          ...dimension,
          actualScore: dimension.weight,
          gap: undefined,
          evidence: `${dimension.evidence}；客户真实设备故障样例 ${customerEquipmentFault.value.batchId} 已补齐`,
        }
      }
      if (dimension.name !== '执行回写') return { ...dimension }
      if (!customerOrderImport.value) return { ...dimension }
      return {
        ...dimension,
        actualScore: dimension.weight,
        gap: undefined,
        evidence: `${dimension.evidence}；客户真实工单导入样例 ${customerOrderImport.value?.batchId} 已补齐`,
      }
    }),
    evidenceChecklist: base.evidenceChecklist.map(item => {
      if (item.item === '客户真实工单导入样例' && customerOrderImport.value) {
        return {
          ...item,
          owner: '客户 IT / 已导入',
          status: 'ready',
        }
      }
      if (item.item === '客户真实设备故障数据' && customerEquipmentFault.value) {
        return {
          ...item,
          owner: '设备维护 / 已导入',
          status: 'ready',
        }
      }
      if (item.item === 'POC 复盘会评分表' && pocReviewSignoff.value) {
        return {
          ...item,
          owner: '项目经理 / 已签署',
          status: 'ready',
        }
      }
      return { ...item }
    }),
  }
})
const scoredPocDimensions = computed(() => pocTemplate.value.dimensions.map(dimension => {
  const actualScore = dimension.actualScore ?? dimension.weight
  return {
    ...dimension,
    actualScore,
    ratio: Math.round((actualScore / Math.max(dimension.weight, 1)) * 100),
  }
}))
const pocEvaluationResult = computed(() => {
  const totalScore = scoredPocDimensions.value.reduce((sum, dimension) => sum + dimension.actualScore, 0)
  const evidenceGaps = pocTemplate.value.evidenceChecklist
    .filter(item => item.status !== 'ready')
    .map(item => ({ name: item.item, gap: `${item.owner} 需补齐后才能作为 POC 验收证据。` }))
  const dimensionGaps = scoredPocDimensions.value
    .filter(dimension => dimension.actualScore < dimension.weight)
    .map(dimension => ({
      name: dimension.name,
      gap: dimension.gap ?? `还差 ${dimension.weight - dimension.actualScore} 分证据，需要补齐 ${dimension.evidence}。`,
    }))
  return {
    totalScore,
    passed: totalScore >= pocTemplate.value.passScore,
    gaps: [...dimensionGaps, ...evidenceGaps],
  }
})

const onTimeClass = computed(() => {
  const v = r.value?.production.onTimeRate
  if (!v) return ''
  if (v >= 0.9) return 'green'
  if (v >= 0.75) return 'blue'
  return 'red'
})

function mapPoints(data: ChartDataPoint[], maxH = 120, offsetY = 30): { x: number; y: number; label: string }[] {
  if (!data?.length) return []
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const step = (chartW - 60) / Math.max(data.length - 1, 1)
  return data.map((d, i) => ({
    x: 40 + i * step,
    y: offsetY + maxH - (d.value / maxVal) * maxH,
    label: d.label,
  }))
}

const prodData = computed(() => mapPoints(r.value?.production.dailyOutput || []))
const prodPoints = computed(() => prodData.value.map(p => `${p.x},${p.y}`).join(' '))
const defectData = computed(() => mapPoints(r.value?.quality.dailyDefects || []))
const defectPoints = computed(() => defectData.value.map(p => `${p.x},${p.y}`).join(' '))

const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f']
const equipData = computed(() => {
  const trend = r.value?.equipment.utilizationTrend || []
  const maxVal = Math.max(...trend.map(d => d.value), 100)
  return trend.map((d, i) => ({ ...d, y: 120 - (d.value / maxVal) * 120, color: colors[i % 4] }))
})
const anomalyData = computed(() => {
  const types = r.value?.anomaly.anomalyByType || []
  const maxVal = Math.max(...types.map(d => d.value), 1)
  return types.map((d, i) => ({ ...d, y: 120 - (d.value / maxVal) * 120, color: colors[i % 4] }))
})

function handleExportCsv() {
  if (!r.value) return
  const d = r.value
  const otd = otdReport.value
  const poc = pocTemplate.value
  const headers = ['指标类别', '指标名称', '值']
  const rows: string[][] = [
    ['OTD复盘', '演示数据集', `${otd.demoDatasetSize}单`],
    ['OTD复盘', '人工基线OTD', fmtPct(otd.baselineOtd)],
    ['OTD复盘', 'Agent推荐OTD', fmtPct(otd.agentOtd)],
    ['OTD复盘', 'OTD提升', `+${pctPoint(otd.otdLift)}`],
    ['OTD复盘', '延期减少', `${otd.delayedOrdersReduced}单`],
    ['OTD复盘', '换线减少', `${otd.changeoverMinutesReduced}分钟`],
    ['生产', '工单总数', String(d.production.totalWorkOrders)],
    ['生产', '已完成', String(d.production.completedOrders)],
    ['生产', '进行中', String(d.production.inProgressOrders)],
    ['生产', '准时率', String((d.production.onTimeRate * 100).toFixed(1) + '%')],
    ['质量', '合格率', String((d.quality.passRate * 100).toFixed(1) + '%')],
    ['质量', '不良率', String((d.quality.defectRate * 100).toFixed(1) + '%')],
    ['质量', '检验批数', String(d.quality.totalInspections)],
    ['质量', '不良数', String(d.quality.defectCount)],
    ['设备', '总数', String(d.equipment.totalEquipment)],
    ['设备', '运行中', String(d.equipment.runningCount)],
    ['设备', '利用率', String((d.equipment.utilizationRate * 100).toFixed(1) + '%')],
    ['设备', '可动率', String((d.equipment.availabilityRate * 100).toFixed(1) + '%')],
    ['异常', '总数', String(d.anomaly.totalAnomalies)],
    ['异常', '待处理', String(d.anomaly.openCount)],
    ['异常', '已解决', String(d.anomaly.resolvedCount)],
    ['异常', '平均响应', String(d.anomaly.avgResolveHours) + 'h'],
  ]
  for (const dp of d.production.dailyOutput) {
    rows.push(['生产趋势', dp.label, String(dp.value)])
  }
  for (const reason of otd.reasons) {
    rows.push(['OTD改善原因', reason.label, reason.contribution])
  }
  for (const drilldown of otdKpiDrilldownItems) {
    rows.push(['OTD KPI多维钻取', `${drilldown.dimensionLabel} / ${drilldown.name}`, `基线 ${drilldown.baselineOtd}% / Agent ${drilldown.agentOtd}% / 提升 +${drilldown.lift}% / 延期减少 ${drilldown.delayedReduced} 单 / ${drilldown.statusLabel}`])
    rows.push(['OTD KPI多维钻取', `${drilldown.name} 主因`, `${drilldown.driver} / ${drilldown.traceId}`])
    rows.push(['OTD KPI多维钻取', `${drilldown.name} 下一步`, drilldown.nextActions.join(' / ')])
  }
  for (const commitment of otdKpiCommitmentPackages.value) {
    rows.push(['客户交付恢复承诺包', `${commitment.dimensionLabel} / ${commitment.targetName}`, `${commitment.commitment} / ${commitment.owner} / ${commitment.dueAt}`])
    rows.push(['客户交付恢复承诺包', `${commitment.targetName} 审计`, `${commitment.auditId} / ${commitment.traceId}`])
  }
  for (const drilldown of otdDrilldownItems.value) {
    rows.push(['OTD经营钻取', `${drilldown.stage} / ${drilldown.businessQuestion}`, `${drilldown.effectLabel} / ${drilldown.owner} / ${drilldown.routeLabel} / ${drilldown.nextAction}`])
  }
  for (const evidence of otdEvidenceChain.value) {
    rows.push(['OTD复盘证据链', `${evidence.stage} / ${evidence.title}`, `${evidence.statusLabel} / ${evidence.object} / ${evidence.traceId}`])
  }
  for (const record of qualityRecommendationFeedbackRecords.value) {
    rows.push(['质量推荐学习闭环', `${record.targetWorkOrderId} ${record.operationCode}`, `${record.trainingSetVersion} -> ${record.nextTrainingSetVersion} / ${record.effectTrendLabel} / ${record.auditId}`])
    rows.push(['质量推荐学习闭环', '下一轮训练追踪', record.nextTrainingTraceId])
  }
  for (const record of qualityGrayReleaseMonitorRecords.value) {
    rows.push(['质量推荐灰度监控', `${record.title} / ${record.scopeLabel}`, `${record.statusLabel} / 推荐采纳率 ${record.adoptionRateLabel} / 复验通过率 ${record.recheckPassRateLabel} / 负样本误召回 ${record.falseRecallLabel}`])
    rows.push(['质量推荐灰度监控', '灰度周期', record.releaseCycleLabel])
    rows.push(['质量推荐灰度监控', '灰度审计追踪', `${record.auditId} / ${record.traceId}`])
  }
  if (qualityGrayReleaseDecisionRecords.value.length) {
    rows.push(['质量灰度决策统计', '扩大/回滚', `${qualityGrayReleaseDecisionSummary.value.expanded} 次扩大 / ${qualityGrayReleaseDecisionSummary.value.rolledBack} 次回滚`])
    rows.push(['质量灰度决策统计', '待确认/问题单', `${qualityGrayReleaseDecisionSummary.value.pendingApproval} 待主管确认 / ${qualityGrayReleaseDecisionSummary.value.openReviewIssues} 个待复核问题单`])
    rows.push(['质量灰度决策统计', '关闭/重开校验', `${qualityGrayReleaseDecisionSummary.value.closedReviewIssues} 个已关闭 / ${qualityGrayReleaseDecisionSummary.value.reopenedPrevalidation} 个重开灰度前校验`])
  }
  for (const cycle of qualityGrayReleaseDecisionCycleSummaries.value) {
    rows.push(['质量灰度决策周期', cycle.label, `${cycle.expanded} 次扩大 / ${cycle.rolledBack} 次回滚 / ${cycle.pendingApproval} 待确认 / ${cycle.openReviewIssues} 待复核`])
  }
  for (const record of qualityGrayReleaseDecisionRecords.value) {
    rows.push(['质量灰度决策', `${record.trainingSetVersion} / ${record.releaseCycleLabel} / ${record.decisionLabel}`, `${record.approvalLabel} / ${record.auditId} / ${record.traceId}`])
    rows.push(['质量灰度决策', '发布周期审计', `${record.releaseCycleLabel} / ${record.releaseAuditId} / ${record.releaseTraceId}`])
    rows.push(['质量灰度决策', '指标快照', record.metricSnapshot.map(metric => `${metric.label} ${metric.value}`).join(' / ')])
    if (record.reviewIssueId) {
      rows.push(['质量灰度决策', '待复核问题单', `${record.reviewIssueId} / ${record.reviewIssueTraceId} / ${record.reviewIssueLabel ?? '待复核'}`])
      if (record.reviewIssueValidationAuditId) {
        rows.push(['质量灰度决策', '问题单处置', `${record.reviewIssueValidationAuditId} / ${record.reviewIssueValidationTraceId}`])
      }
    }
  }
  for (const record of qualityRecommendationExperimentComparisonRecords.value) {
    rows.push(['质量推荐实验对比', `${record.trainingSetVersion} / ${record.releaseCycleLabel} / ${record.releaseScopeLabel}`, `${record.statusLabel} / 采纳率 ${record.adoptionRateLabel} / 复验通过率 ${record.recheckPassRateLabel} / 误召回 ${record.falseRecallLabel} / 实验评分 ${record.experimentScoreLabel}`])
    rows.push(['质量推荐实验对比', `${record.trainingSetVersion} 扩大门禁`, `${record.gatePassLabel} / ${record.gatePolicyLabel} / ${record.gateAuditLabel}`])
    rows.push(['质量推荐实验对比', `${record.trainingSetVersion} 效果趋势`, `${record.effectTrendLabel} / ${record.feedbackAuditLabel} / ${record.feedbackTraceLabel}`])
    rows.push(['质量推荐实验对比', `${record.trainingSetVersion} 灰度审计`, `${record.releaseAuditId} / ${record.releaseTraceId}`])
    rows.push(['质量推荐实验对比', `${record.trainingSetVersion} 决策`, record.decisionAuditId ? `${record.decisionLabel} / ${record.decisionAuditId} / ${record.decisionTraceId}` : record.decisionLabel])
  }
  for (const record of qualityExperimentCandidateRecords.value) {
    rows.push(['质量推荐实验候选', `${record.candidateTrainingSetVersion} / ${record.triggerLabel}`, `${record.statusLabel} / 负样本覆盖 ${record.negativeCoverageLabel} / 覆盖率 ${record.coveragePercentLabel} / ${record.gapLabel}`])
    rows.push(['质量推荐实验候选', `${record.candidateTrainingSetVersion} 指标`, `采纳率 ${record.adoptionRateLabel} / 复验通过率 ${record.recheckPassRateLabel} / 误召回 ${record.falseRecallLabel} / ${record.gatePolicyLabel}`])
    rows.push(['质量推荐实验候选', `${record.candidateTrainingSetVersion} 审计`, `${record.sourceAuditId} / ${record.sourceTraceId} / ${record.auditId} / ${record.traceId}`])
  }
  for (const order of otd.sampleOrders) {
    rows.push(['30单样本节选', order.orderNumber, `${order.productName} / ${order.risk} / ${order.action}`])
  }
  rows.push(['POC评估', '目标客户', poc.targetCustomer])
  rows.push(['POC评估', '周期', poc.duration])
  rows.push(['POC评估', '通过线', `${poc.passScore}分`])
  rows.push(['POC评估', '当前评分', `${pocEvaluationResult.value.totalScore}分`])
  rows.push(['POC评估', '通过状态', pocEvaluationResult.value.passed ? '达到通过线' : '未达到通过线'])
  for (const dimension of poc.dimensions) {
    rows.push(['POC评分维度', `${dimension.name}(${dimension.actualScore ?? dimension.weight}/${dimension.weight}分)`, `${dimension.target} / ${dimension.evidence}`])
  }
  for (const gap of pocEvaluationResult.value.gaps) {
    rows.push(['POC补齐缺口', gap.name, gap.gap])
  }
  for (const item of poc.evidenceChecklist) {
    rows.push(['POC验收证据', item.item, `${item.owner} / ${item.status === 'ready' ? '已准备' : '待补充'}`])
  }
  for (const item of poc.demoChecklist) {
    rows.push(['售前Demo Checklist', item.step, item.proof])
  }
  if (qualityCapaClosure.value) {
    rows.push(['质量CAPA', '验证任务', qualityCapaClosure.value.taskTitle])
    rows.push(['质量CAPA', 'OTD复盘口径', qualityCapaClosure.value.otdImpact])
    rows.push(['质量CAPA', '审计编号', qualityCapaClosure.value.traceId])
  }
  if (qualityMrbDisposition.value) {
    rows.push(['质量MRB处置', '标题', qualityMrbDisposition.value.title])
    rows.push(['质量MRB处置', 'OTD影响', qualityMrbDisposition.value.otdImpact])
    rows.push(['质量MRB处置', '审计编号', `${qualityMrbDisposition.value.auditId} / ${qualityMrbDisposition.value.traceId} / ${qualityMrbDisposition.value.scheduleTraceId}`])
    if (qualityMrbDisposition.value.closureTraceId) {
      rows.push(['质量MRB处置', '闭环追踪', `${qualityMrbDisposition.value.closureAuditId} / ${qualityMrbDisposition.value.closureTraceId}`])
      rows.push(['质量MRB处置', '闭环结论', qualityMrbDisposition.value.closureSummary ?? 'MRB 处置已闭环'])
    }
    for (const action of qualityMrbDisposition.value.actions) {
      rows.push(['质量MRB动作', `${action.module} / ${action.owner}`, `${action.action} / ${action.dueAt} / ${action.evidence}${action.result ? ` / ${action.result}` : ''}`])
    }
  }
  if (pocReviewSignoff.value) {
    rows.push(['POC复盘签署', '会议编号', pocReviewSignoff.value.meetingId])
    rows.push(['POC复盘签署', '审计编号', pocReviewSignoff.value.auditId])
    rows.push(['POC复盘签署', '签署人', pocReviewSignoff.value.signedBy])
  }
  if (pocRolloutPackage.value) {
    rows.push(['POC上线交付包', '标题', pocRolloutPackage.value.title])
    rows.push(['POC上线交付包', '上线窗口', pocRolloutPackage.value.rolloutWindow])
    rows.push(['POC上线交付包', '上线门禁', pocRolloutPackage.value.goLiveGate])
    rows.push(['POC上线交付包', '审计编号', `${pocRolloutPackage.value.auditId} / ${pocRolloutPackage.value.traceId}`])
    for (const action of pocRolloutPackage.value.actions) {
      rows.push(['POC上线交付动作', `${action.module} / ${action.owner}`, `${action.action} / ${action.dueAt} / ${action.evidence}`])
    }
  }
  if (pocPilotRun.value) {
    rows.push(['POC试点运行', '标题', pocPilotRun.value.title])
    rows.push(['POC试点运行', '批次', `${pocPilotRun.value.batchId} / ${pocPilotRun.value.sampleSize} 单 / OTD ${pocPilotRun.value.actualOtd}`])
    rows.push(['POC试点运行', '审计编号', `${pocPilotRun.value.auditId} / ${pocPilotRun.value.traceId}`])
    for (const order of pocPilotRun.value.workOrders) {
      rows.push(['POC试点工单', `${order.workOrderNumber} / ${order.productName}`, `${order.quantity} 件 / ${order.route} / ${order.scheduleDecision} / ${order.executionStatus}`])
    }
    for (const checkpoint of pocPilotRun.value.checkpoints) {
      rows.push(['POC试点检查点', `${checkpoint.module} / ${checkpoint.owner}`, `${checkpoint.summary} / ${checkpoint.evidence}`])
    }
  }
  if (pocHypercareAcceptance.value) {
    rows.push(['POCHypercare验收', '标题', pocHypercareAcceptance.value.title])
    rows.push(['POCHypercare验收', '上线窗口', pocHypercareAcceptance.value.goLiveWindow])
    rows.push(['POCHypercare验收', '门禁', pocHypercareAcceptance.value.acceptanceGate])
    rows.push(['POCHypercare验收', '审计编号', `${pocHypercareAcceptance.value.auditId} / ${pocHypercareAcceptance.value.traceId}`])
    for (const monitor of pocHypercareAcceptance.value.monitors) {
      rows.push(['POCHypercare指标', `${monitor.label} / ${monitor.statusLabel}`, `${monitor.current} / 目标 ${monitor.target} / ${monitor.evidence}`])
    }
    for (const checkpoint of pocHypercareAcceptance.value.checkpoints) {
      rows.push(['POCHypercare动作', `${checkpoint.module} / ${checkpoint.owner}`, `${checkpoint.action} / ${checkpoint.evidence}`])
    }
  }
  if (riskSlaReview.value) {
    rows.push(['风险SLA复核', '标题', riskSlaReview.value.title])
    rows.push(['风险SLA复核', '晨会编号', `${riskSlaReview.value.reviewMeetingId} / ${riskSlaReview.value.statusLabel}`])
    rows.push(['风险SLA复核', '风险概览', `逾期 ${riskSlaReview.value.overdueCount} 项 / 关键 ${riskSlaReview.value.criticalCount} 项 / ${riskSlaReview.value.otdImpact}`])
    rows.push(['风险SLA复核', '审计编号', `${riskSlaReview.value.auditId} / ${riskSlaReview.value.traceId}`])
    if (riskSlaReview.value.closureTraceId) {
      rows.push(['风险SLA复核', '闭环追踪', `${riskSlaReview.value.closureAuditId} / ${riskSlaReview.value.closureTraceId}`])
      rows.push(['风险SLA复核', '闭环结论', riskSlaReview.value.closureSummary ?? '责任动作已闭环'])
    }
    for (const risk of riskSlaReview.value.risks) {
      rows.push(['风险SLA风险项', `${risk.type} / ${risk.title}`, `${risk.owner} / ${risk.dueAt} / ${risk.deliveryImpact}`])
    }
    for (const action of riskSlaReview.value.actions) {
      rows.push(['风险SLA责任动作', `${action.module} / ${action.owner}`, `${action.action} / ${action.dueAt} / ${action.evidence}${action.result ? ` / ${action.result}` : ''}`])
    }
  }
  downloadCsv(csvFilename('报表'), headers, rows)
}

function currentActor() {
  try {
    const raw = localStorage.getItem('aimes_user')
    if (!raw) return 'report.viewer'
    const user = JSON.parse(raw)
    return user.username ?? user.displayName ?? 'report.viewer'
  } catch {
    return 'report.viewer'
  }
}

function handleGenerateOtdKpiCommitment() {
  const item = selectedOtdKpiDrilldown.value
  if (!item) return
  const record = writeOtdKpiCommitmentPackage({
    sourceKpiId: item.id,
    dimensionLabel: item.dimensionLabel,
    targetName: item.name,
    baselineOtd: item.baselineOtd,
    agentOtd: item.agentOtd,
    lift: item.lift,
    delayedReduced: item.delayedReduced,
    statusLabel: item.statusLabel,
    driver: item.driver,
    nextActions: item.nextActions,
    sourceTraceId: item.traceId,
    actor: currentActor(),
  })
  otdKpiCommitmentPackages.value = [record, ...otdKpiCommitmentPackages.value.filter(item => item.id !== record.id)]
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function handleExportExcel() {
  const a = document.createElement('a')
  a.href = '/api/v1/report/export/excel'
  a.download = 'MES_Report.xlsx'
  a.click()
}

function handleExportPdf() {
  const a = document.createElement('a')
  a.href = '/api/v1/report/export/pdf'
  a.download = 'MES_Report.pdf'
  a.click()
}

onMounted(async () => {
  qualityReworkImpact.value = readQualityReworkImpact()
  qualityCapaClosure.value = readQualityCapaClosure()
  qualityMrbDisposition.value = readQualityMrbDispositionRecord()
  customerOrderImport.value = readCustomerOrderImportEvidence()
  customerEquipmentFault.value = readCustomerEquipmentFaultEvidence()
  pocReviewSignoff.value = readPocReviewSignoffRecord()
  pocRolloutPackage.value = readPocRolloutPackageRecord()
  pocPilotRun.value = readPocPilotRunRecord()
  pocHypercareAcceptance.value = readPocHypercareAcceptanceRecord()
  riskSlaReview.value = readRiskSlaReviewRecord()
  scheduleFeedback.value = readScheduleFeedbackSnapshot()
  riskActionTraces.value = readRiskActionTraces()
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
  otdKpiCommitmentPackages.value = readOtdKpiCommitmentPackages()
  qualityRecommendationFeedbackRecords.value = readQualityKnowledgeRecommendationFeedbackRecords()
  qualityRetrainingVersionRecords.value = readQualityKnowledgeRetrainingVersionRecords()
  qualityGrayReleaseDecisionRecords.value = readQualityKnowledgeGrayReleaseDecisionRecords()
  try { r.value = await getReportDashboard() }
  catch {
    r.value = {
      production: { totalWorkOrders: 48, completedOrders: 32, inProgressOrders: 12, onTimeRate: 0.85, dailyOutput: Array.from({ length: 14 }, (_, i) => ({ label: `5/${i + 1}`, value: 20 + Math.random() * 25 })) },
      quality: { passRate: 0.976, defectRate: 0.024, totalInspections: 1250, defectCount: 30, dailyDefects: Array.from({ length: 14 }, (_, i) => ({ label: `5/${i + 1}`, value: Math.random() * 5 })) },
      equipment: { totalEquipment: 24, runningCount: 18, utilizationRate: 0.78, availabilityRate: 0.94, utilizationTrend: [{ label: '第1周', value: 72 }, { label: '第2周', value: 78 }, { label: '第3周', value: 85 }, { label: '第4周', value: 76 }, { label: '第5周', value: 82 }, { label: '第6周', value: 79 }, { label: '第7周', value: 88 }] },
      anomaly: { totalAnomalies: 36, openCount: 5, resolvedCount: 28, avgResolveHours: 3.5, anomalyByType: [{ label: '设备', value: 14 }, { label: '质量', value: 10 }, { label: '物料', value: 7 }, { label: '工艺', value: 5 }] },
      otdImprovement: demoOtdReport,
      pocEvaluation: demoPocTemplate,
    }
  }
})

function statusText(status: OtdDemoOrder['baselineStatus'] | OtdDemoOrder['agentStatus']) {
  const map = {
    on_time: '准时',
    delayed: '延期',
    recovered: '已恢复',
  }
  return map[status]
}

function handlePocReviewSignoff() {
  if (!customerOrderImport.value || !customerEquipmentFault.value) return
  pocReviewSignoff.value = writePocReviewSignoffRecord({
    targetCustomer: pocTemplate.value.targetCustomer,
    totalScore: pocEvaluationResult.value.totalScore,
    passScore: pocTemplate.value.passScore,
    evidenceBatches: [customerOrderImport.value.batchId, customerEquipmentFault.value.batchId],
    summary: `POC 评分 ${pocEvaluationResult.value.totalScore} / 100，客户工单导入与设备故障样例证据齐套，达到 ${pocTemplate.value.passScore} 分通过线。`,
  })
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function handleGeneratePocRolloutPackage() {
  if (!pocReviewSignoff.value) return
  pocRolloutPackage.value = writePocRolloutPackageRecord(pocReviewSignoff.value)
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function handleConfirmPocPilotRun() {
  if (!pocRolloutPackage.value) return
  pocPilotRun.value = writePocPilotRunRecord(pocRolloutPackage.value)
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

function handleGeneratePocHypercareAcceptance() {
  if (!pocPilotRun.value) return
  pocHypercareAcceptance.value = writePocHypercareAcceptanceRecord(pocPilotRun.value)
  otdEvidenceRecords.value = readOtdEvidenceChainRecords()
}

const demoOtdReport: OtdImprovementReport = {
  demoDatasetSize: 30,
  baselineOtd: 0.82,
  agentOtd: 0.96,
  otdLift: 0.14,
  baselineDelayedOrders: 5,
  agentDelayedOrders: 1,
  delayedOrdersReduced: 4,
  changeoverMinutesReduced: 73,
  protectedRushOrders: 2,
  decisionTraceCount: 9,
  headline: 'AIMes Agent 通过锁定期保护、瓶颈设备合批、缺料采购闭环和急单加班插入，把 30 单样本的准时交付率从 82% 提升到 96%。',
  reasons: [
    { label: '瓶颈设备合批', contribution: 'CNC 与热处理工序减少 73 分钟换线，释放 1 个夜班窗口。' },
    { label: '缺料闭环', contribution: 'M-AL-6061 加急采购收货后，WO-RUSH-9001 与 WO-DEMO-1002 缺料风险下降。' },
    { label: '锁定期保护', contribution: '8 小时内任务不直接改动，降低现场二次混乱。' },
    { label: '采纳反馈', contribution: '9 条调度员决策留痕进入复盘，解释为什么接受加班插入方案。' },
  ],
  demoPath: [
    '生产概览查看今日风险与物料状态',
    '风险预警发现急单、缺料、设备健康下降',
    'AI 排产生成三类事件重排建议',
    '采购协同生成加急单并模拟收货',
    '报表中心导出 OTD 改善复盘报告',
  ],
  sampleOrders: [
    { orderNumber: 'WO-RUSH-9001', productName: '急单阀体组件', dueDate: '2026-05-21', baselineStatus: 'delayed', agentStatus: 'recovered', risk: '急单插入 + M-AL-6061 缺料', action: '加班插入 + 采购加急' },
    { orderNumber: 'WO-DEMO-1002', productName: '传动轴总成 B', dueDate: '2026-05-22', baselineStatus: 'delayed', agentStatus: 'recovered', risk: '共享缺料', action: '收货后释放冻结工序' },
    { orderNumber: 'WO-DEMO-1001', productName: '精密轴承组件 A', dueDate: '2026-05-20', baselineStatus: 'on_time', agentStatus: 'on_time', risk: '瓶颈设备排队', action: '前置到 CNC 可用窗口' },
    { orderNumber: 'WO-DEMO-1007', productName: '液压阀体 C', dueDate: '2026-05-24', baselineStatus: 'delayed', agentStatus: 'recovered', risk: '热处理瓶颈', action: '批次合并减少换线' },
    { orderNumber: 'WO-DEMO-1013', productName: '法兰盘 DN100', dueDate: '2026-05-26', baselineStatus: 'delayed', agentStatus: 'delayed', risk: '外协等待', action: '保留延期并提示人工确认' },
  ],
}

const demoPocTemplate: PocEvaluationTemplate = {
  title: 'AI MES 交期改善 POC 评估模板',
  targetCustomer: '离散制造工厂：多品种小批量、插单频繁、设备瓶颈明显',
  duration: '2 周',
  passScore: 85,
  dimensions: [
    { name: 'OTD 改善', weight: 30, actualScore: 30, target: '30 单样本 OTD 提升 >= 10%', evidence: '报表中心 OTD 改善复盘报告与 CSV 导出' },
    { name: '事件闭环', weight: 25, actualScore: 24, target: '急单、缺料、设备故障均能触发 Agent 建议', evidence: 'AI 排产事件队列与采纳反馈记录', gap: '客户真实设备故障数据接入后可补满 1 分。' },
    { name: '执行回写', weight: 20, actualScore: 18, target: '生产完工、异常、采购收货能回写风险和复盘', evidence: '生产报工执行闭环与采购风险下降记录', gap: '客户真实工单导入样例未准备，执行回写证据还差 2 分。' },
    { name: '可解释与审计', weight: 15, actualScore: 15, target: '每个建议可解释、采纳/拒绝有原因', evidence: '调度员反馈、决策留痕和审计口径' },
    { name: '演示完整度', weight: 10, actualScore: 10, target: '5 分钟 demo 可从概览走到报表', evidence: '售前 Demo Checklist 全部完成' },
  ],
  evidenceChecklist: [
    { item: '30 单演示数据集与 OTD 基线', owner: '售前顾问', status: 'ready' },
    { item: '急单/缺料/设备三类事件截图', owner: '产品经理', status: 'ready' },
    { item: '采购加急单与收货回写记录', owner: '实施顾问', status: 'ready' },
    { item: '客户真实工单导入样例', owner: '客户 IT', status: 'pending' },
    { item: '客户真实设备故障数据', owner: '设备维护', status: 'pending' },
    { item: 'POC 复盘会评分表', owner: '项目经理', status: 'ready' },
  ],
  demoChecklist: [
    { step: '打开生产概览', proof: '展示今日风险、物料预警和排产状态', done: true },
    { step: '进入风险预警', proof: '说明急单、缺料、设备健康下降三类触发器', done: true },
    { step: '进入 AI 排产', proof: '生成 Agent 重排建议并展示 OTD 影响', done: true },
    { step: '处理采购缺料', proof: '生成加急采购单、模拟收货、风险下降', done: true },
    { step: '打开报表中心', proof: '展示 OTD +14% 改善报告并导出 CSV', done: true },
  ],
}
</script>

<style scoped>
.report-board { height: 100%; overflow-y: auto; padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 16px; font-weight: 700; margin: 0; }
.header-actions { display: flex; gap: 8px; }
.section { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.section h3 { font-size: 14px; margin: 0 0 12px; color: #333; }
.section-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.section-title-row h3 { margin-bottom: 0; font-size: 16px; }
.eyebrow { display: block; margin-bottom: 3px; color: #1d4ed8; font-size: 12px; font-weight: 700; }
.dataset-badge { padding: 5px 10px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; }
.otd-report-section { border: 1px solid #bfdbfe; background: #f8fbff; }
.poc-template-section { border: 1px solid #fed7aa; background: #fffaf5; }
.otd-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr); gap: 16px; margin-bottom: 14px; }
.hero-label { display: block; color: #4b5563; font-size: 12px; font-weight: 700; }
.otd-hero strong { display: block; color: #15803d; font-size: 42px; line-height: 1.1; }
.otd-hero p { margin: 6px 0 0; color: #374151; font-size: 13px; line-height: 1.55; }
.otd-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.otd-card { padding: 12px; border-radius: 6px; background: #fff; border: 1px solid #e5e7eb; }
.otd-card span, .otd-card em { display: block; color: #6b7280; font-size: 12px; font-style: normal; }
.otd-card strong { color: #111827; font-size: 26px; }
.otd-card.agent { border-color: #bbf7d0; background: #f0fdf4; }
.otd-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.metric-tile { padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #e5e7eb; }
.metric-tile label { display: block; color: #6b7280; font-size: 12px; }
.metric-tile strong { color: #111827; font-size: 20px; }
.quality-rework-report { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr); gap: 12px; margin-bottom: 14px; padding: 12px; border: 1px solid #fecaca; border-radius: 6px; background: #fff7f7; }
.quality-rework-report h4 { margin: 0 0 6px; color: #111827; font-size: 14px; }
.quality-rework-report p { margin: 0; color: #4b5563; font-size: 13px; line-height: 1.45; }
.eyebrow.danger { color: #be123c; }
.eyebrow.success { color: #047857; }
.rework-report-metrics { display: flex; flex-direction: column; gap: 4px; padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #fecaca; }
.rework-report-metrics span, .rework-report-metrics em { color: #6b7280; font-size: 12px; font-style: normal; }
.rework-report-metrics strong { color: #be123c; font-size: 18px; }
.quality-capa-report { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr); gap: 12px; margin-bottom: 14px; padding: 12px; border: 1px solid #bbf7d0; border-radius: 6px; background: #f0fdf4; }
.quality-capa-report h4 { margin: 0 0 6px; color: #111827; font-size: 14px; }
.quality-capa-report p { margin: 0; color: #4b5563; font-size: 13px; line-height: 1.45; }
.capa-report-metrics { display: flex; flex-direction: column; gap: 4px; padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #bbf7d0; }
.capa-report-metrics span, .capa-report-metrics em { color: #6b7280; font-size: 12px; font-style: normal; }
.capa-report-metrics strong { color: #047857; font-size: 18px; }
.quality-mrb-report { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr); gap: 12px; margin-bottom: 14px; padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-mrb-report h4 { margin: 0 0 6px; color: #111827; font-size: 14px; }
.quality-mrb-report p { margin: 0; color: #4b5563; font-size: 13px; line-height: 1.45; }
.eyebrow.warning { color: #c2410c; }
.mrb-report-metrics { display: flex; flex-direction: column; gap: 4px; padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #fed7aa; }
.mrb-report-metrics span, .mrb-report-metrics em { color: #6b7280; font-size: 12px; font-style: normal; }
.mrb-report-metrics strong { color: #c2410c; font-size: 18px; }
.mrb-report-metrics code { color: #1d4ed8; font-size: 12px; overflow-wrap: anywhere; }
.quality-learning-report { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; padding: 12px; border: 1px solid #a7f3d0; border-radius: 6px; background: #f0fdf4; }
.quality-learning-report h4 { margin: 0; color: #111827; font-size: 14px; }
.learning-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr); gap: 10px; padding: 10px; border: 1px solid #bbf7d0; border-radius: 6px; background: #fff; }
.learning-row strong { color: #111827; font-size: 13px; }
.learning-row p { margin: 4px 0 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.learning-meta { display: flex; flex-direction: column; justify-content: center; gap: 4px; color: #047857; font-size: 12px; }
.learning-meta code { color: #1d4ed8; font-family: monospace; font-size: 12px; }
.quality-gray-monitor-report { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-gray-monitor-report h4 { margin: 0; color: #111827; font-size: 14px; }
.gray-monitor-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.5fr); gap: 10px; padding: 10px; border: 1px solid #fdba74; border-radius: 6px; background: #fff; }
.gray-monitor-row strong { color: #111827; font-size: 13px; }
.gray-monitor-row p { margin: 4px 0 6px; color: #4b5563; font-size: 12px; line-height: 1.45; }
.gray-monitor-row code { color: #1d4ed8; font-family: monospace; font-size: 12px; overflow-wrap: anywhere; }
.gray-report-metrics { display: grid; gap: 5px; align-content: start; }
.gray-report-metrics span,
.gray-report-metrics em { padding: 5px 7px; border-radius: 4px; background: #ffedd5; color: #9a3412; font-size: 12px; font-style: normal; font-weight: 700; }
.quality-gray-decision-report { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; padding: 12px; border: 1px solid #fecaca; border-radius: 6px; background: #fff1f2; }
.quality-gray-decision-report h4 { margin: 0; color: #111827; font-size: 14px; }
.gray-decision-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.gray-decision-summary div { padding: 9px; border: 1px solid #fecaca; border-radius: 6px; background: #fff; }
.gray-decision-summary span { display: block; color: #64748b; font-size: 12px; }
.gray-decision-summary strong { display: block; margin-top: 2px; color: #be123c; font-size: 20px; }
.gray-cycle-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.gray-cycle-summary div { padding: 9px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.gray-cycle-summary span,
.gray-cycle-summary em { display: block; color: #9a3412; font-size: 12px; font-style: normal; }
.gray-cycle-summary strong { display: block; margin: 2px 0; color: #111827; font-size: 14px; }
.gray-decision-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.5fr); gap: 10px; padding: 10px; border: 1px solid #fecaca; border-radius: 6px; background: #fff; }
.gray-decision-row.expanded { border-color: #bbf7d0; background: #f0fdf4; }
.gray-decision-row strong { color: #111827; font-size: 13px; }
.gray-decision-row p { margin: 4px 0 6px; color: #4b5563; font-size: 12px; line-height: 1.45; }
.gray-decision-row code { color: #1d4ed8; font-family: monospace; font-size: 12px; overflow-wrap: anywhere; }
.quality-experiment-report { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; padding: 12px; border: 1px solid #bfdbfe; border-radius: 6px; background: #eff6ff; }
.quality-experiment-report h4 { margin: 0; color: #111827; font-size: 14px; }
.quality-experiment-candidate-report { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff7ed; }
.quality-experiment-candidate-report h4 { margin: 0; color: #111827; font-size: 14px; }
.experiment-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.candidate-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.experiment-card { display: flex; flex-direction: column; gap: 8px; min-height: 260px; padding: 10px; border: 1px solid #bfdbfe; border-radius: 6px; background: #fff; }
.candidate-card { display: flex; flex-direction: column; gap: 8px; min-height: 240px; padding: 10px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff; }
.experiment-card.accepted { border-color: #86efac; background: #f0fdf4; }
.experiment-card.guarded { border-color: #fecaca; background: #fff1f2; }
.experiment-card.logged { border-color: #fed7aa; background: #fff7ed; }
.candidate-card.accepted { border-color: #86efac; background: #f0fdf4; }
.candidate-card.guarded { border-color: #fecaca; background: #fff1f2; }
.candidate-card.logged { border-color: #fed7aa; background: #fff7ed; }
.experiment-topline { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: #4b5563; font-size: 12px; }
.experiment-topline em { padding: 2px 7px; border-radius: 4px; background: #dbeafe; color: #1d4ed8; font-style: normal; font-weight: 700; }
.experiment-card.accepted .experiment-topline em { background: #dcfce7; color: #15803d; }
.experiment-card.guarded .experiment-topline em { background: #ffe4e6; color: #be123c; }
.experiment-card.logged .experiment-topline em { background: #ffedd5; color: #9a3412; }
.experiment-card strong { color: #111827; font-size: 13px; }
.experiment-card p { margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.candidate-card strong { color: #111827; font-size: 13px; }
.candidate-card p { margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.experiment-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.candidate-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.experiment-metrics div { padding: 8px; border: 1px solid #dbeafe; border-radius: 4px; background: rgba(255, 255, 255, 0.8); }
.candidate-metrics div { padding: 8px; border: 1px solid #fed7aa; border-radius: 4px; background: rgba(255, 255, 255, 0.85); }
.experiment-metrics span { display: block; color: #64748b; font-size: 12px; }
.candidate-metrics span { display: block; color: #64748b; font-size: 12px; }
.experiment-metrics strong { display: block; margin-top: 2px; color: #111827; font-size: 18px; }
.candidate-metrics strong { display: block; margin-top: 2px; color: #111827; font-size: 13px; overflow-wrap: anywhere; }
.experiment-meta { display: flex; flex-direction: column; gap: 5px; margin-top: auto; }
.experiment-meta span,
.experiment-meta em { padding: 5px 7px; border-radius: 4px; background: rgba(255, 255, 255, 0.85); color: #374151; font-size: 12px; font-style: normal; font-weight: 700; }
.experiment-meta em.policy-accepted { color: #047857; }
.experiment-meta em.policy-guarded { color: #be123c; }
.experiment-meta em.policy-logged { color: #9a3412; }
.experiment-meta code { color: #1d4ed8; font-family: monospace; font-size: 12px; overflow-wrap: anywhere; }
.otd-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr); gap: 12px; margin-bottom: 14px; }
.reason-panel, .demo-path-panel, .sample-orders, .otd-evidence-chain { padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; }
.reason-panel h4, .demo-path-panel h4, .sample-orders h4, .otd-evidence-chain h4, .otd-kpi-drilldown-panel h4 { margin: 0 0 10px; font-size: 13px; color: #111827; }
.reason-row { display: grid; grid-template-columns: 120px 1fr; gap: 8px; padding: 7px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
.reason-row:last-child { border-bottom: none; }
.reason-row strong { color: #111827; }
.reason-row span, .demo-path-panel li, .sample-header span { color: #4b5563; }
.demo-path-panel ol { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.8; }
.otd-evidence-chain { margin-bottom: 14px; }
.otd-kpi-drilldown-panel { margin-bottom: 14px; padding: 12px; border: 1px solid #c7d2fe; border-radius: 6px; background: #fff; }
.kpi-drilldown-layout { display: grid; grid-template-columns: 120px minmax(260px, 0.8fr) minmax(0, 1fr); gap: 12px; align-items: stretch; }
.kpi-dimension-tabs { display: flex; flex-direction: column; gap: 7px; }
.kpi-dimension-tabs button { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 5px; background: #f9fafb; color: #374151; cursor: pointer; font-size: 12px; font-weight: 700; text-align: left; }
.kpi-dimension-tabs button.active { border-color: #2563eb; background: #eff6ff; color: #1d4ed8; }
.kpi-drilldown-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
.kpi-drilldown-card { display: flex; flex-direction: column; gap: 6px; min-height: 142px; padding: 10px; border: 1px solid #dbeafe; border-radius: 6px; background: #f8fbff; cursor: pointer; text-align: left; }
.kpi-drilldown-card.selected { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12); }
.kpi-drilldown-card.recovered { border-color: #bbf7d0; background: #f0fdf4; }
.kpi-drilldown-card.at_risk { border-color: #fed7aa; background: #fff7ed; }
.kpi-drilldown-card span { color: #6b7280; font-size: 12px; }
.kpi-drilldown-card strong { color: #111827; font-size: 14px; }
.kpi-drilldown-card p { margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.kpi-card-metrics { display: flex; flex-wrap: wrap; gap: 5px; }
.kpi-card-metrics em { padding: 2px 6px; border-radius: 4px; background: rgba(255, 255, 255, 0.85); color: #374151; font-size: 11px; font-style: normal; font-weight: 700; }
.kpi-drilldown-detail { display: flex; flex-direction: column; gap: 10px; min-height: 290px; padding: 12px; border: 1px solid #bfdbfe; border-radius: 6px; background: #f8fbff; }
.kpi-drilldown-detail h5 { margin: 0; color: #111827; font-size: 15px; }
.kpi-drilldown-detail p { margin: 0; color: #374151; font-size: 13px; line-height: 1.55; }
.kpi-detail-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.kpi-detail-metrics div, .kpi-root-cause, .kpi-next-actions { padding: 9px; border: 1px solid #dbeafe; border-radius: 5px; background: #fff; }
.kpi-detail-metrics span, .kpi-root-cause span, .kpi-next-actions span { display: block; color: #6b7280; font-size: 12px; }
.kpi-detail-metrics strong, .kpi-root-cause strong { display: block; margin-top: 3px; color: #111827; font-size: 14px; }
.kpi-detail-metrics strong { font-size: 20px; }
.kpi-next-actions ul { margin: 6px 0 0; padding-left: 18px; color: #374151; font-size: 12px; line-height: 1.55; }
.kpi-commitment-btn { width: fit-content; padding: 8px 11px; border: 1px solid #2563eb; border-radius: 5px; background: #2563eb; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; }
.kpi-commitment-card { display: flex; flex-direction: column; gap: 5px; padding: 10px; border: 1px solid #bbf7d0; border-radius: 5px; background: #f0fdf4; }
.kpi-commitment-card span { color: #15803d; font-size: 12px; font-weight: 700; }
.kpi-commitment-card strong { color: #14532d; font-size: 13px; }
.kpi-commitment-card p { margin: 0; color: #374151; font-size: 12px; line-height: 1.45; }
.kpi-commitment-card code { color: #1d4ed8; font-size: 12px; overflow-wrap: anywhere; }
.evidence-chain-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.evidence-chain-card { display: flex; flex-direction: column; gap: 8px; min-height: 168px; padding: 10px; border: 1px solid #dbeafe; border-radius: 6px; background: #f8fbff; cursor: pointer; text-align: left; }
.evidence-chain-card.selected { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14); }
.evidence-chain-card.closed { border-color: #bbf7d0; background: #f0fdf4; }
.evidence-chain-card.active { border-color: #fde68a; background: #fffbeb; }
.evidence-topline { display: flex; justify-content: space-between; gap: 8px; align-items: center; color: #4b5563; font-size: 12px; }
.evidence-topline em { padding: 2px 7px; border-radius: 3px; background: #eff6ff; color: #1d4ed8; font-style: normal; font-weight: 700; }
.evidence-chain-card.active .evidence-topline em { background: #fef3c7; color: #b45309; }
.evidence-chain-card.closed .evidence-topline em { background: #dcfce7; color: #15803d; }
.evidence-chain-card h5 { margin: 0; color: #111827; font-size: 13px; }
.evidence-chain-card p { margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.evidence-meta { display: flex; flex-direction: column; gap: 3px; margin-top: auto; color: #6b7280; font-size: 12px; }
.evidence-meta code { color: #1d4ed8; font-family: monospace; font-size: 12px; }
.otd-drilldown-panel { margin-bottom: 14px; padding: 12px; border: 1px solid #dbeafe; border-radius: 6px; background: #fff; }
.drilldown-layout { display: grid; grid-template-columns: minmax(260px, 0.45fr) minmax(0, 1fr); gap: 12px; }
.drilldown-list { display: flex; flex-direction: column; gap: 7px; }
.drilldown-row { display: flex; flex-direction: column; gap: 3px; width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 5px; background: #f9fafb; cursor: pointer; text-align: left; }
.drilldown-row.selected { border-color: #2563eb; background: #eff6ff; }
.drilldown-row span, .detail-topline span, .drilldown-detail-grid span, .drilldown-next-step span { color: #6b7280; font-size: 12px; }
.drilldown-row strong { color: #111827; font-size: 13px; }
.drilldown-row em { color: #4b5563; font-size: 12px; font-style: normal; }
.drilldown-detail { display: flex; flex-direction: column; gap: 10px; min-height: 230px; padding: 12px; border: 1px solid #bfdbfe; border-radius: 6px; background: #f8fbff; }
.detail-topline { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
.detail-topline code { color: #1d4ed8; font-size: 12px; overflow-wrap: anywhere; }
.drilldown-detail h5 { margin: 0; color: #111827; font-size: 15px; }
.drilldown-detail p { margin: 0; color: #374151; font-size: 13px; line-height: 1.55; }
.drilldown-detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.drilldown-detail-grid div, .drilldown-next-step { padding: 9px; border: 1px solid #dbeafe; border-radius: 5px; background: #fff; }
.drilldown-detail-grid strong, .drilldown-next-step strong { display: block; margin-top: 3px; color: #111827; font-size: 13px; }
.drilldown-next-step { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; align-items: center; margin-top: auto; }
.drilldown-next-step span { grid-column: 1 / -1; }
.drilldown-next-step a { padding: 6px 10px; border-radius: 4px; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.sample-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; }
.sample-orders table { width: 100%; border-collapse: collapse; font-size: 12px; }
.sample-orders th { padding: 7px; text-align: left; background: #f3f4f6; color: #374151; }
.sample-orders td { padding: 7px; border-bottom: 1px solid #f3f4f6; color: #374151; }
.status-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 11px; }
.status-pill.on_time { background: #f0fdf4; color: #15803d; }
.status-pill.delayed { background: #fff1f2; color: #be123c; }
.status-pill.recovered { background: #eff6ff; color: #1d4ed8; }
.status-pill.ready { background: #f0fdf4; color: #15803d; }
.status-pill.pending { background: #fffbeb; color: #b45309; }
.poc-summary { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr); gap: 10px; margin-bottom: 12px; }
.poc-summary div { padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #fed7aa; }
.poc-summary label { display: block; margin-bottom: 4px; color: #9a3412; font-size: 12px; font-weight: 700; }
.poc-summary strong { color: #111827; font-size: 14px; }
.poc-scorecard { display: grid; grid-template-columns: minmax(180px, 0.45fr) minmax(0, 1fr) minmax(260px, 0.75fr); gap: 12px; margin-bottom: 14px; }
.poc-score-main, .poc-score-bars, .poc-gap-panel { padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff; }
.poc-score-main { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.poc-score-main.pass { border-color: #bbf7d0; background: #f0fdf4; }
.poc-score-main span, .poc-score-main em { color: #6b7280; font-size: 12px; font-style: normal; }
.poc-score-main strong { color: #15803d; font-size: 34px; line-height: 1.1; }
.poc-score-bars { display: flex; flex-direction: column; gap: 8px; }
.score-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 10px; align-items: center; }
.score-row strong, .gap-row strong { display: block; color: #111827; font-size: 12px; }
.score-row span, .gap-row span { color: #4b5563; font-size: 12px; line-height: 1.35; }
.score-track { height: 8px; overflow: hidden; border-radius: 999px; background: #ffedd5; }
.score-track i { display: block; height: 100%; border-radius: inherit; background: #16a34a; }
.poc-gap-panel { display: flex; flex-direction: column; gap: 8px; }
.poc-gap-panel h4 { margin: 0; color: #111827; font-size: 13px; }
.gap-row { padding: 7px; border-radius: 4px; background: #fff7ed; }
.gap-row.ready { background: #f0fdf4; }
.gap-row a { display: inline-block; margin-top: 5px; color: #1d4ed8; font-size: 12px; font-weight: 700; text-decoration: none; }
.poc-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr); gap: 12px; margin-bottom: 14px; }
.poc-panel, .demo-checklist { padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff; }
.poc-panel h4, .demo-checklist h4 { margin: 0 0 10px; font-size: 13px; color: #111827; }
.poc-dimension { display: grid; grid-template-columns: minmax(0, 1fr) 56px; gap: 8px; padding: 8px 0; border-bottom: 1px solid #ffedd5; font-size: 12px; }
.poc-dimension:last-child { border-bottom: none; }
.poc-dimension strong, .evidence-row strong, .checklist-item strong { display: block; color: #111827; }
.poc-dimension span, .poc-dimension p, .checklist-item p { margin: 2px 0 0; color: #4b5563; }
.poc-dimension em { color: #c2410c; font-style: normal; font-weight: 700; text-align: right; }
.evidence-row { display: grid; grid-template-columns: 58px minmax(0, 1fr) 72px; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #ffedd5; font-size: 12px; }
.evidence-row:last-child { border-bottom: none; }
.evidence-row em { color: #6b7280; font-style: normal; text-align: right; }
.poc-package-banner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 0.45fr); gap: 12px; margin-bottom: 16px; padding: 12px 14px; border: 1px solid #86efac; border-radius: 6px; background: #f0fdf4; }
.poc-package-banner h4, .poc-package-banner p { margin: 0; }
.poc-package-banner h4 { color: #14532d; font-size: 14px; }
.poc-package-banner p { margin-top: 4px; color: #4b5563; font-size: 13px; line-height: 1.45; }
.poc-package-meta { display: flex; flex-direction: column; justify-content: center; gap: 4px; padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #bbf7d0; }
.poc-package-meta strong { color: #047857; font-size: 14px; }
.poc-package-meta span { color: #6b7280; font-size: 12px; }
.poc-review-panel, .poc-rollout-panel, .poc-pilot-panel, .poc-hypercare-panel { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr); gap: 12px; margin-bottom: 16px; padding: 12px 14px; border: 1px solid #bfdbfe; border-radius: 6px; background: #f8fbff; }
.poc-review-panel.signed { border-color: #86efac; background: #f0fdf4; }
.poc-rollout-panel.ready { border-color: #fed7aa; background: #fffaf5; }
.poc-pilot-panel.closed { border-color: #99f6e4; background: #f0fdfa; }
.poc-hypercare-panel.active { border-color: #a7f3d0; background: #ecfdf5; }
.poc-review-panel h4, .poc-review-panel p, .poc-rollout-panel h4, .poc-rollout-panel p, .poc-pilot-panel h4, .poc-pilot-panel p, .poc-hypercare-panel h4, .poc-hypercare-panel p { margin: 0; }
.poc-review-panel h4, .poc-rollout-panel h4, .poc-pilot-panel h4, .poc-hypercare-panel h4 { color: #111827; font-size: 14px; }
.poc-review-panel p, .poc-rollout-panel p, .poc-pilot-panel p, .poc-hypercare-panel p { margin-top: 4px; color: #4b5563; font-size: 13px; line-height: 1.45; }
.poc-review-meta, .poc-rollout-meta, .poc-pilot-meta, .poc-hypercare-meta { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #bfdbfe; }
.poc-review-panel.signed .poc-review-meta { border-color: #bbf7d0; }
.poc-rollout-panel.ready .poc-rollout-meta { border-color: #fed7aa; }
.poc-pilot-panel.closed .poc-pilot-meta { border-color: #99f6e4; }
.poc-hypercare-panel.active .poc-hypercare-meta { border-color: #a7f3d0; }
.poc-review-meta strong, .poc-rollout-meta strong, .poc-pilot-meta strong, .poc-hypercare-meta strong { color: #047857; font-size: 16px; }
.poc-review-meta span, .poc-review-meta em, .poc-rollout-meta span, .poc-rollout-meta em, .poc-pilot-meta span, .poc-pilot-meta em, .poc-hypercare-meta span, .poc-hypercare-meta em { color: #6b7280; font-size: 12px; font-style: normal; line-height: 1.35; }
.review-signoff-btn { padding: 6px 10px; border: 1px solid #16a34a; border-radius: 4px; background: #16a34a; color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; }
.poc-rollout-package { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding: 12px; border: 1px solid #fed7aa; border-radius: 6px; background: #fffaf5; }
.poc-rollout-package code { color: #c2410c; font-family: monospace; font-size: 12px; }
.rollout-action-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.rollout-action-card { display: flex; flex-direction: column; gap: 7px; min-height: 148px; padding: 10px; border: 1px solid #fed7aa; border-radius: 6px; background: #fff; }
.rollout-action-card .action-topline { display: flex; justify-content: space-between; gap: 8px; align-items: center; color: #9a3412; font-size: 12px; }
.rollout-action-card .action-topline em { padding: 2px 7px; border-radius: 3px; background: #ffedd5; color: #c2410c; font-style: normal; font-weight: 700; }
.rollout-action-card strong { color: #111827; font-size: 13px; }
.rollout-action-card p { flex: 1; margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.rollout-criteria { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.rollout-criteria span { padding: 8px 10px; border: 1px solid #ffedd5; border-radius: 6px; background: #fff; color: #7c2d12; font-size: 12px; line-height: 1.4; }
.poc-pilot-run-package { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding: 12px; border: 1px solid #99f6e4; border-radius: 6px; background: #f0fdfa; }
.poc-pilot-run-package code { color: #0f766e; font-family: monospace; font-size: 12px; }
.pilot-workorder-grid, .pilot-checkpoint-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.pilot-workorder-card, .pilot-checkpoint-card { display: flex; flex-direction: column; gap: 7px; min-height: 140px; padding: 10px; border: 1px solid #99f6e4; border-radius: 6px; background: #fff; }
.pilot-workorder-card .action-topline, .pilot-checkpoint-card .action-topline { display: flex; justify-content: space-between; gap: 8px; align-items: center; color: #0f766e; font-size: 12px; }
.pilot-workorder-card .action-topline em, .pilot-checkpoint-card .action-topline em { padding: 2px 7px; border-radius: 3px; background: #ccfbf1; color: #0f766e; font-style: normal; font-weight: 700; }
.pilot-workorder-card strong, .pilot-checkpoint-card strong { color: #111827; font-size: 13px; }
.pilot-workorder-card p, .pilot-checkpoint-card p { flex: 1; margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.pilot-workorder-card > span { color: #0f766e; font-size: 12px; font-weight: 700; line-height: 1.35; }
.poc-hypercare-package { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding: 12px; border: 1px solid #a7f3d0; border-radius: 6px; background: #ecfdf5; }
.poc-hypercare-package code { color: #047857; font-family: monospace; font-size: 12px; overflow-wrap: anywhere; }
.hypercare-monitor-grid, .hypercare-checkpoint-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.hypercare-checkpoint-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.hypercare-monitor-card, .hypercare-checkpoint-card { display: flex; flex-direction: column; gap: 7px; min-height: 128px; padding: 10px; border: 1px solid #a7f3d0; border-radius: 6px; background: #fff; }
.hypercare-monitor-card.watch { border-color: #fed7aa; background: #fffaf5; }
.hypercare-monitor-card .action-topline, .hypercare-checkpoint-card .action-topline { display: flex; justify-content: space-between; gap: 8px; align-items: center; color: #047857; font-size: 12px; }
.hypercare-monitor-card .action-topline em, .hypercare-checkpoint-card .action-topline em { padding: 2px 7px; border-radius: 3px; background: #d1fae5; color: #047857; font-style: normal; font-weight: 700; }
.hypercare-monitor-card.watch .action-topline, .hypercare-monitor-card.watch .action-topline em { color: #c2410c; }
.hypercare-monitor-card.watch .action-topline em { background: #ffedd5; }
.hypercare-monitor-card strong, .hypercare-checkpoint-card strong { color: #111827; font-size: 13px; }
.hypercare-monitor-card p, .hypercare-checkpoint-card p { flex: 1; margin: 0; color: #4b5563; font-size: 12px; line-height: 1.45; }
.customer-import-evidence { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr); gap: 12px; margin-bottom: 14px; padding: 12px; border: 1px solid #bbf7d0; border-radius: 6px; background: #f0fdf4; }
.customer-import-evidence h4, .customer-import-evidence p { margin: 0; }
.customer-import-evidence h4 { color: #111827; font-size: 14px; }
.customer-import-evidence p { color: #4b5563; font-size: 13px; line-height: 1.45; }
.import-evidence-meta { display: flex; flex-direction: column; gap: 4px; padding: 10px; border-radius: 6px; background: #fff; border: 1px solid #bbf7d0; }
.import-evidence-meta span, .import-evidence-meta em { color: #6b7280; font-size: 12px; font-style: normal; }
.import-evidence-meta strong { color: #047857; font-size: 18px; }
.checklist-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.checklist-item { display: flex; gap: 8px; min-height: 86px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; font-size: 12px; }
.checklist-item.done { border-color: #bbf7d0; background: #f0fdf4; }
.check-icon { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #16a34a; color: #fff; font-weight: 700; }
.half { flex: 1; }
.row-split { display: flex; gap: 16px; }
.kpi-row { display: flex; gap: 16px; margin-bottom: 12px; }
.kpi { flex: 1; }
.kpi label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.kpi .num { font-size: 22px; font-weight: 700; color: #333; }
.kpi .num.green { color: #52c41a; }
.kpi .num.blue { color: #1890ff; }
.kpi .num.red { color: #ff4d4f; }
.chart-wrap { overflow-x: auto; }
.chart { display: block; }

@media (max-width: 980px) {
  .kpi-drilldown-layout,
  .kpi-detail-metrics,
  .drilldown-layout,
  .drilldown-detail-grid,
  .drilldown-next-step {
    grid-template-columns: 1fr;
  }

  .kpi-dimension-tabs {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .drilldown-next-step a {
    justify-self: flex-start;
  }

  .poc-rollout-panel,
  .poc-pilot-panel,
  .poc-hypercare-panel,
  .poc-rollout-package .sample-header,
  .rollout-action-grid,
  .rollout-criteria,
  .pilot-workorder-grid,
  .pilot-checkpoint-grid,
  .hypercare-monitor-grid,
  .hypercare-checkpoint-grid {
    grid-template-columns: 1fr;
  }
}
</style>
