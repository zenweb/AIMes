# 2026-06-20 Plan: Production Anomaly Backend Fail Loud

## Goal
Make production anomaly backend latest reads fail loud when requested while preserving local fallback for normal reads.

## Success Criteria
- Production anomaly latest API read supports fail-loud behavior.
- Backend-first sync read propagates fail-loud options and rethrows backend failures when requested.
- Incomplete backend records still fall back to complete local evidence.
- Anomaly board, production board, schedule, and risk adjacent behavior remains stable under targeted tests.

## Execution
1. Add RED tests for API and sync fail-loud reads.
2. Update `getLatestProductionAnomalyEvent()` to accept fail-loud options.
3. Update `readProductionAnomalyEventBackendFirst()` to pass options and rethrow in fail-loud mode.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
