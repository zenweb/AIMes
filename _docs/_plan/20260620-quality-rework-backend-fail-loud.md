# 2026-06-20 Plan: Quality Rework Backend Fail Loud

## Goal
Make quality rework backend latest reads fail loud when requested while preserving local fallback and newest-record selection for normal reads.

## Success Criteria
- Quality rework latest API read supports fail-loud behavior.
- Backend-first sync read propagates fail-loud options and rethrows backend failures when requested.
- Incomplete backend records still fall back to complete local evidence.
- Quality, report, schedule, and rework panel adjacent behavior remains stable under targeted tests.

## Execution
1. Add RED tests for API and sync fail-loud reads.
2. Update `getLatestQualityReworkImpact()` to accept fail-loud options.
3. Update `readQualityReworkImpactBackendFirst()` to pass options and rethrow in fail-loud mode.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
