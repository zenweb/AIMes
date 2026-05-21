# 2026-05-20 Sprint D — OTD 改善复盘报告

## 触发

Sprint C 已打通“排产事件 -> 生产执行 -> 采购缺料 -> 风险下降”的闭环，本次继续 Sprint D“可销售演示”，先让系统能直接回答：“用了 AIMes 后，交期达成率到底提高了多少？为什么？”

## 产出

- 更新 `src/frontend/src/components/report/ReportBoard.vue`
- 更新 `src/frontend/src/types/report.ts`
- 新增 `src/frontend/tests/e2e/report.spec.ts`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 报表中心新增“OTD 改善复盘报告”。
- 展示 30 单演示数据集口径：
  - 人工基线 OTD 82.0%
  - Agent 推荐 OTD 96.0%
  - OTD 提升 +14%
- 展示可销售指标：
  - 延期减少 4 单
  - 换线减少 73 分钟
  - 急单保护 2 单
  - 决策留痕 9 条
- 展示改善原因：瓶颈设备合批、缺料闭环、锁定期保护、采纳反馈。
- 展示 5 分钟 demo 路径：生产概览 -> 风险预警 -> AI 排产 -> 采购协同 -> 报表中心。
- 展示 30 单样本节选，说明工单风险、Agent 动作和恢复结果。
- CSV 导出加入 OTD 复盘指标、改善原因和样本节选。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/report.spec.ts --reporter=list --workers=1 --retries=0`：2 passed。
- `node node_modules/@playwright/test/cli.js test tests/e2e/modules.spec.ts --reporter=list --workers=1 --retries=0`：8 passed。
- `node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`：79 passed。

## 下一步

继续 Sprint D-4：输出 POC 评估模板，并把演示路径沉淀成售前 checklist。
