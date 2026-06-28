# 2026-06-20 Plan: Risk SLA Backend Fail Loud

## Goal
Make risk SLA review backend latest reads fail loud when requested while preserving local fallback for normal reads.

## Success Criteria
- Risk SLA latest API read supports fail-loud behavior.
- Backend-first sync read propagates fail-loud options and rethrows backend failures when requested.
- Incomplete backend records still fall back to complete local evidence.
- Risk queue, report, audit replay, and OTD evidence adjacent behavior remains stable under targeted tests.

## Execution
1. Add RED tests for API and sync fail-loud reads.
2. Update `getLatestRiskSlaReview()` to accept fail-loud options.
3. Update `readRiskSlaReviewRecordBackendFirst()` to pass options and rethrow in fail-loud mode.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
