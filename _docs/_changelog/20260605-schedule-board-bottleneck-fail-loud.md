# 2026-06-05 ScheduleBoard Bottleneck Fail-loud Changelog

## Bottleneck Equipment Lookup Warning Slice

- 选片依据：排产主入口仍是用户必经路径；审计发现 `getBottleneckEquipmentIds()` 单独失败时被静默降级为 `undefined`。
- 问题：计划和设备列表加载成功，但后端瓶颈设备识别失败时，甘特图继续渲染却不提示“后端瓶颈标记缺失”。
- 风险：调度员可能误以为当前甘特图已包含瓶颈设备标记，影响瓶颈窗口、换线和交付风险判断。
- 修复：瓶颈设备读取失败时保留排产计划和甘特图渲染，同时通过 `warnings-bar` / `role="status"` / `aria-live="polite"` 显示失败原因。
- 行为保持：主计划、设备列表、演示排产 fallback、优化失败 error banner 和风险事件 fallback 逻辑保持原样。
- 测试：新增 TDD 用例 `keeps the plan visible and warns when bottleneck equipment lookup fails`，先红于页面没有 `warnings-bar`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/schedule-board.test.ts` 通过，`1 file / 13 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 482 tests passed`，总行覆盖率 `76.88%`，`ScheduleBoard.vue` 行覆盖率 `69.20%`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 排产主入口可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
