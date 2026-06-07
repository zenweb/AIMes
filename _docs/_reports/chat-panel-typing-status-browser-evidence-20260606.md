# ChatPanel 等待回复状态真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖 AI 生产助手发送问题后的等待回复状态：用户消息已发送、知识问答请求未返回时，typing 指示器必须向辅助技术暴露 `status`。
- 未改动知识问答、离线 fallback、动作执行或业务回复逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/chat/ChatPanel.vue`
  - loading 指示器增加 `class="typing"`。
  - loading 指示器增加 `role="status"`、`aria-live="polite"`、`aria-label="AI 生产助手正在生成回复"`。
- `src/frontend/tests/unit/chat-panel.test.ts`
  - 新增 deferred Promise 单测，先验证原 loading 指示器缺少 status 语义而失败，再补实现转绿。
- `src/frontend/tests/e2e/chat.spec.ts`
  - 在 `发送消息并获得回复` 真实 Chromium 场景中拦截 `/api/v1/knowledge/query`，先卡住请求验证 typing status，再释放响应并验证回复出现。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/chat-panel.test.ts -t "assistant is working"`
  - 预期失败：找不到 `.message.assistant.typing`，原 loading 节点无 status 语义。
- GREEN：`npm.cmd run test:unit -- tests/unit/chat-panel.test.ts -t "assistant is working"`
  - Vitest 1 file passed，1/1 target passed。
- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "发送消息并获得回复"`
  - 第一次失败：500ms 延迟太短，typing 已消失；修为可控 Promise 后重跑。
  - 最终 Nuxt production build passed，Chromium 1/1 passed。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
