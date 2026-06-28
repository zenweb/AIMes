# 2026-06-15 Schedule Agent Workbench Decision Actions

## Change

- Added focused success-state tests for `ScheduleAgentWorkbenchPanel.vue`.
- Locked the existing backend decision path:
  - pending backend decision loads into the workbench.
  - recommended scenario evidence is shown with trace id.
  - adopt action sends the decision id, recommended scenario id, and auditable reason.
  - reject action sends the decision id and protected manual-lock reason.
- Reset API mocks in `beforeEach` to prevent cross-test call history from hiding regressions.

## Evidence

```powershell
npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts
# 1 file passed, 6 tests passed

npm run test:unit:coverage -- tests/unit/schedule-agent-workbench-panel.test.ts --coverage.include=src/components/schedule/ScheduleAgentWorkbenchPanel.vue
# ScheduleAgentWorkbenchPanel.vue lines 95.74%, branches 88.07%, functions 100%, statements 94.33%
```

