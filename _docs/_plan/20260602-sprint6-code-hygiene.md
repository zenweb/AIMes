# 2026-06-02 Sprint 6 Code Hygiene Plan

## 6.6 ScheduleFeedbackPanel Sync Note Status A11y

- 目标：让调度员采纳/拒绝 Agent 推荐后的反馈同步成功提示具备可访问状态更新语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻排产链路测试、lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：按 Coverage-Leverage Routing，优先低覆盖且用户关键的排产反馈闭环；不继续精修已 100% 覆盖的登录页。
- 红灯：`schedule-board.test.ts` 用真实 `ScheduleFeedbackPanel` 触发 `.btn.accept`，`.sync-note` 显示 `反馈已同步后台`，但 `role` 为 `undefined`。
- 修复：`ScheduleFeedbackPanel.vue` 的 `.sync-note` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `schedule-board.test.ts` `4/4 passed`；相邻组合 `27/27 passed`；`npm run lint` 通过；`npm run test:unit` `70 files / 255 tests passed`；`npm run test:unit:coverage` `70 files / 255 tests passed`。
- 覆盖率记录：总行/语句覆盖率 `78.05%`；`ScheduleBoard.vue` `51.98%`；`ScheduleFeedbackPanel.vue` `100%`。
- 后续：A 轨继续按覆盖率杠杆选择低覆盖关键组件；B 轨发布闸门必须单独追 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 AuditDecisionReplayPanel Approval Badge Status A11y

- 目标：让审计回放页的关键配置待审批数量在异步加载后具备可访问状态更新语义。
- 成功标准：新增测试先红灯，修复后目标审计回放测试、相邻审计测试和 lint 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`AuditDecisionReplayPanel.vue` 属于审计/配置审批关键链路，覆盖率低于已精修组件；待审批数量是 reviewer 必须及时感知的状态。
- 红灯：`audit-decision-replay-panel.test.ts` 复现 `.approval-badge` 已显示 `1 个配置待审批`，但 `role` 为 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 的 `.approval-badge` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `audit-decision-replay-panel.test.ts` `3/3 passed`；相邻 `audit-log-board.test.ts` + `assistant-action-audit.test.ts` 合计 `7/7 passed`；`npm run lint` 通过。
- 后续：A 轨继续按覆盖率杠杆推进低覆盖关键组件；本轮未重跑 full unit / coverage。B 轨发布闸门仍必须依赖真实 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。

## B 轨 Release Gate Evidence Refresh

- 目标：在 2026-06-02 重新生成发布硬闸门证据包，确认当前阻断项是外部/人工证据缺口，而不是文档过期。
- 成功标准：四个脚本生成当天报告；报告必须明确 PASS/FAIL、状态、失败原因和不能关闭闸门的边界。
- 执行：复跑 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、gray observation 四个证据脚本。
- 结果：四份报告均生成，但均为 `Result: FAIL`。
- 当前缺口：hosted CI 缺远端 run URL/run id；staging 缺 Docker/staging 环境 PASS；Attack Chain 缺人工 verifier/时间戳/A-B-C 证据；gray observation 未开始。
- 后续：在有远端权限、Docker/staging 访问、人工安全验证和灰度环境的条件下补真实 PASS 证据；当前不得关闭任何 B 轨发布闸门。

## B 轨 Release Gate Aggregate Audit

- 目标：为 v1.0.0 B 轨硬闸门建立单一总审计入口，避免发布判断散落在多个单项报告里。
- 成功标准：架构门先红灯；新增脚本和当天总报告后，架构门通过；总报告必须明确五个闸门状态和发布不可关闭边界。
- 红灯：`ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 失败于缺少 `scripts/run-release-gate-audit.ps1`。
- 修复：新增 `scripts/run-release-gate-audit.ps1`，聚合 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、gray observation。
- 验证：目标架构门 `1/1 passed`；脚本生成 `_docs/_reports/release-gate-audit-20260602.md` 并按预期返回 `FAIL`。
- 后续：每次补 B 轨单项 PASS 证据后，必须重新运行聚合审计脚本；只有总报告 `Result: PASS` 且外部/人工证据真实可审，才能考虑关闭 v1.0.0 发布闸门。

## B 轨 Security Signoff Packet Refresh

- 目标：让安全签字包与 2026-06-02 的 B 轨证据包和聚合审计报告日期一致。
- 成功标准：架构门先红灯；新增当天 UNSIGNED 签字包并更新聚合脚本后，security signoff 和 release gate audit 两个架构门通过。
- 红灯：目标架构门失败于缺 `_docs/_review/20260602-security-signoff.md`，以及 `scripts/run-release-gate-audit.ps1` 未引用 `20260602-security-signoff`。
- 修复：新增 `_docs/_review/20260602-security-signoff.md`；聚合脚本默认 `SecuritySignoffPath` 改为当天签字包；重新生成 `_docs/_reports/release-gate-audit-20260602.md`。
- 验证：两个目标架构门 `2/2 passed`；总审计脚本继续按预期返回 `FAIL`。
- 后续：补 Attack Chain A/B/C 人工验证和 human signer 后，才允许把签字包从 `UNSIGNED` 改为 signed。

## B 轨 Release Gate Evidence Packet Presence

- 目标：让聚合发布闸门报告显式区分证据包是否存在，以及该闸门是否通过。
- 成功标准：架构门先红灯；脚本和报告新增 `Evidence packet status`、`FOUND`、`MISSING` 后，目标架构门通过。
- 红灯：`ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 失败于缺 `Evidence packet status`。
- 修复：`scripts/run-release-gate-audit.ps1` 在 Gate summary 中新增 evidence packet status 列，并在报告中写明 `FOUND or MISSING`。
- 验证：目标架构门 `1/1 passed`；脚本解析通过；总审计脚本继续按预期返回 `FAIL`。
- 后续：若任一证据包丢失，总报告应显示 `MISSING` 并保留 fail-loud；即使显示 `FOUND`，仍必须看 Gate Status 是否为 `PASS` / `SIGNED`。

## B 轨 Security Self-Assessment 20260602 Refresh

- 目标：刷新当天自动安全自评证据，避免 20260602 签字包继续引用 20260601 自评结果。
- 成功标准：先运行安全自评并记录失败；修复 npm audit 阻断后，安全自评报告为 `Result: PASS`，并更新当天签字包引用。
- 红灯：首次安全自评失败于 `npm audit failed with exit code 1`，npm audit 报告 `vitest` / `@vitest/coverage-v8` critical。
- 修复：升级 `vite` 到 `^6.4.2`，`vitest` 和 `@vitest/coverage-v8` 到 `^4.1.7`，并同步 `package-lock.json` / `node_modules`。
- 验证：`npm audit` `found 0 vulnerabilities`；Vitest `4.1.7` 最小测试 `2/2 passed`；lint 通过；安全自评最终 `Result: PASS`。
- 后续：若要进一步降低前端升级风险，应补跑 full unit / coverage / build；发布签字仍需要 Attack Chain A/B/C 人工验证和 signer。

## 6.6 AuditDecisionReplayPanel POC Signoff Replay Evidence Link

- 目标：让 POC 复盘签署回放可以从审计详情跳回报表中心证据入口，补齐签字证据复核链路。
- 成功标准：新增组件测试先红灯；修复后目标审计组合、Vitest 4 红点组合、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：继续执行 Coverage-Leverage Routing；`AuditDecisionReplayPanel.vue` 行覆盖仍低于多数已打开业务入口，且 POC 签署回放直接关联审计/签字证据复核。
- 红灯：POC 签署详情能展示证据批次，但缺 `.trace-link`，测试失败于 `Unable to get .trace-link`。
- 修复：`mapPocReviewSignoffToReplay` 增加 `/report` route 和 `报表中心` routeLabel；测试中将 POC 签署读取函数改为可控 mock。
- Vitest 4 夹具修复：将 `Html5Qrcode` / `Notification` mock 改为 function 构造器，并在相关测试显式设置 `BASE_URL=/scheduling/`。
- 验证：目标审计组合 `11/11 passed`；红点组合 `9/9 passed`；`npm run lint` 通过；`npm run test:unit:coverage` `70 files / 256 tests passed`。
- 覆盖率记录：总行覆盖 `55.31%`；`AuditDecisionReplayPanel.vue` 行覆盖 `62.06%`。
- 后续：继续按覆盖率杠杆选择低覆盖关键组件或 `AuditDecisionReplayPanel.vue` 的真实业务映射分支；B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 GanttChart Lightweight Marker A11y

- 目标：打开 `GanttChart.vue` 的首个组件测试，并让轻量甘特任务 marker 对辅助技术呈现为任务列表。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产/映射测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `GanttChart.vue` 行覆盖 `0.00%`；它是排产主入口和 Pareto 对比的核心可视化组件，优先级高于继续精修已高覆盖组件。
- 红灯：轻量 marker 可见，但 `.gantt-e2e-markers` 缺 `role="list"`。
- 修复：轻量 marker 容器和任务 marker 增加 list/listitem 语义与中文 aria-label。
- 验证：目标 `gantt-chart.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` + `gantt-mapper.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `71 files / 257 tests passed`。
- 覆盖率记录：总行覆盖 `55.65%`；`GanttChart.vue` 行覆盖 `17.85%`。
- 后续：继续按 Coverage-Leverage Routing 处理 `ChatPanel.vue`、`ScheduleAgentWorkbenchPanel.vue`、`QualityCapaTaskPanel.vue` 或继续扩展 `GanttChart.vue` 的 dhtmlx 初始化/拖拽事件测试。

## 6.6 ChatPanel Modal Dialog A11y

- 目标：打开 `ChatPanel.vue` 的首个专门组件测试，并让 AI 生产助手面板具备 modal dialog 语义和输入框可访问名称。
- 成功标准：新增测试先红灯；修复后目标测试、相邻布局测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `2.36%`、函数覆盖 `0%`，且该组件是主布局右下角 AI 生产助手入口，符合“最低覆盖且用户必经”的选片规则。
- 红灯：`.chat-panel` 缺 `role="dialog"`，测试失败于 `expected undefined to be 'dialog'`。
- 修复：面板增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="chat-panel-title"`；标题增加 `id="chat-panel-title"`；输入框增加 `aria-label="输入生产相关问题"`。
- 验证：目标 `chat-panel.test.ts` `1/1 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `72 files / 258 tests passed`。
- 覆盖率记录：总行覆盖 `55.92%`；`ChatPanel.vue` 行覆盖 `7.69%`，函数覆盖 `3.63%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖 `ChatPanel.vue` 的真实用户发送、权限拒绝、动作执行、报表导出或异常处置卡生成分支；B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 ScheduleAgentWorkbenchPanel Action Status A11y

- 目标：打开 `ScheduleAgentWorkbenchPanel.vue` 的首个专门组件测试，并让调度员触发后端建议后的动作结果具备可访问状态更新语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleAgentWorkbenchPanel.vue` 行覆盖 `16.47%`、函数/分支覆盖 `0%`，且是 AI 排产工作台后端建议、采纳、拒绝的关键入口。
- 红灯：点击 `生成后端建议` 后 `.agent-action-note` 显示 `后端已生成 2 个方案`，但 `role` 为 `undefined`。
- 修复：动作反馈段落增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `schedule-agent-workbench-panel.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `73 files / 259 tests passed`。
- 覆盖率记录：总行覆盖 `56.55%`；`ScheduleAgentWorkbenchPanel.vue` 行覆盖 `81.17%`，函数覆盖 `80.76%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖采纳/拒绝失败提示、后端决策加载和权限错误路径。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 QualityCapaTaskPanel Open Count Status A11y

- 目标：打开 `QualityCapaTaskPanel.vue` 的首个专门组件测试，并让质量 CAPA 待验证数量具备可访问状态更新语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻质量页/CAPA sync 测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`QualityCapaTaskPanel.vue` 行覆盖 `17.82%`、函数/分支覆盖 `0%`，且是质量 CAPA 任务闭环、复用草案转正式 CAPA 和效果回写的关键入口。
- 红灯：默认挂载后 `.status-badge` 显示 `3 个待验证`，但 `role` 为 `undefined`。
- 修复：待验证数量 badge 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `quality-capa-task-panel.test.ts` `1/1 passed`；相邻 `quality-board.test.ts` + `quality-capa-sync.test.ts` `5/5 passed`；`npm run lint` 通过；coverage `74 files / 260 tests passed`。
- 覆盖率记录：总行覆盖 `56.87%`；`QualityCapaTaskPanel.vue` 行覆盖 `45.00%`，函数覆盖 `26.47%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖 CAPA 推进、正式 CAPA 转换、复用效果验证和助手执行包质量责任闭环。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 ParetoCompare Modal Dialog A11y

- 目标：打开 `ParetoCompare.vue` 的首个专门组件测试，并让多目标方案对比浮层具备 modal dialog 语义和关闭按钮可访问名称。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ParetoCompare.vue` 行覆盖 `11.11%`、函数/分支覆盖 `0%`，且是 AI 排产多目标方案对比和采用推荐方案的关键入口。
- 红灯：`.compare-container` 缺 `role="dialog"`，测试失败于 `expected undefined to be 'dialog'`。
- 修复：浮层容器增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="pareto-compare-title"`；标题增加稳定 id；关闭按钮增加 `aria-label="关闭多目标方案对比"`。
- 验证：目标 `pareto-compare.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `75 files / 261 tests passed`。
- 覆盖率记录：总行覆盖 `57.07%`；`ParetoCompare.vue` 行覆盖 `21.73%`，语句覆盖 `20.68%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖 demo fallback、方案采用事件、tab 切换和雷达/KPI 归一化函数。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 EquipmentScheduleImpactPanel Downtime Sync Status A11y

- 目标：打开 `EquipmentScheduleImpactPanel.vue` 的首个专门组件测试，并让设备故障同步 AI 排产后的结果具备可访问状态更新语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻设备页/设备风险同步测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`EquipmentScheduleImpactPanel.vue` 行覆盖 `26.31%`、函数/分支覆盖 `0%`，且是设备停机事件同步 AI 排产和 OTD 证据链的关键入口。
- 红灯：点击 `标记故障并同步排产` 后 `.sync-note` 显示 `设备故障已同步 AI 排产`，但 `role` 为 `undefined`。
- 修复：同步结果 `.sync-note` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `equipment-schedule-impact-panel.test.ts` `1/1 passed`；相邻 `equipment-board.test.ts` + `equipment-risk-sync.test.ts` `10/10 passed`；`npm run lint` 通过；coverage `76 files / 262 tests passed`。
- 覆盖率记录：总行覆盖 `57.24%`；`EquipmentScheduleImpactPanel.vue` 行覆盖 `64.86%`，函数覆盖 `66.66%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖客户故障样例生成、异常分流维护单和真实后台同步分支。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 ChatPanel Message Log A11y

- 目标：让 `ChatPanel.vue` 的消息列表具备可访问消息日志语义，使助手回复更新能被辅助技术感知。
- 成功标准：新增测试先红灯；修复后目标测试、相邻布局测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖仍为 `7.69%`，且 AI 生产助手是高频入口；本片只补消息区语义，不扩动作执行或导出分支。
- 红灯：`.chat-messages` 缺 `role="log"`，测试失败于 `expected undefined to be 'log'`。
- 修复：消息容器增加 `role="log"`、`aria-live="polite"` 和 `aria-label="AI 生产助手消息"`。
- 验证：目标 `chat-panel.test.ts` `2/2 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `76 files / 263 tests passed`。
- 覆盖率记录：总行覆盖 `57.24%`；`ChatPanel.vue` 行覆盖 `7.69%`，函数覆盖 `3.63%`；本片覆盖率增量为 `0.00` 个点。
- 后续：继续按 Coverage-Leverage Routing 转向能带来业务分支覆盖的低覆盖关键组件；若继续 `ChatPanel.vue`，必须覆盖真实发送、权限拒绝、报表导出或异常处置卡生成。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 FeedbackForm Submission Failure Alert A11y

- 目标：覆盖排产采纳反馈提交失败路径，并让失败提示具备可访问 alert 播报语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`FeedbackForm.vue` 行覆盖 `21.42%`、函数覆盖 `0%`，且该浮层是 AI 排产方案采纳反馈和模型改进闭环的用户关键入口。
- 红灯：错误文案出现但缺 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：错误提示增加 `role="alert"` 和 `aria-live="assertive"`；保留 `errorMessage(e, '未知错误')` 统一错误文案提取。
- 验证：目标 `feedback-form.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `77 files / 264 tests passed`。
- 覆盖率记录：总行覆盖 `57.49%`；`FeedbackForm.vue` 行覆盖从 `21.42%` 提升到 `85.71%`，函数覆盖从 `0%` 提升到 `57.14%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖成功提交 payload/emit 和必填禁用状态。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 DocumentUpload Customer Import Status A11y

- 目标：覆盖客户真实工单导入样例生成路径，并让导入批次/订单数/高风险识别结果具备可访问状态更新语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻知识治理测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖 `30.28%`、函数覆盖 `16.39%`，且客户工单导入直接关联 POC 数据缺口、验收证据和执行闭环评分。
- 红灯：点击生成样例后 `.import-metrics` 缺 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：导入指标容器增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `document-upload.test.ts` `3/3 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；coverage `77 files / 265 tests passed`。
- 覆盖率记录：总行覆盖 `57.53%`；`DocumentUpload.vue` 行覆盖从 `30.28%` 提升到 `34.48%`，函数覆盖从 `16.39%` 提升到 `21.31%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖成功上传、过大文件拒绝和质量知识治理事件。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 ParetoCompare Demo Fallback Recommendation A11y

