# 2026-06-02 Sprint 6 Code Hygiene

## 6.6 ScheduleFeedbackPanel Sync Note Status A11y

- 选片依据：采纳 Coverage-Leverage Routing，不再继续精修已高覆盖登录页，转向 `ScheduleBoard.vue` / `ScheduleFeedbackPanel.vue` 这类低覆盖且用户关键的排产链路。
- 业务价值：排产反馈同步状态发生在调度员采纳/拒绝 Agent 推荐后，是审计、模型复盘和后台反馈闭环的关键提示。
- 红灯：新增 `schedule-board.test.ts` 用真实 `ScheduleFeedbackPanel` 触发 `.btn.accept` 后，`.sync-note` 已显示 `反馈已同步后台`，但缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`ScheduleFeedbackPanel.vue` 的 `.sync-note` 增加 `role="status"` 和 `aria-live="polite"`，让同步成功提示以礼貌状态更新播报。
- 范围：只改变反馈同步提示的可访问性播报语义，不改变 `handleScheduleDecision`、本地 snapshot、后台 submit、fallback 文案或 Agent 采纳逻辑。
- 验证：目标 `schedule-board.test.ts` `4/4 passed`；相邻组合 `27/27 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 255 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 255 tests passed`。
- 覆盖率：总行/语句覆盖率 `78.05%`；`ScheduleBoard.vue` 行覆盖 `51.98%`；`ScheduleFeedbackPanel.vue` 行覆盖 `100%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍需真实证据。

## 6.6 AuditDecisionReplayPanel Approval Badge Status A11y

- 选片依据：`AuditDecisionReplayPanel.vue` 是审计回放/配置审批关键链路，当前覆盖率低于已精修组件；审批数量异步加载后变化，属于审计 reviewer 必须感知的状态。
- 红灯：扩展 `audit-decision-replay-panel.test.ts` 后，`.approval-badge` 文案已显示 `1 个配置待审批`，但缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`AuditDecisionReplayPanel.vue` 的 `.approval-badge` 增加 `role="status"` 和 `aria-live="polite"`，让待审批数量变化以礼貌状态更新播报。
- 范围：只改变审批数量 badge 的可访问性播报语义，不改变审批列表加载、pending 计数、配置审批回放、审计详情或业务落库回放逻辑。
- 验证：目标 `audit-decision-replay-panel.test.ts` `3/3 passed`；相邻 `audit-log-board.test.ts` + `assistant-action-audit.test.ts` 合计 `7/7 passed`；`npm run lint` 通过。
- 发布判断：本片继续属于 A 轨质量打磨；未重跑 coverage/full unit，不能替代 B 轨任何发布闸门证据。

## B 轨 Release Gate Evidence Refresh

- 目标：把 2026-06-02 当天的发布硬闸门状态重新落盘，避免继续引用 2026-06-01 的旧 fail-loud 报告。
- Hosted CI：运行 `scripts/run-hosted-ci-evidence.ps1 -ReportPath _docs/_reports/hosted-ci-20260602.md`，报告为 `Status: MISSING_REMOTE_RUN` / `Result: FAIL`；缺 `RunUrl`、`RunId`，且 `git ls-remote origin` 返回 `Git:Project not found.`，`gh run list` 需要 `gh auth login`。
- PostgreSQL/staging：运行 `scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260602-local.md -ReadyTimeoutSeconds 5`，报告为 `Result: FAIL`；失败点仍是本机没有 `docker` 命令。
- Attack Chain A/B/C：运行 `scripts/run-attack-chain-verification.ps1 -ReportPath _docs/_reports/attack-chain-verification-20260602.md`，报告为 `Status: PENDING_MANUAL_VERIFICATION` / `Result: FAIL`；缺 verifier、verified timestamp 和 A/B/C 三条人工证据。
- Gray observation：运行 `scripts/run-gray-observation.ps1 -ReportPath _docs/_reports/gray-observation-20260602.md`，报告为 `Status: NOT_STARTED` / `Result: FAIL`；首次灰度未开始。
- 发布判断：本片不关闭任何 B 轨闸门，只把当天真实缺口 fail loud。v1.0.0 仍缺 hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## B 轨 Release Gate Aggregate Audit

- 红灯：新增架构门 `ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 后，失败于缺少 `scripts/run-release-gate-audit.ps1`，说明 B 轨五个硬闸门仍分散在多个报告里，缺单一发布审计入口。
- 修复：新增 `scripts/run-release-gate-audit.ps1`，聚合 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、gray observation 五个闸门。
- 当前报告：运行 `scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 生成总报告；脚本按预期返回非 0，因为五个闸门均为 `FAIL`。
- 验证：目标架构门修复后通过，`1/1 passed`。
- 发布判断：该聚合报告让 B 轨缺口更好审计，但不关闭任何发布闸门；`_docs/_reports/release-gate-audit-20260602.md` 明确 `Result: FAIL` 和 `This report cannot close the v1.0.0 release gate.`

## B 轨 Security Signoff Packet Refresh

- 红灯：将架构门调整为要求 `_docs/_review/20260602-security-signoff.md` 后，`SecuritySignoff_ShouldHaveSelfAssessmentScriptAndUnsignedPacket` 失败于当天签字包缺失；聚合审计门同时失败于 `scripts/run-release-gate-audit.ps1` 未引用 `20260602-security-signoff`。
- 修复：新增 `_docs/_review/20260602-security-signoff.md`，保持 `Status: UNSIGNED` / `Decision: UNSIGNED`，并引用 2026-06-02 的 hosted CI、staging、Attack Chain、gray observation 和 aggregate release gate fail-loud 报告。
- 聚合更新：`scripts/run-release-gate-audit.ps1` 默认 `SecuritySignoffPath` 改为 `_docs/_review/20260602-security-signoff.md`，并重新生成 `_docs/_reports/release-gate-audit-20260602.md`。
- 验证：`SecuritySignoff_ShouldHaveSelfAssessmentScriptAndUnsignedPacket` + `ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 合计 `2/2 passed`。
- 发布判断：安全签字仍未关闭；该包只是把 2026-06-02 的 UNSIGNED 状态和 B 轨缺口对齐到当天证据。

## B 轨 Release Gate Evidence Packet Presence

- 红灯：扩展 `ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 后，架构门失败于聚合脚本/报告缺 `Evidence packet status`，说明总报告只列路径，未明示证据包是否真实存在。
- 修复：`scripts/run-release-gate-audit.ps1` 的总表新增 `Evidence packet status` 列，按文件存在性输出 `FOUND` / `MISSING`；报告增加 `Evidence packet status: FOUND or MISSING` 图例。
- 当前报告：重新生成 `_docs/_reports/release-gate-audit-20260602.md` 后，五个证据包均为 `FOUND`，五个发布闸门仍为 `FAIL`。
- 验证：目标架构门 `1/1 passed`；聚合脚本继续按预期返回非 0，因为发布闸门未关闭。
- 发布判断：本片只提升聚合审计可读性和缺文件可见性，不关闭任何 B 轨闸门。

## B 轨 Security Self-Assessment 20260602 Refresh

- 红灯：运行 `scripts/run-security-self-assessment.ps1 -ReportPath _docs/_reports/security-self-assessment-20260602-local.md` 首次失败于 `npm audit`，报告显示 `vitest` / `@vitest/coverage-v8` 为 critical，`vite` / `esbuild` 链路仍有 advisory。
- 修复：前端 devDependencies 升级 `vite` 到 `^6.4.2`，`vitest` 和 `@vitest/coverage-v8` 到 `^4.1.7`；`@vitest/coverage-v8@4.1.8` 在 registry 不存在，因此采用 registry 可解析的 `4.1.7`。
- 绿灯：`npm audit --audit-level=high --registry=https://registry.npmjs.org/` 返回 `found 0 vulnerabilities`；`npm run test:unit -- tests/unit/auth-token.test.ts` 在 Vitest `4.1.7` 下 `2/2 passed`；`npm run lint` 通过。
- 安全自评：重新运行 `scripts/run-security-self-assessment.ps1 -ReportPath _docs/_reports/security-self-assessment-20260602-local.md` 通过，报告为 `Result: PASS`；Unit security `50/50 passed`，Integration security `18/18 passed`，Architecture security gates `10/10 passed`，NuGet/npm audit exit code 均为 `0`。
- 签字包：`_docs/_review/20260602-security-signoff.md` 已改为引用 20260602 自动自评 PASS 报告，但仍保持 `Status: UNSIGNED` / `Decision: UNSIGNED`。
- 发布判断：自动安全自评阻断已刷新为 PASS；安全签字闸门仍缺 Attack Chain A/B/C 人工验证和 human signer。

## 6.6 AuditDecisionReplayPanel POC Signoff Replay Evidence Link

- 选片依据：继续执行 Coverage-Leverage Routing；`AuditDecisionReplayPanel.vue` 是审计回放/签字证据复核关键组件，上一轮仍低于多数已打开业务入口。本片转向 POC 签署回放分支，不继续做纯按钮语义微调。
- 红灯：新增 `audit-decision-replay-panel.test.ts` 用例注入 `readPocReviewSignoffRecordBackendFirst` 记录后，详情能显示 `POC 复盘会评分表签署 回放链` 和证据批次，但缺 `.trace-link`，失败于 `Unable to get .trace-link`。
- 修复：`mapPocReviewSignoffToReplay` 为 POC 签署回放补 `/report` route，携带 `auditObjectType=poc-review-signoff`、`auditObjectId`、`auditObjectLabel` 和 `auditTraceId`，并显示 `打开报表中心`。
- Vitest 4 回归修复：coverage 首次复跑暴露 `Html5Qrcode` 与 `Notification` mock 不能再用箭头函数作为可 `new` 构造器，以及 `BASE_URL` 未在相关测试中显式设为 `/scheduling/`；已把两个 mock 改为 function 构造器，并在 `offline-demo-mode.test.ts` / `notifications.store.test.ts` 设置 `vi.stubEnv('BASE_URL', '/scheduling/')`。
- 验证：目标审计组合 `audit-decision-replay-panel.test.ts` + `audit-log-board.test.ts` + `assistant-action-audit.test.ts` 合计 `11/11 passed`；红点组合 `scanner-board.test.ts` + `offline-demo-mode.test.ts` + `notifications.store.test.ts` 合计 `9/9 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`70 files / 256 tests passed`。
- 覆盖率：当前总行覆盖率 `55.31%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `62.06%`。该数值按当前 worktree 的 Vitest 4 coverage 输出如实记录。
- 发布判断：本片属于 A 轨质量打磨和前端测试基线修复；B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、security signoff、首次灰度和 14 天无 P0/P1 观察仍未关闭。

## 6.6 GanttChart Lightweight Marker A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`coverage-summary.json` 显示 `GanttChart.vue` 行覆盖为 `0.00%`，且该组件是 `/scheduling` 主排产视图和 Pareto 对比里的甘特图核心入口。
- 红灯：新增 `gantt-chart.test.ts`，开启 `VITE_SHOW_DEMO_HINTS=true` 走轻量甘特模式；`.gantt-e2e-markers` 已可见，但缺 `role="list"`，失败于 `expected undefined to be 'list'`。
- 修复：`GanttChart.vue` 的轻量 marker 容器增加 `role="list"` 和 `aria-label="轻量甘特图任务"`；每个 `.gantt_task_line` 增加 `role="listitem"` 和 `aria-label="甘特任务：<task.text>"`。
- 范围：只改变轻量甘特回退/演示 marker 的可访问语义，不触碰 dhtmlx 初始化、拖拽、锁定期计算、冲突检测或父组件事件。
- 验证：目标 `gantt-chart.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` + `gantt-mapper.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`71 files / 257 tests passed`。
- 覆盖率：总行覆盖率 `55.65%`；`GanttChart.vue` 从 `0.00%` 打开到 `17.85%`，函数覆盖 `18.91%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需真实外部/人工证据。

## 6.6 ChatPanel Modal Dialog A11y

- 选片依据：继续执行 Coverage-Leverage Routing；最新 coverage 显示 `ChatPanel.vue` 行覆盖约 `2.36%`、函数覆盖 `0%`，且它是主布局右下角 AI 生产助手入口，属于用户高频必经能力。
- 红灯：新增 `chat-panel.test.ts` 后，`.chat-panel` 缺少 `role="dialog"`，失败于 `expected undefined to be 'dialog'`。
- 修复：`ChatPanel.vue` 的面板增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="chat-panel-title"`；标题增加稳定 `id="chat-panel-title"`；输入框增加 `aria-label="输入生产相关问题"`。
- 范围：只改变 AI 生产助手面板和输入框的可访问语义，不触碰聊天历史加载、LLM 状态、知识检索、动作执行、导出、路由跳转或处置包同步逻辑。
- 验证：目标 `chat-panel.test.ts` `1/1 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`72 files / 258 tests passed`。
- 覆盖率：总行覆盖率 `55.92%`；`ChatPanel.vue` 行覆盖率从约 `2.36%` 提升到 `7.69%`，函数覆盖率 `3.63%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、security signoff、首次灰度和 14 天无 P0/P1 观察仍未关闭。

## 6.6 ScheduleAgentWorkbenchPanel Action Status A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleAgentWorkbenchPanel.vue` 行覆盖 `16.47%`、函数/分支覆盖 `0%`，且该组件是 AI 排产工作台的后端建议、采纳、拒绝入口。
- 红灯：新增 `schedule-agent-workbench-panel.test.ts` 触发 `生成后端建议` 后，`.agent-action-note` 已显示 `后端已生成 2 个方案`，但缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`ScheduleAgentWorkbenchPanel.vue` 的 `.agent-action-note` 增加 `role="status"` 和 `aria-live="polite"`，让后端建议生成/采纳/拒绝结果以礼貌状态更新播报。
- 范围：只改变 Agent 动作反馈文案的可访问性播报语义，不改变 `recommendAgentDecision` 请求、后端决策加载、采纳/拒绝 API、方案比较或执行追踪逻辑。
- 验证：目标 `schedule-agent-workbench-panel.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`73 files / 259 tests passed`。
- 覆盖率：总行覆盖率 `56.55%`；`ScheduleAgentWorkbenchPanel.vue` 行覆盖率从 `16.47%` 提升到 `81.17%`，函数覆盖率 `80.76%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。

## 6.6 QualityCapaTaskPanel Open Count Status A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`QualityCapaTaskPanel.vue` 行覆盖 `17.82%`、函数/分支覆盖 `0%`，且该组件承载质量 CAPA 待验证任务、复用草案转正式 CAPA、效果回写等关键闭环。
- 红灯：新增 `quality-capa-task-panel.test.ts` 挂载默认 CAPA 面板后，`.status-badge` 已显示 `3 个待验证`，但缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`QualityCapaTaskPanel.vue` 的 `.status-badge` 增加 `role="status"` 和 `aria-live="polite"`，让待验证 CAPA 数量以礼貌状态更新播报。
- 范围：只改变 CAPA 待验证数量 badge 的可访问性播报语义，不改变 CAPA 推进、正式 CAPA 转换、低分复核、推荐采纳、助手执行包质量责任闭环或 OTD 证据写入逻辑。
- 验证：目标 `quality-capa-task-panel.test.ts` `1/1 passed`；相邻 `quality-board.test.ts` + `quality-capa-sync.test.ts` 合计 `5/5 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`74 files / 260 tests passed`。
- 覆盖率：总行覆盖率 `56.87%`；`QualityCapaTaskPanel.vue` 行覆盖率从 `17.82%` 提升到 `45.00%`，函数覆盖率 `26.47%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。

## 6.6 ParetoCompare Modal Dialog A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`ParetoCompare.vue` 行覆盖 `11.11%`、函数/分支覆盖 `0%`，且它是 AI 排产多目标方案对比和采用推荐方案的关键浮层。
- 红灯：新增 `pareto-compare.test.ts` 挂载可见浮层后，`.compare-container` 缺少 `role="dialog"`；失败点为 `expected undefined to be 'dialog'`。
- 修复：`ParetoCompare.vue` 的对比浮层容器增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="pareto-compare-title"`；标题增加稳定 id；关闭按钮增加 `aria-label="关闭多目标方案对比"`。
- 范围：只改变多目标方案对比浮层和关闭按钮的可访问语义，不改变批量优化请求、demo fallback、雷达图、KPI 表格、tab 切换、甘特图数据转换或方案采用事件。
- 验证：目标 `pareto-compare.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`75 files / 261 tests passed`。
- 覆盖率：总行覆盖率 `57.07%`；`ParetoCompare.vue` 行覆盖率从 `11.11%` 提升到 `21.73%`，语句覆盖率 `20.68%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。

## 6.6 EquipmentScheduleImpactPanel Downtime Sync Status A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`EquipmentScheduleImpactPanel.vue` 行覆盖 `26.31%`、函数/分支覆盖 `0%`，且它是设备停机事件同步 AI 排产和 OTD 证据链的关键入口。
- 红灯：新增 `equipment-schedule-impact-panel.test.ts` 触发 `标记故障并同步排产` 后，`.sync-note` 已显示 `设备故障已同步 AI 排产`，但缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`EquipmentScheduleImpactPanel.vue` 的 `.sync-note` 增加 `role="status"` 和 `aria-live="polite"`，让设备故障同步结果以礼貌状态更新播报。
- 范围：只改变设备故障同步结果的可访问性播报语义，不改变 `writeEquipmentDowntimeEvent`、OTD 证据链写入、客户故障样例生成、异常分流维护单或后台读取逻辑。
- 验证：目标 `equipment-schedule-impact-panel.test.ts` `1/1 passed`；相邻 `equipment-board.test.ts` + `equipment-risk-sync.test.ts` 合计 `10/10 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`76 files / 262 tests passed`。
- 覆盖率：总行覆盖率 `57.24%`；`EquipmentScheduleImpactPanel.vue` 行覆盖率从 `26.31%` 提升到 `64.86%`，函数覆盖率 `66.66%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。

## 6.6 ChatPanel Message Log A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 行覆盖仍只有 `7.69%`，且 AI 生产助手是主布局高频入口。本片只补消息区读屏语义，不继续扩大业务分支。
- 红灯：在 `chat-panel.test.ts` 新增消息区用例后，`.chat-messages` 缺少 `role="log"`；失败点为 `expected undefined to be 'log'`。
- 修复：`ChatPanel.vue` 的 `.chat-messages` 增加 `role="log"`、`aria-live="polite"` 和 `aria-label="AI 生产助手消息"`，让助手对话更新以礼貌消息日志暴露给辅助技术。
- 范围：只改变消息列表容器的可访问语义，不改变历史加载、LLM 状态、知识检索、发送消息、动作执行、路由跳转或证据同步逻辑。
- 验证：目标 `chat-panel.test.ts` `2/2 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`76 files / 263 tests passed`。
- 覆盖率：总行覆盖率仍为 `57.24%`；`ChatPanel.vue` 行覆盖率仍为 `7.69%`，函数覆盖率 `3.63%`。本片提升语义质量，覆盖率增量为 `0.00` 个点。
- 发布判断：本片属于 A 轨质量打磨；B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍未关闭。

