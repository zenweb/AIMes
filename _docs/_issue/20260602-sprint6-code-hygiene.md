# 2026-06-02 Sprint 6 Code Hygiene Issues

## ScheduleFeedbackPanel Sync Note 缺少状态播报语义

- 现象：调度员采纳 Agent 推荐后，`.sync-note` 会显示 `反馈已同步后台`，但辅助技术无法把该变化识别为状态更新。
- 红灯：`schedule-board.test.ts` 新增用例 `announces schedule feedback sync status as a polite update`，失败于 `expected undefined to be 'status'`。
- 影响：反馈同步成功是排产审计和模型复盘闭环中的关键状态；缺少 `role="status"` 会降低键盘/读屏用户对后台同步结果的感知。
- 修复：`ScheduleFeedbackPanel.vue` 为 `.sync-note` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `4/4 passed`；相邻组合 `27/27 passed`；lint、full unit、coverage 均通过。
- 状态：A 轨已修复；B 轨发布闸门仍未关闭。

## 发布闸门仍需外部证据

- hosted CI 缺真实远端 PASS run URL / run id / job summary。
- PostgreSQL/staging 缺真实 PASS rehearsal。
- Attack Chain A/B/C 缺人工验证。
- security signoff 尚需完整签字。
- 首次灰度和 14 天无 P0/P1 观察窗口尚未完成。

## AuditDecisionReplayPanel Approval Badge 缺少状态播报语义

- 现象：配置审批数据异步加载后，`.approval-badge` 会从 `0 个配置待审批` 变化为实际待审批数量，但辅助技术无法把该变化识别为状态更新。
- 红灯：`audit-decision-replay-panel.test.ts` 扩展审批列表用例后，失败于 `expected undefined to be 'status'`。
- 影响：审计 reviewer 需要及时感知关键配置待审批数量；缺少 `role="status"` 会降低读屏用户对审批队列变化的感知。
- 修复：`AuditDecisionReplayPanel.vue` 为 `.approval-badge` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `3/3 passed`；相邻审计测试 `7/7 passed`；lint 通过。
- 状态：A 轨已修复；B 轨发布闸门仍未关闭。

## B 轨发布证据 2026-06-02 仍为 FAIL

- Hosted CI：`_docs/_reports/hosted-ci-20260602.md` 记录 `Result: FAIL`，缺远端 `RunUrl` / `RunId`；当前环境 `git ls-remote origin` 失败，`gh run list` 未登录。
- PostgreSQL/staging：`_docs/_reports/staging-rehearsal-20260602-local.md` 记录 `Result: FAIL`，失败于本机缺少 `docker` 命令。
- Attack Chain：`_docs/_reports/attack-chain-verification-20260602.md` 记录 `Result: FAIL`，A/B/C 仍为 `PENDING` 且缺人工证据。
- Gray observation：`_docs/_reports/gray-observation-20260602.md` 记录 `Result: FAIL`，状态为 `NOT_STARTED`。
- 影响：这些缺口直接阻止 v1.0.0 发布完成；A 轨覆盖率和 a11y 绿灯不能替代这些证据。
- 状态：继续 fail loud；不得标记长期 goal complete。

## B 轨发布闸门缺少单一总审计入口

- 现象：hosted CI、staging、Attack Chain、安全签字和灰度观察分别有报告，但缺少一个聚合报告说明 v1.0.0 是否能关闭发布闸门。
- 红灯：`ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 失败于 `scripts/run-release-gate-audit.ps1 is required...`。
- 修复：新增 `scripts/run-release-gate-audit.ps1`，读取五个证据包并生成 `_docs/_reports/release-gate-audit-20260602.md`。
- 当前结果：总报告为 `Result: FAIL`，五个 B 轨闸门均未关闭。
- 状态：总审计入口已建立；发布闸门仍未通过。

## Security signoff 包日期滞后

- 现象：2026-06-02 的聚合发布闸门报告已经刷新，但安全签字证据仍默认指向 `_docs/_review/20260601-security-signoff.md`。
- 红灯：架构门失败于缺 `_docs/_review/20260602-security-signoff.md`，且聚合脚本缺 `20260602-security-signoff` token。
- 修复：新增 `_docs/_review/20260602-security-signoff.md`，并让 `scripts/run-release-gate-audit.ps1` 默认读取当天签字包。
- 当前结果：签字包仍为 `UNSIGNED`，聚合报告仍为 `Result: FAIL`。
- 状态：日期一致性已修复；安全签字闸门仍未关闭。

## 聚合报告未区分证据包存在性与闸门通过状态

- 现象：`release-gate-audit-20260602.md` 原本只列 evidence packet 路径和 Gate Status，无法直接看出证据包文件是否真实落盘。
- 红灯：架构门失败于缺 `Evidence packet status`。
- 修复：聚合报告增加 `Evidence packet status` 列和 `FOUND` / `MISSING` 图例。
- 当前结果：五个证据包均为 `FOUND`，五个发布闸门仍为 `FAIL`。
- 状态：审计可读性已修复；发布闸门仍未关闭。

## 20260602 自动安全自评 npm audit 阻断

- 现象：首次运行 `_docs/_reports/security-self-assessment-20260602-local.md` 失败于 `npm audit`，报告显示 `vitest` / `@vitest/coverage-v8` critical advisory。
- 影响：自动安全自评无法作为 2026-06-02 的 PASS 证据；安全签字包只能引用旧的 20260601 自评。
- 修复：升级 direct `vite`、`vitest`、`@vitest/coverage-v8` 到可解析且通过 audit 的版本。
- 当前结果：`npm audit` 为 `found 0 vulnerabilities`；安全自评报告刷新为 `Result: PASS`。
- 状态：自动安全自评阻断已修复；人工 Attack Chain 和签字仍未完成。

## AuditDecisionReplayPanel POC 签署回放缺少业务证据入口

- 现象：POC 复盘签署记录进入审计回放后，详情能展示评分、证据批次、签署人和审计编号，但没有可点击入口回到报表中心复核签署证据。
- 红灯：`audit-decision-replay-panel.test.ts` 新增 POC 签署用例后失败于 `Unable to get .trace-link`。
- 影响：reviewer 能看到签署文本，但无法从审计回放直接跳到报表中心证据上下文，签字证据链路不够闭环。
- 修复：`mapPocReviewSignoffToReplay` 为 POC 签署回放增加 `/report` route 和 `报表中心` routeLabel，并携带审计对象与 trace query。
- 验证：目标审计组合 `11/11 passed`；coverage 最终 `70 files / 256 tests passed`。
- 状态：A 轨已修复；B 轨安全签字仍需 Attack Chain A/B/C 人工验证和 human signer。

## Vitest 4 coverage 暴露测试夹具不兼容

- 现象：升级 Vitest 后，`npm run test:unit:coverage` 首次失败于 `scanner-board.test.ts`、`notifications.store.test.ts`、`offline-demo-mode.test.ts`。
- 根因：`Html5Qrcode` 与 `Notification` mock 使用箭头函数，Vitest 4 下不能作为 `new` 构造器；另外相关测试未显式设置 `BASE_URL=/scheduling/`。
- 修复：将两个构造器 mock 改成 function 构造器；在 `offline-demo-mode.test.ts` 和 `notifications.store.test.ts` 中用 `vi.stubEnv('BASE_URL', '/scheduling/')` 对齐 Nuxt/Vitest base。
- 验证：红点组合 `9/9 passed`；`npm run test:unit:coverage` 最终 `70 files / 256 tests passed`。
- 状态：测试基线已恢复；未发现需要修改生产逻辑的问题。

## GanttChart 轻量 marker 缺少列表语义

- 现象：offline/demo 轻量甘特模式会渲染 `.gantt-e2e-markers` 和 `.gantt_task_line`，但辅助技术无法把这些任务 marker 识别为任务列表。
- 红灯：`gantt-chart.test.ts` 失败于 `expected undefined to be 'list'`，证明容器缺 `role="list"`。
- 影响：轻量甘特是 demo/offline 和测试环境下验证排产任务可见性的入口；缺少列表语义会降低读屏用户理解任务集合的能力。
- 修复：轻量 marker 容器增加 `role="list"` / `aria-label="轻量甘特图任务"`；任务 marker 增加 `role="listitem"` / `aria-label="甘特任务：<task.text>"`。
- 验证：目标测试 `1/1 passed`；相邻排产组合 `12/12 passed`；lint 通过；coverage `71 files / 257 tests passed`。
- 状态：A 轨已修复；真实 dhtmlx 拖拽交互仍可作为后续独立测试切片。

## ChatPanel 缺少 modal dialog 语义和输入框可访问名称

- 现象：AI 生产助手打开后 `.chat-panel` 视觉上是浮层面板，但缺少 `role="dialog"`、`aria-modal` 和标题关联；输入框只有 placeholder，没有稳定可访问名称。
- 红灯：`chat-panel.test.ts` 失败于 `expected undefined to be 'dialog'`，证明面板没有 dialog 角色。
- 影响：读屏用户难以识别当前进入的是模态助手面板，也难以通过稳定名称理解输入区用途；该入口位于主布局右下角，属于高频用户路径。
- 修复：`ChatPanel.vue` 增加 modal dialog 语义、标题 `id` 关联和 `textarea` 的 `aria-label`。
- 验证：目标测试 `1/1 passed`；相邻 `main-layout.test.ts` `1/1 passed`；lint 通过；coverage `72 files / 258 tests passed`。
- 状态：A 轨已修复；ChatPanel 深层动作执行、导出和知识引用分支仍需后续独立测试切片。

## ScheduleAgentWorkbenchPanel 动作反馈缺少状态播报语义

- 现象：调度员点击 `生成后端建议` 后，`.agent-action-note` 会显示生成结果，但辅助技术无法把该变化识别为状态更新。
- 红灯：`schedule-agent-workbench-panel.test.ts` 失败于 `expected undefined to be 'status'`，证明动作反馈缺少状态角色。
- 影响：后端建议生成、采纳或拒绝结果是 AI 排产工作台的关键操作反馈；缺少 `role="status"` 会降低读屏用户对 Agent 动作结果的感知。
- 修复：`ScheduleAgentWorkbenchPanel.vue` 为 `.agent-action-note` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；lint 通过；coverage `73 files / 259 tests passed`。
- 状态：A 轨已修复；真实后端 Agent 决策 API、权限和审计落库仍需后续独立验证。

## QualityCapaTaskPanel 待验证数量缺少状态播报语义

- 现象：质量 CAPA 面板顶部 `.status-badge` 会显示 `3 个待验证`，但辅助技术无法把 CAPA 队列数量识别为状态更新。
- 红灯：`quality-capa-task-panel.test.ts` 失败于 `expected undefined to be 'status'`，证明待验证数量 badge 缺少状态角色。
- 影响：质量工程师进入 CAPA 闭环时需要第一时间知道待验证数量；缺少 `role="status"` 会降低读屏用户对 CAPA 队列状态的感知。
- 修复：`QualityCapaTaskPanel.vue` 为 `.status-badge` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `1/1 passed`；相邻质量测试 `5/5 passed`；lint 通过；coverage `74 files / 260 tests passed`。
- 状态：A 轨已修复；CAPA 深层推进、正式 CAPA 转换和知识复用回写仍需后续独立测试切片。

## ParetoCompare 多目标方案对比浮层缺少 dialog 语义

- 现象：多目标方案对比打开后 `.compare-container` 视觉上是模态浮层，但缺少 `role="dialog"`、`aria-modal`、标题关联和关闭按钮可访问名称。
- 红灯：`pareto-compare.test.ts` 失败于 `expected undefined to be 'dialog'`，证明浮层没有 dialog 角色。
- 影响：调度员在对比交期、利用率、换线和综合平衡方案时，读屏用户难以识别当前上下文已进入模态方案对比面板。
- 修复：`ParetoCompare.vue` 为浮层容器增加 dialog 语义、标题 id 关联，并为关闭按钮增加 `aria-label`。
- 验证：目标测试 `1/1 passed`；相邻 `schedule-board.test.ts` `4/4 passed`；lint 通过；coverage `75 files / 261 tests passed`。
- 状态：A 轨已修复；多目标优化数据加载、demo fallback、方案采用和甘特渲染仍需后续独立测试切片。

## EquipmentScheduleImpactPanel 设备故障同步结果缺少状态播报语义

- 现象：设备故障排产影响面板点击 `标记故障并同步排产` 后，`.sync-note` 会显示同步结果，但辅助技术无法把该变化识别为状态更新。
- 红灯：`equipment-schedule-impact-panel.test.ts` 失败于 `expected undefined to be 'status'`，证明同步结果缺少状态角色。
- 影响：设备停机事件同步 AI 排产和 OTD 证据链是瓶颈保护关键反馈；缺少 `role="status"` 会降低读屏用户对同步结果的感知。
- 修复：`EquipmentScheduleImpactPanel.vue` 为 `.sync-note` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `1/1 passed`；相邻设备测试 `10/10 passed`；lint 通过；coverage `76 files / 262 tests passed`。
- 状态：A 轨已修复；客户故障样例生成、异常分流维护单和真实后台同步仍需后续独立测试切片。

## ChatPanel 消息区缺少消息日志语义

- 现象：AI 生产助手消息区 `.chat-messages` 只作为普通容器渲染，对话更新没有 `log` 或 live region 语义。
- 红灯：`chat-panel.test.ts` 新增消息区用例后失败于 `expected undefined to be 'log'`，证明消息列表缺少日志角色。
- 影响：读屏用户进入 AI 生产助手后，难以把新增助手回复识别为持续更新的对话日志；该入口位于主布局高频路径。
- 修复：`ChatPanel.vue` 为 `.chat-messages` 增加 `role="log"`、`aria-live="polite"` 和 `aria-label="AI 生产助手消息"`。
- 验证：目标测试 `2/2 passed`；相邻布局测试 `1/1 passed`；lint 通过；coverage `76 files / 263 tests passed`。
- 状态：A 轨已修复；真实发送、权限拒绝、报表导出和异常处置卡生成仍需后续独立测试切片。

## FeedbackForm 提交失败缺少 alert 播报语义

- 现象：排产方案采纳反馈提交失败时，`.error-msg` 会显示错误文案，但辅助技术无法把失败识别为需要立即感知的错误提示。
- 红灯：`feedback-form.test.ts` 修正 Teleport 夹具后失败于 `Unable to get [role="alert"]`，证明错误提示缺少 alert 角色。
- 影响：调度员提交采纳反馈失败后，读屏用户可能无法及时感知反馈未写入，影响排产调整原因和 Agent 改进闭环。
- 修复：`FeedbackForm.vue` 为 `.error-msg` 增加 `role="alert"` 和 `aria-live="assertive"`，并使用 `errorMessage` 统一提取异常文案。
- 验证：目标测试 `1/1 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `77 files / 264 tests passed`。
- 状态：A 轨已修复；真实后端落库、审计留痕和 Agent 决策联动仍需后续独立验证。

## DocumentUpload 客户工单导入结果缺少状态播报语义