- 目标：覆盖多目标方案对比的后端失败 demo fallback，并让推荐方案卡片具备可访问状态更新语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ParetoCompare.vue` 行覆盖 `21.73%`、函数覆盖 `1.96%`，且多目标对比是 AI 排产采用推荐方案的关键路径。
- 红灯：demo fallback 已显示 `综合平衡` 推荐方案，但 `.recommend-card` 缺 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：推荐卡片增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `pareto-compare.test.ts` `2/2 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `77 files / 266 tests passed`。
- 覆盖率记录：总行覆盖 `58.79%`；`ParetoCompare.vue` 行覆盖从 `21.73%` 提升到 `90.06%`，函数覆盖从 `1.96%` 提升到 `86.27%`。
- 后续：继续按 Coverage-Leverage Routing 覆盖低覆盖关键组件；若回到本组件，优先覆盖真实 API 成功返回、tab 切换或 KPI/雷达归一化边界。B 轨发布闸门仍必须单独补真实外部/人工证据。

## 6.6 ChatPanel Send Path Source Disclosure A11y

- 目标：覆盖 AI 生产助手真实发送问题路径，并让后端参考来源展开控件具备原生按钮语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖仅 `7.69%`、函数覆盖 `3.63%`，且 AI 生产助手是高频入口；本片按 Claude Opus 建议转向覆盖率增量和用户必经路径，不继续做零增量模板微切片。
- 红灯：用户发送问题后，`queryKnowledge` payload、助手回答和 `参考来源 (1)` 已出现，但 `.sources-toggle` 不是 `button`，测试失败于 `Unable to get button.sources-toggle`。
- 修复：来源展开控件从 `span` 改为 `button type="button"`，增加 `aria-expanded`，并最小化重置按钮默认 CSS。
- 验证：目标 `chat-panel.test.ts` `3/3 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `77 files / 267 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `59.99%`；`ChatPanel.vue` 行覆盖从 `7.69%` 提升到 `28.20%`，函数覆盖从 `3.63%` 提升到 `26.36%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若回到 `ChatPanel.vue`，优先覆盖权限拒绝、报表导出、异常处置卡生成或引用治理分支。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 GanttChart Drag Conflict Coverage

- 目标：覆盖真实 dhtmlx 甘特拖拽结束后的同设备时间重叠冲突检测，确认关键排产保护不会被后续改动静默破坏。
- 成功标准：新增测试先暴露旧测试夹具无法进入真实 dhtmlx 分支；修正夹具后目标测试、相邻排产主页面测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`GanttChart.vue` 行覆盖约 `15.47%`，且甘特拖拽冲突是 AI 排产主页面的用户必经风险路径；该片符合覆盖率增量和业务关键度路由。
- 红灯：真实 dhtmlx 分支测试先失败于 `localStorage.clear/getItem is not a function`，证明旧夹具无法稳定覆盖非轻量模式；修正夹具后业务断言通过，生产逻辑无需修改。
- 修复：测试 hoist dhtmlx mock，捕获 `attachEvent` 注册的 handler，并 mock `isOfflineDemoMode=false`；新增 `onAfterTaskDrag` 同设备重叠断言。
- 验证：目标 `gantt-chart.test.ts` `2/2 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `77 files / 268 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `60.67%`；`GanttChart.vue` 行覆盖从 `15.47%` 提升到 `51.19%`，函数覆盖 `40.54%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若回到 `GanttChart.vue`，优先覆盖锁定期阻止拖拽、scale 切换和实时拖拽冲突标记。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Successful Upload Coverage

- 目标：覆盖知识文档成功上传路径，确认上传 API payload、队列状态和后端索引结果历史记录不会被后续改动破坏。
- 成功标准：新增测试覆盖选择 PDF、点击上传、API 调用、队列 `已上传` 和上传记录表；目标测试、相邻知识治理测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖 `34.48%`，且文档上传是知识入库、RAG 治理和 POC 证据入口；该片符合覆盖率增量和业务关键度路由。
- 红灯/GREEN：新增测试直接 GREEN，生产逻辑无需修改；本片性质为关键路径覆盖补强。
- 修复：测试 hoist `uploadDocument` mock，新增成功上传断言；未修改 `DocumentUpload.vue`。
- 验证：目标 `document-upload.test.ts` `4/4 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；coverage `77 files / 269 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `60.94%`；`DocumentUpload.vue` 行覆盖从 `34.48%` 提升到 `47.70%`，函数覆盖 `29.50%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若回到 `DocumentUpload.vue`，优先覆盖过大文件拒绝、上传失败队列错误和质量知识治理事件。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Scan API Success Selection

- 目标：修复生产执行后端扫码成功但未选中工单的问题，让扫码返回的工序可立即在右侧详情区操作，并以状态通知反馈。
- 成功标准：新增测试先红灯；修复后目标测试、相邻扫码证据/异常测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖 `39.51%`，且扫码定位是现场生产执行高频必经路径；该片符合覆盖率增量和业务关键度路由。
- 红灯：扫码 API 返回 `WO-020 / OP-20` 后右侧仍未选中工单，失败于 `Unable to get .detail-title-row h3`。
- 修复：`handleScan()` 成功调用 `scanOperation` 后匹配当前页工单，设置 `selectedWo`，保留返回工序到 `currentOperations`，清空输入并通知 `已定位工序：WO-020 / OP-20`。
- 验证：目标 `production-board.test.ts` `4/4 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `77 files / 270 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：本轮总行覆盖 `60.92%`；`ProductionBoard.vue` 行覆盖从 `39.51%` 提升到 `40.63%`，函数覆盖从 `35.45%` 提升到 `36.03%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若回到 `ProductionBoard.vue`，优先覆盖开工成功、完工质量门、异常上报和条码证据写入。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Confirm Status Sync

- 目标：修复采购单确认成功后详情与列表状态不一致的问题，让采购确认主路径在列表刷新返回旧快照时仍显示一致状态。
- 成功标准：新增测试先红灯；修复后目标测试、相邻采购短缺同步测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `45.34%`、函数覆盖约 `22.66%`，采购确认是采购主流程关键动作；该片符合覆盖率增量和业务关键度路由。
- 红灯：确认接口返回 `Confirmed` 后右侧详情为 `已确认`，但刷新列表返回旧 `Submitted`，左侧活动订单仍显示 `已提交`。
- 修复：`handleConfirm()` 在 `refreshList()` 后，用当前确认返回的 `selected` 详情同步覆盖 `orders` 中同一订单摘要。
- 验证：目标 `purchase-board.test.ts` `3/3 passed`；相邻采购短缺同步测试实际运行 `shortage-risk-sync.test.ts` `9/9 passed`；`npm run lint` 通过；coverage `77 files / 271 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.09%`；`PurchaseBoard.vue` 行覆盖提升到 `48.84%`，函数覆盖提升到 `27.63%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续采购链路，优先覆盖收货成功、取消失败、供应延期升级或外协到货确认。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 GanttToolbar Explicit Action Buttons

- 目标：覆盖排产工具栏命令事件，并修复操作按钮缺少显式 `type="button"` 的默认提交风险。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`GanttToolbar.vue` 行覆盖 `41.66%`、函数覆盖 `0%`，且它承载排产优化、刷新、采纳反馈、多目标对比和导出入口；该片符合覆盖率增量和用户必经路径路由。
- 红灯：五个按钮缺少显式 `type`，测试失败于 `expected undefined to be 'button'`。
- 修复：五个操作按钮增加 `type="button"`；测试覆盖五个命令事件和 `update:objective` / `update:scale`。
- 验证：目标 `gantt-toolbar.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `78 files / 272 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.17%`；`GanttToolbar.vue` 行覆盖从 `41.66%` 提升到 `100%`，函数覆盖从 `0%` 提升到 `100%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续排产链路，优先覆盖 `ScheduleBoard.vue` 真实业务分支、`GanttChart.vue` 锁定期/scale 切换或 `ScheduleMetrics.vue`。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleMetrics KPI Status A11y

- 目标：覆盖排产首屏 KPI 展示，并让指标变化具备可访问状态播报语义。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleMetrics.vue` 行覆盖 `43.75%`、函数覆盖 `0%`，且 KPI 条是调度员判断优化结果的首屏入口；该片符合覆盖率增量和用户必经路径路由。
- 红灯：`.metrics-bar` 缺少 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：KPI 条增加 `role="status"`、`aria-live="polite"` 和 `aria-label="排产指标"`；测试覆盖阈值颜色和四个指标显示。
- 验证：目标 `schedule-metrics.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `79 files / 273 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.25%`；`ScheduleMetrics.vue` 行覆盖从 `43.75%` 提升到 `87.50%`，函数覆盖从 `0%` 提升到 `100%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续排产链路，优先覆盖 `ScheduleBoard.vue` 真实业务分支、`GanttChart.vue` 锁定期/scale 切换或 `ScheduleRecoveryHandoffPanel.vue`。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleRecoveryHandoffPanel Status Coverage

- 目标：覆盖交期恢复执行包交接面板，确认执行包状态可被辅助技术感知，闭环按钮继续发出正确事件。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleRecoveryHandoffPanel.vue` 行覆盖约 `61.90%`、函数覆盖 `0%`，且执行包交接串联排产、采购、风险和质量责任动作；该片符合覆盖率增量和用户关键路径路由。
- 红灯：面板缺少 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：执行包 section 增加 `role="status"` 和 `aria-live="polite"`；测试覆盖活动建议、人工反馈和 `close-handoff` 事件。
- 验证：目标 `schedule-recovery-handoff-panel.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `80 files / 274 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.34%`；`ScheduleRecoveryHandoffPanel.vue` 行覆盖提升到 `100%`，函数覆盖提升到 `100%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续排产链路，优先覆盖 `ScheduleBoard.vue` 真实业务分支、`GanttChart.vue` 锁定期/scale 切换或 `ScheduleConstraintPanel` 类约束视图（若后续存在）。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleEventQueuePanel Agent Suggestion Status

- 目标：覆盖事件触发 Agent 队列，确认当前 Agent 建议状态可被辅助技术感知，生成和采纳事件继续透传正确 payload。
- 成功标准：新增测试先红灯；修复后目标测试、相邻排产主页面测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleEventQueuePanel.vue` 行覆盖约 `66.66%`、函数覆盖 `0%`，且事件生成/采纳 Agent 建议是 AI 排产主流程关键交互；该片符合覆盖率增量和用户关键路径路由。
- 红灯：当前 Agent 建议区域缺少 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：`.agent-suggestion` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="当前 Agent 建议"`；测试覆盖事件证据、推荐方案、`generate` 和 `adopt`。
- 验证：目标 `schedule-event-queue-panel.test.ts` `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `81 files / 275 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.41%`；`ScheduleEventQueuePanel.vue` 行覆盖提升到 `100%`，函数覆盖提升到 `100%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；排产链路已精修到多个小组件 100%，下一步更应转向 `ScheduleBoard.vue` 真实业务分支、`GanttChart.vue` 锁定期/scale 切换或非排产低覆盖关键组件。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 KnowledgeGovernancePanel Risk Badge Status A11y

- 目标：让知识治理过期风险数量具备可访问状态更新语义，同时明确该片不具备覆盖率杠杆，不作为继续微调同组件的理由。
- 成功标准：新增/扩展测试先红灯；修复后目标测试、相邻文档上传测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`KnowledgeGovernancePanel.vue` 仍低覆盖，但本片只处理 `.risk-badge` 的语义缺口；按 Claude Opus 的建议，后续应转向真实业务分支或其他低覆盖用户必经组件。
- 红灯：`.risk-badge` 缺少 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：`.risk-badge` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="知识库过期风险数量"`。
- 验证：目标 `knowledge-governance-panel.test.ts` `2/2 passed`；相邻 `document-upload.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `81 files / 275 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：fresh 总行覆盖 `61.40%`，相对上一轮 `61.41%` 轻微波动下行；`KnowledgeGovernancePanel.vue` 行覆盖 `36.63%`、函数覆盖 `29.82%`。
- 后续：A 轨下一片优先 `DocumentUpload.vue` 过大文件拒绝/上传失败、`ProductionBoard.vue` 开工/完工质量门、`PurchaseBoard.vue` 收货/取消失败或 `ChatPanel.vue` 权限拒绝等真实业务分支；B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Upload Failure Alert A11y

- 目标：覆盖知识文档上传失败路径，确认单文件上传失败会在队列行以可访问 alert 立即播报。
- 成功标准：新增测试先红灯；修复后目标测试、相邻知识治理测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖 `47.70%`，且文档上传是知识入库、RAG 治理和 POC 证据入口；上传失败比继续做同页纯模板微调更贴近用户关键路径。
- 红灯：上传 API 失败后 `.status-err` 缺少 `role="alert"`，测试失败于 `expected undefined to be 'alert'`。
- 修复：上传失败状态增加 `role="alert"` 和 `aria-live="assertive"`；测试同时断言错误文本和历史记录仍为空。
- 验证：目标 `document-upload.test.ts` `5/5 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；coverage `81 files / 276 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.44%`；`DocumentUpload.vue` 行覆盖从 `47.70%` 提升到 `49.42%`，函数覆盖 `29.50%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续 `DocumentUpload.vue`，优先覆盖过大文件拒绝与拖拽上传路径，不做纯视觉微调。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Start API Failure Guard

- 目标：覆盖生产执行开工失败路径，确认后端拒绝开工时前端不会乐观推进工序/工单状态，并给操作员明确 alert。
- 成功标准：新增测试先红灯；修复后目标测试、相邻扫码证据/生产异常测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖 `40.63%`，且开工是现场生产执行主路径；失败保护比模板属性更能提升发布就绪度。
- 红灯：开工 API 失败后工序 badge 变成 `生产中`，测试失败于 `expected '生产中' to be '待生产'`。
- 修复：`confirmStart()` catch 中使用 `errorMessage(e, '请稍后重试')` 生成失败消息，调用 `notify(..., 'error')` 后立即 `return`。
- 验证：目标 `production-board.test.ts` `5/5 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `81 files / 277 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.68%`；`ProductionBoard.vue` 行覆盖从 `40.63%` 提升到 `44.84%`，函数覆盖从 `36.03%` 提升到 `37.83%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续 `ProductionBoard.vue`，优先覆盖完工质量门失败、异常上报 API 失败或条码证据写入。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Completion API Failure Guard

- 目标：覆盖生产执行完工失败路径，确认后端拒绝完工时前端不会乐观推进工序/工单、质量门或 OTD 证据链，并给操作员明确 alert。
- 成功标准：新增测试先红灯；修复后目标测试、相邻扫码证据/生产异常测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖 `44.84%`，且完工报数会联动质量门和 OTD 证据，是现场生产执行主路径。
- 红灯：完工 API 失败后工序 badge 变成 `已完成`，测试失败于 `expected '已完成' to be '生产中'`。
- 修复：`confirmComplete()` catch 中使用 `errorMessage(e, '请稍后重试')` 生成失败消息，调用 `notify(..., 'error')` 后立即 `return`。
- 验证：目标 `production-board.test.ts` `6/6 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `81 files / 278 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `61.94%`；`ProductionBoard.vue` 行覆盖从 `44.84%` 提升到 `49.40%`，函数覆盖从 `37.83%` 提升到 `40.54%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续 `ProductionBoard.vue`，优先覆盖异常上报 API 失败、条码证据写入或不良品质量门冻结。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Exception API Failure Guard

- 目标：覆盖生产执行异常上报失败路径，确认后端拒绝异常事件时前端不会写本地异常、风险追踪或 OTD 证据链，并给操作员明确 alert。
- 成功标准：新增测试先红灯；修复后目标测试、相邻扫码证据/生产异常测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖 `49.40%`，且异常上报直接联动异常管理、风险队列和 OTD 证据链，是现场生产执行失败闭环主路径。
- 红灯：异常 API 失败前 `writeProductionAnomalyEvent` 已被调用，测试失败于 `expected "vi.fn()" to not be called at all`。
- 修复：`confirmException()` 先执行 `reportException`；catch 中使用 `errorMessage(e, '请稍后重试')` 生成失败消息，调用 `notify(..., 'error')` 后立即 `return`。
- 验证：目标 `production-board.test.ts` `7/7 passed`；相邻 `barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `81 files / 279 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.16%`；`ProductionBoard.vue` 行覆盖从 `49.40%` 提升到 `53.34%`，函数覆盖从 `40.54%` 提升到 `44.14%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ProductionBoard.vue` 三条失败保护已覆盖，下一片可转向 `PurchaseBoard.vue` 收货/取消失败、`ChatPanel.vue` 权限拒绝或 `QualityCapaTaskPanel.vue` CAPA 推进。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Cancellation API Failure Guard

- 目标：覆盖采购取消失败路径，确认后端拒绝取消时前端不会乐观推进采购单状态，并给采购员明确 alert。
- 成功标准：新增测试先红灯；修复后目标测试、相邻采购短缺同步测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `48.84%`，且取消采购单是采购主流程关键失败路径；该片符合覆盖率增量和用户关键路径路由。
- 红灯：取消 API 失败后详情状态变成 `已取消`，测试失败于 `expected '已取消' to be '已确认'`。
- 修复：`handleCancel()` catch 中使用 `errorMessage(error, '请稍后重试')` 生成失败消息，写入 `notification` alert 后立即 `return`。
- Coverage 稳定性处理：`schedule-board.test.ts` 顶层 mock `GanttChart.vue`，避免排产主页面单测通过 async component loader 隐式加载真实 dhtmlx/CSS 并在 full coverage teardown 后报错。
- 验证：目标 `purchase-board.test.ts` `4/4 passed`；相邻 `shortage-risk-sync.test.ts` `9/9 passed`；`schedule-board.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `81 files / 280 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.20%`；`PurchaseBoard.vue` 行覆盖从 `48.84%` 提升到 `50.37%`，函数覆盖从 `27.63%` 提升到 `28.94%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`PurchaseBoard.vue` 可继续覆盖收货成功、供应延期升级、替代到货或外协到货确认；B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Restricted Action Refusal Alert

