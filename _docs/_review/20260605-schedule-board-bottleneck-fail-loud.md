# 2026-06-05 ScheduleBoard Bottleneck Fail-loud Review

## Findings

- 审计结论：本片修复排产主入口瓶颈设备识别失败被静默吞掉的问题。
- 行为覆盖：`getBottleneckEquipmentIds()` 抛错时，`api.getCurrentPlan()` 和 `api.getEquipmentList()` 成功结果仍用于渲染当前排产甘特图。
- Fail-loud 覆盖：同一场景必须显示 polite warning，并包含“瓶颈设备识别失败”和后端失败原因。
- 状态覆盖：不显示红色 error banner，不进入“当前显示演示排产数据”的 fallback。
- TDD 证据：新增用例先红于页面缺少 `.warnings-bar`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 13 tests passed`；全量前端 unit coverage `82 files / 482 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.88%`，`ScheduleBoard.vue` 行覆盖率 `69.20%`。

## Residual Risk

- `ScheduleBoard.vue` 仍可继续审计 Agent 建议采纳、复杂事件合并和部分异步证据读取边界。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据。
