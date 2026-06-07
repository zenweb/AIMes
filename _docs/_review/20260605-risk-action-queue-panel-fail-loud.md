# 2026-06-05 RiskActionQueuePanel Fail-loud Review

## Findings

- 审计结论：本片修复风险处置队列后端来源同步失败时中断整页基础队列的问题。
- 行为覆盖：`readAnomalyDispatchRecordsBackendFirst()` 抛错时，基础 `.action-card` 仍必须显示 3 张，第一张仍为 `WO-2026-0042 CNC 停机延期`。
- 可访问性覆盖：失败提示必须使用 `role="alert"` 和 `aria-live="assertive"`，并包含“异常分流风险加载失败”和后端失败原因。
- 稳定性覆盖：mounted 阶段不得出现 unhandled rejection；单个来源失败不得打断其它风险来源和基础队列渲染。
- TDD 证据：新增异常分流风险加载失败用例先失败于 mounted hook unhandled rejection 与 0 张卡；修复后目标 unit 变绿。
- 审计结论：本片同时修复 SLA 晨会复核读取失败时中断基础风险队列的问题。
- 行为覆盖：`readRiskSlaReviewRecordBackendFirst()` 抛错时，基础 `.action-card` 仍必须显示 3 张，并显示“风险 SLA 复核加载失败”和失败原因。
- 边界覆盖：SLA 复核读取失败必须降级为 `null`，不得阻断 `syncRiskActionQueue()`。
- TDD 证据：新增 SLA 复核加载失败用例先失败于 mounted hook unhandled rejection 与 0 张卡；修复后目标 unit 变绿。
- 审计结论：本片继续修复风险关闭动作留痕失败时的假闭环问题。
- 行为覆盖：普通关闭路径必须先写 `appendRiskActionTrace()`；写入失败时卡片保持原状态，不插入“已关闭”处置记录，并显示“风险关闭失败”。
- 跨模块覆盖：现场态势风险关闭时，风险留痕失败不得调用 `closeMonitoringSituationEscalation()`，避免现场处置包先被反写为闭环。
- 顺序覆盖：现场态势风险关闭成功时，`appendRiskActionTrace()` 只调用一次，且调用顺序早于 `closeMonitoringSituationEscalation()`。
- TDD 证据：关闭留痕失败用例先失败于 `已关闭` vs `待处置`；现场态势关闭用例先失败于 `closeMonitoringSituationEscalation()` 被调用。
- TDD 证据：现场态势关闭成功顺序用例先失败于 `appendRiskActionTrace()` 被调用 2 次；修复后目标 unit 变绿。
- 审计结论：本片继续修复风险转派动作留痕失败时的假转派问题。
- 行为覆盖：转派路径必须先按目标负责人写 `appendRiskActionTrace()`；写入失败时卡片保持“待处置”和原负责人，不插入“已转派”处置记录，并显示“风险转派失败”。
- TDD 证据：转派留痕失败用例先失败于 `已转派` vs `待处置`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 8 tests passed`；全量前端 unit coverage `82 files / 465 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.27%`，`RiskActionQueuePanel.vue` 行覆盖率 `84.74%`。

## Residual Risk

- 本片关闭异常分流来源失败时整页风险队列中断，以及 SLA 复核读取失败时阻断基础风险队列的缺口。
- 本片关闭普通风险和现场态势风险关闭留痕失败时的假闭环缺口。
- 本片关闭普通风险转派留痕失败时的假转派缺口。
- 生产异常、助手执行包、现场态势来源已使用同一来源级降级路径，但本片只新增了异常分流失败的目标断言；后续可继续为其它来源补专门测试。
- 仍可继续审计生产异常、助手执行包、现场态势来源失败路径；这些来源已走同一 fail-loud helper，但专门断言尚不完整。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据；当前仓库尚未绑定 GitHub remote，不能取得真实 GitHub Actions run。
