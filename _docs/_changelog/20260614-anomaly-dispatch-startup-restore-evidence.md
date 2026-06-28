# 2026-06-14 Changelog - Anomaly dispatch 启动恢复证据

## 变更
- 按覆盖率杠杆转向 `AnomalyBoard`，聚焦现场异常分流这个现有关键路径。
- 新增启动时恢复已确认异常分流记录的组件测试。
- 验证已确认的设备/物料分流在页面刷新后仍显示为“已确认分流”，并恢复最新分流 trace。

## 验证
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`：10 passed。
- `npm run test:unit:coverage`：105 files / 756 tests passed。
- 覆盖率：总 lines 83.90%，statements 80.32%，branches 65.09%，functions 77.07%。
- `AnomalyBoard.vue`：lines 77.07%，statements 71.03%，branches 58.95%，functions 63.82%。

## 说明
- 本片没有新增功能，只把现有启动恢复行为固化为回归证据。
- 15 天灰度观察按 owner 指令后置，不作为当前继续工作的阻塞项。
