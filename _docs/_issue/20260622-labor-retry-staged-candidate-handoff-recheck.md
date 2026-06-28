# 2026-06-22 Issue: Labor retry staged candidate handoff risk

Issue:
- The main worktree is dirty and `src/frontend/tests/e2e/scheduling.spec.ts` has both staged and unstaged changes.
- Agent E2E work is also present as a verified patch, but applying it now would mix with the staged labor retry candidate and unrelated unstaged E2E hunks.

Risk:
- Blindly applying or staging additional E2E hunks could make the release-candidate slice boundary impossible to audit.

Current mitigation:
- Keep `schedule-labor-evidence-retry` staged as the active candidate.
- Preserve Agent E2E work as an external patch and document it separately.
- Re-run focused labor retry validation before any handoff decision.

Status:
- The staged labor retry candidate remains valid by focused tests and cached diff check.
