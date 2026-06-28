# 2026-06-20 Plan: Shortage Supply Backend Fail Loud

## Goal
Make shortage and supply backend latest reads fail loud when requested while preserving existing local fallback behavior for normal optional reads.

## Success Criteria
- Five shortage/supply latest API reads support fail-loud behavior.
- Five backend-first sync reads propagate fail-loud options.
- Incomplete backend records continue to fall back to complete local evidence.
- Purchase, BOM, schedule, and shortage action adjacent behavior remains stable under targeted tests.

## Execution
1. Add RED tests for API and sync fail-loud reads.
2. Update shortage evidence API latest readers to accept fail-loud options.
3. Update backend-first sync readers to pass options and rethrow in fail-loud mode.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
