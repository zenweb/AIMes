# 2026-06-22 Changelog: Agent E2E clean worktree patch export

- Preserved the verified Scheduling Agent E2E regression fix as `tmp/agent-e2e-slice-20260622.patch`.
- The patch was produced from the detached clean worktree `tmp/agent-e2e-slice-20260622`.
- Scope:
  - `src/frontend/scripts/e2e.mjs`
  - `src/frontend/tests/e2e/scheduling.spec.ts`
- Verified in the clean worktree before export:
  - Focused Agent backend mock run: 3/3 passed.
  - Agent workbench focused run: 5/5 passed.
  - `git diff --check` passed with only CRLF normalization warnings.

Boundary:
- The patch was not applied to the dirty main worktree.
- Existing staged candidate `schedule-labor-evidence-retry` remains untouched.
- This does not claim the full `scheduling.spec.ts` suite is green.
