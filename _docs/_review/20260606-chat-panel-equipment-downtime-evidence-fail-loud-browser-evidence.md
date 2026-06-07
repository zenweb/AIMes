# 2026-06-06 ChatPanel 设备停机复核包 OTD 写入失败 Review

## Findings

- 未发现本片新增阻断问题。
- 真实浏览器验证了设备停机复核包已生成但 OTD 证据写入失败时的用户可见告警。
- 用例限定只让 `aimes_otd_evidence_chain` 写入失败，避免误伤登录态和其它 localStorage 依赖。

## Residual Risk

- 本片只跑 ChatPanel 目标 e2e，未跑整份 `chat.spec.ts`。
- B 轨发布闸门仍失败：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察证据未齐。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/chat.spec.ts -g "设备停机复核包 OTD 证据写入失败"`：Chromium 1/1 passed。
