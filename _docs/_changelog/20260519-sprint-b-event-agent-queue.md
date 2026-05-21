# 2026-05-19 Sprint B — 三类事件触发 Agent

## 触发

Sprint A 已完成“排产可讲数字”的前端演示闭环，继续推进 `_docs/_plan/20260519-function-deepening-brainstorm.md` 中的 Sprint B“三类事件触发 Agent”。

## 产出

- 新增 `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 在 AI 排产页新增“事件触发 Agent”队列。
- 覆盖三类事件：
  - 缺料事件：`M-AL-6061 齐套缺口`
  - 设备故障事件：`CNC 加工中心 01 健康下降`
  - 急单插单事件：`WO-RUSH-9001 客户插单`
- 每类事件可生成 Agent 重排建议，并展示：
  - 推荐动作
  - OTD 影响
  - 延期影响
  - 换线影响
- 这一步把排产页从“静态影响分析”推进到“事件 -> Agent 建议”的操作闭环。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：13 passed。

## 下一步

把事件队列的数据来源接到真实模块输入：风险预警、库存齐套、设备健康状态，并让生成的建议能进入采纳/拒绝反馈链路。
