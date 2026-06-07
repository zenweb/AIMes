# 2026-06-02 Sprint 6 Code Hygiene Review

## ScheduleFeedbackPanel Sync Note Status A11y

- 审计结论：本片改动范围小，生产代码只为 `.sync-note` 增加 `role="status"` / `aria-live="polite"`，与测试意图一致。
- 红绿证据：目标测试先红灯，失败点为同步提示缺少 `role`，报错 `expected undefined to be 'status'`；修复后 `schedule-board.test.ts` `4/4 passed`。
- 回归证据：相邻排产/反馈/映射/同步链路测试合计 `27/27 passed`；全量 `npm run test:unit` 为 `70 files / 255 tests passed`；coverage 为 `70 files / 255 tests passed`。
- 静态检查：`npm run lint` 通过。
- 覆盖率观察：总行/语句覆盖率 `78.05%`，`ScheduleBoard.vue` 行覆盖 `51.98%`，`ScheduleFeedbackPanel.vue` 行覆盖 `100%`。
- 风险判断：本片不触碰反馈提交、副作用 fallback、Agent 采纳分支和本地快照写入，回归风险集中在模板语义层，当前测试已覆盖目标行为。
- 未关闭项：本片不能替代 B 轨发布闸门；仍缺 hosted CI 远端 PASS、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察证据。

## AuditDecisionReplayPanel Approval Badge Status A11y

- 审计结论：本片改动范围小，只为 `.approval-badge` 增加 `role="status"` / `aria-live="polite"`，测试直接约束异步审批数量提示的可访问语义。
- 红绿证据：目标测试先红灯，失败点为审批 badge 缺少 `role`，报错 `expected undefined to be 'status'`；修复后 `audit-decision-replay-panel.test.ts` `3/3 passed`。
- 相邻证据：`audit-log-board.test.ts` + `assistant-action-audit.test.ts` 合计 `7/7 passed`。
- 静态检查：`npm run lint` 通过。
- 风险判断：不触碰异步加载、审批状态筛选、回放条目映射或 RouterLink 逻辑；回归风险集中在模板属性。
- 验证边界：本轮未重跑 full unit / coverage；不能扩大解释为全量前端验证或发布闸门完成。

## B 轨 Release Gate Evidence Refresh

- 审计结论：四个发布证据脚本均已在 2026-06-02 重新执行并生成报告；结果均为 fail-loud，不构成发布通过证据。
- Hosted CI 报告：`_docs/_reports/hosted-ci-20260602.md` 为 `Status: MISSING_REMOTE_RUN` / `Result: FAIL`，缺远端 runner `RunUrl` / `RunId`。
- Staging 报告：`_docs/_reports/staging-rehearsal-20260602-local.md` 为 `Result: FAIL`，失败于 `docker` 命令不可用，未进入真实 PostgreSQL/staging rehearsal。
- Attack Chain 报告：`_docs/_reports/attack-chain-verification-20260602.md` 为 `Status: PENDING_MANUAL_VERIFICATION` / `Result: FAIL`，缺人工 verifier、时间戳和 A/B/C 证据。
- Gray observation 报告：`_docs/_reports/gray-observation-20260602.md` 为 `Status: NOT_STARTED` / `Result: FAIL`，首次灰度未开始。
- 验证边界：这些报告证明 B 轨仍阻塞，不能证明发布完成；安全签字仍不能从 `UNSIGNED` 推进为 signed。

## B 轨 Release Gate Aggregate Audit

- 审计结论：新增聚合脚本和总报告后，v1.0.0 B 轨硬闸门可从单一入口审计，不再需要人工拼读多个 fail-loud 报告。
- 红绿证据：架构门先失败于缺少 `scripts/run-release-gate-audit.ps1`；补脚本和 `_docs/_reports/release-gate-audit-20260602.md` 后，目标架构门 `1/1 passed`。
- 总报告结论：`_docs/_reports/release-gate-audit-20260602.md` 汇总 Hosted CI、PostgreSQL/staging、Attack Chain A/B/C、Security signoff、Gray observation 五项，全部为 `FAIL`。
- 脚本行为：`scripts/run-release-gate-audit.ps1` 在任一闸门未 PASS/SIGNED 时返回非 0，防止误把总审计包当作发布通过证明。
- 验证边界：该脚本只聚合现有证据，不替代远端 CI、真实 staging、人工安全验证、签字或 14 天观察窗口。

## B 轨 Security Signoff Packet Refresh

- 审计结论：2026-06-02 已有当天安全签字包，状态明确为 `UNSIGNED`，并被聚合发布闸门报告引用。
- 红绿证据：调整架构门后先失败于缺 `_docs/_review/20260602-security-signoff.md` 和聚合脚本未引用 `20260602-security-signoff`；修复后两个目标架构门 `2/2 passed`。
- 签字包状态：`_docs/_review/20260602-security-signoff.md` 保持 `Status: UNSIGNED` / `Decision: UNSIGNED`，未伪造 signer 或 signed timestamp。
- 聚合状态：`_docs/_reports/release-gate-audit-20260602.md` 的 Security signoff 行已指向 `_docs/_review/20260602-security-signoff.md`，总结果仍为 `Result: FAIL`。
- 验证边界：自动自评 PASS 不能替代 Attack Chain A/B/C 人工验证和 human signer。

## B 轨 Release Gate Evidence Packet Presence

- 审计结论：聚合发布闸门报告现在区分“证据包存在性”和“闸门通过状态”，避免路径占位被误读为证据已落盘。
- 红绿证据：架构门先失败于缺 `Evidence packet status`；补脚本和重生报告后，目标架构门 `1/1 passed`。
- 报告状态：`_docs/_reports/release-gate-audit-20260602.md` 中五个 evidence packet status 均为 `FOUND`，但五个 Gate Status 仍为 `FAIL`。
- 验证边界：`FOUND` 只代表证据包文件存在，不代表其内容满足发布闸门；发布完成仍要求每个闸门真实 `PASS` / `SIGNED`。

## B 轨 Security Self-Assessment 20260602 Refresh

- 审计结论：2026-06-02 自动安全自评已从首次 `npm audit` FAIL 推进到 `Result: PASS`，并更新到当天安全签字包。
- 红灯证据：首轮 `_docs/_reports/security-self-assessment-20260602-local.md` 失败于 `npm audit failed with exit code 1`，npm 报告包含 `5 vulnerabilities (3 moderate, 2 critical)`。
- 修复证据：`vite` 升级到 `^6.4.2`；`vitest` / `@vitest/coverage-v8` 升级到 `^4.1.7`；`npm ls vite vitest @vitest/coverage-v8 vite-node esbuild` 显示 direct `vite@6.4.2`、`vitest@4.1.7`、coverage `4.1.7`。
- 验证证据：`npm audit --audit-level=high --registry=https://registry.npmjs.org/` 为 `found 0 vulnerabilities`；`npm run test:unit -- tests/unit/auth-token.test.ts` `2/2 passed`；`npm run lint` 通过；目标架构门 `2/2 passed`。
- 自评证据：最终 `_docs/_reports/security-self-assessment-20260602-local.md` 为 `Result: PASS`，记录 Unit security `50/50`、Integration security `18/18`、Architecture security gates `10/10`。
- 验证边界：本轮未跑 full unit / coverage / build；自动自评 PASS 仍不能替代 Attack Chain A/B/C 人工验证和签字。

## AuditDecisionReplayPanel POC Signoff Replay Evidence Link

- 审计结论：本片把 POC 签署回放从“只显示签字详情”推进到“可跳回报表中心证据入口”，更贴近审计/签字链路；实现只增加该回放条目的 route，不改签字数据来源或其他映射分支。
- 红绿证据：新增用例先红灯，POC 签署详情存在但 `.trace-link` 缺失；补 `/report` route 后目标审计组合 `11/11 passed`。
- Vitest 4 证据：coverage 首次复跑暴露 3 个非本片红点；修复测试夹具后，`scanner-board.test.ts` + `offline-demo-mode.test.ts` + `notifications.store.test.ts` 合计 `9/9 passed`。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`70 files / 256 tests passed`，总行覆盖 `55.31%`，`AuditDecisionReplayPanel.vue` 行覆盖 `62.06%`。
- 风险判断：`BASE_URL` 只在测试中显式设定，保持与 Nuxt `app.baseURL` / Vitest `base` 一致；`Html5Qrcode` 与 `Notification` mock 改为 function 构造器，适配 Vitest 4 的 `new` 行为。
- 验证边界：本片没有跑前端 build，也没有关闭 B 轨发布闸门；自动安全自评 PASS 与 A 轨覆盖率绿灯仍不能替代 human signoff、真实 staging 或 14 天观察窗口。

## GanttChart Lightweight Marker A11y

- 审计结论：本片把 `GanttChart.vue` 从 0 覆盖打开，并只补轻量甘特 marker 的可访问列表语义，未触碰 dhtmlx 运行态甘特逻辑。
- 红绿证据：新增 `gantt-chart.test.ts` 先失败于 `.gantt-e2e-markers` 缺 `role=list`；修复后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` + `gantt-mapper.test.ts` 合计 `12/12 passed`，覆盖父组件排产入口和数据映射相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`71 files / 257 tests passed`，总行覆盖 `55.65%`，`GanttChart.vue` 行覆盖 `17.85%`。
- 风险判断：轻量模式由 `VITE_SHOW_DEMO_HINTS=true` 或 offline demo 触发；新增属性不会改变真实 dhtmlx 初始化、拖拽事件或锁定期渲染。
- 验证边界：本片不证明真实浏览器中的 dhtmlx 拖拽交互完整可用；后续若要覆盖拖拽冲突，应单独 mock gantt event callbacks 或用浏览器测试。

## ChatPanel Modal Dialog A11y

- 审计结论：本片为 AI 生产助手面板补齐 modal dialog 语义和输入框可访问名称，改动集中在模板属性，未改业务分支。
- 红绿证据：新增 `chat-panel.test.ts` 先红灯，失败点为 `.chat-panel` 缺 `role`，报错 `expected undefined to be 'dialog'`；修复后目标测试 `1/1 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖右下角助手入口所在布局的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`72 files / 258 tests passed`，总行覆盖 `55.92%`，`ChatPanel.vue` 行覆盖 `7.69%`。
- 风险判断：新增 `role`、`aria-modal`、`aria-labelledby` 和 `aria-label` 不改变点击关闭、历史加载、发送消息、动作执行或本地证据同步；主要风险是测试 mock 较多，后续业务分支仍应按用户路径拆小片补测。
- 验证边界：本片不证明 AI 生产助手所有动作包、导出、跳转和知识引用分支完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ScheduleAgentWorkbenchPanel Action Status A11y

- 审计结论：本片打开 AI 排产工作台的首个专门组件测试，并将后端建议动作结果暴露为可访问状态更新；生产代码只新增模板语义属性。
- 红绿证据：新增 `schedule-agent-workbench-panel.test.ts` 先红灯，失败点为 `.agent-action-note` 缺 `role`，报错 `expected undefined to be 'status'`；修复后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖该工作台所在排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`73 files / 259 tests passed`，总行覆盖 `56.55%`，`ScheduleAgentWorkbenchPanel.vue` 行覆盖 `81.17%`。
- 风险判断：测试 mock 后端排产 Agent API，只约束点击生成建议后的状态反馈；新增属性不会改变 busy 状态、API payload、推荐方案映射、采纳/拒绝分支或执行追踪。
- 验证边界：本片不证明真实后端 Agent 决策 API、权限校验和审计落库完整可用；B 轨发布闸门仍需外部/人工证据。

## QualityCapaTaskPanel Open Count Status A11y

- 审计结论：本片打开质量 CAPA 面板首个专门组件测试，并为待验证 CAPA 数量补齐状态播报语义；生产代码只新增模板属性。
- 红绿证据：新增 `quality-capa-task-panel.test.ts` 先红灯，失败点为 `.status-badge` 缺 `role`，报错 `expected undefined to be 'status'`；修复后目标测试 `1/1 passed`。
- 相邻证据：`quality-board.test.ts` + `quality-capa-sync.test.ts` 合计 `5/5 passed`，覆盖质量页入口和 CAPA 持久化/OTD 镜像相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`74 files / 260 tests passed`，总行覆盖 `56.87%`，`QualityCapaTaskPanel.vue` 行覆盖 `45.00%`。
- 风险判断：测试 mock 后台知识复用和助手执行包读取为空，只约束默认 CAPA 待验证队列状态；新增属性不会改变任务推进、闭环写入、低分复核或推荐采纳分支。
- 验证边界：本片不证明全部 CAPA 交互、知识复用排序、灰度治理和助手执行包质量责任闭环完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ParetoCompare Modal Dialog A11y

- 审计结论：本片打开多目标方案对比浮层的首个专门组件测试，并补齐 modal dialog 语义；生产代码只新增模板属性。
- 红绿证据：新增 `pareto-compare.test.ts` 先红灯，失败点为 `.compare-container` 缺 `role`，报错 `expected undefined to be 'dialog'`；修复后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖该浮层所在排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`75 files / 261 tests passed`，总行覆盖 `57.07%`，`ParetoCompare.vue` 行覆盖 `21.73%`。
- 风险判断：测试 mock 批量优化 API、设备瓶颈和甘特数据映射，只约束浮层可访问入口；新增属性不会改变优化请求、demo fallback、雷达图/KPI 表格或方案采用事件。
- 验证边界：本片不证明多目标优化数据、图表归一化、方案采用和甘特渲染完整可用；这些仍需后续独立切片。B 轨发布闸门仍需真实外部/人工证据。

## EquipmentScheduleImpactPanel Downtime Sync Status A11y

- 审计结论：本片打开设备停机排产影响面板的首个专门组件测试，并将故障同步结果暴露为可访问状态更新；生产代码只新增模板属性。
- 红绿证据：新增 `equipment-schedule-impact-panel.test.ts` 先红灯，失败点为 `.sync-note` 缺 `role`，报错 `expected undefined to be 'status'`；修复后目标测试 `1/1 passed`。
- 相邻证据：`equipment-board.test.ts` + `equipment-risk-sync.test.ts` 合计 `10/10 passed`，覆盖设备页入口和设备风险同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`76 files / 262 tests passed`，总行覆盖 `57.24%`，`EquipmentScheduleImpactPanel.vue` 行覆盖 `64.86%`。
- 风险判断：测试 mock 后台读取为空，只约束点击故障同步后的状态反馈和本地/OTD 写入调用；新增属性不会改变设备停机记录、客户故障样例或异常分流维护单逻辑。
- 验证边界：本片不证明真实设备联网数据、后台同步、异常分流维护单和 POC 故障样例全链路完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Message Log A11y

