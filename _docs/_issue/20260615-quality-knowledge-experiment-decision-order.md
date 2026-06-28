# 2026-06-15 Quality Knowledge Experiment Decision Order Issue

## Issue

`buildQualityKnowledgeRecommendationExperimentComparisonRecords` used the first matching gray release decision. This allowed stale decision order to affect the displayed experiment status.

## Impact

If an old rollback record appeared before a later approved expansion for the same training version, work order, operation, and release cycle, the UI-facing comparison record could incorrectly show:

- `实验已回滚`
- guarded status
- stale rollback audit/trace IDs
- reduced experiment score from rollback penalty

## Resolution

Matching gray decisions are now sorted by `decidedAt` descending, and the latest decision drives status, labels, audit IDs, trace IDs, and scoring.

## Verification

Regression test covers stale rollback followed by approved expansion and a separate active rollback case.
