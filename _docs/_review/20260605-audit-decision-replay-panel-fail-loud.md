# 2026-06-05 AuditDecisionReplayPanel Fail-loud Review

## Findings

- 审计结论：本片修复审计回放关键配置审批加载失败时没有 fail-loud 的问题。
- 行为覆盖：`readAgentConfigApprovalsBackendFirst()` 抛错时，基础 `.decision-card` 仍必须显示，配置待审批计数保持 `0`，并显示 `.replay-sync-alert`。
- 可访问性覆盖：失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含“配置审批加载失败”和后端失败原因。
- 稳定性覆盖：mounted 阶段不得出现 unhandled rejection；单个 backend-first 来源失败不得打断其它审计回放来源继续加载。
- TDD 证据：新增配置审批加载失败用例先失败于 mounted hook unhandled rejection 与缺失 alert；修复后目标 unit 变绿。
- 审计结论：本片同时修复业务落库审计 API 失败被内部吞掉的问题。
- 行为覆盖：`getAuditLogs('AgentExecutePurchaseAction')` 抛错时，基础 `.decision-card` 仍必须显示，并通过 `.replay-sync-alert` 显示“业务落库审计加载失败”和失败原因。
- 边界覆盖：列表读取失败必须 fail loud；单条 `getAuditLogDetail()` 失败仍只忽略该条，避免一个详情坏掉阻断整批业务落库审计。
- TDD 证据：新增业务落库审计 API 失败用例先失败于缺失 alert；修复后目标 unit 变绿。
- 审计结论：本片同时修复单个业务落库审计动作类型失败时冲掉其它成功批次的问题。
- 行为覆盖：采购动作回放成功、质量动作 `getAuditLogs()` 失败时，采购落库回放必须仍显示为选中详情，并显示“业务落库审计加载失败”和质量 API 失败原因。
- 边界覆盖：部分失败必须 fail loud 但不能丢失成功批次；全部失败仍降级为基础回放卡片。
- TDD 证据：新增部分业务落库审计失败用例先失败于采购成功回放丢失；修复后目标 unit 变绿。
- 审计结论：本片同时修复单条业务落库审计详情失败被静默吞掉的问题。
- 行为覆盖：同一动作列表里一个 `getAuditLogDetail()` 成功、另一个失败时，成功业务落库回放必须仍显示，并显示“业务落库审计详情加载失败”和失败原因。
- 边界覆盖：详情失败必须 fail loud 但不能阻断同批次成功详情；列表级失败仍显示“业务落库审计加载失败”。
- TDD 证据：新增详情失败用例先失败于缺失 alert；修复后目标 unit 变绿。
- 审计结论：本片同时修复业务落库审计详情载荷损坏被静默过滤的问题。
- 行为覆盖：同一动作列表里一个详情载荷合法、另一个 `newValues` JSON 损坏时，合法业务落库回放必须仍显示，并显示“业务落库审计详情加载失败”和损坏 audit id。
- 边界覆盖：解析失败必须 fail loud 但不能阻断同批次成功详情；合法但没有 `businessWrite` 的详情仍可被过滤为非业务落库回放。
- TDD 证据：新增载荷损坏用例先失败于缺失 alert；修复后目标 unit 变绿。
- 审计结论：本片同时修复未知业务落库资源被静默过滤的问题。
- 行为覆盖：同一动作列表里一个采购业务落库详情成功、另一个 `businessWrite.resource = warehouse-transfer` 时，采购回放必须仍显示，并显示“不支持的业务落库资源”和损坏 audit id。
- 边界覆盖：未知资源必须 fail loud 但不能阻断同批次成功详情；已支持资源清单保持采购、质量、设备三类。
- TDD 证据：新增未知资源用例先失败于缺失 alert；修复后目标 unit 变绿。
- 审计结论：本片同时修复业务落库审计详情载荷缺失被静默过滤的问题。
- 行为覆盖：同一动作列表里一个采购业务落库详情成功、另一个详情 `newValues = null` 时，采购回放必须仍显示，并显示“审计载荷缺失”和缺失 audit id。
- 边界覆盖：缺失载荷必须 fail loud 但不能阻断同批次成功详情。
- TDD 证据：新增载荷缺失用例先失败于缺失 alert；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 11 tests passed`；全量前端 unit coverage `82 files / 459 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.02%`，`AuditDecisionReplayPanel.vue` 行覆盖率 `64.81%`。

## Residual Risk

- 本片关闭配置审批来源失败时静默误报 0 个待审批、mounted hook unhandled rejection、业务落库审计 API 失败被误报为没有业务落库回放、部分业务落库审计失败冲掉成功批次、单条审计详情失败被静默吞掉、审计详情载荷损坏被静默过滤、未知业务落库资源被静默过滤，以及审计详情载荷缺失被静默过滤的缺口。
- 其它审计来源现在也会来源级 fail-loud，但只新增了配置审批失败的目标断言；后续可继续为 POC 签署、质量推荐、业务落库审计等来源补专门测试。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据；当前仓库尚未绑定 GitHub remote，不能取得真实 GitHub Actions run。
