# 2026-06-15 Gantt Toolbar Action State Coverage Issue

## Issue

`GanttToolbar.vue` already covered command emission, but loading-state duplicate prevention and optional metadata visibility branches were not explicitly covered.

## Impact

- A regression could allow duplicate optimize commands during loading.
- A regression could show stale or empty plan metadata when no plan name or lock-period is available.

## Resolution

- Added loading-state and optional metadata tests.
- Verified focused component coverage is 100% across statements, branches, functions, and lines.

