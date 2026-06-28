# 2026-06-14 Issue - 完工成功后列表与摘要同步缺少显式证据

## Problem
- 生产完工成功路径已有 OTD/质量证据测试，但缺少列表卡片和顶部摘要同步的直接断言。
- 现场操作员依赖列表和 summary 判断工单状态；如果详情区完成但列表仍停在生产中，会造成执行误判。

## Resolution
- 新增 `ProductionBoard` 测试，完成 `WO-COMPLETE-LIST-SYNC` 的 in-progress 工序。
- 断言左侧工单卡片显示 completed、进度 100%、完成数量 30。
- 断言顶部 summary 同步出现已完成 1 和完成数 30。

## Verification
- `npm run test:unit -- tests/unit/production-board.test.ts`：25 passed。
- `npm run test:unit:coverage`：105 files / 760 tests passed。