- 目标：覆盖 AI 助手动作权限拒绝路径，确认非 Admin 用户点击受限动作时不会跳转/执行，并能收到可访问 alert。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `28.20%`，且 AI 助手是高频入口；权限拒绝比继续做普通模板属性更贴近安全边界和发布就绪。
- 红灯：拒绝消息已显示但缺 `role="alert"`，测试失败于 `Unable to get .message.assistant[role="alert"]`。
- 修复：`ChatMessage` 类型增加可选 `liveRole`；`addMessage()` 支持传入 `alert`；权限拒绝分支以 alert 消息反馈并保持 `recordAssistantActionAudit(permitted: false)`。
- 验证：目标 `chat-panel.test.ts` `4/4 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 281 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.40%`；`ChatPanel.vue` 行覆盖从 `28.20%` 提升到 `31.55%`，函数覆盖 `32.72%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续 `ChatPanel.vue`，优先覆盖报表导出、异常处置卡生成、引用治理或服务端问答失败 fallback。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel OTD Report Export Status

- 目标：覆盖 AI 助手导出 OTD/POC 复盘动作，确认 CSV 导出、下载触发、报表中心跳转、成功审计和可访问完成提示均成立。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `31.55%`，且报表导出是 POC 复盘和客户验收证据出口；本片继续覆盖真实动作分支。
- 红灯：导出副作用均发生，但完成消息缺 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`ChatMessage.liveRole` 扩展 `status`；普通动作完成消息传入 `status`，模板用 `aria-live="polite"` 播报。
- 验证：目标 `chat-panel.test.ts` `5/5 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 282 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.71%`；`ChatPanel.vue` 行覆盖从 `31.55%` 提升到 `36.88%`，函数覆盖 `35.45%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；若继续 `ChatPanel.vue`，优先覆盖异常处置卡生成、引用治理或服务端问答失败 fallback，不再做普通模板属性微调。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Oversized File Rejection Coverage

- 目标：覆盖知识文档超大文件拒绝路径，确认超过 50MB 的文件在上传前被拦截，并以可访问 alert 告知用户。
- 成功标准：若现有行为缺口则先红灯再修复；若现有生产代码已满足，则记录为 coverage-only GREEN/no production change；随后运行目标测试、相邻知识治理测试、lint、coverage 和发布闸门审计命令，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖 `49.42%`，且文档上传是知识入库、RAG 治理和 POC 证据入口；超大文件拒绝比继续精修高覆盖组件更符合 Coverage-Leverage Routing。
- 绿灯：新增测试直接通过；现有代码已对 `f.size > 50 * 1024 * 1024` 设置 `文件过大 (最大 50MB): ...`，并通过 `.error-msg[role="alert"]` 播报。
- 修复：无生产代码变更；测试断言超大文件不进入上传队列、上传按钮禁用、`uploadDocument` 不被调用。
- 验证：目标 `document-upload.test.ts` `6/6 passed`；相邻 `knowledge-governance-panel.test.ts` `2/2 passed`；`npm run lint` 通过；coverage `81 files / 283 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.73%`；`DocumentUpload.vue` 行覆盖从 `49.42%` 提升到 `50.57%`，函数覆盖 `29.50%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`DocumentUpload.vue` 可继续覆盖拖拽上传路径或质量知识治理事件，但不要在同一错误文案上继续微调。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Receive API Failure Guard

- 目标：覆盖采购普通收货失败路径，确认后端拒绝收货时前端不会关闭弹窗或误导采购员，并以可访问 alert 给出失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、相邻采购短缺同步测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `50.37%`，且收货是采购主流程和库存入库前置动作；失败保护比继续精修已高覆盖组件更贴近发布就绪。
- 红灯：收货 API 失败后弹窗关闭，测试失败于 `expected false to be true`。
- 修复：`handleReceive()` catch 中使用 `errorMessage(error, '请稍后重试')` 生成失败消息，写入 `notification` alert 后立即 `return`。
- 验证：目标 `purchase-board.test.ts` `5/5 passed`；相邻 `shortage-risk-sync.test.ts` `9/9 passed`；`npm run lint` 通过；coverage `81 files / 284 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.81%`；`PurchaseBoard.vue` 行覆盖从 `50.37%` 提升到 `53.18%`，函数覆盖从 `28.94%` 提升到 `36.84%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`PurchaseBoard.vue` 已覆盖确认同步、取消失败和普通收货失败，下一片可转向供应延期升级、替代到货或外协到货确认。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 QualityCapaTaskPanel Verified Closure Status

- 目标：覆盖 CAPA 执行中任务推进到已验证路径，确认会写入质量 CAPA 闭环 payload，并把审计/OTD 同步结果作为可访问状态更新播报。
- 成功标准：新增测试先红灯；修复后目标测试、相邻 CAPA 同步测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`QualityCapaTaskPanel.vue` 行覆盖约 `45.00%`，且 CAPA 验证闭环是质量主流程和 OTD 复盘的关键出口；比继续精修已高覆盖小组件更符合 Coverage-Leverage Routing。
- 红灯：CAPA 闭环完成消息缺少 `role="status"`，测试失败于 `expected undefined to be 'status'`。
- 修复：`.closure-sync-message` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标 `quality-capa-task-panel.test.ts` `2/2 passed`；相邻 `quality-capa-sync.test.ts` `4/4 passed`；`npm run lint` 通过；coverage `81 files / 285 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `62.90%`；`QualityCapaTaskPanel.vue` 行覆盖从 `45.00%` 提升到 `53.00%`，函数覆盖从 `26.47%` 提升到 `35.29%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`QualityCapaTaskPanel.vue` 可继续覆盖正式 CAPA 转换、复用效果验证、低分样本复核关闭或助手执行包质量责任闭环。B 轨发布闸门仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Knowledge Query Failure Fallback Alert

- 目标：覆盖 AI 助手知识问答失败路径，确认后端 RAG/LLM 查询失败时不会静默伪装成真实回答，而是明确播报离线演示降级。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `36.88%`，且 AI 助手是生产人员高频入口；失败 fallback 的可信度高于继续精修已高覆盖组件。
- 红灯：知识问答失败后缺少 `.message.assistant[role="alert"]`，测试失败于 `Unable to get .message.assistant[role="alert"]`。
- 修复：`sendMessage()` catch 分支使用 `errorMessage()`，将失败原因和离线演示降级说明作为 assertive alert 插入演示回答前。
- 验证：目标 `chat-panel.test.ts` `6/6 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 286 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `63.27%`；`ChatPanel.vue` 行覆盖从 `36.88%` 提升到 `43.19%`，函数覆盖从 `35.45%` 提升到 `40.00%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 可继续覆盖异常处置卡生成、引用治理或动作包生成分支，但不要掩盖 B 轨真实发布闸门。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Anomaly Package Status

- 目标：覆盖 AI 助手创建异常处置卡成功路径，确认 Admin 动作会写异常处置包、跳转异常管理、记录成功审计，并以可访问状态更新播报完成结果。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `43.19%`，且异常处置卡创建是 AI 助手真实动作出口；比继续做模板微调更符合 Coverage-Leverage Routing。
- 红灯：异常处置卡创建完成消息缺少 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`create_anomaly_card` 成功分支的 `addMessage()` 增加 `liveRole='status'`。
- 验证：目标 `chat-panel.test.ts` `7/7 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 287 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：fresh 总行覆盖 `63.29%`；`ChatPanel.vue` 行覆盖从 `43.19%` 提升到 `44.77%`，函数覆盖从 `40.00%` 提升到 `42.72%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 可继续覆盖工程约束包、BOM 齐套包或设备停机复核包成功状态，也可转向 `ScheduleBoard.vue` / `GanttChart.vue` 真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Engineering Constraint Package Status

- 目标：覆盖 AI 助手生成工程约束复核包成功路径，确认 Admin 动作会写工程约束复核包、跳转工艺路线、记录成功审计，并以可访问状态更新播报完成结果。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `44.77%`，且工程约束复核包是 AI 助手真实动作出口；它影响 BOM、工艺路线、排产约束和 OTD 证据链，比继续做模板微调更符合 Coverage-Leverage Routing。
- 红灯：工程约束复核包创建完成消息缺少 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`engineering_constraint_package` 成功分支的 `addMessage()` 增加 `liveRole='status'`。
- 验证：目标 `chat-panel.test.ts` `8/8 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 288 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `63.46%`；`ChatPanel.vue` 行覆盖从 `44.77%` 提升到 `46.54%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 可继续覆盖 BOM 齐套包、设备停机复核包或客户承诺包成功状态，也可转向 `GanttChart.vue` / `ScheduleBoard.vue` 真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Customer Commitment Package Status

- 目标：覆盖 AI 助手生成客户交付恢复承诺包成功路径，确认 Admin 动作会写 OTD KPI 承诺包、跳转报表中心、记录成功审计，并以可访问状态更新播报完成结果。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `46.54%`，且客户承诺包是 POC/验收复盘证据出口；它影响报表中心、AI 排产、OTD 证据链和客户沟通口径，比继续做模板微调更符合 Coverage-Leverage Routing。
- 红灯：客户交付恢复承诺包创建完成消息缺少 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`customer_commitment_package` 成功分支的 `addMessage()` 增加 `liveRole='status'`。
- 验证：目标 `chat-panel.test.ts` `9/9 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 289 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `63.53%`；`ChatPanel.vue` 行覆盖从 `46.54%` 提升到 `47.73%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 可继续覆盖 BOM 齐套包或设备停机复核包成功状态，也可转向 `GanttChart.vue` / `ScheduleBoard.vue` 真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel BOM Kitting Package Status

- 目标：覆盖 AI 助手生成 BOM 展开齐套检查包成功路径，确认 Admin 动作会写齐套包、同步 OTD 证据链、跳转 BOM 管理、记录成功审计，并以可访问状态更新播报完成结果。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `47.73%`，且 BOM 齐套包是缺料、替代料和排产窗口复核出口；它影响 BOM 管理、库存齐套、AI 排产、OTD 证据链和系统治理，比继续做模板微调更符合 Coverage-Leverage Routing。
- 红灯：BOM 展开齐套检查包创建完成消息缺少 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`bom_kitting_package` 成功分支的 `addMessage()` 增加 `liveRole='status'`。
- 验证：目标 `chat-panel.test.ts` `10/10 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 290 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `63.71%`；`ChatPanel.vue` 行覆盖从 `47.73%` 提升到 `50.69%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 可继续覆盖设备停机复核包成功状态，也可转向 `GanttChart.vue` / `ScheduleBoard.vue` 真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Equipment Downtime Package Status

- 目标：覆盖 AI 助手生成设备停机复核包成功路径，确认 Admin 动作会写停机事件、同步 OTD 证据链、跳转设备维护、记录成功审计，并以可访问状态更新播报完成结果。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `50.69%`，且设备停机复核包是瓶颈设备保护和风险处置出口；它影响设备维护、AI 排产、风险预警、OTD 证据链和审计回放，比继续做模板微调更符合 Coverage-Leverage Routing。
- 红灯：设备停机复核包创建完成消息缺少 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`equipment_downtime_package` 成功分支的 `addMessage()` 增加 `liveRole='status'`。
- 验证：目标 `chat-panel.test.ts` `11/11 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 291 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `63.85%`；`ChatPanel.vue` 行覆盖从 `50.69%` 提升到 `53.25%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 动作包成功状态已覆盖异常处置、工程约束、客户承诺、BOM 齐套和设备停机，下一片优先转向引用治理、`GanttChart.vue` / `ScheduleBoard.vue` 真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Delivery Recovery Package Status

- 目标：覆盖 AI 助手生成交期恢复执行包成功路径，确认 Admin 动作会写执行包、跳转 AI 排产、记录成功审计，并以可访问状态更新播报完成结果。
- 成功标准：新增测试先红灯；修复后目标测试、相邻主布局测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `53.25%`，且交期恢复执行包是跨模块交付恢复核心出口；它影响 AI 排产、风险处置、采购、质量、OTD 证据链和审计回放，比继续做模板微调更符合 Coverage-Leverage Routing。
- 红灯：交期恢复执行包创建完成消息缺少 `role="status"`，测试失败于 `Unable to get .message.assistant[role="status"]`。
- 修复：`delivery_recovery_package` 成功分支的 `addMessage()` 增加 `liveRole='status'`。
- 验证：目标 `chat-panel.test.ts` `12/12 passed`；相邻 `main-layout.test.ts` `1/1 passed`；`npm run lint` 通过；coverage `81 files / 292 tests passed`；发布闸门审计脚本返回 FAIL。
- 覆盖率记录：总行覆盖 `63.91%`；`ChatPanel.vue` 行覆盖从 `53.25%` 提升到 `54.24%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ChatPanel.vue` 动作包成功状态已覆盖交期恢复、异常处置、工程约束、客户承诺、BOM 齐套和设备停机，下一片优先转向引用治理、失败路径或 `GanttChart.vue` / `ScheduleBoard.vue` 真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 GanttChart Lightweight Task Detail Click

- 目标：覆盖轻量甘特任务条进入详情路径，确认离线/demo 兜底模式下调度员可通过鼠标和键盘打开工单详情。
- 成功标准：新增测试先红灯；修复后目标测试、相邻调度页测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`GanttChart.vue` 行覆盖约 `51%`，低于已连续推进的 `ChatPanel.vue`；甘特图是 AI 排产主视图，轻量/离线路径是演示与本地验证兜底，比继续精修已覆盖动作包更符合 Coverage-Leverage Routing。
- 红灯：轻量 `.gantt_task_line` 点击和 Enter 后没有 `taskClick` 事件，测试失败于 `expected undefined to deeply equal [["task-1"], ["task-1"]]`。
- 修复：轻量任务 marker 增加 `tabindex="0"`、点击和 Enter 处理，通过 `emitLightweightTaskClick()` 发出 `taskClick`。
- 验证：目标 `gantt-chart.test.ts` `3/3 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `7/7 passed`；`npm run lint` 通过；coverage `81 files / 293 tests passed`。
- 覆盖率记录：总行覆盖 `63.92%`；`GanttChart.vue` 行覆盖 `52.04%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`GanttChart.vue` 后续优先覆盖 dhtmlx 初始化配置、scale 切换、锁定期阻止拖拽或实时拖拽冲突标记。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 GanttChart Locked Period Overlap Drag Guard

- 目标：覆盖锁定期拖拽阻断的区间重叠场景，确认已经开始但仍跨入冻结窗口的现场任务不能被调度员拖走。
- 成功标准：新增测试先红灯；修复后目标测试、相邻调度页测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`GanttChart.vue` 行覆盖 `52.04%` 且锁定期是 AI 排产主视图的核心执行承诺边界；覆盖真实 dhtmlx 拖拽保护比继续做模板语义微调更符合 Coverage-Leverage Routing。
- 红灯：进行中跨锁定期任务触发 `onBeforeTaskDrag` 时仍返回 `true`，测试失败于 `expected true to be false`。
- 修复：锁定期保护改为判断任务 `[taskStart, taskEnd)` 与锁定期 `[lockStart, lockEnd)` 是否重叠。
- 验证：目标 `gantt-chart.test.ts` `4/4 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `8/8 passed`；`npm run lint` 通过；coverage `81 files / 294 tests passed`。
- 覆盖率记录：总行覆盖 `64.03%`；`GanttChart.vue` 行覆盖从 `52.04%` 提升到 `57.80%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`GanttChart.vue` 后续优先覆盖 scale 切换、实时拖拽冲突标记或 dhtmlx 初始化配置。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 GanttChart Initial Scale Prop

- 目标：覆盖甘特图初始 scale 应用，确认调度页以周/月粒度进入时 dhtmlx 首屏配置直接匹配 `scale` prop。
- 成功标准：新增测试先红灯；修复后目标测试、相邻调度页测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`GanttChart.vue` 行覆盖 `57.80%`，仍低于全局平均且属于调度主视图；初始 scale 契约影响首屏排产粒度，比继续精修已高覆盖小组件更有收益。
- 红灯：`scale="week"` 初始挂载后 dhtmlx 仍保持 `day` 刻度，测试失败于 `expected 'day' to be 'week'`。
- 修复：`initGantt()` 在 `gantt.init()` 后复用 `setScale(props.scale)` 应用初始 scale。
- 验证：目标 `gantt-chart.test.ts` `5/5 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `9/9 passed`；`npm run lint` 通过；coverage `81 files / 295 tests passed`。
- 覆盖率记录：总行覆盖 `64.11%`；`GanttChart.vue` 行覆盖从 `57.80%` 提升到 `61.49%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`GanttChart.vue` 后续优先覆盖实时拖拽冲突标记或 dhtmlx 初始化配置剩余分支，也可转向 `ScheduleBoard.vue` 低覆盖真实业务分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Task Detail Failure Alert

