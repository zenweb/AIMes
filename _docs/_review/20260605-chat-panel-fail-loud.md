# 2026-06-05 ChatPanel Fail-loud Review

## Findings

- 审计结论：本片修复 AI 助手交期恢复执行包已生成后，路由跳转失败导致业务动作被误报为失败的问题。
- 行为覆盖：`writeAssistantRecoveryPackage()` 成功、`router.push('/scheduling')` 失败时，页面必须保留完成状态和执行包卡片，并显示 `[role="alert"]` 说明页面跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手异常处置卡已创建后，路由跳转失败导致业务动作被误报为失败的问题。
- 行为覆盖：`writeAssistantAnomalyDispositionPackage()` 成功、`router.push('/anomaly')` 失败时，页面必须保留完成状态和处置卡卡片，并显示 `[role="alert"]` 说明页面跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手工程约束复核包已生成后，路由跳转失败导致业务动作被误报为失败的问题。
- 行为覆盖：`writeAssistantEngineeringConstraintPackage()` 成功、`router.push('/scheduling')` 失败时，页面必须保留完成状态和复核包卡片，并显示 `[role="alert"]` 说明页面跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手客户交付恢复承诺包已生成后，路由跳转失败导致业务动作被误报为失败的问题。
- 行为覆盖：`writeOtdKpiCommitmentPackage()` 成功、`router.push('/report')` 失败时，页面必须保留完成状态和承诺包卡片，并显示 `[role="alert"]` 说明页面跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手 BOM 齐套包和 OTD 证据已生成后，路由跳转失败导致业务动作被误报为失败的问题。
- 行为覆盖：`writeBomKittingPackage()` 与 `upsertOtdEvidenceChainRecord()` 成功、`router.push('/bom')` 失败时，页面必须保留完成状态和齐套包卡片，并显示 `[role="alert"]` 说明页面跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手设备停机复核包和 OTD 证据已生成后，路由跳转失败导致业务动作被误报为失败的问题。
- 行为覆盖：`writeEquipmentDowntimeEvent()` 与 `upsertOtdEvidenceChainRecord()` 成功、`router.push('/equipment')` 失败时，页面必须保留完成状态和停机包卡片，并显示 `[role="alert"]` 说明页面跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手 OTD/POC 复盘 CSV 已导出后，报表中心跳转失败导致导出动作被误报为失败的问题。
- 行为覆盖：`exportActionReport()` 成功、`router.push('/report')` 失败时，页面必须保留完成状态，并显示 `[role="alert"]` 说明报表中心跳转失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为二级跳转失败改成失败审计。
- 审计结论：本片同时修复 AI 助手 OTD/POC 复盘 CSV 已触发下载后，object URL 清理失败导致导出动作被误报为失败的问题。
- 行为覆盖：`URL.revokeObjectURL()` 失败时，页面必须保留完成状态，并显示 `[role="alert"]` 说明下载链接清理失败。
- 审计覆盖：同一场景下 `recordAssistantActionAudit()` 必须仍以 `permitted: true` 记录已执行动作，不能因为下载后的清理失败改成失败审计。
- 审计结论：本片同时修复 AI 助手启动上下文同步失败时 mounted hook 产生 unhandled error 的问题。
- 行为覆盖：`readAnomalyDispatchRecordsBackendFirst()` 等 backend-first 上下文读取失败时，面板必须保留聊天入口，并显示 `[role="alert"]` 说明“助手上下文同步失败”与失败原因。
- 可访问性覆盖：启动同步失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，避免用户在助手上下文缺失时无感继续操作。
- 审计结论：本片同时修复 AI 助手 OTD/POC 复盘 CSV 在下载准备阶段失败时文案过泛的问题。
- 行为覆盖：`URL.createObjectURL()` 失败时，不得显示完成状态，不得跳转报表中心，必须记录 `permitted: false`，并显示 `[role="alert"]` 说明“OTD/POC 复盘 CSV 下载准备失败”与失败原因。
- 边界覆盖：该路径属于导出未完成；不同于已触发下载后的跳转失败或清理失败，不能保留“已生成 CSV”的完成态。
- 审计结论：本片同时修复 AI 助手 OTD/POC 复盘 CSV 在下载点击失败时不释放已创建 object URL 的问题。
- 行为覆盖：`HTMLAnchorElement.click()` 失败时，必须调用 `URL.revokeObjectURL('blob:otd-report')`，不得显示完成状态，不得跳转报表中心，必须记录 `permitted: false`。
- 边界覆盖：点击失败仍属于导出未完成，用户应看到“OTD/POC 复盘 CSV 下载准备失败”和原始点击失败原因；清理失败不得覆盖点击失败主因。
- 审计结论：本片同时修复 AI 助手重新打开时聊天历史加载失败被静默成空状态的问题。
- 行为覆盖：`getChatHistory()` 失败时，页面必须显示 `[role="alert"]` 的“聊天历史加载失败”和失败原因，并保留聊天输入入口。
- 边界覆盖：历史接口失败不能被等同于“没有历史消息”；历史成功且为空时仍允许显示既有空状态。
- 审计结论：本片继续修复 AI 助手 LLM 状态加载失败被静默吞掉的问题。
- 行为覆盖：`getLlmStatus()` 失败时，页面必须显示 `[role="alert"]` 的“LLM 状态加载失败”和失败原因，不显示模型徽标，并保留聊天输入入口。
- 边界覆盖：LLM 状态不可观测不能被等同于正常无徽标；该失败只影响模型状态展示，不阻断知识库问答或离线演示回答。
- 审计结论：本片继续修复 AI 助手启动上下文同步中单来源失败短路其它来源的问题。
- 行为覆盖：`readAnomalyDispatchRecordsBackendFirst()` 失败后，`readMonitoringSituationEscalationsBackendFirst()` 与 `readRiskSlaReviewRecordBackendFirst()` 仍必须被调用。
- 边界覆盖：单个上下文来源失败只降级该来源并显示 alert，不得跳过其它可用证据来源。
- TDD 证据：新增用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增异常处置卡用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增工程约束复核包用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增客户承诺包用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增 BOM 齐套包用例先校正 OTD 证据字段断言，再失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增设备停机包用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增 CSV 导出用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增 CSV 清理失败用例先失败于 `recordAssistantActionAudit` 收到 `permitted: false`；修复后目标 unit 变绿。
- TDD 证据：新增启动上下文同步失败用例先失败于 mounted hook unhandled rejection 与缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增 CSV 下载准备失败用例先失败于缺失专用失败文案；修复后目标 unit 变绿。
- TDD 证据：新增 CSV 下载点击失败用例先失败于 `URL.revokeObjectURL()` 未调用；修复后目标 unit 变绿。
- TDD 证据：新增聊天历史加载失败用例先失败于缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增 LLM 状态加载失败用例先失败于缺失 alert；修复后目标 unit 变绿。
- TDD 证据：新增启动上下文来源级失败用例先失败于后两个来源调用次数为 `0`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 32 tests passed`；全量前端 unit coverage `82 files / 467 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.28%`，`ChatPanel.vue` 行覆盖率 `61.2%`。

## Residual Risk

- 本片已关闭交期恢复执行包、异常处置卡、工程约束复核包、客户交付恢复承诺包、BOM 齐套包、设备停机复核包、OTD/POC CSV 导出、启动上下文同步、CSV 下载准备失败、下载点击失败清理和聊天历史加载失败的 fail-loud 缺口。
- 本片同时关闭 LLM 状态加载失败静默降级的可观测性缺口。
- 本片同时关闭启动上下文同步单来源失败短路其它来源的证据缺口。
- `ChatPanel.vue` 行覆盖率已到 `61.2%`；下一片建议重新按覆盖率杠杆比较 `RoutingBoard.vue`、`AuditDecisionReplayPanel.vue` 或继续审计 AI 助手更高风险业务动作路径。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据；当前仓库尚未绑定 GitHub remote，不能取得真实 GitHub Actions run。