- 审计结论：本片把 AI 生产助手消息列表暴露为可访问消息日志，补齐对话更新的读屏语义；生产代码只新增模板属性。
- 红绿证据：新增 `chat-panel.test.ts` 用例先红灯，失败点为 `.chat-messages` 缺 `role`，报错 `expected undefined to be 'log'`；修复后目标测试 `2/2 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖右下角助手入口所在布局的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`76 files / 263 tests passed`，总行覆盖 `57.24%`，`ChatPanel.vue` 行覆盖 `7.69%`。
- 风险判断：新增 `role="log"`、`aria-live="polite"` 和 `aria-label` 不改变消息加载、发送、LLM fallback、动作包或路由跳转；本片覆盖率增量为 `0.00` 个点，应作为语义质量收口记录，不应继续长期精修同一低覆盖模板属性。
- 验证边界：本片不证明 AI 生产助手真实发送、权限拒绝、报表导出、异常处置卡生成或知识引用分支完整可用；B 轨发布闸门仍需 hosted CI、真实 staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## FeedbackForm Submission Failure Alert A11y

- 审计结论：本片打开排产采纳反馈浮层的专门测试，并覆盖提交失败的真实业务回路；生产代码只补错误提示语义并使用既有错误归一化工具。
- 红绿证据：新增 `feedback-form.test.ts` 先红灯。修正 Teleport 测试夹具后，错误文案已出现但缺 `[role="alert"]`；补语义后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖该反馈浮层所在 AI 排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 264 tests passed`，总行覆盖 `57.49%`，`FeedbackForm.vue` 行覆盖 `85.71%`。
- 风险判断：测试 mock `submitAdoptionFeedback` 失败，只约束错误反馈和请求 payload 所在路径；新增 `role="alert"` / `aria-live` 不改变成功提交、按钮禁用、关闭弹窗或父组件状态。
- 验证边界：本片不证明真实后端采纳反馈落库、审计留痕、Agent 决策联动或权限策略完整可用；B 轨发布闸门仍需真实外部/人工证据。

## DocumentUpload Customer Import Status A11y

- 审计结论：本片覆盖客户真实工单导入样例生成路径，并将导入批次/订单数/高风险识别结果暴露为可访问状态更新。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `.import-metrics` 缺 `role`，报错 `expected undefined to be 'status'`；补语义后目标测试 `3/3 passed`。
- 相邻证据：`knowledge-governance-panel.test.ts` `2/2 passed`，覆盖同页知识治理面板相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 265 tests passed`，总行覆盖 `57.53%`，`DocumentUpload.vue` 行覆盖 `34.48%`。
- 风险判断：测试 mock 客户导入证据写入，只约束点击生成后的 UI 状态、历史记录和导入证据显示；新增 `role="status"` / `aria-live` 不改变本地/后台证据写入或治理文档插入。
- 验证边界：本片不证明真实 ERP 文件解析、后台 POC 证据落库、字段映射完整性或验收签字链路完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ParetoCompare Demo Fallback Recommendation A11y

- 审计结论：本片覆盖多目标方案对比的后端失败 demo fallback，并验证推荐方案可被采用；生产代码只补推荐卡片状态播报语义。
- 红绿证据：扩展 `pareto-compare.test.ts` 后先红灯，失败点为 `.recommend-card` 缺 `role`，报错 `expected undefined to be 'status'`；补语义后目标测试 `2/2 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖多目标对比所在 AI 排产主页面相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 266 tests passed`，总行覆盖 `58.79%`，`ParetoCompare.vue` 行覆盖 `90.06%`。
- 风险判断：测试 mock `batchOptimize` 失败，只约束 demo fallback、推荐方案播报和 `apply` 事件 payload；新增属性不改变优化请求、fallback 数据、图表计算或甘特转换。
- 验证边界：本片不证明真实后端批量优化、设备瓶颈读取、图表视觉正确性或真实甘特交互完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Send Path Source Disclosure A11y

- 审计结论：本片覆盖 AI 生产助手真实发送路径，从用户输入到 `queryKnowledge` payload、助手回答和参考来源展示；生产代码只把来源展开控件改为可聚焦按钮。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为 `Unable to get button.sources-toggle`；现有 UI 渲染的是 `span.sources-toggle`，不具备原生键盘按钮语义。修复后目标测试 `3/3 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖右下角助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 267 tests passed`，总行覆盖 `59.99%`，`ChatPanel.vue` 行覆盖 `28.20%`。
- 风险判断：测试 mock 知识问答 API 成功返回，只约束发送 payload、回答渲染、来源数量和展开内容；新增 `button` / `aria-expanded` 不改变请求、fallback、动作包生成或证据同步。
- 验证边界：本片不证明权限拒绝、报表导出、异常处置卡生成、引用治理和全部助手动作分支完整可用；B 轨发布闸门仍需 hosted CI、真实 staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## GanttChart Drag Conflict Coverage

- 审计结论：本片覆盖真实 dhtmlx 甘特拖拽结束冲突检测路径，确认同设备重叠会发出冲突事件、错误提示和拖拽结束事件；生产代码未改动。
- 红绿证据：新增测试初始失败来自测试夹具无法进入真实 dhtmlx 分支，报 `localStorage.clear/getItem is not a function`；修正为 mock `isOfflineDemoMode=false` 后，目标测试 `2/2 passed`，业务断言直接通过。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖甘特图所在 AI 排产主页面相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 268 tests passed`，总行覆盖 `60.67%`，`GanttChart.vue` 行覆盖 `51.19%`。
- 风险判断：测试直接调用 dhtmlx `attachEvent` 捕获的 `onAfterTaskDrag` handler，覆盖冲突判定和事件输出；它不验证浏览器真实拖拽像素交互，也不改变生产拖拽逻辑。
- 验证边界：本片不证明 dhtmlx 真实 DOM 拖拽、scale 切换、锁定期边界和甘特视觉渲染完整可用；B 轨发布闸门仍需真实外部/人工证据。

## DocumentUpload Successful Upload Coverage

- 审计结论：本片覆盖知识文档成功上传路径，确认待上传 PDF 会调用知识库上传 API、队列状态变为已上传，并把后端索引结果插入上传记录；生产代码未改动。
- 红绿证据：新增成功上传用例后目标测试直接 `4/4 passed`，说明现有 `startUpload` 逻辑已满足该路径；本片主要消除关键业务路径缺少自动化证据的问题。
- 相邻证据：`knowledge-governance-panel.test.ts` `2/2 passed`，覆盖成功上传后同页治理面板相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 269 tests passed`，总行覆盖 `60.94%`，`DocumentUpload.vue` 行覆盖 `47.70%`。
- 风险判断：测试 mock `uploadDocument` 成功返回，只约束 UI 队列、API payload 和历史记录；不验证真实网络、文件 multipart 体、后端分块索引或治理持久化。
- 验证边界：本片不证明真实后端上传、RAG 分块质量、文档治理签字和客户工单导入全链路完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ProductionBoard Scan API Success Selection

- 审计结论：本片修复生产执行扫码 API 成功后未选中工单的问题，让后端返回的工序真正出现在右侧详情区，并通过状态通知播报定位结果。
- 红绿证据：新增 `production-board.test.ts` 用例先红灯，失败点为 `Unable to get .detail-title-row h3`；DOM 仍显示 `选择工单或扫码开始`。修复后目标测试 `4/4 passed`。
- 相邻证据：`barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`，覆盖扫码证据与生产异常联动相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 270 tests passed`，本轮总行覆盖 `60.92%`，`ProductionBoard.vue` 行覆盖 `40.63%`。
- 风险判断：新增逻辑只在后端扫码成功时匹配本地工单并设置 `selectedWo`；如果当前页没有该工单，仍保留现有只显示当前工序的行为，不额外拉取或改分页。
- 验证边界：本片不证明真实扫码枪、后端扫码接口、开工/完工写入、资质拦截和条码证据链全链路完整可用；B 轨发布闸门仍需真实外部/人工证据。

## PurchaseBoard Confirm Status Sync

- 审计结论：本片修复采购单确认成功后详情与左侧列表状态不一致的问题，让采购确认主路径在后端列表短暂返回旧快照时仍保持当前界面一致。
- 红绿证据：新增 `purchase-board.test.ts` 用例先红灯，失败点为 `expected '已提交' to be '已确认'`；右侧详情已更新为 `已确认`，左侧活动订单仍是旧状态。修复后目标测试 `3/3 passed`。
- 相邻证据：相邻采购短缺同步测试实际运行 `shortage-risk-sync.test.ts` `9/9 passed`，覆盖采购短缺风险本地同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`77 files / 271 tests passed`，总行覆盖 `61.09%`，`PurchaseBoard.vue` 行覆盖 `48.84%`。
- 风险判断：新增逻辑只在 `handleConfirm()` 完成后，用本次确认返回的详情覆盖当前页同一订单摘要；不额外拉取、不改分页，也不影响提交、收货或取消路径。
- 验证边界：本片不证明真实采购后端最终一致性、ERP 同步、收货入库或供应网络治理全链路完整可用；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## GanttToolbar Explicit Action Buttons

- 审计结论：本片打开 `GanttToolbar.vue` 专门单测，并修复工具栏操作按钮缺少显式非提交类型的问题，避免排产工具栏在表单上下文中触发默认提交。
- 红绿证据：新增 `gantt-toolbar.test.ts` 后先红灯，失败点为 `expected undefined to be 'button'`；补齐五个按钮的 `type="button"` 后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖工具栏所在排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`78 files / 272 tests passed`，总行覆盖 `61.17%`，`GanttToolbar.vue` 行覆盖 `100%`。
- 风险判断：本片只改变按钮默认类型，不改变 `optimize`、`refresh`、`feedback`、`compare`、`export-csv`、`update:objective`、`update:scale` 事件契约。
- 验证边界：本片不证明真实排产优化、CSV 下载、反馈弹窗、多目标对比或甘特渲染完整可用；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## ScheduleMetrics KPI Status A11y

- 审计结论：本片打开 `ScheduleMetrics.vue` 专门单测，并把排产 KPI 条暴露为礼貌状态更新，覆盖首屏设备利用率、准交率、换线时间和批次组数展示。
- 红绿证据：新增 `schedule-metrics.test.ts` 后先红灯，失败点为 `expected undefined to be 'status'`；补齐状态语义后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖 KPI 所在排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`79 files / 273 tests passed`，总行覆盖 `61.25%`，`ScheduleMetrics.vue` 行覆盖 `87.50%`。
- 风险判断：本片只新增 `role="status"`、`aria-live="polite"` 和 `aria-label`；不改变阈值颜色、数值格式、主页面指标计算或数据加载。
- 验证边界：本片不证明真实后端排产指标准确性、A/B 报告、甘特渲染或优化结果完整可用；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## ScheduleRecoveryHandoffPanel Status Coverage

- 审计结论：本片打开交期恢复执行包交接面板的专门测试，并让跨模块执行包出现时作为礼貌状态更新暴露。
- 红绿证据：新增 `schedule-recovery-handoff-panel.test.ts` 后先红灯，失败点为 `expected undefined to be 'status'`；补齐状态语义后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖该面板所在排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`80 files / 274 tests passed`，总行覆盖 `61.34%`，`ScheduleRecoveryHandoffPanel.vue` 行覆盖 `100%`。
- 风险判断：本片只新增状态播报语义，并测试既有 `close-handoff` payload；不改变执行包选择、闭环条件、父组件闭环函数或证据链写入。
- 验证边界：本片不证明真实交期恢复执行包生成、采购/质量责任动作闭环、OTD 证据链持久化或审计回放完整可用；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## ScheduleEventQueuePanel Agent Suggestion Status

- 审计结论：本片打开事件触发 Agent 队列的专门测试，并让当前 Agent 建议区域作为礼貌状态更新暴露。
- 红绿证据：新增 `schedule-event-queue-panel.test.ts` 后先红灯，失败点为 `expected undefined to be 'status'`；补齐状态语义后目标测试 `1/1 passed`。
- 相邻证据：`schedule-board.test.ts` `4/4 passed`，覆盖该队列所在排产主页面的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 275 tests passed`，总行覆盖 `61.41%`，`ScheduleEventQueuePanel.vue` 行覆盖 `100%`。
- 风险判断：本片只新增当前建议区域的状态播报语义，并测试 `generate` / `adopt` payload；不改变事件队列、推荐方案、采纳按钮或父组件流程。
- 验证边界：本片不证明真实 Agent 建议生成、调度员采纳后端写入、OTD 证据链或模型复盘完整可用；B 轨发布闸门仍需真实 hosted CI、PostgreSQL/staging、人工 Attack Chain、安全签字、灰度和 14 天观察证据。

## KnowledgeGovernancePanel Risk Badge Status A11y

- 审计结论：本片只为知识治理风险数量 badge 补齐礼貌状态播报语义，改动集中在模板属性，未触碰知识治理业务流。
- 红绿证据：新增/扩展 `knowledge-governance-panel.test.ts` 后先红灯，失败点为 `.risk-badge` 缺少 `role`，报错 `expected undefined to be 'status'`；修复后目标测试 `2/2 passed`。
- 相邻证据：`document-upload.test.ts` `4/4 passed`，覆盖同页文档上传入口的相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 275 tests passed`，fresh 总行覆盖 `61.40%`，`KnowledgeGovernancePanel.vue` 行覆盖 `36.63%`、函数覆盖 `29.82%`。
- 风险判断：新增 `role="status"`、`aria-live="polite"` 和 `aria-label="知识库过期风险数量"` 不改变文档评审、质量资产生命周期、引用追溯、训练灰度或证据同步。
- 验证边界：本片覆盖率没有有意义增量，不能作为继续精修同一 badge/模板属性的理由；下一片应回到低覆盖且用户必经的真实业务分支。B 轨发布闸门仍需真实外部/人工证据。

## DocumentUpload Upload Failure Alert A11y

- 审计结论：本片覆盖知识文档上传失败路径，并把队列行错误暴露为 assertive alert；生产代码只新增模板语义属性。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `.status-err` 缺少 `role`，报错 `expected undefined to be 'alert'`；修复后目标测试 `5/5 passed`。
- 相邻证据：`knowledge-governance-panel.test.ts` `2/2 passed`，覆盖同页知识治理面板相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 276 tests passed`，总行覆盖 `61.44%`，`DocumentUpload.vue` 行覆盖 `49.42%`。
- 风险判断：新增 `role="alert"` 和 `aria-live="assertive"` 不改变 `uploadDocument` 调用、错误归一化、队列状态、成功历史记录或治理文档插入；回归风险集中在模板属性。
- 验证边界：本片不证明真实后端上传、分块索引服务恢复、multipart 体或 RAG 治理签字完整可用；B 轨发布闸门审计仍返回 FAIL。

## ProductionBoard Start API Failure Guard

- 审计结论：本片修复开工 API 失败后仍乐观推进本地生产状态的问题，避免现场操作员误以为设备占用失败的工序已经开工。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 `expected '生产中' to be '待生产'`；修复后目标测试 `5/5 passed`。
- 相邻证据：`barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`，覆盖扫码证据和生产异常联动相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 277 tests passed`，总行覆盖 `61.68%`，`ProductionBoard.vue` 行覆盖 `44.84%`。
- 风险判断：新增失败早返回只影响 `startOperation` 抛错场景；开工成功仍按原路径更新工序/工单、写入替班/扫码/排产回写追踪。
- 验证边界：本片不证明真实设备占用 API、扫码枪、完工质量门、异常处置和条码证据链全链路完整可用；B 轨发布闸门审计仍返回 FAIL。

