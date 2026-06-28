# 2026-06-22 Plan: Agent E2E clean worktree patch export

Success criteria:
- Preserve the already verified Agent E2E fix outside the dirty main tree.
- Keep the current staged labor retry candidate unchanged.
- Record exact validation scope and non-claims.

Steps:
1. Inspect the temp worktree status.
2. Export the focused diff for `scripts/e2e.mjs` and `tests/e2e/scheduling.spec.ts`.
3. Document validation evidence and integration boundary.
4. Leave main worktree source files unchanged until an explicit integration decision.

Next integration path:
- Preferred: finish or commit the staged `schedule-labor-evidence-retry` candidate first, then apply `tmp/agent-e2e-slice-20260622.patch` with hunk review.
- Alternative: create a separate branch/worktree for Agent E2E and stage it independently.
