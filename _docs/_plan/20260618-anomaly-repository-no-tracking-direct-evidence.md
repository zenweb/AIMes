# 2026-06-18 Anomaly Repository No-Tracking Direct Evidence Plan

## Goal

Add direct integration evidence that `AnomalyRepository` read paths are no-tracking, matching the Sprint 2 repository read contract.

## Success Criteria

- `RepositoryAsNoTrackingTests` calls `AnomalyRepository.GetAllAsync()`.
- The test asserts the query context change tracker remains empty after anomaly reads.
- Full integration tests pass.
- Full architecture tests pass.
- No production code changes are required for this evidence-only slice.

## Result

- `AnomalyRepository.GetAllAsync()` is now part of the direct no-tracking evidence test.
- Full integration tests passed: `203 passed`.
- Full architecture tests passed: `116 passed`.

## Stop Condition

This slice is sealed once the five documents are written and the hold packet reflects the current state.
