# 2026-06-05 RiskActionQueuePanel Fail-loud Changelog

## Source Sync Failure Slice

- 选片依据：`RiskActionQueuePanel.vue` 当前行覆盖率低于多数用户必经模块，且风险处置队列是现场异常、SLA 晨会、跨模块责任动作和发布复核的关键入口。
- 问题：风险队列 mounted 阶段读取后端优先来源时，任一来源失败会触发 mounted hook unhandled rejection，并导致基础风险卡无法渲染。
- 风险：异常分流等来源 API 不可用时，用户会看到空队列或未处理异常，误判没有待处置风险；调度员 Agent 触发器失去基础兜底。
- 修复：风险来源读取改为来源级 fail-loud；失败来源降级为空，显示 `role="alert"` / `aria-live="assertive"` 的“异常分流风险加载失败：...”提示，基础 3 张风险卡继续显示。
- 测试：新增 TDD 用例 `keeps base risk cards visible and alerts when anomaly dispatch risks fail to load`，先红于 mounted hook unhandled rejection 与 0 张风险卡，再最小修复。
- 验证：`npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 460 tests passed`，总行覆盖率 `76.03%`，`RiskActionQueuePanel.vue` 行覆盖率 `65.13%`。
- 验证：`npm run lint` 通过。

## SLA Review Sync Failure Slice

- 问题：mounted 阶段先读取 `readRiskSlaReviewRecordBackendFirst()`，如果 SLA 复核记录加载失败，会在风险队列同步前产生 unhandled rejection，基础风险卡无法渲染。
- 风险：SLA 复核 API 不可用时，用户可能误判风险处置队列为空，错过基础工单延期、物料缺口和设备健康风险。
- 修复：SLA 复核读取失败时降级为 `null`，显示 `role="alert"` / `aria-live="assertive"` 的“风险 SLA 复核加载失败：...”提示，并继续同步基础风险队列。
- 行为保持：SLA 复核读取成功时仍显示复核卡；读取失败时仅复核卡缺失，基础风险卡和其它来源继续渲染。
- 测试：新增 TDD 用例 `keeps base risk cards visible and alerts when SLA review fails to load`，先红于 mounted hook unhandled rejection 与 0 张风险卡，再最小修复。
- 验证：`npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 461 tests passed`，总行覆盖率 `76.04%`，`RiskActionQueuePanel.vue` 行覆盖率 `66.07%`。
- 验证：`npm run lint` 通过。

## Close Trace Failure Slice

- 问题：风险关闭按钮会先把卡片状态改为 `closed`，再调用 `appendRiskActionTrace()`；留痕写入失败时，UI 仍显示“已关闭”并插入关闭记录。
- 风险：风险处置审计链失败时，调度员可能误判风险已闭环，发布审计也会出现“界面关闭但无处置留痕”的断链。
- 修复：普通关闭路径改为先写风险处置留痕，成功后才更新状态和处置记录；失败时保持原状态，并显示“风险关闭失败：...”。
- 问题：现场态势风险关闭分支会先调用 `closeMonitoringSituationEscalation()` 反写现场处置包，再写风险处置留痕。
- 风险：风险留痕失败时，下游现场处置包可能已经被反写为闭环，形成跨模块假闭环。
- 修复：现场态势关闭同样先通过 `recordRiskAction()`，只有风险留痕成功后才允许反写现场处置包。
- 测试：新增 TDD 用例 `keeps the risk open when close trace cannot be archived`，先红于 `已关闭` vs `待处置`。
- 测试：新增 TDD 用例 `does not close monitoring situation packages when close trace cannot be archived`，先红于 `closeMonitoringSituationEscalation()` 已被调用。
- 修复：现场态势关闭成功路径去掉重复 `recordRiskAction()`，保证风险关闭留痕只写一次，且调用顺序早于现场处置包反写。
- 测试：新增 TDD 用例 `archives monitoring situation close trace once before closing the package`，先红于 `appendRiskActionTrace()` 被调用 2 次。
- 验证：`npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 464 tests passed`，总行覆盖率 `76.22%`，`RiskActionQueuePanel.vue` 行覆盖率 `80.7%`。
- 验证：`npm run lint` 通过。

## Reassignment Trace Failure Slice

- 问题：风险转派按钮会先把卡片状态改为 `assigned`、负责人改为“班组长 孙八”并插入处置记录，再调用 `appendRiskActionTrace()`。
- 风险：转派留痕写入失败时，UI 仍显示“已转派”，形成“界面责任已转移但审计链无证据”的假转派。
- 修复：转派路径改为先按目标负责人写风险处置留痕，成功后才更新卡片状态、负责人和处置记录；失败时保持原状态，并显示“风险转派失败：...”。
- 测试：新增 TDD 用例 `keeps the risk open when reassignment trace cannot be archived`，先红于 `已转派` vs `待处置`。
- 验证：`npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 465 tests passed`，总行覆盖率 `76.27%`，`RiskActionQueuePanel.vue` 行覆盖率 `84.74%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端风险队列可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