- 目标：覆盖甘特任务详情后端失败路径，确认调度员看到本地兜底详情时会同时看到真实后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、相邻甘特测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖 `49.49%`，低于全局平均且是调度主工作台；工单详情失败 fail-loud 是比继续精修 `GanttChart.vue` 更高杠杆的真实业务分支。
- 红灯：`getWorkOrderById` 抛错后 `OrderDetailPanel` 收到的 `error` 为空，测试失败于 `expected '' to contain '工单详情加载失败'`。
- 修复：`handleTaskClick()` catch 分支保留 demo 兜底，同时设置 `detailError` 为带失败原因的提示。
- 验证：目标 `schedule-board.test.ts` `5/5 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `10/10 passed`；`npm run lint` 通过；coverage `81 files / 296 tests passed`。
- 覆盖率记录：总行覆盖 `64.14%`；`ScheduleBoard.vue` 行覆盖从 `49.49%` 提升到 `50.10%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ScheduleBoard.vue` 后续优先覆盖反馈提交失败/缺计划 ID、Agent 建议采纳、拖拽重排或风险事件加载分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Feedback Sync Failure Reason

- 目标：覆盖采纳/拒绝反馈同步失败路径，确认调度员保留本地复盘记录时也能看到后台失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、相邻甘特测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖 `50.10%`，仍低于全局平均且反馈同步是调度闭环/审计复盘入口；失败原因比泛化“接口不可用”更符合 Rule 12 fail loud。
- 红灯：`submitAdoptionFeedback` 抛错后 `.sync-note` 缺少后端错误文本，测试失败于 `expected ... to contain 'feedback API unavailable'`。
- 修复：`handleScheduleDecision()` catch 分支用 `errorMessage()` 追加失败原因。
- 验证：目标 `schedule-board.test.ts` `6/6 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `11/11 passed`；`npm run lint` 通过；coverage `81 files / 297 tests passed`。
- 覆盖率记录：总行覆盖 `64.16%`；`ScheduleBoard.vue` 行覆盖从 `50.10%` 提升到 `50.50%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ScheduleBoard.vue` 后续优先覆盖缺计划 ID、Agent 建议采纳、拖拽重排或风险事件加载分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Optimization Success Clears Stale Error

- 目标：覆盖智能优化失败后再次成功的恢复路径，确认新优化方案成功应用时旧错误横幅会被清除。
- 成功标准：新增测试先红灯；修复后目标测试、相邻甘特测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖 `50.50%`，仍低于全局平均且智能优化是调度主工作台用户必经动作；成功恢复路径比继续精修已高覆盖排产子组件更有杠杆。
- 红灯：第一次 `optimizeSchedule` 抛出 `optimizer unavailable` 后，第二次成功返回 plan 仍保留 `[role="alert"]` 旧错误。
- 修复：`handleOptimize()` 在 `result.plan` 成功应用时清空 `error.value`。
- 验证：目标 `schedule-board.test.ts` `7/7 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `81 files / 298 tests passed`。
- 覆盖率记录：总行覆盖 `64.17%`；`ScheduleBoard.vue` 行覆盖从 `50.50%` 提升到 `50.60%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ScheduleBoard.vue` 后续优先覆盖缺计划 ID、Agent 建议采纳、拖拽重排或风险事件加载分支，也可转向 `BomBoard.vue` / `ProductionBoard.vue` / `PurchaseBoard.vue` 等低覆盖关键路径。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleAgentWorkbench Recommendation Failure Alert

- 目标：覆盖调度员 Agent 工作台后端建议生成失败路径，确认失败动作以 assertive alert 播报，而成功动作仍以 polite status 播报。
- 成功标准：新增测试先红灯；修复后目标测试、父级调度页相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleAgentWorkbenchPanel.vue` 属于调度员 Agent 决策入口，后端建议生成失败会阻断采纳/拒绝闭环；错误播报语义比继续补已存在早返回分支更符合 fail-loud。
- 红灯：`recommendAgentDecision` 抛错后 `.agent-action-note.error` 仍是 `role="status"`，测试失败于 `expected 'status' to be 'alert'`。
- 修复：动作提示根据 `actionError` 动态设置 `role` 和 `aria-live`。
- 验证：目标 `schedule-agent-workbench-panel.test.ts` `2/2 passed`；相邻 `schedule-agent-workbench-panel.test.ts + schedule-board.test.ts` `9/9 passed`；`npm run lint` 通过；coverage `81 files / 299 tests passed`。
- 覆盖率记录：总行覆盖 `64.19%`；`ScheduleAgentWorkbenchPanel.vue` 行覆盖提升到 `83.52%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；不要继续精修已 `83%+` 的工作台面板，下一片优先回到 `ScheduleBoard.vue` 低覆盖真实业务分支，或转向 `BomBoard.vue` / `ProductionBoard.vue` / `PurchaseBoard.vue` 等低覆盖关键路径。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 BomBoard Explosion Failure Fallback

- 目标：覆盖 BOM 爆炸接口异步失败路径，确认计划员仍能看到本地展开树兜底，且不会产生未处理 Promise rejection。
- 成功标准：新增测试先红灯；修复后目标测试、齐套包同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`BomBoard.vue` 行覆盖 `55.68%`，低于全局平均且 BOM 展开是库存齐套/替代料/排产约束入口；异步失败兜底比继续精修已高覆盖面板更有发布就绪收益。
- 红灯：`explodeBom` rejected 后无 `.explosion-section`，并出现 `Unhandled Rejection: bom explosion API unavailable`。
- 修复：`handleExplode()` 改为 `async/await`，catch 分支写入 `demoExplosion(selected.value)`。
- 验证：目标 `bom-board.test.ts` `2/2 passed`；相邻 `bom-board.test.ts + shortage-risk-sync.test.ts` `11/11 passed`；`npm run lint` 通过；coverage `81 files / 300 tests passed`。
- 覆盖率记录：总行覆盖 `64.40%`；`BomBoard.vue` 行覆盖从 `55.68%` 提升到 `66.46%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`BomBoard.vue` 本片有较高覆盖增量，但下一片仍优先真实失败路径/齐套包/工程变更分支，或转向 `ProductionBoard.vue` / `PurchaseBoard.vue` 等低覆盖关键路径。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Work Order Load Failure Alert

- 目标：覆盖生产工单列表加载失败路径，确认本地 demo 兜底不会静默伪装成真实工单列表，而是以 assertive alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、生产异常同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖约 `53.34%`，低于全局平均且生产工单列表是现场报工入口；加载失败 fail-loud 比继续精修已高覆盖子面板更有发布就绪收益。
- 红灯：`getWorkOrders` rejected 后页面显示 demo 工单但没有 alert，测试失败于 `Unable to get [role="alert"]`。
- 修复：`loadWorkOrders()` catch 分支保留 demo 数据，同时调用 `notify(..., 'error')` 暴露后端失败原因。
- 验证：目标 `production-board.test.ts` `8/8 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts` `13/13 passed`；`npm run lint` 通过；coverage `81 files / 301 tests passed`。
- 覆盖率记录：总行覆盖 `64.46%`；`ProductionBoard.vue` 行覆盖从 `53.34%` 提升到 `54.42%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`ProductionBoard.vue` 后续优先覆盖扫码上下文成功闭环、非合格完工质量冻结或分页/过滤加载失败分支，也可转向 `PurchaseBoard.vue` 低覆盖关键路径。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard List Refresh Failure Alert

- 目标：覆盖采购单确认成功后的列表刷新失败路径，确认右侧详情成功更新时，左侧列表刷新失败会以 alert 暴露，而不是静默保留旧列表。
- 成功标准：新增测试先红灯；修复后目标测试、缺料风险同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `53.18%`，低于全局平均且采购单确认是采购协同主路径；刷新失败 fail-loud 比继续精修已高覆盖组件更有发布就绪收益。
- 红灯：`confirmPurchaseOrder` resolve 后第二次 `getPurchaseList` rejected，详情标签为已确认但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：`refreshList()` catch 分支保留本地列表状态，并用 `errorMessage()` 暴露刷新失败原因。
- 验证：目标 `purchase-board.test.ts` `6/6 passed`；相邻 `purchase-board.test.ts + shortage-risk-sync.test.ts` `15/15 passed`；`npm run lint` 通过；coverage `81 files / 302 tests passed`。
- 覆盖率记录：总行覆盖 `64.46%`；`PurchaseBoard.vue` 行覆盖为 `53.35%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`PurchaseBoard.vue` 后续优先覆盖供应延期升级、替代到货、外协到货确认或分页/过滤加载失败分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Initial List Failure Alert

- 目标：覆盖采购页首屏列表加载失败路径，确认本地 demo 兜底不会静默伪装成真实采购列表，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、缺料风险同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `53.35%`，低于全局平均且采购订单列表是采购员进入采购协同的首屏入口；首屏加载失败 fail-loud 比继续精修已高覆盖组件更有发布就绪收益。
- 红灯：首轮 `getPurchaseList` rejected 后页面显示 demo 订单但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：初始加载 catch 分支保留 demo 数据，同时用 `errorMessage()` 暴露后端失败原因。
- 验证：目标 `purchase-board.test.ts` `7/7 passed`；相邻 `purchase-board.test.ts + shortage-risk-sync.test.ts` `16/16 passed`；`npm run lint` 通过；coverage `81 files / 303 tests passed`。
- 覆盖率记录：总行覆盖 `64.48%`；`PurchaseBoard.vue` 行覆盖从 `53.35%` 提升到 `54.07%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`PurchaseBoard.vue` 后续优先覆盖供应延期升级、替代到货、外协到货确认或分页/过滤加载失败分支，也可转向 `InventoryBoard.vue` / `ChatPanel.vue` 等低覆盖关键入口。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 InventoryBoard Initial List Failure Alert

- 目标：覆盖库存页首屏列表加载失败路径，确认本地 demo 兜底不会静默伪装成真实库存列表，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、齐套闭环/缺料同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`InventoryBoard.vue` 行覆盖约 `58.13%`，低于全局平均且库存列表是齐套、领料、安全库存判断入口；首屏加载失败 fail-loud 比继续精修已高覆盖采购页更有杠杆。
- 红灯：`getInventoryList` rejected 后页面显示 demo 物料但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：新增 `notification` 与 `inventory-notification` alert；列表加载 catch 分支保留 demo 数据并用 `errorMessage()` 暴露后端失败原因。
- 验证：目标 `inventory-board.test.ts` `2/2 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `81 files / 304 tests passed`。
- 覆盖率记录：总行覆盖 `64.50%`；`InventoryBoard.vue` 行覆盖从 `58.13%` 提升到 `59.54%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`InventoryBoard.vue` 后续优先覆盖交易记录加载失败、出库/调拨失败保护或盘点失败提示，也可转向 `ChatPanel.vue` / `AnomalyBoard.vue` 等低覆盖关键入口。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 InventoryBoard Transaction Failure Alert

- 目标：覆盖库存物料交易记录加载失败路径，确认本地 demo 流水不会静默伪装成真实交易记录，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、齐套闭环/缺料同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`InventoryBoard.vue` 行覆盖约 `59.54%`，仍低于全局平均且交易记录是库存追溯和余额判断必经详情；交易失败 fail-loud 与库存列表失败同属主入口可信度问题。
- 红灯：选择 `MAT-A01` 时 `getStockTransactions` rejected 后页面显示 demo 交易但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：`selectItem()` 进入时清空旧通知；交易加载 catch 分支保留 demo 交易并用 `errorMessage()` 暴露后端失败原因。
- 验证：目标 `inventory-board.test.ts` `3/3 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `13/13 passed`；`npm run lint` 通过；coverage `81 files / 305 tests passed`。
- 覆盖率记录：总行覆盖 `64.56%`；`InventoryBoard.vue` 行覆盖从 `59.54%` 提升到 `63.15%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`InventoryBoard.vue` 后续可以覆盖出库/调拨/盘点失败保护，也可转向 `ChatPanel.vue` / `AnomalyBoard.vue` 等低覆盖关键入口。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 InventoryBoard Operation Failure Alert

- 目标：覆盖库存操作失败提示语义，确认出库失败时弹窗保留，错误原因以 alert 暴露，而不是只作为普通文本显示。
- 成功标准：新增测试先红灯；修复后目标测试、齐套闭环/缺料同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`InventoryBoard.vue` 行覆盖约 `63.15%`，仍接近低覆盖关键入口；出库/入库/调拨/盘点是库存主工作流，失败语义比继续纯列表覆盖更贴近现场阻断。
- 红灯：`stockOut` rejected 后弹窗保留且错误文本存在，但弹窗内没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：`dialogError` 节点增加 `role="alert"`，保留原错误文案和业务逻辑。
- 验证：目标 `inventory-board.test.ts` `4/4 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `14/14 passed`；`npm run lint` 通过；coverage `81 files / 306 tests passed`。
- 覆盖率记录：总行覆盖 `64.75%`；`InventoryBoard.vue` 行覆盖从 `63.15%` 提升到 `75.93%`。
- 后续：`InventoryBoard.vue` 已高于当前总行覆盖，下一片应优先转向 `ChatPanel.vue`、`AnomalyBoard.vue`、`ProductionBoard.vue` 或 `QualityCapaTaskPanel.vue` 等仍低覆盖且用户必经组件；不要继续精修库存页微分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 AnomalyBoard Initial List Failure Alert

- 目标：覆盖异常管理首屏列表加载失败路径，确认本地 demo 异常不会静默伪装成真实异常队列，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、异常分流/生产异常同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`InventoryBoard.vue` 已高于全局平均，转向 `AnomalyBoard.vue`；该组件行覆盖约 `58.51%`，低于全局平均且异常列表是现场事件处置入口。
- 红灯：`getAnomalyList` rejected 后页面显示 demo 异常但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：新增 `notification` 与 `anomaly-notification` alert；列表加载 catch 分支保留 demo 数据并用 `errorMessage()` 暴露后端失败原因。
- 验证：目标 `anomaly-board.test.ts` `2/2 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `12/12 passed`；`npm run lint` 通过；coverage `81 files / 307 tests passed`。
- 覆盖率记录：总行覆盖 `64.78%`；`AnomalyBoard.vue` 行覆盖从 `58.51%` 提升到 `60.58%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`AnomalyBoard.vue` 后续可覆盖详情加载失败或 AI 分析失败提示，也可转向 `ChatPanel.vue` / `ProductionBoard.vue` 等关键入口。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 AnomalyBoard Detail Failure Alert

- 目标：覆盖异常详情加载失败路径，确认本地 demo 详情不会静默伪装成真实异常详情，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、异常分流/生产异常同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`AnomalyBoard.vue` 行覆盖约 `60.58%`，仍低于全局平均，且异常详情是现场处置、响应记录和 AI 分析前置路径。
- 红灯：`getAnomalyById` rejected 后页面显示 demo 详情但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：`selectAnomaly()` 进入时清空旧通知；详情加载 catch 分支保留 demo 详情并用 `errorMessage()` 暴露后端失败原因。
- 验证：目标 `anomaly-board.test.ts` `3/3 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `13/13 passed`；`npm run lint` 通过；coverage `81 files / 308 tests passed`。
- 覆盖率记录：总行覆盖 `64.82%`；`AnomalyBoard.vue` 行覆盖从 `60.58%` 提升到 `63.30%`。
- 后续：继续按 Coverage-Leverage Routing 选择低覆盖且用户必经组件；`AnomalyBoard.vue` 后续可覆盖 AI 分析失败提示或事件分流失败提示，也可转向 `ChatPanel.vue` / `ProductionBoard.vue` 等关键入口。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 AnomalyBoard AI Analysis Failure Alert

- 目标：覆盖异常 AI 分析失败路径，确认本地 demo 建议不会静默伪装成真实后端 AI 分析，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、异常分流/生产异常同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`AnomalyBoard.vue` 行覆盖约 `63.30%`，仍低于全局平均，且 AI 分析建议是异常处置决策入口；失败静默会直接误导现场处置。
- 红灯：`analyzeAnomaly` rejected 后页面显示 demo 建议但没有 `[role="alert"]`，测试失败于 `Unable to get [role="alert"]`。
- 修复：`handleAnalyze()` 进入时清空旧通知；分析失败 catch 分支保留 demo 建议并用 `errorMessage()` 暴露后端失败原因。
- 验证：目标 `anomaly-board.test.ts` `4/4 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `14/14 passed`；`npm run lint` 通过；coverage `81 files / 309 tests passed`。
- 覆盖率记录：总行覆盖 `64.95%`；`AnomalyBoard.vue` 行覆盖从 `63.30%` 提升到 `70.92%`。
- 后续：`AnomalyBoard.vue` 已高于当前总行覆盖，下一片优先转向仍低覆盖且用户必经的 `ChatPanel.vue`、`ProductionBoard.vue` 或 `QualityCapaTaskPanel.vue`；不要继续精修异常页微分支。B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Recovery Package Failure Alert

- 目标：覆盖助手动作执行包写入失败路径，确认权限通过后写入失败不会产生未处理异常，也不会静默伪装成动作成功，而是以 alert 暴露失败原因并写入失败审计。
- 成功标准：新增测试先红灯；修复后目标测试、动作包同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `54.24%`，低于全局平均且是用户触发跨模块业务动作的入口；动作失败 fail-loud 比继续精修已高覆盖 `AnomalyBoard.vue` 更有杠杆。
- 红灯：Admin 点击 `生成交期恢复执行包` 时 `writeAssistantRecoveryPackage` 抛错，测试捕获 unhandled error，失败审计未写入，且没有 `[role="alert"]`。
- 修复：`executeAction()` 对权限通过后的动作主体增加统一 `try/catch/finally`；成功路径保持 status 和 permitted=true 审计，失败路径写 permitted=false 审计并播报 `动作执行失败：...`。
- 验证：目标 `chat-panel.test.ts` `13/13 passed`；相邻动作链路测试 `59/59 passed`；`npm run lint` 通过；coverage `81 files / 310 tests passed`。
- 覆盖率记录：总行覆盖 `64.96%`；`ChatPanel.vue` 行覆盖从 `54.24%` 提升到 `54.50%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ProductionBoard.vue` 剩余阻断操作、`QualityCapaTaskPanel.vue`、`DocumentUpload.vue` 或 `ScheduleBoard.vue` 等低覆盖且用户必经真实业务分支；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Restricted Action Audit Failure Alert

