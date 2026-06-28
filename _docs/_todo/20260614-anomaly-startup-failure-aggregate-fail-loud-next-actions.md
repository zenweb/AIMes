# 2026-06-14 Todo - Anomaly Startup Failure Aggregate Fail Loud

## Done
- Added a unit regression for simultaneous dispatch-record and anomaly-list startup failures.
- Added real Chromium evidence for the same multi-failure startup path.
- Preserved demo anomaly list rendering and dispatch lane availability after both failures.
- Re-ran focused tests, full anomaly unit/e2e suites, and frontend coverage.

## Next Actions
- Continue coverage-increment routing on existing user-critical surfaces.
- Candidate next slice: another low-coverage core board with a real fail-loud or continuity gap, avoiding already saturated LoginPage paths.
- Keep gray observation out of the active blocking lane unless the owner explicitly re-enables the wall-clock gate.
