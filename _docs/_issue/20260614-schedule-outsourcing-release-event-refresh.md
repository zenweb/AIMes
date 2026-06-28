# 2026-06-14 Issue - 外协释放后事件队列仍显示已到货

## Problem
- 调度员采纳“外协到货后的排产释放复核”建议后，释放审计已归档。
- 建议卡会显示“外协排产释放已确认”，但事件队列仍可能显示“法兰组件 外协到货已确认”。
- 根因是 `loadRiskTriggeredEvents` 重新增强事件时，backend-first 读回同一外协包的旧状态并覆盖了本地释放态。

## Resolution
- 在 `applyShortageResolutionToEvents` 中保留已有 `scheduleReleaseTraceId` 的同源外协包。
- 只有当 backend-first 返回不同 source 或当前没有释放态时，才用 backend-first 结果替换。
- 新增测试覆盖释放后的事件队列标题、窗口、证据和 OTD 复盘说明。

## Verification
- `npm run test:unit -- tests/unit/schedule-board.test.ts`：40 passed。
- `npm run test:unit:coverage`：105 files / 758 tests passed。
