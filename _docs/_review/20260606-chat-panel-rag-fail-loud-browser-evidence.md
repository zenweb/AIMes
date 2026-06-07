# 2026-06-06 ChatPanel 知识问答失败 Review

## Review

- 未发现本片新增阻断问题。
- 真实浏览器验证了 RAG 服务失败时的用户可见告警和离线回答。
- 初次 RED 来自测试 locator 过宽，不是产品行为失败；已收窄到目标 alert。

## Residual Risk

- 本片只跑 ChatPanel 目标 e2e，未跑整份 `chat.spec.ts`。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "知识问答服务失败"`：RED 后 GREEN，最终 Chromium 1/1 passed。
