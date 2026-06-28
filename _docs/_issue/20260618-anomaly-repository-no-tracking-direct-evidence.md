# 2026-06-18 Anomaly Repository No-Tracking Direct Evidence Issue

## Status

Closed for this slice.

## Problem

The shared repository no-tracking evidence covered several core repositories but lacked direct `AnomalyRepository` read evidence, even though anomaly data feeds dashboard and report flows.

## Resolution

`RepositoryAsNoTrackingTests.CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext` now calls `AnomalyRepository.GetAllAsync()` and asserts the EF change tracker remains empty.

## Evidence

- Full integration regression: PASS, `203 passed`.
- Full architecture regression: PASS, `116 passed`.

## Still Open Outside This Issue

- Strict v1.0.0 release readiness remains unproven because gray observation is still owner-deferred.
- The broader worktree contains many unrelated dirty files and must be handled carefully by future work.
