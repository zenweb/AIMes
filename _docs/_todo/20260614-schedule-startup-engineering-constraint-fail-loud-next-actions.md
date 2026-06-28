# 2026-06-14 TODO - 排产启动工程约束 Fail-Loud 后续

## 下一步
- 优先继续追真实浏览器证据里的 scheduling/dhtmlx 残留失败。
- 从 `src/frontend/test-results` 中 4 个失败用例的 `error-context.md` 入手，确认 `.gantt-e2e-markers` 出现的含义。
- 检查 `GanttChart.vue` 与 `scheduling.spec.ts` 中真实 dhtmlx mock、拖拽、保存回读 helper 的状态清理边界。
- 修复后回跑 focused dhtmlx 用例，再回跑 `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`。

## 非当前阻塞
- 15 天灰度观察已按 owner 指令跳过/延期，不纳入当前推进路径。
- 安全项不优先于当前现有排产功能深度打磨，除非它直接阻断排产证据。