- 目标：覆盖 AI 助手受限动作拒绝审计写入失败路径，确认动作不会执行，同时拒绝审计失败会被用户看到。
- 成功标准：新增测试先红灯；修复后目标测试、助手动作/审计/执行包相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `54.50%`，低于全局平均且权限拒绝是 AI 助手安全边界；拒绝审计失败静默会破坏安全审计链。
- 红灯：`recordAssistantActionAudit` 在权限拒绝分支抛错后出现 unhandled rejection，页面没有 alert，动作虽然未执行但拒绝证据不可确认。
- 修复：权限拒绝分支增加审计写入 `try/catch`；失败时播报 `拒绝审计写入失败...`，并继续保证不导航、不写执行包。
- 验证：目标 `chat-panel.test.ts` `14/14 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `36/36 passed`；`npm run lint` 通过；coverage `81 files / 319 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.87%`；`ChatPanel.vue` 行覆盖从 `54.50%` 提升到 `54.68%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ProductionBoard.vue`、`QualityCapaTaskPanel.vue`、`ChatPanel.vue` 其它跨模块动作失败路径或仍低覆盖的现场关键入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Scan API Failure Alert

- 目标：覆盖生产扫码查询失败路径，确认扫码后端不可用且本地无匹配时不会被误报为普通无匹配，而是以 alert 暴露后端失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、扫码/异常/OTD 同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖约 `54.42%`，低于全局平均且扫码是现场报工入口；扫码失败 fail-loud 比继续精修高覆盖页面更贴近生产阻断。
- 红灯：`scanOperation` rejected 后本地也找不到工单，alert 只显示 `未找到匹配的工单或工序`，测试失败于缺少 `扫码查询失败` 和 `scanner API unavailable`。
- 修复：`handleScan()` 记录扫码接口异常；只有在本地也无匹配时显示包含后端原因的 fail-loud 文案。
- 验证：目标 `production-board.test.ts` `9/9 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts + barcode-scan-evidence-sync.test.ts + otd-evidence-chain-sync.test.ts` `26/26 passed`；`npm run lint` 通过；coverage `81 files / 311 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `64.92%`；`ProductionBoard.vue` 行覆盖从 `54.42%` 提升到 `54.68%`。本轮总覆盖未提升，不能把它作为总量收益宣传。
- 后续：继续按 Coverage-Leverage Routing，优先 `QualityCapaTaskPanel.vue`、`DocumentUpload.vue`、`ScheduleBoard.vue` 或 `ProductionBoard.vue` 仍未覆盖且用户必经的业务分支；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 QualityCapaTaskPanel Closure Failure Alert

- 目标：覆盖 CAPA 验证闭环写入失败路径，确认审计/OTD 同步失败时任务不会被标记为已验证，而是保留执行中并以 alert 暴露失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、CAPA 同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`QualityCapaTaskPanel.vue` 行覆盖约 `53%`，低于全局平均且质量 CAPA 验证是质量审计、责任人闭环和 OTD 复盘必经动作；闭环假阳性风险高于继续精修已高覆盖页面。
- 红灯：`writeQualityCapaClosure` 抛错后任务仍被标记 `verified`，并出现 unhandled error；测试失败于任务卡片不应包含 `verified`。
- 修复：`advanceTask()` 在 doing 任务验证时先写闭环；成功后才设置 `verified` 和成功 status；失败时设置 `closureErrorMessage`，使用 assertive alert 暴露原因并允许重试。
- 验证：目标 `quality-capa-task-panel.test.ts` `3/3 passed`；相邻 `quality-capa-task-panel.test.ts + quality-capa-sync.test.ts` `7/7 passed`；`npm run lint` 通过；coverage `81 files / 312 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `64.99%`；`QualityCapaTaskPanel.vue` 行覆盖提升到 `55.23%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `DocumentUpload.vue`、`ScheduleBoard.vue` 或仍低覆盖且用户必经的 `QualityCapaTaskPanel.vue` / `ProductionBoard.vue` 真实业务分支；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Quality Evidence Refresh Failure Alert

- 目标：覆盖文档上传页质量知识证据后台刷新失败路径，确认刷新失败不会产生 mounted hook 未处理异常，而是保留本地治理数据并以 alert 暴露失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、客户导入/质量知识/治理同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖约 `50.57%`，低于全局平均且是知识库、质量知识样本、再训练和灰度治理入口；后台刷新失败静默会误导后续质量治理判断。
- 红灯：`readQualityKnowledgeSamplesBackendFirst` rejected 后没有 alert，并出现 mounted hook unhandled rejection；测试失败于找不到 `[role="alert"]`。
- 修复：`refreshQualityKnowledgeEvidence()` 增加统一 `try/catch`；失败时写入页面级 `error`，提示保留本地治理数据和后端失败原因。
- 验证：目标 `document-upload.test.ts` `7/7 passed`；相邻 `document-upload.test.ts + customer-order-import-sync.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `21/21 passed`；`npm run lint` 通过；coverage `81 files / 313 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.00%`；`DocumentUpload.vue` 行覆盖从 `50.57%` 提升到 `51.13%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ScheduleBoard.vue`、`DocumentUpload.vue` 剩余质量治理事件失败路径或其它低覆盖且用户必经业务分支；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Quality Gray Publish Failure Alert

- 目标：覆盖质量知识 R3 灰度发布写入失败路径，确认灰度发布未归档时不会产生未处理异常，而是保留训练集当前状态并以 alert 暴露失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、治理面板/质量知识/知识治理同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖约 `51.13%`，低于全局平均且质量知识灰度发布是再训练/推荐治理入口；失败静默会把灰度发布审计伪装成完成。
- 红灯：`grayPublishQualityKnowledgeNextTrainingSetVersion` 抛错后页面没有 `[role="alert"]`，并出现 native event handler unhandled error。
- 修复：`handleQualityNextTrainingGrayPublish()` 对灰度发布写入增加 `try/catch`，失败时写入 `质量知识灰度发布失败...`，不刷新历史为成功记录。
- 验证：目标 `document-upload.test.ts` `8/8 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `19/19 passed`；`npm run lint` 通过；coverage `81 files / 318 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.86%`；`DocumentUpload.vue` 行覆盖从 `51.13%` 提升到 `54.18%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue`、`ProductionBoard.vue`、`QualityCapaTaskPanel.vue` 或 `DocumentUpload.vue` 剩余质量治理失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Drag Reschedule Failure Alert

- 目标：覆盖排产拖拽重排保存失败路径，确认后端保存失败后错误横幅不会被恢复重载清掉，而是持续告知调度员调整未落库。
- 成功标准：新增测试先红灯；修复后目标测试、甘特/映射/反馈相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖约 `50.60%`，低于全局平均且拖拽重排是排产主工作流；保存失败静默比继续补纯展示分支风险更高。
- 红灯：`rescheduleItem` rejected 后恢复重载清空 `error`，页面没有 `[role="alert"]`；测试失败于找不到保存失败横幅。
- 修复：`loadData()` 增加 `preserveError` 选项，默认行为保持清空旧错误；拖拽保存失败 catch 使用保留错误模式恢复计划。
- 验证：目标 `schedule-board.test.ts` `8/8 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts + gantt-mapper.test.ts + schedule-feedback-sync.test.ts` `25/25 passed`；`npm run lint` 通过；coverage `81 files / 314 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.07%`；`ScheduleBoard.vue` 行覆盖从 `50.60%` 提升到 `51.80%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ScheduleBoard.vue` 的 Agent 建议采纳/风险事件加载/缺计划 ID 分支，或 `DocumentUpload.vue` 质量治理事件失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Batch Objective Feedback Failure Alert

- 目标：覆盖多目标方案采用后的采纳反馈同步失败路径，确认目标可以本地切换，但后端反馈未同步时必须明确告知调度员。
- 成功标准：新增测试先红灯；修复后目标测试、Pareto/反馈/甘特映射相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖约 `51.80%`，仍低于全局平均；多目标方案采用是排产决策从分析进入执行的关键路径，反馈失败静默会破坏审计和模型复盘。
- 红灯：`submitAdoptionFeedback` rejected 后目标已切换且优化成功，但页面没有 `.sync-note` 告知批量方案采纳反馈未同步。
- 修复：`onApplyObjective()` 对批量方案采纳反馈提交增加同步中/成功/失败状态；失败时提示当前仅保留本地目标切换并暴露后端原因。
- 验证：目标 `schedule-board.test.ts` `9/9 passed`；相邻 `schedule-board.test.ts + pareto-compare.test.ts + schedule-feedback-sync.test.ts + gantt-mapper.test.ts` `23/23 passed`；`npm run lint` 通过；coverage `81 files / 315 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.13%`；`ScheduleBoard.vue` 行覆盖从 `51.80%` 提升到 `53.08%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ScheduleBoard.vue` 的 Agent 建议采纳/风险事件加载/缺计划 ID 分支，或 `DocumentUpload.vue` 质量治理事件失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Risk Event Load Failure Alert

- 目标：覆盖风险触发事件加载失败路径，确认风险后端不可用时可以显示本地 demo 事件，但必须明确告知调度员当前不是实时风险队列。
- 成功标准：新增测试先红灯；修复后目标测试、事件队列/反馈/甘特映射相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖约 `53.08%`，仍低于全局平均；风险事件队列会驱动 Agent 建议和人工风险处置，失败静默会把演示数据伪装成真实输入。
- 红灯：`getRiskDashboard` rejected 后页面显示 demo 事件，但没有 `.risk-event-sync-note`；测试失败于找不到风险事件加载失败状态提示。
- 修复：新增 `riskEventSyncNote`，在 `loadRiskTriggeredEvents()` 成功时清空，失败时提示 `风险事件加载失败，已显示本地演示事件：...`。
- 验证：目标 `schedule-board.test.ts` `10/10 passed`；相邻 `schedule-board.test.ts + schedule-event-queue-panel.test.ts + schedule-feedback-sync.test.ts + gantt-mapper.test.ts` `23/23 passed`；`npm run lint` 通过；coverage `81 files / 316 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.14%`；`ScheduleBoard.vue` 行覆盖从 `53.08%` 提升到 `53.16%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ScheduleBoard.vue` 的 Agent 建议采纳/缺计划 ID/事件采纳失败分支，或 `DocumentUpload.vue` 质量治理事件失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ScheduleBoard Outsourcing Release Failure Alert

- 目标：覆盖外协到货后 Agent 建议采纳的排产释放确认失败路径，确认采纳反馈可以保留，但释放审计未归档时必须明确告知调度员。
- 成功标准：新增测试先红灯；修复后目标测试、事件队列/反馈/外协同步/甘特映射相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 行覆盖约 `53.16%`，仍低于全局平均；外协到货后关闭厂外等待口径是 OTD 复盘关键审计动作，失败静默会形成释放假阳性。
- 红灯：`confirmOutsourcingScheduleRelease` rejected/throw 后出现 unhandled rejection，`.sync-note` 只显示普通反馈同步成功，没有外协释放失败原因。
- 修复：`adoptAgentSuggestion()` 等待 `handleScheduleDecision()` 完成后再释放外协；释放确认使用 `try/catch`，失败时写入 `外协排产释放同步失败...`。
- 验证：目标 `schedule-board.test.ts` `11/11 passed`；相邻 `schedule-board.test.ts + schedule-event-queue-panel.test.ts + schedule-feedback-sync.test.ts + outsourcing-commitment-sync.test.ts + gantt-mapper.test.ts` `31/31 passed`；`npm run lint` 通过；coverage `81 files / 317 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `65.80%`；`ScheduleBoard.vue` 行覆盖从 `53.16%` 提升到 `64.77%`。
- 后续：`ScheduleBoard.vue` 已接近当前总行覆盖，下一片优先转向 `DocumentUpload.vue` 质量治理事件失败路径、`ChatPanel.vue` 或 `ProductionBoard.vue` 等仍低覆盖且用户必经真实业务分支；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Completion Evidence Failure Alert

- 目标：覆盖生产完工 API 成功后证据链归档失败路径，确认后端完工已提交但 OTD/质量证据未归档时必须明确告知现场操作员。
- 成功标准：新增测试先红灯；修复后目标测试、生产异常/扫码证据/OTD 证据链相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖约 `54.68%`，低于全局平均；完工报工是现场生产主路径，后端成功但证据链失败会形成生产/质量/OTD 闭环假阳性。
- 红灯：`completeOperation` 成功后 `upsertOtdEvidenceChainRecord` throw，页面没有 `[role="alert"]`，并出现 unhandled error；本地状态已推进到已完成。
- 修复：`confirmComplete()` 将后端成功后的本地完成态刷新、trace 回写和各类证据写入包进 `try/catch`；失败时暴露 `完工证据写入失败，后端完工已提交但 OTD/质量证据未归档...`，不弹成功通知。
- 验证：目标 `production-board.test.ts` `10/10 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts + barcode-scan-evidence-sync.test.ts + otd-evidence-chain-sync.test.ts` `27/27 passed`；`npm run lint` 通过；coverage `81 files / 320 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.14%`；`ProductionBoard.vue` 行覆盖提升到 `59.41%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `QualityCapaTaskPanel.vue`、`ChatPanel.vue`、`DocumentUpload.vue` 或 `ProductionBoard.vue` 剩余用户必经失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 QualityCapaTaskPanel Reuse Closure Failure Alert

- 目标：覆盖质量知识复用草案转正式 CAPA 的写入失败路径，确认正式 CAPA 未归档时必须明确告知质量工程师并允许重试。
- 成功标准：新增测试先红灯；修复后目标测试、CAPA/质量知识同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`QualityCapaTaskPanel.vue` 分支覆盖仍低，且复用草案转正式 CAPA 是 AI 质量知识建议进入人工闭环的关键动作；失败静默会制造正式 CAPA 假阳性。
- 红灯：`writeQualityKnowledgeReuseClosure` throw 后没有 `[role="alert"]`，并出现 unhandled error；草案仍在待复核但用户看不到转正失败原因。
- 修复：`approveReuseDraft()` 将正式 CAPA 写入包进 `try/catch`；失败时写入 `质量知识复用转正式 CAPA 失败...`，保留草案状态和重试按钮。
- 验证：目标 `quality-capa-task-panel.test.ts` `4/4 passed`；相邻 `quality-capa-task-panel.test.ts + quality-capa-sync.test.ts + quality-knowledge-sample-sync.test.ts` `13/13 passed`；`npm run lint` 通过；coverage `81 files / 321 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.21%`；`QualityCapaTaskPanel.vue` 行覆盖从 `55.23%` 提升到 `61.46%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue`、`DocumentUpload.vue`、`PurchaseBoard.vue` 或仍低覆盖的用户必经失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Quality Experiment Shadow Gray Publish Failure Alert

- 目标：覆盖质量实验 R7 影子灰度发布失败路径，确认影子灰度发布未归档时不会产生未处理异常，而是保留当前验证状态并以 alert 暴露失败原因。
- 成功标准：新增测试先红灯；修复后目标测试、治理面板/质量知识/知识治理同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖约 `54.18%`，低于全局平均且质量实验影子灰度发布是推荐链路扩大前的治理闸门；失败静默会把影子灰度审计伪装成完成。
- 红灯：`grayPublishQualityExperimentShadowValidationVersion` throw 后页面没有 `[role="alert"]`，并出现 component/native event handler unhandled error。
- 修复：`handleQualityExperimentShadowGrayPublish()` 增加 `try/catch`，失败时写入 `质量实验影子灰度发布失败...`，不刷新历史为成功发布记录。
- 验证：目标 `document-upload.test.ts` `9/9 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `20/20 passed`；`npm run lint` 通过；coverage `81 files / 322 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.21%`；`DocumentUpload.vue` 行覆盖从 `54.18%` 提升到 `56.59%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue`、`PurchaseBoard.vue`、`DocumentUpload.vue` 其它质量治理失败路径或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Confirmation Failure Alert

- 目标：覆盖采购确认 API 失败路径，确认失败时采购单不能本地推进为已确认，而是保留提交态并明确告知采购员。
- 成功标准：新增测试先红灯；修复后目标测试、外协/短缺风险/OTD 相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `54.07%`，低于全局平均且采购确认是供应履约主路径；失败静默会制造采购状态假阳性。
- 红灯：`confirmPurchaseOrder` rejected 后详情和列表 tag 被错误推进为 `已确认`；测试失败于应保持 `已提交`。
- 修复：`handleConfirm()` 对确认 API 失败增加 fail-loud 兜底，写入 `确认失败...`，并保留当前状态和确认按钮。
- 验证：目标 `purchase-board.test.ts` `8/8 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `29/29 passed`；`npm run lint` 通过；coverage `81 files / 323 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.28%`；`PurchaseBoard.vue` 行覆盖从 `54.07%` 提升到 `54.77%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue`、`PurchaseBoard.vue` 其它采购 API 失败路径、`DocumentUpload.vue` 或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Failed Action Audit Failure Alert

- 目标：覆盖助手动作执行失败后失败审计写入也失败的路径，确认用户仍能看到原始动作失败和审计失败两个原因。
- 成功标准：新增测试先红灯；修复后目标测试、助手动作/审计/执行包相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `54.68%`，仍低于全局平均；助手动作是用户从对话进入业务闭环的入口，失败审计再失败必须 fail loud。
- 红灯：`writeAssistantRecoveryPackage` throw 后，catch 内 `recordAssistantActionAudit` 再 throw，页面没有 alert 且出现 unhandled rejection。
- 修复：`executeAction()` 动作失败 catch 分支对失败审计写入增加二层兜底；alert 保留原始动作失败原因并追加失败审计写入失败原因。
- 验证：目标 `chat-panel.test.ts` `15/15 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `37/37 passed`；`npm run lint` 通过；coverage `81 files / 324 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.25%`；`ChatPanel.vue` 行覆盖从 `54.68%` 提升到 `54.95%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `PurchaseBoard.vue`、`ChatPanel.vue` 其它跨模块动作失败路径、`DocumentUpload.vue` 或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Submit Failure Alert

