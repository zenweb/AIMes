# 2026-06-15 Schedule Monitoring Situation Closed Evidence Plan

## Goal

Prove the existing ScheduleBoard closed monitoring situation path preserves closure evidence and generates the correct review suggestion.

## Steps

1. Inspect monitoring situation event mapping, suggestion generation, and current test mocks.
2. Make monitoring sync mocks injectable from focused tests.
3. Add a closed-state monitoring situation test.
4. Run focused unit, focused coverage, full frontend coverage, and current host `5000` scan.

## Success Criteria

- Closed monitoring situation renders as resolved warning event.
- Event shows closure review window and closure trace.
- Suggestion title uses closed-state review wording.
- Suggestion action includes affected work orders, CNC/material/quality review intent, and closure trace.
