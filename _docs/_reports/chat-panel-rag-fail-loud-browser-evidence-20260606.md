# ChatPanel 知识问答失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`ChatPanel` 知识问答服务失败时的 fail-loud 离线回答。
- 目标：真实浏览器中 `/api/v1/knowledge/query` 失败时，用户能看到明确错误原因，助手保留可用入口并给出离线演示回答。

## 变更

- `src/frontend/tests/e2e/chat.spec.ts`
  - 新增真实 Chromium 用例：`知识问答服务失败时真实浏览器展示 fail-loud 离线回答`。
  - 用例拦截 `/api/v1/knowledge/query` 返回 503，并断言目标 alert。

## RED/GREEN

- RED：
  - `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "知识问答服务失败"`
  - 结果：失败；页面中同时存在历史/LLM 状态告警，测试定位器过宽触发 strict mode。
- GREEN：
  - 收窄 locator 到包含 `知识问答服务暂不可用，已切换到离线演示回答。` 的 alert。
  - `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "知识问答服务失败"` -> Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 真实 Chromium 发起知识问答请求。
- 后端知识问答 503 时展示 `知识问答服务暂不可用，已切换到离线演示回答。`。
- 展示具体原因 `chromium RAG service unavailable`。
- 展示离线回答中的 `当前车间整体设备利用率`。
- 输入框保持可用，用户可以继续追问。

## 结论

- ChatPanel 知识问答失败路径现在具备真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