- 目标：覆盖采购提交 API 失败路径，确认失败时采购单不能本地推进为已提交，而是保留草稿态并明确告知采购员。
- 成功标准：新增测试先红灯；修复后目标测试、外协/短缺风险/OTD 相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `54.77%`，低于全局平均且采购提交是供应履约前置主路径；失败静默会制造采购状态假阳性。
- 红灯：`submitPurchaseOrder` rejected 后详情和列表 tag 被错误推进为 `已提交`；测试失败于应保持 `草稿`。
- 修复：`handleSubmit()` 对提交 API 失败增加 fail-loud 兜底，写入 `提交失败...`，并保留当前状态和提交按钮。
- 验证：目标 `purchase-board.test.ts` `9/9 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `30/30 passed`；`npm run lint` 通过；coverage `81 files / 325 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.33%`；`PurchaseBoard.vue` 行覆盖从 `54.77%` 提升到 `56.20%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 其它跨模块动作失败路径、`DocumentUpload.vue` 质量治理失败路径、`PurchaseBoard.vue` 剩余主流程失败路径或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Create Failure Alert

- 目标：覆盖采购新建 API 失败路径，确认失败时不能本地新增草稿单或关闭弹窗，而是保留输入并明确告知采购员。
- 成功标准：新增测试先红灯；修复后目标测试、外协/短缺风险/OTD 相邻测试、ParetoCompare 隔离验证、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `56.20%`，仍低于全局平均且采购新建是订单流入口；失败静默会制造采购单存在的假阳性。
- 红灯：`createPurchaseOrder` rejected 后新建弹窗关闭；现有 catch 还会本地插入 `po-new` 草稿单。
- 修复：`handleCreate()` 对新建 API 失败增加 fail-loud 兜底，写入 `创建失败...`，并保留弹窗和当前表单输入。
- 测试隔离修复：`pareto-compare.test.ts` 按组件名 stub `GanttChart`，避免 `defineAsyncComponent` 在 coverage teardown 后加载 `gantt-overrides.css`。
- 验证：目标 `purchase-board.test.ts` `10/10 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `31/31 passed`；`pareto-compare.test.ts` `2/2 passed`；`npm run lint` 通过；coverage `81 files / 326 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.36%`；`PurchaseBoard.vue` 行覆盖从 `56.20%` 提升到 `57.24%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 其它跨模块动作失败路径、`DocumentUpload.vue` 质量治理失败路径、`PurchaseBoard.vue` 剩余主流程失败路径或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Quality Retraining Publish Failure Alert

- 目标：覆盖质量知识正式发布失败路径，确认训练集未进入 AI 推荐链路时不会抛未处理异常，也不会新增成功发布历史。
- 成功标准：新增测试先红灯；修复后目标测试、治理面板/质量知识/知识治理同步相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖约 `56.59%`，仍低于全局平均且正式发布是质量知识推荐链路的发布闸门；失败静默会制造推荐链路假阳性。
- 红灯：`publishQualityKnowledgeRetrainingVersion` throw 后页面没有 `[role="alert"]`，并出现 component/native event handler unhandled error。
- 修复：`handleQualityRetrainingPublish()` 增加 `try/catch`，失败时写入 `质量知识正式发布失败...`，不刷新版本、不新增发布历史。
- 验证：目标 `document-upload.test.ts` `10/10 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `21/21 passed`；`npm run lint` 通过；coverage `81 files / 327 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.41%`；`DocumentUpload.vue` 行覆盖从 `56.59%` 提升到 `58.91%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 其它跨模块动作失败路径、`DocumentUpload.vue` 剩余质量治理失败路径、`PurchaseBoard.vue` 剩余主流程失败路径或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Success Audit Failure Alert

- 目标：覆盖助手动作主体成功后成功审计写入失败路径，确认业务成功和审计失败能被同时、准确地反馈。
- 成功标准：新增测试先红灯；修复后目标测试、助手动作/审计/执行包相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `54.95%`，仍低于全局平均且助手动作是跨模块闭环入口；成功审计失败不能把业务成功改写为动作失败。
- 红灯：交期恢复执行包写入和 `/scheduling` 跳转成功后，成功审计 throw；当前代码进入动作失败 catch 并写第二次 `permitted=false` 失败审计。
- 修复：成功审计调用增加内层 `try/catch`；失败时追加 `动作已执行，但成功审计写入失败...` alert，保留成功 status 和业务包。
- 验证：目标 `chat-panel.test.ts` `16/16 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `38/38 passed`；`npm run lint` 通过；coverage `81 files / 328 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.42%`；`ChatPanel.vue` 行覆盖从 `54.95%` 提升到 `55.12%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 其它跨模块动作失败路径、`DocumentUpload.vue` 剩余质量治理失败路径、`PurchaseBoard.vue` 剩余主流程失败路径或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 DocumentUpload Quality Retraining Rollback Failure Alert

- 目标：覆盖质量知识回滚失败路径，确认已发布训练集没有回滚成功时不会抛未处理异常，也不会新增成功回滚历史。
- 成功标准：新增测试先红灯；修复后目标测试、治理面板/质量知识/后台治理记录消费相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖约 `58.91%`，仍低于全局平均且回滚是质量知识推荐链路的撤回闸门；失败静默会制造回滚假阳性。
- 红灯：`rollbackQualityKnowledgeRetrainingVersion` throw 后页面没有 `[role="alert"]`，并出现 component/native event handler unhandled error。
- 修复：`handleQualityRetrainingRollback()` 增加 `try/catch`，失败时写入 `质量知识回滚失败...`，不刷新版本、不新增回滚历史。
- 验证：目标 `document-upload.test.ts` `11/11 passed`；相邻 `document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + admin-board.test.ts + audit-decision-replay-panel.test.ts + report-board.test.ts` `24/24 passed`；`npm run lint` 通过；coverage `81 files / 329 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.46%`；`DocumentUpload.vue` 行覆盖从 `58.91%` 提升到 `61.17%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 其它跨模块动作失败路径、`PurchaseBoard.vue` 剩余主流程失败路径、`ProductionBoard.vue` 剩余现场主流程失败路径或仍低覆盖的用户必经入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 PurchaseBoard Alternate Supplier Commitment Failure Alert

- 目标：覆盖替代供应商锁定审计写入失败路径，确认供应风险没有归档成功时不能把 UI 推进为已锁定或显示替代到货入口。
- 成功标准：新增测试先红灯；修复后目标测试、外协/供应风险/OTD 相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖约 `57.24%`，仍低于全局平均；替代供应商锁定是供应延期恢复和排产释放复核的关键路径，失败静默会制造供应恢复假阳性。
- 红灯：`writeSupplyRiskEscalation` throw 后 badge 显示 `替代已锁定`，并出现 native event handler unhandled error。
- 修复：`handleCommitAlternateSupplier()` 先写 `writeSupplyRiskEscalation` 和 `upsertOtdEvidenceChainRecord`；成功后才更新 `supplyRiskDecision` 与 trace，失败时写入 alert 并保持 open 状态。
- 验证：目标 `purchase-board.test.ts` `11/11 passed`；相邻 `purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `32/32 passed`；`npm run lint` 通过；coverage `81 files / 330 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.56%`；`PurchaseBoard.vue` 行覆盖从 `57.24%` 提升到 `60.57%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 其它跨模块动作失败路径、`ProductionBoard.vue` 剩余现场主流程失败路径、`ReportBoard.vue` / `RiskActionQueuePanel.vue` 等低覆盖关键入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel BOM Kitting Evidence Failure Alert

- 目标：覆盖 BOM 齐套包已生成但 OTD 证据写入失败路径，确认部分成功不会被误报为整体动作失败。
- 成功标准：新增测试先红灯；修复后目标测试、助手动作/BOM 齐套/OTD 相邻测试、lint、coverage 和发布闸门审计命令均有明确结果，并追加当天五份 `_docs` 记录。
- 选片依据：`ChatPanel.vue` 行覆盖约 `55.12%`，仍是最低覆盖的高频入口；BOM 齐套包是从助手动作进入 BOM、库存、排产和 OTD 证据链的关键闭环。
- 红灯：`upsertOtdEvidenceChainRecord` throw 后 `/bom` 未跳转，成功包卡片未展示，说明证据归档失败阻断了已经生成的齐套包。
- 修复：`writeAssistantBomKittingPackage()` 与 `writeAssistantBomKittingEvidence()` 分离；证据失败时追加 alert，但保留成功状态、包卡片、跳转和 permitted=true 审计。
- 验证：目标 `chat-panel.test.ts` `17/17 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `53/53 passed`；`npm run lint` 通过；coverage `81 files / 331 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.59%`；`ChatPanel.vue` 行覆盖从 `55.12%` 提升到 `55.64%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ChatPanel.vue` 设备停机包证据失败、`ProductionBoard.vue` 剩余现场主流程失败路径、`ReportBoard.vue` / `RiskActionQueuePanel.vue` 等低覆盖关键入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ChatPanel Equipment Downtime Evidence Failure Alert

- 目标：覆盖设备停机复核包已生成但 OTD 证据写入失败路径，确认部分成功不会被误报为整体动作失败。
- 成功标准：新增测试先红灯；修复后目标测试、助手动作/设备停机/OTD 相邻测试、lint、coverage 和文档记录均有明确结果。
- 选片依据：`ChatPanel.vue` 行覆盖约 `55.64%`，仍是低覆盖高频入口；设备停机复核包是从助手动作进入设备维护、AI 排产事件队列、风险预警和 OTD 证据链的关键闭环。
- 红灯：`upsertOtdEvidenceChainRecord` throw 后 `/equipment` 未跳转，成功包卡片未展示，说明证据归档失败阻断了已经生成的停机复核包。
- 修复：`writeAssistantEquipmentDowntimePackage()` 与 `writeAssistantEquipmentDowntimeEvidence()` 分离；证据失败时追加 alert，但保留成功状态、包卡片、跳转和 permitted=true 审计。
- 验证：目标 `chat-panel.test.ts` `18/18 passed`；相邻 `chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `54/54 passed`；`npm run lint` 通过；coverage `81 files / 332 tests passed`。
- 覆盖率记录：fresh 总行覆盖 `66.56%`；`ChatPanel.vue` 行覆盖从 `55.64%` 提升到 `56.14%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ProductionBoard.vue` 剩余现场主流程失败路径、`ReportBoard.vue` / `RiskActionQueuePanel.vue` 等低覆盖关键入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ProductionBoard Exception Evidence Failure Alert

- 目标：覆盖现场异常后端已上报但异常管理/OTD 证据写入失败路径，确认部分成功不会被静默吞掉或误报为全成功。
- 成功标准：新增测试先红灯；修复后目标测试、生产异常/OTD/扫码/人员派工相邻测试、lint、coverage、发布闸门审计和文档记录均有明确结果。
- 选片依据：`ProductionBoard.vue` 行覆盖约 `59.41%`，仍低于全局平均；现场异常上报是生产执行进入异常处置、排产风险和 OTD 复盘的关键闭环。
- 红灯：`writeProductionAnomalyEvent` throw 后没有 `[role="alert"]`，并出现 native event handler unhandled error。
- 修复：`confirmException()` 在 `reportException` 成功后，将异常事件、扫码异常证据、风险 trace 和 OTD 证据写入包进 `try/catch`；证据失败时追加 alert，不显示全成功提示。
- 验证：目标 `production-board.test.ts` `11/11 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts + otd-evidence-chain-sync.test.ts + barcode-scan-evidence-sync.test.ts + labor-assignment-sync.test.ts` `34/34 passed`；`npm run lint` 通过；coverage `81 files / 333 tests passed`；发布闸门审计仍 `FAIL`。
- 覆盖率记录：fresh 总行覆盖 `66.61%`；`ProductionBoard.vue` 行覆盖从 `59.41%` 提升到 `59.45%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ReportBoard.vue` / `RiskActionQueuePanel.vue` / `ProductionBoard.vue` 剩余关键失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 RiskActionQueuePanel Escalation Trace Failure Alert

- 目标：覆盖风险升级 trace 写入失败路径，确认风险未归档时不能把卡片推进为 `已升级`。
- 成功标准：新增测试先红灯；修复后目标测试、风险 trace/SLA/监控态势/生产异常/异常分流/助手执行包相邻测试、lint、coverage、发布闸门审计和文档记录均有明确结果。
- 选片依据：`RiskActionQueuePanel.vue` 行覆盖约 `59.13%`，仍低于全局平均；风险升级是生产异常、监控态势和助手执行包进入责任闭环的关键动作。
- 红灯：`appendRiskActionTrace` throw 后卡片显示 `已升级`，并出现 native event handler unhandled error。
- 修复：`escalate()` 在改变状态前先写 trace；失败时写入 `风险升级失败...` alert，保留 `待处置`、原负责人和原处置留痕。
- 验证：目标 `risk-action-queue-panel.test.ts` `2/2 passed`；相邻 `risk-action-queue-panel.test.ts + risk-action-sync.test.ts + risk-sla-review-sync.test.ts + monitoring-situation-escalation-sync.test.ts + production-anomaly-sync.test.ts + anomaly-dispatch-sync.test.ts + assistant-action-package-sync.test.ts` `34/34 passed`；`npm run lint` 通过；coverage `81 files / 334 tests passed`；发布闸门审计仍 `FAIL`。
- 覆盖率记录：fresh 总行覆盖 `66.65%`；`RiskActionQueuePanel.vue` 行覆盖从 `59.13%` 提升到 `63.46%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `ReportBoard.vue`、`BarcodePrintBoard.vue`、`EmployeeBoard.vue` 等低覆盖关键入口；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 ReportBoard POC Review Signoff Failure Alert

- 目标：覆盖 POC 复盘签署记录写入失败路径，确认客户验收证据未归档时不能抛未处理异常或推进为已签署。
- 成功标准：新增测试先红灯；修复后目标测试、POC 签署/转上线/试运行/hypercare/OTD 相邻测试、lint、coverage、发布闸门审计和文档记录均有明确结果。
- 选片依据：`ReportBoard.vue` 行覆盖约 `59.43%`，仍低于全局平均；POC 复盘签署是验收证据进入上线行动包的前置闸门。
- 红灯：`writePocReviewSignoffRecord` throw 后页面没有 `[role="alert"]`，并出现 native event handler unhandled error。
- 修复：`handlePocReviewSignoff()` 增加 `try/catch`；失败时写入 `POC 复盘签署失败...` alert，保留未签署状态。
- 验证：目标 `report-board.test.ts` `2/2 passed`；相邻 `report-board.test.ts + poc-review-signoff-sync.test.ts + poc-rollout-package-sync.test.ts + poc-pilot-run-sync.test.ts + poc-hypercare-sync.test.ts + otd-evidence-chain-sync.test.ts` `26/26 passed`；`npm run lint` 通过；coverage `81 files / 335 tests passed`；发布闸门审计仍 `FAIL`。
- 覆盖率记录：fresh 总行覆盖 `66.79%`；`ReportBoard.vue` 行覆盖从 `59.43%` 提升到 `61.89%`。
- 后续：继续按 Coverage-Leverage Routing，优先 `BarcodePrintBoard.vue`、`EmployeeBoard.vue`、`ChatPanel.vue` 或 `ProductionBoard.vue` 的低覆盖关键失败路径；B 轨仍必须单独补真实 hosted CI、staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## 6.6 Release Gate Anchored PASS Audit

- 目标：加固 v1.0.0 B 轨总审计，确保单项证据包只有独立结果行为 PASS 时才算通过。
- 成功标准：新增架构门先红灯；修复后目标门、release gate 过滤门、PowerShell parser、动态 spoof 负例、架构全量和正式 release audit 均有明确结果。
- 选片依据：B 轨发布闸门是当前 v1.0.0 唯一真实阻断；总审计脚本的 PASS 判定必须比前端质量切片更优先。
- 红灯：`run-release-gate-audit.ps1` 仍使用 `.Contains("Result: PASS")`，可能被正文或历史日志 spoof。
- 修复：新增 anchored PASS 判定，只接受 `Result: PASS` / `- Result: PASS` 独立行。
- 附带修正：`Sprint4LlmCostControls...` 门禁从旧 `llmConfig.MaxConcurrency` 字符串更新为 `IOptions<LlmConfig>.Value.MaxConcurrency`，匹配 Sprint5 Pro AI Options 口径。
- 验证：目标 release gate 架构门 `1/1 passed`；release gate 过滤 `2/2 passed`；spoof 临时报报告 `EXPECTED_FAIL`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `72/72 passed`；正式 release gate 审计仍 `FAIL`。
- 后续：继续优先 B 轨真实证据闭环：hosted CI RunUrl/RunId、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天观察；A 轨前端覆盖率只在 B 轨无法推进时作为次优补强。

## 6.6 Release Gate Anchored Security Signoff Audit

- 目标：加固安全签字 release gate，确保只有独立签字状态行能关闭 security signoff。
- 成功标准：新增架构门先红灯；修复后目标门、动态 signoff spoof 负例、release gate 过滤、PowerShell parser、架构全量和正式 release audit 均有明确结果。
- 选片依据：安全签字是 v1.0.0 B 轨人工闸门；签字包正文示例不能替代真实 signer 状态。
- 红灯：`Test-SignoffSigned()` 使用裸 `.Contains("Status: SIGNED")` / `.Contains("Decision: SIGNED")`。
- 修复：改为 `Test-AnchoredSignoffSigned()`，要求独立 `Status: SIGNED` 和 `Decision: SIGNED` 行同时存在。
- 验证：目标架构门 `1/1 passed`；动态 signoff spoof `EXPECTED_FAIL`；release gate 过滤 `3/3 passed`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `73/73 passed`；正式 release gate audit 仍 `FAIL`。
- 后续：继续补真实 hosted CI、staging、Attack Chain A/B/C、人工安全签字、首次灰度和 14 天观察证据。

## 6.6 Hosted CI Job Summary Evidence Gate

