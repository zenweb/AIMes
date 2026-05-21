# 2026-05-19 Sprint A — 采纳/拒绝反馈闭环

## 触发

按 `_docs/_plan/20260519-function-deepening-brainstorm.md` 继续推进 Sprint A“排产可讲数字”，完成第 4 项“采纳/拒绝原因”。

## 产出

- 新增 `src/frontend/src/components/schedule/ScheduleFeedbackPanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 在 AI 排产页新增“人机协同复盘”反馈条。
- 调度员可以选择反馈原因：
  - 保护交期
  - 急单插入
  - 物料约束
  - 瓶颈设备
  - 换线成本
  - 人工经验
- 支持填写补充说明，并对 Agent 推荐执行“采纳方案”或“拒绝方案”。
- 页面会即时展示最近反馈记录，包括决策、原因、优化目标、说明和时间。
- 复用现有 `submitAdoptionFeedback` 接口同步后台；后台不可用时保留本地复盘记录，保证演示闭环不断。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：12 passed。

## 下一步

进入 Sprint B：三类事件触发 Agent。优先把缺料、设备故障、急单插单从静态展示推进到可生成重排建议的事件队列。
