# 2026-06-15 Review - Quality Knowledge Experiment Decision Order

## Finding

The experiment comparison builder selected the first matching gray decision record. If a gray recommendation version had an earlier rollback and a later approved expansion in the same release cycle, the stale rollback could still drive the comparison status.

## Change

- Updated `buildQualityKnowledgeRecommendationExperimentComparisonRecords` to sort matching decisions by `decidedAt` descending before selecting the current decision.
- Added a regression test that proves a later approved expansion overrides a stale rollback while a separate rolled-back experiment still remains guarded.

## Evidence

- Targeted RED reproduced stale rollback overriding the later approved expansion.
- Targeted GREEN passed after sorting by latest `decidedAt`.
- Full frontend unit coverage passed: 111 files / 998 tests.

## Residual Risk

- This slice covers comparison record decision ordering only.
- It does not claim strict v1.0.0 release readiness; gray observation remains owner-deferred.
