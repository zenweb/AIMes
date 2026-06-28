# 2026-06-15 Quality Knowledge Experiment Decision Order Plan

## Objective

Harden the quality knowledge gray recommendation experiment comparison path so audit output reflects the latest human decision, not stale decision ordering.

## Scope

- Inspect existing `quality-knowledge-sample-sync.ts` coverage.
- Add a regression test for stale rollback followed by approved expansion.
- Make the smallest production change needed to pass the regression.
- Run targeted, related, and full frontend unit coverage.

## Completed

- Located uncovered high-value function: `buildQualityKnowledgeRecommendationExperimentComparisonRecords`.
- Added regression coverage for repeated gray decisions in the same release cycle.
- Fixed latest-decision selection using `decidedAt` descending order.
- Verified with full frontend coverage.

## Next Candidate

Continue boutique hardening inside quality knowledge governance only after reviewing remaining uncovered lines around asset governance and policy governance. Do not broaden scope before selecting a real user-critical risk.
