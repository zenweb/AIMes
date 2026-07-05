# 2026-07-05 Schedule assistant recovery risk refresh E2E review

## Decision

`PASS`

Added real-browser evidence that the Scheduling Assistant recovery closure keeps the closed handoff recommendation visible when the post-closure risk-event refresh fails.

## Scope

- Existing feature: Scheduling Assistant recovery handoff closure.
- Target gap: `_docs/_todo/20260622-schedule-assistant-recovery-risk-refresh-fail-loud-next-actions.md` requested browser-level evidence for the already implemented risk-refresh fail-loud branch.
- This slice does not change production behavior. It adds browser coverage and routes the new test through live-backend mock mode.

## Evidence

- Test added: `Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议`.
- The browser injects an active Assistant recovery package, closes the handoff, and keeps the recovery-package refresh successful enough to avoid the separate `Assistant 恢复交接闭环刷新失败` branch.
- The test mocks `/api/v1/risk/dashboard` as `503` with `risk events unavailable after assistant closure from chromium`.
- Assertions prove:
  - the handoff panel changes to `执行交接已闭环`;
  - the closure trace `TRACE-CHAT-RECOVERY-WO-RUSH-9001-CLOSED-20260521` remains visible;
  - the status note says `Assistant 恢复交接闭环后风险事件刷新失败` and `闭环建议仍保留`;
  - the status note includes the Chromium risk-refresh failure text;
  - the status note does not contain the separate recovery-package refresh failure text;
  - the risk-event note fails loud with `风险事件加载失败`;
  - the Agent suggestion remains visible with `Assistant 恢复交接闭环复核建议`;
  - localStorage keeps the package as `closed` with the closure trace.

## Validation

- `npm run test:e2e -- --grep "Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议"`: `1 passed`.
- `npm run test:e2e -- --grep "Assistant 恢复交接闭环后真实浏览器保留本地闭环建议|Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议"`: `2 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.

## Boundary

This closes the browser-evidence gap for the Assistant recovery closure risk-refresh failure branch. It does not close the separate DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation release gate.
