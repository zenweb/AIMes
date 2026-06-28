# 2026-06-22 Todo: Labor + Agent E2E combo next actions

- First resolve staged candidate `schedule-labor-evidence-retry`.
- After that, integrate Agent E2E using `tmp/combo-labor-agent-e2e-20260622.patch` as the reference, not `git apply` blindly.
- Preserve the unified routing pattern:
  - legacy personnel tests: `offlineDemo=1`
  - labor retry and Agent backend tests: `offlineDemo=0`
  - Agent backend tests: `mockSchedulingPlanApis(page)` before navigation
- After integration, rerun the 6 focused combo E2E tests and record a new hunk map.
- Use the focused exported-patch boundary report, not the ambient dirty worktree boundary report, when reviewing this combo slice.
