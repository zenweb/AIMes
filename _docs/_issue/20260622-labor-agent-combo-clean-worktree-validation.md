# 2026-06-22 Issue: Agent E2E patch conflicts with labor retry candidate

Issue:
- `tmp/agent-e2e-slice-20260622.patch` fails `git apply --check` both against the dirty main worktree and against a clean worktree after applying the staged labor retry patch.

Conflict:
- The direct conflict is in `src/frontend/tests/e2e/scheduling.spec.ts` around top-level test routing constants and `beforeEach` setup.
- Both labor retry and Agent E2E need to control offline/live backend entry behavior.

Resolution proven in clean worktree:
- Combine the routing decisions into shared `usesLiveBackendMock` logic.
- Keep legacy personnel tests on `offlineDemo=1`.
- Run labor retry and Agent backend tests through `scheduling?offlineDemo=0`.
- Add a stable `mockSchedulingPlanApis` helper for Agent backend scenarios.

Status:
- Clean worktree validation passed.
- Main-tree integration should still wait until the current staged labor candidate is resolved.
