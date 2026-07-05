# 2026-07-05 Schedule outsourcing release null audit E2E review

## Decision

`PASS`

Added real-browser evidence for the ScheduleBoard outsourcing schedule release path when the release audit write returns no usable record.

## Scope

- Existing feature: Scheduling event queue / outsourcing arrival / schedule release review.
- Target gap: `_docs/_todo/20260622-schedule-outsourcing-release-null-audit-fail-loud-next-actions.md` requested browser-level evidence for outsourcing release variants.
- This slice does not change production behavior. It adds browser coverage around the already implemented fail-loud branch.

## Evidence

- Test added: `外协排产释放返回空审计时真实浏览器 fail-loud 且不虚假归档`.
- The browser first loads a valid outsourcing arrival event and generates the release suggestion.
- Before adopting, the test removes the persisted receipt audit keys from localStorage so `confirmOutsourcingScheduleRelease()` returns `null`.
- Assertions prove:
  - the page shows `外协排产释放同步失败`;
  - the note says adoption feedback was preserved;
  - the note says no release audit record was obtained;
  - no fake `外协排产释放已归档` success note appears;
  - no `TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521` success trace appears in the suggestion;
  - localStorage still has no `scheduleReleaseTraceId` or `scheduleReleaseAuditId`.

## Validation

- `npm run test:e2e -- --grep "外协排产释放返回空审计时真实浏览器 fail-loud"`: `1 passed`.
- `npm run test:e2e -- --grep "外协到货建议被采纳后真实浏览器归档排产释放证据|外协排产释放返回空审计时真实浏览器 fail-loud"`: `2 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.

## Boundary

This closes the browser-evidence gap for the outsourcing null-audit release branch. It does not close the separate `DeviceDataIocTask / usemark=9` field deployment verification, which still requires the correct runtime or log/database target.
