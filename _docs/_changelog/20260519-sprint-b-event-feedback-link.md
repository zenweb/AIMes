# 2026-05-19 Sprint B — 事件建议进入反馈记录

## 触发

继续推进 Sprint B“三类事件触发 Agent”，让事件生成的 Agent 建议不只停留在展示层，而是能进入调度员采纳/拒绝复盘链路。

## 产出

- 更新 `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 当前 Agent 建议面板新增“采纳此建议”动作。
- 点击后会把事件建议写入排产页最近反馈记录：
  - 决策：已采纳 Agent 推荐
  - 原因：事件类型，例如急单插单事件
  - 说明：建议标题和建议动作
- 复用现有 `submitAdoptionFeedback` 同步后台，后台不可用时仍保留本地复盘记录。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：14 passed。

## 下一步

进入 Sprint C 前置：把生产报工、异常上报、缺料采购协同与排产事件队列打通，形成“事件 -> 建议 -> 采纳 -> 执行 -> 复盘”的闭环。