## 6.6 FeedbackForm Submission Failure Alert A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`FeedbackForm.vue` 行覆盖 `21.42%`、函数覆盖 `0%`，且它是 AI 排产方案采纳反馈的关键失败回路，比继续精修高覆盖登录页或纯模板属性更有发布就绪收益。
- 红灯：新增 `feedback-form.test.ts` 覆盖采纳反馈提交失败；首轮修正 Teleport 测试夹具后，错误文案已出现但缺少 `[role="alert"]`，失败于 `Unable to get [role="alert"]`。
- 修复：`FeedbackForm.vue` 的 `.error-msg` 增加 `role="alert"` 和 `aria-live="assertive"`；同时保留既有 `errorMessage(e, '未知错误')` 错误归一化，避免继续使用 `any`。
- 范围：只改变提交失败错误提示的可访问播报语义和错误消息提取方式，不改变 `submitAdoptionFeedback` payload、提交按钮禁用规则、成功事件、关闭事件或排产主页面弹窗控制。
- 验证：目标 `feedback-form.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 264 tests passed`。
- 覆盖率：总行覆盖率从 `57.24%` 提升到 `57.49%`；`FeedbackForm.vue` 行覆盖率从 `21.42%` 提升到 `85.71%`，函数覆盖率从 `0%` 提升到 `57.14%`。
- 发布判断：本片属于 A 轨质量打磨；`scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍按预期失败，B 轨发布闸门未关闭。

## 6.6 DocumentUpload Customer Import Status A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 行覆盖 `30.28%`、函数覆盖 `16.39%`，且客户真实工单导入样例是 POC 数据缺口和验收证据链关键入口。
- 红灯：扩展 `document-upload.test.ts`，点击 `生成客户工单导入样例` 后，导入批次、30 单和 6 单高风险已显示，但 `.import-metrics` 缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`DocumentUpload.vue` 的 `.import-metrics` 增加 `role="status"` 和 `aria-live="polite"`，让生成客户工单导入证据后的批次、订单数和高风险识别结果以礼貌状态更新播报。
- 范围：只改变客户工单导入指标块的可访问播报语义；不改变 `writeCustomerOrderImportEvidence`、历史记录写入、治理文档插入、后台优先读取或质量知识治理事件。
- 验证：目标 `document-upload.test.ts` `3/3 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 265 tests passed`。
- 覆盖率：总行覆盖率从 `57.49%` 提升到 `57.53%`；`DocumentUpload.vue` 行覆盖率从 `30.28%` 提升到 `34.48%`，函数覆盖率从 `16.39%` 提升到 `21.31%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ParetoCompare Demo Fallback Recommendation A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`ParetoCompare.vue` 行覆盖 `21.73%`、函数覆盖 `1.96%`，且多目标方案对比是 AI 排产采用推荐方案的关键浮层。
- 红灯：扩展 `pareto-compare.test.ts`，将 `batchOptimize` mock 为失败并模拟浮层从隐藏到打开，组件走 demo fallback 后推荐卡片已显示 `综合平衡`，但 `.recommend-card` 缺少 `role="status"`；失败点为 `expected undefined to be 'status'`。
- 修复：`ParetoCompare.vue` 的 `.recommend-card` 增加 `role="status"` 和 `aria-live="polite"`，让后端失败 fallback 生成的推荐方案以礼貌状态更新播报。
- 范围：只改变推荐卡片播报语义；不改变 `batchOptimize` 请求、demo fallback 数据、雷达/KPI 归一化、甘特数据转换或 `apply` 事件 payload。
- 验证：目标 `pareto-compare.test.ts` `2/2 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 266 tests passed`。
- 覆盖率：总行覆盖率从 `57.53%` 提升到 `58.79%`；`ParetoCompare.vue` 行覆盖率从 `21.73%` 提升到 `90.06%`，函数覆盖率从 `1.96%` 提升到 `86.27%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨发布证据仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## 6.6 ChatPanel Send Path Source Disclosure A11y

- 选片依据：采纳 Coverage-Leverage Routing；`ChatPanel.vue` 行覆盖仍仅 `7.69%`，且 AI 生产助手是主布局高频入口。本片不再做纯模板微属性，转向用户真实发送问题、调用知识检索、渲染助手回答和参考来源的业务路径。
- 红灯：扩展 `chat-panel.test.ts`，输入 `当前产能如何？` 并点击发送后，`queryKnowledge` 已被调用且后端回答/来源已渲染，但来源开关仍是不可自然键盘聚焦的 `span`；失败点为 `Unable to get button.sources-toggle`。
- 修复：`ChatPanel.vue` 将 `.sources-toggle` 从 `span` 改为 `button type="button"`，增加 `aria-expanded`，并用最小 CSS 重置按钮默认外观，保留原有来源展开逻辑。
- 范围：只改变参考来源开关的可聚焦语义和按钮默认样式，不改变 `queryKnowledge` payload、sessionId 生成、demo fallback、动作生成、历史加载、路由跳转或证据同步逻辑。
- 验证：目标 `chat-panel.test.ts` `3/3 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 267 tests passed`。
- 覆盖率：总行覆盖率从 `58.79%` 提升到 `59.99%`；`ChatPanel.vue` 行覆盖率从 `7.69%` 提升到 `28.20%`，函数覆盖率从 `3.63%` 提升到 `26.36%`。
- 发布判断：本片属于 A 轨质量打磨；`scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 GanttChart Drag Conflict Coverage

- 选片依据：继续执行 Coverage-Leverage Routing；`GanttChart.vue` 行覆盖约 `15.47%`，且真实 dhtmlx 甘特拖拽冲突是 AI 排产主流程里的关键交互，优先级高于继续精修高覆盖组件。
- 红灯：扩展 `gantt-chart.test.ts` 时先暴露测试夹具问题：真实 dhtmlx 分支会调用 `isOfflineDemoMode()`，当前 Vitest 环境的 `localStorage` 不完整，失败于 `localStorage.clear/getItem is not a function`；修正夹具后，拖拽冲突业务断言通过，说明生产逻辑已有对应能力。
- 修复：仅调整测试夹具，hoist dhtmlx mock、记录 `attachEvent` handler，并 mock `isOfflineDemoMode=false`，让测试可进入真实 dhtmlx 分支；未修改 `GanttChart.vue` 生产代码。
- 范围：新增覆盖 `onAfterTaskDrag` 同设备时间重叠路径，断言 `taskDragConflict`、`taskDragEnd`、错误消息和 `gantt.render()`；不改变拖拽锁定期、实时拖拽标记、scale 切换、数据 parse 或轻量甘特 marker。
- 验证：目标 `gantt-chart.test.ts` `2/2 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 268 tests passed`。
- 覆盖率：总行覆盖率从 `59.99%` 提升到 `60.67%`；`GanttChart.vue` 行覆盖率从 `15.47%` 提升到 `51.19%`，函数覆盖率 `40.54%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨发布证据仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## 6.6 DocumentUpload Successful Upload Coverage

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 行覆盖 `34.48%`，且知识文档成功上传、分块索引结果入历史记录是 POC 知识入库和 RAG 治理的关键路径。
- 红灯/GREEN：扩展 `document-upload.test.ts`，hoist `uploadDocument` mock 后添加 PDF 成功上传用例；目标测试直接 GREEN，说明生产逻辑已支持队列入库、API 调用、状态变更和历史记录插入。本片为覆盖增量，无生产代码修改。
- 覆盖内容：选择 `质量作业指导书.pdf` 后点击 `开始上传`，断言 `uploadDocument(file, undefined)`、队列状态 `已上传`、上传记录包含文件名、分块数 `12` 和后端状态 `indexed`。
- 范围：只改变测试，不改变文件校验、上传 API、进度模拟、治理文档插入、客户工单导入样例或质量知识治理事件。
- 验证：目标 `document-upload.test.ts` `4/4 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 269 tests passed`。
- 覆盖率：总行覆盖率从 `60.67%` 提升到 `60.94%`；`DocumentUpload.vue` 行覆盖率从 `34.48%` 提升到 `47.70%`，函数覆盖率 `29.50%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨发布证据仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## 6.6 ProductionBoard Scan API Success Selection

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 行覆盖 `39.51%`，且扫码/输入工单号或工序码是生产执行现场的高频必经路径。
- 红灯：扩展 `production-board.test.ts`，mock `scanOperation('WO-020-OP-20', 'operator1')` 成功返回 `WO-020 / OP-20` 后，右侧仍停留在 `选择工单或扫码开始`，失败点为 `Unable to get .detail-title-row h3`。根因是 `handleScan()` 成功扫到后端工序后只设置 `currentOperations` 就返回，未选中对应工单，工序列表也无法渲染。
- 修复：`handleScan()` 在后端扫码成功后按 `workOrderId` 或 `workOrderNumber` 匹配本地工单并设置 `selectedWo`，同时清空扫码输入并用 `notify("已定位工序：WO-020 / OP-20")` 以 `role="status"` 播报。
- 范围：只改变扫码 API 成功路径的工单定位和成功提示；不改变本地工单搜索、扫码失败提示、开工/完工/异常报工、资质拦截或条码证据写入逻辑。
- 验证：目标 `production-board.test.ts` `4/4 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 270 tests passed`。
- 覆盖率：本次全量总行覆盖为 `60.92%`；`ProductionBoard.vue` 行覆盖从 `39.51%` 提升到 `40.63%`，函数覆盖率从 `35.45%` 提升到 `36.03%`。全量总行覆盖相对上一轮 `60.94%` 轻微波动，以本轮 fresh coverage 为准。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨发布证据仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## 6.6 PurchaseBoard Confirm Status Sync

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 行覆盖约 `45.34%`、函数覆盖约 `22.66%`，且采购单确认是采购主流程的用户必经动作，优先级高于继续精修已高覆盖组件。
- 红灯：扩展 `purchase-board.test.ts`，mock `confirmPurchaseOrder('po-b')` 成功返回 `Confirmed`，但 `refreshList()` 仍返回旧的 `Submitted` 列表快照；右侧详情已显示 `已确认`，左侧活动订单仍显示 `已提交`，失败点为 `expected '已提交' to be '已确认'`。
- 修复：`handleConfirm()` 在确认接口成功或 demo fallback 后先刷新列表，再用当前确认返回的 `selected` 详情覆盖同一订单的列表摘要，保证用户眼前的详情和列表状态一致。
- 范围：只改变采购单确认后的本地列表状态同步；不改变建单、提交、收货、取消、分页、审计回放定位、短缺风险或供应网络治理逻辑。
- 验证：目标 `purchase-board.test.ts` `3/3 passed`；相邻采购短缺同步测试实际运行 `shortage-risk-sync.test.ts` `9/9 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 271 tests passed`。
- 覆盖率：总行覆盖从 `60.92%` 提升到 `61.09%`；`PurchaseBoard.vue` 行覆盖提升到 `48.84%`，函数覆盖提升到 `27.63%`。
- 发布判断：本片属于 A 轨质量打磨；`scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 GanttToolbar Explicit Action Buttons

- 选片依据：继续执行 Coverage-Leverage Routing；`GanttToolbar.vue` 行覆盖 `41.66%`、函数覆盖 `0%`，且它是排产页优化、刷新、反馈、多目标对比和导出的主操作入口。
- 红灯：新增 `gantt-toolbar.test.ts` 后，首个工具栏按钮缺少显式 `type`，失败点为 `expected undefined to be 'button'`。这说明工具栏若未来被放入表单上下文，按钮会按 HTML 默认行为成为 submit。
- 修复：为 `排产优化`、`刷新`、`采纳反馈`、`多目标对比`、`导出 CSV` 五个操作按钮增加 `type="button"`，并用测试覆盖五个事件和两个 select 更新事件。
- 范围：只改变按钮默认类型，保留所有事件名、props、loading 禁用、文案、样式和父组件契约。
- 验证：目标 `gantt-toolbar.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`78 files / 272 tests passed`。
- 覆盖率：总行覆盖从 `61.09%` 提升到 `61.17%`；`GanttToolbar.vue` 行覆盖从 `41.66%` 提升到 `100%`，函数覆盖从 `0%` 提升到 `100%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ScheduleMetrics KPI Status A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleMetrics.vue` 行覆盖 `43.75%`、函数覆盖 `0%`，且设备利用率、准交率、换线时间和批次组数是排产页首屏 KPI。
- 红灯：新增 `schedule-metrics.test.ts` 后，`.metrics-bar` 缺少状态播报语义，失败点为 `expected undefined to be 'status'`。
- 修复：为 `.metrics-bar` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="排产指标"`，让 KPI 变化以礼貌状态更新暴露给辅助技术。
- 范围：只改变 KPI 容器可访问语义；不改变阈值颜色、数值格式、布局、排产主页面数据流或指标计算。
- 验证：目标 `schedule-metrics.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`79 files / 273 tests passed`。
- 覆盖率：总行覆盖从 `61.17%` 提升到 `61.25%`；`ScheduleMetrics.vue` 行覆盖从 `43.75%` 提升到 `87.50%`，函数覆盖从 `0%` 提升到 `100%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ScheduleRecoveryHandoffPanel Status Coverage

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleRecoveryHandoffPanel.vue` 行覆盖约 `61.90%`、函数覆盖 `0%`，且交期恢复执行包交接是急单恢复、采购、质量和风险闭环的关键可见入口。
- 红灯：新增 `schedule-recovery-handoff-panel.test.ts` 后，执行包面板缺少状态播报语义，失败点为 `expected undefined to be 'status'`。
- 修复：为 `.recovery-handoff-panel` 增加 `role="status"` 和 `aria-live="polite"`；测试同时覆盖活动建议、人工反馈显示和 `close-handoff` 事件。
- 范围：只改变执行包面板的可访问状态语义；不改变 active package 选择、闭环按钮条件、事件 payload、执行步骤渲染或父组件闭环流程。
- 验证：目标 `schedule-recovery-handoff-panel.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`80 files / 274 tests passed`。
- 覆盖率：总行覆盖从 `61.25%` 提升到 `61.34%`；`ScheduleRecoveryHandoffPanel.vue` 行覆盖提升到 `100%`，函数覆盖提升到 `100%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ScheduleEventQueuePanel Agent Suggestion Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleEventQueuePanel.vue` 行覆盖约 `66.66%`、函数覆盖 `0%`，且事件生成/采纳 Agent 建议是 AI 排产主流程关键交互。
- 红灯：新增 `schedule-event-queue-panel.test.ts` 后，当前 Agent 建议区域缺少状态播报语义，失败点为 `expected undefined to be 'status'`。
- 修复：为 `.agent-suggestion` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="当前 Agent 建议"`；测试同时覆盖事件 `generate` 和建议 `adopt` payload。
- 范围：只改变 Agent 建议区域可访问语义；不改变事件卡片、推荐方案包、采纳按钮、事件 payload 或父组件建议生成/采纳逻辑。
- 验证：目标 `schedule-event-queue-panel.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 275 tests passed`。
- 覆盖率：总行覆盖从 `61.34%` 提升到 `61.41%`；`ScheduleEventQueuePanel.vue` 行覆盖提升到 `100%`，函数覆盖提升到 `100%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门聚合脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 KnowledgeGovernancePanel Risk Badge Status A11y

- 选片依据：`KnowledgeGovernancePanel.vue` 覆盖率仍低，但本片只是风险数量 badge 的语义补强；按 Coverage-Leverage Routing 记录为质量收口，不应继续在同一组件做零增量模板微切片。
- 红灯：扩展 `knowledge-governance-panel.test.ts` 后，`.risk-badge` 已显示过期风险数量，但缺少状态播报语义，失败点为 `expected undefined to be 'status'`。
- 修复：为 `.risk-badge` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="知识库过期风险数量"`，让知识库过期风险数量以礼貌状态更新播报。
- 范围：只改变风险数量 badge 的可访问语义；不改变文档评审、质量资产生命周期、引用追溯、训练灰度、证据同步或知识库治理业务逻辑。
- 验证：目标 `knowledge-governance-panel.test.ts` `2/2 passed`；相邻 `document-upload.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 275 tests passed`。
- 覆盖率：fresh coverage 总行覆盖 `61.40%`，相对上一轮 `61.41%` 轻微波动下行；`KnowledgeGovernancePanel.vue` 行覆盖 `36.63%`，函数覆盖 `29.82%`。本片是语义质量改进，没有产生有意义的覆盖率增量。
- 发布判断：本片属于 A 轨质量打磨；发布闸门审计仍为 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 DocumentUpload Upload Failure Alert A11y

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 行覆盖 `47.70%`，且知识文档上传失败是 RAG 入库和治理队列的用户关键失败路径。
- 红灯：扩展 `document-upload.test.ts` 后，mock `uploadDocument` 抛出 `索引服务不可用`，队列行已显示错误文本，但 `.status-err` 缺少 `role="alert"`；失败点为 `expected undefined to be 'alert'`。
- 修复：为上传队列错误状态 `.status-err` 增加 `role="alert"` 和 `aria-live="assertive"`，让单文件上传失败能被辅助技术立即感知。
- 范围：只改变上传失败队列行的可访问播报语义；不改变文件校验、上传 API payload、进度模拟、成功历史记录、客户工单导入或知识治理事件。
- 验证：目标 `document-upload.test.ts` `5/5 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 276 tests passed`。
- 覆盖率：总行覆盖从 `61.40%` 提升到 `61.44%`；`DocumentUpload.vue` 行覆盖从 `47.70%` 提升到 `49.42%`，函数覆盖保持 `29.50%`。
- 发布判断：本片属于 A 轨质量打磨；`scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ProductionBoard Start API Failure Guard

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 行覆盖 `40.63%`，且现场开工是生产执行用户必经路径，优先级高于继续精修已高覆盖组件。
- 红灯：扩展 `production-board.test.ts` 后，mock `startOperation` 抛出 `设备 CNC-002 已被占用`，界面仍把待生产工序推进为 `生产中`；失败点为 `expected '生产中' to be '待生产'`。
- 修复：`confirmStart()` 捕获开工 API 异常后用 `errorMessage` 归一化错误并 `notify("开工失败：...","error")`，随后立即返回，不再推进本地工序/工单状态或写入开工追踪。
- 范围：只改变开工 API 失败路径；不改变资质阻断、开工成功、扫码开工证据、人员替班证据、完工质量门、异常上报或 OTD 证据链。
- 验证：目标 `production-board.test.ts` `5/5 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 277 tests passed`。
- 覆盖率：总行覆盖从 `61.44%` 提升到 `61.68%`；`ProductionBoard.vue` 行覆盖从 `40.63%` 提升到 `44.84%`，函数覆盖从 `36.03%` 提升到 `37.83%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门审计脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ProductionBoard Completion API Failure Guard

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 仍低于多数已打磨组件，且完工报数会触发质量门、生产复核和 OTD 证据链，属于现场生产执行关键路径。
- 红灯：扩展 `production-board.test.ts` 后，mock `completeOperation` 抛出 `质检结果未同步`，界面仍把生产中工序推进为 `已完成`；失败点为 `expected '已完成' to be '生产中'`。
- 修复：`confirmComplete()` 捕获完工 API 异常后用 `errorMessage` 归一化错误并 `notify("完工失败：...","error")`，随后立即返回，不再推进本地完工、质量联动、生产复核或 OTD 证据写入。
- 范围：只改变完工 API 失败路径；不改变完工成功、质量门放行/冻结、扫码完工、工序交接、生产复核、异常上报或条码证据链。
- 验证：目标 `production-board.test.ts` `6/6 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 278 tests passed`。
- 覆盖率：总行覆盖从 `61.68%` 提升到 `61.94%`；`ProductionBoard.vue` 行覆盖从 `44.84%` 提升到 `49.40%`，函数覆盖从 `37.83%` 提升到 `40.54%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门审计脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ProductionBoard Exception API Failure Guard

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 仍是低覆盖且用户必经的现场执行主页面，异常上报会联动异常管理、排产风险和 OTD 复盘。
- 红灯：扩展 `production-board.test.ts` 后，mock `reportException` 抛出 `异常服务不可用`，组件在后端失败前已经调用 `writeProductionAnomalyEvent` 写入本地异常证据；失败点为 `expected "vi.fn()" to not be called at all`。
- 修复：`confirmException()` 先调用 `reportException`，捕获异常后用 `errorMessage` 归一化并 `notify("异常上报失败：...","error")` 后立即返回；只有后端异常上报成功后才写本地异常事件、扫码异常证据、风险追踪和 OTD 证据链。
- 范围：只改变异常上报 API 失败路径；不改变异常上报成功、扫码异常证据、风险追踪、生产异常同步、开工/完工失败保护或质量门逻辑。
- 验证：目标 `production-board.test.ts` `7/7 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 279 tests passed`。
- 覆盖率：总行覆盖从 `61.94%` 提升到 `62.16%`；`ProductionBoard.vue` 行覆盖从 `49.40%` 提升到 `53.34%`，函数覆盖从 `40.54%` 提升到 `44.14%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门审计脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 PurchaseBoard Cancellation API Failure Guard

