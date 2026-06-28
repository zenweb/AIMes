# 2026-06-22 Plan: Labor + Agent E2E clean worktree validation

Success criteria:
- Prove whether Agent E2E can safely follow the staged labor retry candidate.
- Avoid touching the dirty main worktree.
- Produce a reusable combined patch and evidence report.

Steps:
1. Export current staged labor retry diff.
2. Create a detached clean worktree from current HEAD.
3. Apply labor retry patch.
4. Check Agent patch application.
5. Manually merge only the conflicting Agent E2E setup hunks in the clean worktree.
6. Run focused unit and E2E validation.
7. Export validated combined E2E patch.

Next integration condition:
- Resolve the staged labor retry candidate first.
- Then use `tmp/combo-labor-agent-e2e-20260622.patch` as the reference for manual hunk integration into main.
