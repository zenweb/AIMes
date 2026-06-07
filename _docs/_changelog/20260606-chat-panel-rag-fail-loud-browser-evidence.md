# 2026-06-06 ChatPanel 知识问答失败真实浏览器证据

## Changed

- `chat.spec.ts` 新增真实 Chromium 用例，覆盖知识问答服务 503 时的 fail-loud 离线回答。
- 用例确认助手显示错误原因、保留离线回答，并保持输入框可用。

## Verification

- RED：`npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "知识问答服务失败"` -> strict mode 失败，定位器命中多个 alert。
- GREEN：同命令 -> Nuxt production build passed，Chromium 1/1 passed。

## Release Gate Note

本次只关闭 A 轨 ChatPanel 知识问答失败真实浏览器证据缺口，不关闭 v1.0.0 B 轨发布闸门。
