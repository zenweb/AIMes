# 2026-06-15 Gantt Toolbar Action State Coverage

## Change

- Added focused tests for `GanttToolbar.vue`.
- Locked existing toolbar behavior:
  - scheduler command buttons remain explicit `type=button`.
  - optimize, refresh, feedback, compare, export, objective, and scale events are emitted correctly.
  - loading state shows `优化中...` and prevents duplicate optimize commands.
  - optional plan name and lock-period metadata stay hidden when absent.

## Evidence

```powershell
npm run test:unit -- tests/unit/gantt-toolbar.test.ts
# 1 file passed, 3 tests passed

npm run test:unit:coverage -- tests/unit/gantt-toolbar.test.ts --coverage.include=src/components/gantt/GanttToolbar.vue
# GanttToolbar.vue statements 100%, branches 100%, functions 100%, lines 100%
```

