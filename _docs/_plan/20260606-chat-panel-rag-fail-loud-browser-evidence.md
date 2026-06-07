# 2026-06-06 ChatPanel 知识问答失败 Plan

## Success Criteria

- 真实 Chromium 能模拟知识问答服务 503。
- 页面展示 fail-loud 告警和具体错误原因。
- 页面保留离线回答。
- 输入框仍可用。
- 不修改生产行为，只补证据。

## Result

- 目标 e2e 先因 locator 过宽失败，随后收窄目标 alert。
- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "知识问答服务失败"` 最终 Chromium 1/1 passed。

## Stop Condition

- 本片到真实 Chromium 证据通过即停止，不继续扩大到其它 ChatPanel 微状态。
