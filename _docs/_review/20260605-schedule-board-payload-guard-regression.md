# 2026-06-05 ScheduleBoard Payload Guard Regression Review

## Findings

- 审计结论：新增测试锁定排产主入口对坏 API 载荷的 fail-loud fallback 行为。
- 计划载荷场景：`getCurrentPlan()` 返回 HTML / 非业务载荷时，页面不能把坏数据写入排产状态，必须显示演示排产 fallback。
- 设备载荷场景：`getEquipmentList()` 返回 HTML / 非业务载荷时，页面不能继续用坏设备数据生成甘特图，必须显示演示排产 fallback。
- 可访问性状态：fallback 原因继续通过 `role="status"` / `aria-live="polite"` 的 warnings-bar 暴露，不误用阻塞性 alert。
- 本片没有修改生产代码；当前实现已满足新增回归测试。

## Evidence

- 目标单测：`npm run test:unit -- tests/unit/schedule-board.test.ts`，15 tests passed。
- 全量前端静态检查：`npm run lint` 通过。
- 全量前端覆盖率：`npm run test:unit:coverage`，488 tests passed。
- 覆盖率增量：`ScheduleBoard.vue` 行覆盖率 `69.34% -> 69.73%`；总行覆盖率 `76.64% -> 76.66%`。

## Residual Risk

- `ScheduleBoard.vue` 分支覆盖率仍只有 `32.19%`，后续仍应优先覆盖用户必经的异步分支，而不是转回高覆盖组件。
- B-track 发布闸门仍缺 GitHub hosted CI、staging、攻击链、安全签字、灰度和观察窗口证据。