## ProductionBoard Completion API Failure Guard

- 审计结论：本片修复完工 API 失败后仍乐观推进本地完工、质量联动和 OTD 证据链的问题，避免现场完工失败被误报为已完成。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 `expected '已完成' to be '生产中'`；修复后目标测试 `6/6 passed`。
- 相邻证据：`barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`，覆盖扫码完工证据和生产异常相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 278 tests passed`，总行覆盖 `61.94%`，`ProductionBoard.vue` 行覆盖 `49.40%`。
- 风险判断：新增失败早返回只影响 `completeOperation` 抛错场景；完工成功仍按原路径更新工序/工单、写入质量门、生产复核和 OTD 证据。
- 验证边界：本片不证明真实完工 API、质检系统同步、条码完工、质量 CAPA 或 OTD 持久化完整可用；B 轨发布闸门审计仍返回 FAIL。

## ProductionBoard Exception API Failure Guard

- 审计结论：本片修复异常上报 API 失败前就写本地异常/OTD 证据的问题，避免后端未接收的异常被本地误报为已进入处置队列。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 `writeProductionAnomalyEvent` 已被调用；修复后目标测试 `7/7 passed`。
- 相邻证据：`barcode-scan-evidence-sync.test.ts` + `production-anomaly-sync.test.ts` 合计 `12/12 passed`，覆盖扫码异常证据和生产异常同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 279 tests passed`，总行覆盖 `62.16%`，`ProductionBoard.vue` 行覆盖 `53.34%`。
- 风险判断：新增失败早返回只影响 `reportException` 抛错场景；异常上报成功后仍按原路径写生产异常事件、风险追踪和 OTD 证据链。
- 验证边界：本片不证明真实异常管理服务、扫码异常、风险队列或 OTD 持久化完整可用；B 轨发布闸门审计仍返回 FAIL。

## PurchaseBoard Cancellation API Failure Guard

- 审计结论：本片修复采购取消 API 失败后仍乐观置为已取消的问题，避免采购员在供应商已发运/后端拒绝取消时看到错误状态。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为 `expected '已取消' to be '已确认'`；修复后目标测试 `4/4 passed`。
- 相邻证据：`shortage-risk-sync.test.ts` `9/9 passed`，覆盖采购短缺风险同步工具相邻风险；`schedule-board.test.ts` `4/4 passed`，验证 coverage teardown 修复没有破坏排产主页面单测。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 280 tests passed`，总行覆盖 `62.20%`，`PurchaseBoard.vue` 行覆盖 `50.37%`。
- 风险判断：新增失败早返回只影响 `cancelPurchaseOrder` 抛错场景；取消成功仍按原路径置为 `Cancelled` 并刷新列表。`schedule-board.test.ts` 的 `GanttChart.vue` mock 只隔离异步 CSS/dhtmlx 加载，不改变生产代码。
- 验证边界：本片不证明真实供应商发运状态、ERP 取消事务、收货入库或供应网络治理全链路完整可用；B 轨发布闸门审计仍返回 FAIL。

## ChatPanel Restricted Action Refusal Alert

- 审计结论：本片覆盖 AI 助手动作权限拒绝路径，确认 Planner 用户无法执行 Admin-only 交期恢复执行包，且拒绝结果可被辅助技术立即感知。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为拒绝消息缺 `.message.assistant[role="alert"]`；修复后目标测试 `4/4 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 281 tests passed`，总行覆盖 `62.40%`，`ChatPanel.vue` 行覆盖 `31.55%`。
- 风险判断：新增 `liveRole` 是 `ChatMessage` 的可选字段，只在权限拒绝分支传入；正常助手消息、来源展开、动作按钮、包生成和路由跳转不受影响。
- 验证边界：本片不证明真实后端权限、服务端动作授权、所有动作类型或报表导出完整可用；B 轨发布闸门审计仍返回 FAIL。

## ChatPanel OTD Report Export Status

- 审计结论：本片覆盖 AI 助手导出 OTD/POC 复盘报告动作，确认 CSV 生成、下载触发、Blob URL 回收、报表中心跳转和成功审计均发生，并将完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为导出完成消息缺 `.message.assistant[role="status"]`；修复后目标测试 `5/5 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 282 tests passed`，总行覆盖 `62.71%`，`ChatPanel.vue` 行覆盖 `36.88%`。
- 风险判断：测试 stub `URL.createObjectURL` / `URL.revokeObjectURL` 和 anchor click，覆盖真实 `exportActionReport()` 副作用；新增 `status` live role 只用于普通动作完成消息，不扩大到包生成分支。
- 验证边界：本片不证明真实浏览器下载文件内容被用户保存、报表中心数据正确或服务端导出链路完整可用；B 轨发布闸门审计仍返回 FAIL。

## DocumentUpload Oversized File Rejection Coverage

- 审计结论：本片补齐知识文档超大文件拒绝路径的单测，确认超过 50MB 的受支持文件不会进入上传队列，也不会触发上传 API。
- 红绿证据：新增 `document-upload.test.ts` 用例后直接通过，说明生产代码已有正确校验与 alert 播报；按 TDD 例外记录为 coverage-only GREEN/no production change，不伪造失败。
- 相邻证据：`knowledge-governance-panel.test.ts` `2/2 passed`，覆盖同页知识治理面板相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 283 tests passed`，总行覆盖 `62.73%`，`DocumentUpload.vue` 行覆盖 `50.57%`。
- 风险判断：测试只新增对 `File.size > 50MB` 的断言，不改变生产阈值、队列状态机、上传按钮禁用逻辑或 API 调用契约。
- 验证边界：本片不证明真实浏览器/反向代理上传体积限制、后端 multipart 限流、分块索引或知识治理签字完整可用；B 轨发布闸门仍需真实外部/人工证据。

## PurchaseBoard Receive API Failure Guard

- 审计结论：本片修复采购收货 API 失败后静默关闭弹窗的问题，避免采购员在后端拒绝收货时误以为收货流程已经结束。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为收货失败后 `.modal-content` 不存在；修复后目标测试 `5/5 passed`。
- 相邻证据：`shortage-risk-sync.test.ts` `9/9 passed`，覆盖采购短缺风险同步工具相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 284 tests passed`，总行覆盖 `62.81%`，`PurchaseBoard.vue` 行覆盖 `53.18%`。
- 风险判断：新增失败早返回只影响 `receivePurchaseOrder` 抛错场景；收货成功仍会关闭弹窗并刷新列表，加急收货和替代供应商到货路径不受影响。
- 验证边界：本片不证明真实仓储入库、ERP 收货事务、库存锁定或供应网络治理全链路完整可用；B 轨发布闸门仍需真实外部/人工证据。

## QualityCapaTaskPanel Verified Closure Status

- 审计结论：本片覆盖 CAPA 执行中任务推进到已验证的真实分支，并把审计/OTD 同步完成消息暴露为礼貌状态更新。
- 红绿证据：扩展 `quality-capa-task-panel.test.ts` 后先红灯，失败点为 `.closure-sync-message` 缺少 `role="status"`；修复后目标测试 `2/2 passed`。
- 相邻证据：`quality-capa-sync.test.ts` `4/4 passed`，覆盖 CAPA 闭环写入工具相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 285 tests passed`，总行覆盖 `62.90%`，`QualityCapaTaskPanel.vue` 行覆盖 `53.00%`。
- 风险判断：新增属性只影响 `latestClosureMessage` 的可访问播报；`writeQualityCapaClosure` payload、任务状态推进和记录插入逻辑由测试锁定，没有改动。
- 验证边界：本片不证明真实质量后端、报表中心 OTD 复盘、审计回放持久化或人工 CAPA 签字完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Knowledge Query Failure Fallback Alert

- 审计结论：本片修复知识问答后端失败被演示回答静默掩盖的问题，让 RAG/LLM 查询不可用时以 assertive alert 明示降级。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="alert"]`；修复后目标测试 `6/6 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 286 tests passed`，总行覆盖 `63.27%`，`ChatPanel.vue` 行覆盖 `43.19%`。
- 风险判断：新增 `errorMessage` import 和 catch 分支文案只影响 `queryKnowledge` 抛错场景；正常问答、来源 disclosure、动作权限审计和报表导出路径由既有测试覆盖。
- 验证边界：本片不证明真实 RAG 服务恢复、后端知识库准确性、模型质量或服务端告警完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Anomaly Package Status

- 审计结论：本片覆盖 Admin 成功创建异常处置卡动作，确认写包、跳转、成功审计和动作包展示都发生，并把完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="status"]`；修复后目标测试 `7/7 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 287 tests passed`，fresh 总行覆盖 `63.29%`，`ChatPanel.vue` 行覆盖 `44.77%`。
- 风险判断：新增 `status` live role 只用于 `create_anomaly_card` 成功消息；测试锁定 `writeAssistantAnomalyDispositionPackage({ actor, role })`、`router.push('/anomaly')` 和 `recordAssistantActionAudit(permitted: true)`。
- 验证边界：本片不证明真实异常中心后端、风险队列、AI 排产复核或 OTD 证据链持久化完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Engineering Constraint Package Status

- 审计结论：本片覆盖 Admin 成功生成工程约束复核包动作，确认写包、跳转、成功审计和动作包展示都发生，并把完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="status"]`；修复后目标测试 `8/8 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 288 tests passed`，总行覆盖 `63.46%`，`ChatPanel.vue` 行覆盖 `46.54%`。
- 风险判断：新增 `status` live role 只用于 `engineering_constraint_package` 成功消息；测试锁定 `writeAssistantEngineeringConstraintPackage({ actor, role })`、`router.push('/routing')` 和 `recordAssistantActionAudit(permitted: true)`。
- 验证边界：本片不证明真实 BOM、工艺路线、AI 排产和 OTD 证据链后端持久化完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Customer Commitment Package Status

- 审计结论：本片覆盖 Admin 成功生成客户交付恢复承诺包动作，确认写包、跳转、成功审计和动作包展示都发生，并把完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="status"]`；修复后目标测试 `9/9 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 289 tests passed`，总行覆盖 `63.53%`，`ChatPanel.vue` 行覆盖 `47.73%`。
- 风险判断：新增 `status` live role 只用于 `customer_commitment_package` 成功消息；测试锁定 `writeOtdKpiCommitmentPackage(...)`、`router.push('/report')` 和 `recordAssistantActionAudit(permitted: true)`。
- 验证边界：本片不证明真实客户承诺口径、报表中心、CSV 导出、AI 排产和 OTD 证据链后端持久化完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel BOM Kitting Package Status

- 审计结论：本片覆盖 Admin 成功生成 BOM 展开齐套检查包动作，确认本地齐套包写入、OTD 证据链写入、跳转、成功审计和动作包展示都发生，并把完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="status"]`；修复后目标测试 `10/10 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 290 tests passed`，总行覆盖 `63.71%`，`ChatPanel.vue` 行覆盖 `50.69%`。
- 风险判断：新增 `status` live role 只用于 `bom_kitting_package` 成功消息；测试锁定 `router.push('/bom')` 和 `recordAssistantActionAudit(permitted: true)`，并通过动作包内容覆盖 trace 与缺料复核摘要。
- 验证边界：本片不证明真实 BOM 后端、库存齐套服务、采购加急、替代料工程确认或 OTD 证据链后端持久化完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Equipment Downtime Package Status

- 审计结论：本片覆盖 Admin 成功生成设备停机复核包动作，确认停机事件写入、OTD 证据链写入、跳转、成功审计和动作包展示都发生，并把完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="status"]`；修复后目标测试 `11/11 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 291 tests passed`，总行覆盖 `63.85%`，`ChatPanel.vue` 行覆盖 `53.25%`。
- 风险判断：新增 `status` live role 只用于 `equipment_downtime_package` 成功消息；测试锁定 `router.push('/equipment')` 和 `recordAssistantActionAudit(permitted: true)`，并通过动作包内容覆盖 trace、受影响工单和停机复核摘要。
- 验证边界：本片不证明真实设备维护后端、停机诊断、排产换设备、风险处置或 OTD 证据链后端持久化完整可用；B 轨发布闸门仍需真实外部/人工证据。

## ChatPanel Delivery Recovery Package Status

- 审计结论：本片覆盖 Admin 成功生成交期恢复执行包动作，确认执行包写入、跳转、成功审计和动作包展示都发生，并把完成反馈暴露为礼貌状态更新。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为找不到 `.message.assistant[role="status"]`；修复后目标测试 `12/12 passed`。
- 相邻证据：`main-layout.test.ts` `1/1 passed`，覆盖助手入口所在主布局相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 292 tests passed`，总行覆盖 `63.91%`，`ChatPanel.vue` 行覆盖 `54.24%`。
- 风险判断：新增 `status` live role 只用于 `delivery_recovery_package` 成功消息；测试锁定 `writeAssistantRecoveryPackage({ actor, role })`、`router.push('/scheduling')` 和 `recordAssistantActionAudit(permitted: true)`。
- 验证边界：本片不证明真实 AI 排产、风险处置、采购协同、质量闭环或 OTD 证据链后端持久化完整可用；B 轨发布闸门仍需真实外部/人工证据。

## GanttChart Lightweight Task Detail Click

- 审计结论：本片覆盖离线/demo 轻量甘特任务条进入详情的用户必经路径，避免演示兜底模式下任务可见但不可检查。
- 红绿证据：扩展 `gantt-chart.test.ts` 后先红灯，失败点为 `taskClick` 事件未发出；修复后目标测试 `3/3 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts` `7/7 passed`，覆盖父级调度页与甘特图事件契约相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 293 tests passed`，总行覆盖 `63.92%`，`GanttChart.vue` 行覆盖 `52.04%`。
- 风险判断：新增 `tabindex`、点击和 Enter 处理只作用于轻量 marker；真实 dhtmlx `onTaskClick`、拖拽冲突和渲染配置未改动。
- 验证边界：本片不证明真实 dhtmlx 浏览器渲染、拖拽交互、锁定期阻止拖拽或排产后端数据完整可用；B 轨发布闸门仍需真实外部/人工证据。

## GanttChart Locked Period Overlap Drag Guard

- 审计结论：本片修复锁定期拖拽保护只看任务开始时间的问题，让已经开始但仍跨入锁定期的工单也不能被拖走。
- 红绿证据：扩展 `gantt-chart.test.ts` 后先红灯，失败点为 `onBeforeTaskDrag` 返回 `true`；修复后目标测试 `4/4 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts` `8/8 passed`，覆盖父级调度页与甘特图拖拽事件契约相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 294 tests passed`，总行覆盖 `64.03%`，`GanttChart.vue` 行覆盖 `57.80%`。
- 风险判断：锁定期判定改为区间重叠，保护进行中任务和锁定窗口内任务；设备分组不可拖拽、非锁定期任务拖拽开始、冲突提示和 render 清理逻辑未改动。
- 验证边界：本片不证明真实浏览器拖拽像素交互、后端重排事务、现场人工解锁流程或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## GanttChart Initial Scale Prop

- 审计结论：本片修复初始 `scale` prop 被忽略的问题，避免周/月视图入口先以日视图初始化甘特图。
- 红绿证据：扩展 `gantt-chart.test.ts` 后先红灯，失败点为 `scale_unit` 仍是 `day`；修复后目标测试 `5/5 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts` `9/9 passed`，覆盖父级调度页与甘特图 scale 契约相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 295 tests passed`，总行覆盖 `64.11%`，`GanttChart.vue` 行覆盖 `61.49%`。
- 风险判断：复用既有 `setScale()`，只在初始化后补应用一次初始 scale；后续 scale watcher、数据加载、锁定期和拖拽冲突逻辑未改动。
- 验证边界：本片不证明真实浏览器首屏渲染无闪烁、dhtmlx CSS 资产、后端排产数据或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## ScheduleBoard Task Detail Failure Alert

