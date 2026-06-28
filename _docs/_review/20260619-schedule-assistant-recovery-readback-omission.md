# 2026-06-19 Review: Schedule Assistant Recovery Readback Omission

## Finding
After the user closed an Assistant recovery handoff locally, ScheduleBoard refreshed the backend recovery package list. If the backend call succeeded but returned a list that omitted the just-closed package, the local closed package disappeared from the handoff panel without a fail-loud note. This broke the audit/readback expectation for a successful closure.

## Change Reviewed
- Added `keepClosedAssistantRecoveryPackageVisible()` to retain the locally closed package when the backend readback omits it.
- Added a fail-loud sync note naming the omitted closed package ID.
- Re-applied the local retention after `loadRiskTriggeredEvents()` because that refresh path can rebuild `assistantRecoveryPackageRecords`.
- Added a unit regression covering the successful-backend-but-missing-record case.

## Verification
- RED/GREEN regression was confirmed for the omitted readback case.
- Full ScheduleBoard unit suite passed: 67/67.
- Full frontend coverage passed: 111 files / 1090 tests.
- Lint and production build passed.
- Real browser preview confirmed the scheduling workbench still renders with bilingual guidance, related evidence links, help affordance, and visible status/fail-loud areas.

## Residual Risk
- Browser evidence confirms the production-built scheduling workbench renders correctly, but the exact omitted-readback branch is covered by unit test because it requires mocking a backend success payload that intentionally excludes the closed package.
- Overall release completion is still not claimable because the owner deferred/skipped the long gray observation window.
