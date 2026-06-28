# 2026-06-15 Review: Audit assistant local fallback evidence

## Findings

- Fixed a reliability gap in an existing audit path: backend assistant-audit payload validation could fail loud, but local assistant action evidence was not shown.
- The production change is narrow: only the assistant action audit loading branch reads local fallback records after an invalid backend payload records a sync error.
- The customer commitment replay detail now includes the execution feedback text, so the selected detail region contains the same business evidence as the card summary.

## Evidence

- Target test failed before the production change because the selected replay remained the base AI suggestion.
- Target audit replay suite passed 31/31 after the fix.
- Full frontend coverage passed 964/964 tests.

## Residual Risk

- This validates frontend fallback behavior through unit tests only.
- It does not prove backend assistant evidence API correctness or PostgreSQL/staging readiness.