- 审计结论：本片修复工单详情后端失败被 demo 详情静默掩盖的问题，让调度员知道当前看到的是本地排产解释兜底。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为 `data-error` 为空；修复后目标测试 `5/5 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts` `10/10 passed`，覆盖调度主工作台与甘特点击事件相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 296 tests passed`，总行覆盖 `64.14%`，`ScheduleBoard.vue` 行覆盖 `50.10%`。
- 风险判断：catch 分支仍保留 `buildDemoWorkOrder(task)` 与排产解释兜底，只新增失败原因提示；正常 `getWorkOrderById` 成功路径和 loading 状态由既有测试覆盖。
- 验证边界：本片不证明真实工单后端、排产服务、浏览器面板视觉或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## ScheduleBoard Feedback Sync Failure Reason

- 审计结论：本片修复采纳/拒绝反馈同步失败提示过于泛化的问题，让调度员能看到后端失败原因，同时保留本地复盘记录。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为 `.sync-note` 缺少 `feedback API unavailable`；修复后目标测试 `6/6 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts` `11/11 passed`，覆盖调度主工作台与甘特点击/scale/拖拽相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 297 tests passed`，总行覆盖 `64.16%`，`ScheduleBoard.vue` 行覆盖 `50.50%`。
- 风险判断：只改失败文案，成功同步、缺计划 ID、最近反馈记录和本地快照写入路径未改动。
- 验证边界：本片不证明真实反馈后端、审计入库、模型训练闭环或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## ScheduleBoard Optimization Success Clears Stale Error

- 审计结论：本片修复智能优化失败后旧错误横幅不会随下一次成功优化消失的问题，避免调度员看到成功方案时仍被上一轮失败状态误导。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为第二次优化成功后 `[role="alert"]` 仍存在；修复后目标测试 `7/7 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts` `12/12 passed`，覆盖调度主工作台与甘特点击/scale/拖拽相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 298 tests passed`，总行覆盖 `64.17%`，`ScheduleBoard.vue` 行覆盖 `50.60%`。
- 风险判断：只在成功拿到并应用新 `plan` 时清空 `error.value`；失败横幅、warning 文案、无计划返回和 loading 状态未改动。
- 验证边界：本片不证明真实优化服务、后端排产事务、浏览器视觉回归或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## ScheduleAgentWorkbench Recommendation Failure Alert

- 审计结论：本片修复调度员 Agent 工作台后端建议生成失败只以 polite status 播报的问题，让失败动作以 assertive alert 暴露。
- 红绿证据：扩展 `schedule-agent-workbench-panel.test.ts` 后先红灯，失败点为 `.agent-action-note.error` 的 `role` 仍是 `status`；修复后目标测试 `2/2 passed`。
- 相邻证据：`schedule-agent-workbench-panel.test.ts + schedule-board.test.ts` `9/9 passed`，覆盖工作台子组件与父级调度主页面挂载相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 299 tests passed`，总行覆盖 `64.19%`，`ScheduleAgentWorkbenchPanel.vue` 行覆盖 `83.52%`。
- 风险判断：只根据 `actionError` 动态切换 `role` 和 `aria-live`；成功建议生成仍是 polite status，API 调用和 fallback 文案未改动。
- 验证边界：本片不证明真实 Agent 决策后端、权限策略、审计入库或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## BomBoard Explosion Failure Fallback

- 审计结论：本片修复 BOM 爆炸接口异步失败没有进入 demo fallback 的问题，避免展开区空白并消除未处理 Promise rejection。
- 红绿证据：扩展 `bom-board.test.ts` 后先红灯，失败点为找不到 `.explosion-section`，同时 Vitest 报 `Unhandled Rejection: bom explosion API unavailable`；修复后目标测试 `2/2 passed`。
- 相邻证据：`bom-board.test.ts + shortage-risk-sync.test.ts` `11/11 passed`，覆盖 BOM 页面和齐套包同步工具相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 300 tests passed`，总行覆盖 `64.40%`，`BomBoard.vue` 行覆盖 `66.46%`。
- 风险判断：`handleExplode()` 只从 `.then(...)` 改为 `await` 捕获异步失败；成功 API 展开和本地 demo 数据结构未改动。
- 验证边界：本片不证明真实 BOM 后端、库存齐套服务、工程审批或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## ProductionBoard Work Order Load Failure Alert

- 审计结论：本片修复生产工单 API 不可用时静默显示 demo 工单的问题，避免现场操作员把本地演示数据误认为真实生产列表。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 demo 工单已显示但没有 `[role="alert"]`；修复后目标测试 `8/8 passed`。
- 相邻证据：`production-board.test.ts + production-anomaly-sync.test.ts` `13/13 passed`，覆盖生产看板和异常证据同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 301 tests passed`，总行覆盖 `64.46%`，`ProductionBoard.vue` 行覆盖 `54.42%`。
- 风险判断：catch 分支只增加错误通知，仍保留 demo 工单兜底；扫码、开工、完工、异常和 OTD 证据链未改动。
- 验证边界：本片不证明真实生产工单后端、现场扫码设备、报工事务或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## PurchaseBoard List Refresh Failure Alert

- 审计结论：本片修复采购单确认成功后列表刷新失败静默的问题，避免右侧详情已确认而左侧列表仍旧状态时没有任何用户可见告警。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为确认成功、刷新失败后找不到 `[role="alert"]`；修复后目标测试 `6/6 passed`。
- 相邻证据：`purchase-board.test.ts + shortage-risk-sync.test.ts` `15/15 passed`，覆盖采购看板和缺料风险同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 302 tests passed`，总行覆盖 `64.46%`，`PurchaseBoard.vue` 行覆盖 `53.35%`。
- 风险判断：`refreshList()` catch 分支只新增失败通知，仍保留当前本地列表状态；确认成功详情更新、列表成功刷新、取消、收货和短缺风险联动未改动。
- 验证边界：本片不证明真实采购后端、供应商状态同步、收货事务或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## PurchaseBoard Initial List Failure Alert

- 审计结论：本片修复采购页首屏列表加载失败静默显示 demo 采购单的问题，避免采购员把本地演示采购单误认为真实接口数据。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为 demo 订单已显示但没有 `[role="alert"]`；修复后目标测试 `7/7 passed`。
- 相邻证据：`purchase-board.test.ts + shortage-risk-sync.test.ts` `16/16 passed`，覆盖采购看板和缺料风险同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 303 tests passed`，总行覆盖 `64.48%`，`PurchaseBoard.vue` 行覆盖 `54.07%`。
- 风险判断：初始加载 catch 分支只增加失败通知，仍保留 demo 采购单兜底；真实列表加载、审计对象定位、确认、取消、收货和供应风险联动未改动。
- 验证边界：本片不证明真实采购后端、供应商状态同步、首屏浏览器视觉或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## InventoryBoard Initial List Failure Alert

- 审计结论：本片修复库存页首屏列表加载失败静默显示 demo 物料的问题，避免仓库/计划用户把本地演示库存误认为真实库存数据。
- 红绿证据：扩展 `inventory-board.test.ts` 后先红灯，失败点为 demo 物料已显示但没有 `[role="alert"]`；修复后目标测试 `2/2 passed`。
- 相邻证据：`inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `12/12 passed`，覆盖库存看板、齐套闭环和缺料风险同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 304 tests passed`，总行覆盖 `64.50%`，`InventoryBoard.vue` 行覆盖 `59.54%`。
- 风险判断：只新增失败通知和列表 catch 文案，仍保留 demo 物料兜底；仪表盘、物料选择、交易记录查询和库存操作路径未改动。
- 验证边界：本片不证明真实库存后端、仓库事务、齐套闭环真实入库或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## InventoryBoard Transaction Failure Alert

- 审计结论：本片修复物料交易记录接口失败静默显示 demo 交易的问题，避免用户把本地演示流水误认为真实库存追溯数据。
- 红绿证据：扩展 `inventory-board.test.ts` 后先红灯，失败点为 demo 交易已显示但没有 `[role="alert"]`；修复后目标测试 `3/3 passed`。
- 相邻证据：`inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `13/13 passed`，覆盖库存看板、齐套闭环和缺料风险同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 305 tests passed`，总行覆盖 `64.56%`，`InventoryBoard.vue` 行覆盖 `63.15%`。
- 风险判断：只在交易记录失败 catch 分支写入通知，仍保留当前物料的 demo 交易兜底；交易成功、物料选择、库存列表和库存操作路径未改动。
- 验证边界：本片不证明真实交易后端、库存余额事务、仓库扫码链路或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## InventoryBoard Operation Failure Alert

- 审计结论：本片修复库存操作失败错误只作为普通文本呈现的问题，让出库等落库失败以 alert 语义暴露，并保持弹窗供用户修正或重试。
- 红绿证据：扩展 `inventory-board.test.ts` 后先红灯，失败点为错误文本存在但没有 `[role="alert"]`；修复后目标测试 `4/4 passed`。
- 相邻证据：`inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `14/14 passed`，覆盖库存看板、齐套闭环和缺料风险同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 306 tests passed`，总行覆盖 `64.75%`，`InventoryBoard.vue` 行覆盖 `75.93%`。
- 风险判断：只给 `dialogError` 节点增加 `role="alert"`；失败时不关闭弹窗、成功后刷新数据、出库 payload 和其它操作分支未改动。
- 验证边界：本片不证明真实库存操作后端、仓库扫码设备、库存余额事务或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## AnomalyBoard Initial List Failure Alert

- 审计结论：本片修复异常列表 API 不可用时静默显示 demo 异常的问题，避免现场事件中心把演示异常误呈现为真实异常队列。
- 红绿证据：扩展 `anomaly-board.test.ts` 后先红灯，失败点为 demo 异常已显示但没有 `[role="alert"]`；修复后目标测试 `2/2 passed`。
- 相邻证据：`anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `12/12 passed`，覆盖异常看板、分流记录和生产异常事件同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 307 tests passed`，总行覆盖 `64.78%`，`AnomalyBoard.vue` 行覆盖 `60.58%`。
- 风险判断：只新增失败通知和列表 catch 文案，仍保留 demo 异常兜底；现场事件中心、详情、AI 分析和分流写入未改动。
- 验证边界：本片不证明真实异常后端、现场事件采集、分流闭环真实入库或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## AnomalyBoard Detail Failure Alert

- 审计结论：本片修复异常详情 API 不可用时静默显示 demo 详情的问题，避免现场用户把本地演示详情误认为真实异常详情。
- 红绿证据：扩展 `anomaly-board.test.ts` 后先红灯，失败点为 demo 详情已显示但没有 `[role="alert"]`；修复后目标测试 `3/3 passed`。
- 相邻证据：`anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `13/13 passed`，覆盖异常看板、分流记录和生产异常事件同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 308 tests passed`，总行覆盖 `64.82%`，`AnomalyBoard.vue` 行覆盖 `63.30%`。
- 风险判断：只在详情加载失败 catch 分支写入通知，仍保留对应 demo 详情兜底；详情成功加载、AI 分析和事件分流未改动。
- 验证边界：本片不证明真实异常详情后端、现场事件采集、AI 分析服务或灰度发布可用；B 轨发布闸门仍需真实外部/人工证据。

## AnomalyBoard AI Analysis Failure Alert

- 审计结论：本片修复 AI 分析接口不可用时静默显示 demo 建议的问题，避免现场用户把本地演示建议误认为真实后端 AI 分析结果。
- 红绿证据：扩展 `anomaly-board.test.ts` 后先红灯，失败点为 demo 建议已显示但没有 `[role="alert"]`；修复后目标测试 `4/4 passed`。
- 相邻证据：`anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `14/14 passed`，覆盖异常看板、分流记录和生产异常事件同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 309 tests passed`，总行覆盖 `64.95%`，`AnomalyBoard.vue` 行覆盖 `70.92%`。
- 风险判断：只在 `handleAnalyze()` 失败路径清空旧通知并写入失败提示，仍保留原有 demo 建议兜底；AI 成功返回、详情加载和事件分流未改动。
- 验证边界：本片不证明真实 AI 分析服务、异常详情后端、现场事件采集或灰度发布可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ChatPanel Recovery Package Failure Alert

- 审计结论：本片修复助手动作在权限通过后写入交期恢复执行包失败时产生未处理异常的问题，避免用户看到动作按钮无响应或误以为已生成执行包。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为 `writeAssistantRecoveryPackage` 抛错后出现 unhandled error，且失败审计没有写入；修复后目标测试 `13/13 passed`。
- 相邻证据：`chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + otd-kpi-commitment-sync.test.ts + shortage-risk-sync.test.ts + equipment-risk-sync.test.ts` `59/59 passed`，覆盖助手动作审计和主要执行包同步工具相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 310 tests passed`，总行覆盖 `64.96%`，`ChatPanel.vue` 行覆盖 `54.50%`。
- 风险判断：`executeAction()` 新增统一失败兜底，成功路径仍保留原有状态消息、payload、跳转和 permitted=true 审计；失败路径在 catch 中记录 permitted=false 并播报 alert。
- 验证边界：本片不证明真实本地存储、报表导出、路由页面或灰度发布可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ChatPanel Restricted Action Audit Failure Alert

- 审计结论：本片修复 AI 助手权限拒绝审计写入失败时产生未处理异常的问题，避免受限动作虽未执行但拒绝证据也没有落地且用户无提示。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为 `recordAssistantActionAudit` 在权限拒绝分支抛错后没有 `[role="alert"]`，并出现 unhandled rejection；修复后目标测试 `14/14 passed`。
- 相邻证据：`chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `36/36 passed`，覆盖助手动作、审计和主要执行包同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 319 tests passed`，fresh 总行覆盖 `65.87%`，`ChatPanel.vue` 行覆盖 `54.68%`。
- 风险判断：受限动作仍不会导航或写执行包；新增兜底只覆盖拒绝审计写入失败时的用户可见 alert，权限拒绝成功审计路径不变。
- 验证边界：本片不证明真实审计后端、真实权限系统、真实路由页面或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ProductionBoard Scan API Failure Alert

- 审计结论：本片修复扫码接口不可用时被降级成普通无匹配提示的问题，避免现场操作员把扫码服务故障误判为工单号/工序码不存在。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 alert 文案只有 `未找到匹配的工单或工序`，缺少 `scanner API unavailable`；修复后目标测试 `9/9 passed`。
- 相邻证据：`production-board.test.ts + production-anomaly-sync.test.ts + barcode-scan-evidence-sync.test.ts + otd-evidence-chain-sync.test.ts` `26/26 passed`，覆盖生产看板、扫码证据、异常事件和 OTD 证据链相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 311 tests passed`，fresh 总行覆盖 `64.92%`，`ProductionBoard.vue` 行覆盖 `54.68%`。
- 风险判断：只在 `handleScan()` 的扫码接口 catch 中保存错误，并在本地也未命中时展示失败原因；扫码成功、本地命中、工单选择和报工动作未改动。
- 验证边界：本片不证明真实扫码后端、现场扫码设备、生产事务或灰度发布可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## QualityCapaTaskPanel Closure Failure Alert

