# 2026-06-05 ScheduleBoard Fail-loud Changelog

## Initial Plan Load Failure Reason Slice

- 选片依据：按覆盖率杠杆从已收口的 `GanttChart.vue` 转向 `ScheduleBoard.vue`；排产主入口是调度员必经路径，最新行覆盖率低于已完成的 Gantt / Routing 路径。
- 问题：`loadData()` 在初始排产计划加载失败后会降级到演示排产，但 warning 只显示“后端排产服务不可用，当前显示演示排产数据”，没有带出后端失败原因。
- 风险：调度员看到演示排产 fallback 时，无法判断是当前计划 API、设备 API、网络还是权限失败，排查成本高。
- 修复：`loadData()` catch 中保留演示排产 fallback，同时将 `errorMessage(e)` 拼入 warnings-bar。
- 行为保持：仍使用本地演示排产兜底；`error` banner 不被误用；risk event fallback、指标和甘特数据转换逻辑保持原样。
- 测试：新增 TDD 用例 `keeps the backend load failure reason visible when falling back to the demo schedule`，先红于 warning 缺少 `current plan API unavailable`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/schedule-board.test.ts` 通过，`1 file / 12 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 480 tests passed`，总行覆盖率 `76.85%`，`ScheduleBoard.vue` 行覆盖率 `68.88%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 排产主入口可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
