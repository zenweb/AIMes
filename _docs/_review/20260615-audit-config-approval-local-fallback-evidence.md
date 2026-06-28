# 2026-06-15 Review: Audit config approval local fallback evidence

## Findings

- Fixed a reliability gap in the existing configuration approval audit path: invalid backend payloads produced an alert but dropped local approval records from the UI.
- The production change is narrow: only the configuration approval loading branch reads local approvals after invalid payload validation records a sync error.
- The regression covers both surfaces that reviewers depend on: pending approval badge/list and replay detail evidence.

## Evidence

- Target test failed before the production change because the pending approval badge stayed at 0.
- Target audit replay suite passed 32/32 after the fix.
- Full frontend coverage passed 965/965 tests.

## Residual Risk

- This validates frontend fallback behavior through unit tests only.
- It does not prove backend governance evidence API correctness or PostgreSQL/staging readiness.