- 选片依据：采纳 Coverage-Leverage Routing；`PurchaseBoard.vue` 上轮行覆盖约 `48.84%`，采购取消是采购主流程关键失败路径，优先级高于继续精修已覆盖组件。
- 红灯：扩展 `purchase-board.test.ts` 后，mock `cancelPurchaseOrder('po-a')` 抛出 `供应商已发运，禁止取消`，界面仍把采购单从 `已确认` 推进为 `已取消`；失败点为 `expected '已取消' to be '已确认'`。
- 修复：`handleCancel()` 在取消 API 异常时用 `errorMessage` 归一化失败原因，显示 `取消失败：...` 的 `role="alert"` 提示并立即返回，不再推进本地状态或刷新列表。
- 范围：只改变采购单取消 API 失败路径；不改变建单、提交、确认、收货、短缺风险、供应网络治理、外协到货或审计回放定位逻辑。
- Coverage 稳定性修复：全量 coverage 首次复跑时 280 个测试本体均通过，但 `schedule-board.test.ts` 的异步 `GanttChart.vue` CSS import 在 teardown 后触发 3 个 unhandled errors；已在 `schedule-board.test.ts` 顶层 mock `GanttChart.vue`，让排产主页面单测不再异步加载真实 dhtmlx/CSS。
- 验证：目标 `purchase-board.test.ts` `4/4 passed`；相邻 `shortage-risk-sync.test.ts` `9/9 passed`；`schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 280 tests passed`。
- 覆盖率：总行覆盖从 `62.16%` 提升到 `62.20%`；`PurchaseBoard.vue` 行覆盖提升到 `50.37%`，函数覆盖提升到 `28.94%`。
- 发布判断：本片属于 A 轨质量打磨；`scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ChatPanel Restricted Action Refusal Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 行覆盖约 `28.20%`，AI 生产助手是用户高频入口，权限拒绝属于动作安全边界，优先级高于继续做纯模板语义微调。
- 红灯：扩展 `chat-panel.test.ts` 后，Planner 用户点击 `生成交期恢复执行包` 会正确写拒绝消息和审计，但拒绝消息不是 alert；失败点为 `Unable to get .message.assistant[role="alert"]`。
- 修复：`ChatMessage` 增加可选 `liveRole?: 'alert'`；`addMessage()` 支持消息级 live role；`executeAction()` 权限拒绝分支以 `role="alert"` / `aria-live="assertive"` 渲染拒绝消息，同时继续写 `recordAssistantActionAudit(permitted: false)` 且不跳转。
- 范围：只改变助手动作权限拒绝消息的可访问播报语义和类型契约；不改变正常导航、报表导出、交期恢复执行包生成、异常处置卡、工程约束包或知识问答请求逻辑。
- 验证：目标 `chat-panel.test.ts` `4/4 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 281 tests passed`。
- 覆盖率：总行覆盖从 `62.20%` 提升到 `62.40%`；`ChatPanel.vue` 行覆盖从 `28.20%` 提升到 `31.55%`，函数覆盖提升到 `32.72%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门审计脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 ChatPanel OTD Report Export Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且是 AI 生产助手高频入口，`导出 OTD 复盘` 是 POC/验收证据出口，优先级高于继续精修已高覆盖小组件。
- 红灯：扩展 `chat-panel.test.ts` 后，点击 `导出 OTD 复盘` 已生成 CSV、点击下载、跳转 `/report` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`ChatMessage.liveRole` 扩展为 `'alert' | 'status'`；普通动作完成消息通过 `role="status"` / `aria-live="polite"` 播报，权限拒绝仍保持 `alert`。
- 范围：只改变普通动作完成消息的可访问播报语义和类型契约；不改变 CSV 内容、Blob URL 生命周期、路由跳转、权限拒绝、包生成动作或知识问答逻辑。
- 验证：目标 `chat-panel.test.ts` `5/5 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 282 tests passed`。
- 覆盖率：总行覆盖从 `62.40%` 提升到 `62.71%`；`ChatPanel.vue` 行覆盖从 `31.55%` 提升到 `36.88%`，函数覆盖提升到 `35.45%`。
- 发布判断：本片属于 A 轨质量打磨；发布闸门审计脚本仍返回 FAIL，B 轨 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察未关闭。

## 6.6 DocumentUpload Oversized File Rejection Coverage

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 是知识入库和 RAG 治理入口，过大文件拒绝属于上传前置校验关键失败路径，优先级高于继续精修已 100% 覆盖组件。
- 红绿说明：新增 `document-upload.test.ts` 用例后直接 GREEN；现有生产代码已拒绝超过 `50MB` 的受支持扩展文件，并通过 `.error-msg[role="alert"]` / `aria-live="assertive"` 播报。该片为 coverage-only 防回归测试，不伪造 RED，不修改生产代码。
- 覆盖：测试构造 `51MB` 的 PDF，确认显示 `文件过大 (最大 50MB): 大型质量手册.pdf`，文件不会进入队列，上传按钮保持禁用，且 `uploadDocument` 不会被调用。
- 范围：只修改 `src/frontend/tests/unit/document-upload.test.ts`；不改变文件大小阈值、扩展名白名单、拖拽/选择文件逻辑、上传 API payload、历史记录或知识治理事件。
- 验证：目标 `document-upload.test.ts` `6/6 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 283 tests passed`。
- 覆盖率：总行覆盖从 `62.71%` 提升到 `62.73%`；`DocumentUpload.vue` 行覆盖从 `49.42%` 提升到 `50.57%`，函数覆盖保持 `29.50%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端覆盖率替代。

## 6.6 PurchaseBoard Receive API Failure Guard

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 行覆盖约 `50.37%`，采购收货是采购主流程关键动作，后端拒绝收货时不应让界面表现为流程结束。
- 红灯：扩展 `purchase-board.test.ts` 后，mock `receivePurchaseOrder('po-a')` 抛出 `收货数量超过剩余未收数量`，组件仍关闭收货弹窗；失败点为 `expected false to be true`，证明收货失败被静默吞掉。
- 修复：`handleReceive()` 在调用前清空旧通知；收货 API 异常时用 `errorMessage` 生成 `收货失败：...` 的 `role="alert"` 提示并立即返回，不关闭弹窗、不刷新列表、不推进本地收货状态。
- 范围：只改变普通收货 API 失败路径；不改变收货成功、加急收货、替代供应商到货、取消失败保护、供应风险升级或 OTD/短缺证据链逻辑。
- 验证：目标 `purchase-board.test.ts` `5/5 passed`；相邻 `shortage-risk-sync.test.ts` `9/9 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 284 tests passed`。
- 覆盖率：总行覆盖从 `62.73%` 提升到 `62.81%`；`PurchaseBoard.vue` 行覆盖从 `50.37%` 提升到 `53.18%`，函数覆盖从 `28.94%` 提升到 `36.84%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 QualityCapaTaskPanel Verified Closure Status

- 选片依据：继续执行 Coverage-Leverage Routing；`QualityCapaTaskPanel.vue` 行覆盖约 `45.00%`，CAPA 验证闭环会写入质量审计与 OTD 复盘，是质量主流程关键出口。
- 红灯：扩展 `quality-capa-task-panel.test.ts` 后，执行中 CAPA 可推进到 `verified` 并调用 `writeQualityCapaClosure`，但完成消息 `.closure-sync-message` 缺少 status 语义；失败点为 `expected undefined to be 'status'`。
- 修复：为 `.closure-sync-message` 增加 `role="status"` 和 `aria-live="polite"`，让 CAPA 验证完成、审计回放与 OTD 复盘同步结果能被辅助技术感知。
- 范围：只改变完成消息可访问语义；不改变 `advanceTask()` 状态机、`writeQualityCapaClosure` payload、低分复核队列、知识复用正式 CAPA 转换或助手执行包质量责任闭环。
- 验证：目标 `quality-capa-task-panel.test.ts` `2/2 passed`；相邻 `quality-capa-sync.test.ts` `4/4 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 285 tests passed`。
- 覆盖率：总行覆盖从 `62.81%` 提升到 `62.90%`；`QualityCapaTaskPanel.vue` 行覆盖从 `45.00%` 提升到 `53.00%`，函数覆盖从 `26.47%` 提升到 `35.29%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel Knowledge Query Failure Fallback Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 行覆盖约 `36.88%`，AI 生产助手是高频入口，知识问答服务失败需要 fail loud，不能被离线演示回答静默掩盖。
- 红灯：扩展 `chat-panel.test.ts` 后，mock `queryKnowledge` 抛出 `RAG 服务不可用`，组件只显示演示回答，缺少 `.message.assistant[role="alert"]`；失败点为 `Unable to get .message.assistant[role="alert"]`。
- 修复：`sendMessage()` catch 分支复用 `errorMessage()` 归一化异常，把“知识问答服务暂不可用，已切换到离线演示回答。原因：...”置于演示回答前，并以 `liveRole='alert'` 渲染 assertive alert。
- 范围：只改变知识问答后端失败 fallback；不改变正常 `queryKnowledge` payload、来源展开、权限拒绝、报表导出、动作包生成、演示回答内容或可执行动作匹配。
- 验证：目标 `chat-panel.test.ts` `6/6 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 286 tests passed`。
- 覆盖率：总行覆盖从 `62.90%` 提升到 `63.27%`；`ChatPanel.vue` 行覆盖从 `36.88%` 提升到 `43.19%`，函数覆盖从 `35.45%` 提升到 `40.00%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel Anomaly Package Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且 AI 助手动作是高频入口，异常处置卡创建会同步异常管理、风险队列、AI 排产和 OTD 证据链，属于真实业务出口。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `创建异常处置卡` 已写包、跳转 `/anomaly` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`create_anomaly_card` 成功分支的 `addMessage()` 传入 `liveRole='status'`，让动作完成和异常处置包卡片以 polite status 播报。
- 测试夹具：将 `writeAssistantAnomalyDispositionPackage`、`getLocalUserDisplayName`、`getLocalUserRole` 改为 hoisted mocks，便于同一测试文件分别覆盖 Planner 权限拒绝和 Admin 成功动作。
- 范围：只改变异常处置卡成功消息的可访问播报语义；不改变动作匹配、权限判断、包写入 payload、路由跳转、成功审计或其他动作包分支。
- 验证：目标 `chat-panel.test.ts` `7/7 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 287 tests passed`。
- 覆盖率：fresh 总行覆盖 `63.29%`，相对上一轮 `63.27%` 小幅提升；`ChatPanel.vue` 行覆盖从 `43.19%` 提升到 `44.77%`，函数覆盖从 `40.00%` 提升到 `42.72%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel Engineering Constraint Package Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且 AI 助手动作是高频入口，工程约束复核包会联动 BOM、工艺路线、AI 排产、OTD 证据链和审计回放，属于真实业务出口。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `生成工程约束复核包` 已写包、跳转 `/routing` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`engineering_constraint_package` 成功分支的 `addMessage()` 传入 `liveRole='status'`，让工程约束复核包动作完成消息和动作包卡片以 polite status 播报。
- 测试夹具：新增 `writeAssistantEngineeringConstraintPackage` hoisted mock，锁定 actor/role、路由跳转、成功审计和动作包摘要。
- 范围：只改变工程约束复核包成功消息的可访问播报语义；不改变动作匹配、权限判断、包写入 payload、路由跳转、审计记录或其他动作包分支。
- 验证：目标 `chat-panel.test.ts` `8/8 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 288 tests passed`。
- 覆盖率：总行覆盖从 `63.29%` 提升到 `63.46%`；`ChatPanel.vue` 行覆盖从 `44.77%` 提升到 `46.54%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel Customer Commitment Package Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且 AI 助手动作是高频入口，客户交付恢复承诺包会同步报表中心、AI 排产、OTD 证据链、CSV 导出和审计回放，属于验收/客户复盘出口。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `生成客户交付恢复承诺包` 已写包、跳转 `/report` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`customer_commitment_package` 成功分支的 `addMessage()` 传入 `liveRole='status'`，让客户承诺包动作完成消息和动作包卡片以 polite status 播报。
- 测试夹具：将 `writeOtdKpiCommitmentPackage` 改为 hoisted mock，锁定客户、actor、路由跳转、成功审计和动作包摘要。
- 范围：只改变客户交付恢复承诺包成功消息的可访问播报语义；不改变动作匹配、权限判断、承诺包 payload、路由跳转、审计记录或其他动作包分支。
- 验证：目标 `chat-panel.test.ts` `9/9 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 289 tests passed`。
- 覆盖率：总行覆盖从 `63.46%` 提升到 `63.53%`；`ChatPanel.vue` 行覆盖从 `46.54%` 提升到 `47.73%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel BOM Kitting Package Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且 AI 助手动作是高频入口，BOM 展开齐套检查包会同步 BOM 管理、库存齐套、AI 排产、OTD 证据链、系统治理和审计回放，属于缺料/替代料复核出口。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `生成 BOM 展开齐套检查包` 已写入齐套包、跳转 `/bom` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`bom_kitting_package` 成功分支的 `addMessage()` 传入 `liveRole='status'`，让 BOM 齐套包动作完成消息和动作包卡片以 polite status 播报。
- 范围：只改变 BOM 展开齐套检查包成功消息的可访问播报语义；不改变动作匹配、权限判断、齐套包 payload、本地/OTD 证据写入、路由跳转、审计记录或其他动作包分支。
- 验证：目标 `chat-panel.test.ts` `10/10 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 290 tests passed`。
- 覆盖率：总行覆盖从 `63.53%` 提升到 `63.71%`；`ChatPanel.vue` 行覆盖从 `47.73%` 提升到 `50.69%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel Equipment Downtime Package Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且 AI 助手动作是高频入口，设备停机复核包会同步设备维护、AI 排产事件队列、风险预警、OTD 证据链和审计回放，属于瓶颈设备保护出口。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `生成设备停机复核包` 已写入停机事件、跳转 `/equipment` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`equipment_downtime_package` 成功分支的 `addMessage()` 传入 `liveRole='status'`，让设备停机复核包动作完成消息和动作包卡片以 polite status 播报。
- 范围：只改变设备停机复核包成功消息的可访问播报语义；不改变动作匹配、权限判断、停机事件 payload、本地/OTD 证据写入、路由跳转、审计记录或其他动作包分支。
- 验证：目标 `chat-panel.test.ts` `11/11 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 291 tests passed`。
- 覆盖率：总行覆盖从 `63.71%` 提升到 `63.85%`；`ChatPanel.vue` 行覆盖从 `50.69%` 提升到 `53.25%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ChatPanel Delivery Recovery Package Status

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且 AI 助手动作是高频入口，交期恢复执行包会同步 AI 排产事件队列、风险处置队列、OTD 证据链和审计回放，属于跨模块交付恢复核心出口。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `生成交期恢复执行包` 已写入执行包、跳转 `/scheduling` 并写成功审计，但完成消息不是 status；失败点为 `Unable to get .message.assistant[role="status"]`。
- 修复：`delivery_recovery_package` 成功分支的 `addMessage()` 传入 `liveRole='status'`，让交期恢复执行包动作完成消息和动作包卡片以 polite status 播报。
- 测试夹具：将 `writeAssistantRecoveryPackage` 改为 hoisted mock，锁定 actor/role、路由跳转、成功审计和动作包摘要。
- 范围：只改变交期恢复执行包成功消息的可访问播报语义；不改变动作匹配、权限判断、执行包 payload、路由跳转、审计记录或其他动作包分支。
- 验证：目标 `chat-panel.test.ts` `12/12 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 292 tests passed`。
- 覆盖率：总行覆盖从 `63.85%` 提升到 `63.91%`；`ChatPanel.vue` 行覆盖从 `53.25%` 提升到 `54.24%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 GanttChart Lightweight Task Detail Click

