# Index readiness audit - 2026-06-22

## Staged packages

The current index contains three focused implementation packages plus their evidence docs.

### 1. Agent E2E current-worktree verification

Scope:

- `src/frontend/scripts/e2e.mjs`
- Agent E2E hunks in `src/frontend/tests/e2e/scheduling.spec.ts`
- Evidence docs under `_docs/_reports`, `_docs/_review`, `_docs/_todo`, `_docs/_changelog`, `_docs/_issue`, `_docs/_plan`

Previously verified:

- `git diff --cached --check`
- Focused Agent E2E scenarios for backend success, backend 403, and API unavailable fallback.

### 2. Employee live backend offline-demo recovery

Scope:

- `src/frontend/src/api/http.ts`
- `src/frontend/src/stores/auth.ts`
- `src/frontend/src/utils/offline-demo-mode.ts`
- `src/frontend/src/router/index.ts`
- `src/frontend/src/components/employee/EmployeeBoard.vue`
- `src/frontend/tests/unit/employee-board.test.ts`
- focused recovery-link hunk in `src/frontend/tests/e2e/employee.spec.ts`
- Evidence docs for the live employee entry.

Verified:

```text
npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/offline-demo-mode.test.ts
Test Files  3 passed (3)
Tests       52 passed (52)
```

Latest recheck:

```text
npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/http-refresh.test.ts
Test Files  5 passed (5)
Tests       80 passed (80)
```

```text
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"
1 passed
```

Real Chromium evidence:

```text
POST /api/v1/auth/login -> 200
GET  /api/v1/employee?page=1&pageSize=20 -> 200
aimes_offline_demo=false
```

### 3. Formal schedule writeback

Scope:

- `src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue`
- focused staged hunks in `src/frontend/src/components/schedule/ScheduleBoard.vue`
- focused staged hunks in `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts`
- focused staged hunks in `src/frontend/tests/unit/schedule-board.test.ts`
- focused staged hunks in `src/frontend/tests/e2e/scheduling.spec.ts`
- Evidence docs for formal writeback.

Verified:

```text
npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts
Test Files  2 passed (2)
Tests       82 passed (82)
```

```text
npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单 Agent 采纳后区分反馈与正式排产回写" --project=chromium
1 passed
```

Latest recheck:

```text
npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/schedule-agent-workbench-panel.test.ts
Test Files  2 passed (2)
Tests       42 passed (42)
```

```text
npm run test:e2e -- tests/e2e/scheduling.spec.ts --grep "急单 Agent 采纳后区分反馈与正式排产回写|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"
4 passed
```

## Current cached check

```text
git diff --cached --check
PASS
```

## Not staged / intentionally excluded

- `src/frontend/tests/e2e/employee.spec.ts` is `MM`: the staged hunk is only the employee offline-demo recovery-link E2E; broader personnel capability E2E expansion remains unstaged/unreviewed.
- `src/frontend/src/components/schedule/ScheduleBoard.vue` remains `MM`; unstaged hunks include broader ScheduleBoard hardening outside formal writeback.
- `src/frontend/tests/unit/schedule-board.test.ts` remains `MM`; unstaged hunks include many unrelated ScheduleBoard tests.
- `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts` remains `MM`; unstaged hunks include backend decision adoption/rejection tests outside formal writeback.
- `tmp/index-agent-e2e-plus-formal-docs-20260622.patch` remains untracked and intentionally unstaged because patch payload whitespace breaks cached whitespace checks.

## Readiness decision

The current index is ready for human review as a multi-slice package if the reviewer accepts the package boundary:

- Agent E2E verification slice;
- Employee live-backend recovery slice;
- Formal schedule writeback slice.

The full CC goal is not complete. Remaining dirty worktree changes require separate package audits and focused verification before staging.
