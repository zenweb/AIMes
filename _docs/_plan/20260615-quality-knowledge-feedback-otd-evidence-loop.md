# 2026-06-15 Quality Knowledge Feedback OTD Evidence Loop Plan

## Objective

Pin the quality recommendation adoption evidence loop so accepted recommendations cannot lose their feedback or next-training audit trail unnoticed.

## Scope

- Reuse the existing quality knowledge sync test harness.
- Add one focused test around `acceptQualityKnowledgeRecommendation`.
- Verify local feedback persistence and both OTD evidence chain records.
- Run targeted, related, and full frontend unit coverage.

## Completed

- Added coverage for recommendation feedback persistence.
- Added coverage for recommendation feedback OTD evidence.
- Added coverage for next-training-set OTD evidence.
- Verified all frontend unit tests.

## Next Candidate

If continuing this file, inspect remaining uncovered governance builders only where they affect user-visible audit status or decision readiness.
