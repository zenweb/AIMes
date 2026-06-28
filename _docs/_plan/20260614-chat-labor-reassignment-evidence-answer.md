# 2026-06-14 Plan - Chat Labor Reassignment Evidence Answer

## Success Criteria
- ChatPanel unit tests can inject labor reassignment and qualification evidence.
- The fallback assistant answer proves it surfaces personnel constraint, reassignment, release trace, and OTD evidence details.
- Existing real browser personnel reassignment evidence remains green.

## Execution
- Inspect ChatPanel labor answer path and current tests.
- Make labor sync mocks controllable in unit tests.
- Add focused labor evidence assertion.
- Run focused unit, full ChatPanel unit, focused Chromium, and frontend coverage.

## Validation
- Focused labor unit passed.
- Full ChatPanel unit suite passed.
- Focused Chromium personnel path passed.
- Full frontend coverage passed with increased ChatPanel line coverage.

## Stop Condition
- Stop after evidence is strengthened and documented.
- Do not modify production ChatPanel behavior unless a failing test proves a real defect.

