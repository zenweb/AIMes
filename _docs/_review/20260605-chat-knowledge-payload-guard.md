# 2026-06-05 Chat Knowledge Payload Guard Review

## Findings

- 审计结论：修复知识问答坏载荷进入消息渲染链导致运行时崩溃的问题。
- 风险场景：`queryKnowledge()` 成功返回但载荷不是 `{ answer: string, sources: [] }` 时，旧行为会把 `undefined` 作为消息内容传入 `renderMarkdown()`。
- 修复方式：新增 `isKnowledgeQueryPayload()`，坏载荷抛出明确错误并复用知识问答失败 fallback。
- 用户体验：用户仍看到离线演示回答和具体失败原因，聊天入口保持可用。
- 范围控制：未新增动作、未改变权限、审计写入、导航或导出逻辑。

## Evidence

- TDD 红灯：目标测试先失败于 `undefined.replace` 渲染错误。
- 目标单测：`npm run test:unit -- tests/unit/chat-panel.test.ts`，34 tests passed。
- 全量 lint：`npm run lint` 通过。
- 全量前端覆盖率：`npm run test:unit:coverage`，491 tests passed。
- 覆盖率增量：`ChatPanel.vue` 行覆盖率 `61.53% -> 61.86%`。

## Residual Risk

- `ChatPanel.vue` 仍有大量动作分支和上下文组合未完全覆盖。
- 本片不关闭 v1.0.0 的真实发布闸门。