- 现象：点击 `生成客户工单导入样例` 后，导入批次、30 单样例和高风险识别结果会更新，但辅助技术无法把该变化识别为状态更新。
- 红灯：`document-upload.test.ts` 失败于 `expected undefined to be 'status'`，证明 `.import-metrics` 缺少状态角色。
- 影响：客户真实工单导入样例是 POC 数据缺口和验收证据入口；缺少状态播报会降低读屏用户对导入证据生成结果的感知。
- 修复：`DocumentUpload.vue` 为 `.import-metrics` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `3/3 passed`；相邻知识治理测试 `2/2 passed`；lint 通过；coverage `77 files / 265 tests passed`。
- 状态：A 轨已修复；真实 ERP 文件解析、后台证据落库和验收签字链仍需后续独立验证。

## ParetoCompare fallback 推荐方案缺少状态播报语义

- 现象：后端批量优化失败后，多目标对比会回退到 demo 方案并显示推荐方案，但辅助技术无法把推荐方案变化识别为状态更新。
- 红灯：`pareto-compare.test.ts` 失败于 `expected undefined to be 'status'`，证明 `.recommend-card` 缺少状态角色。
- 影响：调度员需要在 fallback 场景下仍能识别推荐方案并采用；缺少播报会降低读屏用户对推荐方案生成结果的感知。
- 修复：`ParetoCompare.vue` 为 `.recommend-card` 增加 `role="status"` 和 `aria-live="polite"`。
- 验证：目标测试 `2/2 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `77 files / 266 tests passed`。
- 状态：A 轨已修复；真实后端批量优化、设备瓶颈读取和甘特交互仍需后续独立验证。

## ChatPanel 参考来源展开控件不可键盘聚焦

- 现象：AI 生产助手发送问题并渲染后端参考来源后，`.sources-toggle` 使用 `span` 承载点击展开，视觉上像控件但没有原生按钮语义。
- 红灯：`chat-panel.test.ts` 发送 `当前产能如何？` 后，回答和 `参考来源 (1)` 已出现，但失败于 `Unable to get button.sources-toggle`，证明来源展开控件不是可聚焦按钮。
- 影响：键盘和读屏用户难以自然展开知识检索来源，削弱 AI 助手回答可追溯性；该路径是主布局高频入口里的核心问答路径。
- 修复：`ChatPanel.vue` 将来源开关改为 `button type="button"`，增加 `aria-expanded`，并保留原展开逻辑。
- 验证：目标测试 `3/3 passed`；相邻布局测试 `1/1 passed`；lint 通过；coverage `77 files / 267 tests passed`。
- 状态：A 轨已修复；权限拒绝、报表导出、异常处置卡生成、引用治理和全部助手动作分支仍需后续独立验证。B 轨发布闸门仍全部 FAIL。

## GanttChart 真实拖拽冲突路径缺少测试覆盖

- 现象：`GanttChart.vue` 已实现 dhtmlx `onAfterTaskDrag` 冲突检测，但此前单测只覆盖轻量甘特 marker，真实拖拽结束后的同设备重叠路径缺少自动化证据。
- 红灯：新增真实 dhtmlx 分支测试时先失败于测试夹具，`isOfflineDemoMode()` 读取不完整 `localStorage` 导致 `localStorage.clear/getItem is not a function`；这说明旧测试无法稳定进入目标路径。
- 影响：排产员拖拽工单造成同设备时间重叠时，需要稳定发出冲突事件和错误提示；缺少测试会让后续改动更容易破坏该关键保护。
- 修复：测试 hoist dhtmlx mock 并记录事件 handler，mock offline demo 判定为 false；新增断言覆盖 `taskDragConflict`、`taskDragEnd`、错误消息和 render。
- 验证：目标测试 `2/2 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `77 files / 268 tests passed`。
- 状态：A 轨已补覆盖；生产代码无需修改。真实浏览器拖拽、scale 切换、锁定期边界和视觉渲染仍需后续独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 成功上传路径缺少测试覆盖

- 现象：`DocumentUpload.vue` 已实现待上传文件调用 `uploadDocument`、标记已上传并插入上传记录，但此前单测只覆盖文件选择、拒绝文件和客户工单导入样例。
- 红灯/GREEN：新增成功上传用例后目标测试直接通过，说明缺口是自动化证据不足，不是生产逻辑缺陷。
- 影响：知识文档上传是 RAG 入库和治理队列入口；缺少测试会让 API payload、队列状态或历史记录插入被后续改动破坏时不易发现。
- 修复：测试 hoist `uploadDocument` mock，新增 PDF 成功上传断言，覆盖 API 调用、`已上传` 状态、文件名、分块数和后端状态展示。
- 验证：目标测试 `4/4 passed`；相邻知识治理测试 `2/2 passed`；lint 通过；coverage `77 files / 269 tests passed`。
- 状态：A 轨已补覆盖；生产代码无需修改。真实后端 multipart 上传、分块索引质量、治理签字和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 后端扫码成功后未选中工单

- 现象：现场扫码命中后端工序时，组件只设置 `currentOperations` 并返回；由于右侧工序列表依赖 `selectedWo`，用户仍看到 `选择工单或扫码开始`。
- 红灯：新增 `production-board.test.ts` 用例后，`scanOperation('WO-020-OP-20', 'operator1')` 已成功返回 `WO-020 / OP-20`，但测试失败于 `Unable to get .detail-title-row h3`。
- 影响：扫码成功却不定位到工单/工序，会让现场操作员误以为扫码无效，削弱生产执行必经路径和后续开工/完工入口。
- 修复：后端扫码成功后按 `workOrderId` 或 `workOrderNumber` 匹配当前页工单，设置 `selectedWo`，清空扫码输入，并通过成功通知播报 `已定位工序：WO-020 / OP-20`。
- 验证：目标测试 `4/4 passed`；相邻扫码证据/生产异常测试 `12/12 passed`；lint 通过；coverage `77 files / 270 tests passed`。
- 状态：A 轨已修复；真实扫码枪、后端扫码接口、开工/完工、资质拦截和条码证据链仍需后续独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 采购单确认后左侧列表仍显示旧状态

- 现象：已提交采购单确认成功后，右侧详情显示 `已确认`，但左侧活动订单仍可能显示刷新列表返回的旧 `已提交` 状态。
- 红灯：新增 `purchase-board.test.ts` 用例后，`confirmPurchaseOrder('po-b')` 返回 `Confirmed`，但测试失败于 `expected '已提交' to be '已确认'`。
- 影响：采购员确认订单后，同一屏幕出现两个状态，会削弱采购主流程反馈可信度，也容易误导后续收货入口判断。
- 修复：`handleConfirm()` 在确认和刷新后，用当前 `selected` 详情覆盖 `orders` 中同一订单的摘要字段，保证详情和列表一致。
- 验证：目标测试 `3/3 passed`；相邻采购短缺同步测试 `9/9 passed`；lint 通过；coverage `77 files / 271 tests passed`。
- 状态：A 轨已修复；真实采购后端最终一致性、ERP 同步、收货入库和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## GanttToolbar 操作按钮缺少显式非提交类型

- 现象：排产工具栏五个操作按钮没有 `type="button"`，在表单上下文中会继承 HTML 默认 submit 行为。
- 红灯：新增 `gantt-toolbar.test.ts` 后失败于 `expected undefined to be 'button'`，证明按钮类型未显式声明。
- 影响：排产优化、刷新、采纳反馈、多目标对比或导出按钮若被复用到表单布局中，可能误触发表单提交，干扰调度员主操作路径。
- 修复：为五个工具栏操作按钮增加 `type="button"`，并测试五个命令事件和两个选择器更新事件。
- 验证：目标测试 `1/1 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `78 files / 272 tests passed`。
- 状态：A 轨已修复；真实排产优化、导出文件、多目标对比和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleMetrics 排产 KPI 条缺少状态播报语义

- 现象：排产首页 KPI 条会展示设备利用率、准交率、换线时间和批次组数，但容器只是普通 `div`，指标变化无法作为状态更新播报。
- 红灯：新增 `schedule-metrics.test.ts` 后失败于 `expected undefined to be 'status'`，证明 `.metrics-bar` 缺少状态角色。
- 影响：调度员依赖首屏 KPI 判断优化效果；读屏用户可能无法及时感知排产指标变化。
- 修复：为 `.metrics-bar` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="排产指标"`。
- 验证：目标测试 `1/1 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `79 files / 273 tests passed`。
- 状态：A 轨已修复；真实指标准确性、后端优化结果、A/B 报告和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleRecoveryHandoffPanel 执行包交接缺少状态播报语义

- 现象：交期恢复执行包出现时，面板会展示急单恢复、责任动作、Agent 建议和人工反馈，但容器缺少状态更新语义。
- 红灯：新增 `schedule-recovery-handoff-panel.test.ts` 后失败于 `expected undefined to be 'status'`，证明 `.recovery-handoff-panel` 缺少状态角色。
- 影响：调度员需要及时感知跨模块交期恢复执行包；读屏用户可能无法把新出现的执行包识别为可操作的状态更新。
- 修复：为 `.recovery-handoff-panel` 增加 `role="status"` 和 `aria-live="polite"`，并测试闭环按钮发出 `close-handoff`。
- 验证：目标测试 `1/1 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `80 files / 274 tests passed`。
- 状态：A 轨已修复；真实执行包生成、采购/质量闭环、OTD 证据链和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleEventQueuePanel 当前 Agent 建议缺少状态播报语义

- 现象：排产事件队列生成 Agent 建议后，`.agent-suggestion` 会展示当前建议、推荐方案包和采纳按钮，但没有状态更新语义。
- 红灯：新增 `schedule-event-queue-panel.test.ts` 后失败于 `expected undefined to be 'status'`，证明 `.agent-suggestion` 缺少状态角色。
- 影响：调度员依赖当前建议决定是否采纳重排；读屏用户可能无法及时感知建议变化。
- 修复：为 `.agent-suggestion` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="当前 Agent 建议"`，并测试 `generate` / `adopt` 事件。
- 验证：目标测试 `1/1 passed`；相邻排产主页面测试 `4/4 passed`；lint 通过；coverage `81 files / 275 tests passed`。
- 状态：A 轨已修复；真实建议生成、后端反馈写入、OTD 证据链和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## KnowledgeGovernancePanel 过期风险数量缺少状态播报语义

- 现象：知识治理面板顶部 `.risk-badge` 会显示过期风险数量，但辅助技术无法把该数量识别为状态更新。
- 红灯：扩展 `knowledge-governance-panel.test.ts` 后失败于 `expected undefined to be 'status'`，证明 `.risk-badge` 缺少状态角色。
- 影响：知识库过期风险是治理 reviewer 进入页面后的关键状态；缺少 `role="status"` 会降低读屏用户对风险数量变化的感知。
- 修复：为 `.risk-badge` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="知识库过期风险数量"`。
- 验证：目标测试 `2/2 passed`；相邻 `document-upload.test.ts` `4/4 passed`；lint 通过；coverage `81 files / 275 tests passed`。
- 状态：A 轨语义质量已修复；该片无有意义覆盖率增量，后续不应继续围绕同一组件做模板微调。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 上传失败队列行缺少 alert 播报语义

- 现象：知识文档上传 API 失败时，队列行会显示错误文案，但辅助技术无法把该单文件失败识别为需要立即感知的错误。
- 红灯：扩展 `document-upload.test.ts`，mock `uploadDocument` 抛出 `索引服务不可用` 后失败于 `expected undefined to be 'alert'`，证明 `.status-err` 缺少 alert 角色。
- 影响：上传失败是 RAG 入库和知识治理队列的关键失败路径；读屏用户可能无法及时知道文件没有进入索引和治理历史。
- 修复：为 `.status-err` 增加 `role="alert"` 和 `aria-live="assertive"`。
- 验证：目标测试 `5/5 passed`；相邻知识治理测试 `2/2 passed`；lint 通过；coverage `81 files / 276 tests passed`。
- 状态：A 轨已修复；真实上传服务、分块索引、治理签字和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 开工 API 失败后仍推进本地状态

- 现象：现场点击确认开工时，如果 `startOperation` 后端调用失败，前端仍把工序和工单从待生产推进到生产中。
- 红灯：扩展 `production-board.test.ts`，mock `startOperation` 抛出 `设备 CNC-002 已被占用` 后失败于 `expected '生产中' to be '待生产'`。
- 影响：设备占用或开工落库失败时，界面误报“生产中”会误导操作员继续报工，也可能污染后续完工、质量门和 OTD 证据链。
- 修复：`confirmStart()` 在开工 API 异常时显示 `开工失败：...` alert 并提前返回，不再推进本地状态或写入开工追踪。
- 验证：目标测试 `5/5 passed`；相邻扫码证据/生产异常测试 `12/12 passed`；lint 通过；coverage `81 files / 277 tests passed`。
- 状态：A 轨已修复；真实设备占用、开工落库、扫码证据和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 完工 API 失败后仍推进本地完工

- 现象：现场点击确认完工时，如果 `completeOperation` 后端调用失败，前端仍把生产中工序推进到已完成，并继续准备质量联动和 OTD 证据。
- 红灯：扩展 `production-board.test.ts`，mock `completeOperation` 抛出 `质检结果未同步` 后失败于 `expected '已完成' to be '生产中'`。
- 影响：完工落库或质检同步失败时，界面误报“已完成”会污染工单进度、质量门、生产复核和 OTD 复盘证据链。
- 修复：`confirmComplete()` 在完工 API 异常时显示 `完工失败：...` alert 并提前返回，不再推进本地完工或写入后续证据。
- 验证：目标测试 `6/6 passed`；相邻扫码证据/生产异常测试 `12/12 passed`；lint 通过；coverage `81 files / 278 tests passed`。
- 状态：A 轨已修复；真实完工 API、质检同步、条码完工和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 异常上报 API 失败前已写本地证据

- 现象：现场点击异常上报时，如果 `reportException` 后端调用失败，前端已经先写入本地生产异常事件和后续 OTD 证据链。
- 红灯：扩展 `production-board.test.ts`，mock `reportException` 抛出 `异常服务不可用` 后失败于 `writeProductionAnomalyEvent` 已被调用。
- 影响：异常服务未接收事件时，本地却显示异常已进入处置队列，会污染排产风险、异常管理和 OTD 复盘证据。
- 修复：`confirmException()` 先等待 `reportException` 成功；失败时显示 `异常上报失败：...` alert 并提前返回，不再写本地异常或 OTD 证据。
- 验证：目标测试 `7/7 passed`；相邻扫码证据/生产异常测试 `12/12 passed`；lint 通过；coverage `81 files / 279 tests passed`。
- 状态：A 轨已修复；真实异常管理服务、扫码异常证据和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 取消 API 失败后仍推进本地取消

- 现象：采购员点击取消采购单时，如果 `cancelPurchaseOrder` 后端调用失败，前端仍把已确认采购单推进为 `已取消`。
- 红灯：扩展 `purchase-board.test.ts`，mock `cancelPurchaseOrder('po-a')` 抛出 `供应商已发运，禁止取消` 后失败于 `expected '已取消' to be '已确认'`。
- 影响：后端拒绝取消时界面误报“已取消”，会误导采购员停止跟进已发运订单，也可能影响后续收货、供应风险和审计状态判断。
- 修复：`handleCancel()` 在取消 API 异常时显示 `取消失败：...` alert 并提前返回，不再推进本地状态或刷新列表。
- 验证：目标测试 `4/4 passed`；相邻采购短缺同步测试 `9/9 passed`；lint 通过；coverage `81 files / 280 tests passed`。
- 状态：A 轨已修复；真实 ERP/供应商取消事务、收货入库和发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard coverage 全量运行时 Gantt 异步 CSS teardown error

