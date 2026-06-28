# Frontend unit coverage current-worktree baseline - 2026-06-22

## Scope

Sprint 0 task 0.0 current-worktree frontend unit coverage baseline.

This run verifies the current local frontend working tree, including staged and unstaged frontend changes. It is not a staged-only proof and does not replace E2E, backend, hosted CI, or release-gate evidence.

## Command

```text
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:unit:coverage
```

## Result

PASS for tests, with coverage regression versus the previous recorded baseline.

```text
Test Files  117 passed (117)
Tests       1229 passed (1229)
```

Coverage summary:

```text
Statements   : 89.1%  (11003/12348)
Branches     : 75.79% (9527/12569)
Functions    : 88.9%  (2621/2948)
Lines        : 92.17% (10086/10942)
```

## Comparison

Previous repo-local Sprint 0 frontend coverage baseline recorded 92.99% overall line coverage.

Current line coverage is 92.17%, a decrease of 0.82 percentage points. Treat this as a routing signal for the next quality slice rather than a release pass/fail by itself.

## Low-Coverage Hotspots

- `src/frontend/src/components/schedule/ScheduleBoard.vue`: 77.4% line coverage.
- `src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue`: 84.04% line coverage.
- `src/frontend/src/api/auth.ts`: 0% line coverage.
- `src/frontend/src/components/gantt/GanttChart.vue`: 89.47% line coverage.

## Boundary

- Covers frontend unit coverage only.
- Does not prove Chromium E2E behavior.
- Does not prove backend behavior.
- Does not prove staged-only package health.
- Does not prove release readiness.
