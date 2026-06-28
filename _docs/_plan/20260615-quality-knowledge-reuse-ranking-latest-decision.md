# 2026-06-15 Quality Knowledge Reuse Ranking Latest Decision Plan

## Objective

Ensure quality knowledge reuse ranking honors the latest human gray decision when deciding whether a gray recommendation version can be prioritized.

## Scope

- Inspect uncovered `buildQualityKnowledgeReuseRanking` path.
- Add a regression for stale rollback followed by approved expansion.
- Make the smallest implementation change to use latest decision semantics consistently.
- Verify with targeted, related, and full frontend unit coverage.

## Completed

- Found that reuse ranking still used stale rollback evidence in version exclusion and excluded experiment labels.
- Added a regression for latest approved expansion taking priority.
- Updated latest-decision helper and ranking exclusion logic.
- Verified full frontend unit coverage.

## Next Candidate

If continuing quality knowledge hardening, inspect remaining uncovered governance builders or low-score recommendation feedback creation. Pick only a user-critical branch with a real correctness risk.
