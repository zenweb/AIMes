# 2026-06-22 Schedule Feedback Restore Evidence

## Scope
- `ScheduleBoard` restores the latest adoption feedback on startup.
- Backend latest feedback is preferred when it is complete and auditable.
- If backend latest feedback is unavailable or missing required audit fields, the board falls back to the local snapshot and shows a visible sync note.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
  - Result: PASS
  - Files: 1 passed
  - Tests: 76 passed
- `git diff --cached --check`
  - Result: PASS

## Boundaries
- This slice covers adoption feedback restore only.
- Event-click backend evidence refresh, assistant handoff refresh, and broader schedule state race hardening remain separate candidates.
