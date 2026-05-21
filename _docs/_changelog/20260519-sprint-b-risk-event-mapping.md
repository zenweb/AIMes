# 2026-05-19 Sprint B — 风险数据映射为排产事件

## 触发

继续推进 Sprint B“三类事件触发 Agent”，把事件队列从纯前端 demo 数据升级为可承接跨模块风险输入。

## 产出

- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- AI 排产页加载成功后会尝试读取 `risk/dashboard`。
- 风险接口可用时，将风险预警映射成排产事件：
  - `materialRisks` -> 缺料事件
  - `equipmentRisks` -> 设备故障事件
  - `orderRisks` -> 急单/交期事件
- 风险接口不可用时保留三类 demo fallback，不影响演示。
- Agent 建议生成从固定事件 ID 扩展为按事件类型兜底，动态风险事件也能生成重排建议。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：13 passed。

## 下一步

把事件建议与采纳/拒绝反馈链路合并：调度员采纳某个事件建议时，应把事件 ID、事件类型、建议动作和原因一起沉淀到复盘记录。
