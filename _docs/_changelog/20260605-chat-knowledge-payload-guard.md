# 2026-06-05 Chat Knowledge Payload Guard Changelog

## Change

- 选片依据：继续收口 `ChatPanel.vue` AI 助手主入口；聊天历史坏载荷已修，本片补齐知识问答响应坏载荷。
- 新增红灯测试：知识问答接口返回 HTML / 非业务载荷时，不能把 `undefined` 写入消息并触发渲染崩溃。
- 修复：新增 `isKnowledgeQueryPayload()`，要求响应包含字符串 `answer` 和数组 `sources`。
- 坏载荷进入现有离线演示 fallback，并通过 assertive alert 暴露 `后端返回非知识问答载荷`。

## Validation

- 红灯：目标测试先失败，出现 `Cannot read properties of undefined (reading 'replace')` 渲染错误。
- 绿灯：`npm run test:unit -- tests/unit/chat-panel.test.ts`：1 file / 34 tests passed。
- `npm run lint`：通过。
- `npm run test:unit:coverage`：83 files / 491 tests passed。
- 覆盖率：总行覆盖率 `76.70%`；`ChatPanel.vue` 行覆盖率 `61.86%`。

## Release Boundary

- 本片属于 A-track AI 助手主入口可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需 B-track 独立证据。
