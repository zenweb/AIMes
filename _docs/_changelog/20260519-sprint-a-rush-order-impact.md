# 2026-05-19 Sprint A — 急单插单影响分析

## 触发

按 `_docs/_plan/20260519-function-deepening-brainstorm.md` 继续推进 Sprint A“排产可讲数字”，完成第 3 项“插单前影响分析”。

## 产出

- 新增 `src/frontend/src/components/schedule/RushOrderImpactPanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 在 AI 排产页新增“插单前先算账”急单影响分析面板。
- demo fallback 数据展示 `WO-RUSH-9001` 急单插入前的业务代价：
  - 受影响工单
  - 新增延期小时数
  - 换线增加分钟数
  - 缺料变化：`M-AL-6061 缺 12 件`
  - 建议动作：`建议加班插入`
- 提供 3 个调度选项：强插、加班、换设备，并标记推荐方案。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：11 passed。

## 下一步

继续 Sprint A-4：采纳/拒绝原因。需要把调度员对 Agent 推荐的采纳或拒绝动作沉淀为反馈记录，并能进入后续审计/复盘链路。
