# 2026-06-19 Review: Audit Replay Scalar JSON Payload Fail-Loud

## Finding
Audit replay previously treated `newValues` containing valid JSON scalars, such as `"not-an-object"` or `42`, as an invalid replay item but did not report an alert. That made corrupted backend audit details disappear from the operator's replay console without a visible reason.

## Change Reviewed
- `parseAgentActionAuditPayload` now records `审计载荷不是对象` when parsed JSON is not an object.
- `parseScheduleAdoptionFeedbackAuditPayload` applies the same rule.
- Valid replay cards remain visible while the bad audit detail is surfaced in the fail-loud alert region.

## Verification
- Target RED/GREEN tests were run for schedule adoption feedback and backend business-write paths.
- Full audit replay unit suite passed: 58/58.
- Full frontend coverage passed: 111 files / 1088 tests.
- Lint and production build passed.
- Real browser preview confirmed `/audit-logs/` renders with complex-operation guidance, help link affordance, replay cards, and fail-loud alert content.

## Residual Risk
- Real browser evidence used frontend offline-demo/local auth state, not a live backend seeded with scalar audit payloads.
- Nuxt dev server remains blocked by the previously documented rollup input issue; production preview remains the verified browser path.
