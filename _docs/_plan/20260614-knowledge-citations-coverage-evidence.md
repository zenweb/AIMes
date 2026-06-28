# 2026-06-14 Plan - Knowledge Citations Coverage Evidence

## Goal
- Improve evidence depth for an existing user-critical AI assistant citation path without expanding feature scope.

## Success Criteria
- Focused unit tests cover weak citation governance branches.
- Full frontend unit coverage remains green.
- At least one relevant Chromium e2e path confirms the visible assistant citation workflow still works.
- Gray observation is not treated as a blocker for this work item.

## Execution
- Add tests for barcode quality reuse and CNC governance citation states.
- Mock external evidence API writes in unit tests so localStorage branch behavior remains deterministic.
- Run focused unit, focused coverage, full coverage, and focused real browser e2e.

## Result
- Success criteria met.
- Next routing should continue by coverage increment and user-criticality, not by repeatedly polishing already saturated areas.