- 现象：全量 `npm run test:unit:coverage` 首次运行时，`81 files / 280 tests` 的测试断言均通过，但 Vitest 捕获 3 个 `EnvironmentTeardownError`，指向 `GanttChart.vue` 在环境销毁后加载 `gantt-overrides.css`。
- 根因：`ScheduleBoard.vue` 使用 `defineAsyncComponent` loader 动态导入真实 `GanttChart.vue`；`schedule-board.test.ts` 的 global stub 不足以阻止异步模块加载，coverage 并发时可能在 teardown 后才解析 CSS。
- 修复：`schedule-board.test.ts` 顶层 mock `../../src/components/gantt/GanttChart.vue`，让排产主页面单测完全隔离真实 dhtmlx/CSS 加载。
- 验证：`schedule-board.test.ts` `4/4 passed`；随后全量 coverage `81 files / 280 tests passed` 且 exit 0。
- 状态：测试隔离已修复；真实 `GanttChart.vue` 仍由 `gantt-chart.test.ts` 独立覆盖，不由 `schedule-board.test.ts` 隐式加载。

## ChatPanel 权限拒绝消息缺少 alert 播报语义

- 现象：Planner 用户点击 Admin-only 的 `生成交期恢复执行包` 后，助手会显示 `动作已拒绝`，并写入拒绝审计，但消息只是普通 assistant message。
- 红灯：扩展 `chat-panel.test.ts` 后，拒绝文案已出现、`recordAssistantActionAudit(permitted: false)` 已调用、路由未跳转，但失败于 `Unable to get .message.assistant[role="alert"]`。
- 影响：动作权限拒绝是 AI 助手安全边界；缺少 alert 播报会让读屏用户无法及时感知高风险动作未执行。
- 修复：为 `ChatMessage` 增加可选 `liveRole`，权限拒绝路径传入 `alert`，模板按消息级 `liveRole` 渲染 `role="alert"` 和 `aria-live="assertive"`。
- 验证：目标测试 `4/4 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 281 tests passed`。
- 状态：A 轨已修复；真实服务端授权、全部助手动作和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 导出 OTD 复盘完成消息缺少状态播报语义

- 现象：AI 助手点击 `导出 OTD 复盘` 后会生成 CSV、触发下载并跳转报表中心，但完成提示只是普通 assistant message。
- 红灯：扩展 `chat-panel.test.ts` 后，CSV Blob、anchor click、`URL.revokeObjectURL('blob:otd-report')`、`router.push('/report')` 和成功审计都已发生，但失败于 `Unable to get .message.assistant[role="status"]`。
- 影响：报表导出是 POC/OTD 复盘证据出口；读屏用户需要明确感知导出动作已完成并已跳到报表中心。
- 修复：`ChatMessage.liveRole` 支持 `status`，普通动作完成消息以 `role="status"` / `aria-live="polite"` 渲染。
- 验证：目标测试 `5/5 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 282 tests passed`。
- 状态：A 轨已修复；真实报表数据、浏览器下载保存和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 超大文件拒绝路径缺少防回归覆盖

- 现象：生产代码已有 50MB 上限校验和 alert 播报，但此前没有单测证明受支持扩展的大文件会在上传前被拒绝。
- 绿灯：新增 `document-upload.test.ts` 后直接通过；测试构造 `51MB` PDF，确认出现 `文件过大 (最大 50MB): 大型质量手册.pdf`。
- 影响：缺少该覆盖时，后续改动可能让大文件进入队列或触发上传 API，造成前端队列误导、后端 multipart 压力或索引任务污染。
- 修复：仅补测试，断言超大文件不会进入 `.file-queue`，`.btn-upload` 保持 disabled，`uploadDocument` 未被调用。
- 验证：目标测试 `6/6 passed`；相邻知识治理测试 `2/2 passed`；lint 通过；coverage `81 files / 283 tests passed`。
- 状态：A 轨 coverage-only 已完成；真实网关/后端上传体积限制、索引服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 收货 API 失败后静默关闭弹窗

- 现象：采购员确认收货时，如果 `receivePurchaseOrder` 后端调用失败，前端 catch 后仍关闭收货弹窗并刷新列表，没有给出失败原因。
- 红灯：扩展 `purchase-board.test.ts`，mock `receivePurchaseOrder` 抛出 `收货数量超过剩余未收数量` 后失败于 `expected false to be true`，证明失败后弹窗已关闭。
- 影响：后端拒绝收货时，采购员可能误以为收货已处理完成；若后续刷新仍返回旧快照，会造成采购/仓储状态判断混乱。
- 修复：`handleReceive()` 在收货失败时显示 `收货失败：...` alert 并提前返回，保留收货弹窗、订单状态和已收数量。
- 验证：目标测试 `5/5 passed`；相邻采购短缺同步测试 `9/9 passed`；lint 通过；coverage `81 files / 284 tests passed`。
- 状态：A 轨已修复；真实 ERP/仓储收货事务、库存入库和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## QualityCapaTaskPanel CAPA 验证完成消息缺少状态播报语义

- 现象：执行中 CAPA 点击推进后会写入 `writeQualityCapaClosure` 并显示“已同步到审计回放与 OTD 复盘”，但该完成消息只是普通段落。
- 红灯：扩展 `quality-capa-task-panel.test.ts` 后失败于 `expected undefined to be 'status'`，证明 `.closure-sync-message` 缺少状态角色。
- 影响：CAPA 验证完成是质量闭环和 OTD 复盘的关键出口；读屏用户可能无法及时感知任务已经完成并同步审计。
- 修复：为 `.closure-sync-message` 增加 `role="status"` 和 `aria-live="polite"`，同时用测试锁定 `writeQualityCapaClosure` 的核心 payload。
- 验证：目标测试 `2/2 passed`；相邻 CAPA 同步测试 `4/4 passed`；lint 通过；coverage `81 files / 285 tests passed`。
- 状态：A 轨已修复；真实质量审计持久化、OTD 报表链路和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 知识问答失败被离线演示回答静默掩盖

- 现象：`queryKnowledge` 抛错时，AI 助手直接显示离线演示回答，没有告诉用户真实知识问答服务不可用。
- 红灯：扩展 `chat-panel.test.ts`，mock `queryKnowledge` 抛出 `RAG 服务不可用` 后失败于 `Unable to get .message.assistant[role="alert"]`。
- 影响：RAG/LLM 后端不可用时，用户可能把演示回答误认为真实检索结果，削弱知识问答和生产决策可信度。
- 修复：catch 分支使用 `errorMessage()` 归一化失败原因，在演示回答前追加降级说明，并以 `role="alert"` / `aria-live="assertive"` 播报。
- 验证：目标测试 `6/6 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 286 tests passed`。
- 状态：A 轨已修复；真实 RAG 服务、知识库准确性和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 异常处置卡创建完成消息缺少状态播报语义

- 现象：Admin 点击 `创建异常处置卡` 后，组件会写入异常处置包、跳转异常管理并写成功审计，但完成消息不是 status。
- 红灯：扩展 `chat-panel.test.ts` 后失败于 `Unable to get .message.assistant[role="status"]`，证明成功动作反馈缺少状态播报。
- 影响：异常处置卡创建是 AI 助手把聊天意图转成现场异常/风险/排产/OTD 证据的关键动作；读屏用户可能无法及时感知动作已完成。
- 修复：`create_anomaly_card` 成功分支传入 `liveRole='status'`，并用测试锁定写包、路由、成功审计和动作包卡片内容。
- 验证：目标测试 `7/7 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 287 tests passed`。
- 状态：A 轨已修复；真实异常中心、风险队列、排产复核和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 工程约束复核包创建完成消息缺少状态播报语义

- 现象：Admin 点击 `生成工程约束复核包` 后，组件会写入工程约束复核包、跳转工艺路线并写成功审计，但完成消息不是 status。
- 红灯：扩展 `chat-panel.test.ts` 后失败于 `Unable to get .message.assistant[role="status"]`，证明成功动作反馈缺少状态播报。
- 影响：工程约束复核包会把 BOM、ECN、工艺路线和 AI 排产约束串到 OTD 证据链；读屏用户可能无法及时感知动作已完成。
- 修复：`engineering_constraint_package` 成功分支传入 `liveRole='status'`，并用测试锁定写包、路由、成功审计和动作包卡片内容。
- 验证：目标测试 `8/8 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 288 tests passed`。
- 状态：A 轨已修复；真实 BOM/工艺路线后端、排产复核、OTD 证据链和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 客户交付恢复承诺包创建完成消息缺少状态播报语义

- 现象：Admin 点击 `生成客户交付恢复承诺包` 后，组件会写入 OTD KPI 承诺包、跳转报表中心并写成功审计，但完成消息不是 status。
- 红灯：扩展 `chat-panel.test.ts` 后失败于 `Unable to get .message.assistant[role="status"]`，证明成功动作反馈缺少状态播报。
- 影响：客户交付恢复承诺包是验收/客户复盘出口；读屏用户可能无法及时感知承诺包已生成并进入报表复核。
- 修复：`customer_commitment_package` 成功分支传入 `liveRole='status'`，并用测试锁定写包、路由、成功审计和动作包卡片内容。
- 验证：目标测试 `9/9 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 289 tests passed`。
- 状态：A 轨已修复；真实客户验收口径、报表中心、OTD 证据链和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel BOM 展开齐套检查包创建完成消息缺少状态播报语义

- 现象：Admin 点击 `生成 BOM 展开齐套检查包` 后，组件会写入齐套包、同步 OTD 证据链、跳转 BOM 管理并写成功审计，但完成消息不是 status。
- 红灯：扩展 `chat-panel.test.ts` 后失败于 `Unable to get .message.assistant[role="status"]`，证明成功动作反馈缺少状态播报。
- 影响：BOM 齐套检查包是缺料、替代料和排产窗口复核出口；读屏用户可能无法及时感知齐套包已生成并进入 BOM/库存复核。
- 修复：`bom_kitting_package` 成功分支传入 `liveRole='status'`，并用测试锁定路由、成功审计和动作包卡片内容。
- 验证：目标测试 `10/10 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 290 tests passed`。
- 状态：A 轨已修复；真实 BOM/库存/采购/工程确认链路和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 设备停机复核包创建完成消息缺少状态播报语义

- 现象：Admin 点击 `生成设备停机复核包` 后，组件会写入设备停机事件、同步 OTD 证据链、跳转设备维护并写成功审计，但完成消息不是 status。
- 红灯：扩展 `chat-panel.test.ts` 后失败于 `Unable to get .message.assistant[role="status"]`，证明成功动作反馈缺少状态播报。
- 影响：设备停机复核包是瓶颈设备保护、换设备/加班/拆单建议和风险处置入口；读屏用户可能无法及时感知停机包已生成并进入设备复核。
- 修复：`equipment_downtime_package` 成功分支传入 `liveRole='status'`，并用测试锁定路由、成功审计和动作包卡片内容。
- 验证：目标测试 `11/11 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 291 tests passed`。
- 状态：A 轨已修复；真实设备维护、AI 排产、风险处置和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 交期恢复执行包创建完成消息缺少状态播报语义

- 现象：Admin 点击 `生成交期恢复执行包` 后，组件会写入交期恢复执行包、跳转 AI 排产并写成功审计，但完成消息不是 status。
- 红灯：扩展 `chat-panel.test.ts` 后失败于 `Unable to get .message.assistant[role="status"]`，证明成功动作反馈缺少状态播报。
- 影响：交期恢复执行包是排产、风险、采购和质量责任动作的跨模块出口；读屏用户可能无法及时感知执行包已生成并进入排产复核。
- 修复：`delivery_recovery_package` 成功分支传入 `liveRole='status'`，并用测试锁定写包、路由、成功审计和动作包卡片内容。
- 验证：目标测试 `12/12 passed`；相邻主布局测试 `1/1 passed`；lint 通过；coverage `81 files / 292 tests passed`。
- 状态：A 轨已修复；真实 AI 排产、风险、采购、质量闭环和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## GanttChart 轻量甘特任务条无法打开详情

- 现象：`VITE_SHOW_DEMO_HINTS=true` 或离线演示模式下，轻量甘特任务条会显示工单文本，但点击或键盘 Enter 不会触发父级任务详情事件。
- 红灯：扩展 `gantt-chart.test.ts` 后失败于 `expected undefined to deeply equal [["task-1"], ["task-1"]]`，证明 `taskClick` 没有发出。
- 影响：调度员在演示/离线兜底模式可看到甘特任务，却无法进入工单解释和详情检查，削弱排产视图作为主工作台的可用性。
- 修复：轻量 `.gantt_task_line` 增加可聚焦语义，并在点击/Enter 时通过 `emitLightweightTaskClick()` 发出 `taskClick`。
- 验证：目标测试 `3/3 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `7/7 passed`；lint 通过；coverage `81 files / 293 tests passed`。
- 状态：A 轨已修复；真实 dhtmlx 渲染、后端排产数据和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## GanttChart 进行中且跨锁定期任务仍可被拖拽

- 现象：锁定期拖拽保护只判断 `taskStart <= lockEnd && taskStart > lockStart`，已经开始但仍横跨当前锁定窗口的任务不会被拦截。
- 红灯：扩展 `gantt-chart.test.ts` 后，`07:30` 开始、当前 `08:00`、锁定 8 小时、持续 1 天的任务触发 `onBeforeTaskDrag` 时返回 `true`，失败于 `expected true to be false`。
- 影响：进行中的现场承诺任务可能被拖出锁定窗口，破坏调度冻结期和班组执行稳定性。
- 修复：计算 `taskEnd`，用任务区间与锁定区间是否重叠作为拖拽阻断条件。
- 验证：目标测试 `4/4 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `8/8 passed`；lint 通过；coverage `81 files / 294 tests passed`。
- 状态：A 轨已修复；真实 dhtmlx 浏览器拖拽、后端重排事务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## GanttChart 初始 scale prop 被忽略

- 现象：`GanttChart` 初始挂载时先固定配置为 day，`scale` watcher 没有 immediate，因此传入 `scale="week"` 或 `scale="month"` 时首屏仍按日视图初始化。
- 红灯：扩展 `gantt-chart.test.ts` 后，`scale="week"` 场景失败于 `expected 'day' to be 'week'`。
- 影响：调度员从周/月视图进入排产主视图时，初始 dhtmlx 配置与工具栏状态不一致，可能造成首屏视图跳变或误读排产粒度。
- 修复：`gantt.init()` 后立即调用既有 `setScale(props.scale)` 应用初始 scale。
- 验证：目标测试 `5/5 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `9/9 passed`；lint 通过；coverage `81 files / 295 tests passed`。
- 状态：A 轨已修复；真实浏览器渲染、后端排产数据和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 工单详情接口失败被 demo 详情静默掩盖

- 现象：调度员点击甘特任务时，如果 `getWorkOrderById` 后端调用失败，组件会构造 demo 工单并清空 `detailError`，详情面板没有告诉用户真实详情加载失败。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `getWorkOrderById` 抛出 `work order API unavailable`，失败于 `expected '' to contain '工单详情加载失败'`。
- 影响：调度员可能把本地 demo 详情误认为真实工单详情，削弱排产解释、工单状态和现场执行判断的可信度。
- 修复：失败时继续显示本地排产解释兜底，但 `detailError` 明确写入后端失败原因。
- 验证：目标测试 `5/5 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `10/10 passed`；lint 通过；coverage `81 files / 296 tests passed`。
- 状态：A 轨已修复；真实工单后端、排产服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 反馈同步失败缺少后端原因