- 选片依据：执行 Coverage-Leverage Routing，转出已连续精修的 `ChatPanel.vue`；`GanttChart.vue` 仍处于中低覆盖，且 AI 排产甘特图是调度员必经主视图。离线/demo 轻量甘特路径是当前演示与本地验证的重要兜底，任务条必须能进入详情。
- 红灯：扩展 `gantt-chart.test.ts` 后，轻量 `.gantt_task_line` 点击和 Enter 都没有发出 `taskClick`；失败点为 `expected undefined to deeply equal [["task-1"], ["task-1"]]`。
- 修复：为轻量任务 marker 增加 `tabindex="0"`、点击和 Enter 处理，并通过 `emitLightweightTaskClick()` 统一发出 `taskClick`，让父级 `ScheduleBoard` 可继续打开工单详情。
- 范围：只改变 `VITE_SHOW_DEMO_HINTS=true` / offline demo 轻量 marker 的交互语义；不改变 dhtmlx 初始化、真实拖拽、锁定期、冲突检测、scale 切换或任务数据映射。
- 验证：目标 `gantt-chart.test.ts` `3/3 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `7/7 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 293 tests passed`。
- 覆盖率：总行覆盖从 `63.91%` 提升到 `63.92%`；`GanttChart.vue` 行覆盖为 `52.04%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 GanttChart Locked Period Overlap Drag Guard

- 选片依据：继续执行 Coverage-Leverage Routing；`GanttChart.vue` 行覆盖仍低于全局平均，且锁定期是调度员排产主视图的核心现场承诺边界。进行中的任务若仍与锁定期重叠，也不能被拖走。
- 红灯：扩展 `gantt-chart.test.ts` 后，当前时间 `2026-06-02T08:00:00Z`、任务 `07:30` 开始且持续 1 天、锁定 8 小时的场景中，`onBeforeTaskDrag` 错误返回 `true`；失败点为 `expected true to be false`。
- 修复：锁定期校验从“任务开始时间落入锁定期”改为“任务时间段与锁定期窗口重叠”，用 `taskStart < lockEndTime && taskEnd > lockStart` 阻止进行中或即将开始的锁定期任务被拖动。
- 范围：只改变 dhtmlx `onBeforeTaskDrag` 的锁定期判定；不改变设备分组不可拖拽、拖拽开始事件、拖拽中冲突标记、拖拽结束冲突检测、轻量 marker 或 scale 配置。
- 验证：目标 `gantt-chart.test.ts` `4/4 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `8/8 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 294 tests passed`。
- 覆盖率：总行覆盖从 `63.92%` 提升到 `64.03%`；`GanttChart.vue` 行覆盖从 `52.04%` 提升到 `57.80%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 GanttChart Initial Scale Prop

- 选片依据：继续执行 Coverage-Leverage Routing；`GanttChart.vue` 仍是低于全局平均的调度主视图组件。调度员从周/月视图进入甘特图时，首屏必须直接使用请求的 scale，不能先初始化成日视图。
- 红灯：扩展 `gantt-chart.test.ts` 后，`scale="week"` 初始挂载仍得到 `gantt.config.scale_unit === "day"`；失败点为 `expected 'day' to be 'week'`。
- 修复：`initGantt()` 完成 `gantt.init()` 且 `isInitialized=true` 后，立即复用现有 `setScale(props.scale)` 应用初始 scale。
- 范围：只改变初始挂载时的 scale 应用；不改变后续 watcher 更新、日/周/月配置内容、数据 parse、锁定期拖拽保护、冲突检测或轻量 marker。
- 验证：目标 `gantt-chart.test.ts` `5/5 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `9/9 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 295 tests passed`。
- 覆盖率：总行覆盖从 `64.03%` 提升到 `64.11%`；`GanttChart.vue` 行覆盖从 `57.80%` 提升到 `61.49%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ScheduleBoard Task Detail Failure Alert

- 选片依据：执行 Coverage-Leverage Routing，转向 `ScheduleBoard.vue`；该组件行覆盖约 `49.49%`，且调度员点击甘特任务查看工单详情是主工作台必经路径。后端详情失败不能静默显示 demo 工单。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `getWorkOrderById` 抛出 `work order API unavailable`，详情面板 `data-error` 为空；失败点为 `expected '' to contain '工单详情加载失败'`。
- 修复：`handleTaskClick()` catch 分支保留本地排产解释/工单兜底，但将 `detailError` 设置为 `工单详情加载失败，已显示本地排产解释兜底：...`，把后端失败原因传给 `OrderDetailPanel`。
- 范围：只改变任务详情后端失败的 fail-loud 文案；不改变详情成功路径、demo 解释生成、甘特任务点击、优化、采纳反馈或排产数据加载。
- 验证：目标 `schedule-board.test.ts` `5/5 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `10/10 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 296 tests passed`。
- 覆盖率：总行覆盖从 `64.11%` 提升到 `64.14%`；`ScheduleBoard.vue` 行覆盖从 `49.49%` 提升到 `50.10%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ScheduleBoard Feedback Sync Failure Reason

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleBoard.vue` 仍是低覆盖调度主工作台，采纳/拒绝 Agent 推荐后的反馈同步是调度闭环、审计复盘和模型改进入口。后台失败不能只给泛化提示。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `submitAdoptionFeedback` 抛出 `feedback API unavailable`，`.sync-note` 只显示 `后台反馈接口不可用...`，缺少具体后端原因；失败点为 `expected ... to contain 'feedback API unavailable'`。
- 修复：`handleScheduleDecision()` catch 分支复用 `errorMessage()`，在保留本地复盘提示后追加 `原因：...`。
- 范围：只改变反馈同步失败提示文案；不改变本地 `writeScheduleFeedbackSnapshot`、成功同步 payload、最近反馈记录、提交按钮状态或缺少计划 ID 的早返回路径。
- 验证：目标 `schedule-board.test.ts` `6/6 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `11/11 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 297 tests passed`。
- 覆盖率：总行覆盖从 `64.14%` 提升到 `64.16%`；`ScheduleBoard.vue` 行覆盖从 `50.10%` 提升到 `50.50%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ScheduleBoard Optimization Success Clears Stale Error

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleBoard.vue` 仍低于全局平均，且调度员反复点击智能优化是排产主工作台的核心路径。一次后端失败后的旧错误不能在后续成功优化后继续压住页面。
- 红灯：扩展 `schedule-board.test.ts` 后，首次 `optimizeSchedule` 抛出 `optimizer unavailable`，第二次成功返回新方案，但页面仍存在 `[role="alert"]` 旧错误；失败点为 `expected ... not to exist`。
- 修复：`handleOptimize()` 在成功应用新的 `result.plan` 时清空 `error.value`，让成功结果取代上一轮失败横幅。
- 范围：只改变优化成功路径的旧错误清理；不改变优化 API payload、无计划返回、warning 显示、loading 状态、排产数据加载、采纳反馈或详情路径。
- 验证：目标 `schedule-board.test.ts` `7/7 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 298 tests passed`。
- 覆盖率：总行覆盖从 `64.16%` 提升到 `64.17%`；`ScheduleBoard.vue` 行覆盖从 `50.50%` 提升到 `50.60%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ScheduleAgentWorkbench Recommendation Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleAgentWorkbenchPanel.vue` 是调度员 Agent 决策入口，后端建议生成失败会影响采纳/拒绝闭环和审计留痕，失败反馈必须比普通成功状态更响亮。
- 红灯：扩展 `schedule-agent-workbench-panel.test.ts` 后，mock `recommendAgentDecision` 抛出 `agent recommendation unavailable`，错误提示 `.agent-action-note.error` 仍是 `role="status"`；失败点为 `expected 'status' to be 'alert'`。
- 修复：动作反馈节点按 `actionError` 动态切换语义，错误为 `role="alert"` / `aria-live="assertive"`，成功仍保留 `role="status"` / `aria-live="polite"`。
- 范围：只改变调度员 Agent 工作台动作提示的可访问播报语义；不改变 recommend/adopt/reject API 调用、fallback 文案、按钮禁用逻辑、后端决策渲染或父级排产页。
- 验证：目标 `schedule-agent-workbench-panel.test.ts` `2/2 passed`；相邻 `schedule-agent-workbench-panel.test.ts + schedule-board.test.ts` `9/9 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 299 tests passed`。
- 覆盖率：总行覆盖从 `64.17%` 提升到 `64.19%`；`ScheduleAgentWorkbenchPanel.vue` 行覆盖提升到 `83.52%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 BomBoard Explosion Failure Fallback

- 选片依据：继续执行 Coverage-Leverage Routing；`BomBoard.vue` 低于全局平均且 BOM 展开是库存齐套、替代料评估和 AI 排产约束入口。爆炸接口失败不能让展开区空白或产生未处理异步错误。
- 红灯：扩展 `bom-board.test.ts` 后，mock `explodeBom` 异步 reject，点击 `爆炸展开` 后没有 `.explosion-section`，且 Vitest 捕获 `Unhandled Rejection: bom explosion API unavailable`。
- 修复：`handleExplode()` 改为 `async` 并 `await explodeBom(...)`，catch 分支设置 `demoExplosion(selected.value)`，让异步失败也进入本地展开兜底。
- 范围：只改变 BOM 爆炸接口失败的异步捕获方式；不改变成功展开结果、BOM 列表/详情加载、键盘选择、齐套包写入、工程变更或 OTD 证据链。
- 验证：目标 `bom-board.test.ts` `2/2 passed`；相邻 `bom-board.test.ts + shortage-risk-sync.test.ts` `11/11 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 300 tests passed`。
- 覆盖率：总行覆盖从 `64.19%` 提升到 `64.40%`；`BomBoard.vue` 行覆盖从 `55.68%` 提升到 `66.46%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 ProductionBoard Work Order Load Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 仍低覆盖且生产工单列表是现场报工入口。后端工单列表不可用时可以显示 demo 兜底，但必须 fail loud，不能让操作员误以为是真实工单列表。
- 红灯：扩展 `production-board.test.ts` 后，mock `getWorkOrders` 抛出 `work-order API unavailable`，页面显示 demo 工单 `WO-001`，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：`loadWorkOrders()` catch 分支保留 `loadDemoData()`，并追加 `notify("生产工单加载失败，已显示本地演示工单：...","error")` 暴露后端原因。
- 范围：只改变生产工单列表加载失败提示；不改变真实列表加载、demo 数据、扫码定位、开工/完工/异常提交或证据链写入。
- 验证：目标 `production-board.test.ts` `8/8 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts` `13/13 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 301 tests passed`。
- 覆盖率：总行覆盖从 `64.40%` 提升到 `64.46%`；`ProductionBoard.vue` 行覆盖从 `53.34%` 提升到 `54.42%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 PurchaseBoard List Refresh Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 仍低覆盖且采购订单确认是采购协同主路径。确认成功后刷新左侧列表失败时，右侧详情会显示已确认，但列表可能仍是旧状态，必须 fail loud。
- 红灯：扩展 `purchase-board.test.ts` 后，`confirmPurchaseOrder` 成功返回已确认详情，第二次 `getPurchaseList` 抛出 `purchase list refresh unavailable`，页面找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：`refreshList()` catch 分支保留本地列表状态，同时写入 `采购订单列表刷新失败，当前保留本地列表状态：...`，把刷新失败原因暴露给采购员。
- 范围：只改变采购列表刷新失败提示；不改变确认 API 成功路径、详情更新、列表成功刷新、取消、收货、短缺风险联动或分页逻辑。
- 验证：目标 `purchase-board.test.ts` `6/6 passed`；相邻 `purchase-board.test.ts + shortage-risk-sync.test.ts` `15/15 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 302 tests passed`。
- 覆盖率：总行覆盖保持 `64.46%`；`PurchaseBoard.vue` 行覆盖为 `53.35%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 PurchaseBoard Initial List Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 仍低覆盖且采购订单列表是采购员进入采购协同的首屏入口。初始列表加载失败可以显示 demo 兜底，但不能静默伪装成真实采购单。
- 红灯：扩展 `purchase-board.test.ts` 后，首轮 `getPurchaseList` 抛出 `purchase list API unavailable`，页面显示本地 demo 采购单，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：`onMounted` 初始加载 catch 分支保留 `demoOrders` 兜底，同时写入 `采购订单列表加载失败，已显示本地演示采购单：...`，把真实接口失败原因暴露给采购员。
- 范围：只改变采购列表首屏加载失败提示；不改变真实列表加载、demo 数据结构、审计对象定位、确认/取消/收货或供应风险联动。
- 验证：目标 `purchase-board.test.ts` `7/7 passed`；相邻 `purchase-board.test.ts + shortage-risk-sync.test.ts` `16/16 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 303 tests passed`。
- 覆盖率：总行覆盖从 `64.46%` 提升到 `64.48%`；`PurchaseBoard.vue` 行覆盖从 `53.35%` 提升到 `54.07%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 InventoryBoard Initial List Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`InventoryBoard.vue` 低于全局平均，且库存列表是齐套、领料、安全库存判断的首屏入口。列表 API 失败时可以显示 demo 兜底，但必须 fail loud。
- 红灯：扩展 `inventory-board.test.ts` 后，`getInventoryList` 抛出 `inventory list API unavailable`，页面显示本地 demo 物料，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：新增库存看板通知区域；`loadData()` 的库存列表 catch 分支保留 `demoItems`，同时写入 `库存列表加载失败，已显示本地演示物料：...` 暴露后端原因。
- 范围：只改变库存列表加载失败提示；不改变仪表盘加载、真实库存列表、demo 物料结构、物料选择、交易记录查询或出入库/调拨/盘点操作。
- 验证：目标 `inventory-board.test.ts` `2/2 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 304 tests passed`。
- 覆盖率：总行覆盖从 `64.48%` 提升到 `64.50%`；`InventoryBoard.vue` 行覆盖从 `58.13%` 提升到 `59.54%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 InventoryBoard Transaction Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`InventoryBoard.vue` 仍低于全局平均，且物料交易记录是仓库追溯、领料核对和库存余额判断的必经详情。交易接口失败可以显示 demo 兜底，但必须告知用户不是实时后端记录。
- 红灯：扩展 `inventory-board.test.ts` 后，选择 `MAT-A01` 时 `getStockTransactions` 抛出 `stock transactions API unavailable`，页面显示本地 demo 交易，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：`selectItem()` 在读取交易记录前清空旧通知；交易记录 catch 分支保留 `demoTx` 兜底，同时写入 `库存交易记录加载失败，已显示本地演示交易：...` 暴露后端原因。
- 范围：只改变交易记录加载失败提示；不改变物料选择、交易记录成功加载、库存列表加载、出入库/调拨/盘点操作或齐套闭环。
- 验证：目标 `inventory-board.test.ts` `3/3 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `13/13 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 305 tests passed`。
- 覆盖率：总行覆盖从 `64.50%` 提升到 `64.56%`；`InventoryBoard.vue` 行覆盖从 `59.54%` 提升到 `63.15%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 InventoryBoard Operation Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`InventoryBoard.vue` 仍是库存主入口，出库/入库/调拨/盘点失败是现场阻断动作。失败文本不能只是普通 `div`，需要用 alert 语义让用户立即感知操作未落库。
- 红灯：扩展 `inventory-board.test.ts` 后，选择 `MAT-B02` 打开出库弹窗，`stockOut` 抛出 `stock out API unavailable`，弹窗保留且错误文本显示，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：库存操作弹窗的 `dialogError` 节点增加 `role="alert"`，复用现有 `errorMessage()` 文案和保留弹窗逻辑。
- 范围：只改变库存操作失败提示语义；不改变出库 payload、成功后 `loadData()`、选中物料刷新、入库/调拨/盘点业务逻辑或库存数量计算。
- 验证：目标 `inventory-board.test.ts` `4/4 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `14/14 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 306 tests passed`。
- 覆盖率：总行覆盖从 `64.56%` 提升到 `64.75%`；`InventoryBoard.vue` 行覆盖从 `63.15%` 提升到 `75.93%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 AnomalyBoard Initial List Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`InventoryBoard.vue` 已高于全局平均，转向低覆盖且用户必经的 `AnomalyBoard.vue`。异常列表是现场事件处置、风险分流和 AI 分析入口，列表 API 失败时 demo 兜底不能静默伪装成真实异常。
- 红灯：扩展 `anomaly-board.test.ts` 后，`getAnomalyList` 抛出 `anomaly list API unavailable`，页面显示本地 demo 异常 `CNC-001 主轴温升异常`，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：新增异常看板通知区域；`loadAnomalies()` 的列表 catch 分支保留 demo 异常兜底，同时写入 `异常列表加载失败，已显示本地演示异常：...` 暴露后端原因。
- 范围：只改变异常列表加载失败提示；不改变现场事件中心、异常详情加载、AI 分析、分流记录写入或分页逻辑。
- 验证：目标 `anomaly-board.test.ts` `2/2 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `12/12 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 307 tests passed`。
- 覆盖率：总行覆盖从 `64.75%` 提升到 `64.78%`；`AnomalyBoard.vue` 行覆盖从 `58.51%` 提升到 `60.58%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 AnomalyBoard Detail Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`AnomalyBoard.vue` 仍低于全局平均，异常详情是现场事件处置和 AI 分析前置入口。详情 API 失败时 demo 详情不能静默伪装成真实异常详情。
- 红灯：扩展 `anomaly-board.test.ts` 后，选择 `a-1` 时 `getAnomalyById` 抛出 `anomaly detail API unavailable`，页面显示本地 demo 详情，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：`selectAnomaly()` 进入时清空旧通知；详情 catch 分支保留 `demoDetail` 兜底，同时写入 `异常详情加载失败，已显示本地演示详情：...` 暴露后端原因。
- 范围：只改变异常详情加载失败提示；不改变异常列表、详情成功加载、AI 分析、现场事件分流或分流证据写入。
- 验证：目标 `anomaly-board.test.ts` `3/3 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `13/13 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 308 tests passed`。
- 覆盖率：总行覆盖从 `64.78%` 提升到 `64.82%`；`AnomalyBoard.vue` 行覆盖从 `60.58%` 提升到 `63.30%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据，不能由前端测试替代。

