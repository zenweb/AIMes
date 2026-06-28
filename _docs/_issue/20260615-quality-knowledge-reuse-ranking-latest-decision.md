# 2026-06-15 Quality Knowledge Reuse Ranking Latest Decision Issue

## Issue

Quality knowledge reuse ranking could exclude a gray recommendation version based on any rollback record, even if a later approved expansion decision superseded it.

## Impact

The OP-20 quality recommendation ranking could incorrectly keep using the older published version and show stale rollback evidence, causing:

- approved expansion not prioritized
- stale rollback audit/trace in rank reason
- incorrect excluded experiment labels
- user-facing recommendation status inconsistent with the latest human decision

## Resolution

Decision-sensitive ranking now uses latest-decision semantics:

- latest matching gray decision is selected by `decidedAt`
- only latest rollback decisions exclude a version
- excluded experiment labels no longer include superseded rollback decisions

## Verification

Regression test covers stale rollback followed by approved expansion in reuse ranking.
