# 2026-06-15 Review - Quality Knowledge Reuse Ranking Latest Decision

## Finding

The reuse ranking path could still treat a gray recommendation version as rolled back when an older rollback decision appeared before a later approved expansion decision.

## Change

- `latestQualityGrayReleaseDecisionForVersion` now selects the newest matching decision by `decidedAt`.
- `selectPrioritizedQualityKnowledgeRecommendationVersion` excludes a version only when its latest decision is still rollback.
- `buildQualityKnowledgeReuseRanking` shows excluded experiments only when the latest decision remains rollback.
- Added regression coverage proving a stale rollback does not suppress a later approved expansion in the ranking output.

## Evidence

- Targeted RED reproduced stale rollback excluding the expanded gray version from ranking.
- Targeted GREEN passed after latest-decision selection and exclusion logic were aligned.
- Full frontend unit coverage passed: 111 files / 999 tests.

## Residual Risk

- This slice covers quality knowledge recommendation ranking and exclusion evidence only.
- Strict v1.0.0 release readiness remains unclaimed while gray observation is owner-deferred.
