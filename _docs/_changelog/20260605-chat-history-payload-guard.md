# 2026-06-05 Chat History Payload Guard Changelog

## Change

- 选片依据：按覆盖率增量选择 `ChatPanel.vue`；该组件是 AI 助手主入口，行覆盖率约 `61%`。
- 新增红灯测试：聊天历史接口返回 HTML / 非业务载荷时，不能静默显示空状态。
- 修复：在 `loadHistory()` 写入历史消息前增加聊天历史载荷守卫，坏载荷抛出明确错误并复用现有 alert fallback。
- 行为保持：聊天入口仍可用，输入框不被禁用；正常历史加载、历史请求失败、LLM 状态加载和知识问答 fallback 行为保持不变。

## Validation

- 红灯：`npm run test:unit -- tests/unit/chat-panel.test.ts` 失败于坏载荷场景，页面显示空状态且无 alert。
- 绿灯：`npm run test:unit -- tests/unit/chat-panel.test.ts`：1 file / 33 tests passed。
- `npm run lint`：通过。
- `npm run test:unit:coverage`：83 files / 490 tests passed。
- 覆盖率：总行覆盖率 `76.69%`；`ChatPanel.vue` 行覆盖率 `61.53%`。

## Release Boundary

- 本片属于 A-track AI 助手主入口可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需 B-track 独立证据。
