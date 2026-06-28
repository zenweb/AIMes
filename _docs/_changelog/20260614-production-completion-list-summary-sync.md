# 2026-06-14 Changelog - Production 完工列表与摘要同步证据

## 变更
- 按覆盖率杠杆转向 `ProductionBoard`，聚焦现场完工后的现有展示一致性。
- 新增完工成功后列表卡片和顶部摘要同步测试。
- 断言完工后列表卡片转为 completed、进度 100%、完成数量 30，摘要同步为已完成 1、完成数 30。

## 验证
- `npm run test:unit -- tests/unit/production-board.test.ts`：25 passed。
- `npm run test:unit:coverage`：105 files / 760 tests passed。
- 覆盖率：总 lines 83.98%，statements 80.41%，branches 65.26%，functions 77.25%。
- `ProductionBoard.vue`：lines 78.82%，statements 76.00%，branches 71.15%，functions 73.45%。

## 说明
- 本片没有改生产代码；现有实现已满足列表/摘要同步，只补显式回归证据。
- 灰度观察继续按 owner 指令后置，不纳入当前 stop condition。