- 现象：调度员采纳 Agent 推荐后，如果 `submitAdoptionFeedback` 后端调用失败，页面只显示 `后台反馈接口不可用，当前先保留本地复盘记录用于演示。`，没有暴露具体失败原因。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `submitAdoptionFeedback` 抛出 `feedback API unavailable`，失败于 `expected ... to contain 'feedback API unavailable'`。
- 影响：单人 review 时难以判断反馈闭环失败是权限、网络、服务不可用还是数据问题；审计复盘也缺少现场可见原因。
- 修复：失败提示追加 `原因：${errorMessage(...)}`，同时继续保留本地复盘记录。
- 验证：目标测试 `6/6 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `11/11 passed`；lint 通过；coverage `81 files / 297 tests passed`。
- 状态：A 轨已修复；真实反馈后端、审计入库和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 成功优化后仍显示上一轮失败横幅

- 现象：调度员首次点击智能优化失败后，第二次优化成功并显示新方案时，页面仍保留上一轮 `optimizer unavailable` 错误横幅。
- 红灯：扩展 `schedule-board.test.ts` 后，先让 `optimizeSchedule` reject，再让下一次 resolve 新 plan，失败于成功后仍能找到 `[role="alert"]`。
- 影响：调度员可能误以为新排产方案仍失败或不可用，削弱智能优化结果和 warning/status 提示的可信度。
- 修复：`handleOptimize()` 在成功应用 `result.plan` 后清空旧的 `error.value`。
- 验证：目标测试 `7/7 passed`；相邻 `schedule-board.test.ts + gantt-chart.test.ts` `12/12 passed`；lint 通过；coverage `81 files / 298 tests passed`。
- 状态：A 轨已修复；真实优化服务、排产事务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleAgentWorkbench 后端建议失败未用 alert 播报

- 现象：调度员点击 `生成后端建议` 时，如果 `recommendAgentDecision` 失败，页面显示失败文案但仍用 `role="status"` / polite 语义。
- 红灯：扩展 `schedule-agent-workbench-panel.test.ts` 后，mock 后端建议生成失败，断言 `.agent-action-note.error` 应为 alert，失败于 `expected 'status' to be 'alert'`。
- 影响：读屏用户可能把失败反馈当作普通状态更新，错过 Agent 决策入口不可用这一阻断信息。
- 修复：动作提示根据 `actionError` 切换为 `role="alert"` / `aria-live="assertive"`；成功消息仍保持 status/polite。
- 验证：目标测试 `2/2 passed`；相邻 `schedule-agent-workbench-panel.test.ts + schedule-board.test.ts` `9/9 passed`；lint 通过；coverage `81 files / 299 tests passed`。
- 状态：A 轨已修复；真实 Agent 后端、权限、审计和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## BomBoard 爆炸接口异步失败不会进入本地兜底

- 现象：BOM 详情点击 `爆炸展开` 时，如果 `explodeBom` 返回 rejected Promise，页面不会显示本地 demo 展开树，并产生未处理异步错误。
- 红灯：扩展 `bom-board.test.ts` 后，mock `explodeBom` 抛出 `bom explosion API unavailable`，失败于找不到 `.explosion-section`，同时 Vitest 捕获 unhandled rejection。
- 影响：计划员在 BOM 后端短暂不可用时看不到物料展开，库存齐套、替代料评估和排产约束复核入口会断掉。
- 修复：`handleExplode()` 改为 `async/await` 捕获异步失败，并在 catch 中设置 `demoExplosion(selected.value)`。
- 验证：目标测试 `2/2 passed`；相邻 `bom-board.test.ts + shortage-risk-sync.test.ts` `11/11 passed`；lint 通过；coverage `81 files / 300 tests passed`。
- 状态：A 轨已修复；真实 BOM 后端、库存齐套和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 工单列表接口失败静默显示 demo 数据

- 现象：生产报工页加载工单列表时，如果 `getWorkOrders` 后端调用失败，页面直接显示本地 demo 工单，没有提示真实接口不可用。
- 红灯：扩展 `production-board.test.ts` 后，mock `getWorkOrders` 抛出 `work-order API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：现场操作员可能把 `WO-001` 等本地演示工单当作真实生产任务，导致扫码、开工和完工判断失真。
- 修复：`loadWorkOrders()` catch 分支在 `loadDemoData()` 后用 error notification 暴露 `生产工单加载失败，已显示本地演示工单：...`。
- 验证：目标测试 `8/8 passed`；相邻 `production-board.test.ts + production-anomaly-sync.test.ts` `13/13 passed`；lint 通过；coverage `81 files / 301 tests passed`。
- 状态：A 轨已修复；真实生产工单后端、现场扫码和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 确认成功后列表刷新失败静默

- 现象：采购员确认已提交采购单时，`confirmPurchaseOrder` 成功更新右侧详情后，如果随后的 `getPurchaseList` 刷新失败，页面没有提示左侧列表可能仍是旧状态。
- 红灯：扩展 `purchase-board.test.ts` 后，mock 第二次 `getPurchaseList` 抛出 `purchase list refresh unavailable`，失败于找不到 `[role="alert"]`。
- 影响：采购员可能看到右侧详情为已确认，但左侧订单列表仍停留在刷新前状态，造成采购协同状态判断不一致。
- 修复：`refreshList()` catch 分支保留本地列表状态，同时以 alert 暴露 `采购订单列表刷新失败...` 和后端失败原因。
- 验证：目标测试 `6/6 passed`；相邻 `purchase-board.test.ts + shortage-risk-sync.test.ts` `15/15 passed`；lint 通过；coverage `81 files / 302 tests passed`。
- 状态：A 轨已修复；真实采购后端、供应商状态同步和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 初始列表加载失败静默显示 demo 数据

- 现象：采购管理页首屏加载时，如果 `getPurchaseList` 后端调用失败，页面直接显示本地 demo 采购单，没有提示真实接口不可用。
- 红灯：扩展 `purchase-board.test.ts` 后，mock 首轮 `getPurchaseList` 抛出 `purchase list API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：采购员可能把 `PO-20260501` 等本地演示采购单当作真实采购列表，影响确认、收货和供应风险判断。
- 修复：初始加载 catch 分支在写入 `demoOrders` 后用 alert 暴露 `采购订单列表加载失败，已显示本地演示采购单：...`。
- 验证：目标测试 `7/7 passed`；相邻 `purchase-board.test.ts + shortage-risk-sync.test.ts` `16/16 passed`；lint 通过；coverage `81 files / 303 tests passed`。
- 状态：A 轨已修复；真实采购后端、供应商状态同步和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## InventoryBoard 初始库存列表失败静默显示 demo 数据

- 现象：库存管理页首屏加载时，如果 `getInventoryList` 后端调用失败，页面直接显示本地 demo 物料，没有提示真实库存接口不可用。
- 红灯：扩展 `inventory-board.test.ts` 后，mock `getInventoryList` 抛出 `inventory list API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：仓库/计划用户可能把本地演示库存当作真实库存，影响齐套、领料、安全库存和缺料判断。
- 修复：库存列表 catch 分支在写入 `demoItems` 后用 alert 暴露 `库存列表加载失败，已显示本地演示物料：...`。
- 验证：目标测试 `2/2 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `12/12 passed`；lint 通过；coverage `81 files / 304 tests passed`。
- 状态：A 轨已修复；真实库存后端、仓库事务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## InventoryBoard 交易记录失败静默显示 demo 流水

- 现象：库存管理页选择物料时，如果 `getStockTransactions` 后端调用失败，页面直接显示本地 demo 交易记录，没有提示真实交易流水不可用。
- 红灯：扩展 `inventory-board.test.ts` 后，mock `getStockTransactions` 抛出 `stock transactions API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：仓库/计划用户可能把本地演示交易当作真实出入库追溯，影响库存余额、领料和采购入库判断。
- 修复：交易记录 catch 分支在写入当前物料 demo 交易后用 alert 暴露 `库存交易记录加载失败，已显示本地演示交易：...`。
- 验证：目标测试 `3/3 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `13/13 passed`；lint 通过；coverage `81 files / 305 tests passed`。
- 状态：A 轨已修复；真实库存交易后端、仓库事务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## InventoryBoard 库存操作失败错误未用 alert 播报

- 现象：库存管理页执行出库等操作失败时，弹窗会保留并显示错误文本，但错误节点没有 `role="alert"`。
- 红灯：扩展 `inventory-board.test.ts` 后，mock `stockOut` 抛出 `stock out API unavailable`，失败于弹窗内找不到 `[role="alert"]`。
- 影响：读屏用户可能错过出库失败这一阻断信息，误以为库存操作已经提交或正在处理。
- 修复：库存操作弹窗的 `dialogError` 节点增加 `role="alert"`，保留原有错误文案和弹窗状态。
- 验证：目标测试 `4/4 passed`；相邻 `inventory-board.test.ts + kitting-closure-panel.test.ts + shortage-risk-sync.test.ts` `14/14 passed`；lint 通过；coverage `81 files / 306 tests passed`。
- 状态：A 轨已修复；真实库存操作后端、仓库事务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## AnomalyBoard 初始异常列表失败静默显示 demo 数据

- 现象：异常管理页首屏加载时，如果 `getAnomalyList` 后端调用失败，页面直接显示本地 demo 异常，没有提示真实异常接口不可用。
- 红灯：扩展 `anomaly-board.test.ts` 后，mock `getAnomalyList` 抛出 `anomaly list API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：现场用户可能把 `CNC-001 主轴温升异常` 等本地演示异常当作真实异常队列，影响事件分流、风险处置和 AI 分析判断。
- 修复：异常列表 catch 分支在写入 demo 异常后用 alert 暴露 `异常列表加载失败，已显示本地演示异常：...`。
- 验证：目标测试 `2/2 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `12/12 passed`；lint 通过；coverage `81 files / 307 tests passed`。
- 状态：A 轨已修复；真实异常后端、现场事件采集和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## AnomalyBoard 异常详情失败静默显示 demo 详情

- 现象：异常管理页选择异常记录时，如果 `getAnomalyById` 后端调用失败，页面直接显示本地 demo 详情，没有提示真实详情接口不可用。
- 红灯：扩展 `anomaly-board.test.ts` 后，mock `getAnomalyById` 抛出 `anomaly detail API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：现场用户可能把本地演示详情、响应记录或 AI 建议前置上下文当作真实异常详情，影响处置判断。
- 修复：详情 catch 分支在写入 `demoDetail` 后用 alert 暴露 `异常详情加载失败，已显示本地演示详情：...`。
- 验证：目标测试 `3/3 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `13/13 passed`；lint 通过；coverage `81 files / 308 tests passed`。
- 状态：A 轨已修复；真实异常详情后端、现场事件采集和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## AnomalyBoard AI 分析失败静默显示 demo 建议

- 现象：异常管理页点击 `AI 分析建议` 时，如果 `analyzeAnomaly` 后端调用失败，页面直接显示本地 demo 建议，没有提示真实 AI 分析接口不可用。
- 红灯：扩展 `anomaly-board.test.ts` 后，mock `analyzeAnomaly` 抛出 `anomaly analysis API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：现场用户可能把本地演示处置建议当作真实 AI 分析结果，影响停机、隔离、复核等异常处置判断。
- 修复：`handleAnalyze()` catch 分支在写入 demo 建议前用 alert 暴露 `AI 分析加载失败，已显示本地演示建议：...`。
- 验证：目标测试 `4/4 passed`；相邻 `anomaly-board.test.ts + anomaly-dispatch-sync.test.ts + production-anomaly-sync.test.ts` `14/14 passed`；lint 通过；coverage `81 files / 309 tests passed`。
- 状态：A 轨已修复；真实 AI 分析服务、异常后端和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 交期恢复执行包写入失败未 fail loud

- 现象：AI 生产助手中 Admin 点击 `生成交期恢复执行包` 时，如果 `writeAssistantRecoveryPackage` 写入失败，当前事件处理器抛出未处理异常，没有失败审计，也没有用户可见 alert。
- 红灯：扩展 `chat-panel.test.ts` 后，mock `writeAssistantRecoveryPackage` 抛出 `recovery package storage unavailable`，Vitest 捕获 unhandled rejection，且 `recordAssistantActionAudit` 未被调用。
- 影响：用户可能不知道执行包没有生成；如果后续页面跳转或状态提示混入成功路径，会误导排产、风险、采购和质量闭环判断。
- 修复：`executeAction()` 对权限通过后的动作执行增加统一 `try/catch/finally`，失败时记录 permitted=false 审计，并以 alert 暴露失败动作和原因。
- 验证：目标测试 `13/13 passed`；相邻动作链路测试 `59/59 passed`；lint 通过；coverage `81 files / 310 tests passed`。
- 状态：A 轨已修复；真实本地存储、路由页面和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 权限拒绝审计写入失败未 fail loud

- 现象：AI 生产助手中 Planner 点击 Admin-only 动作时，如果拒绝审计 `recordAssistantActionAudit` 写入失败，当前权限拒绝分支直接抛出未处理异常，页面没有显示拒绝结果。
- 红灯：扩展 `chat-panel.test.ts` 后，mock `recordAssistantActionAudit` 抛出 `audit storage unavailable`，失败于找不到 `.message.assistant[role="alert"]`，同时出现 unhandled rejection。
- 影响：受限动作虽然没有执行，但拒绝证据没有落地，用户也不知道审计写入失败，影响安全审计和后续追责。
- 修复：权限拒绝分支单独捕获审计写入异常；动作仍不执行、不导航，并以 assertive alert 同时说明权限拒绝和拒绝审计写入失败原因。
- 验证：目标测试 `14/14 passed`；相邻助手动作/审计/执行包测试 `36/36 passed`；lint 通过；coverage `81 files / 319 tests passed`。
- 状态：A 轨已修复；真实审计后端、真实权限系统和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 扫码接口失败被误报为普通无匹配

