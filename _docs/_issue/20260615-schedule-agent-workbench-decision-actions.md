# 2026-06-15 Schedule Agent Workbench Decision Actions Issue

## Issue

`ScheduleAgentWorkbenchPanel.vue` had solid coverage for recommendation generation and feedback/writeback display, but thinner evidence around pending backend decisions being adopted or rejected from the workbench.

## Impact

- A regression could disable or misroute the adopt/reject calls while existing tests still passed.
- Cross-test mock call history could hide incorrect API-call assertions.

## Resolution

- Added adopt/reject success-state tests for a loaded pending backend decision.
- Reset scheduling API mocks before every test.

