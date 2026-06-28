# 2026-06-15 Plan: production anomaly sync backend fallback

Success criteria:

- Backend-first production anomaly reads must fall back to local storage when the backend read fails.
- The backend latest-event endpoint must still be attempted before fallback.
- The existing local validation and cleanup behavior must remain green.

Execution:

1. Read `production-anomaly-sync.ts` and existing sync utility test patterns.
2. Add a focused test for backend read rejection with a valid local event.
3. Run focused and file-level tests.
4. Capture focused coverage for `production-anomaly-sync.ts`.

Outcome:

- All checks passed and no production code change was needed.
