# Staged source review recheck - 2026-06-22

## Scope

Reviewed the current staged source/test subset inside the rebuilt 98-file staged package.

Staged source/test files reviewed:

- `src/frontend/middleware/auth.global.ts`
- `src/frontend/scripts/e2e.mjs`
- `src/frontend/src/api/http.ts`
- `src/frontend/src/components/employee/EmployeeBoard.vue`
- `src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/src/router/index.ts`
- `src/frontend/src/stores/auth.ts`
- `src/frontend/src/utils/offline-demo-mode.ts`
- `src/frontend/tests/e2e/employee.spec.ts`
- `src/frontend/tests/e2e/scheduling.spec.ts`
- `src/frontend/tests/unit/employee-board.test.ts`
- `src/frontend/tests/unit/http-refresh.test.ts`
- `src/frontend/tests/unit/nuxt-auth-middleware.test.ts`
- `src/frontend/tests/unit/router-auth.test.ts`
- `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts`
- `src/frontend/tests/unit/schedule-board.test.ts`

## Review Result

Two staged-only blockers were found and fixed in this recheck:

- `http-refresh.test.ts` did not stage the mock export rename from `isOfflineDemoMode` to `shouldSkipBackendForOfflineDemo`, while `http.ts` already consumed the new helper.
- Nuxt `auth.global.ts` still redirected a stale demo-token `/login?offlineDemo=0&redirect=/employee?offlineDemo=0` recovery entry to `/dashboard`, even though the Vue router path had been fixed.

The review focused on:

- stale offline-demo sessions skipping live backend employee reads;
- employee offline fallback exposing raw backend-skip technical errors;
- schedule guidance links leaving the `/scheduling` base path;
- rush-order Agent feedback being confused with formal schedule writeback;
- drag reschedule writeback success/failure visibility;
- schedule sync notes overwriting earlier business evidence;
- Assistant recovery handoff closure being hidden by secondary refresh failures;
- E2E mock/live-backend mode selection for Agent workbench tests.

## Verification

Focused staged-package unit coverage on current worktree:

```text
npm run test:unit -- tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts tests/unit/nuxt-auth-middleware.test.ts tests/unit/scheduling-api.test.ts tests/unit/schedule-board.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/employee-board.test.ts tests/unit/auth.store.test.ts tests/unit/offline-demo-mode.test.ts
8 files passed / 99 tests passed
```

Focused employee recovery E2E:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"
1 passed
```

Focused schedule E2E:

```text
npm run test:e2e -- tests/e2e/scheduling.spec.ts --grep "急单 Agent 采纳后区分反馈与正式排产回写|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"
4 passed
```

Previous formatting guard remains applicable to the frozen index:

```text
git diff --cached --check
PASS
```

## Boundary Notes

- Current staged index is 98 files: 81 docs and 17 source/test files.
- This recheck initially ran against the current worktree, then a temporary staged-only checkout exposed the missing `http-refresh.test.ts` staged mock fix.
- A second staged-only checkout exposed the Nuxt middleware live-login redirect gap; the source/test boundary was intentionally rebuilt with only the minimal auth/session recovery files needed for staged-only verification.
- Several files remain `MM`; unstaged hunks are not reviewed by this report.

## Non-Claims

- Does not prove full frontend unit health.
- Does not prove full frontend E2E health.
- Does not prove backend health.
- Does not complete the CC plan or strict v1.0.0 release gate.
