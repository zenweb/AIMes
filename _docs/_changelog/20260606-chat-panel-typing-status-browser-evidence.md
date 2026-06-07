# 2026-06-06 ChatPanel 等待回复状态真实浏览器证据

## Changed

- 为 `ChatPanel` 的等待回复 typing 指示器补充 `role="status"`、`aria-live="polite"` 和明确可访问名称。
- 真实 Chromium 用例现在可控拦截知识问答请求，验证 pending 状态存在后再释放响应。

## Tests

- `npm.cmd run test:unit -- tests/unit/chat-panel.test.ts -t "assistant is working"`：1 file passed，目标用例通过。
- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "发送消息并获得回复"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片不改变助手问答或 fallback 业务逻辑。
- B 轨道发布闸门仍未关闭。