- 现象：生产报工页扫码查询时，如果 `scanOperation` 后端调用失败且本地列表也找不到工单，页面只提示 `未找到匹配的工单或工序`，没有暴露扫码接口失败原因。
- 红灯：扩展 `production-board.test.ts` 后，mock `scanOperation` 抛出 `scanner API unavailable`，失败于 alert 不包含 `扫码查询失败` 和后端错误原因。
- 影响：现场操作员可能把扫码服务不可用误判为扫码枪/工单号输入错误，继续重扫或改号，而不是升级后端扫码服务故障。
- 修复：`handleScan()` 记录扫码接口异常；本地无匹配时以 alert 暴露 `扫码查询失败，且本地未找到匹配的工单或工序：...`。
- 验证：目标测试 `9/9 passed`；相邻扫码/异常/OTD 链路测试 `26/26 passed`；lint 通过；coverage `81 files / 311 tests passed`。
- 状态：A 轨已修复；真实扫码服务、现场扫码设备和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## QualityCapaTaskPanel CAPA 闭环写入失败仍显示已验证

- 现象：质量 CAPA 面板中执行中任务推进验证时，如果 `writeQualityCapaClosure` 写入失败，组件先把任务改为 `verified`，再抛出未处理异常。
- 红灯：扩展 `quality-capa-task-panel.test.ts` 后，mock `writeQualityCapaClosure` 抛出 `CAPA closure storage unavailable`，失败于任务卡片仍包含 `verified`，同时出现 native event handler unhandled error。
- 影响：质量主管可能看到 CAPA 已验证，但审计回放和 OTD 复盘实际没有同步，形成质量闭环假阳性。
- 修复：闭环写入成功后才更新任务状态；失败时保留 `doing`、按钮可重试，并以 assertive alert 暴露 `CAPA 验证同步失败：...`。
- 验证：目标测试 `3/3 passed`；相邻 CAPA 同步测试 `7/7 passed`；lint 通过；coverage `81 files / 312 tests passed`。
- 状态：A 轨已修复；真实质量审计存储、OTD 复盘和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 质量知识证据刷新失败未 fail loud

- 现象：文档上传页挂载时会刷新质量知识样本、复核队列、推荐反馈、再训练版本和灰度决策；如果后台刷新失败，当前 mounted hook 会产生未处理异常，页面没有提示用户治理数据没有刷新成功。
- 红灯：扩展 `document-upload.test.ts` 后，mock `readQualityKnowledgeSamplesBackendFirst` 抛出 `quality evidence API unavailable`，失败于找不到 `[role="alert"]`，同时出现 mounted hook unhandled rejection。
- 影响：知识库管理员可能以为质量知识治理数据已刷新，实际仍是本地/旧数据，影响再训练、灰度决策和质量推荐证据判断。
- 修复：`refreshQualityKnowledgeEvidence()` 失败时捕获异常，保留本地治理数据，并用 assertive alert 暴露 `质量知识证据刷新失败，已保留本地治理数据：...`。
- 验证：目标测试 `7/7 passed`；相邻上传/导入/质量知识同步测试 `21/21 passed`；lint 通过；coverage `81 files / 313 tests passed`。
- 状态：A 轨已修复；真实质量知识后端、真实文件索引服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 质量知识灰度发布失败未 fail loud

- 现象：文档上传页的质量知识治理面板触发 R3 灰度发布时，如果 `grayPublishQualityKnowledgeNextTrainingSetVersion` 写入失败，事件处理器抛出未处理异常，页面没有提示训练集未进入灰度发布。
- 红灯：扩展 `document-upload.test.ts` 后，mock `grayPublishQualityKnowledgeNextTrainingSetVersion` 抛出 `gray publish storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 native event handler unhandled error。
- 影响：知识库管理员可能以为质量推荐 R3 训练集已灰度发布并进入审计归档，实际训练集仍停留在灰度前校验状态，影响质量推荐链路和发布治理判断。
- 修复：`handleQualityNextTrainingGrayPublish()` 失败时捕获异常，保留当前训练集状态，并用 assertive alert 暴露 `质量知识灰度发布失败...` 和后端错误原因。
- 验证：目标测试 `8/8 passed`；相邻上传/治理面板/质量知识/知识治理同步测试 `19/19 passed`；lint 通过；coverage `81 files / 318 tests passed`。
- 状态：A 轨已修复；真实质量知识后端、真实灰度发布服务、质量主管审批和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 拖拽重排保存失败提示被重载清空

- 现象：调度员拖拽任务后，如果 `rescheduleItem` 保存失败，catch 分支先设置 `保存失败：...`，随后调用 `loadData()` 恢复原始状态；`loadData()` 开头清空 `error`，导致用户看不到保存失败原因。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `rescheduleItem` 抛出 `reschedule API unavailable`，失败于找不到 `[role="alert"]`。
- 影响：调度员可能误以为拖拽调整已经保存，实际后端没有落库，后续排产、OTD 复盘和人工调整审计会出现认知偏差。
- 修复：`loadData()` 支持 `preserveError`；拖拽保存失败后的恢复重载保留错误横幅，普通加载仍清空旧错误。
- 验证：目标测试 `8/8 passed`；相邻排产/甘特/反馈测试 `25/25 passed`；lint 通过；coverage `81 files / 314 tests passed`。
- 状态：A 轨已修复；真实排产后端、真实浏览器拖拽和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 多目标方案采纳反馈失败只写日志

- 现象：调度员在多目标方案对比中采用某个方案后，如果 `submitAdoptionFeedback` 失败，当前代码只调用 `logUnlessOfflineDemo`，页面没有任何同步失败提示。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `submitAdoptionFeedback` 抛出 `batch feedback API unavailable`，失败于找不到 `.sync-note`。
- 影响：调度员可能以为“采用综合方案”的理由已经进入后端审计和模型复盘，实际只完成了本地目标切换。
- 修复：批量方案采纳反馈提交增加同步中/成功/失败提示；失败时以 `.sync-note` 保留后端原因，说明当前仅保留本地目标切换。
- 验证：目标测试 `9/9 passed`；相邻排产/Pareto/反馈/甘特映射测试 `23/23 passed`；lint 通过；coverage `81 files / 315 tests passed`。
- 状态：A 轨已修复；真实 Pareto 后端、真实采纳反馈服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 风险事件加载失败静默显示 demo 队列

- 现象：排产页加载风险触发事件时，如果 `getRiskDashboard` 后端调用失败，页面直接显示本地 demo 事件队列，没有提示真实风险接口不可用。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `getRiskDashboard` 抛出 `risk unavailable`，失败于找不到 `.risk-event-sync-note`。
- 影响：调度员可能把本地演示缺料、设备、急单事件当作实时风险队列，进而影响 Agent 推荐生成、采纳和人工排产处置判断。
- 修复：`loadRiskTriggeredEvents()` 失败时保留 demo 事件兜底，同时用 polite status 暴露 `风险事件加载失败，已显示本地演示事件：...` 和后端错误原因；成功时清空提示。
- 验证：目标测试 `10/10 passed`；相邻排产/事件队列/反馈/甘特映射测试 `23/23 passed`；lint 通过；coverage `81 files / 316 tests passed`。
- 状态：A 轨已修复；真实风险后端、真实事件流、Agent 推荐服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ScheduleBoard 外协排产释放写入失败未 fail loud

- 现象：排产页对已到货外协事件生成 Agent 建议并点击采纳时，如果 `confirmOutsourcingScheduleRelease` 写入失败，页面先显示普通采纳反馈同步成功，释放审计失败没有用户可见提示。
- 红灯：扩展 `schedule-board.test.ts` 后，mock `confirmOutsourcingScheduleRelease` 抛出 `outsourcing release storage unavailable`，Vitest 捕获 unhandled rejection，且 `.sync-note` 不包含外协释放失败原因。
- 影响：调度员可能误以为外协厂外等待口径已经关闭、排产释放已归档到 OTD 复盘，实际释放审计没有落地。
- 修复：`adoptAgentSuggestion()` 等待采纳反馈同步结束后再释放外协排产；释放确认失败时捕获异常，并以 `.sync-note` 暴露 `外协排产释放同步失败...` 和后端错误原因。
- 验证：目标测试 `11/11 passed`；相邻排产/事件队列/反馈/外协同步/甘特映射测试 `31/31 passed`；lint 通过；coverage `81 files / 317 tests passed`。
- 状态：A 轨已修复；真实外协后端、真实 OTD 证据链、真实采纳交互和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ProductionBoard 完工证据写入失败未 fail loud

- 现象：生产报工页提交完工时，如果 `completeOperation` 后端调用成功但后续 `upsertOtdEvidenceChainRecord` 写入失败，当前事件处理器抛出未处理异常，页面没有说明 OTD/质量证据未归档。
- 红灯：扩展 `production-board.test.ts` 后，mock `upsertOtdEvidenceChainRecord` 抛出 `otd evidence storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 native event handler unhandled error。
- 影响：现场操作员可能以为完工、质量联动和 OTD 复盘证据都已闭环；实际只有后端完工提交成功，证据链归档失败，后续排产复核和质量审计会出现断点。
- 修复：`confirmComplete()` 对后端完工成功后的本地状态刷新、trace 和证据写入增加统一失败兜底；失败时提示 `完工证据写入失败，后端完工已提交但 OTD/质量证据未归档：...`，并停止成功通知。
- 验证：目标测试 `10/10 passed`；相邻生产/异常/扫码/OTD 链路测试 `27/27 passed`；lint 通过；coverage `81 files / 320 tests passed`。
- 状态：A 轨已修复；真实生产事务、真实 OTD/质量证据存储和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## QualityCapaTaskPanel 复用草案转正式 CAPA 失败未 fail loud

- 现象：质量 CAPA 面板中点击“复核草案并转正式 CAPA”时，如果 `writeQualityKnowledgeReuseClosure` 写入失败，组件抛出未处理异常，页面没有说明正式 CAPA 未归档。
- 红灯：扩展 `quality-capa-task-panel.test.ts` 后，mock `writeQualityKnowledgeReuseClosure` 抛出 `reuse closure storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 native event handler unhandled error。
- 影响：质量工程师可能无法区分是点击无效、页面卡住，还是正式 CAPA 写入失败；AI 草案到正式纠正措施的审计链会断在转正节点。
- 修复：`approveReuseDraft()` 捕获复用闭环写入异常；失败时保留草案待复核和可重试按钮，并以 assertive alert 暴露 `质量知识复用转正式 CAPA 失败：...`。
- 验证：目标测试 `4/4 passed`；相邻 CAPA/质量知识同步测试 `13/13 passed`；lint 通过；coverage `81 files / 321 tests passed`。
- 状态：A 轨已修复；真实质量知识后端、真实 CAPA 审计存储和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 质量实验影子灰度发布失败未 fail loud

- 现象：文档上传页的质量知识治理面板触发 R7 影子灰度发布时，如果 `grayPublishQualityExperimentShadowValidationVersion` 写入失败，事件处理器抛出未处理异常，页面没有提示影子灰度未发布。
- 红灯：扩展 `document-upload.test.ts` 后，mock `grayPublishQualityExperimentShadowValidationVersion` 抛出 `shadow gray publish storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 component/native event handler unhandled error。
- 影响：知识库管理员可能以为 R7 影子验证已经发布到影子灰度范围，实际发布审计没有落地，后续扩大灰度和质量主管审批依据会断链。
- 修复：`handleQualityExperimentShadowGrayPublish()` 捕获影子灰度发布异常；失败时以 assertive alert 暴露 `质量实验影子灰度发布失败...`，并不新增发布历史。
- 验证：目标测试 `9/9 passed`；相邻上传/治理面板/质量知识/知识治理同步测试 `20/20 passed`；lint 通过；coverage `81 files / 322 tests passed`。
- 状态：A 轨已修复；真实质量知识后端、真实影子灰度服务、质量主管扩大审批和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 确认 API 失败仍显示已确认

- 现象：采购看板中已提交采购单点击确认时，如果 `confirmPurchaseOrder` 失败，当前 catch 会本地构造 `Confirmed` 状态，导致详情和列表都显示已确认。
- 红灯：扩展 `purchase-board.test.ts` 后，mock `confirmPurchaseOrder` 抛出 `supplier credit hold`，失败于详情状态从 `已提交` 被错误推进为 `已确认`。
- 影响：采购员可能以为供应商信用/确认已经后端落库，实际确认失败；后续收货、外协承诺和 OTD 证据链会建立在错误状态上。
- 修复：`handleConfirm()` 捕获确认失败后写入 `确认失败：...` alert 并返回；保留已提交状态和确认按钮，不触发列表刷新假成功。
- 验证：目标测试 `8/8 passed`；相邻采购/外协/短缺风险/OTD 链路测试 `29/29 passed`；lint 通过；coverage `81 files / 323 tests passed`。
- 状态：A 轨已修复；真实采购后端、真实供应商信用状态和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 动作失败后的失败审计写入失败未 fail loud

- 现象：AI 助手动作执行失败后会尝试写入 `permitted=false` 审计；如果这次失败审计写入也失败，当前 catch 内再次抛出未处理异常，页面没有动作失败提示。
- 红灯：扩展 `chat-panel.test.ts` 后，mock `writeAssistantRecoveryPackage` 抛出 `recovery package storage unavailable`，再让 `recordAssistantActionAudit` 抛出 `failed action audit storage unavailable`，失败于找不到 `.message.assistant[role="alert"]`。
- 影响：用户既看不到交期恢复执行包生成失败，也不知道失败审计没有落地；助手动作闭环和安全审计同时断链。
- 修复：动作执行 catch 分支中对失败审计写入再包一层 `try/catch`；alert 同时说明原始动作失败和 `失败审计写入失败：...`。
- 验证：目标测试 `15/15 passed`；相邻助手动作/审计/执行包测试 `37/37 passed`；lint 通过；coverage `81 files / 324 tests passed`。
- 状态：A 轨已修复；真实助手审计后端、真实执行包服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 提交 API 失败仍显示已提交

- 现象：采购看板中草稿采购单点击提交时，如果 `submitPurchaseOrder` 失败，当前 catch 会本地构造 `Submitted` 状态，导致详情和列表都显示已提交。
- 红灯：扩展 `purchase-board.test.ts` 后，mock `submitPurchaseOrder` 抛出 `supplier onboarding incomplete`，失败于详情状态从 `草稿` 被错误推进为 `已提交`。
- 影响：采购员可能以为采购单提交已经后端落库，实际供应商准入或提交校验失败；后续确认、收货、外协承诺和 OTD 证据链会建立在错误状态上。
- 修复：`handleSubmit()` 捕获提交失败后写入 `提交失败：...` alert 并返回；保留草稿状态和提交按钮，不触发列表刷新假成功。
- 验证：目标测试 `9/9 passed`；相邻采购/外协/短缺风险/OTD 链路测试 `30/30 passed`；lint 通过；coverage `81 files / 325 tests passed`。
- 状态：A 轨已修复；真实采购后端、真实供应商准入状态和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 新建 API 失败仍本地新增草稿单

