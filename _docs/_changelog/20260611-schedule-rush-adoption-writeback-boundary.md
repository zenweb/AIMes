# 2026-06-11 急单采纳反馈与正式计划回写边界

## 背景

按精品化约定继续深化 AI 排产急单插单链路。本片不新增排产执行能力，只修正用户可见语义：调度员采纳 Agent 建议后，系统必须区分“反馈/复盘已写入”和“正式排产计划已写入”。

## 改动

- 急单事件建议采纳后，反馈同步提示补充“尚未写入正式排产计划”边界。
- 调度员 Agent 工作台的执行追踪把事件建议采纳状态标为“正式计划待优化或保存”，避免把复盘反馈误读成生产计划已落地。
- 保留既有外协到货排产释放语义；本片只约束普通事件建议采纳的边界提示。
- scheduling e2e 增加真实 Chrome 断言，确认急单采纳后页面同时显示 OTD 复盘信息和正式计划待写入边界。

## 验证

- `npm run test:unit -- schedule-board.test.ts -t "keeps rush-order adoption separate from formal schedule execution"`：passed
- `npm run test:unit -- schedule-agent-workbench-panel.test.ts`：3 passed
- `npm run test:unit -- schedule-board.test.ts`：23 passed
- `AIMES_E2E_PORT=4184 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + real Chrome，1 passed