- 审计结论：本片修复 CAPA 验证闭环写入失败时 UI 先标记已验证的问题，避免质量任务在审计/OTD 同步失败后被误判为闭环完成。
- 红绿证据：扩展 `quality-capa-task-panel.test.ts` 后先红灯，失败点为 `writeQualityCapaClosure` 抛错后任务卡片仍包含 `verified` 且 Vitest 捕获 unhandled error；修复后目标测试 `3/3 passed`。
- 相邻证据：`quality-capa-task-panel.test.ts + quality-capa-sync.test.ts` `7/7 passed`，覆盖 CAPA 面板和闭环同步工具相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 312 tests passed`，fresh 总行覆盖 `64.99%`，`QualityCapaTaskPanel.vue` 行覆盖 `55.23%`。
- 风险判断：闭环失败路径现在只保留任务执行中并播报 alert；成功路径仍写入原有 `writeQualityCapaClosure` payload，再更新已验证状态和 polite status。
- 验证边界：本片不证明真实浏览器、真实审计存储、OTD 复盘服务或灰度发布可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## DocumentUpload Quality Evidence Refresh Failure Alert

- 审计结论：本片修复文档上传页质量知识证据后台刷新失败时未处理异常的问题，避免治理面板刷新失败静默或污染整页挂载。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `readQualityKnowledgeSamplesBackendFirst` 抛错后没有 `[role="alert"]` 且 Vitest 捕获 mounted hook unhandled rejection；修复后目标测试 `7/7 passed`。
- 相邻证据：`document-upload.test.ts + customer-order-import-sync.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `21/21 passed`，覆盖上传页、客户导入、质量知识样本和治理同步工具相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 313 tests passed`，fresh 总行覆盖 `65.00%`，`DocumentUpload.vue` 行覆盖 `51.13%`。
- 风险判断：失败路径只写入现有页面级 alert，并保留本地 `governanceDocuments`；成功路径仍顺序刷新质量样本、复核队列、推荐反馈、再训练版本和灰度决策。
- 验证边界：本片不证明真实质量知识后端、真实文件索引服务、真实灰度发布或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## DocumentUpload Quality Gray Publish Failure Alert

- 审计结论：本片修复质量知识 R3 灰度发布写入失败时未处理异常的问题，避免知识库管理员误以为训练集灰度发布和审计归档已经完成。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `grayPublishQualityKnowledgeNextTrainingSetVersion` 抛错后没有 `[role="alert"]`，且 Vitest 捕获 unhandled error；修复后目标测试 `8/8 passed`。
- 相邻证据：`document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `19/19 passed`，覆盖上传页、治理面板、质量知识同步和知识治理同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 318 tests passed`，fresh 总行覆盖 `65.86%`，`DocumentUpload.vue` 行覆盖 `54.18%`。
- 风险判断：只在 `handleQualityNextTrainingGrayPublish()` 的灰度发布写入处新增失败兜底；成功路径仍刷新版本记录并写入历史，其他质量治理动作未改动。
- 验证边界：本片不证明真实质量知识后端、真实灰度发布服务、真实质量主管审批或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ScheduleBoard Drag Reschedule Failure Alert

- 审计结论：本片修复拖拽重排保存失败后错误横幅被恢复重载清掉的问题，避免调度员误以为拖拽调整已落库。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为 `rescheduleItem` 抛错后页面找不到 `[role="alert"]`；修复后目标测试 `8/8 passed`。
- 相邻证据：`schedule-board.test.ts + gantt-chart.test.ts + gantt-mapper.test.ts + schedule-feedback-sync.test.ts` `25/25 passed`，覆盖排产页、甘特拖拽、甘特映射和反馈同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 314 tests passed`，fresh 总行覆盖 `65.07%`，`ScheduleBoard.vue` 行覆盖 `51.80%`。
- 风险判断：`loadData()` 默认行为不变；只有拖拽保存失败后的恢复重载保留当前 `error`，成功保存仍会清空错误。
- 验证边界：本片不证明真实排产后端、真实浏览器拖拽、数据库事务或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ScheduleBoard Batch Objective Feedback Failure Alert

- 审计结论：本片修复多目标方案采用后采纳反馈同步失败只写日志的问题，避免调度员以为方案采纳原因已经进入后端审计。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为 `submitAdoptionFeedback` 抛错后页面没有 `.sync-note`；修复后目标测试 `9/9 passed`。
- 相邻证据：`schedule-board.test.ts + pareto-compare.test.ts + schedule-feedback-sync.test.ts + gantt-mapper.test.ts` `23/23 passed`，覆盖排产页、多目标对比、反馈同步和甘特映射相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 315 tests passed`，fresh 总行覆盖 `65.13%`，`ScheduleBoard.vue` 行覆盖 `53.08%`。
- 风险判断：`onApplyObjective()` 仍先切换目标并继续优化；新增状态只覆盖采纳反馈同步中/成功/失败，不改变普通反馈面板和拖拽保存路径。
- 验证边界：本片不证明真实 Pareto 后端、真实采纳反馈服务、模型复盘数据集或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ScheduleBoard Risk Event Load Failure Alert

- 审计结论：本片修复风险事件后端不可用时静默显示 demo 事件队列的问题，避免调度员把本地演示事件误认为实时风险队列。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为 `getRiskDashboard` 抛错后页面没有 `.risk-event-sync-note`；修复后目标测试 `10/10 passed`。
- 相邻证据：`schedule-board.test.ts + schedule-event-queue-panel.test.ts + schedule-feedback-sync.test.ts + gantt-mapper.test.ts` `23/23 passed`，覆盖排产页、事件队列、反馈同步和甘特映射相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 316 tests passed`，fresh 总行覆盖 `65.14%`，`ScheduleBoard.vue` 行覆盖 `53.16%`。
- 风险判断：`loadRiskTriggeredEvents()` 仍保留 demo 事件兜底和 Agent 建议清空逻辑；新增状态只暴露风险事件加载失败原因，成功路径会清空提示。
- 验证边界：本片不证明真实风险后端、真实事件流、Agent 推荐服务或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ScheduleBoard Outsourcing Release Failure Alert

- 审计结论：本片修复外协到货后采纳 Agent 建议时释放审计写入失败未 fail loud 的问题，避免调度员以为厂外等待口径已经关闭并归档到 OTD 复盘。
- 红绿证据：扩展 `schedule-board.test.ts` 后先红灯，失败点为 `confirmOutsourcingScheduleRelease` 抛错后出现 unhandled rejection，且 `.sync-note` 仍显示普通反馈同步成功；修复后目标测试 `11/11 passed`。
- 相邻证据：`schedule-board.test.ts + schedule-event-queue-panel.test.ts + schedule-feedback-sync.test.ts + outsourcing-commitment-sync.test.ts + gantt-mapper.test.ts` `31/31 passed`，覆盖排产页、事件队列、反馈同步、外协同步和甘特映射相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 317 tests passed`，fresh 总行覆盖 `65.80%`，`ScheduleBoard.vue` 行覆盖 `64.77%`。
- 风险判断：普通采纳反馈仍走原有 `handleScheduleDecision()`；仅外协已到货且未释放的特殊采纳路径新增释放失败兜底，成功释放路径和事件刷新逻辑保持原样。
- 验证边界：本片不证明真实外协后端、真实 OTD 证据链、真实浏览器采纳流程或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ProductionBoard Completion Evidence Failure Alert

- 审计结论：本片修复生产完工后证据链写入失败时产生未处理异常且无用户提示的问题，避免“后端完工已提交”被 UI 包装成完整成功闭环。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 `upsertOtdEvidenceChainRecord` 抛错后没有 `[role="alert"]`，并出现 native event handler unhandled error；修复后目标测试 `10/10 passed`。
- 相邻证据：`production-board.test.ts + production-anomaly-sync.test.ts + barcode-scan-evidence-sync.test.ts + otd-evidence-chain-sync.test.ts` `27/27 passed`，覆盖生产看板、生产异常、扫码证据和 OTD 证据链相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 320 tests passed`，fresh 总行覆盖 `66.14%`，`ProductionBoard.vue` 行覆盖 `59.41%`。
- 风险判断：后端完工成功不可由前端假回滚；新增兜底只说明证据未归档并停止成功通知，成功路径和 API 失败路径保持原样。
- 验证边界：本片不证明真实生产后端、真实 OTD/质量证据存储、现场扫码设备或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## QualityCapaTaskPanel Reuse Closure Failure Alert

- 审计结论：本片修复质量知识复用草案转正式 CAPA 写入失败时产生未处理异常的问题，避免 AI 草案没有正式归档却缺少用户可见失败提示。
- 红绿证据：扩展 `quality-capa-task-panel.test.ts` 后先红灯，失败点为 `writeQualityKnowledgeReuseClosure` 抛错后没有 `[role="alert"]`，并出现 native event handler unhandled error；修复后目标测试 `4/4 passed`。
- 相邻证据：`quality-capa-task-panel.test.ts + quality-capa-sync.test.ts + quality-knowledge-sample-sync.test.ts` `13/13 passed`，覆盖 CAPA 面板、CAPA 同步和质量知识样本同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 321 tests passed`，fresh 总行覆盖 `66.21%`，`QualityCapaTaskPanel.vue` 行覆盖 `61.46%`。
- 风险判断：失败路径保留草案待复核和按钮重试；成功转正式 CAPA、复用效果验证、低分复核和推荐采纳路径保持原样。
- 验证边界：本片不证明真实质量知识后端、真实 CAPA 审计存储、真实质量主管审批或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## DocumentUpload Quality Experiment Shadow Gray Publish Failure Alert

- 审计结论：本片修复质量实验 R7 影子灰度发布写入失败时未处理异常的问题，避免知识库管理员误以为影子灰度发布和审计归档已经完成。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `grayPublishQualityExperimentShadowValidationVersion` 抛错后没有 `[role="alert"]`，并出现 component/native event handler unhandled error；修复后目标测试 `9/9 passed`。
- 相邻证据：`document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `20/20 passed`，覆盖上传页、治理面板、质量知识同步和知识治理同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 322 tests passed`，fresh 总行覆盖 `66.21%`，`DocumentUpload.vue` 行覆盖 `56.59%`。
- 风险判断：失败路径只写页面级 alert，不新增发布历史；R7 影子灰度发布成功路径仍刷新训练集和灰度决策记录。
- 验证边界：本片不证明真实质量知识后端、真实灰度发布服务、真实质量主管扩大审批或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## PurchaseBoard Confirmation Failure Alert

- 审计结论：本片修复采购确认 API 失败时 UI 本地强行改成已确认的问题，避免采购单未落库确认却进入供应履约假阳性。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为 `confirmPurchaseOrder` 抛错后详情 tag 仍变成 `已确认`；修复后目标测试 `8/8 passed`。
- 相邻证据：`purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `29/29 passed`，覆盖采购看板、外协承诺、短缺风险和 OTD 证据链相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 323 tests passed`，fresh 总行覆盖 `66.28%`，`PurchaseBoard.vue` 行覆盖 `54.77%`。
- 风险判断：失败路径保留提交态和确认按钮并显示 alert；确认成功路径和确认成功后刷新失败兜底保持原样。
- 验证边界：本片不证明真实采购后端、真实供应商信用状态、真实供应履约或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ChatPanel Failed Action Audit Failure Alert

- 审计结论：本片修复助手动作执行失败后，失败审计写入再次失败导致未处理异常的问题，避免原始动作失败原因和审计失败原因都无法反馈给用户。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为失败审计 `recordAssistantActionAudit` 抛错后没有 `.message.assistant[role="alert"]`，并出现 unhandled rejection；修复后目标测试 `15/15 passed`。
- 相邻证据：`chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `37/37 passed`，覆盖助手动作、审计、交期恢复执行包、异常卡和工程约束包相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 324 tests passed`，fresh 总行覆盖 `66.25%`，`ChatPanel.vue` 行覆盖 `54.95%`。
- 风险判断：失败审计写入失败时只追加 alert 文案，不改变成功审计和成功动作包路径；动作失败仍不导航。
- 验证边界：本片不证明真实助手审计后端、真实跨模块执行包服务、真实路由页面或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## PurchaseBoard Submit Failure Alert

- 审计结论：本片修复采购提交 API 失败时 UI 本地强行改成已提交的问题，避免草稿未落库提交却进入后续确认/供应履约假阳性。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为 `submitPurchaseOrder` 抛错后详情 tag 仍变成 `已提交`；修复后目标测试 `9/9 passed`。
- 相邻证据：`purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `30/30 passed`，覆盖采购看板、外协承诺、短缺风险和 OTD 证据链相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 325 tests passed`，fresh 总行覆盖 `66.33%`，`PurchaseBoard.vue` 行覆盖 `56.20%`。
- 风险判断：失败路径保留草稿态和提交按钮并显示 alert；提交成功路径、确认路径、取消路径和收货路径保持原样。
- 验证边界：本片不证明真实采购后端、真实供应商准入状态、真实供应履约或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## PurchaseBoard Create Failure Alert

- 审计结论：本片修复采购新建 API 失败时 UI 本地插入新草稿单并关闭弹窗的问题，避免供应商主数据或校验失败被包装成新建成功。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为 `createPurchaseOrder` 抛错后 `.modal-content` 消失；修复后目标测试 `10/10 passed`。
- 相邻证据：`purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `31/31 passed`，覆盖采购看板、外协承诺、短缺风险和 OTD 证据链相邻风险。
- 测试基础设施证据：全量 coverage 首次出现 `GanttChart.vue` CSS teardown unhandled rejection；`http-refresh.test.ts` 单独测试和单文件 coverage 均通过，定位为 `pareto-compare.test.ts` 未 stub 异步 Gantt。改为 `global.stubs.GanttChart = true` 后 `pareto-compare.test.ts` `2/2 passed`，全量 coverage 不再出现 unhandled error。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 326 tests passed`，fresh 总行覆盖 `66.36%`，`PurchaseBoard.vue` 行覆盖 `57.24%`。
- 风险判断：失败路径保留新建弹窗和用户输入并显示 alert；新建成功仍关闭弹窗。测试隔离只避免 ParetoCompare 单测加载真实 GanttChart，不改变 `gantt-chart.test.ts` 对真实图表的覆盖。
- 验证边界：本片不证明真实采购后端、真实供应商主数据、真实排产对比图表渲染或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## DocumentUpload Quality Retraining Publish Failure Alert

- 审计结论：本片修复质量知识正式发布写入失败时未处理异常的问题，避免训练集未进入 AI 推荐链路却缺少用户可见失败提示。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `publishQualityKnowledgeRetrainingVersion` 抛错后没有 `[role="alert"]`，并出现 component/native event handler unhandled error；修复后目标测试 `10/10 passed`。
- 相邻证据：`document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + knowledge-governance-sync.test.ts` `21/21 passed`，覆盖上传页、治理面板、质量知识同步和知识治理同步相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 327 tests passed`，fresh 总行覆盖 `66.41%`，`DocumentUpload.vue` 行覆盖 `58.91%`。
- 风险判断：失败路径只写页面级 alert，不新增“发布到 AI 推荐链路”历史记录；正式发布成功路径、灰度发布失败兜底和影子灰度发布失败兜底保持原样。
- 验证边界：本片不证明真实质量知识后端、真实推荐链路发布服务、真实质量主管审批或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ChatPanel Success Audit Failure Alert

