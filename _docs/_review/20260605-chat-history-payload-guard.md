# 2026-06-05 Chat History Payload Guard Review

## Findings

- 审计结论：修复 AI 助手聊天历史坏载荷静默空状态问题。
- 风险场景：`getChatHistory()` 成功返回但载荷不是 `{ messages: [] }` 时，旧行为不会告警，用户会看到空聊天。
- 修复方式：新增 `isChatHistoryPayload()`，要求 `messages` 为数组；坏载荷进入现有 `聊天历史加载失败` alert。
- 可访问性覆盖：坏载荷提示通过 `.message.assistant[role="alert"]` 暴露，`aria-live="assertive"`。
- 范围控制：未新增聊天功能，未改变动作执行、RAG fallback、导出、导航或审计写入逻辑。

## Evidence

- TDD 红灯：目标测试先失败，证明旧行为静默显示空状态。
- 目标单测：`npm run test:unit -- tests/unit/chat-panel.test.ts`，33 tests passed。
- 全量 lint：`npm run lint` 通过。
- 全量前端覆盖率：`npm run test:unit:coverage`，490 tests passed。
- 覆盖率增量：`ChatPanel.vue` 行覆盖率 `61.34% -> 61.53%`。

## Residual Risk

- `ChatPanel.vue` 仍是低覆盖大组件，后续可继续覆盖知识问答响应坏载荷、动作包生成失败组合和本地上下文坏载荷。
- 本片不关闭 v1.0.0 的真实发布闸门。
