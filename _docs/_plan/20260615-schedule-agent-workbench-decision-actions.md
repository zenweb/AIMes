# 2026-06-15 Schedule Agent Workbench Decision Actions Plan

## Goal

Improve evidence depth for the existing scheduling Agent workbench decision path.

## Success Criteria

1. Existing workbench tests remain green.
2. Pending backend decisions unlock adopt/reject actions.
3. Adopt call includes decision id, recommended scenario id, and auditable reason.
4. Reject call includes decision id and manual-lock protection reason.
5. Focused component coverage is no longer a low-coverage routing hotspot.

## Result

- `schedule-agent-workbench-panel.test.ts`: 6/6 passed.
- `ScheduleAgentWorkbenchPanel.vue` focused line coverage: 95.74%.