- 现象：采购看板中点击“新建”后，如果 `createPurchaseOrder` 失败，当前 catch 会本地插入 `po-new` 草稿单，并关闭新建弹窗。
- 红灯：扩展 `purchase-board.test.ts` 后，mock `createPurchaseOrder` 抛出 `supplier master data missing`，失败于弹窗被关闭；初次 RED 还暴露该本地插入会污染共享 mock 列表，测试随后改为对本用例返回数组副本。
- 影响：采购员可能以为采购单已经创建，实际供应商主数据或后端校验失败；后续提交、确认和 OTD 证据链会基于不存在的采购单继续推进。
- 修复：`handleCreate()` 捕获创建失败后写入 `创建失败：...` alert 并返回；保留弹窗和表单，不本地新增采购单。
- 附带问题：全量 coverage 暴露 `pareto-compare.test.ts` 未 stub 异步 `GanttChart`，导致 teardown 后加载 CSS 的 unhandled rejection；已改为组件名 stub，避免覆盖率命令被非目标异步组件污染。
- 验证：目标测试 `10/10 passed`；相邻采购/外协/短缺风险/OTD 链路测试 `31/31 passed`；`pareto-compare.test.ts` `2/2 passed`；lint 通过；coverage `81 files / 326 tests passed`。
- 状态：A 轨已修复；真实采购后端、真实供应商主数据和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 质量知识正式发布失败未 fail loud

- 现象：文档上传页的质量知识治理面板触发正式发布时，如果 `publishQualityKnowledgeRetrainingVersion` 写入失败，事件处理器抛出未处理异常，页面没有提示训练集未进入 AI 推荐链路。
- 红灯：扩展 `document-upload.test.ts` 后，mock `publishQualityKnowledgeRetrainingVersion` 抛出 `publish storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 component/native event handler unhandled error。
- 影响：知识库管理员可能以为通过校验的训练集已经正式进入 AI 推荐链路，实际发布审计没有落地，后续推荐结果和治理审批会基于错误发布状态判断。
- 修复：`handleQualityRetrainingPublish()` 捕获正式发布写入异常；失败时以 assertive alert 暴露 `质量知识正式发布失败...`，并不新增发布历史。
- 验证：目标测试 `10/10 passed`；相邻上传/治理面板/质量知识/知识治理同步测试 `21/21 passed`；lint 通过；coverage `81 files / 327 tests passed`。
- 状态：A 轨已修复；真实质量知识后端、真实推荐链路发布服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 成功动作审计失败被误报为动作失败

- 现象：AI 助手动作主体已经成功写入交期恢复执行包并完成路由跳转后，如果成功审计 `recordAssistantActionAudit` 失败，外层 catch 会继续写 `permitted=false` 失败审计，并显示 `动作执行失败...`。
- 红灯：扩展 `chat-panel.test.ts` 后，mock 成功审计抛出 `success audit storage unavailable`，失败于审计函数被调用两次；页面会把已执行动作归类为失败。
- 影响：用户可能误以为交期恢复执行包未生成，审计侧也会同时存在“成功动作业务包”和“失败审计”的矛盾证据。
- 修复：成功审计写入单独 `try/catch`；失败时追加 `动作已执行，但成功审计写入失败...` alert，不再进入动作失败 catch。
- 验证：目标测试 `16/16 passed`；相邻助手动作/审计/执行包测试 `38/38 passed`；lint 通过；coverage `81 files / 328 tests passed`。
- 状态：A 轨已修复；真实助手审计后端、真实执行包服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## DocumentUpload 质量知识回滚失败未 fail loud

- 现象：文档上传页的质量知识治理面板触发已发布训练集回滚时，如果 `rollbackQualityKnowledgeRetrainingVersion` 写入失败，事件处理器抛出未处理异常，页面没有提示训练集仍保留在发布状态。
- 红灯：扩展 `document-upload.test.ts` 后，mock `rollbackQualityKnowledgeRetrainingVersion` 抛出 `rollback storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 component/native event handler unhandled error。
- 影响：知识库管理员可能以为训练集已经回滚到上一版本，实际回滚审计没有落地，AI 推荐链路仍可能继续使用已发布版本。
- 修复：`handleQualityRetrainingRollback()` 捕获回滚写入异常；失败时以 assertive alert 暴露 `质量知识回滚失败...`，并不新增回滚历史。
- 验证：目标测试 `11/11 passed`；相邻上传/治理/质量知识/后台治理记录消费测试 `24/24 passed`；lint 通过；coverage `81 files / 329 tests passed`。
- 状态：A 轨已修复；真实质量知识后端、真实回滚服务和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## PurchaseBoard 替代供应商锁定失败仍显示已锁定

- 现象：采购看板点击“锁定替代供应商”时，如果 `writeSupplyRiskEscalation` 写入失败，组件先把供应风险状态改为 `alternate_committed`，再抛出未处理异常。
- 红灯：扩展 `purchase-board.test.ts` 后，mock `writeSupplyRiskEscalation` 抛出 `supply risk audit storage unavailable`，失败于 badge 显示 `替代已锁定`，同时出现 native event handler unhandled error。
- 影响：采购员可能以为替代供应商承诺已归档、供应风险已关闭，实际审计和 OTD 证据没有落地，后续排产复核会基于假恢复状态。
- 修复：`handleCommitAlternateSupplier()` 成功写入供应风险审计和 OTD 证据后才推进 UI；失败时保留 open 状态，并以 alert 暴露 `替代供应商锁定失败...`。
- 验证：目标测试 `11/11 passed`；相邻采购/外协/供应风险/OTD 链路测试 `32/32 passed`；lint 通过；coverage `81 files / 330 tests passed`。
- 状态：A 轨已修复；真实采购后端、真实供应商承诺和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel BOM 齐套包 OTD 证据失败被误报为动作失败

- 现象：AI 助手生成 BOM 展开齐套检查包时，先写 `writeBomKittingPackage`，随后写 OTD 证据；如果 OTD 证据写入失败，外层 catch 会把整个动作当成失败，阻断路由和成功包展示。
- 红灯：扩展 `chat-panel.test.ts` 后，mock `upsertOtdEvidenceChainRecord` 抛出 `otd evidence storage unavailable`，失败于 `routerPush('/bom')` 未发生。
- 影响：用户可能看不到已经生成的 BOM 齐套包，审计侧也会把“包已生成但证据未归档”的部分成功误归类为整体失败。
- 修复：拆分 BOM 齐套包写入与 OTD 证据写入；证据失败时保留成功状态和包卡片，并以 alert 暴露 `BOM 齐套包已生成，但 OTD 证据写入失败...`。
- 验证：目标测试 `17/17 passed`；相邻助手动作/BOM 齐套/OTD 链路测试 `53/53 passed`；lint 通过；coverage `81 files / 331 tests passed`。
- 状态：A 轨已修复；真实 BOM、库存齐套、OTD 证据后端和 B 轨发布闸门仍需独立验证。B 轨发布闸门仍全部 FAIL。

## ChatPanel 设备停机包 OTD 证据失败被误报为动作失败

- 现象：AI 助手生成 CNC-001 设备停机复核包时，先写 `writeEquipmentDowntimeEvent`，随后写 OTD 证据；如果 OTD 证据写入失败，外层 catch 会把整个动作当成失败，阻断路由和成功包展示。
- 红灯：扩展 `chat-panel.test.ts` 后，mock `upsertOtdEvidenceChainRecord` 抛出 `otd evidence storage unavailable`，失败于 `routerPush('/equipment')` 未发生。
- 影响：用户可能看不到已经生成的设备停机复核包，审计侧也会把“停机事件已写入但证据未归档”的部分成功误归类为整体失败。
- 修复：拆分设备停机事件写入与 OTD 证据写入；证据失败时保留成功状态和包卡片，并以 alert 暴露 `设备停机复核包已生成，但 OTD 证据写入失败...`。
- 验证：目标测试 `18/18 passed`；相邻助手动作/设备停机/OTD 链路测试 `54/54 passed`；lint 通过；coverage `81 files / 332 tests passed`。
- 状态：A 轨已修复；真实设备维护、排产事件队列、OTD 证据后端和 B 轨发布闸门仍需独立验证。

## ProductionBoard 异常上报后证据归档失败未 fail loud

- 现象：生产看板现场异常上报时，`reportException` 后端调用成功后会继续写本地生产异常事件和 OTD 证据；如果 `writeProductionAnomalyEvent` 或后续证据写入失败，当前事件处理器抛未处理异常。
- 红灯：扩展 `production-board.test.ts` 后，mock `writeProductionAnomalyEvent` 抛出 `production anomaly storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 native event handler unhandled error。
- 影响：现场操作员可能不知道异常后端已上报但异常管理/OTD 证据没有归档；审计侧也会丢失“部分成功”的真实状态。
- 修复：`confirmException()` 在 `reportException` 成功后，将异常事件、扫码异常证据、风险 trace 和 OTD 证据写入包进 `try/catch`；失败时以 alert 暴露 `异常证据写入失败，后端异常已上报但异常管理/OTD 证据未归档...`，不显示全成功提示。
- 验证：目标测试 `11/11 passed`；相邻生产异常/OTD/扫码/人员派工测试 `34/34 passed`；lint 通过；coverage `81 files / 333 tests passed`。
- 状态：A 轨已修复；真实生产异常后端、真实异常处置队列、OTD 证据后端和 B 轨发布闸门仍需独立验证。

## RiskActionQueuePanel 风险升级 trace 失败仍显示已升级

- 现象：风险处置队列点击“升级”时，组件先把风险卡状态改成 `escalated` 并切换负责人，再调用 `appendRiskActionTrace`；如果 trace 写入失败，UI 已经显示 `已升级`。
- 红灯：扩展 `risk-action-queue-panel.test.ts` 后，mock `appendRiskActionTrace` 抛出 `risk trace storage unavailable`，失败于状态从 `待处置` 被错误推进为 `已升级`，并出现 native event handler unhandled error。
- 影响：生产经理可能看到风险已升级，实际风险 trace 和审计留痕没有落地；后续 SLA 复核和风险处置统计会基于假状态。
- 修复：`escalate()` 先尝试写 trace；失败时显示 `风险升级失败：...` alert 并保留原状态、原负责人和处置留痕。
- 验证：目标测试 `2/2 passed`；相邻风险 trace/SLA/监控态势/生产异常/异常分流/助手执行包测试 `34/34 passed`；lint 通过；coverage `81 files / 334 tests passed`。
- 状态：A 轨已修复；真实风险 trace 后端、真实审批闭环和 B 轨发布闸门仍需独立验证。

## ReportBoard POC 复盘签署失败未 fail loud

- 现象：报表中心点击“生成 POC 复盘签署记录”时，如果 `writePocReviewSignoffRecord` 写入失败，事件处理器抛出未处理异常，页面没有提示客户验收签署未归档。
- 红灯：扩展 `report-board.test.ts` 后，mock `writePocReviewSignoffRecord` 抛出 `poc signoff storage unavailable`，失败于找不到 `[role="alert"]`，同时出现 native event handler unhandled error。
- 影响：售前/交付人员可能以为 POC 复盘签署已经生成，实际客户验收会议编号、签署人和审计编号没有落地，后续转上线行动包会缺少真实前置证据。
- 修复：`handlePocReviewSignoff()` 捕获签署写入异常；失败时以 assertive alert 暴露 `POC 复盘签署失败...`，并保持未签署状态。
- 验证：目标测试 `2/2 passed`；相邻 POC 签署/转上线/试运行/hypercare/OTD 证据链测试 `26/26 passed`；lint 通过；coverage `81 files / 335 tests passed`。
- 状态：A 轨已修复；真实 POC 签署后端、真实客户签字和 B 轨发布闸门仍需独立验证。

## Release gate 总审计 PASS 判定过宽

- 现象：`scripts/run-release-gate-audit.ps1` 原先通过 `$Text.Contains("Result: PASS")` 判断单项证据包通过。
- 红灯：新增 `ReleaseGateAudit_ShouldOnlyAcceptAnchoredGatePassLines` 后失败，指出 release gate 不应接受“正文任意位置包含 `Result: PASS`”。
- 影响：如果失败报告、历史日志或说明文字里出现 `Result: PASS`，总审计可能误判单项闸门通过，削弱 B 轨 fail loud。
- 修复：新增 `Test-AnchoredReportPass()`，只接受独立结果行 `Result: PASS` / `- Result: PASS`。
- 附带问题：全量架构测试暴露 Sprint4 LLM 成本门禁仍按旧手动配置字符串检查；已改为 Sprint5 Options 模式，避免门禁和当前实现冲突。
- 验证：目标 release gate 架构门 `1/1 passed`；临时 spoof 报告验证 `EXPECTED_FAIL`；PowerShell parser `parse ok`；`MES.ArchitectureTests` 全量 `72/72 passed`；正式 release gate 审计仍 `FAIL`。
- 状态：审计误放行风险已修复；B 轨真实外部/人工证据仍未完成。

## Release gate 安全签字 SIGNED 判定过宽

- 现象：`run-release-gate-audit.ps1` 原先通过 `$Text.Contains("Status: SIGNED")` 和 `$Text.Contains("Decision: SIGNED")` 判断安全签字完成。
- 红灯：新增 `ReleaseGateAudit_ShouldOnlyAcceptAnchoredSecuritySignoffLines` 后失败，指出 release gate 不应接受正文任意位置出现 SIGNED token。
- 影响：unsigned 签字包如果在说明、示例或历史记录中写到 `Status: SIGNED` / `Decision: SIGNED`，可能被误判为人工签署完成。
- 修复：新增 `Test-AnchoredSignoffSigned()`，只接受独立签字行 `Status: SIGNED` / `Decision: SIGNED` 或 `- Status: SIGNED` / `- Decision: SIGNED`。
- 验证：目标架构门 `1/1 passed`；动态 signoff spoof 报告验证 `EXPECTED_FAIL` 且只卡 `Security signoff`；release gate 过滤 `3/3 passed`；parser `parse ok`；架构全量 `73/73 passed`；正式 release gate 审计仍 `FAIL`。
- 状态：安全签字 spoof 风险已修复；真实人工签字和其它 B 轨证据仍未完成。

## Hosted CI 证据未强制 job summary

- 现象：`run-hosted-ci-evidence.ps1` 原先强制 `RunUrl` / `RunId`，但 `Evidence` 只是记录字段，不是关闭 hosted CI gate 的必填项。
- 红灯：扩展 hosted CI 架构门后失败于脚本/报告缺 `job summary` token。
- 影响：只有远端 run 链接和编号、但缺 job 摘要时，证据无法证明 dotnet format、ArchitectureTests、Unit/Integration、frontend lint/build、Docker build、audit 等质量门真实通过。
- 修复：`Evidence` 改为 hosted CI job summary 必填；Gate 文案和 20260601/20260602 fail-loud 报告同步刷新。
- 验证：目标架构门 `1/1 passed`；动态负例 RunUrl/RunId 有值但 Evidence 为空时 `EXPECTED_FAIL`；相关架构过滤 `4/4 passed`；parser `parse ok`；架构全量 `73/73 passed`；正式 release gate 审计仍 `FAIL`。
- 状态：弱证据误放行风险已修复；真实 hosted CI 证据仍未完成。

## Attack Chain VerifiedAt 未校验时间戳格式

- 现象：`run-attack-chain-verification.ps1` 原先只检查 `VerifiedAt` 非空，不检查是否能解析为时间戳。
- 红灯：扩展 Attack Chain 架构门后失败于脚本缺 `[DateTimeOffset]::Parse`。
- 影响：人工验证报告可能写入 `not-a-date` 之类无效时间，削弱安全签字前置证据的可审计性。
- 修复：`VerifiedAt` 非空时必须通过 `[DateTimeOffset]::Parse()`；失败时 fail loud 写入 `VerifiedAt must be a parseable timestamp for manual verification.`。
- 验证：目标架构门 `1/1 passed`；动态负例在其它人工验证字段均满足时仍因 `VerifiedAt=not-a-date` 输出 `EXPECTED_FAIL`；20260601/20260602 Attack Chain 报告已刷新。
- 状态：格式误放行风险已修复；真实 Attack Chain A/B/C 人工验证仍未完成。

## Release gate 总审计未复核 Attack Chain 人工证据字段

- 现象：`run-release-gate-audit.ps1` 对 Attack Chain A/B/C 只使用 generic `Test-AnchoredReportPass`，没有复核 `Status: VERIFIED`、Verifier、VerifiedAt、三条 PASS 和三条 evidence。
- 红灯：新增总审计架构门后失败于脚本缺 `Test-AttackChainEvidencePass`。
- 影响：Attack Chain 报告如果只写 `Result: PASS`，但人工验证人、时间戳或链路证据缺失，总 release gate 仍可能误放行。
- 修复：新增 `Test-AttackChainEvidencePass()` 专用 predicate，并在 `Add-Gate "Attack Chain A/B/C"` 中替换 generic PASS 判定。
- 验证：目标架构门 `1/1 passed`；动态 spoof 报告 `EXPECTED_FAIL` 且只卡 Attack Chain；完整合法样本 `EXPECTED_PASS`。
- 状态：总审计误放行风险已修复；真实 Attack Chain 人工验证仍未完成。

## Release gate 总审计未复核 staging 迁移和健康证据字段

- 现象：`run-release-gate-audit.ps1` 对 PostgreSQL/staging 只使用 generic `Test-AnchoredReportPass`，没有复核 Docker、依赖启动、EF migration、API、`/live`、`/ready` 和成功 exit code。
- 红灯：新增 staging 总审计架构门后失败于脚本缺 `Test-StagingEvidencePass`。
- 影响：staging 报告如果只写 `Result: PASS`，但缺真实迁移和健康检查证据，总 release gate 仍可能误放行。
- 修复：新增 `Test-StagingEvidencePass()` 专用 predicate，并在 `Add-Gate "PostgreSQL/staging"` 中替换 generic PASS 判定。
- 验证：目标架构门 `1/1 passed`；动态 spoof 报告 `EXPECTED_FAIL` 且只卡 staging；完整合法样本 `EXPECTED_PASS`。
- 状态：总审计误放行风险已修复；真实 PostgreSQL/staging rehearsal 仍未完成。

## Release gate 总审计未复核 Hosted CI 远端 run 证据字段

- 现象：`run-release-gate-audit.ps1` 对 Hosted CI 只使用 generic `Test-AnchoredReportPass`，没有复核 `READY_FOR_RELEASE_REVIEW`、RunUrl、RunId、job summary、workflow 文件和 `gh run` 成功证据。
- 红灯：新增 hosted CI 总审计架构门后失败于脚本缺 `Test-HostedCiEvidencePass`。
- 影响：Hosted CI 报告如果只写 `Result: PASS`，但缺真实远端 runner 证据，总 release gate 仍可能误放行。
- 修复：新增 `Test-HostedCiEvidencePass()` 专用 predicate，并在 `Add-Gate "Hosted CI"` 中替换 generic PASS 判定。
- 验证：目标架构门 `1/1 passed`；动态 spoof 报告 `EXPECTED_FAIL` 且只卡 Hosted CI；完整合法样本 `EXPECTED_PASS`。
- 状态：总审计误放行风险已修复；真实 hosted CI 远端 run 证据仍未完成。

## Release gate 总审计未复核 Gray observation 14 天观察证据字段

- 现象：`run-release-gate-audit.ps1` 对 Gray observation 只使用 generic `Test-AnchoredReportPass`，没有复核首次灰度 ID、观察开始/结束时间、14 天窗口、P0/P1=0 和 evidence。
- 红灯：新增 gray observation 总审计架构门后失败于脚本缺 `Test-GrayObservationEvidencePass`。
- 影响：Gray observation 报告如果只写 `Result: PASS`，但灰度仍在观察中或窗口不足 14 天，总 release gate 仍可能误放行。
- 修复：新增 `Test-GrayObservationEvidencePass()` 专用 predicate，并在 `Add-Gate "Gray observation"` 中替换 generic PASS 判定。
- 验证：目标架构门 `1/1 passed`；动态 spoof 报告 `EXPECTED_FAIL` 且只卡 Gray observation；完整 14 天合法样本 `EXPECTED_PASS`；正式 release gate audit 仍 `FAIL`。
- 状态：总审计误放行风险已修复；真实首次灰度、14 天无 P0/P1 观察和证据回填仍未完成。

## Release gate 总审计未复核 Security signoff 签字证据字段

- 现象：`run-release-gate-audit.ps1` 对 Security signoff 已有 anchored SIGNED 判定，但没有复核 Signer、SignedAt、自评、Attack Chain 和 Evidence。
- 红灯：新增 security signoff 总审计架构门后失败于脚本缺 `Test-SecuritySignoffEvidencePass`。
- 影响：签字包如果只写 `Status: SIGNED` / `Decision: SIGNED`，但签字人、签字时间或证据为空，总 release gate 仍可能误放行。
- 修复：新增 `Test-SecuritySignoffEvidencePass()` 专用 predicate，并在 `Add-Gate "Security signoff"` 中替换 anchored SIGNED-only 判定。
- 验证：目标架构门 `1/1 passed`；动态 spoof 报告 `EXPECTED_FAIL` 且只卡 Security signoff；完整合法样本 `EXPECTED_PASS`。
- 状态：总审计误放行风险已修复；真实人工签字和签字证据回填仍未完成。

## Hosted CI 证据未校验 GitHub Actions RunUrl 与数字 RunId

- 现象：`run-hosted-ci-evidence.ps1` 和总 release gate 原先只要求 `RunUrl` / `RunId` 非空；`https://example.com/run/1` 和 `abc` 也可能作为 hosted CI 证据进入报告。
- 红灯：新增 hosted CI 架构门后失败于脚本缺 `Test-GitHubActionsRunUrl`。
- 影响：非 GitHub Actions run 链接或非数字 RunId 会削弱 hosted CI 证据的可追溯性，无法证明真实远端 runner 执行过发布质量门。
- 修复：单项脚本和总闸门都新增 `Test-GitHubActionsRunUrl()` / `Test-NumericRunId()`；非法 URL/RunId 继续 fail loud。
- 验证：单项动态负例 `EXPECTED_FAIL`；总闸门动态负例只卡 Hosted CI；合法 GitHub Actions URL + 数字 RunId 样本 `EXPECTED_PASS`。
- 状态：格式误放行风险已修复；真实 hosted CI run 仍需授权环境提供。

