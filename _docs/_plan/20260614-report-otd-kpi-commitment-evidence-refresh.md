# 2026-06-14 Plan - Report OTD KPI Commitment Evidence Refresh

## Objective
- Harden the ReportBoard OTD KPI commitment path by proving the generated commitment reappears in the OTD evidence chain.

## Success Criteria
- Add a focused unit test for the positive commitment-generation path.
- Assert writer input includes selected KPI context and current actor.
- Assert backend-first evidence records are refreshed after generation.
- Assert generated commitment and refreshed evidence card are visible.
- Confirm the existing Chromium e2e path remains green.

## Execution
- Added one positive unit test to `src/frontend/tests/unit/report-board.test.ts`.
- Ran focused unit, focused coverage, Chromium e2e, and full frontend unit coverage.

## Stop Condition
- Stop this ReportBoard subpath for now; it has both unit and real-browser evidence.
- Next work should return to high-leverage coverage or user-critical paths with weaker current evidence.
- Gray observation / 15-day monitoring remains deferred by owner instruction.