- 审计结论：本片修复助手动作主体成功后成功审计写入失败被误报成动作失败的问题，避免交期恢复执行包已生成却被页面和失败审计标记为失败。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为 `recordAssistantActionAudit` 被调用两次且第二次写入失败审计；修复后目标测试 `16/16 passed`。
- 相邻证据：`chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts` `38/38 passed`，覆盖助手动作、审计、交期恢复执行包、异常卡和工程约束包相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 328 tests passed`，fresh 总行覆盖 `66.42%`，`ChatPanel.vue` 行覆盖 `55.12%`。
- 风险判断：成功审计失败只追加 alert，不改变已经成功的业务动作、路由跳转和成功 status；动作主体失败仍走原失败审计路径。
- 验证边界：本片不证明真实助手审计后端、真实路由页面、真实跨模块执行包服务或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## DocumentUpload Quality Retraining Rollback Failure Alert

- 审计结论：本片修复质量知识回滚写入失败时未处理异常的问题，避免已发布训练集没有撤回却缺少用户可见失败提示。
- 红绿证据：扩展 `document-upload.test.ts` 后先红灯，失败点为 `rollbackQualityKnowledgeRetrainingVersion` 抛错后没有 `[role="alert"]`，并出现 component/native event handler unhandled error；修复后目标测试 `11/11 passed`。
- 相邻证据：`document-upload.test.ts + knowledge-governance-panel.test.ts + quality-knowledge-sample-sync.test.ts + admin-board.test.ts + audit-decision-replay-panel.test.ts + report-board.test.ts` `24/24 passed`，覆盖上传页、治理面板、质量知识同步和治理记录消费相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 329 tests passed`，fresh 总行覆盖 `66.46%`，`DocumentUpload.vue` 行覆盖 `61.17%`。
- 风险判断：失败路径只写页面级 alert，不新增“质量再训练回滚”历史记录；回滚成功路径、正式发布失败兜底、灰度发布失败兜底和影子灰度发布失败兜底保持原样。
- 验证边界：本片不证明真实质量知识后端、真实回滚服务、真实质量主管审批或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## PurchaseBoard Alternate Supplier Commitment Failure Alert

- 审计结论：本片修复替代供应商锁定审计写入失败时 UI 先推进为已锁定的问题，避免供应风险未归档却被采购页包装成已恢复。
- 红绿证据：扩展 `purchase-board.test.ts` 后先红灯，失败点为 `writeSupplyRiskEscalation` 抛错后 badge 已显示 `替代已锁定`，并出现 native event handler unhandled error；修复后目标测试 `11/11 passed`。
- 相邻证据：`purchase-board.test.ts + outsourcing-commitment-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `32/32 passed`，覆盖采购看板、外协承诺、短缺/供应风险和 OTD 证据链相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 330 tests passed`，fresh 总行覆盖 `66.56%`，`PurchaseBoard.vue` 行覆盖 `60.57%`。
- 风险判断：失败路径保持供应风险 open、trace 为空且不显示替代到货按钮；成功路径仍写供应风险审计与 OTD 证据后再显示锁定状态。
- 验证边界：本片不证明真实采购后端、真实供应商承诺、真实 OTD 证据存储或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ChatPanel BOM Kitting Evidence Failure Alert

- 审计结论：本片修复 BOM 齐套包已写入但 OTD 证据写入失败时被误报成整体动作失败的问题，避免已生成包卡片被错误隐藏。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为 `upsertOtdEvidenceChainRecord` 抛错后没有 `/bom` 跳转和成功包展示；修复后目标测试 `17/17 passed`。
- 相邻证据：`chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `53/53 passed`，覆盖助手动作、审计、执行包、BOM 齐套和 OTD 证据相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 331 tests passed`，fresh 总行覆盖 `66.59%`，`ChatPanel.vue` 行覆盖 `55.64%`。
- 风险判断：BOM 齐套包写入失败仍走外层动作失败；仅 OTD 证据写入失败被降级为“部分成功但证据未归档”的 alert。成功审计仍记录 permitted=true。
- 验证边界：本片不证明真实 BOM 后端、真实库存齐套、真实 OTD 证据存储或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`，仍需真实外部/人工证据。

## ChatPanel Equipment Downtime Evidence Failure Alert

- 审计结论：本片修复设备停机事件已写入但 OTD 证据写入失败时被误报成整体动作失败的问题，避免已生成停机复核包卡片被错误隐藏。
- 红绿证据：扩展 `chat-panel.test.ts` 后先红灯，失败点为 `upsertOtdEvidenceChainRecord` 抛错后没有 `/equipment` 跳转和成功包展示；修复后目标测试 `18/18 passed`。
- 相邻证据：`chat-panel.test.ts + assistant-action-audit.test.ts + assistant-action-package-sync.test.ts + assistant-anomaly-card-sync.test.ts + assistant-engineering-constraint-package-sync.test.ts + shortage-risk-sync.test.ts + otd-evidence-chain-sync.test.ts` `54/54 passed`，覆盖助手动作、审计、执行包、设备停机和 OTD 证据相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 332 tests passed`，fresh 总行覆盖 `66.56%`，`ChatPanel.vue` 行覆盖 `56.14%`。
- 风险判断：设备停机事件写入失败仍走外层动作失败；仅 OTD 证据写入失败被降级为“部分成功但证据未归档”的 alert。成功审计仍记录 permitted=true。
- 验证边界：本片不证明真实设备后端、真实维护队列、真实 OTD 证据存储或 v1.0.0 发布闸门可用；B 轨发布闸门仍需真实外部/人工证据。

## ProductionBoard Exception Evidence Failure Alert

- 审计结论：本片修复后端异常上报成功后，本地异常管理/OTD 证据归档失败导致未处理异常的问题，避免现场已上报异常被包装成无提示或全成功。
- 红绿证据：扩展 `production-board.test.ts` 后先红灯，失败点为 `writeProductionAnomalyEvent` 抛错后没有 `[role="alert"]`，并出现 native event handler unhandled error；修复后目标测试 `11/11 passed`。
- 相邻证据：`production-board.test.ts + production-anomaly-sync.test.ts + otd-evidence-chain-sync.test.ts + barcode-scan-evidence-sync.test.ts + labor-assignment-sync.test.ts` `34/34 passed`，覆盖生产报工、异常事件、OTD 证据、扫码证据和人员派工相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 333 tests passed`，fresh 总行覆盖 `66.61%`，`ProductionBoard.vue` 行覆盖 `59.45%`。
- 风险判断：后端 `reportException` 失败仍走原 `异常上报失败...`；本片只把后端成功后的证据失败降级为“部分成功但证据未归档”的 alert，不再显示 `异常已上报...` 全成功提示。
- 验证边界：本片不证明真实生产异常后端、真实异常处置队列、真实 OTD 证据存储或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`。

## RiskActionQueuePanel Escalation Trace Failure Alert

- 审计结论：本片修复风险升级 trace 写入失败时 UI 先显示 `已升级` 的假阳性，避免风险责任状态和审计留痕不一致。
- 红绿证据：扩展 `risk-action-queue-panel.test.ts` 后先红灯，失败点为 `appendRiskActionTrace` 抛错后卡片已经显示 `已升级`，并出现 native event handler unhandled error；修复后目标测试 `2/2 passed`。
- 相邻证据：`risk-action-queue-panel.test.ts + risk-action-sync.test.ts + risk-sla-review-sync.test.ts + monitoring-situation-escalation-sync.test.ts + production-anomaly-sync.test.ts + anomaly-dispatch-sync.test.ts + assistant-action-package-sync.test.ts` `34/34 passed`，覆盖风险队列、风险 trace、SLA 复核、监控态势、生产异常、异常分流和助手执行包相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 334 tests passed`，fresh 总行覆盖 `66.65%`，`RiskActionQueuePanel.vue` 行覆盖 `63.46%`。
- 风险判断：trace 写入失败时保留原 `待处置` 状态、原负责人和处置留痕；升级成功路径仍写 trace 后显示 `已升级`。
- 验证边界：本片不证明真实风险 trace 后端、真实生产经理审批或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`。

## ReportBoard POC Review Signoff Failure Alert

- 审计结论：本片修复 POC 复盘签署记录写入失败时未处理异常的问题，避免客户验收证据未归档却被页面推进为已签署。
- 红绿证据：扩展 `report-board.test.ts` 后先红灯，失败点为 `writePocReviewSignoffRecord` 抛错后没有 `[role="alert"]`，并出现 native event handler unhandled error；修复后目标测试 `2/2 passed`。
- 相邻证据：`report-board.test.ts + poc-review-signoff-sync.test.ts + poc-rollout-package-sync.test.ts + poc-pilot-run-sync.test.ts + poc-hypercare-sync.test.ts + otd-evidence-chain-sync.test.ts` `26/26 passed`，覆盖报表页、POC 签署、转上线、试运行、hypercare 和 OTD 证据链相邻风险。
- 静态与覆盖率：`npm run lint` 通过；`npm run test:unit:coverage` 通过，`81 files / 335 tests passed`，fresh 总行覆盖 `66.79%`，`ReportBoard.vue` 行覆盖 `61.89%`。
- 风险判断：签署写入失败时只显示 assertive alert，`pocReviewSignoff` 保持空值，页面不出现 `POC 复盘已签署`；成功路径仍写入签署记录后刷新 OTD 证据链。
- 验证边界：本片不证明真实 POC 签署后端、真实客户复盘会签字、真实 OTD 证据存储或 v1.0.0 发布闸门可用；B 轨发布闸门审计仍为 `FAIL`。

## Release Gate Anchored PASS Audit

- 审计结论：本片加固 v1.0.0 B 轨总审计，避免单项证据包只是在正文提到 `Result: PASS` 就被误判为发布闸门通过。
- 红绿证据：新增 `ReleaseGateAudit_ShouldOnlyAcceptAnchoredGatePassLines` 后先红灯，失败点为 `scripts/run-release-gate-audit.ps1` 使用 `.Contains("Result: PASS")`；修复后目标门 `1/1 passed`。
- 动态负例：构造临时 spoof 报告，正文包含 `Result: PASS` 但独立结果行为 `- Result: FAIL`；总审计输出 `EXPECTED_FAIL`，Hosted CI、staging、Attack Chain 和 gray observation 均保持 `FAIL`。
- 架构回归：`dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~ReleaseGateAudit"` `2/2 passed`；全量 `MES.ArchitectureTests` `72/72 passed`。
- 附带审计：全量架构测试暴露 Sprint4 LLM 成本门仍查旧 `llmConfig.MaxConcurrency` 字符串；已改为 Sprint5 文档要求的 `IOptions<LlmConfig>.Value.MaxConcurrency`，与生产注册实现一致。
- 验证边界：本片只提高发布审计判定严格度，不补真实 hosted CI、staging、人工 Attack Chain、安全签字或灰度观察证据；正式总审计仍为 `FAIL`。

## Release Gate Anchored Security Signoff Audit

- 审计结论：本片加固安全签字判定，避免 unsigned 签字包只在说明文字里出现 `Status: SIGNED` / `Decision: SIGNED` 就关闭 release gate。
- 红绿证据：新增 `ReleaseGateAudit_ShouldOnlyAcceptAnchoredSecuritySignoffLines` 后先红灯，失败点为裸 `.Contains(...)`；修复后目标门 `1/1 passed`。
- 动态负例：构造临时签字包，正文写明 signed 是要求，但独立行是 `- Status: UNSIGNED` / `- Decision: UNSIGNED`；四个其它临时证据包为 PASS 时，总审计仍输出 `EXPECTED_FAIL` 且只卡 `Security signoff`。
- 回归证据：release gate 架构过滤 `3/3 passed`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `73/73 passed`；正式 release gate audit 仍为 `FAIL`。
- 验证边界：本片只防止签字包文本 spoof；真实人工签字、Attack Chain A/B/C 证据、hosted CI、staging 和灰度观察仍需外部/人工补齐。

## Hosted CI Job Summary Evidence Gate

- 审计结论：本片把 hosted CI job summary 从报告说明升级为单项证据脚本的硬门槛，避免只有 run URL/id 但没有 job 摘要的弱证据关闭 hosted CI gate。
- 红绿证据：扩展 `HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun` 后先红灯，失败点为脚本/报告缺 `job summary`；修复并刷新报告后目标门 `1/1 passed`。
- 动态负例：临时运行脚本时提供 `RunUrl=https://github.example/run/1` 和 `RunId=12345`，但不提供 `Evidence`；脚本输出 `EXPECTED_FAIL`，报告只剩 `Hosted CI job summary evidence is required to close the hosted CI release gate.`。
- 回归证据：`HostedCiRunGate|ReleaseGateAudit` 架构过滤 `4/4 passed`；两个 PowerShell 脚本 parser `parse ok`；`MES.ArchitectureTests` 全量 `73/73 passed`；正式 release gate audit 仍 `FAIL`。
- 验证边界：本片不生成真实 GitHub Actions hosted runner 证据；仍需有权限环境提供真实 `RunUrl`、`RunId` 和 job summary。

## Attack Chain VerifiedAt Timestamp Gate

- 审计结论：本片加固 Attack Chain A/B/C 人工验证证据，避免不可解析的 `VerifiedAt` 字符串被当成有效验证时间。
- 红绿证据：扩展 `AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified` 后先红灯，失败点为脚本缺少 `[DateTimeOffset]::Parse`；修复后目标门 `1/1 passed`。
- 动态负例：临时运行脚本时给齐 Verifier、Attack Chain A/B/C PASS 和三条 evidence，但传入 `VerifiedAt=not-a-date`；脚本输出 `EXPECTED_FAIL`，报告只出现 `VerifiedAt must be a parseable timestamp...` 相关 violation。
- 回归证据：`attack-chain-verification-20260601.md` 与 `attack-chain-verification-20260602.md` 已刷新为 fail-loud 证据包；正式 release gate audit 仍应保持 `FAIL`。
- 验证边界：本片不替代真人 Attack Chain 验证，不提供安全签字，也不关闭 v1.0.0 发布闸门。

