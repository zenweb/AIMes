# 2026-06-14 Review - ChatPanel CNC 停机问答真实浏览器证据

## Findings
- 当前覆盖率报告显示 `ChatPanel.vue` 是组件层最低覆盖率项之一，且 AI 生产助手是用户必经入口，适合作为下一片高收益验证目标。
- 已有 E2E 覆盖该业务问答路径，适合先做真实浏览器证据闭环，不需要扩功能。
- 后端来源置信度如果返回负数或超过 1，UI 必须夹紧到 0%-100%，否则 AI 助手证据会误导调度员判断。
- 灰度观察已按 owner 指令后置；release gate 当前报告应明确为 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`，不能误写成严格最终发布 PASS。

## Verification
- 单条真实 Chrome E2E：1 passed。
- `chat-panel.test.ts` 单文件：45 passed。
- 单文件 coverage 通过，但 `ChatPanel.vue` 覆盖率百分比未变化；这是边界断言增强，不是覆盖率增量。
- 截图证据落盘并人工查看，包含 AI 助手回答、CNC-001 场景、受影响工单和动作按钮。

## Residual Risk
- 本轮没有提升 `ChatPanel.vue` 单元覆盖率百分比。
- 如果后续目标是覆盖率增量，需要继续针对 `ChatPanel` 未覆盖分支补单元测试。
