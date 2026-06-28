# 2026-06-16 Knowledge Governance Reopened Gray Citation Coverage Issue

## Status

Closed for this slice.

## Problem

`KnowledgeGovernancePanel.vue` already handled several governance-critical states, but direct regression evidence was missing for assistant citation rendering, rolled-back retraining display, and reopened R3 gray decision routing.

## Resolution

Added unit tests that prove:

- assistant citation traces expose source names, blocked audit evidence, and review status;
- rolled-back retraining versions stop showing rollback actions and show reapproval guidance;
- reopened gray-published R3 versions require revalidation before republish;
- reopened validation-passed R3 versions expose `重新灰度发布 R3` and emit the traceable version id.

## Verification

- Targeted suite: `9 passed`.
- Component coverage: statements `91.26%`, branches `86.04%`, functions `98.3%`, lines `100%`.
- Full frontend suite: `111 files / 1050 tests passed`.

## Remaining Gaps

- Strict final v1.0.0 release readiness still depends on gray observation, which remains owner-deferred.
- Future coverage work should move to another lower-coverage user-critical path.
