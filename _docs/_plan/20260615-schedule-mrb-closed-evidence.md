# 2026-06-15 Schedule MRB Closed Evidence Plan

## Goal

Prove the existing ScheduleBoard closed MRB disposition path preserves closure evidence and generates the correct review suggestion.

## Steps

1. Inspect MRB event mapping, suggestion generation, and current test mocks.
2. Make MRB sync mocks injectable from focused tests.
3. Add a closed-state MRB disposition test.
4. Run focused unit, focused coverage, full frontend coverage, and current host `5000` scan.

## Success Criteria

- Closed MRB disposition renders as resolved warning event.
- Event includes closure summary, closure trace, and `补料后复核` window.
- Suggestion title uses closed-state review wording.
- Suggestion action includes closure trace and quality/purchase/schedule result evidence.
