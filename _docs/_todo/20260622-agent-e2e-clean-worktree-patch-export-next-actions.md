# 2026-06-22 Todo: Agent E2E clean worktree patch export next actions

- Do not apply `tmp/agent-e2e-slice-20260622.patch` blindly to the current dirty main tree.
- Before integration, run:
  - `git diff --cached --name-only`
  - `git diff -- src/frontend/tests/e2e/scheduling.spec.ts`
  - `git apply --check tmp/agent-e2e-slice-20260622.patch`
- If `git apply --check` fails or touches unrelated hunks, integrate manually in a fresh worktree.
- After integration, rerun the five focused Agent workbench E2E tests and record a hunk map.
