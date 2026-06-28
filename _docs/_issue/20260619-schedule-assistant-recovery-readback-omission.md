# 2026-06-19 Issue: Schedule Assistant Recovery Readback Omission

## Problem
ScheduleBoard could lose visible evidence for a successfully closed Assistant recovery handoff when the backend refresh returned an empty or stale package list. The local closure succeeded, but the refreshed panel no longer showed the closed package.

## Impact
- The operator could not see the package that was just closed.
- The UI did not clearly explain that backend readback omitted the newly closed package.
- Audit confidence was weakened because the closed trace could disappear from the immediate handoff view.

## Resolution
- Keep the closed package in `assistantRecoveryPackageRecords` when backend readback omits it.
- Add a sync note identifying the readback omission and the retained package ID.
- Re-run the keep-visible guard after risk-triggered event reload so later refresh logic cannot drop the retained package.

## Status
Closed for frontend ScheduleBoard behavior with unit, coverage, lint, build, and real browser evidence.