## 6.6 AnomalyBoard AI Analysis Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`AnomalyBoard.vue` 仍低于全局平均，AI 分析是异常处置建议入口。后端分析失败时可以显示本地 demo 建议，但必须明确告知用户这些建议不是实时 AI 后端结果。
- 红灯：扩展 `anomaly-board.test.ts` 后，选择 `a-1` 并让 `analyzeAnomaly` 抛出 `anomaly analysis API unavailable`，页面显示本地 demo 建议，但找不到 `[role="alert"]`；失败点为 `Unable to get [role="alert"]`。
- 修复：`handleAnalyze()` 发起分析时清空旧通知；分析 catch 分支保留 demo 建议兜底，同时写入 `AI 分析加载失败，已显示本地演示建议：...` 暴露后端原因。
- 范围：只改变 AI 分析失败提示；不改变异常列表、详情加载、AI 成功返回、demo 建议内容、现场事件分流或分流证据写入。
- 验证：目标 `anomaly-board.test.ts` `4/4 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `14/14 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 309 tests passed`。
- 覆盖率：总行覆盖从 `64.82%` 提升到 `64.95%`；`AnomalyBoard.vue` 行覆盖从 `63.30%` 提升到 `70.92%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ScheduleBoard Batch Objective Feedback Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleBoard.vue` 仍低于全局平均，多目标方案对比后的“采用方案”是调度员从分析进入执行的关键路径。采纳反馈同步失败不能只写日志。
- 红灯：扩展 `schedule-board.test.ts` 后，`ParetoCompare` 触发 `apply=balanced` 且 `submitAdoptionFeedback` 抛出 `batch feedback API unavailable`，目标切换和优化成功，但页面找不到 `.sync-note`。
- 修复：`onApplyObjective()` 在批量方案采纳反馈提交前写入同步中状态；成功后写入后台同步成功状态；失败时保留本地目标切换，并用 `.sync-note` 暴露 `批量方案采纳反馈同步失败...` 和后端原因。
- 范围：只改变批量方案采纳反馈同步提示；不改变 ParetoCompare 方案选择、目标切换、后续 `handleOptimize()`、普通反馈面板采纳/拒绝或拖拽重排逻辑。
- 验证：目标 `schedule-board.test.ts` `9/9 passed`；相邻 `schedule-board.test.ts + pareto-compare.test.ts + schedule-feedback-sync.test.ts + gantt-mapper.test.ts` `23/23 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 315 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.13%`；`ScheduleBoard.vue` 行覆盖从 `51.80%` 提升到 `53.08%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ScheduleBoard Risk Event Load Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleBoard.vue` 仍低于全局平均，风险触发事件队列会驱动 Agent 推荐和调度员风险处置。风险后端失败时可以显示本地演示事件，但不能静默伪装成真实风险队列。
- 红灯：扩展 `schedule-board.test.ts` 后，默认 `getRiskDashboard` 抛出 `risk unavailable`，页面显示本地 demo 事件，但找不到 `.risk-event-sync-note`；失败点为 `Unable to get .risk-event-sync-note`。
- 修复：新增 `riskEventSyncNote`；`loadRiskTriggeredEvents()` 成功时清空提示，失败时保留 demo 事件兜底，并以 polite status 暴露 `风险事件加载失败，已显示本地演示事件：...` 和后端原因。
- 范围：只改变风险事件加载失败提示；不改变 demo 事件内容、风险映射、Agent 建议生成/采纳、拖拽重排、反馈同步或优化流程。
- 验证：目标 `schedule-board.test.ts` `10/10 passed`；相邻 `schedule-board.test.ts + schedule-event-queue-panel.test.ts + schedule-feedback-sync.test.ts + gantt-mapper.test.ts` `23/23 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 316 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.14%`；`ScheduleBoard.vue` 行覆盖从 `53.08%` 提升到 `53.16%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ScheduleBoard Outsourcing Release Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleBoard.vue` 仍低于全局平均，外协到货后的 Agent 建议采纳会关闭厂外等待口径并写入 OTD 复盘审计。释放确认写入失败不能只留下普通“反馈已同步”成功提示。
- 红灯：扩展 `schedule-board.test.ts` 后，mock 已到货未释放外协事件，采纳 Agent 建议时让 `confirmOutsourcingScheduleRelease` 抛出 `outsourcing release storage unavailable`；Vitest 捕获 unhandled rejection，页面 `.sync-note` 仍只显示普通反馈同步成功。
- 修复：`adoptAgentSuggestion()` 等待 `handleScheduleDecision()` 完成后再执行外协排产释放；释放确认使用 `try/catch` 包裹，失败时保留采纳反馈，并以 `.sync-note` 暴露 `外协排产释放同步失败...` 和后端原因。
- 范围：只改变外协到货后 Agent 建议采纳的释放确认失败路径；不改变普通反馈采纳、事件建议生成、外协释放成功、风险事件加载或拖拽重排。
- 验证：目标 `schedule-board.test.ts` `11/11 passed`；相邻 `schedule-board.test.ts + schedule-event-queue-panel.test.ts + schedule-feedback-sync.test.ts + outsourcing-commitment-sync.test.ts + gantt-mapper.test.ts` `31/31 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 317 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.80%`；`ScheduleBoard.vue` 行覆盖从 `53.16%` 提升到 `64.77%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ScheduleBoard Drag Reschedule Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ScheduleBoard.vue` 仍低于全局平均，拖拽重排是调度员日常必经动作。保存失败后不能被恢复重载清掉错误横幅。
- 红灯：扩展 `schedule-board.test.ts` 后，`rescheduleItem` 抛出 `reschedule API unavailable`，测试确认 API 被调用，但页面找不到 `[role="alert"]`；失败原因是 catch 设置 `error` 后立即 `loadData()`，而 `loadData()` 开头清空了错误。
- 修复：`loadData()` 增加默认关闭的 `preserveError` 选项；普通加载仍清空旧错误，拖拽重排保存失败后的恢复重载使用 `loadData({ preserveError: true })`，保留 `保存失败：...` alert。
- 范围：只改变拖拽重排保存失败后的错误保留；不改变初始加载、优化失败、详情失败、反馈同步、拖拽成功保存或 demo/offline 模式提示。
- 验证：目标 `schedule-board.test.ts` `8/8 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts + gantt-mapper.test.ts + schedule-feedback-sync.test.ts` `25/25 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 314 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.07%`；`ScheduleBoard.vue` 行覆盖从 `50.60%` 提升到 `51.80%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 DocumentUpload Quality Evidence Refresh Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 仍低于全局平均，且质量知识证据刷新会影响文档治理、再训练、灰度决策入口。后台刷新失败时不能变成 mounted hook 未处理异常。
- 红灯：扩展 `document-upload.test.ts` 后，`readQualityKnowledgeSamplesBackendFirst` 抛出 `quality evidence API unavailable`，页面没有 `[role="alert"]`，并出现 mounted hook unhandled rejection。
- 修复：`refreshQualityKnowledgeEvidence()` 增加 `try/catch`；任一 backend-first 质量知识证据刷新失败时，保留本地治理数据，并用现有 `error-msg` alert 暴露 `质量知识证据刷新失败，已保留本地治理数据：...`。
- 范围：只改变质量知识证据后台刷新失败路径；不改变文件选择、拖拽、上传队列、上传成功/失败、客户工单导入样例或质量治理事件成功处理。
- 验证：目标 `document-upload.test.ts` `7/7 passed`；相邻 `document-upload.test.ts + customer-order-import-sync.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `21/21 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 313 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.00%`；`DocumentUpload.vue` 行覆盖从 `50.57%` 提升到 `51.13%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 DocumentUpload Quality Gray Publish Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 仍低于全局平均，质量知识 R3 灰度发布会影响质量推荐链路和发布治理证据。灰度发布写入失败不能冒泡成未处理异常，也不能让用户误以为灰度审计已归档。
- 红灯：扩展 `document-upload.test.ts` 后，触发 `quality-next-training-gray-published` 并让 `grayPublishQualityKnowledgeNextTrainingSetVersion` 抛出 `gray publish storage unavailable`，Vitest 捕获 unhandled error，页面找不到 `[role="alert"]`。
- 修复：`handleQualityNextTrainingGrayPublish()` 对灰度发布写入增加 `try/catch`；失败时训练集仍停留在灰度前校验状态，并用现有 `error-msg` alert 暴露 `质量知识灰度发布失败...` 和后端原因。
- 范围：只改变 R3 下一轮训练集灰度发布失败路径；不改变文件上传、质量证据刷新、再训练审批/校验、灰度发布成功或实验候选 R7 流程。
- 验证：目标 `document-upload.test.ts` `8/8 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `19/19 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 318 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.86%`；`DocumentUpload.vue` 行覆盖从 `51.13%` 提升到 `54.18%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 QualityCapaTaskPanel Closure Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`QualityCapaTaskPanel.vue` 低于全局平均且 CAPA 验证闭环是质量审计和 OTD 复盘入口。闭环写入失败时不能把任务先标成已验证。
- 红灯：扩展 `quality-capa-task-panel.test.ts` 后，`writeQualityCapaClosure` 抛出 `CAPA closure storage unavailable`，页面产生 unhandled error，且任务卡片仍被错误标成 `verified`。
- 修复：CAPA 执行中任务推进时先尝试写入闭环；写入成功后才设置 `verified` 与成功 status；写入失败时保留 `doing`、按钮仍为 `推进处置`，并以 `role="alert"` / `aria-live="assertive"` 暴露 `CAPA 验证同步失败：...`。
- 范围：只改变 `doing -> verified` 闭环写入失败路径；不改变 open 任务启动、闭环成功 payload、知识复用闭环、低分样本复核、推荐采纳或助手执行包质量责任闭环。
- 验证：目标 `quality-capa-task-panel.test.ts` `3/3 passed`；相邻 `quality-capa-task-panel.test.ts + quality-capa-sync.test.ts` `7/7 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 312 tests passed`。
- 覆盖率：fresh 总行覆盖 `64.99%`；`QualityCapaTaskPanel.vue` 行覆盖提升到 `55.23%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ChatPanel Recovery Package Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`AnomalyBoard.vue` 已高于全局平均，转向低覆盖且用户必经的 `ChatPanel.vue`。助手动作是用户从问答进入业务闭环的入口，权限通过后写入执行包失败不能变成未处理异常。
- 红灯：扩展 `chat-panel.test.ts` 后，Admin 点击 `生成交期恢复执行包` 时让 `writeAssistantRecoveryPackage` 抛出 `recovery package storage unavailable`，测试出现 Vue native event handler unhandled error，且没有失败审计或 `[role="alert"]`。
- 修复：`executeAction()` 的可执行动作主体增加统一 `try/catch/finally`；成功路径继续记录 permitted=true 审计和 status，失败路径记录 permitted=false 审计，并以 `动作执行失败：...` alert 暴露失败原因且不继续导航。
- 范围：只改变动作执行异常处理；不改变权限拒绝、知识问答 fallback、各动作成功 payload、成功跳转、CSV 导出或动作卡片展示。
- 验证：目标 `chat-panel.test.ts` `13/13 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + otd-kpi-commitment-sync.test.ts + shortage-risk-sync.test.ts + equipment-risk-sync.test.ts` `59/59 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 310 tests passed`。
- 覆盖率：总行覆盖从 `64.95%` 提升到 `64.96%`；`ChatPanel.vue` 行覆盖从 `54.24%` 提升到 `54.50%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ChatPanel Restricted Action Audit Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低于全局平均，AI 助手权限拒绝是安全边界和审计链入口。拒绝动作本身未执行，但拒绝审计写入失败也必须 fail loud。
- 红灯：扩展 `chat-panel.test.ts` 后，Planner 点击 Admin-only `生成交期恢复执行包` 且 `recordAssistantActionAudit` 抛出 `audit storage unavailable`，Vitest 捕获 unhandled rejection，页面没有 `[role="alert"]`。
- 修复：`executeAction()` 的权限拒绝分支对拒绝审计写入增加 `try/catch`；动作仍不执行、不导航，审计失败时用 alert 同时说明权限拒绝和 `拒绝审计写入失败：...`。
- 范围：只改变权限拒绝审计写入失败路径；不改变权限通过动作、权限拒绝成功审计、执行包生成、导出报表或普通问答 fallback。
- 验证：目标 `chat-panel.test.ts` `14/14 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `36/36 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 319 tests passed`。
- 覆盖率：fresh 总行覆盖 `65.87%`；`ChatPanel.vue` 行覆盖从 `54.50%` 提升到 `54.68%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ProductionBoard Scan API Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 仍低覆盖且生产扫码是现场报工入口。扫码接口失败时若本地也找不到工单，不能只报“未找到”，否则会把后端扫码服务不可用伪装成普通无匹配。
- 红灯：扩展 `production-board.test.ts` 后，`scanOperation` 抛出 `scanner API unavailable` 且本地无 `WO-SCANNER-DOWN`，页面 alert 只显示 `未找到匹配的工单或工序`，没有暴露扫码接口失败原因。
- 修复：`handleScan()` 保存扫码接口异常；如果后续本地搜索也未命中，则写入 `扫码查询失败，且本地未找到匹配的工单或工序：...`，同时保留本地命中和扫码成功路径。
- 范围：只改变扫码接口失败且本地无匹配时的提示；不改变扫码成功定位、普通本地搜索命中、开工/完工/异常提交或证据链写入。
- 验证：目标 `production-board.test.ts` `9/9 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts + barcode-scan-evidence-sync.test.ts + otd-evidence-chain-sync.test.ts` `26/26 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 311 tests passed`。
- 覆盖率：fresh 总行覆盖 `64.92%`；本片没有制造总量提升，`ProductionBoard.vue` 行覆盖从 `54.42%` 提升到 `54.68%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ProductionBoard Completion Evidence Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 仍低于全局平均且现场完工报工是生产主路径。后端完工已提交但 OTD/质量证据写入失败时，不能继续弹出“完工报告已提交”的假成功。
- 红灯：扩展 `production-board.test.ts` 后，`completeOperation` 成功但 `upsertOtdEvidenceChainRecord` 抛出 `otd evidence storage unavailable`；Vitest 捕获 native event handler unhandled error，页面没有 `[role="alert"]`，本地状态已变为已完成。
- 修复：`confirmComplete()` 在后端完工成功后的本地完成态刷新、扫码完工/质量门/交接/不合格/生产复核/OTD 证据写入和 trace 回写外层增加 `try/catch`；证据写入失败时提示 `完工证据写入失败，后端完工已提交但 OTD/质量证据未归档...`，不再弹成功通知。
- 范围：只改变完工 API 成功后的证据归档失败路径；不改变完工 API 失败、完工成功、开工、扫码、异常上报或证据同步工具契约。
- 验证：目标 `production-board.test.ts` `10/10 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts + barcode-scan-evidence-sync.test.ts + otd-evidence-chain-sync.test.ts` `27/27 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 320 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.14%`；`ProductionBoard.vue` 行覆盖提升到 `59.41%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 QualityCapaTaskPanel Reuse Closure Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`QualityCapaTaskPanel.vue` 分支覆盖仍低，质量知识复用草案转正式 CAPA 是质量工程师从 AI 建议进入正式纠正措施的关键路径。写入失败不能让用户误以为草案已转正。
- 红灯：扩展 `quality-capa-task-panel.test.ts` 后，`writeQualityKnowledgeReuseClosure` 抛出 `reuse closure storage unavailable`；Vitest 捕获 native event handler unhandled error，页面没有 `[role="alert"]`，草案仍显示待复核但没有失败原因。
- 修复：`approveReuseDraft()` 在写入正式 CAPA 前清空旧错误，并用 `try/catch` 捕获复用闭环写入失败；失败时保留草案待复核和可重试按钮，并以 `质量知识复用转正式 CAPA 失败...` alert 暴露后端原因。
- 范围：只改变质量知识复用草案转正式 CAPA 的写入失败路径；不改变普通 CAPA 验证、复用转正成功、复用效果验证、低分样本复核或推荐采纳。
- 验证：目标 `quality-capa-task-panel.test.ts` `4/4 passed`；相邻 `quality-capa-task-panel.test.ts + quality-capa-sync.test.ts + quality-knowledge-sample-sync.test.ts` `13/13 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 321 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.21%`；`QualityCapaTaskPanel.vue` 行覆盖从 `55.23%` 提升到 `61.46%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 DocumentUpload Quality Experiment Shadow Gray Publish Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 仍低覆盖，质量实验 R7 影子灰度发布是知识推荐链路扩大前的关键治理动作。写入失败不能变成未处理异常，也不能让用户误以为影子灰度已发布。
- 红灯：扩展 `document-upload.test.ts` 后，触发 `quality-experiment-shadow-gray-published` 并让 `grayPublishQualityExperimentShadowValidationVersion` 抛出 `shadow gray publish storage unavailable`；Vitest 捕获 component/native event handler unhandled error，页面没有 `[role="alert"]`。
- 修复：`handleQualityExperimentShadowGrayPublish()` 增加 `try/catch`；失败时保留 R7 影子验证状态，并以 `质量实验影子灰度发布失败...` alert 暴露后端原因，不新增“R7影子灰度已发布”历史记录。
- 范围：只改变 R7 影子灰度发布失败路径；不改变 R3 灰度发布、R6 负样本合并、R7 影子验证成功、影子灰度发布成功或文件上传路径。
- 验证：目标 `document-upload.test.ts` `9/9 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `20/20 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 322 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.21%`；`DocumentUpload.vue` 行覆盖从 `54.18%` 提升到 `56.59%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 PurchaseBoard Confirmation Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 仍是低覆盖组件，采购确认是采购订单从提交进入供应履约的主路径。确认 API 失败时不能在本地强行显示“已确认”。
- 红灯：扩展 `purchase-board.test.ts` 后，`confirmPurchaseOrder` 抛出 `supplier credit hold`；测试失败于详情状态被错误推进为 `已确认`，列表活动订单也显示 `已确认`。
- 修复：`handleConfirm()` 在调用确认 API 前清空旧通知；确认失败时写入 `确认失败：...` alert 并 `return`，保留 `Submitted` 状态和确认按钮，不再刷新成假成功。
- 范围：只改变采购确认 API 失败路径；不改变确认成功、确认成功后列表刷新失败、取消失败、普通收货失败、加急收货或供应风险联动。
- 验证：目标 `purchase-board.test.ts` `8/8 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `29/29 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 323 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.28%`；`PurchaseBoard.vue` 行覆盖从 `54.07%` 提升到 `54.77%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ChatPanel Failed Action Audit Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低覆盖且助手动作是跨模块闭环入口。动作执行失败后如果失败审计也写入失败，不能再次抛未处理异常并吞掉原始失败原因。
- 红灯：扩展 `chat-panel.test.ts` 后，`writeAssistantRecoveryPackage` 抛出 `recovery package storage unavailable`，随后失败审计 `recordAssistantActionAudit` 抛出 `failed action audit storage unavailable`；Vitest 捕获 unhandled rejection，页面没有 `.message.assistant[role="alert"]`。
- 修复：`executeAction()` 的动作执行 catch 分支对失败审计写入增加二层 `try/catch`；页面 alert 同时保留原始动作失败原因和 `失败审计写入失败...`，不导航、不生成执行包。
- 范围：只改变动作执行失败后记录失败审计也失败的路径；不改变权限拒绝、权限拒绝审计失败、动作成功审计、交期恢复包成功/失败或其它动作包成功路径。
- 验证：目标 `chat-panel.test.ts` `15/15 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `37/37 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 324 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.25%`；`ChatPanel.vue` 行覆盖从 `54.68%` 提升到 `54.95%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 PurchaseBoard Submit Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 仍是低覆盖组件，采购提交是草稿采购单进入供应履约前的主路径。提交 API 失败时不能本地伪造 `Submitted`。
- 红灯：扩展 `purchase-board.test.ts` 后，`submitPurchaseOrder` 抛出 `supplier onboarding incomplete`；测试失败于详情状态被错误推进为 `已提交`，页面也没有 `提交失败：...` alert。
- 修复：`handleSubmit()` 在调用提交 API 前清空旧通知；提交失败时写入 `提交失败：...` alert 并 `return`，保留 `Draft` 状态和提交按钮，不再刷新成假成功。
- 范围：只改变采购提交 API 失败路径；不改变提交成功、确认成功/失败、取消失败、普通收货失败、加急收货或供应风险联动。
- 验证：目标 `purchase-board.test.ts` `9/9 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `30/30 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 325 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.33%`；`PurchaseBoard.vue` 行覆盖从 `54.77%` 提升到 `56.20%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 PurchaseBoard Create Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 仍低于全局平均，采购新建是采购员进入订单流的入口。新建 API 失败时不能本地插入 `po-new` 并关闭弹窗。
- 红灯：扩展 `purchase-board.test.ts` 后，`createPurchaseOrder` 抛出 `supplier master data missing`；测试失败于新建弹窗被关闭，且现有 catch 会把失败请求本地伪装成新草稿单。
- 修复：`handleCreate()` 在调用新建 API 前清空旧通知；新建失败时写入 `创建失败：...` alert 并 `return`，保留弹窗和表单，不再本地新增采购单。
- 测试隔离：全量 coverage 暴露 `ParetoCompare.vue` 的异步 `GanttChart` 在环境 teardown 后加载 CSS；`pareto-compare.test.ts` 改为按组件名 stub `GanttChart`，避免非本测目标的异步图表污染覆盖率运行。
- 范围：只改变采购新建 API 失败路径和 ParetoCompare 单测隔离；不改变新建成功、提交/确认/取消/收货路径、排产对比业务逻辑或真实 GanttChart 覆盖测试。
- 验证：目标 `purchase-board.test.ts` `10/10 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `31/31 passed`；`pareto-compare.test.ts` `2/2 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 326 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.36%`；`PurchaseBoard.vue` 行覆盖从 `56.20%` 提升到 `57.24%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 DocumentUpload Quality Retraining Publish Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`DocumentUpload.vue` 仍低于全局平均，质量知识正式发布是训练集进入 AI 推荐链路的硬闸门。发布写入失败不能抛未处理异常或新增成功历史。
- 红灯：扩展 `document-upload.test.ts` 后，`publishQualityKnowledgeRetrainingVersion` 抛出 `publish storage unavailable`；Vitest 捕获 component/native event handler unhandled error，页面没有 `[role="alert"]`，历史仍为空但用户看不到发布失败原因。
- 修复：`handleQualityRetrainingPublish()` 将正式发布写入包进 `try/catch`；失败时写入 `质量知识正式发布失败，当前训练集仍未进入 AI 推荐链路：...`，并停止刷新版本和新增发布历史。
- 范围：只改变质量知识正式发布失败路径；不改变正式发布成功、灰度发布失败兜底、R7 影子灰度发布失败兜底、上传队列或证据刷新路径。
- 验证：目标 `document-upload.test.ts` `10/10 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `21/21 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 327 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.41%`；`DocumentUpload.vue` 行覆盖从 `56.59%` 提升到 `58.91%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ChatPanel Success Audit Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍低于全局平均，助手动作是跨模块闭环入口。动作主体和跳转都成功后，如果成功审计写入失败，不能把已执行动作误报为动作失败。
- 红灯：扩展 `chat-panel.test.ts` 后，交期恢复执行包写入和 `/scheduling` 跳转成功，但成功审计 `recordAssistantActionAudit` 抛出 `success audit storage unavailable`；测试失败于审计函数被调用两次，第二次写入 `permitted=false`，把业务成功误归类成失败。
- 修复：成功审计调用单独包进 `try/catch`；成功审计失败时追加 `动作已执行，但成功审计写入失败：...` alert，保留原成功 status 和业务包，不再进入动作失败 catch 或写失败审计。
- 范围：只改变动作主体成功后的成功审计失败路径；不改变权限拒绝、权限拒绝审计失败、动作主体失败、失败审计失败、交期恢复包成功或其它动作包成功路径。
- 验证：目标 `chat-panel.test.ts` `16/16 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `38/38 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 328 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.42%`；`ChatPanel.vue` 行覆盖从 `54.95%` 提升到 `55.12%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 DocumentUpload Quality Retraining Rollback Failure Alert

- 选片依据：采纳 Coverage-Leverage Routing；`DocumentUpload.vue` 仍低于全局平均，质量知识回滚是已发布训练集撤回的治理闸门。回滚写入失败不能抛未处理异常，也不能新增“回滚成功”历史。
- 红灯：扩展 `document-upload.test.ts` 后，`rollbackQualityKnowledgeRetrainingVersion` 抛出 `rollback storage unavailable`；Vitest 捕获 component/native event handler unhandled error，页面没有 `[role="alert"]`，用户看不到回滚失败原因。
- 修复：`handleQualityRetrainingRollback()` 将回滚写入包进 `try/catch`；失败时写入 `质量知识回滚失败，当前训练集仍保留在发布状态：...`，并停止刷新版本和新增回滚历史。
- 范围：只改变质量知识回滚失败路径；不改变回滚成功、正式发布失败兜底、灰度发布失败兜底、影子灰度发布失败兜底或上传队列路径。
- 验证：RED 后目标 `document-upload.test.ts` `11/11 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + admin-board.test.ts + audit-decision-replay-panel.test.ts + report-board.test.ts` `24/24 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 329 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.46%`；`DocumentUpload.vue` 行覆盖从 `58.91%` 提升到 `61.17%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 PurchaseBoard Alternate Supplier Commitment Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`PurchaseBoard.vue` 仍低于全局平均，替代供应商锁定会关闭供应风险并释放排产复核，是采购到排产/OTD 的关键治理动作。
- 红灯：扩展 `purchase-board.test.ts` 后，`writeSupplyRiskEscalation` 抛出 `supply risk audit storage unavailable`；测试失败于 UI 已推进为 `替代已锁定`，并出现 native event handler unhandled error。
- 修复：`handleCommitAlternateSupplier()` 先写供应风险审计和 OTD 证据，全部成功后才推进 `supplyRiskDecision` 与 trace；失败时写入 `替代供应商锁定失败，供应风险仍未关闭：...` alert，并保持 open 状态。
- 范围：只改变替代供应商锁定失败路径；不改变供应风险升级、替代到货确认、普通采购提交/确认/收货、外协承诺或 OTD 证据工具契约。
- 验证：目标 `purchase-board.test.ts` `11/11 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `32/32 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 330 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.56%`；`PurchaseBoard.vue` 行覆盖从 `57.24%` 提升到 `60.57%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ChatPanel BOM Kitting Evidence Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍是当前低覆盖用户必经入口，BOM 展开齐套包会跨 BOM、库存齐套、AI 排产和 OTD 证据链。OTD 证据失败不能把已生成的齐套包误报成整体动作失败。
- 红灯：扩展 `chat-panel.test.ts` 后，让 `upsertOtdEvidenceChainRecord` 抛出 `otd evidence storage unavailable`；测试失败于 `/bom` 未跳转，说明 OTD 证据失败中断了已生成齐套包的后续成功展示。
- 修复：`writeAssistantBomKittingPackage()` 只负责写齐套包；新增 `writeAssistantBomKittingEvidence()` 写 OTD 证据。动作执行时 OTD 证据失败只追加 `BOM 齐套包已生成，但 OTD 证据写入失败：...` alert，保留成功状态、包卡片、路由跳转和 permitted=true 审计。
- 范围：只改变 BOM 齐套包的 OTD 证据失败路径；不改变齐套包写入失败、成功审计失败、设备停机包、客户承诺包或其它助手动作。
- 验证：目标 `chat-panel.test.ts` `17/17 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `53/53 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 331 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.59%`；`ChatPanel.vue` 行覆盖从 `55.12%` 提升到 `55.64%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察真实证据仍需单独补齐。