## Release gate 总审计未复核 staging health HTTP 成功结果

- 现象：`run-release-gate-audit.ps1` 对 PostgreSQL/staging 已复核 `Health /live` / `Health /ready` token，但没有确认对应段落里实际是 HTTP 2xx/3xx。
- 红灯：新增 staging health 架构门后失败于脚本缺 `Test-StagingHealthEndpointPass`。
- 影响：staging 报告如果写入失败健康检查段落，例如 `HTTP 500`，但同时包含 health 标签和其它步骤 token，总 release gate 仍可能误放行。
- 修复：新增 `Test-StagingHealthEndpointPass()`，按 health 段落复核 `/live` 和 `/ready` 的 HTTP 成功结果。
- 验证：动态负例 `HTTP 500` 只卡 staging；合法 `HTTP 200` 样本 `EXPECTED_PASS`；正式 release gate audit 仍 `FAIL`。
- 状态：总审计误放行风险已修复；真实 staging health 成功证据仍未完成。

## Release gate 总审计未逐段复核 Attack Chain A/B/C evidence

- 现象：`run-release-gate-audit.ps1` 对 Attack Chain 已要求 3 条 PASS 和 3 条 evidence，但没有确认 A、B、C 三个段落各自都有 evidence。
- 红灯：新增 Attack Chain 分段架构门后失败于脚本缺 `Test-AttackChainSectionPass`。
- 影响：同一链路重复写三条 PASS/evidence，B/C 链路缺证据时，总 release gate 仍可能误放行。
- 修复：新增 `Test-AttackChainSectionPass()`，分别复核 Attack Chain A、B、C 段落。
- 验证：A 段重复三条 evidence、B/C 为空的动态负例只卡 Attack Chain；A/B/C 各自完整样本 `EXPECTED_PASS`。
- 状态：总审计误放行风险已修复；真实三条攻击链人工验证仍未完成。

## Gray observation 单项脚本在 OBSERVING 状态可能误报 PASS

- 现象：`run-gray-observation.ps1` 原先只在 `NOT_STARTED` 或 `PASS` 字段不满足时追加 violation；`Status=OBSERVING` 且灰度 ID/开始时间齐全时可能生成 `Result: PASS`。
- 红灯：新增 gray observation 架构门后失败于脚本缺 `Status -eq "OBSERVING"` fail-loud。
- 影响：观察中证据包可能被误读为单项 gate 已完成，虽然总闸门会继续挡住，但证据链本身不够 fail loud。
- 修复：`Status=OBSERVING` 时强制追加 `Gray observation is still running.` violation。
- 验证：OBSERVING 动态样本 `EXPECTED_FAIL`；完整 PASS 样本 `EXPECTED_PASS`；正式 gray report 仍 `FAIL`。
- 状态：单项误报风险已修复；真实灰度观察仍未开始。

## Hosted CI 单项脚本允许手填 RunUrl 绕过 gh run 失败

- 现象：`run-hosted-ci-evidence.ps1` 原先只在 `gh run list` 失败且 `RunUrl` 为空时追加 violation；如果手填 RunUrl、RunId 和 Evidence，单项脚本可能不再因 `gh run` 查询失败而 fail loud。
- 红灯：新增 hosted CI 架构门后失败于脚本缺 `gh run list must succeed in the authorized hosted CI evidence environment.`。
- 影响：授权环境不可查询 GitHub Actions run 时，手填字段可能让单项 hosted CI 报告误表达为可关闭，削弱 release gate 的远端 runner 可审计性。
- 修复：`ghRun.ExitCode -ne 0` 现在无条件追加 violation，不再由 `RunUrl` 是否存在决定。
- 验证：合法 RunUrl/数字 RunId/job summary 动态样本仍 `EXPECTED_FAIL`；正式 `hosted-ci-20260602.md` 仍 `Result: FAIL`；Hosted/ReleaseGate 架构过滤 `12/12 passed`。
- 状态：单项误放行风险已修复；真实 hosted CI 仍需 GitHub 授权环境提供 PASS run 证据。

## Staging rehearsal 未报告 EF migration 实际连接串

- 现象：`run-staging-rehearsal.ps1` 报告头只写 `ConnectionStrings__DefaultConnection: Host=postgresql...`，但 `dotnet ef database update` 实际设置的是 `Host=localhost...`。
- 红灯：新增 staging 架构门后失败于脚本缺 `$migrationConnectionString`。
- 影响：API 容器连接串和宿主机迁移连接串混在一起时，staging rehearsal 证据不够可追溯，后续审计难以判断 migrations 实际连接到哪里。
- 修复：新增 `$migrationConnectionString` 变量，报告头显式写 `Migration connection string: Host=localhost...`，EF migration 也使用同一变量。
- 验证：正式 staging 报告仍因 Docker 不可用 `EXPECTED_FAIL`，但已写明两条连接串用途；Staging/ReleaseGate 架构过滤 `12/12 passed`。
- 状态：证据精度风险已修复；真实 staging rehearsal 仍需 Docker/PostgreSQL 环境完成。

## Attack Chain 单项脚本接受占位 evidence

- 现象：`run-attack-chain-verification.ps1` 原先只检查 evidence 非空；`TBD`、`PENDING`、`待补` 等占位词也可能让 A/B/C evidence 条件通过。
- 红灯：新增 Attack Chain 架构门后失败于脚本缺 `Test-RealEvidence`。
- 影响：人工验证报告可能用占位字符串伪装成已补证据，削弱安全签字前置闸门。
- 修复：新增 `Test-RealEvidence()`，空值和常见占位词都视为无效 evidence，并写入 `Evidence cannot be a placeholder.` violation。
- 验证：占位 evidence 动态样本 `EXPECTED_FAIL`；正式 Attack Chain 报告仍 `FAIL`；AttackChain/ReleaseGate 架构过滤 `12/12 passed`。
- 状态：占位证据误放行风险已修复；真实 A/B/C 人工验证仍需补齐。

## Security signoff 总闸门接受占位 signer/evidence

- 现象：`run-release-gate-audit.ps1` 原先对 Security signoff 的 `Signer` 和 `Evidence` 只要求非空；`TBD` 这类占位词可能通过总闸门 predicate。
- 红灯：扩展 security signoff 架构门后失败于总审计脚本缺 `Test-RealEvidence`。
- 影响：签字包可能写成 SIGNED 但 signer/evidence 仍是占位值，导致安全签字 gate 误放行。
- 修复：总审计新增 `Test-RealEvidence()`，Security signoff 的 signer 和 evidence 均必须为非占位值。
- 验证：临时负例只卡 Security signoff；合法样本 `EXPECTED_PASS`；SecuritySignoff/ReleaseGate 架构过滤 `11/11 passed`；正式总审计仍 `FAIL`。
- 状态：占位签字误放行风险已修复；真实人工签字仍未完成。

## Attack Chain 总闸门接受占位 verifier/evidence

- 现象：`run-release-gate-audit.ps1` 原先对 Attack Chain 的 Verifier 和 Evidence 只要求非空；手工拼出的 `VERIFIED` + `TBD` 报告可能绕过单项脚本后进入总审计。
- 红灯：收紧 Attack Chain 总审计架构门后失败于 predicate 内未调用 `Test-RealEvidence`。
- 影响：Attack Chain A/B/C 可能被占位证据误关闭，削弱安全签字前置条件。
- 修复：总审计在 Attack Chain verifier、总 evidence 计数和 A/B/C 分段 evidence 中全部使用 `Test-RealEvidence()`。
- 验证：临时负例只卡 Attack Chain；合法样本 `EXPECTED_PASS`；AttackChain/ReleaseGate 架构过滤 `12/12 passed`；正式总审计仍 `FAIL`。
- 状态：总闸门占位证据误放行风险已修复；真实 Attack Chain 人工验证仍未完成。

## Hosted CI 接受占位 job summary

- 现象：`run-hosted-ci-evidence.ps1` 原先只检查 Evidence 非空；总审计只要求 Evidence 包含 `job summary`，因此 `TBD` 或 `job summary: TBD` 可能进入 hosted CI 证据。
- 红灯：扩展 hosted CI 架构门后失败于单项脚本缺 `Test-RealEvidence`，总审计未拒绝占位 job summary。
- 影响：远端 runner 证据可能被占位摘要伪装，削弱 hosted CI release gate 的可审计性。
- 修复：单项脚本和总闸门都使用 `Test-RealEvidence()`；占位词本身或冒号后的主体为占位词都无效。
- 验证：单项占位 Evidence `EXPECTED_FAIL`；总闸门 `job summary: TBD` 只卡 Hosted CI；合法 job summary 样本 `EXPECTED_PASS`；HostedCi/ReleaseGate 架构过滤 `13/13 passed`。
- 状态：占位 job summary 误放行风险已修复；真实 hosted CI run 仍需外部授权环境提供。