## Release Gate Attack Chain Evidence Predicate

- 审计结论：本片把 Attack Chain 证据复核从单项脚本扩展到总 release gate，避免总审计只看 `Result: PASS`。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequireAttackChainHumanEvidenceFields` 后先红灯，失败点为总审计脚本缺 `Test-AttackChainEvidencePass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，Attack Chain 报告写 `- Result: PASS` 但缺 verifier、VerifiedAt 和 A/B/C evidence；总审计输出 `EXPECTED_FAIL`，且只卡 `Attack Chain A/B/C`。
- 合法样本：Attack Chain 报告包含 `Status: VERIFIED`、Verifier、可解析 `VerifiedAt`、三条 `Manual verification: PASS` 和三条 evidence 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只加固总审计判定，不生成真实人工 Attack Chain 证据；正式 v1.0.0 仍需真人验证和安全签字。

## Release Gate Staging Evidence Predicate

- 审计结论：本片把 PostgreSQL/staging 证据复核从 `Result: PASS` 扩展为迁移和健康检查字段级判定，避免弱 staging 报告关闭总闸门。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequireStagingRehearsalEvidenceFields` 后先红灯，失败点为总审计脚本缺 `Test-StagingEvidencePass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，staging 报告写 `- Result: PASS` 但缺 Docker、依赖启动、EF migration、API、`/live`、`/ready` 证据；总审计输出 `EXPECTED_FAIL`，且只卡 `PostgreSQL/staging`。
- 合法样本：staging 报告包含生产环境、连接串、四个命令 `Exit code: 0`、`Health /live` 和 `Health /ready` 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只加固总审计判定，不证明当前机器已完成真实 staging rehearsal；正式报告仍因 Docker 不可用保持 fail loud。

## Release Gate Hosted CI Evidence Predicate

- 审计结论：本片把 Hosted CI 证据复核从 `Result: PASS` 扩展为远端 run 字段级判定，避免弱 CI 报告关闭总闸门。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后先红灯，失败点为总审计脚本缺 `Test-HostedCiEvidencePass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，Hosted CI 报告写 `- Result: PASS` 但状态仍是 `MISSING_REMOTE_RUN` 且缺 RunUrl/RunId/job summary；总审计输出 `EXPECTED_FAIL`，且只卡 `Hosted CI`。
- 合法样本：Hosted CI 报告包含 `Status: READY_FOR_RELEASE_REVIEW`、RunUrl、RunId、job summary、ci/eval workflow 和 `gh run` `Exit code: 0` 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只加固总审计判定，不生成真实 GitHub Actions run；正式报告仍因缺远端 runner 证据保持 fail loud。

## Release Gate Gray Observation Evidence Predicate

- 审计结论：本片把 Gray observation 证据复核从 `Result: PASS` 扩展为灰度发布、14 天观察窗口和 P0/P1 事故字段级判定，避免灰度尚未完成时关闭总闸门。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequireGrayObservationWindowEvidenceFields` 后先红灯，失败点为总审计脚本缺 `Test-GrayObservationEvidencePass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，Gray observation 报告写 `- Result: PASS` 但 `Status: OBSERVING` 且观察窗口不足 14 天；总审计输出 `EXPECTED_FAIL`，且只卡 `Gray observation`。
- 合法样本：Gray observation 报告包含 `Status: PASS`、GrayReleaseId、三个可解析时间戳、至少 14 天窗口、`P0/P1 incident counts: P0=0; P1=0` 和 evidence 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`dotnet test ... --filter "FullyQualifiedName~ReleaseGateAudit|FullyQualifiedName~GrayObservation"` `8/8 passed`；`run-release-gate-audit.ps1` parser `parse ok`；正式 release gate audit 输出 `EXPECTED_FAIL` 且五个 B 轨 gate 均为 `FAIL`。
- 验证边界：本片只加固总审计判定，不制造真实首次灰度和 14 天观察证据；v1.0.0 仍必须等待墙钟观察完成。

## Release Gate Security Signoff Evidence Predicate

- 审计结论：本片把 Security signoff 证据复核从 anchored SIGNED 行扩展为签字人、签字时间、自评、Attack Chain 和 evidence 字段级判定，避免空签字包关闭总闸门。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 后先红灯，失败点为总审计脚本缺 `Test-SecuritySignoffEvidencePass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，Security signoff 报告写 `Status: SIGNED` / `Decision: SIGNED` 但 Signer、SignedAt 和 Evidence 为空；总审计输出 `EXPECTED_FAIL`，且只卡 `Security signoff`。
- 合法样本：Security signoff 报告包含 SIGNED 状态、Signer、可解析 `SignedAt`、`Automated Self-Assessment`、`Attack Chain A/B/C` 和 evidence 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只加固总审计判定，不替代真人签字；正式安全签字包仍是 `UNSIGNED`，v1.0.0 仍不能发布。

## Hosted CI GitHub Actions RunUrl/RunId Gate

- 审计结论：本片把 Hosted CI 证据从“RunUrl/RunId 非空”加固为“RunUrl 是 GitHub Actions run URL 且 RunId 是数字”，避免弱远端证据关闭 hosted CI gate。
- 红绿证据：新增 `HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId` 后先红灯，失败点为 hosted CI 脚本缺 `Test-GitHubActionsRunUrl`；修复后目标门 `1/1 passed`。
- 单项负例：`run-hosted-ci-evidence.ps1` 传入 `RunUrl=https://example.com/run/1`、`RunId=abc`、job summary 存在时仍输出 `EXPECTED_FAIL`，报告包含 URL 和 RunId 格式 violation。
- 总闸门负例：其它四个临时证据包均合法，Hosted CI 报告写 `Result: PASS` 但 URL/RunId 格式非法时，总审计输出 `EXPECTED_FAIL`，且只卡 `Hosted CI`。
- 合法样本：Hosted CI 报告包含 `https://github.com/acme/aimes/actions/runs/123456789` 和 `RunId: 123456789` 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只校验证据格式，不生成真实 GitHub Actions run；正式 hosted CI 报告仍因缺真实授权环境证据保持 fail loud。

## Release Gate Staging Health HTTP Success Predicate

- 审计结论：本片把 PostgreSQL/staging health 证据从“出现 Health /live 和 Health /ready 标签”加固为“两个 health 段落均包含 HTTP 2xx/3xx”，避免失败健康检查文本关闭 staging gate。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequireStagingHealthHttpSuccessEvidence` 后先红灯，失败点为总审计脚本缺 `Test-StagingHealthEndpointPass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，staging 报告包含旧 required token 和 4 个 `Exit code: 0`，但 `## Health /live` / `## Health /ready` 段落均为 `HTTP 500`；总审计输出 `EXPECTED_FAIL`，且只卡 `PostgreSQL/staging`。
- 合法样本：staging 报告的 `/live` 与 `/ready` 段落均为 `HTTP 200` 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只加固总审计判定，不证明当前机器完成 staging rehearsal；正式报告仍因 Docker 不可用保持 fail loud。

## Release Gate Attack Chain Per-Section Evidence Predicate

- 审计结论：本片把 Attack Chain A/B/C 证据复核从“计数满足 3 条 PASS/evidence”加固为“A、B、C 三个段落各自 PASS 且各自有 evidence”。
- 红绿证据：新增 `ReleaseGateAudit_ShouldRequirePerAttackChainSectionEvidence` 后先红灯，失败点为总审计脚本缺 `Test-AttackChainSectionPass`；修复后目标门 `1/1 passed`。
- 动态负例：五个临时证据包中其它四项均 PASS，Attack Chain 报告在 A 段重复三条 PASS/evidence，但 B/C 段 evidence 为空；总审计输出 `EXPECTED_FAIL`，且只卡 `Attack Chain A/B/C`。
- 合法样本：Attack Chain A、B、C 三段分别包含 `Manual verification: PASS` 和非空 `Evidence` 时，临时总审计输出 `EXPECTED_PASS`。
- 验证边界：本片只加固总审计判定，不替代真人执行 Attack Chain A/B/C；正式报告仍是待人工验证。

## Gray Observation OBSERVING Single-Gate Fail Loud

- 审计结论：本片修复 gray observation 单项脚本在 `OBSERVING` 状态下可能输出 PASS 的问题，避免观察中证据包误显示可关闭。
- 红绿证据：新增 `GrayObservationGate_ShouldFailWhileObservationIsStillRunning` 后先红灯，失败点为脚本缺少 `Status -eq "OBSERVING"` fail-loud；修复后目标门 `1/1 passed`。
- 动态负例：`Status=OBSERVING` 且 GrayReleaseId、GrayStartedAt、Evidence 均有值时，单项脚本输出 `EXPECTED_FAIL`，报告包含 `Gray observation is still running.`。
- 合法样本：`Status=PASS`、14 天窗口、P0/P1=0 和 evidence 齐全时，单项脚本输出 `EXPECTED_PASS`。
- 验证边界：本片只修复单项证据状态，不制造真实首次灰度和 14 天观察；正式 gray report 仍为 `NOT_STARTED`。

## Hosted CI gh run Evidence Gate

- 审计结论：本片修复 hosted CI 单项脚本允许手填 RunUrl/RunId/job summary 绕过 `gh run list` 失败的问题。
- 红绿证据：新增 `HostedCiEvidence_ShouldRequireGhRunListSuccessEvenWhenRunFieldsAreSupplied` 后先红灯，失败点为脚本缺少 `gh run list must succeed...` fail-loud token；修复后目标门 `1/1 passed`。
- 动态负例：传入合法 GitHub Actions RunUrl、数字 RunId 和 `job summary: all required jobs passed` 时，若 `gh run list` 不可查询，脚本仍输出 `EXPECTED_FAIL`。
- 回归证据：正式 `hosted-ci-20260602.md` 已刷新为 `Result: FAIL`；`HostedCiEvidence|ReleaseGateAudit` 架构过滤 `12/12 passed`；`run-hosted-ci-evidence.ps1` 与 `run-release-gate-audit.ps1` parser 均 `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只证明脚本不会接受弱 CI 证据，不替代真实 hosted runner 执行；v1.0.0 hosted CI gate 仍未关闭。

## Staging Migration Connection Evidence

- 审计结论：本片修复 staging rehearsal 报告只写 API 容器连接串、未写明 EF migration 实际连接串的问题。
- 红绿证据：新增 `StagingRehearsal_ShouldReportActualMigrationConnectionString` 后先红灯，失败点为脚本缺少 `$migrationConnectionString`；修复后目标门 `1/1 passed`。
- 动态证据：正式 `staging-rehearsal-20260602-local.md` 刷新后仍因 Docker 不可用 `EXPECTED_FAIL`，但报告头已同时显示 `ConnectionStrings__DefaultConnection: Host=postgresql...` 和 `Migration connection string: Host=localhost...`。
- 回归证据：`StagingRehearsal|ReleaseGateAudit` 架构过滤 `12/12 passed`；`run-staging-rehearsal.ps1` 与 `run-release-gate-audit.ps1` parser 均 `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只提升证据精度，不替代真实 Docker/PostgreSQL/staging rehearsal；v1.0.0 staging gate 仍未关闭。

## Attack Chain Placeholder Evidence Gate

- 审计结论：本片修复 Attack Chain 单项脚本把 `TBD` / `PENDING` / `待补` 这类占位 evidence 当成非空证据的问题。
- 红绿证据：新增 `AttackChainManualVerification_ShouldRejectPlaceholderEvidence` 后先红灯，失败点为脚本缺少 `Test-RealEvidence`；修复后目标门 `1/1 passed`。
- 动态负例：Verifier、VerifiedAt 和 A/B/C PASS 全给齐，但 evidence 分别为 `TBD`、`待补`、`PENDING` 时，脚本仍输出 `EXPECTED_FAIL`，三段均写入 `Evidence cannot be a placeholder.`。
- 回归证据：正式 `attack-chain-verification-20260602.md` 已刷新为 `Result: FAIL`；`AttackChain|ReleaseGateAudit` 架构过滤 `12/12 passed`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只证明占位人工证据不会被接受，不替代真人验证；Attack Chain A/B/C 和安全签字仍未关闭。

## Release Gate Security Signoff Placeholder Evidence Predicate

- 审计结论：本片修复总 release gate 对 Security signoff signer/evidence 只判非空的问题，避免 `TBD` 占位签字包被视为有效签字。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 后先红灯，失败点为总审计脚本缺 `Test-RealEvidence`；修复后目标门 `1/1 passed`。
- 动态负例：其它四个 gate 全部 PASS，Security signoff 为 SIGNED 但 `Signer: TBD`、`Evidence: TBD` 时，总审计 `EXPECTED_FAIL` 且只卡 Security signoff。
- 合法样本：Signer 和 Evidence 都为具体非占位值时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`SecuritySignoff|ReleaseGateAudit` 架构过滤 `11/11 passed`；`run-release-gate-audit.ps1` parser `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只加固总审计，不替代真人签字；正式 20260602 安全签字包仍为 `UNSIGNED`。

## Release Gate Attack Chain Placeholder Evidence Predicate

- 审计结论：本片修复总 release gate 对 Attack Chain verifier/evidence 只判非空的问题，避免绕过单项脚本后用占位证据关闭 Attack Chain gate。
- 红绿证据：收紧 `ReleaseGateAudit_ShouldRequireAttackChainHumanEvidenceFields` 后先红灯，失败点为总审计脚本未在 Attack Chain predicate 内调用 `Test-RealEvidence`；修复后目标门 `1/1 passed`。
- 动态负例：其它四个 gate 全部 PASS，Attack Chain 为 VERIFIED 且 A/B/C PASS，但 `Verifier: TBD`、三段 evidence 为占位词时，总审计 `EXPECTED_FAIL` 且只卡 Attack Chain。
- 合法样本：Verifier 和 A/B/C Evidence 都为具体非占位值时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`AttackChain|ReleaseGateAudit` 架构过滤 `12/12 passed`；`run-release-gate-audit.ps1` parser `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只加固总审计，不替代真人 Attack Chain A/B/C 验证；正式报告仍为 `PENDING_MANUAL_VERIFICATION`。

## Hosted CI Job Summary Placeholder Evidence Gate