## 6.6 ChatPanel Equipment Downtime Evidence Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ChatPanel.vue` 仍是低覆盖高频入口，设备停机复核包会跨设备维护、AI 排产事件队列、风险预警和 OTD 证据链。OTD 证据失败不能把已写入的停机事件误报成整体动作失败。
- 红灯：扩展 `chat-panel.test.ts` 后，让 `upsertOtdEvidenceChainRecord` 抛出 `otd evidence storage unavailable`；测试失败于 `/equipment` 未跳转，说明 OTD 证据失败中断了已生成停机复核包的后续成功展示。
- 修复：`writeAssistantEquipmentDowntimePackage()` 只负责写设备停机事件；新增 `writeAssistantEquipmentDowntimeEvidence()` 写 OTD 证据。动作执行时 OTD 证据失败只追加 `设备停机复核包已生成，但 OTD 证据写入失败：...` alert，保留成功状态、包卡片、路由跳转和 permitted=true 审计。
- 范围：只改变设备停机复核包的 OTD 证据失败路径；不改变停机事件写入失败、成功审计失败、BOM 齐套包、客户承诺包或其它助手动作。
- 验证：目标 `chat-panel.test.ts` `18/18 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `54/54 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 332 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.56%`；`ChatPanel.vue` 行覆盖从 `55.64%` 提升到 `56.14%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察证据单独补齐。

## 6.6 ProductionBoard Exception Evidence Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ProductionBoard.vue` 仍低于全局平均，现场异常上报是生产执行进入异常管理、排产风险和 OTD 证据链的关键路径。后端异常已上报后，本地证据归档失败不能抛未处理异常或显示全成功。
- 红灯：扩展 `production-board.test.ts` 后，让 `writeProductionAnomalyEvent` 抛出 `production anomaly storage unavailable`；测试失败于没有 `[role="alert"]`，且 Vitest 捕获 native event handler unhandled error。
- 修复：`confirmException()` 将生产异常事件、扫码异常证据、风险联动 trace 和 OTD 证据写入包进 `try/catch`；证据失败时追加 `异常证据写入失败，后端异常已上报但异常管理/OTD 证据未归档：...` alert，不显示 `异常已上报...` 全成功提示。
- 范围：只改变异常上报后证据归档失败路径；不改变 `reportException` 后端失败路径、异常证据成功路径、开工/完工路径或完工证据失败兜底。
- 验证：目标 `production-board.test.ts` `11/11 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts + otd-evidence-chain-sync.test.ts + barcode-scan-evidence-sync.test.ts + labor-assignment-sync.test.ts` `34/34 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 333 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.61%`；`ProductionBoard.vue` 行覆盖从 `59.41%` 提升到 `59.45%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，仍需真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察证据。

## 6.6 RiskActionQueuePanel Escalation Trace Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`RiskActionQueuePanel.vue` 仍低覆盖且风险队列是生产、异常、排产恢复进入责任处置的关键入口。升级 trace 写入失败时不能先把 UI 推进为 `已升级`。
- 红灯：扩展 `risk-action-queue-panel.test.ts` 后，让 `appendRiskActionTrace` 抛出 `risk trace storage unavailable`；测试失败于卡片状态已变为 `已升级`，并出现 native event handler unhandled error。
- 修复：`escalate()` 在改变卡片状态和负责人前先调用 `recordRiskAction()`；trace 写入失败时显示 `风险升级失败：...` alert，保留原 `待处置` 状态、原负责人和处置留痕。
- 范围：只改变风险升级 trace 失败路径；不改变升级成功、转派、关闭、SLA 复核包生成或监控态势关闭回写路径。
- 验证：目标 `risk-action-queue-panel.test.ts` `2/2 passed`；相邻 `risk-action-queue-panel.test.ts + risk-action-sync.test.ts + risk-sla-review-sync.test.ts + monitoring-situation-escalation-sync.test.ts + production-anomaly-sync.test.ts + anomaly-dispatch-sync.test.ts + assistant-action-package-sync.test.ts` `34/34 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 334 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.65%`；`RiskActionQueuePanel.vue` 行覆盖从 `59.13%` 提升到 `63.46%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察证据仍未满足。

## 6.6 ReportBoard POC Review Signoff Failure Alert

- 选片依据：继续执行 Coverage-Leverage Routing；`ReportBoard.vue` 仍低于全局平均，POC 复盘签署是客户验收证据链进入上线行动包的关键闸门。签署写入失败不能抛未处理异常或显示已签署。
- 红灯：扩展 `report-board.test.ts` 后，让 `writePocReviewSignoffRecord` 抛出 `poc signoff storage unavailable`；测试失败于没有 `[role="alert"]`，并出现 native event handler unhandled error。
- 修复：`handlePocReviewSignoff()` 将签署记录写入包进 `try/catch`；失败时显示 `POC 复盘签署失败：...` alert，保留未签署状态，不刷新 OTD 证据链。
- 范围：只改变 POC 复盘签署失败路径；不改变签署成功、POC 转上线行动包、试运行或 hypercare 验收路径。
- 验证：目标 `report-board.test.ts` `2/2 passed`；相邻 `report-board.test.ts + poc-review-signoff-sync.test.ts + poc-rollout-package-sync.test.ts + poc-pilot-run-sync.test.ts + poc-hypercare-sync.test.ts + otd-evidence-chain-sync.test.ts` `26/26 passed`；`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 335 tests passed`。
- 覆盖率：fresh 总行覆盖 `66.79%`；`ReportBoard.vue` 行覆盖从 `59.43%` 提升到 `61.89%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨发布闸门审计仍返回 `FAIL`，hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察证据仍未满足。

## 6.6 Release Gate Anchored PASS Audit

- 选片依据：转回 B 轨发布闸门；`run-release-gate-audit.ps1` 是 v1.0.0 总闸门，不能被证据包正文里的历史文字 `Result: PASS` 误放行。
- 红灯：新增架构门 `ReleaseGateAudit_ShouldOnlyAcceptAnchoredGatePassLines` 后失败于脚本仍使用 `.Contains("Result: PASS")`。
- 修复：总审计改用 `Test-AnchoredReportPass()`，只接受独立的 `Result: PASS` 或 `- Result: PASS` 行；说明文字、旧日志或失败报告中的普通文本不再能 spoof PASS。
- 附带修正：架构全量暴露 `Sprint4LlmCostControls...` 与 Sprint5 Options 规则冲突；旧门禁改为接受 `IOptions<LlmConfig>.Value.MaxConcurrency`，匹配当前 Pro AI 配置口径。
- 验证：RED 后目标架构门 `1/1 passed`；release gate 架构过滤 `2/2 passed`；spoof 临时报告验证为 `EXPECTED_FAIL`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `72/72 passed`。
- 发布判断：重新运行 `scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍返回 `FAIL`，且是在 anchored PASS 判定下失败；B 轨真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字和灰度观察仍未关闭。

## 6.6 Release Gate Anchored Security Signoff Audit

- 选片依据：继续加固 B 轨总审计；安全签字是人工 release gate，不能被正文示例里的 `Status: SIGNED` / `Decision: SIGNED` 误放行。
- 红灯：新增架构门 `ReleaseGateAudit_ShouldOnlyAcceptAnchoredSecuritySignoffLines` 后失败于 `Test-SignoffSigned()` 仍使用裸 `.Contains("Status: SIGNED")` / `.Contains("Decision: SIGNED")`。
- 修复：总审计新增 `Test-AnchoredSignoffSigned()`，要求独立结果行 `Status: SIGNED` / `Decision: SIGNED` 或带 `- ` 前缀的等价行同时存在。
- 验证：RED 后目标架构门 `1/1 passed`；动态 signoff spoof 报告输出 `EXPECTED_FAIL` 且只卡 `Security signoff`；release gate 架构过滤 `3/3 passed`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `73/73 passed`。
- 发布判断：正式 `scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260602.md` 仍返回 `FAIL`；B 轨真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察仍未关闭。

## 6.6 Hosted CI Job Summary Evidence Gate

- 选片依据：B 轨 hosted CI 总审计要求 `RunUrl`、`RunId` 和 job summary；单项脚本此前只强制 `RunUrl` / `RunId`，会让没有 job 摘要的远端 run 证据过弱。
- 红灯：扩展 `HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun` 后，目标架构门失败于 hosted CI evidence script/report 缺 `job summary` token。
- 修复：`run-hosted-ci-evidence.ps1` 将 `Evidence` 作为 hosted CI job summary 必填项；Gate 文案改为 `hosted runner RunUrl, RunId, and job summary`；刷新 `hosted-ci-20260601.md` 与 `hosted-ci-20260602.md` FAIL 包。
- 验证：目标架构门 `1/1 passed`；动态负例传入 `RunUrl` / `RunId` 但不传 `Evidence` 时输出 `EXPECTED_FAIL`，并只报 `Hosted CI job summary evidence is required...`；hosted/release gate 架构过滤 `4/4 passed`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `73/73 passed`。
- 发布判断：正式 release gate audit 仍返回 `FAIL`；hosted CI 仍缺真实远端 runner URL、RunId 和 job summary，不能关闭 v1.0.0。

## 6.6 Attack Chain VerifiedAt Timestamp Gate

- 选片依据：继续 B 轨 release gate hardening；Attack Chain A/B/C 人工验证时间不能只要求非空字符串，否则 `not-a-date` 也可能进入证据包。
- 红灯：扩展 `AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified` 后，目标架构门失败于 `run-attack-chain-verification.ps1` 缺少 `[DateTimeOffset]::Parse`。
- 修复：`VerifiedAt` 非空后必须通过 `[DateTimeOffset]::Parse()`；不可解析时追加 `VerifiedAt must be a parseable timestamp for manual verification.` violation。
- 验证：目标架构门 RED 后 `1/1 passed`；动态负例在 Attack Chain A/B/C、Verifier、Evidence 全部给齐但 `VerifiedAt=not-a-date` 时输出 `EXPECTED_FAIL`，且只报时间戳不可解析；刷新 `attack-chain-verification-20260601.md` 与 `attack-chain-verification-20260602.md` FAIL 包。
- 发布判断：本片只加固人工验证证据格式；正式 release gate audit 仍应返回 `FAIL`，真实 Attack Chain A/B/C 人工验证、安全签字、hosted CI、staging 和灰度观察仍未完成。

## 6.6 Release Gate Attack Chain Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；总审计此前对 Attack Chain 只调用 generic `Result: PASS` 判定，没有复核 human verifier、timestamp、A/B/C PASS 和 evidence 字段。
- 红灯：新增 `ReleaseGateAudit_ShouldRequireAttackChainHumanEvidenceFields` 后，目标架构门失败于缺少 `Test-AttackChainEvidencePass`。
- 修复：`run-release-gate-audit.ps1` 新增 Attack Chain 专用 predicate，要求独立 `Result: PASS`、`Status: VERIFIED`、非空 `Verifier`、可解析 `VerifiedAt`、至少 3 条 `Manual verification: PASS` 和至少 3 条非空 `Evidence`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态 spoof 报告在 Attack Chain 写 `Result: PASS` 但缺人/时间/证据时，总审计输出 `EXPECTED_FAIL` 且只卡 `Attack Chain A/B/C`；完整合法样本输出 `EXPECTED_PASS`。
- 发布判断：正式 release gate audit 仍返回 `FAIL`；总审计现在不会只因 Attack Chain 报告有 PASS 结果行而放行，真实人工验证仍需补齐。

