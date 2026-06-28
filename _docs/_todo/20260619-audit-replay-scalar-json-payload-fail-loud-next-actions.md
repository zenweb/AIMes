# 2026-06-19 Todo: Audit Replay Scalar JSON Payload Fail-Loud Next Actions

## Done
- Added fail-loud handling for scalar JSON audit payloads in backend business-write replay.
- Added fail-loud handling for scalar JSON audit payloads in schedule adoption feedback replay.
- Added RED/GREEN regression tests for both paths.
- Ran targeted tests, full audit replay suite, full frontend coverage, lint, build, and real browser production preview evidence.

## Next
- If a live backend seeded audit-log fixture becomes available, add an e2e or integration browser check for a real scalar `newValues` row.
- Continue selecting the next slice by coverage leverage and user-criticality. Current low-branch candidates remain `AdminBoard`, `GanttChart`, `DocumentUpload`, `ScheduleBoard`, and `RiskActionQueuePanel`; avoid reworking already sealed behavior unless a fresh defect is found.
- Keep Nuxt dev-server debugging out of the main quality loop until a clean minimal reproduction or dependency strategy is chosen.
