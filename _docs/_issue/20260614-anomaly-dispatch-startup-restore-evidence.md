# 2026-06-14 Issue - 异常分流启动恢复缺少回归证据

## Problem
- 现场异常分流确认后，用户刷新页面仍需要看到哪些分流已经确认。
- 如果启动恢复没有回归证据，后续改动可能让已确认分流按钮回到“确认分流”，造成重复操作和审计误判。

## Resolution
- 新增 `AnomalyBoard` 组件测试，模拟后端返回两条已确认分流记录。
- 断言设备与物料事件按钮恢复为“已确认分流”，未确认的质量事件保持“确认分流”。
- 断言最新 trace 区域恢复设备分流标题、状态和 traceId。

## Verification
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`：10 passed。
- `npm run test:unit:coverage`：105 files / 756 tests passed。
