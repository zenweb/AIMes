# 2026-06-22 Schedule Startup Engineering Fail-Loud Evidence

## Scope
- `ScheduleBoard` startup engineering constraints now read backend-first with `failLoud: true`.
- Engineering/alternate-material and route-capability startup failures are surfaced in the schedule warning bar.
- The schedule plan remains usable when startup engineering evidence sync fails.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
  - Result: PASS
  - Files: 1 passed
  - Tests: 76 passed
- `git diff --cached --check`
  - Result: PASS

## Boundaries
- This slice does not claim full release completion.
- It does not include the broader unstaged event-click evidence refresh, assistant handoff refresh, adoption restore, or drag-save hardening work.
