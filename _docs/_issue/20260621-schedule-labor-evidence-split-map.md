# Issue - Schedule Labor Evidence Split Map

## Problem
- The intended `schedule-labor-evidence-retry` release candidate still contains unrelated themes in the same dirty diff.

## Evidence
- Working boundary report: excluded tokens remain present.
- Staged boundary report: no first-slice tokens are staged.
- Candidate file diff size remains large, especially `scheduling.spec.ts` with 3132 insertions.

## Resolution
- Added a split map that separates labor retry keep locations from excluded-theme locations.

## Remaining Work
- Produce and stage a labor-only patch.
- Run staged boundary guard and human staged diff review before any push.
