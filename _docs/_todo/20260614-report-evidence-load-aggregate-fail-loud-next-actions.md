# 2026-06-14 Todo - Report Evidence Load Aggregate Fail Loud

## Done
- Added unit coverage for aggregating multiple optional ReportBoard evidence load failures into one fail-loud alert.
- Added real Chromium coverage for the same user-visible failure mode.
- Verified the report dashboard remains usable when optional evidence reads fail.
- Re-ran full ReportBoard unit tests, full report e2e tests, and frontend unit coverage.

## Next Actions
- Continue coverage-increment routing on existing user-critical surfaces rather than refining already saturated components.
- Candidate next slice: pick the lowest-coverage high-traffic board with real browser gaps, excluding already-polished LoginPage paths.
- Keep gray observation out of the active blocking lane unless the owner explicitly re-enables the 15-day gate.