- 目标：确保 hosted CI release gate 必须同时提供远端 `RunUrl`、`RunId` 和 job summary。
- 成功标准：新增/扩展架构门先红灯；修复后目标门、动态 RunUrl/RunId-only 负例、相关架构过滤、PowerShell parser、架构全量和正式 release audit 均有明确结果。
- 选片依据：总审计 required evidence 已写 `job summary`，单项脚本必须执行同一标准，避免弱证据关闭 hosted CI。
- 红灯：hosted CI 脚本/报告缺 `job summary` token，且 `Evidence` 不作为必填。
- 修复：`Evidence` 空值加入 violations；Gate 文案更新为 `hosted runner RunUrl, RunId, and job summary`；刷新 20260601/20260602 FAIL 报告。
- 验证：目标架构门 `1/1 passed`；动态负例 RunUrl/RunId-only `EXPECTED_FAIL`；相关架构过滤 `4/4 passed`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `73/73 passed`；正式 release gate audit 仍 `FAIL`。
- 后续：在有 GitHub 权限的环境触发 hosted CI，并回填真实 RunUrl、RunId、job summary；再跑单项脚本和总审计。

## 6.6 Attack Chain VerifiedAt Timestamp Gate

- 目标：确保 Attack Chain A/B/C 人工验证报告的 `VerifiedAt` 是可解析时间戳，而不是任意非空文本。
- 成功标准：新增/扩展架构门先红灯；修复后目标门、动态 invalid timestamp 负例、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：Attack Chain 人工验证是安全签字前置证据；时间戳格式必须可审计，不能让占位字符串进入 release gate。
- 红灯：Attack Chain 脚本只检查 `VerifiedAt` 非空，缺少 `[DateTimeOffset]::Parse`。
- 修复：非空 `VerifiedAt` 必须可由 `[DateTimeOffset]::Parse()` 解析；失败则写入 violation 并保持报告 `Result: FAIL`。
- 验证：目标架构门 `1/1 passed`；动态负例 `VerifiedAt=not-a-date` 输出 `EXPECTED_FAIL`；20260601/20260602 Attack Chain FAIL 报告已刷新。
- 后续：需要真人执行 Attack Chain A/B/C 手工验证，回填 Verifier、ISO 时间戳、三条 PASS 和证据链接；然后再跑单项脚本、安全签字和总 release gate 审计。

## 6.6 Release Gate Attack Chain Evidence Predicate

- 目标：确保总 release gate 对 Attack Chain A/B/C 复核完整人工证据字段，而不是只看 `Result: PASS`。
- 成功标准：新增架构门先红灯；修复后目标门、Attack Chain spoof 负例、完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：总审计是 v1.0.0 最终闸门；单项脚本再严格，也不能让总闸门用更弱规则放行。
- 红灯：`Add-Gate "Attack Chain A/B/C"` 仍调用 `Test-AnchoredReportPass $attackChain`。
- 修复：新增 `Test-AttackChainEvidencePass()`，要求 PASS 结果行、VERIFIED 状态、人、可解析时间戳、三条链路 PASS 和三条 evidence。
- 验证：目标架构门 `1/1 passed`；spoof 样本 `EXPECTED_FAIL`；完整合法样本 `EXPECTED_PASS`；正式 release gate audit 仍 `FAIL`。
- 后续：真人完成 Attack Chain A/B/C 后，优先回填单项报告并跑总审计；随后才能进入安全签字。

## 6.6 Release Gate Staging Evidence Predicate

- 目标：确保总 release gate 对 PostgreSQL/staging 复核真实 rehearsal 字段，而不是只看 `Result: PASS`。
- 成功标准：新增架构门先红灯；修复后目标门、staging spoof 负例、完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：staging 是 v1.0.0 数据/部署底线；单项脚本必须跑迁移和健康检查，总闸门也必须复核这些证据。
- 红灯：`Add-Gate "PostgreSQL/staging"` 仍调用 `Test-AnchoredReportPass $staging`。
- 修复：新增 `Test-StagingEvidencePass()`，要求 PASS 结果行、Production 环境、连接串、Docker/依赖/migration/API 步骤、`/live`、`/ready` 和 4 个成功 exit code。
- 验证：目标架构门 `1/1 passed`；spoof 样本 `EXPECTED_FAIL`；完整合法样本 `EXPECTED_PASS`；正式 release gate audit 仍 `FAIL`。
- 后续：在 Docker/PostgreSQL/staging 可用环境跑 `run-staging-rehearsal.ps1`，确认 migrations、`/live`、`/ready` 都写入报告后，再跑总审计。

## 6.6 Release Gate Hosted CI Evidence Predicate

- 目标：确保总 release gate 对 Hosted CI 复核真实远端 runner 字段，而不是只看 `Result: PASS`。
- 成功标准：新增架构门先红灯；修复后目标门、hosted CI spoof 负例、完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：hosted CI 是 v1.0.0 发布质量门；本地 workflow 文件不能替代远端 runner run、RunUrl、RunId 和 job summary。
- 红灯：`Add-Gate "Hosted CI"` 仍调用 `Test-AnchoredReportPass $hostedCi`。
- 修复：新增 `Test-HostedCiEvidencePass()`，要求 PASS 结果行、READY 状态、RunUrl、RunId、job summary、ci/eval workflow、`gh run` 和成功 exit code。
- 验证：目标架构门 `1/1 passed`；spoof 样本 `EXPECTED_FAIL`；完整合法样本 `EXPECTED_PASS`；正式 release gate audit 仍 `FAIL`。
- 后续：在有 GitHub 权限的环境触发 hosted CI，回填真实 RunUrl、RunId、job summary，并确认 `gh run` 证据后再跑总审计。

## 6.6 Release Gate Gray Observation Evidence Predicate

- 目标：确保总 release gate 对 Gray observation 复核真实首次灰度和 14 天无 P0/P1 观察证据，而不是只看 `Result: PASS`。
- 成功标准：新增架构门先红灯；修复后目标门、gray observation spoof 负例、完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：灰度后 14 天观察是 v1.0.0 的墙钟地板；总闸门必须 fail loud，不能让观察中或短窗口报告误关闭。
- 红灯：`Add-Gate "Gray observation"` 仍调用 generic PASS 判定，缺少灰度观察专用字段复核。
- 修复：新增 `Test-GrayObservationEvidencePass()`，要求 PASS 结果行、PASS 状态、GrayReleaseId、三个可解析时间戳、至少 14 天窗口、P0/P1=0 和 evidence。
- 验证：目标架构门 `1/1 passed`；spoof 样本 `EXPECTED_FAIL`；完整 14 天合法样本 `EXPECTED_PASS`；`ReleaseGateAudit|GrayObservation` 过滤 `8/8 passed`；parser `parse ok`；正式 release gate audit 仍 `FAIL`。
- 后续：完成真实首次灰度后，等待 14 个日历日且 P0/P1=0，再回填 gray observation 报告并跑总审计；在此之前 A 轨绿灯不能代表 v1.0.0 可发布。

## 6.6 Release Gate Security Signoff Evidence Predicate

- 目标：确保总 release gate 对 Security signoff 复核真实签字人、签字时间、自评、Attack Chain 和 evidence，而不是只看 SIGNED 状态行。
- 成功标准：新增架构门先红灯；修复后目标门、security signoff spoof 负例、完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：安全签字是 v1.0.0 人工硬闸门；签字状态必须带可审计 signer/time/evidence，不能让空签字包误关闭。
- 红灯：`Add-Gate "Security signoff"` 只调用 anchored SIGNED 判定，缺少签字证据专用字段复核。
- 修复：新增 `Test-SecuritySignoffEvidencePass()`，要求 SIGNED 状态、SIGNED decision、Signer、可解析 SignedAt、Automated Self-Assessment、Attack Chain A/B/C 和 evidence。
- 验证：目标架构门 `1/1 passed`；spoof 样本 `EXPECTED_FAIL`；完整合法样本 `EXPECTED_PASS`。
- 后续：真人完成安全复核后，回填 signer、ISO 时间戳、decision 和 evidence；再跑总 release gate 审计。

## 6.6 Hosted CI GitHub Actions RunUrl/RunId Gate

- 目标：确保 hosted CI 证据的 `RunUrl` 是 GitHub Actions run URL，`RunId` 是数字，而不是任意非空占位符。
- 成功标准：新增架构门先红灯；修复后目标门、单项脚本非法 URL/RunId 负例、总闸门非法 URL/RunId 负例、完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：hosted CI 是 v1.0.0 发布质量门；证据必须可追溯到真实 GitHub Actions run。
- 红灯：`run-hosted-ci-evidence.ps1` 缺少 `Test-GitHubActionsRunUrl` 和 `Test-NumericRunId`。
- 修复：单项脚本和总闸门同步新增 GitHub Actions URL / numeric RunId 校验。
- 验证：目标架构门 `1/1 passed`；单项非法样本 `EXPECTED_FAIL`；总闸门非法样本 `EXPECTED_FAIL` 且只卡 Hosted CI；完整合法样本 `EXPECTED_PASS`；正式 hosted CI 报告刷新后仍 `FAIL`。
- 后续：在有 GitHub 权限的环境触发 workflow，回填真实 `https://github.com/.../actions/runs/<id>`、数字 RunId 和 job summary。

## 6.6 Release Gate Staging Health HTTP Success Predicate

- 目标：确保 staging 总闸门必须看到 `/live` 和 `/ready` health 段落里的 HTTP 2xx/3xx，而不是只看 health 标签。
- 成功标准：新增架构门先红灯；修复后目标门、HTTP 500 负例、HTTP 200 合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：staging 是 v1.0.0 数据/部署底线；迁移和 API 启动后必须以真实 health HTTP 成功作为证据。
- 红灯：总审计脚本缺少 `Test-StagingHealthEndpointPass`。
- 修复：新增 health endpoint 段落级 predicate，并并入 `Test-StagingEvidencePass()`。
- 验证：目标架构门 `1/1 passed`；HTTP 500 staging 样本 `EXPECTED_FAIL` 且只卡 staging；HTTP 200 样本 `EXPECTED_PASS`；正式 staging rehearsal 刷新后仍因 Docker 不可用 `FAIL`。
- 后续：在 Docker/PostgreSQL/staging 可用环境跑 rehearsal，取得 migrations、API 启动、`/live`、`/ready` HTTP 2xx/3xx 后再跑总审计。

## 6.6 Release Gate Attack Chain Per-Section Evidence Predicate

- 目标：确保总 release gate 对 Attack Chain A、B、C 三段分别复核 PASS 和 evidence，而不是只数总数。
- 成功标准：新增架构门先红灯；修复后目标门、重复 A 证据负例、A/B/C 完整合法样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：Attack Chain A/B/C 是安全签字前置证据；每条链路的人工验证不能互相替代。
- 红灯：总审计脚本缺少 `Test-AttackChainSectionPass`。
- 修复：新增 Attack Chain 段落级 predicate，并并入 `Test-AttackChainEvidencePass()`。
- 验证：目标架构门 `1/1 passed`；A 段重复三条 evidence、B/C 缺 evidence 样本 `EXPECTED_FAIL` 且只卡 Attack Chain；A/B/C 完整样本 `EXPECTED_PASS`。
- 后续：真人验证 Attack Chain A/B/C 时必须分别回填三段 PASS 和 evidence，再跑总审计。

## 6.6 Gray Observation OBSERVING Single-Gate Fail Loud

- 目标：确保 gray observation 单项脚本在 `OBSERVING` 状态永远 fail loud，直到 14 天观察窗口完成并满足 P0/P1=0。
- 成功标准：新增架构门先红灯；修复后目标门、OBSERVING 负例、完整 PASS 样本、PowerShell parser、架构回归和正式 release audit 均有明确结果。
- 选片依据：灰度后 14 天墙钟是 v1.0.0 地板；观察中不能被单项报告误表达为完成。
- 红灯：脚本缺少 `Status -eq "OBSERVING"` fail-loud。
- 修复：OBSERVING 状态追加 `Gray observation is still running.` violation。
- 验证：目标架构门 `1/1 passed`；OBSERVING 样本 `EXPECTED_FAIL`；完整 PASS 样本 `EXPECTED_PASS`；正式 gray report 刷新后仍 `NOT_STARTED` / `FAIL`。
- 后续：首次灰度启动后可以用 OBSERVING 报告记录进行中状态，但直到 observation ended + P0/P1=0 + evidence 齐全前不能关闭。

## 6.6 Hosted CI gh run Evidence Gate

- 目标：确保 hosted CI 单项脚本必须能在授权环境查询 `gh run list`，不能只靠手填 RunUrl/RunId/job summary 关闭单项 gate。
- 成功标准：新增架构门先红灯；修复后目标门、合法字段但 `gh run` 不可用负例、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：hosted CI 是 v1.0.0 质量门；证据必须证明 GitHub Actions run 可查询，而不是只接受人工填字段。
- 红灯：脚本缺少 `gh run list must succeed in the authorized hosted CI evidence environment.` fail-loud token。
- 修复：`gh run list` exit code 非 0 时无条件追加 violation，不再允许 RunUrl 绕过该失败。
- 验证：目标架构门 `1/1 passed`；合法 GitHub Actions RunUrl、数字 RunId 和 job summary 动态样本仍 `EXPECTED_FAIL`；`HostedCiEvidence|ReleaseGateAudit` 过滤 `12/12 passed`；parser `parse ok`；正式 release audit 仍 `FAIL`。
- 后续：在 GitHub 授权环境触发并查询 hosted CI run，回填真实 RunUrl、RunId、job summary，并确认 `gh run list` 成功后再跑总审计。

## 6.6 Staging Migration Connection Evidence

- 目标：确保 staging rehearsal 报告区分 API 容器连接串和 EF migration 实际连接串，避免审计时混淆 `Host=postgresql` 与 `Host=localhost`。
- 成功标准：新增架构门先红灯；修复后目标门、正式 fail-loud staging 报告、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：PostgreSQL/staging 是 v1.0.0 数据/部署底线；迁移证据必须可追溯到实际使用的连接串。
- 红灯：脚本缺少 `$migrationConnectionString`、`Migration connection string` 和用该变量设置 `ConnectionStrings__DefaultConnection` 的 token。
- 修复：新增 `$migrationConnectionString` 变量，报告头写明迁移连接串，EF migration 使用同一变量。
- 验证：目标架构门 `1/1 passed`；正式 staging 报告仍 `EXPECTED_FAIL` 但已包含迁移连接串；`StagingRehearsal|ReleaseGateAudit` 过滤 `12/12 passed`；parser `parse ok`；正式 release audit 仍 `FAIL`。
- 后续：在 Docker/PostgreSQL/staging 可用环境跑 rehearsal，确认 migrations、API、`/live`、`/ready` 均 PASS 后再跑总审计。

## 6.6 Attack Chain Placeholder Evidence Gate

- 目标：确保 Attack Chain A/B/C 人工验证 evidence 不能使用 `TBD`、`PENDING`、`待补` 等占位词。
- 成功标准：新增架构门先红灯；修复后目标门、占位 evidence 负例、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Attack Chain 是安全签字前置闸门；人工证据必须是真实 dated artifact，不能是占位文案。
- 红灯：脚本缺少 `Test-RealEvidence` 和 `Evidence cannot be a placeholder` token。
- 修复：新增 `Test-RealEvidence()`，空值和常见占位词都不算有效 evidence。
- 验证：目标架构门 `1/1 passed`；Verifier/VerifiedAt/A-B-C PASS 都齐但 evidence 为占位词时仍 `EXPECTED_FAIL`；`AttackChain|ReleaseGateAudit` 过滤 `12/12 passed`；parser `parse ok`；正式 release audit 仍 `FAIL`。
- 后续：真人验证三条攻击链时必须分别回填具体证据链接/记录，不能填占位词后签字。

## 6.6 Release Gate Security Signoff Placeholder Evidence Predicate

- 目标：确保 Security signoff 总闸门拒绝 `TBD` / `PENDING` / `待补` 等占位 signer/evidence。
- 成功标准：架构门先红灯；修复后目标门、占位签字负例、完整合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：安全签字是 v1.0.0 人工硬闸门；总审计必须确认签字人和 evidence 是具体值。
- 红灯：总审计脚本缺少 `Test-RealEvidence` 和 `Evidence cannot be a placeholder` token。
- 修复：`Test-SecuritySignoffEvidencePass()` 用 `Test-RealEvidence()` 校验 `Signer` 和 `Evidence`。
- 验证：目标架构门 `1/1 passed`；其它四项 PASS 但 Security signoff signer/evidence 为 `TBD` 时总审计 `EXPECTED_FAIL` 且只卡 Security signoff；完整非占位签字样本 `EXPECTED_PASS`；`SecuritySignoff|ReleaseGateAudit` 过滤 `11/11 passed`；正式 release audit 仍 `FAIL`。
- 后续：真人签字时必须填写真实 signer、ISO SignedAt 和具体 evidence，不能用占位词关闭安全签字。

## 6.6 Release Gate Attack Chain Placeholder Evidence Predicate

- 目标：确保 Attack Chain 总闸门拒绝 `TBD` / `PENDING` / `待补` 等占位 verifier/evidence。
- 成功标准：架构门先红灯；修复后目标门、占位 Attack Chain 负例、完整合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Attack Chain 是安全签字前置硬闸门；总审计必须防止手工拼报告绕过单项脚本。
- 红灯：`Test-AttackChainEvidencePass()` / `Test-AttackChainSectionPass()` 未使用 `Test-RealEvidence()`。
- 修复：Attack Chain verifier、总 evidence 计数和 A/B/C 分段 evidence 全部改用 `Test-RealEvidence()`。
- 验证：目标架构门 `1/1 passed`；其它四项 PASS 但 Attack Chain verifier/evidence 为占位词时总审计 `EXPECTED_FAIL` 且只卡 Attack Chain；完整非占位 Attack Chain 样本 `EXPECTED_PASS`；`AttackChain|ReleaseGateAudit` 过滤 `12/12 passed`；正式 release audit 仍 `FAIL`。
- 后续：真人验证 Attack Chain A/B/C 时必须回填具体证据，不允许用占位词或手工 PASS 报告关闭总闸门。