## Gray observation 接受占位 evidence

- 现象：`run-gray-observation.ps1` 和总 release gate 原先只要求 Evidence 非空；`TBD` / `PENDING` / `待补` 可能被当成灰度观察证据。
- 红灯：扩展 gray observation 架构门后失败于单项脚本缺 `Test-RealEvidence`。
- 影响：灰度观察报告可能用占位词伪装 14 天无 P0/P1 观察证据，削弱墙钟 release gate。
- 修复：单项脚本和总闸门都用 `Test-RealEvidence()` 校验 Evidence；占位词本身或冒号后的主体为占位词都无效。
- 验证：单项占位 Evidence `EXPECTED_FAIL`；总闸门 `Evidence: TBD` 只卡 Gray observation；合法 observation evidence 样本 `EXPECTED_PASS`；GrayObservation/ReleaseGate 架构过滤 `12/12 passed`。
- 状态：占位灰度证据误放行风险已修复；真实首次灰度和 14 天观察仍未完成。

## Hosted CI 总审计按全报告统计 Exit code

- 现象：`run-release-gate-audit.ps1` 原先只统计全报告 `Exit code: 0` 数量，可能把 `git ls-remote` 成功当成 `gh run` 成功。
- 红灯：扩展 Hosted CI 总审计架构门后失败于缺少 `Test-SectionExitCodeZero`。
- 影响：Hosted CI 报告中 `gh run` 查询失败但其它命令成功时，总闸门可能误放行。
- 修复：新增 `Test-SectionExitCodeZero()`，Hosted CI 必须在 `## gh run` 段落内看到 `Exit code: 0`。
- 验证：`git ls-remote Exit code: 0` + `gh run Exit code: 1` 临时负例只卡 Hosted CI；`gh run Exit code: 0` 合法样本 `EXPECTED_PASS`；HostedCi/ReleaseGate 架构过滤 `13/13 passed`。
- 状态：段落级 exit code 误读风险已修复；真实 `gh run` 成功证据仍需授权环境提供。

## Staging 总审计按全报告统计 Exit code

- 现象：`run-release-gate-audit.ps1` 的 staging predicate 原先只统计全报告 `Exit code: 0` 数量，可能把无关段落成功当成 Docker、依赖启动、EF migration 或 API 启动成功。
- 红灯：扩展 staging 总审计架构门后失败于缺少四个 staging 段落级 `Test-SectionExitCodeZero` 调用。
- 影响：staging 报告中关键步骤失败但其它命令成功时，总闸门可能误放行 PostgreSQL/staging gate。
- 修复：`Test-StagingEvidencePass()` 改为要求 `Docker version`、`Start external dependencies`、`Apply EF migrations`、`Start API` 四段各自 `Exit code: 0`。
- 验证：四个关键段落 `Exit code: 1` + 四个无关 `Exit code: 0` 临时负例只卡 PostgreSQL/staging；四个关键段落均 `Exit code: 0` 合法样本 `EXPECTED_PASS`。
- 状态：段落级 exit code 误读风险已修复；真实 staging rehearsal 仍需 Docker/PostgreSQL 环境完成。

## Security signoff 总审计接受正文阻断状态

- 现象：`run-release-gate-audit.ps1` 的 Security signoff predicate 原先只要求签字字段、self-assessment 标题、Attack Chain 标题和 evidence；签字包正文仍写 `PENDING` / `FAIL` / `UNSIGNED` 时也可能通过该单项 predicate。
- 红灯：扩展 security signoff 总审计架构门后失败于缺少 `Test-NoBlockingSecuritySignoffText`。
- 影响：安全签字包可能自相矛盾：字段层面显示已签字，正文层面仍承认 Attack Chain 或签字状态未完成。
- 修复：新增 `Test-NoBlockingSecuritySignoffText()`，Security signoff predicate 拒绝含 `PENDING`、`UNSIGNED`、`FAIL` 的签字包正文。
- 验证：SIGNED 字段 + Attack Chain `PENDING` / `FAIL` 临时负例只卡 Security signoff；清除阻断词合法样本 `EXPECTED_PASS`。
- 状态：签字包自洽性风险已修复；真实安全签字仍需 human signer 完成。

## Hosted CI RunUrl 前缀匹配过宽

- 现象：`run-hosted-ci-evidence.ps1` 和 `run-release-gate-audit.ps1` 的 RunUrl 正则只锚定开头，`https://github.com/.../actions/runs/123/extra` 也可能通过 URL 形态校验。
- 红灯：扩展 hosted CI RunUrl 架构门后失败于缺少 `github.com/.+/actions/runs/\d+$`。
- 影响：Hosted CI 证据可能接受非精确 run 页面 URL，削弱 RunUrl/RunId 对齐的可审计性。
- 修复：两个脚本的 `Test-GitHubActionsRunUrl()` 都改为尾部锚定数字 run id。
- 验证：尾随 `/extra` 临时负例只卡 Hosted CI；精确 `/runs/123456` 合法样本 `EXPECTED_PASS`。
- 状态：RunUrl 形态误放行风险已修复；真实 hosted CI 仍需授权环境证据。

## Hosted CI RunUrl 与 RunId 可错配

- 现象：`run-hosted-ci-evidence.ps1` 和 `run-release-gate-audit.ps1` 原先只分别校验 RunUrl 形态和 RunId 数字格式，未确认二者指向同一个 run。
- 红灯：扩展 hosted CI RunUrl/RunId 架构门后失败于缺少 `Test-GitHubActionsRunUrlMatchesRunId`。
- 影响：Hosted CI 证据可能写入 `/actions/runs/123456` 但 `RunId: 999999`，削弱远端 run 证据的可审计性。
- 修复：新增一致性 predicate，从 RunUrl 尾部提取 run id 并与 RunId 精确比较；单项脚本和总闸门都使用该 predicate。
- 验证：RunUrl/RunId 错配临时负例只卡 Hosted CI；匹配合法样本 `EXPECTED_PASS`。
- 状态：RunUrl/RunId 错配误放行风险已修复；真实 hosted CI 仍需授权环境证据。

## Hosted CI gh run 输出未绑定 RunId

- 现象：`run-release-gate-audit.ps1` 原先只要求 `## gh run` 段落存在 `Exit code: 0`，未确认该段输出包含当前 RunId。
- 红灯：扩展 hosted CI 总审计架构门后失败于缺少 `Test-SectionContainsText`。
- 影响：Hosted CI 字段可能手写为某个 run，但 `gh run` 成功输出来自其它 run 或不含目标 run，削弱远端查询证据。
- 修复：新增 section contains predicate，Hosted CI 总闸门要求 `## gh run` 段落包含当前 `RunId`。
- 验证：`gh run` 段落只含其它 run id 的临时负例只卡 Hosted CI；包含当前 RunId 的合法样本 `EXPECTED_PASS`。
- 状态：CLI 输出与字段证据脱节风险已修复；真实 hosted CI 仍需授权环境证据。

## Hosted CI gh run RunId 子串误匹配

- 现象：`run-release-gate-audit.ps1` 原先用普通字符串包含判断 `gh run` 段落是否包含 RunId，可能把 `91234567` 当成包含 `123456`。
- 红灯：扩展 hosted CI 总审计架构门后失败于缺少 `Test-SectionContainsNumberToken`。
- 影响：`gh run` 输出若只有其它长数字 run id，仍可能误认为包含当前 RunId。
- 修复：`gh run` RunId 匹配改为数字 token 边界，目标 RunId 左右不能紧邻数字。
- 验证：`91234567` 子串样本只卡 Hosted CI；独立 `123456` 样本 `EXPECTED_PASS`。
- 状态：RunId 子串误匹配风险已修复；真实 hosted CI 仍需授权环境证据。

## Hosted CI 单项脚本未绑定 gh run 输出 RunId

- 现象：`run-hosted-ci-evidence.ps1` 原先只要求 `gh run list` exit code 为 0，未确认 CLI 输出包含传入的 RunId。
- 红灯：扩展 hosted CI 单项架构门后失败于缺少 `Test-TextContainsNumberToken`。
- 影响：单项 hosted CI 报告可能在 `gh run list` 查询到其它 run 时生成 PASS，弱证据包再依赖总审计兜底。
- 修复：单项脚本新增 number-token 匹配，`gh run list` 输出必须含独立目标 RunId。
- 验证：临时 `gh.cmd` 输出其它 run id 时单项脚本 `EXPECTED_FAIL`；输出目标 RunId 时 `EXPECTED_PASS`。
- 状态：单项证据与总闸门口径已对齐；真实 hosted CI 仍需授权环境证据。

## Gray observation 可用未来结束时间提前关闭

- 现象：`run-gray-observation.ps1` 和 `run-release-gate-audit.ps1` 原先只检查 `ObservationEndedAt - ObservationStartedAt >= 14 天`，未拒绝未来结束时间。
- 红灯：扩展 gray observation 架构门后失败于缺少 `ObservationEndedAt must not be in the future.`。
- 影响：灰度观察窗口可能被未来时间戳提前声明完成，破坏 v1.0.0 需要真实 14 天墙钟观察的硬约束。
- 修复：单项脚本和总闸门都要求 `ObservationEndedAt <= UtcNow`。
- 验证：未来结束时间样本单项和总审计均 `EXPECTED_FAIL`；过去满 14 天样本均 `EXPECTED_PASS`。
- 状态：未来时间误放行风险已修复；真实首次灰度和观察窗口仍未完成。

## Gray observation 时间线可乱序

- 现象：`run-gray-observation.ps1` 和 `run-release-gate-audit.ps1` 原先没有检查 `GrayStartedAt <= ObservationStartedAt`。
- 红灯：扩展 gray observation 架构门后失败于缺少 `GrayStartedAt must not be after ObservationStartedAt.`。
- 影响：灰度观察证据可能声明观察窗口早于灰度开始，时间线不自洽。
- 修复：单项脚本和总闸门都要求灰度开始时间不晚于观察开始时间。
- 验证：灰度开始晚于观察开始样本单项和总审计均 `EXPECTED_FAIL`；顺序正常且过去满 14 天样本均 `EXPECTED_PASS`。
- 状态：灰度观察时间线乱序风险已修复；真实首次灰度和观察窗口仍未完成。

## Gray observation P0/P1 计数字段可被备注 spoof

- 现象：`run-release-gate-audit.ps1` 原先用全报告 `Contains("P0/P1 incident counts: P0=0; P1=0")` 判断零事故，备注里出现相同文本也可能通过。
- 红灯：扩展 gray observation 总审计架构门后失败于缺少锚定行校验。
- 影响：真实计数字段非 0 时，报告正文仍可能用备注文本伪装成 P0/P1=0。
- 修复：总审计改为 `Test-AnchoredLiteralLine`，只接受独立 `P0/P1 incident counts: P0=0; P1=0` 行。
- 验证：真实计数字段 `P0=1; P1=0` + Notes spoof 文本样本 `EXPECTED_FAIL`；真实计数字段 `P0=0; P1=0` 样本 `EXPECTED_PASS`。
- 状态：P0/P1 计数字段 spoof 风险已修复；真实观察窗口仍未完成。

## Gray observation GrayReleaseId 接受占位值

- 现象：`run-gray-observation.ps1` 和 `run-release-gate-audit.ps1` 原先只要求 `GrayReleaseId` 非空，`TBD` 等占位词也可能通过。
- 红灯：扩展 gray observation 架构门后失败于缺少 `GrayReleaseId cannot be a placeholder.` 和 `GrayReleaseId` 的 `Test-RealEvidence`。
- 影响：首次灰度锚点可能是占位值，削弱 14 天观察窗口的起点证据。
- 修复：单项脚本和总闸门都用 `Test-RealEvidence()` 校验 `GrayReleaseId`。
- 验证：`GrayReleaseId=TBD` 样本单项和总审计均 `EXPECTED_FAIL`；`GrayReleaseId=gray-001` 样本均 `EXPECTED_PASS`。
- 状态：灰度 ID 占位误放行风险已修复；真实首次灰度仍未完成。

## Attack Chain VerifiedAt 接受未来时间

- 现象：`run-attack-chain-verification.ps1` 和 `run-release-gate-audit.ps1` 原先只要求 `VerifiedAt` 可解析，未来时间也可能通过。
- 红灯：扩展 Attack Chain 架构门后失败于缺少 `VerifiedAt must not be in the future.`。
- 影响：人工验证报告可能用未来时间提前关闭 Attack Chain A/B/C gate，削弱安全签字前置约束。
- 修复：单项脚本和总闸门都要求 `VerifiedAt <= UtcNow`。
- 验证：未来 `VerifiedAt` 样本单项和总审计均 `EXPECTED_FAIL`；过去 `VerifiedAt` 样本均 `EXPECTED_PASS`。
- 状态：未来验证时间误放行风险已修复；真实 Attack Chain 人工验证仍未完成。

## 项目规则缺少“现有功能精品级”硬约束

- 现象：原 `AGENTS.md` 已强调简单、外科手术式改动和 goal-driven，但没有明确禁止用浅层新增功能稀释现有功能质量。
- 影响：后续 A 轨可能误把“新增更多功能”当成推进，而不是先把用户关键路径的正确性、UX、可靠性、可观测性和测试证据做到精品级。
- 修复：已在根目录 `AGENTS.md` 增加 Core Convention，明确优先打磨现有功能，宁愿一个功能做到 100 分，也不做 100 个 1 分功能。
- 状态：规则缺口已修复；后续执行中如发现新增范围与现有关键路径打磨冲突，应按该约定优先打磨现有路径。

## Security signoff SignedAt 接受未来时间

- 现象：安全签字总闸门若只要求 `SignedAt` 可解析，未来时间也可能被误当成有效签字时间。
- 影响：签字包可能提前声明人工安全签字完成，削弱 Attack Chain A/B/C 和 human signer 之后的发布硬闸门。
- 修复：`run-release-gate-audit.ps1` 在解析 `SignedAt` 后要求时间不晚于当前 UTC 时间。
- 验证：未来 `SignedAt` 动态样本只卡 Security signoff；过去 `SignedAt` 且其它证据完整时临时总审计 PASS。
- 状态：未来签字时间误放行风险已修复；真实安全签字仍未由该片完成。

## Security signoff 未来 SignedAt 失败原因不够具体

- 现象：未来 `SignedAt` 能让 Security signoff gate FAIL，但报告原先只显示泛化的 `Security signoff release gate is not PASS.`。
- 影响：人工补证时需要额外排查是哪一个签字字段不满足，增加 1 人 review 带宽消耗。
- 修复：未来 `SignedAt` 时总审计报告追加 `SignedAt must not be in the future.`。
- 验证：未来时间动态样本报告已出现具体 violation；过去时间完整样本仍 PASS。
- 状态：失败原因可定位性已修复；正式安全签字仍未完成。
