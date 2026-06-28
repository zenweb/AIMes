# Agent E2E Clean Worktree Patch Export - 2026-06-22

Artifact:
- `tmp/agent-e2e-slice-20260622.patch`

Clean worktree:
- `tmp/agent-e2e-slice-20260622`

Changed files in patch:
- `src/frontend/scripts/e2e.mjs`
- `src/frontend/tests/e2e/scheduling.spec.ts`

Validation already completed in clean worktree:
- Focused backend scenarios: 3/3 PASS.
- Focused Agent workbench scenarios: 5/5 PASS.
- Diff check: PASS, with CRLF normalization warnings only.

Boundary:
- Not applied to the main worktree.
- Not staged.
- Does not affect the staged `schedule-labor-evidence-retry` candidate.
- Does not prove full e2e suite health.