## 6.6 Release Gate Staging Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；PostgreSQL/staging 总审计此前只看 generic `Result: PASS`，没有复核真实 staging rehearsal 的迁移和健康检查证据。
- 红灯：新增 `ReleaseGateAudit_ShouldRequireStagingRehearsalEvidenceFields` 后，目标架构门失败于缺少 `Test-StagingEvidencePass`。
- 修复：`run-release-gate-audit.ps1` 新增 staging 专用 predicate，要求独立 PASS、`ASPNETCORE_ENVIRONMENT: Production`、连接串、Docker version、依赖启动、EF migrations、API 启动、`Health /live`、`Health /ready` 和至少 4 条 `Exit code: 0`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态 spoof 报告在 staging 写 `Result: PASS` 但缺迁移/健康证据时，总审计输出 `EXPECTED_FAIL` 且只卡 `PostgreSQL/staging`；完整合法样本输出 `EXPECTED_PASS`。
- 发布判断：正式 release gate audit 仍返回 `FAIL`；当前本机 staging 报告仍因 Docker 不可用失败，真实 PostgreSQL/staging rehearsal 证据仍需外部环境补齐。

## 6.6 Release Gate Hosted CI Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；Hosted CI 总审计此前只看 generic `Result: PASS`，没有复核真实远端 runner、RunUrl、RunId 和 job summary。
- 红灯：新增 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后，目标架构门失败于缺少 `Test-HostedCiEvidencePass`。
- 修复：`run-release-gate-audit.ps1` 新增 hosted CI 专用 predicate，要求独立 PASS、`Status: READY_FOR_RELEASE_REVIEW`、非空 `RunUrl`、非空 `RunId`、包含 `job summary` 的 `Evidence`、ci/eval workflow 文件存在、`gh run` 证据和至少 1 条 `Exit code: 0`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态 spoof 报告在 hosted CI 写 `Result: PASS` 但缺真实远端 run 字段时，总审计输出 `EXPECTED_FAIL` 且只卡 `Hosted CI`；完整合法样本输出 `EXPECTED_PASS`。
- 发布判断：正式 release gate audit 仍返回 `FAIL`；当前 hosted CI 报告仍缺真实 GitHub Actions runner URL、RunId 和 job summary，不能关闭 v1.0.0。

## 6.6 Release Gate Gray Observation Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；首次灰度和 14 天无 P0/P1 观察窗口是 v1.0.0 的墙钟硬闸门，不能只靠 generic `Result: PASS` 关闭。
- 红灯：新增 `ReleaseGateAudit_ShouldRequireGrayObservationWindowEvidenceFields` 后，目标架构门失败于缺少 `Test-GrayObservationEvidencePass`。
- 修复：`run-release-gate-audit.ps1` 新增 gray observation 专用 predicate，要求独立 PASS、`Status: PASS`、非空 `GrayReleaseId`、可解析 `GrayStartedAt` / `ObservationStartedAt` / `ObservationEndedAt`、观察窗口至少 `14 calendar days`、`P0/P1 incident counts: P0=0; P1=0` 和非空 `Evidence`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态 spoof 报告在 gray observation 写 `Result: PASS` 但仍为 `OBSERVING` 且观察窗口不足 14 天时，总审计输出 `EXPECTED_FAIL` 且只卡 `Gray observation`；完整 14 天合法样本输出 `EXPECTED_PASS`。
- 回归：`ReleaseGateAudit|GrayObservation` 架构过滤 `8/8 passed`；PowerShell parser `parse ok`；正式 release gate audit 仍返回 `EXPECTED_FAIL`，五个 B 轨 gate 均为 `FAIL`。
- 发布判断：本片只防止灰度观察弱证据误放行；真实首次灰度、14 天墙钟观察和无 P0/P1 证据仍未完成。

## 6.6 Release Gate Security Signoff Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；安全签字不能只靠独立 `Status: SIGNED` / `Decision: SIGNED` 行关闭，还必须证明签字人、签字时间、自评、Attack Chain 和 evidence 都在包内。
- 红灯：新增 `ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 后，目标架构门失败于缺少 `Test-SecuritySignoffEvidencePass`。
- 修复：`run-release-gate-audit.ps1` 新增 security signoff 专用 predicate，在 anchored SIGNED 基础上要求非空 `Signer`、可解析 `SignedAt`、包含 `Automated Self-Assessment`、包含 `Attack Chain A/B/C` 和非空 `Evidence`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态 spoof 报告在 security signoff 写 SIGNED 但缺 signer/time/evidence 时，总审计输出 `EXPECTED_FAIL` 且只卡 `Security signoff`；完整合法样本输出 `EXPECTED_PASS`。
- 发布判断：本片只防止安全签字弱证据误放行；真实人工 signer、安全自评复核、Attack Chain A/B/C 验证和签字 evidence 仍未完成。

## 6.6 Hosted CI GitHub Actions RunUrl/RunId Gate

- 选片依据：继续 B 轨 hosted CI 证据加固；`RunUrl` / `RunId` 不能只是任意非空字符串，必须指向 GitHub Actions run 且 run id 为数字。
- 红灯：新增 `HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId` 后，目标架构门失败于缺少 `Test-GitHubActionsRunUrl`。
- 修复：`run-hosted-ci-evidence.ps1` 和 `run-release-gate-audit.ps1` 新增 `Test-GitHubActionsRunUrl()` / `Test-NumericRunId()`；单项脚本写入 `RunUrl must be a GitHub Actions run URL...` 和 `RunId must be numeric.` violations；总闸门也用同一格式口径复核 hosted CI 报告。
- 验证：目标架构门 RED 后 `1/1 passed`；单项脚本传入 `https://example.com/run/1` + `abc` 输出 `EXPECTED_FAIL`；总闸门在其它四项合法、Hosted CI URL/RunId 非法时输出 `EXPECTED_FAIL` 且只卡 Hosted CI；完整 GitHub Actions URL + 数字 RunId 样本输出 `EXPECTED_PASS`。
- 发布判断：正式 hosted CI 报告刷新后仍 `FAIL`；真实 GitHub Actions run URL、数字 RunId 和 job summary 仍需有权限环境回填。

## 6.6 Release Gate Staging Health HTTP Success Predicate

- 选片依据：继续 B 轨 PostgreSQL/staging 证据加固；`Health /live` / `Health /ready` 标签本身不能证明 staging API 健康，必须看到对应段落的 HTTP 成功结果。
- 红灯：新增 `ReleaseGateAudit_ShouldRequireStagingHealthHttpSuccessEvidence` 后，目标架构门失败于缺少 `Test-StagingHealthEndpointPass`。
- 修复：`run-release-gate-audit.ps1` 新增 `Test-StagingHealthEndpointPass()`，定位 `## Health /live` 和 `## Health /ready` 段落，并要求段内存在 `HTTP 2xx` 或 `HTTP 3xx`；`Test-StagingEvidencePass()` 同时复核两个 health endpoint。
- 验证：目标架构门 RED 后 `1/1 passed`；动态负例在 staging 报告保留旧 token、4 个 `Exit code: 0` 但 `/live` / `/ready` 为 `HTTP 500` 时，总审计输出 `EXPECTED_FAIL` 且只卡 `PostgreSQL/staging`；完整 `HTTP 200` 样本输出 `EXPECTED_PASS`。
- 发布判断：正式 staging rehearsal 刷新后仍因本机 Docker 不可用返回 `FAIL`；真实 staging 迁移和 `/live` / `/ready` HTTP 成功证据仍未完成。

## 6.6 Release Gate Attack Chain Per-Section Evidence Predicate

- 选片依据：继续 B 轨 Attack Chain 总闸门加固；只统计 3 条 `Manual verification: PASS` 和 3 条 `Evidence` 仍可能让同一链路重复证据替代 B/C 链路证据。
- 红灯：新增 `ReleaseGateAudit_ShouldRequirePerAttackChainSectionEvidence` 后，目标架构门失败于缺少 `Test-AttackChainSectionPass`。
- 修复：`run-release-gate-audit.ps1` 新增 `Test-AttackChainSectionPass()`，分别截取 `## Attack Chain A`、`## Attack Chain B`、`## Attack Chain C` 段落，并要求每段都有 `Manual verification: PASS` 和非空 `Evidence`；`Test-AttackChainEvidencePass()` 同时复核三段。
- 验证：目标架构门 RED 后 `1/1 passed`；动态负例在 A 段重复三条 PASS/evidence、B/C 段 evidence 为空时，总审计输出 `EXPECTED_FAIL` 且只卡 `Attack Chain A/B/C`；A/B/C 三段各自完整时输出 `EXPECTED_PASS`。
- 发布判断：正式 release gate audit 仍 `FAIL`；真实 Attack Chain A/B/C 人工验证和分段 evidence 仍未完成。

## 6.6 Gray Observation OBSERVING Single-Gate Fail Loud

- 选片依据：继续 B 轨 gray observation 单项证据加固；`OBSERVING` 表示 14 天墙钟窗口尚未完成，单项脚本不能因为灰度 ID/开始时间齐全就输出 PASS。
- 红灯：新增 `GrayObservationGate_ShouldFailWhileObservationIsStillRunning` 后，目标架构门失败于缺少 `Status -eq "OBSERVING"` fail-loud token。
- 修复：`run-gray-observation.ps1` 在 `Status=OBSERVING` 时追加 `Gray observation is still running.` violation，使观察中报告保持 `Result: FAIL`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态 OBSERVING 样本带 GrayReleaseId、GrayStartedAt、Evidence 时输出 `EXPECTED_FAIL`；完整 PASS 样本满足 14 天窗口、P0/P1=0 和 evidence 时输出 `EXPECTED_PASS`。
- 发布判断：正式 gray observation 报告刷新后仍为 `NOT_STARTED` / `FAIL`；真实首次灰度和 14 天无 P0/P1 观察仍未完成。

## 6.6 Hosted CI gh run Evidence Gate

- 选片依据：继续 B 轨 hosted CI 单项证据加固；手填 RunUrl/RunId/job summary 不能替代授权环境里可查询的 GitHub Actions run 证据。
- 红灯：新增 `HostedCiEvidence_ShouldRequireGhRunListSuccessEvenWhenRunFieldsAreSupplied` 后，目标架构门失败于 hosted CI 脚本缺少 `gh run list must succeed...` fail-loud token。
- 修复：`run-hosted-ci-evidence.ps1` 将 `gh run list` 失败改为无条件 violation，不再允许提供 RunUrl 时绕过本地 `gh run` 查询失败。
- 验证：目标架构门 RED 后 `1/1 passed`；动态样本即使传入合法 GitHub Actions RunUrl、数字 RunId 和 job summary，也因 `gh run list` 不可用输出 `EXPECTED_FAIL`；脚本 parser `parse ok`。
- 回归：正式 `hosted-ci-20260602.md` 刷新后仍 `MISSING_REMOTE_RUN` / `Result: FAIL`，并包含 `gh run list must succeed...`；`HostedCiEvidence|ReleaseGateAudit` 架构过滤 `12/12 passed`；正式 release gate audit 仍 `EXPECTED_FAIL`，五个 B 轨 gate 均为 `FAIL`。
- 发布判断：本片只加固 hosted CI 单项证据，不生成真实 GitHub Actions run；v1.0.0 仍需授权环境提供真实 RunUrl、RunId、job summary 和 `gh run` 成功证据。

## 6.6 Staging Migration Connection Evidence

- 选片依据：继续 B 轨 PostgreSQL/staging 单项证据加固；staging 报告头写 API 容器连接串 `Host=postgresql`，但 EF migration 实际从宿主机使用 `Host=localhost`，两者必须在报告中区分。
- 红灯：新增 `StagingRehearsal_ShouldReportActualMigrationConnectionString` 后，目标架构门失败于脚本缺少 `$migrationConnectionString` 证据 token。
- 修复：`run-staging-rehearsal.ps1` 新增 `$migrationConnectionString`，报告头写入 `Migration connection string: Host=localhost...`，并用同一变量设置 `ConnectionStrings__DefaultConnection` 后执行 `dotnet ef database update`。
- 验证：目标架构门 RED 后 `1/1 passed`；正式 staging rehearsal 刷新仍因 Docker 不可用输出 `EXPECTED_FAIL`，但报告现在同时包含 API 容器连接串和迁移连接串；脚本 parser `parse ok`。
- 回归：`StagingRehearsal|ReleaseGateAudit` 架构过滤 `12/12 passed`；正式 release gate audit 仍 `EXPECTED_FAIL`，五个 B 轨 gate 均为 `FAIL`。
- 发布判断：本片只提高 staging 证据可追溯性，不证明真实 Docker/PostgreSQL/staging rehearsal 已完成。

## 6.6 Attack Chain Placeholder Evidence Gate

- 选片依据：继续 B 轨 Attack Chain 人工证据加固；`TBD`、`PENDING`、`待补` 这类占位字符串不能替代三条攻击链的真实验证证据。
- 红灯：新增 `AttackChainManualVerification_ShouldRejectPlaceholderEvidence` 后，目标架构门失败于脚本缺少 `Test-RealEvidence`。
- 修复：`run-attack-chain-verification.ps1` 新增 `Test-RealEvidence()`，将空值和 `TBD` / `TODO` / `PENDING` / `待补` / `待定` 都视为无效 evidence。
- 验证：目标架构门 RED 后 `1/1 passed`；动态样本给齐 Verifier、可解析 VerifiedAt、A/B/C PASS，但三段 evidence 使用占位词时输出 `EXPECTED_FAIL` 并写入 `Evidence cannot be a placeholder.`；脚本 parser `parse ok`。
- 回归：正式 `attack-chain-verification-20260602.md` 刷新后仍 `PENDING_MANUAL_VERIFICATION` / `Result: FAIL`；`AttackChain|ReleaseGateAudit` 架构过滤 `12/12 passed`；正式 release gate audit 仍 `EXPECTED_FAIL`。
- 发布判断：本片只防止占位人工证据误放行；真实 Attack Chain A/B/C 仍需真人验证和 dated evidence。

## 6.6 Release Gate Security Signoff Placeholder Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；Security signoff 的 signer/evidence 不能只要求非空，否则 `TBD` 这类占位词可能关闭安全签字 gate。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 后，目标架构门失败于总审计脚本缺少 `Test-RealEvidence`。
- 修复：`run-release-gate-audit.ps1` 新增 `Test-RealEvidence()`，并让 `Test-SecuritySignoffEvidencePass()` 用它校验 `Signer` 和 `Evidence`。
- 验证：目标架构门 RED 后 `1/1 passed`；动态负例中其它四个 gate 均为 PASS，Security signoff 写 `Status: SIGNED` / `Decision: SIGNED` 但 `Signer: TBD`、`Evidence: TBD`，总审计输出 `EXPECTED_FAIL` 且只卡 `Security signoff`；完整非占位签字样本输出 `EXPECTED_PASS`。
- 回归：`SecuritySignoff|ReleaseGateAudit` 架构过滤 `11/11 passed`；PowerShell parser `parse ok`；正式 release gate audit 仍 `EXPECTED_FAIL`。
- 发布判断：本片只防止占位签字证据误放行；真实 human signer、签字时间和 evidence 仍未完成。

## 6.6 Release Gate Attack Chain Placeholder Evidence Predicate

- 选片依据：继续 B 轨总闸门加固；Attack Chain 单项脚本已拒绝占位 evidence，但总审计也必须拒绝手工拼出的 `VERIFIED` + `TBD` 报告。
- 红灯：收紧 `ReleaseGateAudit_ShouldRequireAttackChainHumanEvidenceFields` 后，目标架构门失败于总审计未在 Attack Chain predicate 中调用 `Test-RealEvidence`。
- 修复：`run-release-gate-audit.ps1` 的 `Test-AttackChainEvidencePass()` 和 `Test-AttackChainSectionPass()` 现在用 `Test-RealEvidence()` 校验 Verifier 和各段 Evidence。
- 验证：目标架构门 RED 后 `1/1 passed`；动态负例中其它四个 gate 均 PASS，Attack Chain 写 `Status: VERIFIED`、可解析 `VerifiedAt`、A/B/C PASS，但 `Verifier: TBD` 且 evidence 为 `TBD/PENDING/待补`，总审计 `EXPECTED_FAIL` 且只卡 `Attack Chain A/B/C`；完整非占位 Attack Chain 样本 `EXPECTED_PASS`。
- 回归：`AttackChain|ReleaseGateAudit` 架构过滤 `12/12 passed`；PowerShell parser `parse ok`；正式 release gate audit 仍 `EXPECTED_FAIL`。
- 发布判断：本片只防止总闸门接受占位 Attack Chain 报告；真实 A/B/C 人工验证证据仍未完成。

## 6.6 Hosted CI Job Summary Placeholder Evidence Gate

- 选片依据：继续 B 轨 hosted CI 证据加固；`Evidence: TBD` 或 `Evidence: job summary: TBD` 不能替代真实 hosted runner job summary。
- 红灯：扩展 hosted CI 单项和总审计架构门后，目标过滤失败于 `run-hosted-ci-evidence.ps1` 缺少 `Test-RealEvidence`，且总审计未拒绝占位 job summary。
- 修复：`run-hosted-ci-evidence.ps1` 和 `run-release-gate-audit.ps1` 都新增/使用 `Test-RealEvidence()`；占位词本身或冒号后的主体为 `TBD/TODO/PENDING/待补/待定` 都视为无效。
- 验证：单项脚本传合法 RunUrl/RunId 但 `Evidence=TBD` 时输出 `EXPECTED_FAIL`；总闸门临时样本其它四项 PASS、Hosted CI 写 `Evidence: job summary: TBD` 时输出 `EXPECTED_FAIL` 且只卡 Hosted CI；非占位 job summary 合法样本 `EXPECTED_PASS`。
- 回归：正式 `hosted-ci-20260602.md` 刷新后仍 `MISSING_REMOTE_RUN` / `Result: FAIL`；`HostedCi|ReleaseGateAudit` 架构过滤 `13/13 passed`；两个 PowerShell 脚本 parser 均 `parse ok`；正式 release gate audit 仍 `EXPECTED_FAIL`。
- 发布判断：本片只防止占位 job summary 误放行；真实 GitHub Actions RunUrl、数字 RunId、job summary 和 `gh run` 成功证据仍未完成。

## 6.6 Gray Observation Placeholder Evidence Gate

