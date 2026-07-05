# 2026-07-05 Schedule outsourcing release risk refresh E2E review

## Decision

`PASS`

Added real-browser evidence that the Scheduling outsourcing release path preserves the successful release confirmation when the post-release risk-event refresh fails.

## Scope

- Existing feature: Scheduling event queue / outsourcing arrival / schedule release review.
- Target gap: `_docs/_todo/20260622-schedule-outsourcing-release-risk-refresh-fail-loud-next-actions.md` requested browser-level evidence for the already implemented risk-refresh fail-loud branch.
- This slice does not change production behavior. It adds browser coverage and routes this test through live-backend mock mode so the risk dashboard mock is exercised instead of offline-demo fallback.

## Evidence

- Test added: `外协排产释放后风险事件刷新失败时真实浏览器保留释放确认`.
- The browser loads a received outsourcing commitment, opens `法兰盘 DN100 外协到货已确认`, and adopts `外协到货后的排产释放复核`.
- The test mocks:
  - adoption feedback success: `/api/v1/scheduling/adoption-feedback`;
  - risk dashboard failure: `/api/v1/risk/dashboard` returns `503` with `risk refresh unavailable after release from chromium`.
- Assertions prove:
  - the page shows `外协排产释放已归档`;
  - the same status note says `风险事件刷新失败` and `释放确认仍保留`;
  - the browser-visible failure text includes `risk refresh unavailable after release from chromium`, proving the live route mock was used rather than offline-demo fallback;
  - the release trace `TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521` remains visible in the suggestion;
  - localStorage keeps `scheduleReleaseTraceId` and `scheduleReleaseAuditId`.

## Validation

- Initial run failed because the new title was not included in the Scheduling E2E live-backend mock routing list, so the browser stayed in offline-demo mode and reported `Offline demo mode skipped backend request`.
- Fixed by adding the test title to `usesLiveBackendMock`; no production code changed.
- `npm run test:e2e -- --grep "外协排产释放后风险事件刷新失败时真实浏览器保留释放确认"`: `1 passed`.
- `npm run test:e2e -- --grep "外协到货建议被采纳后真实浏览器归档排产释放证据|外协排产释放返回空审计时真实浏览器 fail-loud|外协排产释放后风险事件刷新失败时真实浏览器保留释放确认"`: `3 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `ef151283226ab3542e5230d3a3c8fd4980ed4aa7`: CI run `28728290918` passed and Agent Evaluation run `28728290926` passed.

## Boundary

This closes the browser-evidence gap for the outsourcing release risk-refresh failure branch. It does not close the separate DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation release gate.
