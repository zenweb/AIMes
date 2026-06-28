# 2026-06-22 Todo: Labor retry staged candidate handoff next actions

- Decide the fate of staged candidate `schedule-labor-evidence-retry`: commit it, replace it, or request human review.
- Do not apply `tmp/agent-e2e-slice-20260622.patch` until the staged labor retry candidate is resolved.
- Current `git apply --check tmp/agent-e2e-slice-20260622.patch` fails against the dirty main tree; plan for manual hunk integration or a fresh worktree.
- If committing the staged candidate, include only the current staged files; do not broad-stage the dirty worktree.
- After staged candidate resolution, integrate Agent E2E patch with hunk review and rerun its five focused E2E scenarios.