- 审计结论：本片修复 hosted CI 单项和总审计接受占位 job summary 的问题。
- 红绿证据：扩展 hosted CI 架构门后先红灯，失败点为单项脚本缺 `Test-RealEvidence`，总审计未拒绝 `job summary: TBD`；修复后目标过滤 `2/2 passed`。
- 动态负例：单项脚本 `Evidence=TBD` 时 `EXPECTED_FAIL`；总审计其它四项 PASS、Hosted CI `Evidence: job summary: TBD` 时 `EXPECTED_FAIL` 且只卡 Hosted CI。
- 合法样本：Hosted CI evidence 为 `job summary: ci/eval/build jobs passed on hosted runner` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`HostedCi|ReleaseGateAudit` 架构过滤 `13/13 passed`；`run-hosted-ci-evidence.ps1` 和 `run-release-gate-audit.ps1` parser 均 `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只加固证据判定，不生成真实 hosted CI run；正式 hosted CI 报告仍缺远端 runner 证据。

## Gray Observation Placeholder Evidence Gate

- 审计结论：本片修复 gray observation 单项和总审计接受占位 evidence 的问题。
- 红绿证据：扩展 gray observation 架构门后先红灯，失败点为单项脚本缺 `Test-RealEvidence`；修复后目标过滤 `12/12 passed`。
- 动态负例：单项脚本所有 PASS 条件满足但 `Evidence=TBD` 时 `EXPECTED_FAIL`；总审计其它四项 PASS、Gray observation `Evidence: TBD` 时 `EXPECTED_FAIL` 且只卡 Gray observation。
- 合法样本：Gray observation evidence 为具体 dashboard/incident query 记录时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：正式 `gray-observation-20260602.md` 已刷新为 `NOT_STARTED` / `Result: FAIL`；`run-gray-observation.ps1` 和 `run-release-gate-audit.ps1` parser 均 `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只加固证据判定，不启动首次灰度，也不替代 14 天观察窗口。

## Release Gate Hosted CI gh run Section Exit Code Predicate

- 审计结论：本片修复 Hosted CI 总闸门按全报告统计 `Exit code: 0` 的问题，避免非 `gh run` 段落成功误替代远端 run 查询成功。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后先红灯，失败点为缺 `Test-SectionExitCodeZero`；修复后目标门 `1/1 passed`。
- 动态负例：Hosted CI 报告里 `git ls-remote` 为 `Exit code: 0`，但 `## gh run` 为 `Exit code: 1`，其它四项 PASS 时，总审计 `EXPECTED_FAIL` 且只卡 Hosted CI。
- 合法样本：`## gh run` 段落内 `Exit code: 0` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`HostedCi|ReleaseGateAudit` 架构过滤 `13/13 passed`；`run-release-gate-audit.ps1` parser `parse ok`；正式总审计仍 `EXPECTED_FAIL`。
- 验证边界：本片只加固总审计判定，不提供真实 GitHub Actions run。

## Release Gate Staging Section Exit Code Predicate

- 审计结论：本片修复 PostgreSQL/staging 总闸门按全报告统计 `Exit code: 0` 的问题，避免无关段落成功误替代 Docker、依赖启动、EF migration 或 API 启动成功。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireStagingRehearsalEvidenceFields` 后先红灯，失败点为缺 staging 四段 `Test-SectionExitCodeZero` 调用；修复后目标门 `1/1 passed`。
- 动态负例：staging 四个关键段落均为 `Exit code: 1`，无关段落提供 4 个 `Exit code: 0`，其它四项 PASS 时，总审计 `EXPECTED_FAIL` 且只卡 PostgreSQL/staging。
- 合法样本：Docker version、Start external dependencies、Apply EF migrations、Start API 四段各自 `Exit code: 0` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`run-release-gate-audit.ps1` parser `parse ok`；后续需用 staging/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固总审计判定，不提供真实 Docker/PostgreSQL/staging rehearsal。

## Release Gate Security Signoff Blocking Text Predicate

- 审计结论：本片修复 Security signoff 总闸门只看签字字段和标题存在的问题，避免签字包正文仍保留阻断状态时被视为有效签字。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireSecuritySignoffEvidenceFields` 后先红灯，失败点为缺 `Test-NoBlockingSecuritySignoffText`；修复后目标门 `1/1 passed`。
- 动态负例：其它四项 PASS，Security signoff 已写 `SIGNED`，但 Attack Chain 段落仍写 `PENDING` / `FAIL` 时，总审计 `EXPECTED_FAIL` 且只卡 Security signoff。
- 合法样本：签字包清除 `PENDING` / `FAIL` / `UNSIGNED` 阻断语义且 signer/time/evidence 齐全时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`run-release-gate-audit.ps1` parser `parse ok`；后续需用 security/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固签字包自洽性，不替代真人安全签字。

## Hosted CI Exact RunUrl Predicate

- 审计结论：本片修复 Hosted CI RunUrl 前缀匹配过宽的问题，避免尾随路径伪装成精确 GitHub Actions run URL。
- 红绿证据：扩展 `HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId` 后先红灯，失败点为单项脚本缺尾部锚定正则；修复后目标门 `1/1 passed`。
- 动态负例：其它四项 PASS，Hosted CI `RunUrl` 为 `.../actions/runs/123456/extra` 时，总审计 `EXPECTED_FAIL` 且只卡 Hosted CI。
- 合法样本：Hosted CI `RunUrl` 精确为 `.../actions/runs/123456` 且 RunId/job summary/gh run 证据齐全时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：两个 PowerShell 脚本 parser 均 `parse ok`；后续需用 hosted/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固 URL 形态，不提供真实 hosted runner 证据。

## Hosted CI RunUrl RunId Consistency Predicate

- 审计结论：本片修复 Hosted CI RunUrl 与 RunId 各自合法但可错配的问题，避免证据包指向两个不同 run。
- 红绿证据：扩展 `HostedCiEvidence_ShouldRequireGitHubActionsRunUrlAndNumericRunId` 后先红灯，失败点为缺 `Test-GitHubActionsRunUrlMatchesRunId`；修复后目标门 `1/1 passed`。
- 动态负例：其它四项 PASS，Hosted CI `RunUrl` 末尾 run id 为 `123456` 但 `RunId` 为 `999999` 时，总审计 `EXPECTED_FAIL` 且只卡 Hosted CI。
- 合法样本：RunUrl 末尾数字与 RunId 同为 `123456` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：两个 PowerShell 脚本 parser 均 `parse ok`；后续需用 hosted/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固字段一致性，不提供真实 hosted runner 证据。

## Hosted CI gh run Output RunId Predicate

- 审计结论：本片修复 Hosted CI 总审计只看 `gh run` exit code、不确认该段输出含目标 RunId 的问题。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后先红灯，失败点为缺 `Test-SectionContainsText`；修复后目标门 `1/1 passed`。
- 动态负例：其它四项 PASS，Hosted CI 字段全部合法且一致，但 `## gh run` 段落只含其它 run id 时，总审计 `EXPECTED_FAIL` 且只卡 Hosted CI。
- 合法样本：`## gh run` 段落含当前 `RunId` 且 `Exit code: 0` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`run-release-gate-audit.ps1` parser `parse ok`；后续需用 hosted/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固 CLI 输出和字段证据绑定，不提供真实 hosted runner 证据。

## Hosted CI gh run RunId Number Token Predicate

- 审计结论：本片修复 `gh run` 段落 RunId 绑定使用普通字符串包含的问题，避免长数字子串误匹配目标 RunId。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireHostedCiRemoteRunEvidenceFields` 后先红灯，失败点为缺 `Test-SectionContainsNumberToken`；修复后目标门 `1/1 passed`。
- 动态负例：其它四项 PASS，Hosted CI `RunId=123456`，但 `## gh run` 段落只有 `91234567` 时，总审计 `EXPECTED_FAIL` 且只卡 Hosted CI。
- 合法样本：`## gh run` 段落含独立数字 token `123456` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`run-release-gate-audit.ps1` parser `parse ok`；后续需用 hosted/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固 RunId 解析精度，不提供真实 hosted runner 证据。

## Hosted CI Single-Gate gh run RunId Predicate

- 审计结论：本片修复 hosted CI 单项脚本只要求 `gh run list` 成功、不确认输出包含目标 RunId 的问题。
- 红绿证据：扩展 `HostedCiEvidence_ShouldRequireGhRunListSuccessEvenWhenRunFieldsAreSupplied` 后先红灯，失败点为缺 `Test-TextContainsNumberToken`；修复后目标门 `1/1 passed`。
- 动态负例：临时 `gh.cmd` 输出 `999999 completed success` 且 exit code 0，RunUrl/RunId/job summary 均合法时，单项脚本 `EXPECTED_FAIL` 并写入 `gh run list output must include RunId.`。
- 合法样本：临时 `gh.cmd` 输出 `123456 completed success` 时，单项脚本输出 `READY_FOR_RELEASE_REVIEW` / `Result: PASS`。
- 回归证据：`run-hosted-ci-evidence.ps1` parser `parse ok`；后续需用 hosted/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固单项证据判定，不提供真实 hosted runner 证据。

## Gray Observation Future End Time Gate

- 审计结论：本片修复 gray observation 单项脚本和总审计只计算窗口长度、不拒绝未来结束时间的问题。
- 红绿证据：扩展 gray observation 单项和总审计架构门后先红灯，失败点为缺 `ObservationEndedAt must not be in the future.`；修复后目标过滤 `2/2 passed`。
- 动态负例：`ObservationStartedAt` 和 `ObservationEndedAt` 都在未来且间隔超过 14 天时，单项脚本和总审计均 `EXPECTED_FAIL`。
- 合法样本：观察开始/结束均在过去、窗口超过 14 天且 P0/P1=0/evidence 齐全时，单项脚本和总审计均 `EXPECTED_PASS`。
- 回归证据：`run-gray-observation.ps1` 与 `run-release-gate-audit.ps1` parser 均 `parse ok`；后续需用 gray/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只保护墙钟窗口不能被未来时间提前关闭，不启动真实灰度观察。

## Gray Observation Timeline Ordering Gate

- 审计结论：本片修复 gray observation 单项脚本和总审计不校验灰度开始时间与观察开始时间顺序的问题。
- 红绿证据：扩展 gray observation 单项和总审计架构门后先红灯，失败点为缺 `GrayStartedAt must not be after ObservationStartedAt.`；修复后目标过滤 `2/2 passed`。
- 动态负例：`GrayStartedAt` 晚于 `ObservationStartedAt` 时，单项脚本和总审计均 `EXPECTED_FAIL`。
- 合法样本：`GrayStartedAt <= ObservationStartedAt <= ObservationEndedAt`，且过去满 14 天、P0/P1=0/evidence 齐全时，单项脚本和总审计均 `EXPECTED_PASS`。
- 回归证据：`run-gray-observation.ps1` 与 `run-release-gate-audit.ps1` parser 均 `parse ok`；后续需用 gray/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只保护时间线自洽，不启动真实灰度观察。

## Gray Observation Anchored P0/P1 Counts Gate

- 审计结论：本片修复 gray observation 总审计用全报告 `Contains` 判断 P0/P1=0 的问题，避免备注文本伪装真实计数字段。
- 红绿证据：扩展 `ReleaseGateAudit_ShouldRequireGrayObservationWindowEvidenceFields` 后先红灯，失败点为缺 `Test-AnchoredLiteralLine`；修复后目标门 `1/1 passed`。
- 动态负例：真实计数字段为 `P0=1; P1=0`，但 Notes 中写入 `P0/P1 incident counts: P0=0; P1=0` 时，总审计 `EXPECTED_FAIL` 且只卡 Gray observation。
- 合法样本：独立计数字段为 `P0=0; P1=0` 时，临时总审计输出 `EXPECTED_PASS`。
- 回归证据：`run-release-gate-audit.ps1` parser `parse ok`；后续需用 gray/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固总审计字段锚定，不启动真实灰度观察。

## Gray Observation GrayReleaseId Placeholder Gate

- 审计结论：本片修复 gray observation 单项脚本和总审计只要求 `GrayReleaseId` 非空的问题，避免占位 ID 关闭灰度证据。
- 红绿证据：扩展 gray observation 单项和总审计架构门后先红灯，失败点为缺 `GrayReleaseId cannot be a placeholder.` 和 `GrayReleaseId` 的 `Test-RealEvidence`；修复后目标过滤 `2/2 passed`。
- 动态负例：`GrayReleaseId=TBD` 且其它 PASS 条件齐全时，单项脚本和总审计均 `EXPECTED_FAIL`。
- 合法样本：`GrayReleaseId=gray-001` 且其它条件齐全时，单项脚本和总审计均 `EXPECTED_PASS`。
- 回归证据：`run-gray-observation.ps1` 与 `run-release-gate-audit.ps1` parser 均 `parse ok`；后续需用 gray/release gate 过滤和正式总审计做最终回归。
- 验证边界：本片只加固灰度 ID 证据质量，不启动真实灰度观察。

## Attack Chain Future VerifiedAt Gate

- 审计结论：本片修复 Attack Chain 单项脚本和总审计只解析 `VerifiedAt`、不拒绝未来时间的问题。
- 红绿证据：扩展 Attack Chain 单项和总审计架构门后先红灯，失败点为缺 `VerifiedAt must not be in the future.`；修复后 `AttackChain|ReleaseGateAudit` 过滤 `12/12 passed`。
- 动态负例：Verifier、A/B/C PASS 和 evidence 都齐全，但 `VerifiedAt` 在未来时，单项脚本和总审计均 `EXPECTED_FAIL`。
- 合法样本：`VerifiedAt` 在过去且其它条件齐全时，单项脚本和总审计均 `EXPECTED_PASS`。
- 回归证据：`run-attack-chain-verification.ps1` 与 `run-release-gate-audit.ps1` parser 均 `parse ok`；后续需用正式总审计做最终回归。
- 验证边界：本片只保护人工验证时间不能提前，不替代真人 Attack Chain A/B/C 验证。

## Project Core Convention Boutique Existing Features

- 审计结论：根目录 `AGENTS.md` 已落地精品级现有功能约定，作为 12 条规则前的项目级约束。
- 影响：后续选片不能只按“还能新增什么”推进；必须优先把现有用户关键功能的正确性、UX、可靠性、可观测性和测试证据打磨扎实。
- 验证边界：本片为规则文本变更，未触碰业务代码；测试不适用。B 轨发布闸门仍需真实外部/人工证据。

## Release Gate Security Signoff Future SignedAt Gate

- 审计结论：Security signoff 总审计现在拒绝未来 `SignedAt`，避免用尚未发生的签字时间关闭安全签字闸门。
- 证据：架构门已要求 `SignedAt must not be in the future.` 和 `UtcNow`；脚本中 `SignedAt` 解析后进入 `hasSignedAtNotFuture` predicate。
- 动态负例：其它四个 release gate 均 PASS，Security signoff 字段为 SIGNED 但 `SignedAt` 在未来时，总审计 `EXPECTED_FAIL` 且只卡 Security signoff。
- 合法样本：`SignedAt` 改为过去时间且其它证据完整时，临时总审计 `EXPECTED_PASS`。
- 验证边界：本片不替代真人签字；正式 20260602 安全签字包仍按真实外部/人工证据决定。

## Release Gate Security Signoff Future SignedAt Violation Detail

- 审计结论：总审计报告现在会显式输出 `SignedAt must not be in the future.`，不再只给出泛化 Security signoff FAIL。
- 红绿证据：新增架构 token 后先红灯，缺口为 `violations.Add($futureSignedAtMessage)`；补脚本后目标架构门通过。
- 动态证据：未来 `SignedAt` 样本报告包含具体 violation；过去 `SignedAt` 完整样本仍为 `Result: PASS`。
- 风险判断：改动只增加失败原因输出，不放宽任何 gate predicate；对合法样本无影响。
- 验证边界：该片是审计输出质量提升，正式 release gate 仍必须依赖真实 signer、evidence 和外部/人工证据。