- 选片依据：继续 B 轨 gray observation 证据加固；灰度观察 evidence 不能用 `TBD` / `PENDING` / `待补` 等占位词替代真实观察看板或事故查询证据。
- 红灯：扩展 `GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes` 和 gray 总审计门后，目标过滤失败于 `run-gray-observation.ps1` 缺少 `Test-RealEvidence`。
- 修复：`run-gray-observation.ps1` 新增 `Test-RealEvidence()`；`run-release-gate-audit.ps1` 的 `Test-GrayObservationEvidencePass()` 也改为用 `Test-RealEvidence()` 校验 Evidence。
- 验证：单项脚本在 `Status=PASS`、14 天窗口、P0/P1=0 都满足但 `Evidence=TBD` 时输出 `EXPECTED_FAIL`；总闸门临时样本其它四项 PASS、Gray observation `Evidence: TBD` 时 `EXPECTED_FAIL` 且只卡 Gray observation；非占位 observation evidence 合法样本 `EXPECTED_PASS`。
- 回归：正式 `gray-observation-20260602.md` 刷新后仍 `NOT_STARTED` / `Result: FAIL`；`GrayObservation|ReleaseGateAudit` 架构过滤 `12/12 passed`；两个 PowerShell 脚本 parser 均 `parse ok`；正式 release gate audit 仍 `EXPECTED_FAIL`。
- 发布判断：本片只防止占位灰度观察证据误放行；真实首次灰度和 14 天无 P0/P1 观察仍未完成。

## 6.6 Release Gate Hosted CI gh run Section Exit Code Predicate

- 选片依据：继续 B 轨 hosted CI 总审计加固；总闸门不能把 `git ls-remote` 或其它段落里的 `Exit code: 0` 当成 `gh run` 成功证据。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后，目标架构门失败于缺少 `Test-SectionExitCodeZero`。
- 修复：`run-release-gate-audit.ps1` 新增 `Test-SectionExitCodeZero()`，并要求 Hosted CI 的 `## gh run` 段落内存在 `Exit code: 0`。
- 验证：临时样本中 Hosted CI 报告含 `git ls-remote Exit code: 0`，但 `## gh run` 为 `Exit code: 1` 时，总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；改为 `## gh run Exit code: 0` 后合法样本 `EXPECTED_PASS`。
- 回归：`HostedCi|ReleaseGateAudit` 架构过滤 `13/13 passed`；PowerShell parser `parse ok`；正式 release gate audit 仍 `EXPECTED_FAIL`。
- 发布判断：本片只防止总闸门误读 exit code；真实 GitHub Actions run 查询仍需授权环境完成。

## 6.6 Release Gate Staging Section Exit Code Predicate

- 选片依据：继续 B 轨 PostgreSQL/staging 总审计加固；总闸门不能用无关段落的 4 个 `Exit code: 0` 替代 Docker、依赖启动、EF migration 和 API 启动四个 staging 段落成功。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireStagingRehearsalEvidenceFields` 后，目标架构门失败于缺少 `Test-SectionExitCodeZero $Text "Docker version"` 等 staging 段落级调用。
- 修复：`run-release-gate-audit.ps1` 的 `Test-StagingEvidencePass()` 改为要求 `Docker version`、`Start external dependencies`、`Apply EF migrations`、`Start API` 四个段落各自包含 `Exit code: 0`。
- 验证：临时样本中四个 staging 段落均为 `Exit code: 1`、但无关段落提供 4 个 `Exit code: 0` 时，总审计 `EXPECTED_FAIL` 且只卡 PostgreSQL/staging；四个 staging 段落改为 `Exit code: 0` 后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；PowerShell parser `parse ok`。
- 发布判断：本片只防止总闸门误读 staging exit code；真实 Docker/PostgreSQL/staging rehearsal 仍需外部环境完成。

## 6.6 Release Gate Security Signoff Blocking Text Predicate

- 选片依据：继续 B 轨安全签字总审计加固；签字包不能一边写 `Status: SIGNED` / `Decision: SIGNED`，一边在正文保留 Attack Chain `PENDING` / `FAIL` 或 `UNSIGNED` 阻断语义。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 后，目标架构门失败于缺少 `Test-NoBlockingSecuritySignoffText`。
- 修复：`run-release-gate-audit.ps1` 新增 `Test-NoBlockingSecuritySignoffText()`，Security signoff predicate 现在拒绝包含 `PENDING`、`UNSIGNED`、`FAIL` 的签字包正文。
- 验证：临时样本中其它四个 gate 均 PASS，Security signoff 字段为 SIGNED 但 Attack Chain 段落仍写 `PENDING` / `FAIL` 时，总审计 `EXPECTED_FAIL` 且只卡 Security signoff；清除阻断语义后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；PowerShell parser `parse ok`。
- 发布判断：本片只防止签字包自相矛盾地误放行；真实 human signer、安全签字时间和证据仍未完成。

## 6.6 Hosted CI Exact RunUrl Predicate

- 选片依据：继续 B 轨 hosted CI 证据加固；RunUrl 必须是精确 GitHub Actions run 页面，不能接受 `.../actions/runs/{id}/extra` 这类尾随路径。
- 红灯：扩展 `HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId` 后，目标架构门失败于 hosted CI 单项脚本缺少 `github.com/.+/actions/runs/\d+$` token。
- 修复：`run-hosted-ci-evidence.ps1` 与 `run-release-gate-audit.ps1` 的 `Test-GitHubActionsRunUrl()` 都改为尾部锚定到数字 run id。
- 验证：临时总审计样本中其它四项 PASS，Hosted CI `RunUrl=https://github.com/example/repo/actions/runs/123456/extra` 时 `EXPECTED_FAIL` 且只卡 Hosted CI；改为精确 `/runs/123456` 后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；两个 PowerShell 脚本 parser 均 `parse ok`。
- 发布判断：本片只防止 RunUrl 形态误放行；真实 hosted CI run 仍需授权环境查询和 job summary 证据。

## 6.6 Hosted CI RunUrl RunId Consistency Predicate

- 选片依据：继续 B 轨 hosted CI 证据加固；RunUrl 和 RunId 不能各自合法但指向不同 GitHub Actions run。
- 红灯：扩展 `HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId` 后，目标架构门失败于缺少 `Test-GitHubActionsRunUrlMatchesRunId`。
- 修复：`run-hosted-ci-evidence.ps1` 与 `run-release-gate-audit.ps1` 新增 `Test-GitHubActionsRunUrlMatchesRunId()`；单项脚本在 URL run id 与 RunId 不一致时追加 `RunUrl run id must match RunId.`，总审计也把一致性纳入 Hosted CI predicate。
- 验证：临时总审计样本中其它四项 PASS，Hosted CI `RunUrl=/runs/123456` 但 `RunId=999999` 时 `EXPECTED_FAIL` 且只卡 Hosted CI；RunId 改为 `123456` 后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；两个 PowerShell 脚本 parser 均 `parse ok`。
- 发布判断：本片只防止 RunUrl/RunId 错配误放行；真实 hosted CI run 仍需授权环境查询和 job summary 证据。

## 6.6 Hosted CI gh run Output RunId Predicate

- 选片依据：继续 B 轨 hosted CI 总审计加固；即使 RunUrl/RunId 字段一致，`## gh run` 成功段落也必须包含同一个 run id，避免手写字段和实际 CLI 查询输出脱节。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后，目标架构门失败于缺少 `Test-SectionContainsText`。
- 修复：`run-release-gate-audit.ps1` 新增 `Test-SectionContainsText()`，Hosted CI predicate 现在要求 `## gh run` 段落同时包含 `Exit code: 0` 和当前 `RunId`。
- 验证：临时总审计样本中其它四项 PASS，Hosted CI 字段为 `/runs/123456` + `RunId=123456`，但 `## gh run` 只含 `999999 completed success` 时 `EXPECTED_FAIL` 且只卡 Hosted CI；改为 `123456 completed success` 后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；PowerShell parser `parse ok`。
- 发布判断：本片只防止 `gh run` 输出与字段证据脱节；真实 hosted CI run 仍需授权环境查询和 job summary 证据。

## 6.6 Hosted CI gh run RunId Number Token Predicate

- 选片依据：继续 B 轨 hosted CI 总审计加固；`gh run` 段落匹配 RunId 不能用普通字符串包含，否则 `RunId=123456` 可能被 `91234567` 这类长数字子串误命中。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后，目标架构门失败于缺少 `Test-SectionContainsNumberToken`。
- 修复：`run-release-gate-audit.ps1` 将 `Test-SectionContainsText()` 收紧为 `Test-SectionContainsNumberToken()`，要求目标 RunId 左右不能紧邻数字。
- 验证：临时总审计样本中其它四项 PASS，Hosted CI `RunId=123456`，但 `## gh run` 只含 `91234567 completed success` 时 `EXPECTED_FAIL` 且只卡 Hosted CI；改为独立 `123456 completed success` 后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；PowerShell parser `parse ok`。
- 发布判断：本片只防止 `gh run` RunId 子串误读；真实 hosted CI run 仍需授权环境查询和 job summary 证据。

## 6.6 Hosted CI Single-Gate gh run RunId Predicate

- 选片依据：继续 B 轨 hosted CI 单项证据加固；总审计已要求 `gh run` 输出含目标 RunId，单项脚本也必须 fail loud，否则弱证据包可能生成 PASS 后再被总审计挡住。
- 红灯：扩展 `HostedCiEvidence_ShouldRequireGhRunListSuccessEvenWhenRunFieldsAreSupplied` 后，目标架构门失败于单项脚本缺少 `Test-TextContainsNumberToken` 和 `gh run list output must include RunId.`。
- 修复：`run-hosted-ci-evidence.ps1` 新增 `Test-TextContainsNumberToken()`；当 `gh run list` exit code 为 0 且 RunId 合法，但输出不含独立目标 RunId 时追加 violation。
- 验证：用临时 `gh.cmd` 模拟 `gh run list` 成功但只输出 `999999 completed success` 时，单项脚本 `EXPECTED_FAIL` 并写入 `gh run list output must include RunId.`；输出 `123456 completed success` 时合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；PowerShell parser `parse ok`。
- 发布判断：本片只让单项 hosted CI 证据和总审计口径一致；真实 hosted CI run 仍需授权环境查询和 job summary 证据。

## 6.6 Gray Observation Future End Time Gate

- 选片依据：转向 B 轨灰度观察墙钟闸门；`ObservationEndedAt` 不能是未来时间，否则 14 天无 P0/P1 观察窗口可能被提前声明完成。
- 红灯：扩展 gray observation 单项和总审计架构门后，目标过滤失败于缺少 `ObservationEndedAt must not be in the future.`。
- 修复：`run-gray-observation.ps1` 在 PASS 时间解析后拒绝未来 `ObservationEndedAt`；`run-release-gate-audit.ps1` 的 gray predicate 也要求 `ObservationEndedAt <= UtcNow`。
- 验证：未来结束时间样本在单项脚本输出 `EXPECTED_FAIL` 并写入 `ObservationEndedAt must not be in the future.`；同样的未来时间在总审计中 `EXPECTED_FAIL` 且只卡 Gray observation；过去满 14 天样本在单项和总审计均 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `2/2 passed`；两个 PowerShell 脚本 parser 均 `parse ok`。
- 发布判断：本片只防止未来时间提前关闭灰度墙钟窗口；真实首次灰度和 14 天无 P0/P1 观察仍未完成。

## 6.6 Gray Observation Timeline Ordering Gate

- 选片依据：继续 B 轨灰度观察墙钟闸门；`GrayStartedAt` 必须不晚于 `ObservationStartedAt`，否则观察窗口可能发生在灰度开始之前。
- 红灯：扩展 gray observation 单项和总审计架构门后，目标过滤失败于缺少 `GrayStartedAt must not be after ObservationStartedAt.`。
- 修复：`run-gray-observation.ps1` 在 PASS 时间解析后拒绝 `GrayStartedAt > ObservationStartedAt`；`run-release-gate-audit.ps1` 的 gray predicate 也要求灰度开始时间不晚于观察开始时间。
- 验证：`GrayStartedAt` 晚于 `ObservationStartedAt` 的样本在单项脚本输出 `EXPECTED_FAIL` 并写入 `GrayStartedAt must not be after ObservationStartedAt.`；同样乱序样本在总审计中 `EXPECTED_FAIL` 且只卡 Gray observation；时间顺序正常且过去满 14 天样本在单项和总审计均 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `2/2 passed`；两个 PowerShell 脚本 parser 均 `parse ok`。
- 发布判断：本片只保证灰度观察时间线自洽；真实首次灰度和 14 天无 P0/P1 观察仍未完成。

## 6.6 Gray Observation Anchored P0/P1 Counts Gate

- 选片依据：继续 B 轨灰度观察证据加固；总审计不能被备注里的 `P0/P1 incident counts: P0=0; P1=0` 文本骗过，必须校验独立计数字段。
- 红灯：扩展 `ReleaseGateAudit_ShouldRequireGrayObservationWindowEvidenceFields` 后，目标架构门失败于缺少 `Test-AnchoredLiteralLine $lines "P0/P1 incident counts: P0=0; P1=0"`。
- 修复：`run-release-gate-audit.ps1` 的 gray predicate 从全报告 `Contains` 改为 `Test-AnchoredLiteralLine`，只接受独立 `P0/P1 incident counts: P0=0; P1=0` 行。
- 验证：临时总审计样本中真实计数字段为 `P0=1; P1=0`，但 Notes 里包含 `P0/P1 incident counts: P0=0; P1=0` 时，输出 `EXPECTED_FAIL` 且只卡 Gray observation；真实计数字段改为 `P0=0; P1=0` 后合法样本 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `1/1 passed`；PowerShell parser `parse ok`。
- 发布判断：本片只防止 P0/P1 计数字段 spoof；真实首次灰度和 14 天无 P0/P1 观察仍未完成。

## 6.6 Gray Observation GrayReleaseId Placeholder Gate

- 选片依据：继续 B 轨灰度观察证据加固；`GrayReleaseId` 是首次灰度锚点，不能用 `TBD` / `PENDING` / `待补` 等占位词替代。
- 红灯：扩展 gray observation 单项和总审计架构门后，目标过滤失败于缺少 `GrayReleaseId cannot be a placeholder.` 和对 `GrayReleaseId` 的 `Test-RealEvidence` 校验。
- 修复：`run-gray-observation.ps1` 对非 `NOT_STARTED` 状态的 `GrayReleaseId` 使用 `Test-RealEvidence()`；`run-release-gate-audit.ps1` 的 gray predicate 也要求 `GrayReleaseId` 为非占位值。
- 验证：`GrayReleaseId=TBD` 的样本在单项脚本输出 `EXPECTED_FAIL` 并写入 `GrayReleaseId cannot be a placeholder.`；同样占位 ID 在总审计中 `EXPECTED_FAIL` 且只卡 Gray observation；改为 `gray-001` 后单项和总审计均 `EXPECTED_PASS`。
- 回归：目标架构门 RED 后 `2/2 passed`；两个 PowerShell 脚本 parser 均 `parse ok`。
- 发布判断：本片只防止灰度 ID 占位误放行；真实首次灰度和 14 天无 P0/P1 观察仍未完成。

## 6.6 Attack Chain Future VerifiedAt Gate

- 选片依据：切到 B 轨 Attack Chain 人工验证闸门；`VerifiedAt` 不能是未来时间，否则可能提前声明 A/B/C 人工验证完成并推动安全签字。
- 红灯：扩展 Attack Chain 单项和总审计架构门后，目标过滤失败于缺少 `VerifiedAt must not be in the future.`。
- 修复：`run-attack-chain-verification.ps1` 在解析 `VerifiedAt` 后拒绝未来时间；`run-release-gate-audit.ps1` 的 Attack Chain predicate 也要求 `VerifiedAt <= UtcNow`。
- 验证：未来 `VerifiedAt` 样本在单项脚本输出 `EXPECTED_FAIL` 并写入 `VerifiedAt must not be in the future.`；同样未来时间在总审计中 `EXPECTED_FAIL` 且只卡 Attack Chain；过去 `VerifiedAt` 样本在单项和总审计均 `EXPECTED_PASS`。
- 回归：`AttackChain|ReleaseGateAudit` 过滤 `12/12 passed`；两个 PowerShell 脚本 parser 均 `parse ok`。
- 发布判断：本片只防止未来人工验证时间误放行；真实 Attack Chain A/B/C 人工验证仍未完成。

## Project Core Convention Boutique Existing Features

- 变更：在根目录 `AGENTS.md` 增加项目级 Core Convention：现有功能必须优先打磨到精品级；宁愿一个功能做到 100 分，也不扩 100 个 1 分功能。
- 执行口径：新增/扩展功能前，先确认当前用户关键路径的正确性、UX、可靠性、可观测性和测试证据足够强；若与新功能扩张冲突，优先打磨现有关键路径。
- 边界：该片为规则/文档变更，不修改业务代码，不替代 B 轨 hosted CI、PostgreSQL/staging、Attack Chain、安全签字或灰度观察证据。

## 6.6 Release Gate Security Signoff Future SignedAt Gate

- 选片依据：继续 B 轨安全签字墙钟闸门；`SignedAt` 不能是未来时间，否则可能提前声明人工签字完成。
- 修复：`run-release-gate-audit.ps1` 的 Security signoff predicate 解析 `SignedAt` 后要求 `SignedAt <= UtcNow`，并保留 `SignedAt must not be in the future.` 架构门 token。
- 验证：动态样本中 Hosted CI、PostgreSQL/staging、Attack Chain A/B/C、Gray observation 均 PASS，Security signoff 使用未来 `SignedAt` 时总审计 `EXPECTED_FAIL` 且只卡 Security signoff；改为过去 `SignedAt` 后完整样本 `EXPECTED_PASS`。
- 发布判断：本片只防止未来签字时间误放行；真实 security signoff 仍需 human signer、真实 Attack Chain A/B/C 和具体 evidence。

## 6.6 Release Gate Security Signoff Future SignedAt Violation Detail

- 选片依据：继续精品化 B 轨审计输出；只显示 `Security signoff release gate is not PASS.` 不足以帮助 1 人 review 快速定位未来签字时间问题。
- 红灯：架构门新增 `violations.Add($futureSignedAtMessage)` 要求后，`ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 失败于脚本缺少该 token。
- 修复：`run-release-gate-audit.ps1` 在 `SignedAt` 可解析但晚于 `UtcNow` 时追加具体 violation：`SignedAt must not be in the future.`。
- 验证：未来 `SignedAt` 动态样本输出 `EXPECTED_FAIL`，报告同时包含具体 violation 和 Security signoff gate FAIL；过去 `SignedAt` 完整样本仍 `EXPECTED_PASS`。
- 发布判断：该片只提升 fail-loud 定位精度，不关闭安全签字或任何正式 B 轨发布闸门。