## 6.6 Hosted CI Job Summary Placeholder Evidence Gate

- 目标：确保 hosted CI 单项脚本和总闸门拒绝占位 job summary。
- 成功标准：架构门先红灯；修复后单项占位负例、总闸门占位负例、完整合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：hosted CI 是 v1.0.0 质量门；job summary 必须是真实 hosted runner 摘要，不能是占位文案。
- 红灯：单项脚本缺 `Test-RealEvidence`，总审计未拒绝 `Evidence: job summary: TBD`。
- 修复：单项脚本和总审计都使用 `Test-RealEvidence()`；冒号后的主体若为占位词也判无效。
- 验证：`Evidence=TBD` 单项脚本 `EXPECTED_FAIL`；其它四项 PASS 但 Hosted CI `Evidence: job summary: TBD` 时总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；非占位 job summary 样本 `EXPECTED_PASS`；`HostedCi|ReleaseGateAudit` 过滤 `13/13 passed`；正式 release audit 仍 `FAIL`。
- 后续：在 GitHub 授权环境提供真实 job summary 后再回填 hosted CI 报告并跑总审计。

## 6.6 Gray Observation Placeholder Evidence Gate

- 目标：确保 gray observation 单项脚本和总闸门拒绝占位 evidence。
- 成功标准：架构门先红灯；修复后单项占位负例、总闸门占位负例、完整合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：灰度后 14 天无 P0/P1 是 v1.0.0 墙钟硬闸门；证据必须是真实观察记录，不能是占位文案。
- 红灯：单项脚本缺 `Test-RealEvidence`，总审计 gray predicate 只判 Evidence 非空。
- 修复：单项脚本和总审计都使用 `Test-RealEvidence()` 校验 gray observation Evidence。
- 验证：所有 PASS 字段满足但 `Evidence=TBD` 的单项脚本 `EXPECTED_FAIL`；其它四项 PASS 但 Gray observation `Evidence: TBD` 时总审计 `EXPECTED_FAIL` 且只卡 Gray observation；非占位 observation evidence 样本 `EXPECTED_PASS`；`GrayObservation|ReleaseGateAudit` 过滤 `12/12 passed`；正式 release audit 仍 `FAIL`。
- 后续：首次灰度完成并观察满 14 天后，必须回填真实观察看板/事故查询证据，再跑总审计。

## 6.6 Release Gate Hosted CI gh run Section Exit Code Predicate

- 目标：确保 Hosted CI 总闸门只接受 `## gh run` 段落里的 `Exit code: 0`，不能用其它命令成功替代。
- 成功标准：架构门先红灯；修复后 gh run 失败负例、gh run 成功合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Hosted CI release gate 必须证明 GitHub Actions run 可查询；`git ls-remote` 成功不是远端 runner 成功。
- 红灯：总审计缺 `Test-SectionExitCodeZero`。
- 修复：新增段落级 exit code predicate，Hosted CI 使用 `Test-SectionExitCodeZero $Text "gh run"`。
- 验证：`git ls-remote` 成功但 `gh run Exit code: 1` 时总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；`gh run Exit code: 0` 合法样本 `EXPECTED_PASS`；`HostedCi|ReleaseGateAudit` 过滤 `13/13 passed`；正式 release audit 仍 `FAIL`。
- 后续：在授权环境跑 `gh run list` 并让 hosted CI 报告写入 `## gh run` 成功段落。

## 6.6 Release Gate Staging Section Exit Code Predicate

- 目标：确保 PostgreSQL/staging 总闸门只接受四个关键 staging 段落里的 `Exit code: 0`，不能用无关命令成功替代。
- 成功标准：架构门先红灯；修复后 staging 关键段落失败负例、staging 关键段落成功合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：PostgreSQL/staging release gate 必须证明 Docker、依赖启动、EF migration 和 API 启动各自成功；全报告凑够 4 个成功码不是 staging rehearsal 成功。
- 红灯：总审计缺 staging 四段 `Test-SectionExitCodeZero` 调用。
- 修复：staging predicate 改为分别调用 `Test-SectionExitCodeZero $Text "Docker version"`、`"Start external dependencies"`、`"Apply EF migrations"`、`"Start API"`。
- 验证：四个关键段落失败但无关段落成功时总审计 `EXPECTED_FAIL` 且只卡 PostgreSQL/staging；四个关键段落均成功时合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；parser `parse ok`。
- 后续：补跑 staging/release gate 过滤和正式 release audit；在 Docker/PostgreSQL/staging 可用环境跑真实 rehearsal。

## 6.6 Release Gate Security Signoff Blocking Text Predicate

- 目标：确保 Security signoff 总闸门拒绝正文仍包含 `PENDING`、`UNSIGNED`、`FAIL` 阻断语义的签字包。
- 成功标准：架构门先红灯；修复后阻断正文负例、清晰签字合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：安全签字是人工硬闸门；签字包必须自洽，不能字段签了但正文还承认 Attack Chain 或签字状态未完成。
- 红灯：总审计缺 `Test-NoBlockingSecuritySignoffText`。
- 修复：新增 blocking text predicate，Security signoff 使用 `Test-NoBlockingSecuritySignoffText $Text`。
- 验证：其它四项 PASS 但签字包正文仍写 `PENDING` / `FAIL` 时总审计 `EXPECTED_FAIL` 且只卡 Security signoff；清除阻断语义后合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；parser `parse ok`。
- 后续：补跑 security/release gate 过滤和正式 release audit；真人签字时必须先清除正文里的未完成状态。

## 6.6 Hosted CI Exact RunUrl Predicate

- 目标：确保 Hosted CI RunUrl 精确匹配 GitHub Actions run 页面并以数字 run id 结束。
- 成功标准：架构门先红灯；修复后尾随路径 RunUrl 负例、精确 RunUrl 合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Hosted CI release gate 依赖 RunUrl/RunId 可审计对应；前缀匹配不能证明给出的是实际 run 页面。
- 红灯：Hosted CI RunUrl 架构门缺尾部锚定正则。
- 修复：单项脚本和总审计脚本的 RunUrl predicate 都使用 `^https://github.com/.+/actions/runs/\d+$`。
- 验证：`.../actions/runs/123456/extra` 时总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；精确 `/runs/123456` 时合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；两个 parser `parse ok`。
- 后续：补跑 hosted/release gate 过滤和正式 release audit；真实 evidence 必须回填精确 GitHub Actions run URL。

## 6.6 Hosted CI RunUrl RunId Consistency Predicate

- 目标：确保 Hosted CI RunUrl 末尾 run id 与 RunId 字段一致。
- 成功标准：架构门先红灯；修复后 RunUrl/RunId 错配负例、匹配合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Hosted CI release gate 依赖 RunUrl 和 RunId 对同一个远端 run 形成交叉证据；各自合法但错配不能关闭 gate。
- 红灯：Hosted CI RunUrl/RunId 架构门缺一致性 predicate。
- 修复：单项脚本和总审计脚本都新增 `Test-GitHubActionsRunUrlMatchesRunId()`，并在 hosted CI 判定中使用。
- 验证：RunUrl `/runs/123456` + `RunId: 999999` 时总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；RunId 改为 `123456` 时合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；两个 parser `parse ok`。
- 后续：补跑 hosted/release gate 过滤和正式 release audit；真实 evidence 必须保证 RunUrl 与 RunId 来自同一个 GitHub Actions run。

## 6.6 Hosted CI gh run Output RunId Predicate

- 目标：确保 Hosted CI 的 `## gh run` 成功段落包含当前 `RunId`。
- 成功标准：架构门先红灯；修复后 gh run 缺目标 RunId 负例、gh run 含目标 RunId 合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Hosted CI release gate 需要 CLI 查询输出和手工字段互相印证；只有 exit code 0 不足以证明查询到的是同一个 run。
- 红灯：Hosted CI 总审计缺 section contains predicate。
- 修复：总审计新增 `Test-SectionContainsText()`，Hosted CI 使用 `Test-SectionContainsText $Text "gh run" $runId`。
- 验证：字段为 `/runs/123456` + `RunId: 123456` 但 `gh run` 只含 `999999` 时总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；`gh run` 含 `123456` 时合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；parser `parse ok`。
- 后续：补跑 hosted/release gate 过滤和正式 release audit；真实 evidence 必须让 `gh run` 输出含目标 run id。

## 6.6 Hosted CI gh run RunId Number Token Predicate

- 目标：确保 Hosted CI 的 `## gh run` 段落用数字 token 匹配当前 `RunId`，不能用长数字子串替代。
- 成功标准：架构门先红灯；修复后 RunId 子串负例、独立 RunId token 合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Hosted CI release gate 需要精确绑定同一个 run；普通 `Contains` 对数字 id 太宽。
- 红灯：Hosted CI 总审计缺 number-token section predicate。
- 修复：总审计改用 `Test-SectionContainsNumberToken $Text "gh run" $runId`，通过 `(?<!\d)` / `(?!\d)` 防止数字邻接误命中。
- 验证：`gh run` 只含 `91234567` 时总审计 `EXPECTED_FAIL` 且只卡 Hosted CI；`gh run` 含独立 `123456` 时合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；parser `parse ok`。
- 后续：补跑 hosted/release gate 过滤和正式 release audit；真实 evidence 必须让 `gh run` 输出含独立目标 RunId。

## 6.6 Hosted CI Single-Gate gh run RunId Predicate

- 目标：确保 `run-hosted-ci-evidence.ps1` 在单项证据生成阶段就要求 `gh run list` 输出包含当前 `RunId`。
- 成功标准：架构门先红灯；修复后 `gh run list` 缺目标 RunId 负例、含目标 RunId 合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：单项证据包应与总审计同样 fail loud，不能把弱证据交给总闸门兜底。
- 红灯：Hosted CI 单项脚本缺 number-token text predicate。
- 修复：单项脚本新增 `Test-TextContainsNumberToken()`，`gh run list` exit code 0 时仍必须确认输出含独立目标 RunId。
- 验证：临时 `gh.cmd` 输出 `999999 completed success` 时单项脚本 `EXPECTED_FAIL`；输出 `123456 completed success` 时 `EXPECTED_PASS`；目标架构门 `1/1 passed`；parser `parse ok`。
- 后续：补跑 hosted/release gate 过滤和正式 release audit；真实 evidence 必须来自授权环境并包含目标 RunId。

## 6.6 Gray Observation Future End Time Gate

- 目标：确保 gray observation 单项脚本和总闸门拒绝未来 `ObservationEndedAt`。
- 成功标准：架构门先红灯；修复后未来结束时间负例、过去满 14 天合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：灰度观察是 v1.0.0 的墙钟硬闸门，不能用未来时间戳压缩 14 天等待。
- 红灯：gray observation 单项和总审计缺未来结束时间拒绝 token。
- 修复：单项脚本和总审计都在解析观察时间后要求 `ObservationEndedAt <= UtcNow`。
- 验证：未来结束时间样本在单项脚本和总审计中均 `EXPECTED_FAIL`；过去满 14 天样本均 `EXPECTED_PASS`；目标架构过滤 `2/2 passed`；两个 parser `parse ok`。
- 后续：补跑 gray/release gate 过滤和正式 release audit；真实 gray observation 必须等观察结束时间已经发生后才能关闭。

## 6.6 Gray Observation Timeline Ordering Gate

- 目标：确保 gray observation 单项脚本和总闸门要求 `GrayStartedAt <= ObservationStartedAt`。
- 成功标准：架构门先红灯；修复后灰度开始晚于观察开始负例、时间线有序合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：观察窗口必须发生在首次灰度之后，不能用灰度开始之后的时间戳反向覆盖已开始的观察窗口。
- 红灯：gray observation 单项和总审计缺时间线顺序 token。
- 修复：单项脚本和总审计都在解析观察时间后要求 `GrayStartedAt <= ObservationStartedAt`。
- 验证：灰度开始晚于观察开始样本在单项脚本和总审计中均 `EXPECTED_FAIL`；顺序正常且过去满 14 天样本均 `EXPECTED_PASS`；目标架构过滤 `2/2 passed`；两个 parser `parse ok`。
- 后续：补跑 gray/release gate 过滤和正式 release audit；真实 gray observation evidence 必须保持时间线自洽。

## 6.6 Gray Observation Anchored P0/P1 Counts Gate

- 目标：确保 gray observation 总闸门只接受独立 `P0/P1 incident counts: P0=0; P1=0` 计数字段。
- 成功标准：架构门先红灯；修复后 Notes spoof 负例、锚定计数字段合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：P0/P1=0 是灰度观察硬闸门，不能被报告正文的任意备注文本替代。
- 红灯：gray observation 总审计缺锚定 P0/P1 计数字段校验。
- 修复：总审计 gray predicate 使用 `Test-AnchoredLiteralLine $lines "P0/P1 incident counts: P0=0; P1=0"`。
- 验证：真实计数字段 `P0=1; P1=0` 但 Notes 含零事故文本时总审计 `EXPECTED_FAIL`；真实计数字段为 `P0=0; P1=0` 时合法样本 `EXPECTED_PASS`；目标架构门 `1/1 passed`；parser `parse ok`。
- 后续：补跑 gray/release gate 过滤和正式 release audit；真实 gray observation evidence 必须用独立计数字段记录 P0/P1=0。

## 6.6 Gray Observation GrayReleaseId Placeholder Gate

- 目标：确保 gray observation 单项脚本和总闸门拒绝占位 `GrayReleaseId`。
- 成功标准：架构门先红灯；修复后占位 GrayReleaseId 负例、真实 GrayReleaseId 合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：GrayReleaseId 是首次灰度证据锚点，不能用占位词替代。
- 红灯：gray observation 单项和总审计缺 GrayReleaseId 非占位校验。
- 修复：单项脚本和总审计都使用 `Test-RealEvidence()` 校验 GrayReleaseId。
- 验证：`GrayReleaseId=TBD` 时单项脚本和总审计均 `EXPECTED_FAIL`；`GrayReleaseId=gray-001` 时合法样本均 `EXPECTED_PASS`；目标架构过滤 `2/2 passed`；两个 parser `parse ok`。
- 后续：补跑 gray/release gate 过滤和正式 release audit；真实 gray observation evidence 必须使用具体灰度发布 ID。

## 6.6 Attack Chain Future VerifiedAt Gate

- 目标：确保 Attack Chain 单项脚本和总闸门拒绝未来 `VerifiedAt`。
- 成功标准：架构门先红灯；修复后未来 VerifiedAt 负例、过去 VerifiedAt 合法样本、PowerShell parser、相关架构过滤和正式 release audit 均有明确结果。
- 选片依据：Attack Chain A/B/C 人工验证是安全签字前置硬闸门，不能用未来时间戳提前关闭。
- 红灯：Attack Chain 单项和总审计缺未来 VerifiedAt 拒绝 token。
- 修复：单项脚本和总审计都在解析 `VerifiedAt` 后要求 `VerifiedAt <= UtcNow`。
- 验证：未来 `VerifiedAt` 时单项脚本和总审计均 `EXPECTED_FAIL`；过去 `VerifiedAt` 时合法样本均 `EXPECTED_PASS`；`AttackChain|ReleaseGateAudit` 过滤 `12/12 passed`；两个 parser `parse ok`。
- 后续：补跑正式 release audit；真实 Attack Chain evidence 必须使用已经发生的人工验证时间。

## Project Core Convention Boutique Existing Features

- 目标：把用户新增的“现有功能精品级”约束落到项目执行规则，避免后续用浅层新增功能稀释关键路径质量。
- 成功标准：根目录 `AGENTS.md` 明确写入该 Core Convention；当天五份 `_docs` 记录本次规则变更；不改业务代码。
- 执行：在 12 条规则前新增 Core Convention，要求现有功能优先做到精品级，新增/扩展功能前先补强正确性、UX、可靠性、可观测性和测试证据。
- 后续：A 轨继续覆盖率杠杆选片，但必须叠加“精品级现有功能”判断；B 轨发布阻断项继续单独 fail loud。

## 6.6 Release Gate Security Signoff Future SignedAt Gate

- 目标：确保 Security signoff 总闸门拒绝未来 `SignedAt`。
- 成功标准：架构门包含未来时间拒绝 token；动态样本证明未来 `SignedAt` 只卡 Security signoff，过去 `SignedAt` 可通过完整临时样本；再跑目标回归、parser 和正式 release audit。
- 选片依据：安全签字是 v1.0.0 人工硬闸门，签字时间必须已经发生，不能用未来时间压缩人工确认。
- 修复：`Test-SecuritySignoffEvidencePass()` 解析 `SignedAt` 后要求 `SignedAt <= UtcNow`。
- 后续：正式签字包仍需真实 signer、真实 evidence、Attack Chain A/B/C 人工验证和无阻断正文。

## 6.6 Release Gate Security Signoff Future SignedAt Violation Detail

- 目标：让未来 `SignedAt` 的失败原因在 release gate audit 报告中显式可见。
- 成功标准：架构门先红灯；修复后未来样本报告包含 `SignedAt must not be in the future.`，过去样本仍 PASS，目标回归/parser/正式审计均有明确结果。
- 选片依据：1 人 + AI 模型下，审计报告必须减少人工定位成本，不能只给泛化 FAIL。
- 修复：`Test-SecuritySignoffEvidencePass()` 在 `SignedAt` 晚于 `UtcNow` 时追加 `$futureSignedAtMessage` 到 violations。
- 后续：其它 security signoff 字段若仍只给泛化 FAIL，可按同样原则补具体 violation，但不得放宽 gate。
